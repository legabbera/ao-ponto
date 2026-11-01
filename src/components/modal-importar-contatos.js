/**
 * MODAL DE IMPORTAÇÃO DE CONTATOS EM LOTE (Ao Ponto)
 * Suporta: Colar texto livre, Arquivos (CSV / VCF vCard / TXT) e Sincronização do WhatsApp.
 */
import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';
import { store } from '../state/store.js';

export function abrirModalImportacaoContatos(aoConcluir) {
  let abaAtiva = 'colar'; // 'colar', 'arquivo', 'whatsapp'
  let listaParseada = [];
  const clientesAtuais = store.getClientes();
  const telefonesExistentes = new Set(
    clientesAtuais.map((c) => (c.telefone || '').replace(/\D/g, '')).filter(Boolean)
  );

  function desenharModal(modalEl, fechar) {
    modalEl.style.maxWidth = '780px';
    modalEl.style.width = '95%';

    const renderConteudoAba = () => {
      if (abaAtiva === 'colar') {
        return `
          <div class="aba-conteudo-importacao">
            <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 8px;">
              Cole sua lista de contatos do WhatsApp, bloco de notas ou planilha. O sistema identifica nomes e telefones automaticamente em cada linha:
            </p>
            <div class="campo">
              <textarea id="txt-lote-contatos" class="input" rows="6" placeholder="Exemplos aceitos:
Marcos Silva - (11) 98888-7777 - Bela Vista
(11) 97777-6666 Dona Neide
Cláudio Duarte, 11999991111
11966664444"></textarea>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <small style="color: var(--texto-suave);">Dica: Você pode copiar direto de uma planilha do Excel ou de um grupo/conversa do WhatsApp.</small>
              <button class="btn btn-pequeno btn-secundario" id="btn-processar-texto">Analisar Texto</button>
            </div>
          </div>
        `;
      }

      if (abaAtiva === 'arquivo') {
        return `
          <div class="aba-conteudo-importacao">
            <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 12px;">
              Selecione uma planilha (<strong>.CSV</strong>), lista de contatos do celular (<strong>.VCF / vCard</strong>) ou arquivo de texto (<strong>.TXT</strong>):
            </p>
            <div id="dropzone-arquivo-contatos" style="border: 2px dashed var(--borda, #cbd5e1); border-radius: 12px; padding: 28px 16px; text-align: center; cursor: pointer; background: var(--creme, #FFFBF5); transition: all .2s;">
              <div style="font-size: 38px; margin-bottom: 8px;">📁</div>
              <strong style="display: block; font-size: 14px; color: var(--carvao);">Clique para selecionar ou arraste o arquivo aqui</strong>
              <small style="color: var(--texto-suave); display: block; margin-top: 4px;">Suporta .csv, .vcf (exportado do celular/Google Contatos) e .txt</small>
              <input type="file" id="input-arquivo-contatos" accept=".csv, .vcf, .txt" style="display: none;" />
            </div>
          </div>
        `;
      }

      if (abaAtiva === 'whatsapp') {
        const waCfg = store.getWhatsapp().config || {};
        const contatosWhatsAppMock = [
          { nome: 'Juliana Pires', telefone: '(11) 98111-2233', bairro: 'Vila Mariana', msg: 'Gostaria de reservar 1 frango dourado para domingo...' },
          { nome: 'Carlos Eduardo Barreto', telefone: '(11) 97222-3344', bairro: 'Bela Vista', msg: 'Qual o valor da costelinha na brasa?' },
          { nome: 'Padaria Estrela (Seu Bento)', telefone: '(11) 99333-4455', bairro: 'Pinheiros', msg: 'Reserva confirmada para 12h' },
          { nome: 'Dona Cida Doces', telefone: '(11) 96444-5566', bairro: 'Saúde', msg: 'Tem maionese caseira disponível hoje?' },
          { nome: 'Marcos Vinicius', telefone: '(11) 95555-6677', bairro: 'Paraíso', msg: 'Obrigado pelo atendimento, estava ótimo!' },
        ];

        return `
          <div class="aba-conteudo-importacao">
            <div style="background: ${waCfg.instanciaConectada ? '#ECFDF5' : '#FEF2F2'}; border: 1.5px solid ${waCfg.instanciaConectada ? '#A7F3D0' : '#FECACA'}; border-radius: 10px; padding: 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <strong style="color: ${waCfg.instanciaConectada ? '#065F46' : '#991B1B'}; font-size: 13px;">
                  ${waCfg.instanciaConectada ? '🟢 Instância do WhatsApp Conectada' : '🔴 WhatsApp Não Conectado na API'}
                </strong>
                <small style="display: block; color: var(--texto-suave); margin-top: 2px;">
                  ${waCfg.instanciaConectada ? `Aparelho pareado: ${waCfg.numeroConectado || '(11) 98888-7777'} (${waCfg.nomeInstancia || 'Central'})` : 'Conecte via QR Code na aba WhatsApp para puxar contatos em tempo real.'}
                </small>
              </div>
              <button class="btn btn-pequeno btn-whatsapp" id="btn-puxar-conversas-wa">
                ${icone('whatsapp')} Puxar Conversas Recentes
              </button>
            </div>
            <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 8px;">
              Conversas ativas encontradas no aparelho do balcão prontas para inclusão na base de clientes:
            </p>
          </div>
        `;
      }
      return '';
    };

    const renderTabelaPrevia = () => {
      if (listaParseada.length === 0) {
        return `
          <div style="text-align: center; padding: 24px 12px; border: 1px dashed var(--borda, #ddd); border-radius: 10px; background: #FAF9F6; margin-top: 14px;">
            <span style="font-size: 28px; display: block; margin-bottom: 4px;">👥</span>
            <small style="color: var(--texto-suave);">Nenhum contato analisado ainda. Cole um texto ou selecione um arquivo acima.</small>
          </div>
        `;
      }

      const novos = listaParseada.filter((x) => !x.jaExiste && x.selecionado).length;
      const jaCadastrados = listaParseada.filter((x) => x.jaExiste).length;

      return `
        <div class="previa-importacao-container" style="margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 13px;">
              <strong>${listaParseada.length} contatos encontrados:</strong>
              <span class="badge badge-sucesso" style="margin-left: 6px;">${novos} novos prontos</span>
              ${jaCadastrados > 0 ? `<span class="badge" style="background: #E2E8F0; color: #475569; margin-left: 4px;">${jaCadastrados} já existentes (ignorados)</span>` : ''}
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn btn-pequeno btn-contorno" id="btn-marcar-todos">Marcar Todos</button>
              <button type="button" class="btn btn-pequeno btn-contorno" id="btn-desmarcar-todos">Desmarcar</button>
            </div>
          </div>

          <div style="max-height: 220px; overflow-y: auto; border: 1px solid var(--borda, #e2e8f0); border-radius: 8px;">
            <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
              <thead>
                <tr style="background: var(--creme, #f8f6f0); text-align: left;">
                  <th style="width: 36px; padding: 8px;"></th>
                  <th style="padding: 8px;">Nome do Cliente</th>
                  <th style="padding: 8px;">WhatsApp / Telefone</th>
                  <th style="padding: 8px;">Bairro</th>
                  <th style="padding: 8px;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${listaParseada.map((item, idx) => `
                  <tr style="${item.jaExiste ? 'opacity: 0.55; background: #F8FAFC;' : ''}">
                    <td style="padding: 8px; text-align: center;">
                      <input type="checkbox" class="chk-item-importar" data-idx="${idx}" ${item.selecionado && !item.jaExiste ? 'checked' : ''} ${item.jaExiste ? 'disabled' : ''} />
                    </td>
                    <td style="padding: 8px;">
                      <strong>${item.nome}</strong>
                    </td>
                    <td style="padding: 8px;">
                      <code>${item.telefone}</code>
                    </td>
                    <td style="padding: 8px; color: var(--texto-suave);">
                      ${item.bairro || 'Balcão'}
                    </td>
                    <td style="padding: 8px;">
                      ${item.jaExiste 
                        ? '<span class="badge" style="font-size: 10px; background: #E2E8F0; color: #64748B;">Já cadastrado</span>' 
                        : '<span class="badge badge-sucesso" style="font-size: 10px;">Novo</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    modalEl.innerHTML = `
      <div class="modal-cabecalho" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--borda, #eee); padding-bottom: 10px;">
        <h2 style="margin: 0; font-size: 1.15rem; color: var(--carvao, #222); display: flex; align-items: center; gap: 6px;">
          📥 Importar Clientes & Contatos em Lote
        </h2>
        <button type="button" class="btn-fechar-modal" data-fechar style="background: none; border: 0; font-size: 22px; cursor: pointer; color: var(--texto-suave, #888);">&times;</button>
      </div>

      <!-- Abas de Importação -->
      <div class="abas-whatsapp" style="margin-bottom: 14px;">
        <button type="button" class="aba-wa ${abaAtiva === 'colar' ? 'ativa' : ''}" data-aba="colar">
          📋 Colar Lista Livre
        </button>
        <button type="button" class="aba-wa ${abaAtiva === 'arquivo' ? 'ativa' : ''}" data-aba="arquivo">
          📁 Subir Arquivo (CSV / VCF)
        </button>
        <button type="button" class="aba-wa ${abaAtiva === 'whatsapp' ? 'ativa' : ''}" data-aba="whatsapp">
          ⚡ Sincronizar WhatsApp
        </button>
      </div>

      <div id="corpo-aba-importacao">
        ${renderConteudoAba()}
      </div>

      <div id="area-previa-tabela">
        ${renderTabelaPrevia()}
      </div>

      <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--borda, #eee); padding-top: 14px;">
        <button type="button" class="btn btn-contorno" id="btn-cancelar-importacao">Cancelar</button>
        <button type="button" class="btn btn-primario" id="btn-executar-importacao" ${listaParseada.filter(x => x.selecionado && !x.jaExiste).length === 0 ? 'disabled' : ''}>
          ${icone('mais')} Confirmar e Salvar no Sistema
        </button>
      </div>
    `;

    // Eventos
    modalEl.querySelector('#btn-cancelar-importacao')?.addEventListener('click', fechar);
    modalEl.querySelector('.btn-fechar-modal')?.addEventListener('click', fechar);

    // Troca de abas
    modalEl.querySelectorAll('.aba-wa').forEach((btn) => {
      btn.addEventListener('click', () => {
        abaAtiva = btn.dataset.aba;
        desenharModal(modalEl, fechar);
      });
    });

    // Aba Colar: Processar texto
    modalEl.querySelector('#btn-processar-texto')?.addEventListener('click', () => {
      const txt = modalEl.querySelector('#txt-lote-contatos')?.value || '';
      listaParseada = parseTextoLote(txt, telefonesExistentes);
      desenharModal(modalEl, fechar);
      if (listaParseada.length > 0) {
        toast(`${listaParseada.length} contatos identificados na lista!`, 'sucesso');
      } else {
        toast('Nenhum telefone válido encontrado no texto.', 'aviso');
      }
    });

    // Aba Arquivo: Drag & Drop e Seleção
    const dropzone = modalEl.querySelector('#dropzone-arquivo-contatos');
    const inputArquivo = modalEl.querySelector('#input-arquivo-contatos');

    dropzone?.addEventListener('click', () => inputArquivo?.click());
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--brasa, #ea580c)';
    });
    dropzone?.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--borda, #cbd5e1)';
    });
    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--borda, #cbd5e1)';
      if (e.dataTransfer?.files?.[0]) {
        processarArquivo(e.dataTransfer.files[0]);
      }
    });
    inputArquivo?.addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        processarArquivo(e.target.files[0]);
      }
    });

    function processarArquivo(file) {
      const reader = new FileReader();
      const ext = file.name.split('.').pop().toLowerCase();

      reader.onload = (e) => {
        const conteudo = e.target.result;
        if (ext === 'vcf') {
          listaParseada = parseVCard(conteudo, telefonesExistentes);
        } else if (ext === 'csv') {
          listaParseada = parseCSV(conteudo, telefonesExistentes);
        } else {
          listaParseada = parseTextoLote(conteudo, telefonesExistentes);
        }
        desenharModal(modalEl, fechar);
        toast(`Arquivo "${file.name}" processado: ${listaParseada.length} contatos encontrados.`, 'sucesso');
      };
      reader.readAsText(file);
    }

    // Aba WhatsApp: Puxar conversas
    modalEl.querySelector('#btn-puxar-conversas-wa')?.addEventListener('click', () => {
      const contatosMock = [
        { nome: 'Juliana Pires', telefone: '11981112233', bairro: 'Vila Mariana' },
        { nome: 'Carlos Eduardo Barreto', telefone: '11972223344', bairro: 'Bela Vista' },
        { nome: 'Padaria Estrela (Seu Bento)', telefone: '11993334455', bairro: 'Pinheiros' },
        { nome: 'Dona Cida Doces', telefone: '11964445566', bairro: 'Saúde' },
        { nome: 'Marcos Vinicius', telefone: '11955556677', bairro: 'Paraíso' },
        { nome: 'Família Silveira', telefone: '11944443322', bairro: 'Moema' },
        { nome: 'Rogério Assados', telefone: '11933332211', bairro: 'Ipiranga' },
      ];

      listaParseada = contatosMock.map((c) => {
        const telLimpo = c.telefone.replace(/\D/g, '');
        const jaExiste = telefonesExistentes.has(telLimpo);
        return {
          nome: c.nome,
          telefone: formatarMascaraTelefone(telLimpo),
          bairro: c.bairro,
          jaExiste,
          selecionado: !jaExiste,
        };
      });

      desenharModal(modalEl, fechar);
      toast(`${listaParseada.length} conversas importadas da instância do WhatsApp!`, 'sucesso');
    });

    // Checkboxes da Tabela
    modalEl.querySelectorAll('.chk-item-importar').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(chk.dataset.idx, 10);
        if (listaParseada[idx]) {
          listaParseada[idx].selecionado = e.target.checked;
        }
        const btnSalvar = modalEl.querySelector('#btn-executar-importacao');
        const count = listaParseada.filter((x) => x.selecionado && !x.jaExiste).length;
        if (btnSalvar) btnSalvar.disabled = count === 0;
      });
    });

    modalEl.querySelector('#btn-marcar-todos')?.addEventListener('click', () => {
      listaParseada.forEach((x) => { if (!x.jaExiste) x.selecionado = true; });
      desenharModal(modalEl, fechar);
    });

    modalEl.querySelector('#btn-desmarcar-todos')?.addEventListener('click', () => {
      listaParseada.forEach((x) => { x.selecionado = false; });
      desenharModal(modalEl, fechar);
    });

    // Confirmar e Executar Importação
    modalEl.querySelector('#btn-executar-importacao')?.addEventListener('click', () => {
      const selecionados = listaParseada.filter((x) => x.selecionado && !x.jaExiste);
      if (selecionados.length === 0) {
        toast('Nenhum contato novo selecionado para importar.', 'aviso');
        return;
      }

      const res = store.importarClientesEmLote(selecionados);
      toast(`Sucesso! ${res.adicionados} clientes adicionados ao sistema.`, 'sucesso');
      fechar();
      aoConcluir?.(res);
    });
  }

  abrirModal({
    titulo: 'Importar Clientes em Lote',
    html: `<div id="conteudo-modal-importacao">Carregando...</div>`,
    aoAbrir: (el, fechar) => {
      desenharModal(el, fechar);
    },
  });
}

// ── Funções de Extração Inteligente de Contatos (Parsers) ──

/**
 * Faz o parse de texto livre onde cada linha pode conter nome e telefone em qualquer ordem.
 */
function parseTextoLote(textoBruto, telefonesExistentes) {
  if (!textoBruto) return [];
  const linhas = textoBruto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const resultados = [];
  const telefonesProcessados = new Set();

  linhas.forEach((linha, idx) => {
    // Procura sequência de dígitos do telefone (pode ter DDD, parênteses, hífen, espaços)
    // Ex: (11) 98888-7777, 11988887777, 5511988887777, 11 98888 7777
    const regexTel = /(?:\+?55\s*)?(?:\(?([1-9]{2})\)?\s*)?(?:(9\d{4})[-\s]?(\d{4})|(\d{4})[-\s]?(\d{4}))/g;
    const match = regexTel.exec(linha);

    let telefoneEncontrado = '';
    let nomeEncontrado = '';
    let bairroEncontrado = '';

    if (match) {
      telefoneEncontrado = match[0].replace(/\D/g, '');
      // Se começou com 55 e tem 12 ou 13 dígitos, tira o 55 para padronizar com DDD local
      if (telefoneEncontrado.startsWith('55') && telefoneEncontrado.length >= 12) {
        telefoneEncontrado = telefoneEncontrado.slice(2);
      }

      // O restante da linha vira nome/bairro
      let resto = linha.replace(match[0], '').replace(/[-–,;:|()]/g, ' ').replace(/\s+/g, ' ').trim();

      // Se tiver vírgula ou hífen no resto, tenta separar nome e bairro
      const partes = resto.split(/\s*[-–,]\s*/);
      if (partes.length >= 2) {
        nomeEncontrado = partes[0].trim();
        bairroEncontrado = partes.slice(1).join(' ').trim();
      } else {
        nomeEncontrado = resto;
      }
    } else {
      // Tenta achar qualquer sequência de 8 a 11 dígitos
      const digitos = linha.replace(/\D/g, '');
      if (digitos.length >= 8 && digitos.length <= 13) {
        telefoneEncontrado = digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos;
        nomeEncontrado = linha.replace(/\d+/g, '').replace(/[-–,;:|()]/g, ' ').trim();
      }
    }

    if (telefoneEncontrado && telefoneEncontrado.length >= 8) {
      if (telefonesProcessados.has(telefoneEncontrado)) return;
      telefonesProcessados.add(telefoneEncontrado);

      if (!nomeEncontrado) {
        nomeEncontrado = `Cliente WhatsApp ${telefoneEncontrado.slice(-4)}`;
      }

      const telFormatado = formatarMascaraTelefone(telefoneEncontrado);
      const jaExiste = telefonesExistentes.has(telefoneEncontrado);

      resultados.push({
        nome: nomeEncontrado,
        telefone: telFormatado,
        bairro: bairroEncontrado || 'Balcão',
        jaExiste,
        selecionado: !jaExiste,
      });
    }
  });

  return resultados;
}

/**
 * Faz o parse de arquivo vCard (.vcf) exportado de smartphones ou Google Contatos.
 */
function parseVCard(vcfTexto, telefonesExistentes) {
  const cards = vcfTexto.split(/END:VCARD/i);
  const resultados = [];
  const telefonesProcessados = new Set();

  cards.forEach((card) => {
    let nome = '';
    let telefone = '';

    const fnMatch = card.match(/FN:(.+)/i);
    if (fnMatch) nome = fnMatch[1].trim();

    const telMatch = card.match(/TEL.*:(.+)/i);
    if (telMatch) {
      telefone = telMatch[1].replace(/\D/g, '');
      if (telefone.startsWith('55') && telefone.length >= 12) {
        telefone = telefone.slice(2);
      }
    }

    if (telefone && telefone.length >= 8) {
      if (telefonesProcessados.has(telefone)) return;
      telefonesProcessados.add(telefone);

      const jaExiste = telefonesExistentes.has(telefone);
      resultados.push({
        nome: nome || `Cliente ${telefone.slice(-4)}`,
        telefone: formatarMascaraTelefone(telefone),
        bairro: 'Balcão',
        jaExiste,
        selecionado: !jaExiste,
      });
    }
  });

  return resultados;
}

/**
 * Faz o parse de arquivo CSV (separado por vírgula ou ponto-e-vírgula).
 */
function parseCSV(csvTexto, telefonesExistentes) {
  const linhas = csvTexto.split(/\r?\n/).filter(Boolean);
  if (linhas.length === 0) return [];

  const separador = linhas[0].includes(';') ? ';' : ',';
  const cabecalho = linhas[0].split(separador).map((c) => c.toLowerCase().trim());

  let colNome = cabecalho.findIndex((c) => c.includes('nome') || c.includes('name') || c.includes('cliente'));
  let colTel = cabecalho.findIndex((c) => c.includes('tel') || c.includes('cel') || c.includes('whats') || c.includes('phone'));
  let colBairro = cabecalho.findIndex((c) => c.includes('bairro') || c.includes('regiao') || c.includes('cidade'));

  if (colNome === -1) colNome = 0;
  if (colTel === -1) colTel = 1;

  const resultados = [];
  const telefonesProcessados = new Set();

  linhas.slice(1).forEach((linha) => {
    const colunas = linha.split(separador).map((c) => c.replace(/["']/g, '').trim());
    const nome = colunas[colNome] || '';
    let tel = (colunas[colTel] || '').replace(/\D/g, '');

    if (tel.startsWith('55') && tel.length >= 12) tel = tel.slice(2);

    if (tel && tel.length >= 8) {
      if (telefonesProcessados.has(tel)) return;
      telefonesProcessados.add(tel);

      const jaExiste = telefonesExistentes.has(tel);
      resultados.push({
        nome: nome || `Cliente ${tel.slice(-4)}`,
        telefone: formatarMascaraTelefone(tel),
        bairro: (colBairro !== -1 ? colunas[colBairro] : '') || 'Balcão',
        jaExiste,
        selecionado: !jaExiste,
      });
    }
  });

  return resultados;
}

function formatarMascaraTelefone(digitos) {
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return digitos;
}

