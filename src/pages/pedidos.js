/**
 * TELA DE PEDIDOS & RESERVAS
 * Gerenciamento de encomendas antecipadas (especialmente finais de semana).
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PRODUTOS, STATUS_PEDIDO, PONTOS } from '../data/mock.js';
import { fmtMoeda, fmtKg } from '../utils/format.js';
import { salvarPedidoNoBanco } from '../services/api.js';
import { executarComIdempotencia, gerarIdempotencyKey } from '../utils/idempotencia.js';

let filtroStatus = 'todos';
let filtroData = 'hoje';
let buscaTexto = '';

export function renderPedidos(raiz, irPara) {
  const st = store.get(), perfil = store.perfil();
  const nomePonto = st.ponto === 'todos' 
    ? (perfil.pontos.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos[0]).nome) 
    : PONTOS.find((p) => p.id === st.ponto)?.nome;

  function desenhar() {
    const todosPedidos = store.getPedidos();

    // Filtros
    let lista = todosPedidos;
    if (filtroStatus !== 'todos') {
      lista = lista.filter((p) => p.status === filtroStatus);
    }
    if (filtroData !== 'todas') {
      lista = lista.filter((p) => p.data === filtroData);
    }
    if (buscaTexto.trim()) {
      const q = buscaTexto.toLowerCase().trim();
      lista = lista.filter((p) => 
        p.cliente.toLowerCase().includes(q) || 
        p.telefone.includes(q) || 
        String(p.id).includes(q)
      );
    }

    const contagemPorStatus = {
      todos: todosPedidos.length,
      aguardando: todosPedidos.filter((p) => p.status === 'aguardando').length,
      confirmado: todosPedidos.filter((p) => p.status === 'confirmado').length,
      preparo: todosPedidos.filter((p) => p.status === 'preparo').length,
      pronto: todosPedidos.filter((p) => p.status === 'pronto').length,
      entregue: todosPedidos.filter((p) => p.status === 'entregue').length,
    };

    raiz.innerHTML = `
    <div class="pedidos-container">
      <div class="pedidos-topo">
        <div class="pedidos-topo-info">
          <h1>Pedidos &bull; Reservas de Assados 📅</h1>
          <p><span class="badge badge-demo">${icone('local', 'mini')} ${nomePonto}</span> &bull; Encomendas programadas para retirada</p>
        </div>
        <div class="pedidos-topo-acoes">
          <button class="btn btn-primario" id="btn-nova-reserva">${icone('mais')} Nova Reserva</button>
          <button class="btn btn-contorno" id="btn-ir-pdv">${icone('vendas')} Abrir Caixa PDV</button>
          <button class="btn btn-contorno" id="btn-ir-clientes">${icone('clientes')} Clientes & Fidelidade</button>
        </div>
      </div>

      <!-- Resumo Rápido em Cards -->
      <div class="pedidos-kpi-grade">
        <div class="kpi-mini" data-status-click="todos">
          <span class="km-rotulo">Total de Pedidos</span>
          <strong class="km-val">${contagemPorStatus.todos}</strong>
        </div>
        <div class="kpi-mini ambar" data-status-click="aguardando">
          <span class="km-rotulo">Aguardando</span>
          <strong class="km-val">${contagemPorStatus.aguardando}</strong>
        </div>
        <div class="kpi-mini azul" data-status-click="confirmado">
          <span class="km-rotulo">Confirmados</span>
          <strong class="km-val">${contagemPorStatus.confirmado}</strong>
        </div>
        <div class="kpi-mini brasa" data-status-click="preparo">
          <span class="km-rotulo">🔥 No Espeto (Preparo)</span>
          <strong class="km-val">${contagemPorStatus.preparo}</strong>
        </div>
        <div class="kpi-mini roxo" data-status-click="pronto">
          <span class="km-rotulo">🍗 Pronto p/ Retirada</span>
          <strong class="km-val">${contagemPorStatus.pronto}</strong>
        </div>
      </div>

      <!-- Filtros e Busca -->
      <div class="pedidos-barra-filtros">
        <div class="campo-caixa busca-box">
          <span class="busca-ic">${icone('busca')}</span>
          <input type="text" id="input-busca-pedidos" class="input" placeholder="Buscar por cliente, WhatsApp ou #ID..." value="${buscaTexto}" />
        </div>

        <div class="filtros-datas">
          <button class="chip ${filtroData === 'hoje' ? 'ativo' : ''}" data-data="hoje">Hoje</button>
          <button class="chip ${filtroData === 'amanha' ? 'ativo' : ''}" data-data="amanha">Amanhã</button>
          <button class="chip ${filtroData === 'domingo' ? 'ativo' : ''}" data-data="domingo">Domingo</button>
          <button class="chip ${filtroData === 'todas' ? 'ativo' : ''}" data-data="todas">Todas as datas</button>
        </div>
      </div>

      <!-- Abas de Status -->
      <div class="chips pedidos-status-abas">
        <button class="chip ${filtroStatus === 'todos' ? 'ativo' : ''}" data-status="todos">Todos (${contagemPorStatus.todos})</button>
        <button class="chip ${filtroStatus === 'aguardando' ? 'ativo' : ''}" data-status="aguardando">Aguardando (${contagemPorStatus.aguardando})</button>
        <button class="chip ${filtroStatus === 'confirmado' ? 'ativo' : ''}" data-status="confirmado">Confirmados (${contagemPorStatus.confirmado})</button>
        <button class="chip ${filtroStatus === 'preparo' ? 'ativo' : ''}" data-status="preparo">No Espeto (${contagemPorStatus.preparo})</button>
        <button class="chip ${filtroStatus === 'pronto' ? 'ativo' : ''}" data-status="pronto">Prontos (${contagemPorStatus.pronto})</button>
        <button class="chip ${filtroStatus === 'entregue' ? 'ativo' : ''}" data-status="entregue">Entregues (${contagemPorStatus.entregue})</button>
      </div>

      <!-- Lista de Pedidos -->
      <div class="pedidos-lista">
        ${lista.length === 0 ? `
          <div class="pedidos-vazio">
            <div class="pedidos-vazio-ic">${icone('calendario')}</div>
            <h3>Nenhum pedido encontrado</h3>
            <p>Não há reservas correspondentes aos filtros selecionados.</p>
            <button class="btn btn-primario" id="btn-vazio-novo">${icone('mais')} Fazer Nova Reserva</button>
          </div>
        ` : lista.map((p) => {
          const stInfo = STATUS_PEDIDO.find((s) => s.id === p.status) || STATUS_PEDIDO[0];
          const isPago = p.pagamento?.status === 'pago';
          const horaFmt = `${p.hora}h`;
          const dataFmt = p.data === 'hoje' ? 'Hoje' : p.data === 'amanha' ? 'Amanhã' : 'Domingo';

          return `
          <div class="pedido-card ${p.status}">
            <div class="pedido-card-topo">
              <div class="pedido-id-linha">
                <span class="pedido-id">#${p.id}</span>
                <span class="pedido-data-badge">${dataFmt} &bull; ${horaFmt}</span>
                <span class="badge-status-ped" style="background:${stInfo.cor}; color:#333;">
                  ${stInfo.emoji} ${stInfo.nome}
                </span>
              </div>
              <div class="pedido-valor-topo">
                <strong>${fmtMoeda(p.total)}</strong>
                <span class="badge ${isPago ? 'badge-pago' : 'badge-pendente'}">
                  ${isPago ? '✓ Pago' : 'Pagar na retirada'}
                </span>
              </div>
            </div>

            <div class="pedido-corpo">
              <div class="pedido-cliente-dados">
                <div class="p-cliente-nome">
                  <strong>${p.cliente}</strong>
                  <span class="p-cliente-tel">${icone('telefone', 'mini')} ${p.telefone}</span>
                </div>
                <div class="p-cliente-acoes">
                  <a href="https://wa.me/55${p.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`*${store.getWhatsapp()?.config?.nomeEstabelecimento || 'Ao Ponto Assados'}*\nOlá *${p.cliente}*! Sobre sua reserva (#${p.id}): seu pedido de frango assado para ${dataFmt} às ${p.hora}h está confirmado.`)}" target="_blank" class="btn btn-whatsapp btn-sm">
                    ${icone('whatsapp')} WhatsApp
                  </a>
                </div>
              </div>

              <div class="pedido-itens-resumo">
                <ul class="itens-ped-lista">
                  ${p.itens.map((it) => `
                    <li>
                      <span>${it.qtd}x ${it.nome} ${it.pesoKg ? `(${fmtKg(it.pesoKg)})` : ''}</span>
                      <small>${fmtMoeda(it.precoUnit * it.qtd)}</small>
                      ${it.obs ? `<div class="item-obs-nota">Obs: ${it.obs}</div>` : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>

            <div class="pedido-rodape-acoes">
              <div class="fluxo-botoes">
                ${p.status === 'aguardando' ? `
                  <button class="btn btn-primario btn-sm" data-avancar="${p.id}" data-novo-status="confirmado">
                    ${icone('check')} Confirmar Reserva
                  </button>
                ` : ''}

                ${p.status === 'confirmado' ? `
                  <button class="btn btn-escuro btn-sm" data-avancar="${p.id}" data-novo-status="preparo">
                    🔥 Colocar no Espeto
                  </button>
                ` : ''}

                ${p.status === 'preparo' ? `
                  <button class="btn btn-primario btn-sm" data-avancar="${p.id}" data-novo-status="pronto">
                    🍗 Pronto na Estufa
                  </button>
                ` : ''}

                ${p.status === 'pronto' ? `
                  <button class="btn btn-sucesso btn-sm" data-avancar="${p.id}" data-novo-status="entregue">
                    ${icone('check')} Entregar / Finalizar
                  </button>
                ` : ''}

                ${p.status !== 'entregue' && p.status !== 'cancelado' ? `
                  <button class="btn btn-texto btn-sm btn-cancelar" data-cancelar="${p.id}">
                    Cancelar
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    `;

    ligarEventos();
  }

  function ligarEventos() {
    raiz.querySelector('#btn-nova-reserva')?.addEventListener('click', abrirModalNovaReserva);
    raiz.querySelector('#btn-vazio-novo')?.addEventListener('click', abrirModalNovaReserva);
    raiz.querySelector('#btn-ir-pdv')?.addEventListener('click', () => irPara('vendas'));
    raiz.querySelector('#btn-ir-clientes')?.addEventListener('click', () => irPara('clientes'));

    // Busca
    const inputBusca = raiz.querySelector('#input-busca-pedidos');
    inputBusca?.addEventListener('input', (e) => {
      buscaTexto = e.target.value;
      desenhar();
      // Manter foco
      const novoInput = raiz.querySelector('#input-busca-pedidos');
      if (novoInput) {
        novoInput.focus();
        novoInput.setSelectionRange(novoInput.value.length, novoInput.value.length);
      }
    });

    // Filtros de Data
    raiz.querySelectorAll('[data-data]').forEach((b) => {
      b.addEventListener('click', () => {
        filtroData = b.dataset.data;
        desenhar();
      });
    });

    // Filtros de Status
    raiz.querySelectorAll('[data-status]').forEach((b) => {
      b.addEventListener('click', () => {
        filtroStatus = b.dataset.status;
        desenhar();
      });
    });

    raiz.querySelectorAll('[data-status-click]').forEach((card) => {
      card.addEventListener('click', () => {
        filtroStatus = card.dataset.statusClick;
        desenhar();
      });
    });

    // Avançar status
    raiz.querySelectorAll('[data-avancar]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.avancar);
        const novoStatus = b.dataset.novoStatus;
        store.atualizarStatusPedido(id, novoStatus);
        toast(`Pedido #${id} atualizado para ${novoStatus.toUpperCase()}!`, 'sucesso');
        desenhar();
      });
    });

    // Cancelar
    raiz.querySelectorAll('[data-cancelar]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = Number(b.dataset.cancelar);
        if (confirm(`Deseja realmente cancelar a reserva #${id}?`)) {
          store.atualizarStatusPedido(id, 'cancelado');
          toast(`Pedido #${id} cancelado.`, 'info');
          desenhar();
        }
      });
    });
  }

  function abrirModalNovaReserva() {
    let itensSelecionados = PRODUTOS.map((p) => ({
      produtoId: p.id,
      nome: p.nome,
      preco: p.preco || p.precoKg,
      forma: p.forma,
      qtd: p.id === 'inteiro' ? 1 : 0,
      obs: '',
    }));

    const todosClientes = store.getClientes();

    abrirModal(`
      <h2>Nova Reserva / Encomenda 🍗</h2>
      <p>Cadastre uma reserva antecipada para retirada.</p>

      <div class="campo">
        <label for="nr-cliente">Nome do Cliente *</label>
        <input type="text" id="nr-cliente" class="input" list="nr-clientes-sugestoes" placeholder="Ex: Roberto Carlos" required />
        <datalist id="nr-clientes-sugestoes">
          ${todosClientes.map((c) => `<option value="${c.nome}">${c.telefone ? `${c.telefone} • ` : ''}${c.preferencias || ''}</option>`).join('')}
        </datalist>
      </div>

      <div class="campo">
        <label for="nr-telefone">WhatsApp para aviso *</label>
        <input type="tel" id="nr-telefone" class="input" placeholder="Ex: 11988887777" required />
      </div>

      <div class="grade-2-colunas">
        <div class="campo">
          <label for="nr-data">Data de Retirada</label>
          <select id="nr-data" class="select">
            <option value="hoje">Hoje</option>
            <option value="amanha">Amanhã</option>
            <option value="domingo" selected>Domingo</option>
          </select>
        </div>

        <div class="campo">
          <label for="nr-hora">Horário de Retirada</label>
          <select id="nr-hora" class="select">
            <option value="11:00">11:00h</option>
            <option value="11:30">11:30h</option>
            <option value="12:00" selected>12:00h (Pico Almoço)</option>
            <option value="12:30">12:30h (Pico Almoço)</option>
            <option value="13:00">13:00h</option>
            <option value="13:30">13:30h</option>
            <option value="14:00">14:00h</option>
          </select>
        </div>
      </div>

      <div class="campo">
        <label>Itens Encomendados</label>
        <div class="nr-produtos-lista">
          ${itensSelecionados.map((it, idx) => `
            <div class="nr-prod-linha">
              <span>${it.nome} (${fmtMoeda(it.preco)})</span>
              <div class="qtd-controles">
                <button type="button" class="btn-qtd" data-nr-menos="${idx}">${icone('menos')}</button>
                <span class="qtd-val" id="nr-val-${idx}">${it.qtd}</span>
                <button type="button" class="btn-qtd" data-nr-mais="${idx}">${icone('mais')}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="campo">
        <label for="nr-obs">Observação do Preparo (opcional):</label>
        <input type="text" id="nr-obs" class="input" placeholder="Ex: Cortar em 4 pedaços, farofa extra" />
      </div>

      <div class="campo">
        <label for="nr-pagamento">Status do Pagamento</label>
        <select id="nr-pagamento" class="select">
          <option value="retirada">Pendente (Pagar na Retirada)</option>
          <option value="pix">Pago Antecipado (Pix)</option>
        </select>
      </div>

      <div class="modal-acoes">
        <button class="btn btn-primario btn-bloco" id="btn-salvar-reserva">
          ${icone('ok')} Confirmar e Salvar Reserva
        </button>
        <button class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
      </div>
    `, (modal, fechar) => {
      const inpCli = modal.querySelector('#nr-cliente');
      const inpTel = modal.querySelector('#nr-telefone');
      const inpObs = modal.querySelector('#nr-obs');

      inpCli?.addEventListener('input', () => {
        const match = todosClientes.find(
          (c) => c.nome.toLowerCase().trim() === inpCli.value.toLowerCase().trim()
        );
        if (match) {
          if (match.telefone) inpTel.value = match.telefone;
          if (match.preferencias && !inpObs.value) inpObs.value = match.preferencias;
        }
      });

      modal.querySelectorAll('[data-nr-mais]').forEach((b) => {
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.nrMais);
          itensSelecionados[idx].qtd += 1;
          modal.querySelector(`#nr-val-${idx}`).textContent = itensSelecionados[idx].qtd;
        });
      });

      modal.querySelectorAll('[data-nr-menos]').forEach((b) => {
        b.addEventListener('click', () => {
          const idx = Number(b.dataset.nrMenos);
          if (itensSelecionados[idx].qtd > 0) {
            itensSelecionados[idx].qtd -= 1;
            modal.querySelector(`#nr-val-${idx}`).textContent = itensSelecionados[idx].qtd;
          }
        });
      });

      let processandoReserva = false;
      modal.querySelector('#btn-salvar-reserva').addEventListener('click', async () => {
        if (processandoReserva) return;
        const btnSalvar = modal.querySelector('#btn-salvar-reserva');
        const cliente = modal.querySelector('#nr-cliente').value.trim();
        const telefone = modal.querySelector('#nr-telefone').value.trim();
        const data = modal.querySelector('#nr-data').value;
        const hora = modal.querySelector('#nr-hora').value;
        const obsGeral = modal.querySelector('#nr-obs').value.trim();
        const pagMetodo = modal.querySelector('#nr-pagamento').value;

        if (!cliente) return toast('Informe o nome do cliente.', 'erro');
        if (!telefone) return toast('Informe o WhatsApp do cliente.', 'erro');

        const itensAtivos = itensSelecionados.filter((it) => it.qtd > 0).map((it) => ({
          produtoId: it.produtoId,
          nome: it.nome,
          qtd: it.qtd,
          precoUnit: it.preco,
          obs: obsGeral,
        }));

        if (itensAtivos.length === 0) return toast('Selecione ao menos 1 item para a reserva.', 'erro');

        const total = itensAtivos.reduce((acc, it) => acc + (it.qtd * it.precoUnit), 0);
        const assinaturaPedido = `pedido_${cliente}_${telefone.replace(/\D/g, '')}_${data}_${hora}_${total.toFixed(2)}`;

        try {
          await executarComIdempotencia(assinaturaPedido, async () => {
            processandoReserva = true;
            if (btnSalvar) {
              btnSalvar.disabled = true;
              btnSalvar.innerHTML = `<span class="spinner"></span> Salvando Reserva...`;
            }

            const idempotencyKey = gerarIdempotencyKey('pedido');

            store.adicionarPedido({
              cliente,
              telefone,
              ponto: st.ponto === 'todos' ? 'centro' : st.ponto,
              data,
              hora,
              itens: itensAtivos,
              total,
              status: 'confirmado',
              idempotencyKey,
              pagamento: {
                status: pagMetodo === 'pix' ? 'pago' : 'pendente',
                metodo: pagMetodo,
              },
            });

            const tenantAtivo = store.getTenant();
            salvarPedidoNoBanco(tenantAtivo?.id, {
              idempotencyKey,
              cliente,
              telefone,
              data,
              hora,
              total,
              status: 'confirmado',
              itens: itensAtivos,
            }).catch((err) => console.warn('Supabase sync pedido:', err));

            toast(`Reserva de ${cliente} confirmada para ${data} às ${hora}h!`, 'sucesso');
            processandoReserva = false;
            fechar();
            desenhar();
          });
        } catch (err) {
          processandoReserva = false;
          if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = `${icone('ok')} Confirmar e Salvar Reserva`;
          }
          if (err.message && err.message.includes('processamento')) {
            toast('Esta reserva já está sendo processada!', 'info');
          } else {
            toast(err.message || 'Erro ao salvar reserva', 'erro');
          }
        }
      });
    });
  }

  desenhar();
}
