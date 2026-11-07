import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';
import {
  getGoogleDriveConfig,
  salvarGoogleDriveConfig,
  inicializarClientesGoogle,
  obterTokenAcesso,
  abrirGooglePickerPasta,
  uploadJsonParaGoogleDrive,
} from '../utils/google-drive.js';
import { gerarSnapshotCompleto } from '../utils/backup.js';

/**
 * Abre o modal ou inicia o fluxo oficial de envio ao Google Drive com Picker
 */
export async function iniciarEnvioGoogleDrive() {
  const config = getGoogleDriveConfig();

  // Se ainda não configurou as credenciais do Google Cloud
  if (!config.clientId || !config.apiKey) {
    abrirModalConfigGoogleDrive(config);
    return;
  }

  executarFluxoGoogleDrive(config);
}

/**
 * Modal para o usuário inserir ou atualizar suas credenciais do Google Cloud
 */
export function abrirModalConfigGoogleDrive(configAtual) {
  abrirModal(`
    <div style="max-width:520px; text-align:left;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
        <span style="font-size:28px;">☁️</span>
        <div>
          <h2 style="font-size:18px; margin:0;">Conectar Google Drive Oficial</h2>
          <small style="color:var(--texto-suave);">Salve seus backups diretamente na sua conta Google</small>
        </div>
      </div>

      <p style="font-size:13px; color:var(--texto-suave); line-height:1.5; margin-bottom:16px;">
        Para abrir a janela oficial do Google e escolher a pasta de destino, informe o <strong>Client ID</strong> e a <strong>API Key</strong> criados no Google Cloud Console:
      </p>

      <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
        <div>
          <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px; color:var(--texto);">
            Google Client ID (OAuth 2.0)
          </label>
          <input 
            type="text" 
            id="gdrive-client-id" 
            class="input-texto" 
            placeholder="Ex: 123456789-abcdef.apps.googleusercontent.com"
            value="${configAtual.clientId || ''}"
            style="width:100%; box-sizing:border-box; font-size:13px;"
          />
        </div>

        <div>
          <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px; color:var(--texto);">
            Google API Key (Picker)
          </label>
          <input 
            type="text" 
            id="gdrive-api-key" 
            class="input-texto" 
            placeholder="Ex: AIzaSyD..."
            value="${configAtual.apiKey || ''}"
            style="width:100%; box-sizing:border-box; font-size:13px;"
          />
        </div>
      </div>

      <div style="background:var(--creme-medio, #26221F); border-radius:8px; padding:12px; font-size:12px; color:var(--texto-suave); line-height:1.4; margin-bottom:16px;">
        💡 <strong>Dica de Segurança:</strong> O Ao Ponto utiliza apenas o escopo restrito <code>drive.file</code>. O aplicativo só acessa e visualiza os arquivos criados por ele mesmo, garantindo total privacidade aos seus documentos pessoais.
      </div>

      <div class="modal-acoes" style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-contorno" data-fechar>Cancelar</button>
        <button class="btn btn-primario" id="btn-salvar-gdrive">
          Salvar e Conectar
        </button>
      </div>
    </div>
  `, (m, fechar) => {
    m.querySelector('#btn-salvar-gdrive').addEventListener('click', () => {
      const clientId = m.querySelector('#gdrive-client-id').value.trim();
      const apiKey = m.querySelector('#gdrive-api-key').value.trim();

      if (!clientId || !apiKey) {
        toast('Preencha tanto o Client ID quanto a API Key.', 'erro');
        return;
      }

      salvarGoogleDriveConfig({ clientId, apiKey });
      toast('Credenciais do Google Drive salvas! 🎉', 'sucesso');
      fechar();
      executarFluxoGoogleDrive({ clientId, apiKey });
    });
  });
}

/**
 * Executa o fluxo: autentica -> abre picker -> envia arquivo
 */
async function executarFluxoGoogleDrive(config) {
  try {
    toast('Carregando serviços do Google...', 'info');
    await inicializarClientesGoogle(config.clientId, config.apiKey);

    toast('Solicitando autorização do Google Drive...', 'info');
    const token = await obterTokenAcesso();

    toast('Escolha a pasta de destino no Google Drive...', 'info');

    abrirGooglePickerPasta(config.apiKey, token, async ({ folderId, folderName }) => {
      try {
        toast(`Enviando backup para a pasta "${folderName}"...`, 'info');

        const snapshot = gerarSnapshotCompleto();
        const jsonStr = JSON.stringify(snapshot, null, 2);
        const dataStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const nomeArquivo = `ao-ponto-backup-${snapshot.metadata.ponto}-${dataStr}.json`;

        const resultado = await uploadJsonParaGoogleDrive(token, nomeArquivo, jsonStr, folderId);

        abrirModal(`
          <div style="text-align:center; padding:16px 0;">
            <div style="font-size:48px; margin-bottom:12px;">✅</div>
            <h2 style="font-size:20px; margin-bottom:8px;">Backup Salvo no Google Drive!</h2>
            <p style="color:var(--texto-suave); font-size:14px; margin-bottom:16px;">
              O arquivo <strong>${nomeArquivo}</strong> foi gravado com sucesso na pasta <strong>${folderName}</strong> da sua conta Google.
            </p>
            <div style="display:flex; justify-content:center; gap:10px;">
              <a href="${resultado.webViewLink || 'https://drive.google.com'}" target="_blank" class="btn btn-primario" style="text-decoration:none;">
                Abrir no Google Drive ↗
              </a>
              <button class="btn btn-contorno" data-fechar>Fechar</button>
            </div>
          </div>
        `);
      } catch (errUpload) {
        console.error(errUpload);
        toast('Erro no upload para o Google Drive: ' + errUpload.message, 'erro');
      }
    });

  } catch (err) {
    console.error(err);
    toast('Erro na conexão com Google Drive: ' + err.message, 'erro');
  }
}

