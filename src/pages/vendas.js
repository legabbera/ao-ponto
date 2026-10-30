/**
 * TELA DE VENDAS (PDV / CAIXA RÁPIDO)
 * Registro ágil de vendas balcão e encomendas para viagem.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PRODUTOS, CATEGORIAS, PONTOS } from '../data/mock.js';
import { fmtMoeda, fmtKg } from '../utils/format.js';
import { exibirModalLimite } from '../components/limite-modal.js';
import { registrarVendaTenant } from '../data/tenants.js';
import { registrarVenda as registrarVendaApi } from '../services/api.js';

let carrinho = [];
let categoriaAtiva = 'todos';
let metodoPagamento = 'pix';
let valorRecebido = 0;
let clienteNome = '';
let clienteTelefone = '';

export function renderVendas(raiz, irPara) {
  const st = store.get(), perfil = store.perfil();
  const nomePonto = st.ponto === 'todos' 
    ? (perfil.pontos.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos[0]).nome) 
    : PONTOS.find((p) => p.id === st.ponto)?.nome;

  function desenhar() {
    const produtosFiltrados = categoriaAtiva === 'todos'
      ? PRODUTOS
      : PRODUTOS.filter((p) => p.categoria === categoriaAtiva);

    const subtotal = carrinho.reduce((acc, it) => acc + it.total, 0);
    const totalItens = carrinho.reduce((acc, it) => acc + (it.forma === 'peso' ? 1 : it.qtd), 0);
    const troco = Math.max(0, valorRecebido - subtotal);
    const vendasRecentes = store.getVendas();

    raiz.innerHTML = `
    <div class="pdv-container">
      <div class="pdv-topo">
        <div class="pdv-topo-info">
          <h1>PDV &bull; Caixa Rápido 🍗</h1>
          <p><span class="badge badge-demo">${icone('local', 'mini')} ${nomePonto}</span> &bull; Registro e fechamento ágil de vendas</p>
        </div>
        <div class="pdv-topo-acoes">
          <button class="btn btn-contorno" id="btn-ir-pedidos">${icone('calendario')} Encomendas / Reservas</button>
        </div>
      </div>

      <div class="pdv-layout">
        <div class="pdv-catalogo">
          <div class="chips pdv-categorias" role="tablist">
            ${CATEGORIAS.map((cat) => `
              <button class="chip ${categoriaAtiva === cat.id ? 'ativo' : ''}" data-cat="${cat.id}">
                ${cat.nome}
              </button>
            `).join('')}
          </div>

          <div class="pdv-grade-produtos">
            ${produtosFiltrados.map((prod) => `
              <div class="produto-card">
                <div class="prod-emoji">${prod.emoji}</div>
                <div class="prod-detalhes">
                  <strong class="prod-nome">${prod.nome}</strong>
                  <span class="prod-desc">${prod.desc}</span>
                  <div class="prod-preco-linha">
                    <span class="prod-preco">
                      ${prod.forma === 'peso' ? `${fmtMoeda(prod.precoKg)} <small>/kg</small>` : fmtMoeda(prod.preco)}
                    </span>
                    <button class="btn btn-primario btn-add-prod" data-id="${prod.id}">
                      ${icone('mais')} Adicionar
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="card pdv-historico">
            <div class="card-cabecalho">
              <div>
                <strong class="card-titulo">Vendas Recentes do Dia</strong>
                <div class="card-sub">Histórico das últimas vendas registradas no caixa</div>
              </div>
              <span class="badge">${vendasRecentes.length} vendas</span>
            </div>
            <div class="vendas-lista">
              ${vendasRecentes.slice(0, 6).map((v) => `
                <div class="venda-linha">
                  <div class="venda-info">
                    <strong>${v.id} &bull; ${v.hora}</strong>
                    <span>${v.itensTexto} &bull; <small>${v.cliente || 'Balcão'}</small></span>
                  </div>
                  <div class="venda-total">
                    <strong>${fmtMoeda(v.total)}</strong>
                    <span class="venda-metodo">${v.metodo.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="pdv-carrinho-painel">
          <div class="card pdv-carrinho">
            <div class="card-cabecalho">
              <div>
                <strong class="card-titulo">Pedido Atual</strong>
                <div class="card-sub">${totalItens} ${totalItens === 1 ? 'item' : 'itens'} no carrinho</div>
              </div>
              ${carrinho.length > 0 ? `<button class="btn btn-fantasma" id="btn-limpar-carrinho">${icone('lixeira')} Limpar</button>` : ''}
            </div>

            <div class="carrinho-itens">
              ${carrinho.length === 0 ? `
                <div class="carrinho-vazio">
                  <div class="carrinho-vazio-ic">${icone('vendas')}</div>
                  <p>Carrinho vazio</p>
                  <small>Clique em <strong>+ Adicionar</strong> em qualquer item ao lado.</small>
                </div>
              ` : carrinho.map((it, idx) => `
                <div class="item-carrinho">
                  <div class="item-cabecalho">
                    <span class="item-nome">${it.emoji} ${it.nome}</span>
                    <span class="item-total">${fmtMoeda(it.total)}</span>
                  </div>
                  <div class="item-sub">
                    ${it.forma === 'peso' 
                      ? `<span>${fmtKg(it.pesoKg)} &times; ${fmtMoeda(it.precoKg)}/kg</span>` 
                      : `<span>${it.qtd} &times; ${fmtMoeda(it.precoUnit)}</span>`}
                    ${it.obs ? `<small class="item-obs-tag">Obs: ${it.obs}</small>` : ''}
                  </div>
                  <div class="item-controles">
                    ${it.forma === 'peso' ? `
                      <button class="btn btn-contorno btn-sm" data-editar-peso="${idx}">Alterar peso</button>
                    ` : `
                      <div class="qtd-controles">
                        <button class="btn-qtd" data-menos="${idx}">${icone('menos')}</button>
                        <span class="qtd-val">${it.qtd}</span>
                        <button class="btn-qtd" data-mais="${idx}">${icone('mais')}</button>
                      </div>
                    `}
                    <button class="btn-remover-item" data-remover="${idx}">${icone('lixeira')}</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="pdv-cliente-box">
              <input type="text" id="pdv-cliente-nome" class="input input-sm" placeholder="Nome do cliente (opcional)" value="${clienteNome}" />
              <input type="tel" id="pdv-cliente-tel" class="input input-sm" placeholder="WhatsApp (ex: 11999998888)" value="${clienteTelefone}" />
            </div>

            <div class="pdv-pagamento">
              <label class="pdv-label">Forma de Pagamento</label>
              <div class="pagamento-botoes">
                <button class="btn-pag ${metodoPagamento === 'pix' ? 'ativo' : ''}" data-pag="pix">⚡ Pix</button>
                <button class="btn-pag ${metodoPagamento === 'dinheiro' ? 'ativo' : ''}" data-pag="dinheiro">💵 Dinheiro</button>
                <button class="btn-pag ${metodoPagamento === 'cartao_debito' ? 'ativo' : ''}" data-pag="cartao_debito">💳 Débito</button>
                <button class="btn-pag ${metodoPagamento === 'cartao_credito' ? 'ativo' : ''}" data-pag="cartao_credito">💳 Crédito</button>
              </div>

              ${metodoPagamento === 'dinheiro' ? `
                <div class="detalhes-dinheiro">
                  <div class="dinheiro-linha">
                    <span>Valor recebido:</span>
                    <input type="number" step="1" id="input-dinheiro-recebido" value="${valorRecebido || subtotal}" class="input input-sm" style="max-width:110px" />
                  </div>
                  <div class="notas-rapidas">
                    <button class="chip chip-sm" data-nota="${subtotal}">Exato</button>
                    <button class="chip chip-sm" data-nota="20">R$ 20</button>
                    <button class="chip chip-sm" data-nota="50">R$ 50</button>
                    <button class="chip chip-sm" data-nota="100">R$ 100</button>
                    <button class="chip chip-sm" data-nota="200">R$ 200</button>
                  </div>
                  <div class="troco-linha ${troco > 0 ? 'tem-troco' : ''}">
                    <strong>Troco:</strong>
                    <strong>${fmtMoeda(troco)}</strong>
                  </div>
                </div>
              ` : ''}

              ${metodoPagamento === 'pix' ? `
                <div class="detalhes-pix">
                  <div class="pix-simulacao">
                    <div class="pix-qrcode-caixa">${icone('qrcode')}</div>
                    <div>
                      <strong>Chave Pix da Loja:</strong>
                      <code class="pix-chave">pix@frangoassado.com.br</code>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="pdv-totais">
              <div class="total-linha">
                <span>Subtotal:</span>
                <strong>${fmtMoeda(subtotal)}</strong>
              </div>
              <div class="total-linha destaque">
                <span>Total a Pagar:</span>
                <strong>${fmtMoeda(subtotal)}</strong>
              </div>
              <button class="btn btn-primario btn-bloco btn-finalizar" id="btn-finalizar-venda" ${carrinho.length === 0 ? 'disabled' : ''}>
                ${icone('ok')} Finalizar Venda (${fmtMoeda(subtotal)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    ligarEventos();
  }

  function ligarEventos() {
    raiz.querySelectorAll('[data-cat]').forEach((b) => {
      b.addEventListener('click', () => {
        categoriaAtiva = b.dataset.cat;
        desenhar();
      });
    });

    raiz.querySelector('#btn-ir-pedidos')?.addEventListener('click', () => irPara('pedidos'));

    raiz.querySelectorAll('.btn-add-prod').forEach((b) => {
      b.addEventListener('click', () => {
        const prod = PRODUTOS.find((p) => p.id === b.dataset.id);
        if (!prod) return;
        if (prod.forma === 'peso') {
          abrirModalPeso(prod);
        } else {
          adicionarAoCarrinho(prod, 1);
        }
      });
    });

    raiz.querySelector('#btn-limpar-carrinho')?.addEventListener('click', () => {
      carrinho = [];
      desenhar();
      toast('Carrinho limpo.', 'info');
    });

    raiz.querySelectorAll('[data-mais]').forEach((b) => {
      b.addEventListener('click', () => {
        const idx = Number(b.dataset.mais);
        carrinho[idx].qtd += 1;
        carrinho[idx].total = carrinho[idx].qtd * carrinho[idx].precoUnit;
        desenhar();
      });
    });

    raiz.querySelectorAll('[data-menos]').forEach((b) => {
      b.addEventListener('click', () => {
        const idx = Number(b.dataset.menos);
        if (carrinho[idx].qtd > 1) {
          carrinho[idx].qtd -= 1;
          carrinho[idx].total = carrinho[idx].qtd * carrinho[idx].precoUnit;
        } else {
          carrinho.splice(idx, 1);
        }
        desenhar();
      });
    });

    raiz.querySelectorAll('[data-remover]').forEach((b) => {
      b.addEventListener('click', () => {
        const idx = Number(b.dataset.remover);
        carrinho.splice(idx, 1);
        desenhar();
      });
    });

    raiz.querySelectorAll('[data-editar-peso]').forEach((b) => {
      b.addEventListener('click', () => {
        const idx = Number(b.dataset.editarPeso);
        const item = carrinho[idx];
        const prod = PRODUTOS.find((p) => p.id === item.id);
        if (prod) abrirModalPeso(prod, idx);
      });
    });

    const inputNome = raiz.querySelector('#pdv-cliente-nome');
    inputNome?.addEventListener('input', (e) => { clienteNome = e.target.value; });

    const inputTel = raiz.querySelector('#pdv-cliente-tel');
    inputTel?.addEventListener('input', (e) => { clienteTelefone = e.target.value; });

    raiz.querySelectorAll('[data-pag]').forEach((b) => {
      b.addEventListener('click', () => {
        metodoPagamento = b.dataset.pag;
        if (metodoPagamento === 'dinheiro' && (!valorRecebido || valorRecebido < carrinho.reduce((a, b) => a + b.total, 0))) {
          valorRecebido = carrinho.reduce((a, b) => a + b.total, 0);
        }
        desenhar();
      });
    });

    const inputDinheiro = raiz.querySelector('#input-dinheiro-recebido');
    inputDinheiro?.addEventListener('input', (e) => {
      valorRecebido = parseFloat(e.target.value) || 0;
      const subtotal = carrinho.reduce((acc, it) => acc + it.total, 0);
      const troco = Math.max(0, valorRecebido - subtotal);
      const trocoEl = raiz.querySelector('.troco-linha strong:last-child');
      if (trocoEl) trocoEl.textContent = fmtMoeda(troco);
    });

    raiz.querySelectorAll('[data-nota]').forEach((b) => {
      b.addEventListener('click', () => {
        valorRecebido = parseFloat(b.dataset.nota) || 0;
        desenhar();
      });
    });

    raiz.querySelector('#btn-finalizar-venda')?.addEventListener('click', finalizarVenda);
  }

  function adicionarAoCarrinho(prod, qtd = 1, pesoKg = null, obs = '') {
    if (prod.forma === 'peso') {
      const total = pesoKg * prod.precoKg;
      carrinho.push({
        id: prod.id,
        nome: prod.nome,
        emoji: prod.emoji,
        forma: 'peso',
        pesoKg,
        precoKg: prod.precoKg,
        total,
        obs,
      });
    } else {
      const existe = carrinho.find((it) => it.id === prod.id && it.obs === obs);
      if (existe) {
        existe.qtd += qtd;
        existe.total = existe.qtd * existe.precoUnit;
      } else {
        carrinho.push({
          id: prod.id,
          nome: prod.nome,
          emoji: prod.emoji,
          forma: prod.forma,
          qtd,
          precoUnit: prod.preco,
          total: qtd * prod.preco,
          obs,
        });
      }
    }
    toast(`${prod.nome} adicionado!`, 'sucesso');
    desenhar();
  }

  function abrirModalPeso(prod, editIdx = null) {
    let gramasAtual = editIdx !== null ? Math.round(carrinho[editIdx].pesoKg * 1000) : prod.gramasMedia;
    let obsAtual = editIdx !== null ? (carrinho[editIdx].obs || '') : '';

    abrirModal(`
      <h2>Pesar ${prod.nome} ${prod.emoji}</h2>
      <p>Preço: <strong>${fmtMoeda(prod.precoKg)} / kg</strong>. Digite o peso em gramas ou selecione:</p>
      
      <div class="peso-atalhos">
        ${[300, 400, 500, 600, 800, 1000].map((g) => `
          <button class="chip chip-peso ${gramasAtual === g ? 'ativo' : ''}" data-g="${g}">${g}g (${fmtKg(g / 1000)})</button>
        `).join('')}
      </div>

      <div class="campo" style="margin-top:14px">
        <label for="input-peso-gramas">Peso exato em gramas (g):</label>
        <div class="campo-caixa">
          <input type="number" id="input-peso-gramas" class="input" value="${gramasAtual}" min="50" max="5000" step="10" />
        </div>
      </div>

      <div class="campo">
        <label for="input-peso-obs">Observação do corte/preparo (opcional):</label>
        <input type="text" id="input-peso-obs" class="input" placeholder="Ex: fatiar fino, bem passado" value="${obsAtual}" />
      </div>

      <div class="peso-valor-destaque">
        <span>Valor calculado:</span>
        <strong id="peso-preco-calculado">${fmtMoeda((gramasAtual / 1000) * prod.precoKg)}</strong>
      </div>

      <div class="modal-acoes">
        <button class="btn btn-primario btn-bloco" id="btn-confirmar-peso">
          ${icone('ok')} ${editIdx !== null ? 'Atualizar Item' : 'Adicionar ao Pedido'}
        </button>
        <button class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
      </div>
    `, (modal, fechar) => {
      const inputG = modal.querySelector('#input-peso-gramas');
      const inputObs = modal.querySelector('#input-peso-obs');
      const displayTotal = modal.querySelector('#peso-preco-calculado');

      const atualizarPreco = () => {
        const g = parseFloat(inputG.value) || 0;
        displayTotal.textContent = fmtMoeda((g / 1000) * prod.precoKg);
      };

      inputG.addEventListener('input', atualizarPreco);

      modal.querySelectorAll('[data-g]').forEach((b) => {
        b.addEventListener('click', () => {
          inputG.value = b.dataset.g;
          modal.querySelectorAll('[data-g]').forEach((x) => x.classList.remove('ativo'));
          b.classList.add('ativo');
          atualizarPreco();
        });
      });

      modal.querySelector('#btn-confirmar-peso').addEventListener('click', () => {
        const g = parseFloat(inputG.value) || 0;
        if (g <= 0) return toast('Informe um peso válido.', 'erro');
        const pesoKg = g / 1000;
        const obs = inputObs.value.trim();

        if (editIdx !== null) {
          carrinho[editIdx].pesoKg = pesoKg;
          carrinho[editIdx].total = pesoKg * prod.precoKg;
          carrinho[editIdx].obs = obs;
          toast('Item atualizado!', 'sucesso');
          desenhar();
        } else {
          adicionarAoCarrinho(prod, 1, pesoKg, obs);
        }
        fechar();
      });
    });
  }

  function finalizarVenda() {
    if (carrinho.length === 0) return;

    // ── Guard de limite do plano gratuito ───────────────────
    try {
      registrarVendaTenant();
    } catch (e) {
      if (e.message === 'LIMITE_ATINGIDO') {
        exibirModalLimite(irPara, store.getTenant());
        return;
      }
    }

    const subtotal = carrinho.reduce((acc, it) => acc + it.total, 0);
    const troco = Math.max(0, (valorRecebido || subtotal) - subtotal);
    const itensTexto = carrinho.map((it) => it.forma === 'peso' ? `${it.nome} (${fmtKg(it.pesoKg)})` : `${it.qtd}x ${it.nome}`).join(', ');

    const novaVenda = store.adicionarVenda({
      itensTexto,
      total: subtotal,
      metodo: metodoPagamento,
      cliente: clienteNome || 'Balcão',
      telefone: clienteTelefone,
      troco: metodoPagamento === 'dinheiro' ? troco : 0,
      itens: [...carrinho],
    });

    const tenantAtivo = store.getTenant();
    registrarVendaApi({
      total: subtotal,
      pagamento: { metodo: metodoPagamento, troco, valorRecebido },
      cliente: { nome: clienteNome, telefone: clienteTelefone },
      itens: [...carrinho],
    }, tenantAtivo?.id).catch((err) => console.warn('Supabase sync venda:', err));

    const msgZap = encodeURIComponent(
      '🍗 *Frango Assado - Comprovante de Venda*' +
      '\nPedido: ' + novaVenda.id + ' • Horário: ' + novaVenda.hora +
      '\nCliente: ' + (clienteNome || 'Balcão') +
      '\n------------------------------' +
      carrinho.map((it) => '\n • ' + (it.forma === 'peso' ? it.nome + ' (' + fmtKg(it.pesoKg) + ') - ' + fmtMoeda(it.total) : it.qtd + 'x ' + it.nome + ' - ' + fmtMoeda(it.total))).join('') +
      '\n------------------------------' +
      '\n*TOTAL: ' + fmtMoeda(subtotal) + '*' +
      '\nPagamento: ' + metodoPagamento.toUpperCase() +
      (metodoPagamento === 'dinheiro' && troco > 0 ? '\nTroco: ' + fmtMoeda(troco) : '') +
      '\n\nObrigado pela preferência e bom apetite! 😋'
    );

    abrirModal(`
      <div class="comprovante-sucesso">
        <div class="sucesso-icone">${icone('ok')}</div>
        <h2>Venda Concluída!</h2>
        <p class="sucesso-sub">Código da venda: <strong>${novaVenda.id}</strong></p>

        <div class="cupom-papel">
          <div class="cupom-cabecalho">
            <strong>🍗 Frango Assado</strong>
            <small>Comprovante Não Fiscal</small>
            <small>${novaVenda.hora} &bull; ${nomePonto}</small>
          </div>
          <div class="cupom-linhas">
            ${carrinho.map((it) => `
              <div class="cupom-item">
                <span>${it.forma === 'peso' ? `${it.nome} (${fmtKg(it.pesoKg)})` : `${it.qtd}x ${it.nome}`}</span>
                <strong>${fmtMoeda(it.total)}</strong>
              </div>
            `).join('')}
          </div>
          <div class="cupom-total">
            <span>TOTAL PAGO (${metodoPagamento.toUpperCase()}):</span>
            <strong>${fmtMoeda(subtotal)}</strong>
          </div>
          ${metodoPagamento === 'dinheiro' && troco > 0 ? `
            <div class="cupom-troco">Troco entregue: ${fmtMoeda(troco)}</div>
          ` : ''}
        </div>

        <div class="comprovante-acoes">
          ${clienteTelefone ? `
            <a href="https://wa.me/55${clienteTelefone.replace(/\D/g, '')}?text=${msgZap}" target="_blank" class="btn btn-primario btn-bloco" style="background:#25D366;border:0">
              ${icone('whatsapp')} Enviar Recibo no WhatsApp
            </a>
          ` : `
            <button class="btn btn-contorno btn-bloco" id="btn-zap-rapido">
              ${icone('whatsapp')} Compartilhar no WhatsApp
            </button>
          `}
          <button class="btn btn-contorno btn-bloco" onclick="window.print()">
            ${icone('imprimir')} Imprimir Cupom
          </button>
          <button class="btn btn-escuro btn-bloco" data-fechar id="btn-nova-venda-pos">
            ${icone('mais')} Iniciar Próxima Venda
          </button>
        </div>
      </div>
    `, (modal, fechar) => {
      modal.querySelector('#btn-zap-rapido')?.addEventListener('click', () => {
        window.open('https://api.whatsapp.com/send?text=' + msgZap, '_blank');
      });
      modal.querySelector('#btn-nova-venda-pos')?.addEventListener('click', () => {
        carrinho = [];
        clienteNome = '';
        clienteTelefone = '';
        fechar();
        desenhar();
      });
    });

    carrinho = [];
    clienteNome = '';
    clienteTelefone = '';
    desenhar();
  }

  desenhar();
}
