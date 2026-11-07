/**
 * INTEGRAÇÃO GOOGLE DRIVE API & PICKER (OAuth 2.0)
 * Permite autenticar com a conta Google do usuário, abrir a janela do Google Picker
 * para escolher a pasta de destino e fazer o upload do arquivo .json de backup diretamente na nuvem.
 */

const STORAGE_CHAVE_CONFIG_GDRIVE = 'ao-ponto-google-drive-config';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export function getGoogleDriveConfig() {
  try {
    const salvo = localStorage.getItem(STORAGE_CHAVE_CONFIG_GDRIVE);
    if (salvo) return JSON.parse(salvo);
  } catch (_) {}
  return {
    clientId: '',
    apiKey: '',
  };
}

export function salvarGoogleDriveConfig(cfg) {
  localStorage.setItem(STORAGE_CHAVE_CONFIG_GDRIVE, JSON.stringify(cfg));
}

let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let accessToken = null;

/**
 * Carrega dinamicamente os scripts oficiais do Google (GAPI e GIS)
 */
export async function carregarScriptsGoogle() {
  if (window.gapi && window.google?.accounts?.oauth2) {
    return true;
  }

  const promessas = [];

  if (!window.gapi) {
    promessas.push(new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://apis.google.com/js/api.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Falha ao carregar Google API'));
      document.head.appendChild(s);
    }));
  }

  if (!window.google?.accounts?.oauth2) {
    promessas.push(new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Falha ao carregar Google Identity Services'));
      document.head.appendChild(s);
    }));
  }

  await Promise.all(promessas);
  return true;
}

/**
 * Inicializa os clientes com as credenciais do usuário
 */
export async function inicializarClientesGoogle(clientId, apiKey) {
  await carregarScriptsGoogle();

  await new Promise((resolve) => {
    window.gapi.load('client:picker', resolve);
  });

  await window.gapi.client.init({
    apiKey: apiKey,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: '', // definido em tempo de execução
  });
  gisInited = true;

  return true;
}

/**
 * Solicita token de autorização ao usuário via popup do Google
 */
export function obterTokenAcesso() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      return reject(new Error('Cliente OAuth do Google não inicializado.'));
    }

    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        return reject(new Error('Erro na autenticação Google: ' + resp.error));
      }
      accessToken = resp.access_token;
      resolve(resp.access_token);
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/**
 * Abre a janela oficial do Google Picker para o usuário escolher uma pasta de destino
 */
export function abrirGooglePickerPasta(apiKey, token, callbackSelecionada) {
  if (!window.google?.picker) {
    throw new Error('Google Picker API não está disponível.');
  }

  const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
    .setMimeTypes('application/vnd.google-apps.folder')
    .setSelectFolderEnabled(true)
    .setIncludeFolders(true);

  const picker = new window.google.picker.PickerBuilder()
    .addView(docsView)
    .setOAuthToken(token)
    .setDeveloperKey(apiKey)
    .setTitle('Selecione a Pasta de Destino no seu Google Drive')
    .setCallback((data) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const doc = data.docs[0];
        const folderId = doc.id;
        const folderName = doc.name;
        callbackSelecionada({ folderId, folderName });
      }
    })
    .build();

  picker.setVisible(true);
}

/**
 * Envia o arquivo JSON para o Google Drive na pasta selecionada (ou na raiz)
 */
export async function uploadJsonParaGoogleDrive(token, nomeArquivo, conteudoJson, folderId = null) {
  const metadata = {
    name: nomeArquivo,
    mimeType: 'application/json',
  };

  if (folderId && folderId !== 'root') {
    metadata.parents = [folderId];
  }

  const boundary = '-------ao_ponto_backup_boundary_' + Math.random().toString(36).substring(2);
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    conteudoJson +
    closeDelim;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'multipart/related; boundary="' + boundary + '"',
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error('Falha no upload para o Google Drive: ' + errText);
  }

  const data = await response.json();
  return data;
}
