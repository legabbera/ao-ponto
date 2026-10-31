/**
 * TELA DE ESTOQUE - CICLO DA BRASA & INSUMOS
 * Rastreamento de frangos em tempo real (Cru -> Temperando -> No Espeto -> Pronto na Estufa -> Vendidos / Perdas)
 * e controle de insumos e embalagens com alertas de estoque mínimo.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS } from '../data/mock.js';

let filtroCategoriaInsumo = 'todos';
let buscaInsumoTexto = '';

export function renderEstoque(raiz, irPara) {
  const st = store.get();
  const perfil = store.perfil();
  const nomePonto = st.ponto === 'todos' 
    ? (perfil.pontos.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos[0]).nome) 
    : PONTOS.find((p) => p.id === st.ponto)?.nome;

  function desenhar() {
    const estoque = store.getEstoque();
    const frangos = estoque.frangos || { cru: 0, temperado: 0, espeto: 0, pronto: 0, vendidos: 0, perdas: 0 };
    const todosInsumos = estoque.insumos || [];
    const historico = estoque.historico || [];

    // Insumos em alerta
    const insumosEmAlerta = todosInsumos.filter((ins) => ins.qtd < ins.min);

    // Filtrar insumos
    let listaInsumos = todosInsumos;
    if (filtroCategoriaInsumo === 'alerta') {
      listaInsumos = insumosEmAlerta;
    } else if (filtroCategoriaInsumo !== 'todos') {
      listaInsumos = listaInsumos.filter((ins) => ins.categoria === filtroCategoriaInsumo);
    }
    if (buscaInsumoTexto.trim()) {
      const q = buscaInsumoTexto.toLowerCase().trim();
      listaInsumos = listaInsumos.filter((ins) => ins.nome.toLowerCase().includes(q));
    }

    raiz.innerHTML = `
    <div class="estoque-container">
      <!-- Topo -->
      <div class="estoque-topo">
        <div class="estoque-topo-info">
          <h1>Controle de Estoque &bull; Ciclo da Brasa 🍗🔥</h1>
          <p>
            <span class="badge badge-demo">${icone('local', 'mini')} ${nomePonto}</span>
            &bull; Rastreio em tempo real do frango e insumos da rotisserie
          </p>
        </div>
        <div class="estoque-topo-acoes">
          <button class="btn btn-primario" id="btn-entrada-frango">
            ${icone('mais')} Entrada de Frangos
          </button>
          <button class="btn btn-secundario" id="btn-mover-frangos">
            ${icone('trocar')} Mover Etapa
          </button>
          <button class="btn btn-contorno" id="btn-entrada-insumo">
            ${icone('pacote')} Repor Insumos
          </button>
          <button class="btn btn-texto btn-perda-topo" id="btn-registrar-perda">
            ${icone('alerta')} Perdas
          </button>
        </div>
      </div>

      <!-- Alerta Geral se houver insumos críticos -->
      ${insumosEmAlerta.length > 0 ? `
        <div class="estoque-aviso-alerta">
          <div class="aviso-icone">${icone('alerta')}</div>
          <div class="aviso-conteudo">
            <strong>Atenção: ${insumosEmAlerta.length} ${insumosEmAlerta.length === 1 ? 'insumo está' : 'insumos estão'} abaixo do estoque mínimo!</strong>
            <p>${insumosEmAlerta.map(i => `${i.nome} (${i.qtd} ${i.unidade})`).join(' &bull; ')}</p>
          </div>
          <button class="btn btn-pequeno btn-perigo-suave" id="btn-ver-alertas">Ver itens</button>
        </div>
      ` : ''}

      <!-- KPIs Rápidos -->
      <div class="estoque-kpis">
        <div class="kpi-estoque pronto-destaque">
          <div class="kpi-estoque-topo">
            <span class="kpi-estoque-rotulo">Prontos na Estufa</span>
            <span class="kpi-badge-etapa pronto">Venda Imediata</span>
          </div>
          <div class="kpi-estoque-valor">${frangos.pronto} <small>un</small></div>
          <div class="kpi-estoque-desc">Dourados e aquecidos, prontos para saída no caixa</div>
        </div>

        <div class="kpi-estoque">
          <div class="kpi-estoque-topo">
            <span class="kpi-estoque-rotulo">No Espeto (Braseiro)</span>
            <span class="kpi-badge-etapa espeto">Assando</span>
          </div>
          <div class="kpi-estoque-valor">${frangos.espeto} <small>un</small></div>
          <div class="kpi-estoque-desc">Rotacionando na máquina / churrasqueira</div>
        </div>

        <div class="kpi-estoque">
          <div class="kpi-estoque-topo">
            <span class="kpi-estoque-rotulo">Temperando</span>
            <span class="kpi-badge-etapa temperado">Marinado</span>
          </div>
          <div class="kpi-estoque-valor">${frangos.temperado} <small>un</small></div>
          <div class="kpi-estoque-desc">Em infusão com o tempero especial</div>
        </div>

        <div class="kpi-estoque">
          <div class="kpi-estoque-topo">
            <span class="kpi-estoque-rotulo">Câmara Fria (Crus)</span>
            <span class="kpi-badge-etapa cru">Estoque Frio</span>
          </div>
          <div class="kpi-estoque-valor">${frangos.cru} <small>un</small></div>
          <div class="kpi-estoque-desc">Estoque de segurança refrigerado</div>
        </div>
      </div>

      <!-- SEÇÃO 1: CICLO DA BRASA (PIPELINE VISUAL INTERATIVO) -->
      <div class="cartao secao-ciclo">
        <div class="secao-cabecalho">
          <div>
            <h2>Ciclo da Brasa 🍗 &rarr; 🔥 &rarr; ✨</h2>
            <p>Fluxo operacional passo a passo do frango. Clique nos botões de ação rápida para avançar lotes.</p>
          </div>
          <div class="secao-meta-resumo">
            <span class="badge-vendidos">${icone('check', 'mini')} ${frangos.vendidos || 0} Vendidos Hoje</span>
            <span class="badge-perdas">${icone('alerta', 'mini')} ${frangos.perdas || 0} Perdas</span>
          </div>
        </div>

        <div class="ciclo-grade">
          <!-- Etapa 1: Cru -->
          <div class="ciclo-etapa cru">
            <div class="etapa-topo">
              <span class="etapa-icone">❄️</span>
              <div class="etapa-info">
                <strong>1. Câmara Fria</strong>
                <small>Frangos crus</small>
              </div>
            </div>
            <div class="etapa-numero">${frangos.cru} <span class="unidade">un</span></div>
            <div class="etapa-barra"><div class="barra-preenchimento" style="width: ${Math.min(100, (frangos.cru / 100) * 100)}%"></div></div>
            <div class="etapa-acoes">
              <button class="btn btn-pequeno btn-contorno btn-acao-ciclo" data-acao="mover-rapido" data-origem="cru" data-destino="temperado" data-qtd="5" ${frangos.cru < 5 ? 'disabled' : ''}>
                Temperar +5 &rarr;
              </button>
              <button class="btn btn-pequeno btn-primario btn-acao-ciclo" data-acao="mover-rapido" data-origem="cru" data-destino="temperado" data-qtd="10" ${frangos.cru < 10 ? 'disabled' : ''}>
                Temperar +10 &rarr;
              </button>
            </div>
            <button class="btn-link-pequeno" data-acao="entrada-cru">+ Nova Entrada</button>
          </div>

          <div class="ciclo-seta">&rarr;</div>

          <!-- Etapa 2: Temperado -->
          <div class="ciclo-etapa temperado">
            <div class="etapa-topo">
              <span class="etapa-icone">🧂</span>
              <div class="etapa-info">
                <strong>2. Temperando</strong>
                <small>Marinando</small>
              </div>
            </div>
            <div class="etapa-numero">${frangos.temperado} <span class="unidade">un</span></div>
            <div class="etapa-barra"><div class="barra-preenchimento" style="width: ${Math.min(100, (frangos.temperado / 60) * 100)}%"></div></div>
            <div class="etapa-acoes">
              <button class="btn btn-pequeno btn-contorno btn-acao-ciclo" data-acao="mover-rapido" data-origem="temperado" data-destino="espeto" data-qtd="5" ${frangos.temperado < 5 ? 'disabled' : ''}>
                Ao Espeto +5 &rarr;
              </button>
              <button class="btn btn-pequeno btn-primario btn-acao-ciclo" data-acao="mover-rapido" data-origem="temperado" data-destino="espeto" data-qtd="10" ${frangos.temperado < 10 ? 'disabled' : ''}>
                Ao Espeto +10 &rarr;
              </button>
            </div>
            <button class="btn-link-pequeno" data-acao="perda-etapa" data-origem="temperado">Registrar descarte</button>
          </div>

          <div class="ciclo-seta">&rarr;</div>

          <!-- Etapa 3: Espeto -->
          <div class="ciclo-etapa espeto">
            <div class="etapa-topo">
              <span class="etapa-icone">🔥</span>
              <div class="etapa-info">
                <strong>3. No Espeto</strong>
                <small>Assando na brasa</small>
              </div>
            </div>
            <div class="etapa-numero">${frangos.espeto} <span class="unidade">un</span></div>
            <div class="etapa-barra"><div class="barra-preenchimento" style="width: ${Math.min(100, (frangos.espeto / 50) * 100)}%"></div></div>
            <div class="etapa-acoes">
              <button class="btn btn-pequeno btn-contorno btn-acao-ciclo" data-acao="mover-rapido" data-origem="espeto" data-destino="pronto" data-qtd="5" ${frangos.espeto < 5 ? 'disabled' : ''}>
                Para Estufa +5 &rarr;
              </button>
              <button class="btn btn-pequeno btn-primario btn-acao-ciclo" data-acao="mover-rapido" data-origem="espeto" data-destino="pronto" data-qtd="10" ${frangos.espeto < 10 ? 'disabled' : ''}>
                Para Estufa +10 &rarr;
              </button>
            </div>
            <button class="btn-link-pequeno" data-acao="perda-etapa" data-origem="espeto">Registrar queima</button>
          </div>

          <div class="ciclo-seta">&rarr;</div>

          <!-- Etapa 4: Pronto na Estufa -->
          <div class="ciclo-etapa pronto">
            <div class="etapa-topo">
              <span class="etapa-icone">🍗</span>
              <div class="etapa-info">
                <strong>4. Pronto (Estufa)</strong>
                <small>Pronto para entrega</small>
              </div>
            </div>
            <div class="etapa-numero">${frangos.pronto} <span class="unidade">un</span></div>
            <div class="etapa-barra"><div class="barra-preenchimento" style="width: ${Math.min(100, (frangos.pronto / 40) * 100)}%"></div></div>
            <div class="etapa-acoes">
              <button class="btn btn-pequeno btn-sucesso btn-acao-ciclo" data-acao="ir-pdv">
                ${icone('vendas', 'mini')} Vender no PDV
              </button>
            </div>
            <button class="btn-link-pequeno" data-acao="perda-etapa" data-origem="pronto">Registrar perda</button>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: INSUMOS, CARNES & EMBALAGENS -->
      <div class="cartao secao-insumos">
        <div class="secao-cabecalho">
          <div>
            <h2>Insumos, Carnes & Embalagens 🥩📦</h2>
            <p>Controle de carnes adicionais, ingredientes de guarnições e embalagens térmicas.</p>
          </div>
          <button class="btn btn-primario btn-pequeno" id="btn-novo-insumo-topo">
            ${icone('mais')} Adicionar Insumo
          </button>
        </div>

        <!-- Filtros e Busca de Insumos -->
        <div class="insumos-filtros-linha">
          <div class="abas-categorias">
            <button class="aba-filtro ${filtroCategoriaInsumo === 'todos' ? 'ativa' : ''}" data-cat="todos">Todos (${todosInsumos.length})</button>
            <button class="aba-filtro ${filtroCategoriaInsumo === 'carnes' ? 'ativa' : ''}" data-cat="carnes">Carnes</button>
            <button class="aba-filtro ${filtroCategoriaInsumo === 'guarnicoes' ? 'ativa' : ''}" data-cat="guarnicoes">Guarnições</button>
            <button class="aba-filtro ${filtroCategoriaInsumo === 'embalagens' ? 'ativa' : ''}" data-cat="embalagens">Embalagens & Carvão</button>
            <button class="aba-filtro ${filtroCategoriaInsumo === 'bebidas' ? 'ativa' : ''}" data-cat="bebidas">Bebidas</button>
            <button class="aba-filtro ${filtroCategoriaInsumo === 'alerta' ? 'ativa alerta' : ''}" data-cat="alerta">
              ⚠️ Em Alerta (${insumosEmAlerta.length})
            </button>
          </div>
          <div class="busca-insumo-caixa">
            <span class="busca-ic">${icone('busca')}</span>
            <input type="text" id="campo-busca-insumo" class="input input-busca" placeholder="Buscar insumo..." value="${buscaInsumoTexto}" />
          </div>
        </div>

        <!-- Grade de Insumos -->
        ${listaInsumos.length === 0 ? `
          <div class="estado-vazio-insumo">
            <div class="ev-icone">📦</div>
            <h3>Nenhum insumo encontrado</h3>
            <p>Tente alterar o filtro ou termo de busca.</p>
          </div>
        ` : `
          <div class="grade-insumos">
            ${listaInsumos.map((ins) => {
              const percSeguranca = Math.min(100, Math.round((ins.qtd / (ins.min * 1.5)) * 100));
              const estaCritico = ins.qtd <= 0;
              const estaBaixo = ins.qtd < ins.min;
              const statusClasse = estaCritico ? 'critico' : estaBaixo ? 'baixo' : 'normal';
              const statusTexto = estaCritico ? 'Esgotado' : estaBaixo ? 'Estoque Baixo' : 'Em Dia';

              return `
              <div class="insumo-card ${statusClasse}">
                <div class="insumo-card-topo">
                  <span class="insumo-icone">${ins.icone || '📦'}</span>
                  <div class="insumo-titulos">
                    <strong class="insumo-nome">${ins.nome}</strong>
                    <span class="insumo-categoria-tag">${ins.categoria}</span>
                  </div>
                  <span class="badge-status-insumo ${statusClasse}">${statusTexto}</span>
                </div>

                <div class="insumo-valores">
                  <div class="insumo-qtd-atual">
                    <span class="val">${ins.qtd}</span>
                    <span class="un">${ins.unidade}</span>
                  </div>
                  <div class="insumo-minimo">
                    <small>Mínimo:</small>
                    <strong>${ins.min} ${ins.unidade}</strong>
                  </div>
                </div>

                <div class="insumo-barra-nivel">
                  <div class="insumo-barra-progresso ${statusClasse}" style="width: ${percSeguranca}%"></div>
                </div>

                <div class="insumo-card-acoes">
                  <button class="btn btn-pequeno btn-contorno btn-entrada-rapida" data-insumo-id="${ins.id}" title="Dar entrada rápida">+ Entrada</button>
                  <button class="btn btn-pequeno btn-texto btn-ajustar-insumo" data-insumo-id="${ins.id}" title="Ajuste manual de inventário">Ajustar</button>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- SEÇÃO 3: HISTÓRICO DE MOVIMENTAÇÕES (AUDITORIA) -->
      <div class="cartao secao-historico">
        <div class="secao-cabecalho">
          <div>
            <h2>Histórico de Movimentações & Auditoria 📋</h2>
            <p>Registro automático de entradas, transferências de brasa, baixas de vendas e perdas.</p>
          </div>
        </div>

        <div class="tabela-responsiva">
          <table class="tabela-historico">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Tipo</th>
                <th>Descrição do Movimento</th>
                <th>Responsável</th>
              </tr>
            </thead>
            <tbody>
              ${historico.length === 0 ? `
                <tr>
                  <td colspan="4" class="tabela-vazia">Nenhum movimento registrado ainda.</td>
                </tr>
              ` : historico.slice(0, 15).map((h) => {
                let badgeClasse = 'info';
                if (h.tipo === 'venda') badgeClasse = 'sucesso';
                if (h.tipo === 'perda') badgeClasse = 'perigo';
                if (h.tipo === 'entrada') badgeClasse = 'primario';

                return `
                <tr>
                  <td class="col-hora"><strong>${h.data}</strong></td>
                  <td><span class="badge-tipo ${badgeClasse}">${h.tipo.toUpperCase()}</span></td>
                  <td class="col-desc">${h.desc}</td>
                  <td class="col-operador">${icone('usuario', 'mini')} ${h.operador || 'Operador'}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `;

    vincularEventos();
  }

  function vincularEventos() {
    // Ações Rápidas no Topo
    raiz.querySelector('#btn-entrada-frango')?.addEventListener('click', () => abrirModalEntradaFrangos());
    raiz.querySelector('#btn-mover-frangos')?.addEventListener('click', () => abrirModalMoverFrangos());
    raiz.querySelector('#btn-entrada-insumo')?.addEventListener('click', () => abrirModalEntradaInsumo());
    raiz.querySelector('#btn-registrar-perda')?.addEventListener('click', () => abrirModalPerda());
    raiz.querySelector('#btn-novo-insumo-topo')?.addEventListener('click', () => abrirModalEntradaInsumo());

    // Alerta banner
    raiz.querySelector('#btn-ver-alertas')?.addEventListener('click', () => {
      filtroCategoriaInsumo = 'alerta';
      desenhar();
    });

    // Ações rápidas no Ciclo da Brasa
    raiz.querySelectorAll('.btn-acao-ciclo').forEach((btn) => {
      btn.addEventListener('click', () => {
        const acao = btn.dataset.acao;
        if (acao === 'mover-rapido') {
          const origem = btn.dataset.origem;
          const destino = btn.dataset.destino;
          const qtd = parseInt(btn.dataset.qtd, 10);
          moverRapido(origem, destino, qtd);
        } else if (acao === 'ir-pdv') {
          irPara('vendas');
        }
      });
    });

    // Links de ação nas etapas do ciclo
    raiz.querySelectorAll('[data-acao="entrada-cru"]').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalEntradaFrangos());
    });
    raiz.querySelectorAll('[data-acao="perda-etapa"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const origem = btn.dataset.origem;
        abrirModalPerda(origem);
      });
    });

    // Filtros de Insumos
    raiz.querySelectorAll('.aba-filtro').forEach((btn) => {
      btn.addEventListener('click', () => {
        filtroCategoriaInsumo = btn.dataset.cat;
        desenhar();
      });
    });

    // Busca de Insumos
    const campoBusca = raiz.querySelector('#campo-busca-insumo');
    campoBusca?.addEventListener('input', (e) => {
      buscaInsumoTexto = e.target.value;
      desenhar();
    });

    // Ações nos Cards de Insumos
    raiz.querySelectorAll('.btn-entrada-rapida').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.insumoId;
        abrirModalEntradaInsumo(id);
      });
    });

    raiz.querySelectorAll('.btn-ajustar-insumo').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.insumoId;
        abrirModalAjusteInsumo(id);
      });
    });
  }

  // Helper para mover no pipeline
  function moverRapido(origem, destino, qtd) {
    const res = store.moverEstoqueFrango(origem, destino, qtd);
    if (!res.ok) {
      toast(res.erro, 'erro');
    } else {
      toast(`Transferidos +${qtd} frangos de ${origem} para ${destino}! 🔥`, 'sucesso');
      desenhar();
    }
  }

  // Modal 1: Entrada de Frangos Crus
  function abrirModalEntradaFrangos() {
    abrirModal({
      titulo: 'Entrada de Frangos Crus (Câmara Fria) ❄️',
      html: `
        <div class="form-modal-estoque">
          <p style="color: var(--texto-suave); font-size: 14px; margin-bottom: 14px;">
            Registre a chegada de novo lote de frangos inteiros do fornecedor refrigerado.
          </p>
          <div class="campo">
            <label>Quantidade de Frangos (unidades):</label>
            <input type="number" id="mod-qtd-frango" class="input" min="1" step="1" value="30" autofocus />
          </div>
          <div class="campo">
            <label>Fornecedor / Lote (Opcional):</label>
            <input type="text" id="mod-fornecedor-frango" class="input" placeholder="Ex: Frango do Campo Lote 402" />
          </div>
          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-cancelar-modal">Cancelar</button>
            <button class="btn btn-primario" id="btn-salvar-entrada-frango">Confirmar Entrada</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-modal').onclick = fechar;
        el.querySelector('#btn-salvar-entrada-frango').onclick = () => {
          const qtd = parseInt(el.querySelector('#mod-qtd-frango').value, 10);
          const fornecedor = el.querySelector('#mod-fornecedor-frango').value.trim();

          if (!qtd || qtd <= 0) {
            toast('Informe uma quantidade válida', 'erro');
            return;
          }

          store.darEntradaFrango(qtd, fornecedor);
          toast(`Entrada de +${qtd} frangos registrada com sucesso!`, 'sucesso');
          fechar();
          desenhar();
        };
      }
    });
  }

  // Modal 2: Mover Frangos entre Etapas
  function abrirModalMoverFrangos() {
    const est = store.getEstoque().frangos;
    abrirModal({
      titulo: 'Mover Frangos no Ciclo da Brasa 🔄',
      html: `
        <div class="form-modal-estoque">
          <div class="campo">
            <label>Etapa de Origem:</label>
            <select id="mod-origem-frango" class="select">
              <option value="cru">1. Câmara Fria (Crus: ${est.cru} un)</option>
              <option value="temperado">2. Temperando (Marinadas: ${est.temperado} un)</option>
              <option value="espeto">3. No Espeto (Assando: ${est.espeto} un)</option>
            </select>
          </div>
          <div class="campo">
            <label>Etapa de Destino:</label>
            <select id="mod-destino-frango" class="select">
              <option value="temperado">2. Temperando (Marinado)</option>
              <option value="espeto" selected>3. No Espeto (Braseiro/Máquina)</option>
              <option value="pronto">4. Pronto na Estufa (Disponível p/ Venda)</option>
            </select>
          </div>
          <div class="campo">
            <label>Quantidade a Mover (un):</label>
            <input type="number" id="mod-mover-qtd" class="input" min="1" step="1" value="10" />
          </div>
          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-cancelar-modal">Cancelar</button>
            <button class="btn btn-primario" id="btn-confirmar-mover">Confirmar Movimentação</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-modal').onclick = fechar;
        el.querySelector('#btn-confirmar-mover').onclick = () => {
          const origem = el.querySelector('#mod-origem-frango').value;
          const destino = el.querySelector('#mod-destino-frango').value;
          const qtd = parseInt(el.querySelector('#mod-mover-qtd').value, 10);

          if (origem === destino) {
            toast('Origem e destino devem ser diferentes', 'erro');
            return;
          }
          if (!qtd || qtd <= 0) {
            toast('Informe uma quantidade válida', 'erro');
            return;
          }

          const res = store.moverEstoqueFrango(origem, destino, qtd);
          if (!res.ok) {
            toast(res.erro, 'erro');
          } else {
            toast(`Transferência de ${qtd} frangos efetuada com sucesso! 🔥`, 'sucesso');
            fechar();
            desenhar();
          }
        };
      }
    });
  }

  // Modal 3: Registrar Perda / Descarte
  function abrirModalPerda(etapaPreDefinida = 'pronto') {
    abrirModal({
      titulo: 'Registrar Perda / Queima de Frango ⚠️',
      html: `
        <div class="form-modal-estoque">
          <p style="color: var(--vermelho); font-size: 13px; margin-bottom: 12px;">
            As perdas serão abatidas imediatamente do estoque e gravadas na auditoria.
          </p>
          <div class="campo">
            <label>Etapa onde ocorreu a perda:</label>
            <select id="mod-perda-origem" class="select">
              <option value="cru" ${etapaPreDefinida === 'cru' ? 'selected' : ''}>Câmara Fria (Vencimento/Validade)</option>
              <option value="temperado" ${etapaPreDefinida === 'temperado' ? 'selected' : ''}>Temperando (Descarte/Contaminação)</option>
              <option value="espeto" ${etapaPreDefinida === 'espeto' ? 'selected' : ''}>No Espeto (Queimado na Máquina/Brasa)</option>
              <option value="pronto" ${etapaPreDefinida === 'pronto' ? 'selected' : ''}>Pronto na Estufa (Queda ou Vencido)</option>
            </select>
          </div>
          <div class="campo">
            <label>Quantidade perdida (unidades):</label>
            <input type="number" id="mod-perda-qtd" class="input" min="1" step="1" value="1" />
          </div>
          <div class="campo">
            <label>Motivo detalhado:</label>
            <input type="text" id="mod-perda-motivo" class="input" placeholder="Ex: Queimou na asa superior, derrubado na bancada" />
          </div>
          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-cancelar-modal">Cancelar</button>
            <button class="btn btn-perigo" id="btn-confirmar-perda">Registrar Perda</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-modal').onclick = fechar;
        el.querySelector('#btn-confirmar-perda').onclick = () => {
          const origem = el.querySelector('#mod-perda-origem').value;
          const qtd = parseInt(el.querySelector('#mod-perda-qtd').value, 10);
          const motivo = el.querySelector('#mod-perda-motivo').value.trim() || 'Descarte';

          if (!qtd || qtd <= 0) {
            toast('Informe uma quantidade válida', 'erro');
            return;
          }

          const res = store.registrarPerdaFrango(origem, qtd, motivo);
          if (!res.ok) {
            toast(res.erro, 'erro');
          } else {
            toast(`Perda de ${qtd} un registrada com sucesso.`, 'alerta');
            fechar();
            desenhar();
          }
        };
      }
    });
  }

  // Modal 4: Entrada de Insumo
  function abrirModalEntradaInsumo(idInsumoPreSel = null) {
    const todos = store.getEstoque().insumos;
    abrirModal({
      titulo: 'Entrada / Reposição de Insumo 📦',
      html: `
        <div class="form-modal-estoque">
          <div class="campo">
            <label>Selecione o Insumo:</label>
            <select id="mod-insumo-sel" class="select">
              ${todos.map((ins) => `
                <option value="${ins.id}" ${ins.id === idInsumoPreSel ? 'selected' : ''}>
                  ${ins.icone || '📦'} ${ins.nome} (Atual: ${ins.qtd} ${ins.unidade})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="campo">
            <label>Quantidade Adicional:</label>
            <input type="number" id="mod-insumo-qtd" class="input" min="0.1" step="any" value="10" />
          </div>
          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-cancelar-modal">Cancelar</button>
            <button class="btn btn-primario" id="btn-confirmar-entrada-insumo">Adicionar ao Estoque</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-modal').onclick = fechar;
        el.querySelector('#btn-confirmar-entrada-insumo').onclick = () => {
          const id = el.querySelector('#mod-insumo-sel').value;
          const qtd = parseFloat(el.querySelector('#mod-insumo-qtd').value);

          if (!qtd || qtd <= 0) {
            toast('Informe uma quantidade válida', 'erro');
            return;
          }

          store.darEntradaInsumo(id, qtd);
          toast('Estoque de insumo atualizado com sucesso!', 'sucesso');
          fechar();
          desenhar();
        };
      }
    });
  }

  // Modal 5: Ajuste Manual de Inventário
  function abrirModalAjusteInsumo(idInsumo) {
    const insumo = store.getEstoque().insumos.find((i) => i.id === idInsumo);
    if (!insumo) return;

    abrirModal({
      titulo: `Ajuste de Inventário: ${insumo.nome}`,
      html: `
        <div class="form-modal-estoque">
          <p style="color: var(--texto-suave); font-size: 14px; margin-bottom: 14px;">
            Ajuste a quantidade física real contada no local.
          </p>
          <div class="campo">
            <label>Quantidade Atual Registrada:</label>
            <input type="text" class="input" value="${insumo.qtd} ${insumo.unidade}" disabled />
          </div>
          <div class="campo">
            <label>Nova Quantidade Física (${insumo.unidade}):</label>
            <input type="number" id="mod-ajuste-nova-qtd" class="input" step="any" value="${insumo.qtd}" autofocus />
          </div>
          <div class="modal-botoes" style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn-contorno" id="btn-cancelar-modal">Cancelar</button>
            <button class="btn btn-primario" id="btn-confirmar-ajuste">Salvar Ajuste</button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('#btn-cancelar-modal').onclick = fechar;
        el.querySelector('#btn-confirmar-ajuste').onclick = () => {
          const novaQtd = parseFloat(el.querySelector('#mod-ajuste-nova-qtd').value);
          if (isNaN(novaQtd) || novaQtd < 0) {
            toast('Informe uma quantidade válida', 'erro');
            return;
          }

          store.ajustarInsumo(insumo.id, novaQtd);
          toast(`Estoque de ${insumo.nome} ajustado para ${novaQtd} ${insumo.unidade}!`, 'sucesso');
          fechar();
          desenhar();
        };
      }
    });
  }

  desenhar();
}

