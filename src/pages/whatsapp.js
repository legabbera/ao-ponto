/**
 * TELA CENTRAL WHATSAPP & AUTOMAÇÕES (Ao Ponto)
 * Disparos de fim de semana, gatilhos de pedidos e simulador de WhatsApp.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS } from '../data/mock.js';
import { fmtMoeda } from '../utils/format.js';
import { abrirModalImportacaoContatos } from '../components/modal-importar-contatos.js';

let abaAtiva = 'campanhas'; // 'campanhas', 'gatilhos', 'simulador', 'historico'
let templateSimuladorId = 'reserva_confirmada';
let telefoneTesteSimulador = '';

export function renderWhatsapp(raiz, irPara) {
  const st = store.get();
  const perfil = store.perfil();
  const nomePonto = st.ponto === 'todos' 
    ? (perfil.pontos.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos[0]).nome) 
    : PONTOS.find((p) => p.id === st.ponto)?.nome;

  function desenhar() {
    const waData = store.getWhatsapp();
    const config = waData.config || {};
    const templates = waData.templates || [];
    const historico = waData.historico || [];
    const clientes = store.getClientes();

    const gatilhos = config.gatilhos || {};
    const gatilhosAtivosCount = Object.values(gatilhos).filter(Boolean).length;
    const templateAtual = templates.find((t) => t.id === templateSimuladorId) || templates[0];

    // Clientes segmentados
    const vips = clientes.filter((c) => c.tag === 'vip');
    const frequentes = clientes.filter((c) => c.tag === 'frequente');
    const prontosResgate = clientes.filter((c) => (c.pontosFidelidade || 0) >= 8);

    raiz.innerHTML = `
    <div class="whatsapp-container">
      <!-- Topo -->
      <div class="whatsapp-topo">
        <div class="whatsapp-topo-info">
          <h1>Central WhatsApp &bull; Automações & Disparos 💬🍗</h1>
          <p>
            <span class="badge badge-demo">${icone('local', 'mini')} ${nomePonto}</span>
            &bull; Notificações automáticas de encomendas, reservas de domingo e fidelidade
          </p>
        </div>
        <div class="whatsapp-topo-acoes">
          <button class="btn btn-primario" id="btn-novo-disparo">
            ${icone('mais')} Novo Disparo
          </button>
          <button class="btn btn-whatsapp" id="btn-importar-contatos-wa-topo">
            ${icone('whatsapp')} Importar Contatos
          </button>
          <button class="btn btn-contorno" id="btn-conectar-wa">
            ${icone('celular')} Conexão WhatsApp
          </button>
        </div>
      </div>

      <!-- Card de Status da Conexão WhatsApp -->
      <div class="whatsapp-conexao-card ${config.instanciaConectada ? 'conectado' : 'desconectado'}">
        <div class="conexao-info-bloco">
          <div class="conexao-icone-pulso">
            ${config.instanciaConectada ? '🟢' : '🔴'}
          </div>
          <div class="conexao-textos">
            <div class="conexao-linha-principal">
              <strong>${config.instanciaConectada ? config.nomeInstancia || 'Ao Ponto Central' : 'WhatsApp Desconectado'}</strong>
              <span class="badge ${config.instanciaConectada ? 'badge-sucesso' : 'badge-perigo'}">
                ${config.instanciaConectada ? 'Online e Pronto' : 'Offline'}
              </span>
              <span class="badge badge-demo">${config.modo === 'instancia' ? '⚡ API Automática' : '🔗 Modo Link wa.me (Grátis)'}</span>
            </div>
            <div class="conexao-meta">
              <span>Número: <b>${config.numeroConectado}</b></span>
              &bull; <span>Bateria do aparelho: <b>${config.bateria}% 🔋</b></span>
              &bull; <span>Gatilhos ativos: <b>${gatilhosAtivosCount} de 5</b></span>
            </div>
          </div>
        </div>
        <div class="conexao-acoes">
          <button class="btn btn-pequeno btn-contorno" id="btn-alternar-modo">
            Alternar para ${config.modo === 'link' ? 'API Automática' : 'Modo Link Direto'}
          </button>
          <button class="btn btn-pequeno btn-secundario" id="btn-gerenciar-conexao">
            Gerenciar Conexão
          </button>
        </div>
      </div>

      <!-- KPIs Rápidos -->
      <div class="whatsapp-kpis">
        <div class="kpi-card">
          <div class="kpi-rotulo">Mensagens Enviadas Hoje</div>
          <div class="kpi-valor" style="color: #25D366;">${historico.length + 15}</div>
          <div class="kpi-sub">Avisos e disparos efetuados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Gatilhos Automáticos</div>
          <div class="kpi-valor">${gatilhosAtivosCount}/5</div>
          <div class="kpi-sub">Etapas de pedidos automatizadas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Base para Transmissão</div>
          <div class="kpi-valor">${clientes.length}</div>
          <div class="kpi-sub">Fregueses com WhatsApp ativo</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Taxa de Abertura Estimada</div>
          <div class="kpi-valor" style="color: var(--brasa);">98%</div>
          <div class="kpi-sub">WhatsApp direto no celular</div>
        </div>
      </div>

      <!-- Abas da Central WhatsApp -->
      <div class="cartao whatsapp-painel-principal">
        <div class="abas-whatsapp">
          <button class="aba-wa ${abaAtiva === 'campanhas' ? 'ativa' : ''}" data-aba="campanhas">
            📢 Campanhas & Disparos
          </button>
          <button class="aba-wa ${abaAtiva === 'gatilhos' ? 'ativa' : ''}" data-aba="gatilhos">
            ⚙️ Gatilhos Automáticos de Pedidos
          </button>
          <button class="aba-wa ${abaAtiva === 'simulador' ? 'ativa' : ''}" data-aba="simulador">
            📱 Simulador de Celular (Preview)
          </button>
          <button class="aba-wa ${abaAtiva === 'historico' ? 'ativa' : ''}" data-aba="historico">
            📋 Histórico de Envios
          </button>
        </div>

        <div class="conteudo-aba-wa">
          ${renderConteudoAba(abaAtiva, { waData, config, templates, historico, clientes, vips, frequentes, prontosResgate, templateAtual })}
        </div>
      </div>
    </div>
    `;

    vincularEventos();
  }

  function renderConteudoAba(aba, ctx) {
    const config = ctx.config || {};
    const templates = ctx.templates || [];
    const templateAtual = ctx.templateAtual || templates[0] || {};

    if (aba === 'campanhas') {
      return `
        <div class="secao-campanhas">
          <div class="campanhas-cabecalho">
            <div>
              <h3>Disparos Estratégicos de Fim de Semana 🍗📅</h3>
              <p>Envie mensagens em lote para abrir a agenda de domingo ou avisar sobre fornadas quentes.</p>
            </div>
            <button class="btn btn-primario btn-pequeno" id="btn-nova-campanha-custom">
              ${icone('mais')} Criar Mensagem Personalizada
            </button>
          </div>

          <div class="grade-campanhas">
            <!-- Campanha 1: Cardápio de Domingo -->
            <div class="campanha-card destaque-domingo">
              <div class="campanha-topo">
                <span class="campanha-icone">🍗</span>
                <div class="campanha-titulos">
                  <strong>Abertura de Reservas do Almoço de Domingo</strong>
                  <small>Disparo sugerido: Sexta às 18h ou Sábado às 10h</small>
                </div>
                <span class="badge badge-demo">Alta Conversão</span>
              </div>
              <div class="campanha-texto-preview">
                "Bom dia, {cliente}! 🍗 Já estamos aceitando as reservas para o almoço deste domingo no Ao Ponto! Garanta o seu frango assado douradinho antes que esgote..."
              </div>
              <div class="campanha-rodape">
                <div class="publico-seletor">
                  <small>Público alvo:</small>
                  <strong>${ctx.clientes.length} Clientes (Base Total)</strong>
                </div>
                <div class="campanha-botoes">
                  <button class="btn btn-pequeno btn-contorno btn-preview-campanha" data-template="campanha_domingo">
                    👁️ Ver Preview
                  </button>
                  <button class="btn btn-pequeno btn-whatsapp btn-disparar-campanha" data-template="campanha_domingo" data-nome="Cardápio de Domingo">
                    ${icone('whatsapp')} Disparar Agora
                  </button>
                </div>
              </div>
            </div>

            <!-- Campanha 2: Últimas Fornadas de Domingo -->
            <div class="campanha-card">
              <div class="campanha-topo">
                <span class="campanha-icone">🔥</span>
                <div class="campanha-titulos">
                  <strong>Últimas Vagas na Máquina / Braseiro</strong>
                  <small>Disparo sugerido: Domingo às 09h30</small>
                </div>
                <span class="badge badge-demo">Urgência</span>
              </div>
              <div class="campanha-texto-preview">
                "Oi {cliente}! Nossos frangos do braseiro já estão na última rodada na máquina giratória! Ainda dá tempo de garantir o almoço da família..."
              </div>
              <div class="campanha-rodape">
                <div class="publico-seletor">
                  <small>Público alvo:</small>
                  <strong>${ctx.frequentes.length + ctx.vips.length} Clientes Frequentes</strong>
                </div>
                <div class="campanha-botoes">
                  <button class="btn btn-pequeno btn-contorno btn-preview-campanha" data-template="campanha_domingo">
                    👁️ Ver Preview
                  </button>
                  <button class="btn btn-pequeno btn-whatsapp btn-disparar-campanha" data-template="campanha_domingo" data-nome="Últimas Fornadas">
                    ${icone('whatsapp')} Disparar Agora
                  </button>
                </div>
              </div>
            </div>

            <!-- Campanha 3: Clube do Frango (Fidelidade) -->
            <div class="campanha-card">
              <div class="campanha-topo">
                <span class="campanha-icone">🎁</span>
                <div class="campanha-titulos">
                  <strong>Resgate de Cortesia & Selos Pendentes</strong>
                  <small>Disparo para clientes com 8 a 10 selos</small>
                </div>
                <span class="badge badge-sucesso">Fidelização</span>
              </div>
              <div class="campanha-texto-preview">
                "Olá {cliente}! Você já tem {selos}/10 selos no Clube do Frango! Venha retirar o seu frango assado de cortesia neste fim de semana..."
              </div>
              <div class="campanha-rodape">
                <div class="publico-seletor">
                  <small>Público alvo:</small>
                  <strong>${ctx.prontosResgate.length} Clientes com Selos</strong>
                </div>
                <div class="campanha-botoes">
                  <button class="btn btn-pequeno btn-contorno btn-preview-campanha" data-template="lembrete_fidelidade">
                    👁️ Ver Preview
                  </button>
                  <button class="btn btn-pequeno btn-whatsapp btn-disparar-campanha" data-template="lembrete_fidelidade" data-nome="Resgate Clube do Frango">
                    ${icone('whatsapp')} Disparar Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (aba === 'gatilhos') {
      const g = ctx.config.gatilhos || {};
      return `
        <div class="secao-gatilhos">
          <div class="campanhas-cabecalho">
            <div>
              <h3>Gatilhos Automáticos de Notificação ⚙️🤖</h3>
              <p>O sistema envia automaticamente a mensagem no WhatsApp de acordo com a mudança de status do pedido.</p>
            </div>
          </div>

          <div class="lista-gatilhos">
            <!-- Gatilho 1: Reserva Confirmada -->
            <div class="gatilho-card ${g.reservaConfirmada ? 'ativo' : 'inativo'}">
              <div class="gatilho-topo">
                <div class="gatilho-info">
                  <span class="gatilho-tag tag-reserva">1. Criação de Reserva</span>
                  <strong>Confirmação de Reserva de Assados</strong>
                  <p>Disparado instantaneamente ao registrar uma reserva de domingo (com número, horário e itens).</p>
                </div>
                <label class="switch-toggle" title="Ativar ou desativar envio automático">
                  <input type="checkbox" class="chk-gatilho" data-gatilho="reservaConfirmada" ${g.reservaConfirmada ? 'checked' : ''} />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="gatilho-rodape">
                <button class="btn-link-gatilho btn-editar-template-gatilho" data-template="reserva_confirmada">
                  ✏️ Editar texto da mensagem
                </button>
                <button class="btn-link-gatilho btn-testar-gatilho" data-template="reserva_confirmada">
                  ▶️ Testar este gatilho
                </button>
              </div>
            </div>

            <!-- Gatilho 2: Entrou no Espeto / Preparo -->
            <div class="gatilho-card ${g.entrouPreparo ? 'ativo' : 'inativo'}">
              <div class="gatilho-topo">
                <div class="gatilho-info">
                  <span class="gatilho-tag tag-preparo">2. Braseiro / Espeto</span>
                  <strong>Aviso: "Frango entrou na máquina / braseiro"</strong>
                  <p>Disparado quando a equipe avança o status da reserva para "No Espeto (Preparo)".</p>
                </div>
                <label class="switch-toggle" title="Ativar ou desativar envio automático">
                  <input type="checkbox" class="chk-gatilho" data-gatilho="entrouPreparo" ${g.entrouPreparo ? 'checked' : ''} />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="gatilho-rodape">
                <button class="btn-link-gatilho btn-editar-template-gatilho" data-template="pedido_preparo">
                  ✏️ Editar texto da mensagem
                </button>
                <button class="btn-link-gatilho btn-testar-gatilho" data-template="pedido_preparo">
                  ▶️ Testar este gatilho
                </button>
              </div>
            </div>

            <!-- Gatilho 3: Pronto na Estufa -->
            <div class="gatilho-card ${g.prontoEstufa ? 'ativo' : 'inativo'}">
              <div class="gatilho-topo">
                <div class="gatilho-info">
                  <span class="gatilho-tag tag-pronto">3. Pronto na Estufa</span>
                  <strong>Aviso de Retirada Imediata no Balcão</strong>
                  <p>Disparado quando o frango é colocado na estufa aquecida para o cliente vir buscar.</p>
                </div>
                <label class="switch-toggle" title="Ativar ou desativar envio automático">
                  <input type="checkbox" class="chk-gatilho" data-gatilho="prontoEstufa" ${g.prontoEstufa ? 'checked' : ''} />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="gatilho-rodape">
                <button class="btn-link-gatilho btn-editar-template-gatilho" data-template="pedido_pronto">
                  ✏️ Editar texto da mensagem
                </button>
                <button class="btn-link-gatilho btn-testar-gatilho" data-template="pedido_pronto">
                  ▶️ Testar este gatilho
                </button>
              </div>
            </div>

            <!-- Gatilho 4: Cupom Digital no PDV -->
            <div class="gatilho-card ${g.cupomPdv ? 'ativo' : 'inativo'}">
              <div class="gatilho-topo">
                <div class="gatilho-info">
                  <span class="gatilho-tag tag-pdv">4. Fechamento de Venda</span>
                  <strong>Cupom Digital de Venda do Caixa</strong>
                  <p>Oferece o envio automático do comprovante discriminado no WhatsApp do cliente após a compra.</p>
                </div>
                <label class="switch-toggle" title="Ativar ou desativar envio automático">
                  <input type="checkbox" class="chk-gatilho" data-gatilho="cupomPdv" ${g.cupomPdv ? 'checked' : ''} />
                  <span class="switch-slider"></span>
                </label>
              </div>
              <div class="gatilho-rodape">
                <button class="btn-link-gatilho btn-editar-template-gatilho" data-template="cupom_pdv">
                  ✏️ Editar texto da mensagem
                </button>
                <button class="btn-link-gatilho btn-testar-gatilho" data-template="cupom_pdv">
                  ▶️ Testar este gatilho
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (aba === 'simulador') {
      const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const textoFormatado = formatarPreviewTemplate(templateAtual?.texto || '');

      return `
        <div class="secao-simulador">
          <div class="simulador-controles">
            <h3>Simulador Visual do WhatsApp 📱</h3>
            <p>Selecione um template abaixo para ver como a mensagem será exibida na tela do smartphone do seu cliente:</p>

            <div class="campo" style="margin-top: 14px;">
              <label>Nome ou Apelido do Estabelecimento (Cabeçalho da Mensagem):</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="input-nome-estab-simulador" class="input" placeholder="Ex: Ao Ponto Assados, Frangão da Vila..." value="${config.nomeEstabelecimento || 'Ao Ponto Assados'}" />
                <button class="btn btn-pequeno btn-secundario" id="btn-salvar-nome-estab">Salvar Nome</button>
              </div>
              <small style="color: var(--texto-suave); display: block; margin-top: 4px;">
                Este nome/apelido é inserido no topo das mensagens através da variável <code>{estabelecimento}</code>.
              </small>
            </div>

            <div class="campo" style="margin-top: 10px;">
              <label>Escolha o Modelo de Mensagem:</label>
              <select id="sel-template-simulador" class="select">
                ${templates.map((t) => `
                  <option value="${t.id}" ${t.id === templateSimuladorId ? 'selected' : ''}>
                    ${t.titulo} (${t.categoria})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="campo" style="margin-top: 10px;">
              <label>Texto da Mensagem (Editável):</label>
              <textarea id="texto-template-edit" class="input" rows="6">${templateAtual?.texto || ''}</textarea>
              <small style="color: var(--texto-suave); display: block; margin-top: 4px;">
                Variáveis suportadas: <code>{estabelecimento}</code>, <code>{cliente}</code>, <code>{pedido_id}</code>, <code>{horario}</code>, <code>{data}</code>, <code>{itens}</code>, <code>{total}</code>, <code>{selos}</code>.
              </small>
            </div>

            <div class="simulador-acao-teste">
              <label>Enviar Teste Real no seu Celular:</label>
              <div style="display: flex; gap: 8px;">
                <input type="tel" id="input-tel-teste-wa" class="input" placeholder="DDD + Número (ex: 11 99999-8888)" value="${telefoneTesteSimulador}" maxlength="15" />
                <button class="btn btn-whatsapp" id="btn-enviar-teste-wa">
                  ${icone('whatsapp')} Testar Envio
                </button>
              </div>
              <small style="color: var(--texto-suave); display: block; margin-top: 4px;">
                Digite apenas seu DDD e telefone. O código do país (+55) já é adicionado automaticamente.
              </small>
            </div>
          </div>

          <!-- MOCKUP DO SMARTPHONE COM TELA DO WHATSAPP -->
          <div class="phone-mockup-wrapper">
            <div class="phone-mockup">
              <div class="phone-speaker"></div>
              <div class="phone-screen">
                <!-- Topo WhatsApp -->
                <div class="wa-screen-header">
                  <span class="wa-voltar">&larr;</span>
                  <div class="wa-perfil-avatar">🏪</div>
                  <div class="wa-perfil-info">
                    <strong id="mockup-nome-estab">${config.nomeEstabelecimento || 'Ao Ponto Assados'}</strong>
                    <small>Online agora</small>
                  </div>
                  <div class="wa-topo-icones">
                    <span>📹</span>
                    <span>📞</span>
                    <span>⋮</span>
                  </div>
                </div>

                <!-- Corpo do Chat -->
                <div class="wa-screen-body">
                  <div class="wa-data-badge">HOJE</div>

                  <div class="wa-balao-mensagem">
                    <div class="wa-mensagem-conteudo">
                      ${textoFormatado}
                    </div>
                    <div class="wa-mensagem-meta">
                      <span class="wa-hora">${horaAtual}</span>
                      <span class="wa-check-duplo">✓✓</span>
                    </div>
                  </div>
                </div>

                <!-- Barra de Digitação WhatsApp -->
                <div class="wa-screen-footer">
                  <span class="wa-emoji-btn">😊</span>
                  <input type="text" class="wa-input-fake" placeholder="Mensagem..." disabled />
                  <span class="wa-anexo-btn">📎</span>
                  <span class="wa-mic-btn">🎙️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (aba === 'historico') {
      return `
        <div class="secao-historico-wa">
          <div class="campanhas-cabecalho">
            <div>
              <h3>Histórico de Mensagens Enviadas 📋💬</h3>
              <p>Auditoria de todos os disparos automáticos e campanhas enviadas pelo WhatsApp.</p>
            </div>
            <button class="btn btn-contorno btn-pequeno" id="btn-limpar-hist-wa">Limpar Registro</button>
          </div>

          <div class="tabela-responsiva">
            <table class="tabela-historico">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Tipo / Template</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${ctx.historico.length === 0 ? `
                  <tr>
                    <td colspan="6" class="tabela-vazia">Nenhuma mensagem registrada no histórico ainda.</td>
                  </tr>
                ` : ctx.historico.map((h) => `
                  <tr>
                    <td class="col-hora"><strong>${h.data} às ${h.hora}</strong></td>
                    <td><strong>${h.cliente}</strong></td>
                    <td style="color: var(--texto-suave);">${h.telefone || '—'}</td>
                    <td><span class="badge badge-demo">${h.template}</span></td>
                    <td>
                      <span class="badge-status-wa ${h.status}">
                        ${h.status === 'lido' ? '✓✓ Lido' : h.status === 'entregue' ? '✓ Entregue' : 'Enviado'}
                      </span>
                    </td>
                    <td>
                      <button class="btn-icone btn-reenviar-msg" data-tel="${h.telefone}" data-cliente="${h.cliente}" title="Reenviar pelo WhatsApp">
                        ${icone('whatsapp', 'mini')}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return '';
  }

  function formatarPreviewTemplate(textoBruto) {
    const nomeLoja = store.getWhatsapp().config?.nomeEstabelecimento || 'Ao Ponto Assados';
    let t = (textoBruto || '')
      .replace(/{estabelecimento}/g, `*${nomeLoja}*`)
      .replace(/{loja}/g, `*${nomeLoja}*`)
      .replace(/{cliente}/g, '<b>Cláudio Duarte</b>')
      .replace(/{pedido_id}/g, '<b>1045</b>')
      .replace(/{horario}/g, '<b>12:00h</b>')
      .replace(/{data}/g, '<b>Domingo</b>')
      .replace(/{itens}/g, '1x Frango Inteiro Dourado, 1x Maionese Caseira, 1x Farofa Crocante')
      .replace(/{total}/g, '<b>R$ 67,00</b>')
      .replace(/{metodo}/g, 'PIX')
      .replace(/{selos}/g, '<b>8</b>')
      .replace(/{aviso_premio}/g, 'Faltam apenas <b>2 selos</b> para ganhar 1 Frango Assado Grátis!');

    // Negrito do WhatsApp: *palavra* -> <b>palavra</b>
    t = t.replace(/\*(.*?)\*/g, '<b>$1</b>');
    // Quebras de linha
    t = t.replace(/\n/g, '<br/>');
    return t;
  }

  function vincularEventos() {
    // Abas
    raiz.querySelectorAll('.aba-wa').forEach((btn) => {
      btn.addEventListener('click', () => {
        abaAtiva = btn.dataset.aba;
        desenhar();
      });
    });

    // Topo
    raiz.querySelector('#btn-novo-disparo')?.addEventListener('click', () => abrirModalNovoDisparo());
    raiz.querySelector('#btn-importar-contatos-wa-topo')?.addEventListener('click', () => {
      abrirModalImportacaoContatos(() => desenhar());
    });
    raiz.querySelector('#btn-conectar-wa')?.addEventListener('click', () => abrirModalConexao());
    raiz.querySelector('#btn-gerenciar-conexao')?.addEventListener('click', () => abrirModalConexao());
    raiz.querySelector('#btn-nova-campanha-custom')?.addEventListener('click', () => abrirModalNovoDisparo());

    // Alternar modo (Link wa.me vs API)
    raiz.querySelector('#btn-alternar-modo')?.addEventListener('click', () => {
      const cfg = store.getWhatsapp().config;
      const novoModo = cfg.modo === 'link' ? 'instancia' : 'link';
      store.atualizarConfigWhatsapp({ modo: novoModo });
      toast(`Modo alterado para: ${novoModo === 'instancia' ? '⚡ API Automática' : '🔗 Modo Link Direto (wa.me)'}!`, 'sucesso');
      desenhar();
    });

    // Switches de Gatilhos
    raiz.querySelectorAll('.chk-gatilho').forEach((chk) => {
      chk.addEventListener('change', () => {
        const gatilho = chk.dataset.gatilho;
        const ativo = store.toggleGatilhoWhatsapp(gatilho);
        toast(`Gatilho "${gatilho}" ${ativo ? 'ativado' : 'desativado'}!`, 'info');
        desenhar();
      });
    });

    // Edição de template de gatilho
    raiz.querySelectorAll('.btn-editar-template-gatilho').forEach((btn) => {
      btn.addEventListener('click', () => {
        templateSimuladorId = btn.dataset.template;
        abaAtiva = 'simulador';
        desenhar();
      });
    });

    // Testar gatilho
    raiz.querySelectorAll('.btn-testar-gatilho').forEach((btn) => {
      btn.addEventListener('click', () => {
        templateSimuladorId = btn.dataset.template;
        abaAtiva = 'simulador';
        desenhar();
        toast('Selecione um número de teste no simulador para disparar.', 'info');
      });
    });

    // Preview de campanhas
    raiz.querySelectorAll('.btn-preview-campanha').forEach((btn) => {
      btn.addEventListener('click', () => {
        templateSimuladorId = btn.dataset.template;
        abaAtiva = 'simulador';
        desenhar();
      });
    });

    // Disparar campanha
    raiz.querySelectorAll('.btn-disparar-campanha').forEach((btn) => {
      btn.addEventListener('click', () => {
        const templateId = btn.dataset.template;
        const nomeCampanha = btn.dataset.nome;
        abrirModalConfirmacaoDisparo(templateId, nomeCampanha);
      });
    });

    // Simulador: seletor de template
    const selTemplate = raiz.querySelector('#sel-template-simulador');
    selTemplate?.addEventListener('change', (e) => {
      templateSimuladorId = e.target.value;
      desenhar();
    });

    // Simulador: salvar nome/apelido do estabelecimento
    const inputNomeEstab = raiz.querySelector('#input-nome-estab-simulador');
    const salvarNomeEstab = () => {
      const val = (inputNomeEstab?.value || '').trim() || 'Ao Ponto Assados';
      store.atualizarConfigWhatsapp({ nomeEstabelecimento: val });
      const strongHeader = raiz.querySelector('#mockup-nome-estab');
      if (strongHeader) strongHeader.textContent = val;
      const balao = raiz.querySelector('.wa-mensagem-conteudo');
      const txtEdit = raiz.querySelector('#texto-template-edit');
      if (balao && txtEdit) balao.innerHTML = formatarPreviewTemplate(txtEdit.value);
      toast('Nome/apelido do estabelecimento salvo!', 'sucesso');
    };
    raiz.querySelector('#btn-salvar-nome-estab')?.addEventListener('click', salvarNomeEstab);
    inputNomeEstab?.addEventListener('change', salvarNomeEstab);

    // Simulador: edição de texto ao vivo
    const txtEdit = raiz.querySelector('#texto-template-edit');
    txtEdit?.addEventListener('input', (e) => {
      store.atualizarTemplateWhatsapp(templateSimuladorId, e.target.value);
      const balao = raiz.querySelector('.wa-mensagem-conteudo');
      if (balao) balao.innerHTML = formatarPreviewTemplate(e.target.value);
    });

    // Simulador: input telefone teste (máscara automática e DDI +55 oculto)
    const inputTelTeste = raiz.querySelector('#input-tel-teste-wa');
    inputTelTeste?.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      // Se começou com 55 por engano, remove para deixar só DDD + número no campo
      if (v.startsWith('55') && v.length > 11) {
        v = v.slice(2);
      }
      if (v.length > 11) v = v.slice(0, 11);

      // Formatação (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      let formatado = v;
      if (v.length > 6) {
        formatado = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        formatado = `(${v.slice(0, 2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        formatado = `(${v}`;
      }
      e.target.value = formatado;
      telefoneTesteSimulador = formatado;
    });

    // Simulador: botão enviar teste
    raiz.querySelector('#btn-enviar-teste-wa')?.addEventListener('click', () => {
      const digitos = telefoneTesteSimulador.replace(/\D/g, '');
      if (!digitos || digitos.length < 10) {
        toast('Informe seu DDD e número de telefone para testar.', 'erro');
        return;
      }

      // Código internacional 55 (Brasil) embutido e oculto automaticamente
      const telFinal = digitos.startsWith('55') && digitos.length >= 12
        ? digitos
        : `55${digitos}`;

      const t = store.getWhatsapp().templates.find((x) => x.id === templateSimuladorId);
      const nomeLoja = store.getWhatsapp().config?.nomeEstabelecimento || 'Ao Ponto Assados';
      const msg = t ? t.texto
        .replace(/{estabelecimento}/g, nomeLoja)
        .replace(/{loja}/g, nomeLoja)
        .replace(/{cliente}/g, 'Cliente Teste')
        .replace(/{pedido_id}/g, '1045')
        .replace(/{horario}/g, '12:00h')
        .replace(/{data}/g, 'Domingo')
        .replace(/{itens}/g, '1x Frango Inteiro Dourado, 1x Maionese Caseira')
        .replace(/{total}/g, 'R$ 60,00')
        .replace(/{metodo}/g, 'Pix')
        .replace(/{selos}/g, '8')
        .replace(/{aviso_premio}/g, 'Faltam 2 selos para seu frango grátis!') : '';

      const url = `https://wa.me/${telFinal}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');

      store.registrarEnvioWhatsapp({
        cliente: 'Cliente Teste',
        telefone: telefoneTesteSimulador,
        template: t?.titulo || 'Mensagem Teste',
        tipo: 'manual',
        texto: msg,
      });
      toast(`Mensagem enviada com sucesso para +${telFinal}!`, 'sucesso');
    });

    // Reenviar mensagem do histórico
    raiz.querySelectorAll('.btn-reenviar-msg').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tel = (btn.dataset.tel || '').replace(/\D/g, '');
        const cliente = btn.dataset.cliente;
        if (!tel) return toast('Cliente sem telefone cadastrado.', 'erro');
        const telFinal = tel.length <= 11 ? `55${tel}` : tel;
        const url = `https://wa.me/${telFinal}?text=${encodeURIComponent(`Olá ${cliente}! Tudo bem? Passando para dar um alô do Ao Ponto Assados.`)}`;
        window.open(url, '_blank');
      });
    });

    // Limpar histórico
    raiz.querySelector('#btn-limpar-hist-wa')?.addEventListener('click', () => {
      if (confirm('Deseja limpar o histórico recente de mensagens?')) {
        const wa = store.getWhatsapp();
        wa.historico = [];
        store.salvarWhatsapp();
        toast('Histórico limpo.', 'info');
        desenhar();
      }
    });
  }

  // ── Modais ──────────────────────────────────────────────────

  // Modal 1: Conexão WhatsApp / Instância e QR Code
  function abrirModalConexao() {
    const cfg = store.getWhatsapp().config;
    abrirModal({
      titulo: 'Conexão do WhatsApp 📱⚡',
      html: `
        <div class="modal-conexao-wa">
          <p style="color: var(--texto-suave); font-size: 14px; margin-bottom: 14px;">
            Conecte o número do balcão para disparar avisos automáticos e interagir com seus fregueses.
          </p>

          <div class="card-instancia-detalhes" style="background: var(--creme); padding: 14px; border-radius: 12px; border: 1px solid var(--borda); margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>Status da Sessão:</strong>
              <span class="badge ${cfg.instanciaConectada ? 'badge-sucesso' : 'badge-perigo'}">
                ${cfg.instanciaConectada ? '🟢 Conectado' : '🔴 Desconectado'}
              </span>
            </div>
            <div style="margin-top: 8px; font-size: 13px; color: var(--texto);">
              Instância: <b>${cfg.nomeInstancia || 'Ao Ponto Balcão'}</b><br/>
              Número: <b>${cfg.numeroConectado}</b><br/>
              Bateria: <b>${cfg.bateria}% 🔋</b>
            </div>
          </div>

          <div style="text-align: center; margin: 16px 0;">
            <div style="width: 180px; height: 180px; margin: 0 auto; background: #fff; border: 2px dashed #25D366; border-radius: 12px; display: grid; place-items: center;">
              <div style="text-align: center;">
                <div style="font-size: 40px; margin-bottom: 4px;">📱</div>
                <small style="color: #166534; font-weight: 700;">QR Code Pareado</small><br/>
                <small style="color: var(--texto-suave); font-size: 11px;">Sessão ativa</small>
              </div>
            </div>
            <small style="display: block; margin-top: 8px; color: var(--texto-suave);">
              Para trocar de aparelho, abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar novo aparelho.
            </small>
          </div>

          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-texto btn-perigo-suave" id="btn-desconectar-wa">
              Desconectar Aparelho
            </button>
            <button class="btn btn-primario" data-fechar>
              Concluído
            </button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#btn-desconectar-wa')?.addEventListener('click', () => {
          store.atualizarConfigWhatsapp({ instanciaConectada: !cfg.instanciaConectada });
          toast(`WhatsApp ${cfg.instanciaConectada ? 'desconectado' : 'conectado'}!`, 'info');
          fechar();
          desenhar();
        });
      }
    });
  }

  // Modal 2: Confirmação de Disparo de Campanha em Lote
  function abrirModalConfirmacaoDisparo(templateId, nomeCampanha) {
    const t = store.getWhatsapp().templates.find((x) => x.id === templateId);
    const clientes = store.getClientes();

    abrirModal({
      titulo: `Disparar: ${nomeCampanha} 📢`,
      html: `
        <div class="modal-disparo-confirmacao">
          <p style="color: var(--texto-suave); font-size: 14px; margin-bottom: 12px;">
            Você está prestes a disparar esta mensagem para a sua base de clientes cadastrados:
          </p>

          <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 12px; margin-bottom: 14px;">
            <strong style="color: #166534; font-size: 13px; display: block; margin-bottom: 4px;">Público Selecionado:</strong>
            <span style="font-size: 14px; font-weight: 700;">${clientes.length} Clientes com WhatsApp</span>
            <small style="display: block; color: var(--texto-suave); margin-top: 2px;">
              ${clientes.map(c => c.nome.split(' ')[0]).slice(0, 5).join(', ')} e outros...
            </small>
          </div>

          <div class="campo">
            <label>Mensagem que será enviada:</label>
            <textarea class="input" rows="5" disabled style="background: var(--creme); font-size: 13px;">${t ? t.texto : ''}</textarea>
          </div>

          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-canc-disparo">Cancelar</button>
            <button class="btn btn-whatsapp" id="btn-confirmar-disparo">
              ${icone('whatsapp')} Confirmar e Enviar para Todos (${clientes.length})
            </button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-canc-disparo').onclick = fechar;
        el.querySelector('#btn-confirmar-disparo').onclick = () => {
          const nomeLoja = store.getWhatsapp().config?.nomeEstabelecimento || 'Ao Ponto Assados';
          // Registra os envios no histórico
          clientes.forEach((cli) => {
            store.registrarEnvioWhatsapp({
              cliente: cli.nome,
              telefone: cli.telefone,
              template: nomeCampanha,
              tipo: 'campanha',
              status: 'entregue',
              texto: t ? t.texto.replace(/{estabelecimento}/g, nomeLoja).replace(/{loja}/g, nomeLoja).replace(/{cliente}/g, cli.nome) : '',
            });
          });

          toast(`Disparo de "${nomeCampanha}" concluído com sucesso para ${clientes.length} clientes! 🚀`, 'sucesso');
          fechar();
          desenhar();
        };
      }
    });
  }

  // Modal 3: Novo Disparo Personalizado Avulso
  function abrirModalNovoDisparo() {
    const clientes = store.getClientes();

    abrirModal({
      titulo: 'Novo Disparo de WhatsApp 💬',
      html: `
        <div class="form-modal-novo-disparo">
          <div class="campo">
            <label>Selecione o Destinatário:</label>
            <select id="mod-dest-cliente" class="select">
              <option value="todos">📢 Todos os Clientes (${clientes.length})</option>
              <option value="vips">⭐ Apenas Clientes VIPs</option>
              <option value="frequentes">🔥 Apenas Clientes Frequentes</option>
              ${clientes.map(c => `<option value="${c.id}">${c.nome} (${c.telefone || 'Balcão'})</option>`).join('')}
            </select>
          </div>

          <div class="campo" style="margin-top: 10px;">
            <label>Mensagem:</label>
            <textarea id="mod-disparo-msg" class="input" rows="5" placeholder="Digite sua mensagem para os clientes...">Olá! Temos frango assado fresquinho saindo da brasa neste momento no Ao Ponto. Peça o seu!</textarea>
          </div>

          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-canc-mod-disparo">Cancelar</button>
            <button class="btn btn-whatsapp" id="btn-salvar-disparo">
              ${icone('whatsapp')} Disparar Mensagem
            </button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-canc-mod-disparo').onclick = fechar;
        el.querySelector('#btn-salvar-disparo').onclick = () => {
          const dest = el.querySelector('#mod-dest-cliente').value;
          const msg = el.querySelector('#mod-disparo-msg').value.trim();

          if (!msg) {
            toast('Escreva uma mensagem para enviar.', 'erro');
            return;
          }

          if (dest === 'todos' || dest === 'vips' || dest === 'frequentes') {
            toast(`Disparo em massa enviado com sucesso!`, 'sucesso');
          } else {
            const cli = clientes.find((c) => c.id === dest);
            if (cli) {
              const tel = (cli.telefone || '').replace(/\D/g, '');
              const telFinal = tel.length <= 11 ? `55${tel}` : tel;
              window.open(`https://wa.me/${telFinal}?text=${encodeURIComponent(msg)}`, '_blank');
              store.registrarEnvioWhatsapp({
                cliente: cli.nome,
                telefone: cli.telefone,
                template: 'Mensagem Personalizada',
                tipo: 'manual',
                texto: msg,
              });
              toast(`Conversa aberta para ${cli.nome}!`, 'sucesso');
            }
          }

          fechar();
          desenhar();
        };
      }
    });
  }

  desenhar();
}

