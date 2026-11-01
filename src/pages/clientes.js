/**
 * TELA DE CLIENTES, CRM & CLUBE DO FRANGO (FIDELIDADE)
 * Cadastro, histórico de compras, preferências gastronômicas do assador e programa de selos.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS } from '../data/mock.js';
import { fmtMoeda } from '../utils/format.js';
import { abrirModalImportacaoContatos } from '../components/modal-importar-contatos.js';

let filtroTag = 'todos';
let buscaTexto = '';

export function renderClientes(raiz, irPara) {
  const st = store.get();
  const perfil = store.perfil();
  const nomePonto = st.ponto === 'todos'
    ? (perfil.pontos.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos[0]).nome)
    : PONTOS.find((p) => p.id === st.ponto)?.nome;

  function desenhar() {
    const todosClientes = store.getClientes();

    // Filtros
    let lista = todosClientes;
    if (filtroTag === 'resgate') {
      lista = lista.filter((c) => (c.pontosFidelidade || 0) >= 10);
    } else if (filtroTag !== 'todos') {
      lista = lista.filter((c) => c.tag === filtroTag);
    }

    if (buscaTexto.trim()) {
      const q = buscaTexto.toLowerCase().trim();
      lista = lista.filter((c) =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.telefone || '').includes(q) ||
        (c.bairro || '').toLowerCase().includes(q) ||
        (c.preferencias || '').toLowerCase().includes(q)
      );
    }

    // KPIs
    const totalClientes = todosClientes.length;
    const vips = todosClientes.filter((c) => c.tag === 'vip');
    const frequentes = todosClientes.filter((c) => c.tag === 'frequente');
    const prontosResgate = todosClientes.filter((c) => (c.pontosFidelidade || 0) >= 10);
    const receitaTotal = todosClientes.reduce((acc, c) => acc + (c.totalGasto || 0), 0);
    const ticketMedio = totalClientes > 0 ? (receitaTotal / totalClientes) : 0;

    raiz.innerHTML = `
    <div class="clientes-container">
      <!-- Topo -->
      <div class="clientes-topo">
        <div class="clientes-topo-info">
          <h1>Clientes &bull; CRM & Clube do Frango 👥🍗</h1>
          <p>
            <span class="badge badge-demo">${icone('local', 'mini')} ${nomePonto}</span>
            &bull; Gestão de fidelidade, preferências de assados e contato rápido
          </p>
        </div>
        <div class="clientes-topo-acoes">
          <button class="btn btn-primario" id="btn-novo-cliente">
            ${icone('mais')} Novo Cliente
          </button>
          <button class="btn btn-whatsapp" id="btn-importar-contatos-topo">
            ${icone('whatsapp')} Importar do WhatsApp
          </button>
          <button class="btn btn-contorno" id="btn-regras-fidelidade">
            ${icone('info')} Regras do Clube
          </button>
        </div>
      </div>

      <!-- Banner de Recompensas se houver clientes prontos para resgate -->
      ${prontosResgate.length > 0 ? `
        <div class="clientes-aviso-fidelidade">
          <div class="aviso-fidelidade-icone">🎁</div>
          <div class="aviso-fidelidade-conteudo">
            <strong>${prontosResgate.length} ${prontosResgate.length === 1 ? 'cliente completou' : 'clientes completaram'} os 10 selos da cartela!</strong>
            <p>${prontosResgate.map(c => `<b>${c.nome}</b> (${c.pontosFidelidade} selos)`).join(', ')} já podem retirar o prêmio de cortesia.</p>
          </div>
          <button class="btn btn-pequeno btn-sucesso" id="btn-filtrar-resgate">Ver clientes</button>
        </div>
      ` : ''}

      <!-- KPIs Rápidos -->
      <div class="clientes-kpis">
        <div class="kpi-card">
          <div class="kpi-rotulo">Total de Clientes</div>
          <div class="kpi-valor">${totalClientes}</div>
          <div class="kpi-sub">Cadastrados na base</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Clientes VIP & Frequentes</div>
          <div class="kpi-valor" style="color: var(--brasa);">${vips.length + frequentes.length}</div>
          <div class="kpi-sub">${vips.length} VIPs &bull; ${frequentes.length} Frequentes</div>
        </div>
        <div class="kpi-card destaque-fidelidade">
          <div class="kpi-rotulo">Prontos para Resgate 🎁</div>
          <div class="kpi-valor">${prontosResgate.length}</div>
          <div class="kpi-sub">10 ou mais selos acumulados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Ticket Médio Acumulado</div>
          <div class="kpi-valor">${fmtMoeda(ticketMedio)}</div>
          <div class="kpi-sub">Gasto médio por cliente</div>
        </div>
      </div>

      <!-- Barra de Filtros & Busca -->
      <div class="cartao clientes-ferramentas">
        <div class="clientes-filtros-linha">
          <div class="abas-categorias">
            <button class="aba-filtro ${filtroTag === 'todos' ? 'ativa' : ''}" data-tag="todos">
              Todos (${todosClientes.length})
            </button>
            <button class="aba-filtro ${filtroTag === 'vip' ? 'ativa' : ''}" data-tag="vip">
              ⭐ VIPs (${vips.length})
            </button>
            <button class="aba-filtro ${filtroTag === 'frequente' ? 'ativa' : ''}" data-tag="frequente">
              🔥 Frequentes (${frequentes.length})
            </button>
            <button class="aba-filtro ${filtroTag === 'resgate' ? 'ativa resgate' : ''}" data-tag="resgate">
              🎁 Prontos p/ Ganhar (${prontosResgate.length})
            </button>
            <button class="aba-filtro ${filtroTag === 'novo' ? 'ativa' : ''}" data-tag="novo">
              🎉 Novos
            </button>
          </div>

          <div class="busca-cliente-caixa">
            <span class="busca-ic">${icone('busca')}</span>
            <input 
              type="text" 
              id="campo-busca-cliente" 
              class="input input-busca" 
              placeholder="Buscar por nome, WhatsApp ou bairro..." 
              value="${buscaTexto}" 
            />
          </div>
        </div>

        <!-- Grade de Cards dos Clientes -->
        ${lista.length === 0 ? `
          <div class="estado-vazio-clientes">
            <div class="ev-icone">👥</div>
            <h3>Nenhum cliente encontrado</h3>
            <p>Tente alterar o filtro ou termo de busca.</p>
            <button class="btn btn-primario" id="btn-novo-cliente-vazio" style="margin-top: 10px;">
              ${icone('mais')} Cadastrar Cliente
            </button>
          </div>
        ` : `
          <div class="grade-clientes">
            ${lista.map((c) => {
      const selos = Math.min(10, c.pontosFidelidade || 0);
      const temPremio = (c.pontosFidelidade || 0) >= 10;
      const iniciais = (c.nome || 'CL')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      let tagClass = 'tag-novo';
      let tagNome = 'Novo Cliente';
      if (c.tag === 'vip') { tagClass = 'tag-vip'; tagNome = '⭐ VIP'; }
      else if (c.tag === 'frequente') { tagClass = 'tag-frequente'; tagNome = '🔥 Frequente'; }

      return `
              <div class="cliente-card ${temPremio ? 'card-premiado' : ''}">
                <div class="cliente-card-cabecalho">
                  <div class="cliente-avatar">${iniciais}</div>
                  <div class="cliente-titulos">
                    <strong class="cliente-nome">${c.nome}</strong>
                    <div class="cliente-meta-linha">
                      <span class="cliente-tag ${tagClass}">${tagNome}</span>
                      <span class="cliente-bairro">${icone('local', 'mini')} ${c.bairro || 'Balcão'}</span>
                    </div>
                  </div>
                  <div class="cliente-topo-acoes">
                    <button class="btn-icone btn-editar-cliente" data-id="${c.id}" title="Editar cadastro">
                      ${icone('config', 'mini')}
                    </button>
                  </div>
                </div>

                <!-- Bloco de Preferências Gastronômicas -->
                <div class="cliente-preferencias-box">
                  <div class="pref-label">
                    <span>${icone('fogo', 'mini')} Como o cliente gosta do assado:</span>
                  </div>
                  <div class="pref-texto">
                    "${c.preferencias || 'Nenhuma preferência específica informada.'}"
                  </div>
                </div>

                <!-- Cartela de Fidelidade: Clube do Frango (10 Selos) -->
                <div class="clube-fidelidade-box">
                  <div class="clube-topo">
                    <span class="clube-titulo">🍗 Clube do Frango</span>
                    <span class="clube-selos-contagem">
                      <strong>${c.pontosFidelidade || 0}</strong>/10 selos
                    </span>
                  </div>

                  <div class="selos-grid">
                    ${Array.from({ length: 10 }).map((_, i) => {
        const preenchido = i < selos;
        const isUltimo = i === 9;
        return `
                        <div class="selo-slot ${preenchido ? 'preenchido' : 'vazio'} ${isUltimo ? 'selo-premio' : ''}" title="${preenchido ? (isUltimo ? 'Selo #10 - Frango Grátis Conquistado!' : `Selo #${i + 1} conquistado!`) : (isUltimo ? 'Selo #10 - Frango Grátis!' : `Selo #${i + 1}`)}">
                          ${preenchido ? (isUltimo ? '🎁' : '🍗') : (isUltimo ? '🎁' : (i + 1))}
                        </div>
                      `;
      }).join('')}
                  </div>

                  ${temPremio ? `
                    <div class="aviso-premio-atingido">
                      <span>🎉 Parabéns! Cartela premiada completa!</span>
                      <button class="btn btn-pequeno btn-sucesso btn-resgatar-premio" data-id="${c.id}">
                        🎁 Resgatar Prêmio
                      </button>
                    </div>
                  ` : `
                    <div class="clube-rodape">
                      <small>A cada 10 frangos, ganhe 1 grátis!</small>
                      <button class="btn-link-selo" data-acao="add-selo" data-id="${c.id}">+ Carimbar Selo</button>
                    </div>
                  `}
                </div>

                <!-- Estatísticas de Compras -->
                <div class="cliente-estatisticas">
                  <div class="estat-item">
                    <small>Gasto Total</small>
                    <strong>${fmtMoeda(c.totalGasto || 0)}</strong>
                  </div>
                  <div class="estat-item">
                    <small>Pedidos</small>
                    <strong>${c.totalPedidos || 0} pedidos</strong>
                  </div>
                  <div class="estat-item">
                    <small>Última Visita</small>
                    <strong>${c.ultimaVisita || 'Hoje'}</strong>
                  </div>
                </div>

                <!-- Barra de Ações Rápidas -->
                <div class="cliente-card-acoes">
                  <button class="btn btn-pequeno btn-whatsapp btn-whats-cliente" data-id="${c.id}" data-tel="${c.telefone}" data-nome="${c.nome}">
                    ${icone('whatsapp')} WhatsApp
                  </button>
                  <button class="btn btn-pequeno btn-contorno btn-historico-cliente" data-id="${c.id}" data-nome="${c.nome}">
                    ${icone('recibo')} Histórico
                  </button>
                </div>
              </div>
              `;
    }).join('')}
          </div>
        `}
      </div>
    </div>
    `;

    vincularEventos();
  }

  function vincularEventos() {
    // Topo
    raiz.querySelector('#btn-novo-cliente')?.addEventListener('click', () => abrirModalCliente());
    raiz.querySelector('#btn-novo-cliente-vazio')?.addEventListener('click', () => abrirModalCliente());
    raiz.querySelector('#btn-importar-contatos-topo')?.addEventListener('click', () => {
      abrirModalImportacaoContatos(() => desenhar());
    });
    raiz.querySelector('#btn-regras-fidelidade')?.addEventListener('click', () => abrirModalRegrasClube());
    raiz.querySelector('#btn-filtrar-resgate')?.addEventListener('click', () => {
      filtroTag = 'resgate';
      desenhar();
    });

    // Filtros por abas
    raiz.querySelectorAll('.aba-filtro').forEach((btn) => {
      btn.addEventListener('click', () => {
        filtroTag = btn.dataset.tag;
        desenhar();
      });
    });

    // Campo de busca
    const campoBusca = raiz.querySelector('#campo-busca-cliente');
    campoBusca?.addEventListener('input', (e) => {
      buscaTexto = e.target.value;
      desenhar();
    });

    // Carimbar selo manual
    raiz.querySelectorAll('[data-acao="add-selo"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        store.adicionarPontoFidelidade(id, 1);
        toast('Selo de fidelidade carimbado com sucesso! 🍗', 'sucesso');
        desenhar();
      });
    });

    // Resgatar prêmio
    raiz.querySelectorAll('.btn-resgatar-premio').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const res = store.resgatarFidelidade(id);
        if (res.ok) {
          toast('Prêmio de fidelidade resgatado! Cartela reiniciada. 🎉', 'sucesso');
          desenhar();
        } else {
          toast(res.erro, 'erro');
        }
      });
    });

    // Editar cliente
    raiz.querySelectorAll('.btn-editar-cliente').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const cli = store.getClientes().find((c) => c.id === id);
        if (cli) abrirModalCliente(cli);
      });
    });

    // WhatsApp Inteligente
    raiz.querySelectorAll('.btn-whats-cliente').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const cli = store.getClientes().find((c) => c.id === id);
        if (cli) abrirModalWhatsAppCliente(cli);
      });
    });

    // Histórico de Compras do Cliente
    raiz.querySelectorAll('.btn-historico-cliente').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const cli = store.getClientes().find((c) => c.id === id);
        if (cli) abrirModalHistoricoCliente(cli);
      });
    });
  }

  // ── Modais ──────────────────────────────────────────────────

  // Modal 1: Cadastro / Edição de Cliente
  function abrirModalCliente(clienteExistente = null) {
    const isEdicao = !!clienteExistente;
    const cli = clienteExistente || {
      nome: '',
      telefone: '',
      bairro: '',
      tag: 'novo',
      preferencias: '',
      pontosFidelidade: 0,
      anotacoes: '',
    };

    abrirModal({
      titulo: isEdicao ? `Editar: ${cli.nome}` : 'Cadastrar Novo Cliente 👤',
      html: `
        <div class="form-modal-cliente">
          <div class="campo">
            <label>Nome Completo do Cliente: *</label>
            <input type="text" id="cli-nome" class="input" placeholder="Ex: Maria das Graças" value="${cli.nome}" autofocus />
          </div>

          <div class="linha-dupla" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="campo">
              <label>WhatsApp / Celular: *</label>
              <input type="text" id="cli-telefone" class="input" placeholder="Ex: (11) 98888-7777" value="${cli.telefone}" />
            </div>
            <div class="campo">
              <label>Bairro / Região:</label>
              <input type="text" id="cli-bairro" class="input" placeholder="Ex: Jardim Paulista" value="${cli.bairro}" />
            </div>
          </div>

          <div class="campo" style="margin-top: 10px;">
            <label>Perfil do Cliente:</label>
            <select id="cli-tag" class="select">
              <option value="novo" ${cli.tag === 'novo' ? 'selected' : ''}>🎉 Novo Cliente</option>
              <option value="frequente" ${cli.tag === 'frequente' ? 'selected' : ''}>🔥 Frequente (Compra aos domingos)</option>
              <option value="vip" ${cli.tag === 'vip' ? 'selected' : ''}>⭐ VIP (Cliente prioritário)</option>
            </select>
          </div>

          <div class="campo" style="margin-top: 10px;">
            <label>🍗 Preferências do Assado (para a cozinha e assador):</label>
            <textarea id="cli-preferencias" class="input" rows="2" placeholder="Ex: Gosta de frango bem tostado/dourado. Cortar em 4 partes.">${cli.preferencias}</textarea>
          </div>

          <div class="campo" style="margin-top: 10px;">
            <label>Selos de Fidelidade Atuais (0 a 10):</label>
            <input type="number" id="cli-selos" class="input" min="0" max="10" value="${cli.pontosFidelidade || 0}" />
          </div>

          <div class="campo" style="margin-top: 10px;">
            <label>Anotações Gerais (Internas):</label>
            <input type="text" id="cli-anotacoes" class="input" placeholder="Ex: Prefere pagar no Pix na retirada." value="${cli.anotacoes || ''}" />
          </div>

          <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            ${isEdicao ? `<button class="btn btn-texto btn-perigo-suave" id="btn-excluir-cliente" style="color: var(--vermelho);">${icone('lixeira')} Excluir</button>` : '<span></span>'}
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-contorno" id="btn-cancelar-cli">Cancelar</button>
              <button class="btn btn-primario" id="btn-salvar-cli">${isEdicao ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
            </div>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-cli').onclick = fechar;

        el.querySelector('#btn-salvar-cli').onclick = () => {
          const nome = el.querySelector('#cli-nome').value.trim();
          const telefone = el.querySelector('#cli-telefone').value.trim();
          const bairro = el.querySelector('#cli-bairro').value.trim();
          const tag = el.querySelector('#cli-tag').value;
          const preferencias = el.querySelector('#cli-preferencias').value.trim();
          const pontosFidelidade = parseInt(el.querySelector('#cli-selos').value, 10) || 0;
          const anotacoes = el.querySelector('#cli-anotacoes').value.trim();

          if (!nome) {
            toast('Por favor, informe o nome do cliente.', 'erro');
            return;
          }

          if (isEdicao) {
            store.atualizarCliente(clienteExistente.id, {
              nome, telefone, bairro, tag, preferencias, pontosFidelidade, anotacoes
            });
            toast('Dados do cliente atualizados com sucesso!', 'sucesso');
          } else {
            store.adicionarCliente({
              nome, telefone, bairro, tag, preferencias, pontosFidelidade, anotacoes
            });
            toast('Cliente cadastrado com sucesso no Ao Ponto!', 'sucesso');
          }

          fechar();
          desenhar();
        };

        if (isEdicao) {
          el.querySelector('#btn-excluir-cliente')?.addEventListener('click', () => {
            if (confirm(`Tem certeza que deseja remover o cadastro de ${cli.nome}?`)) {
              store.removerCliente(clienteExistente.id);
              toast('Cliente removido.', 'info');
              fechar();
              desenhar();
            }
          });
        }
      }
    });
  }

  // Modal 2: WhatsApp Inteligente com Templates
  function abrirModalWhatsAppCliente(cli) {
    const selos = cli.pontosFidelidade || 0;
    const nomeLimpo = (cli.nome || '').split(' ')[0];

    const nomeLoja = store.getWhatsapp()?.config?.nomeEstabelecimento || 'Ao Ponto Assados';
    const templates = [
      {
        titulo: 'Lembrete de Reserva de Domingo',
        texto: `*${nomeLoja}*\nOlá ${nomeLimpo}! Tudo bem? Passando para te lembrar de reservar o seu frango assado e acompanhamentos para o almoço de domingo aqui no ${nomeLoja}. Quer que eu já separe o seu antes que esgote?`
      },
      {
        titulo: 'Encomenda Pronta para Retirada',
        texto: `*${nomeLoja}*\nOlá ${nomeLimpo}! O seu pedido acabou de sair do forno e está quentinho na estufa, pronto para retirada aqui no balcão do ${nomeLoja}. Pode vir buscar quando quiser!`
      },
      {
        titulo: 'Saldo de Selos do Clube do Frango',
        texto: `*${nomeLoja}*\nOlá ${nomeLimpo}! Você já tem ${selos} de 10 selos no Clube do Frango do ${nomeLoja}. ${selos >= 10 ? 'Você já ganhou 1 frango assado de cortesia! Pode vir retirar!' : `Faltam apenas ${10 - selos} selos para você ganhar um frango assado grátis!`}`
      }
    ];

    abrirModal({
      titulo: `Conversar com ${cli.nome} 💬`,
      html: `
        <div class="modal-whats-container">
          <p style="color: var(--texto-suave); font-size: 14px; margin-bottom: 14px;">
            Escolha uma mensagem rápida pronta ou personalize o texto para enviar no WhatsApp:
          </p>

          <div class="whats-templates-lista">
            ${templates.map((t, idx) => `
              <div class="whats-template-item ${idx === 0 ? 'selecionado' : ''}" data-idx="${idx}">
                <strong>${t.titulo}</strong>
                <p>${t.texto}</p>
              </div>
            `).join('')}
          </div>

          <div class="campo" style="margin-top: 14px;">
            <label>Mensagem que será enviada:</label>
            <textarea id="whats-msg-final" class="input" rows="3">${templates[0].texto}</textarea>
          </div>

          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-cancelar-whats">Fechar</button>
            <button class="btn btn-whatsapp" id="btn-enviar-whats">
              ${icone('whatsapp')} Abrir no WhatsApp ↗
            </button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-whats').onclick = fechar;

        const areaTexto = el.querySelector('#whats-msg-final');
        const items = el.querySelectorAll('.whats-template-item');

        items.forEach((item) => {
          item.addEventListener('click', () => {
            items.forEach((it) => it.classList.remove('selecionado'));
            item.classList.add('selecionado');
            const idx = parseInt(item.dataset.idx, 10);
            areaTexto.value = templates[idx].texto;
          });
        });

        el.querySelector('#btn-enviar-whats').onclick = () => {
          const msg = areaTexto.value.trim();
          const tel = (cli.telefone || '').replace(/\D/g, '');
          const telFinal = tel.length <= 11 ? `55${tel}` : tel;

          const url = `https://wa.me/${telFinal}?text=${encodeURIComponent(msg)}`;
          window.open(url, '_blank');
          fechar();
        };
      }
    });
  }

  // Modal 3: Histórico de Compras e Reservas do Cliente
  function abrirModalHistoricoCliente(cli) {
    const nomeBusca = (cli.nome || '').toLowerCase().trim();
    const vendas = store.getVendas().filter((v) => (v.cliente || '').toLowerCase().trim() === nomeBusca);
    const pedidos = store.getPedidos().filter((p) => (p.cliente || '').toLowerCase().trim() === nomeBusca);

    abrirModal({
      titulo: `Histórico de Compras: ${cli.nome} 📋`,
      html: `
        <div class="modal-historico-cliente">
          <div class="resumo-topo-historico">
            <div>
              <small>Total em Compras</small>
              <strong>${fmtMoeda(cli.totalGasto || 0)}</strong>
            </div>
            <div>
              <small>Total de Pedidos</small>
              <strong>${cli.totalPedidos || 0}</strong>
            </div>
            <div>
              <small>Clube do Frango</small>
              <strong>${cli.pontosFidelidade || 0}/10 selos</strong>
            </div>
          </div>

          <h3 style="font-size: 15px; margin: 16px 0 8px;">Reservas Recentes de Domingo</h3>
          ${pedidos.length === 0 ? `
            <p style="color: var(--texto-suave); font-size: 13px;">Nenhuma reserva registrada recentemente para este cliente.</p>
          ` : `
            <div class="historico-lista">
              ${pedidos.map((p) => `
                <div class="hist-item">
                  <div class="hist-item-topo">
                    <strong>Reserva #${p.id} &bull; ${p.data === 'hoje' ? 'Hoje' : p.data} às ${p.hora}</strong>
                    <span class="badge badge-demo">${p.status}</span>
                  </div>
                  <div class="hist-itens-desc">
                    ${(p.itens || []).map(i => `${i.qtd}x ${i.nome}`).join(', ')}
                  </div>
                  <div class="hist-total">Total: ${fmtMoeda(p.total)}</div>
                </div>
              `).join('')}
            </div>
          `}

          <h3 style="font-size: 15px; margin: 16px 0 8px;">Vendas Realizadas no Balcão (PDV)</h3>
          ${vendas.length === 0 ? `
            <p style="color: var(--texto-suave); font-size: 13px;">Nenhuma venda avulsa recente registrada no PDV.</p>
          ` : `
            <div class="historico-lista">
              ${vendas.map((v) => `
                <div class="hist-item">
                  <div class="hist-item-topo">
                    <strong>Venda ${v.id} &bull; Hoje às ${v.hora}</strong>
                    <span class="badge badge-demo">${v.metodo}</span>
                  </div>
                  <div class="hist-itens-desc">${v.itensTexto || 'Assados & Acompanhamentos'}</div>
                  <div class="hist-total">Total: ${fmtMoeda(v.total)}</div>
                </div>
              `).join('')}
            </div>
          `}

          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end;">
            <button class="btn btn-primario" data-fechar>Fechar</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
      }
    });
  }

  // Modal 4: Regras do Clube do Frango
  function abrirModalRegrasClube() {
    abrirModal({
      titulo: 'Como funciona o Clube do Frango? 🍗✨',
      html: `
        <div class="modal-regras-clube" style="display: flex; flex-direction: column; gap: 14px; font-size: 14px;">
          <div style="background: var(--creme); padding: 14px; border-radius: 12px; border: 1px solid var(--borda);">
            <strong style="color: var(--brasa); font-size: 16px; display: block; margin-bottom: 6px;">
              Programa de Selos de Fidelidade
            </strong>
            <p style="margin: 0; color: var(--texto-suave);">
              Fidelize seus clientes do almoço de domingo! A cada compra de frango assado (inteiro ou meio frango), o cliente ganha selos na cartela.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="font-size: 20px;">🍗</span>
              <div>
                <strong>1 Frango Inteiro = 1 Selo</strong>
                <p style="margin: 2px 0 0; color: var(--texto-suave); font-size: 13px;">Computado automaticamente ao finalizar vendas no PDV ou retirar encomendas.</p>
              </div>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="font-size: 20px;">🎁</span>
              <div>
                <strong>10 Selos = 1 Frango Assado Grátis</strong>
                <p style="margin: 2px 0 0; color: var(--texto-suave); font-size: 13px;">O cliente atinge a cartela premiada e o botão de resgate é liberado para zerar os 10 selos.</p>
              </div>
            </div>

            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="font-size: 20px;">💬</span>
              <div>
                <strong>Notificação por WhatsApp em 1 clique</strong>
                <p style="margin: 2px 0 0; color: var(--texto-suave); font-size: 13px;">Envie o extrato de selos ou lembrete de reserva do almoço de domingo direto para o WhatsApp do cliente.</p>
              </div>
            </div>
          </div>

          <div class="modal-botoes" style="margin-top: 14px; display: flex; justify-content: flex-end;">
            <button class="btn btn-primario" data-fechar>Entendido</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
      }
    });
  }

  desenhar();
}

