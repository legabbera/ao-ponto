/**
 * DASHBOARD PRINCIPAL
 * Todos os cards e gráficos são recalculados quando o período,
 * o ponto de venda ou o perfil mudam. Dados 100% fictícios.
 */
import { Chart, registerables } from 'chart.js';
import { icone } from '../components/icons.js';
import { toast } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS, PRODUTOS, STATUS_PEDIDO } from '../data/mock.js';
import { buscarDashboard } from '../services/api.js';
import { fmtMoeda, fmtMoedaCurta, fmtNumero, fmtKg, fmtData, isoData, deIso } from '../utils/format.js';

Chart.register(...registerables);
Chart.defaults.font.family = "'Montserrat', system-ui, sans-serif";
Chart.defaults.color = '#6E625A';

const PERIODOS = [
  { id: 'hoje', rotulo: 'Hoje' }, { id: 'semana', rotulo: 'Semana' }, { id: 'mes', rotulo: 'Mês' },
  { id: 'ano', rotulo: 'Ano' }, { id: 'custom', rotulo: 'Personalizado' },
];

/** Converte o filtro escolhido em datas (início, fim, agrupamento) + período anterior para comparação. */
function calcularPeriodo(periodo, custom, agrupMes) {
  const hoje = new Date();
  const h = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  let inicio, fim, grupo, anterior, descricao;
  if (periodo === 'hoje') {
    inicio = fim = h; grupo = 'hora'; anterior = { inicio: add(h, -1), fim: add(h, -1) };
    descricao = `Hoje, ${fmtData(h)} · comparado a ontem`;
  } else if (periodo === 'semana') {
    const seg = add(h, -((h.getDay() + 6) % 7));
    inicio = seg; fim = add(seg, 6); grupo = 'diaSemana';
    anterior = { inicio: add(seg, -7), fim: add(h, -7) };
    descricao = `${fmtData(inicio)} a ${fmtData(fim)} · vs. semana passada`;
  } else if (periodo === 'mes') {
    inicio = new Date(h.getFullYear(), h.getMonth(), 1); fim = new Date(h.getFullYear(), h.getMonth() + 1, 0);
    grupo = agrupMes; anterior = { inicio: new Date(h.getFullYear(), h.getMonth() - 1, 1), fim: new Date(h.getFullYear(), h.getMonth() - 1, h.getDate()) };
    descricao = `${h.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · vs. mês anterior`;
  } else if (periodo === 'ano') {
    inicio = new Date(h.getFullYear(), 0, 1); fim = new Date(h.getFullYear(), 11, 31); grupo = 'mes';
    anterior = { inicio: new Date(h.getFullYear() - 1, 0, 1), fim: new Date(h.getFullYear() - 1, h.getMonth(), h.getDate()) };
    descricao = `Ano de ${h.getFullYear()} · vs. mesmo período de ${h.getFullYear() - 1}`;
  } else {
    inicio = deIso(custom.inicio); fim = deIso(custom.fim);
    const dias = Math.round((fim - inicio) / 864e5) + 1;
    grupo = dias > 62 ? 'mes' : 'dia';
    anterior = { inicio: add(inicio, -dias), fim: add(inicio, -1) };
    descricao = `${fmtData(inicio)} a ${fmtData(fim)} · vs. ${dias} dias anteriores`;
  }
  return { inicio, fim, grupo, anterior, descricao };
}

let graficos = {};
let opcoes = { produtoMetrica: 'receita', agrupMes: 'dia' };

export function destruirDashboard() { Object.values(graficos).forEach((g) => g.destroy()); graficos = {}; }

export function renderDashboard(raiz, irPara) {
  const st = store.get(), perfil = store.perfil();
  const permitidos = perfil.pontos;
  const multi = perfil.consolidado && permitidos.length > 1;
  if (!multi && st.ponto === 'todos') st.ponto = permitidos.length === 1 ? permitidos[0] : 'todos';
  const hora = new Date().getHours();
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  if (!st.custom) { const h = new Date(); st.custom = { inicio: isoData(new Date(h.getFullYear(), h.getMonth(), 1)), fim: isoData(h) }; }

  raiz.innerHTML = `
  <section class="dash-topo">
    <div class="saudacao">
      <h1>${saud}, ${perfil.nome.split(' ')[0]}! 👋</h1>
      <p><span id="desc-periodo"></span> <span class="badge badge-demo">${icone('info', 'mini')} Dados fictícios</span></p>
    </div>
    <div class="acoes-rapidas">
      <button class="btn btn-primario" id="btn-nova-venda">${icone('vendas')} Nova venda</button>
      <button class="btn btn-escuro" id="btn-novo-pedido">${icone('calendario')} Novo pedido</button>
    </div>
    <div class="filtros">
      <label class="sr-only" for="sel-ponto">Ponto de venda</label>
      <select class="select" id="sel-ponto" ${permitidos.length === 1 ? 'disabled title="Seu perfil só tem acesso a este ponto"' : ''}>
        ${multi ? `<option value="todos">📍 ${permitidos.length === PONTOS.length ? 'Todos os pontos' : `Todos os meus pontos (${permitidos.length})`}</option>` : ''}
        ${PONTOS.filter((p) => permitidos.includes(p.id)).map((p) => `<option value="${p.id}">${p.nome} — ${p.referencia}</option>`).join('')}
      </select>
      <div class="chips" role="group" aria-label="Período">
        ${PERIODOS.map((p) => `<button class="chip" data-periodo="${p.id}" id="filtro-${p.id}" aria-pressed="${st.periodo === p.id}">${p.rotulo}</button>`).join('')}
      </div>
      <div class="periodo-custom ${st.periodo === 'custom' ? 'visivel' : ''}" id="periodo-custom">
        <input type="date" id="data-inicio" value="${st.custom.inicio}" aria-label="Data inicial" />
        <span>até</span>
        <input type="date" id="data-fim" value="${st.custom.fim}" aria-label="Data final" />
        <button class="btn btn-escuro" id="btn-aplicar" style="min-height:44px">Aplicar</button>
      </div>
    </div>
  </section>

  <div id="painel">
    <section class="kpis ${multi ? '' : 'sem-pontos'}" id="kpis"></section>
    <section class="grade">
      <article class="card largo">
        <div class="card-cabecalho">
          <div><h2 class="card-titulo">Evolução das vendas</h2><div class="card-sub" id="sub-evolucao"></div></div>
          <div class="toggle-mini" id="tg-mes" style="display:none" role="group" aria-label="Agrupar mês por">
            <button data-ag="dia">Por dia</button><button data-ag="semana">Por semana</button>
          </div>
        </div>
        <div class="grafico-caixa alto"><canvas id="g-evolucao" aria-label="Gráfico de evolução das vendas"></canvas></div>
      </article>

      <article class="card">
        <div class="card-cabecalho"><div><h2 class="card-titulo">Resumo de pedidos</h2><div class="card-sub">Pedidos e reservas no período</div></div></div>
        <div class="status-grade" id="status-pedidos"></div>
        <p class="nota">${icone('info', 'mini')} Cancelados não entram no faturamento.</p>
      </article>

      <article class="card largo">
        <div class="card-cabecalho">
          <div><h2 class="card-titulo">Vendas por produto</h2><div class="card-sub">Frango, linguiça, lombo e batata</div></div>
          <div class="toggle-mini" role="group" aria-label="Métrica">
            <button data-met="receita">R$ faturado</button><button data-met="qtd">Quantidade</button>
          </div>
        </div>
        <div class="grafico-caixa"><canvas id="g-produtos" aria-label="Gráfico de vendas por produto"></canvas></div>
      </article>

      <article class="card">
        <div class="card-cabecalho"><div><h2 class="card-titulo">Mais vendidos</h2><div class="card-sub">Ranking por faturamento</div></div></div>
        <ol class="lista-ranking" id="ranking"></ol>
      </article>

      ${multi ? `
      <article class="card largo" id="card-pontos">
        <div class="card-cabecalho"><div><h2 class="card-titulo">Comparativo por ponto de venda</h2><div class="card-sub">Faturamento (barras) e nº de vendas (linha)</div></div>
        <span class="badge badge-demo">${icone('cadeado', 'mini')} Visível para administradores</span></div>
        <div class="grafico-caixa"><canvas id="g-pontos" aria-label="Comparativo entre pontos de venda"></canvas></div>
        <div class="pontos-lista" id="lista-pontos"></div>
      </article>` : ''}
    </section>
    <p class="rodape-demo">Protótipo · Etapa 1 · Todos os valores são fictícios e reiniciam ao recarregar.</p>
  </div>`;

  const $ = (s) => raiz.querySelector(s);
  $('#sel-ponto').value = st.ponto;

  // ---- filtros ----
  $('#sel-ponto').addEventListener('change', (e) => { store.set({ ponto: e.target.value }); atualizar(); });
  raiz.querySelectorAll('[data-periodo]').forEach((b) => b.addEventListener('click', () => {
    raiz.querySelectorAll('[data-periodo]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#periodo-custom').classList.toggle('visivel', b.dataset.periodo === 'custom');
    store.set({ periodo: b.dataset.periodo });
    atualizar();
  }));
  $('#btn-aplicar').addEventListener('click', () => {
    const i = $('#data-inicio').value, f = $('#data-fim').value;
    if (!i || !f) return toast('Escolha as duas datas.', 'erro');
    if (i > f) return toast('A data inicial precisa ser antes da final.', 'erro');
    if ((deIso(f) - deIso(i)) / 864e5 > 730) return toast('Escolha um período de até 2 anos.', 'erro');
    store.set({ custom: { inicio: i, fim: f } });
    atualizar();
    toast('Período aplicado.');
  });
  raiz.querySelectorAll('[data-met]').forEach((b) => b.addEventListener('click', () => { opcoes.produtoMetrica = b.dataset.met; atualizar(); }));
  raiz.querySelectorAll('[data-ag]').forEach((b) => b.addEventListener('click', () => { opcoes.agrupMes = b.dataset.ag; atualizar(); }));
  $('#btn-nova-venda').addEventListener('click', () => { toast('A tela de Nova venda chega na Etapa 2.', 'info'); irPara('vendas'); });
  $('#btn-novo-pedido').addEventListener('click', () => { toast('O formulário de Novo pedido chega na Etapa 2.', 'info'); irPara('pedidos'); });

  let requisicao = 0;
  async function atualizar() {
    const s = store.get();
    const pontos = s.ponto === 'todos' ? permitidos : [s.ponto];
    const per = calcularPeriodo(s.periodo, s.custom, opcoes.agrupMes);
    $('#desc-periodo').textContent = per.descricao;
    raiz.querySelectorAll('[data-met]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.met === opcoes.produtoMetrica)));
    raiz.querySelectorAll('[data-ag]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ag === opcoes.agrupMes)));
    $('#tg-mes').style.display = s.periodo === 'mes' ? 'inline-flex' : 'none';

    $('#painel').classList.add('carregando');
    const id = ++requisicao;
    const dados = await buscarDashboard({ pontos, ...per });
    if (id !== requisicao || !raiz.isConnected) return; // ignora respostas antigas
    $('#painel').classList.remove('carregando');
    desenhar(dados, per, pontos);
  }

  function desenhar({ atual, anterior, pedidos }, per, pontos) {
    const t = atual.totais, a = anterior.totais;
    const ticket = t.vendas ? t.receita / t.vendas : 0, ticketAnt = a.vendas ? a.receita / a.vendas : 0;
    const pendentes = pedidos.aguardando + pedidos.confirmado + pedidos.preparo + pedidos.pronto;
    const pontosAtivos = PONTOS.filter((p) => permitidos.includes(p.id) && p.ativo).length;

    const kpis = [
      { rot: 'Faturamento bruto', val: fmtMoeda(t.receita), var: variacao(t.receita, a.receita), ic: 'dinheiro', destaque: true },
      { rot: 'Itens vendidos', val: fmtNumero(t.itens), var: variacao(t.itens, a.itens), ic: 'pacote', cor: ['#FDE7DE', '#D9481C'] },
      { rot: 'Vendas realizadas', val: fmtNumero(t.vendas), var: variacao(t.vendas, a.vendas), ic: 'recibo', cor: ['#E3ECF8', '#3B6FB6'] },
      { rot: 'Pedidos pendentes', val: fmtNumero(pendentes), var: { cls: 'neutra', txt: `${pedidos.aguardando} aguardando` }, ic: 'relogio', cor: ['#FCF0DA', '#B97A16'] },
      { rot: 'Ticket médio', val: fmtMoeda(ticket), var: variacao(ticket, ticketAnt), ic: 'tendencia', cor: ['#E2F3EA', '#2E8B57'] },
    ];
    if (multi) kpis.push({ rot: 'Pontos ativos', val: `${pontosAtivos} de ${permitidos.length}`, var: { cls: 'neutra', txt: s0(pontos.length) }, ic: 'local', cor: ['#EFE6F8', '#7A4FB0'] });
    function s0(n) { return n === permitidos.length ? 'todos selecionados' : `${n} selecionado`; }

    $('#kpis').innerHTML = kpis.map((k) => `
      <article class="card kpi ${k.destaque ? 'destaque' : ''}">
        <div class="kpi-icone" style="background:${k.destaque ? 'rgba(240,122,62,.22)' : k.cor[0]};color:${k.destaque ? '#F7A27A' : k.cor[1]}">${icone(k.ic)}</div>
        <div class="kpi-rotulo">${k.rot}</div>
        <div class="valor-kpi">${k.val}</div>
        <span class="variacao ${k.var.cls}">${k.var.cls === 'sobe' ? icone('sobe', 'mini') : k.var.cls === 'desce' ? icone('desce', 'mini') : ''}${k.var.txt}</span>
      </article>`).join('');

    // --- Evolução ---
    const subEv = { hora: 'Por hora (hoje)', diaSemana: 'Por dia da semana', dia: 'Por dia', semana: 'Por semana do mês', mes: 'Por mês' }[per.grupo];
    $('#sub-evolucao').textContent = `${subEv} · faturamento em R$`;
    const ctxEv = $('#g-evolucao').getContext('2d');
    const grad = ctxEv.createLinearGradient(0, 0, 0, 280);
    grad.addColorStop(0, 'rgba(217,72,28,.35)'); grad.addColorStop(1, 'rgba(217,72,28,0)');
    const usarBarras = ['diaSemana', 'semana', 'mes'].includes(per.grupo);
    if (graficos.ev && graficos.ev.config.type !== (usarBarras ? 'bar' : 'line')) { graficos.ev.destroy(); delete graficos.ev; }
    const dsEv = {
      label: 'Faturamento', data: atual.serie.map((s) => +s.receita.toFixed(2)),
      borderColor: '#D9481C', backgroundColor: usarBarras ? 'rgba(217,72,28,.85)' : grad,
      fill: true, tension: .35, borderWidth: usarBarras ? 0 : 3, pointRadius: usarBarras ? 0 : 3, pointBackgroundColor: '#fff', borderRadius: 8, maxBarThickness: 42,
    };
    graficos.ev = criarOuAtualizar(graficos.ev, $('#g-evolucao'), usarBarras ? 'bar' : 'line', atual.serie.map((s) => s.rotulo), [dsEv], {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${fmtMoeda(c.raw)} · ${fmtNumero(atual.serie[c.dataIndex].vendas)} vendas` } } },
      scales: { y: { beginAtZero: true, grid: { color: '#F0E7DA' }, ticks: { callback: (v) => fmtMoedaCurta(v) } }, x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 10 } } },
    });

    // --- Produtos ---
    const met = opcoes.produtoMetrica;
    const lista = PRODUTOS.map((p) => ({ ...p, ...atual.porProduto[p.id] }));
    graficos.prod = criarOuAtualizar(graficos.prod, $('#g-produtos'), 'bar', lista.map((p) => p.nome), [{
      label: met === 'receita' ? 'Faturamento' : 'Quantidade',
      data: lista.map((p) => (met === 'receita' ? +p.receita.toFixed(2) : p.qtd)),
      backgroundColor: lista.map((p) => p.cor), borderRadius: 8, maxBarThickness: 30,
    }], {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => { const p = lista[c.dataIndex]; return p.forma === 'peso' ? ` ${fmtMoeda(p.receita)} · ${fmtKg(p.kg)} (${p.qtd} porções) · ${fmtMoeda(p.precoKg)}/kg` : ` ${fmtMoeda(p.receita)} · ${fmtNumero(p.qtd)} ${p.forma === 'porcao' ? 'porções' : 'un.'}`; } } } },
      scales: { x: { beginAtZero: true, grid: { color: '#F0E7DA' }, ticks: { callback: (v) => (met === 'receita' ? fmtMoedaCurta(v) : fmtNumero(v)) } }, y: { grid: { display: false }, ticks: { font: { weight: 600 } } } },
    });

    // --- Ranking ---
    const rk = [...lista].sort((x, y) => y.receita - x.receita);
    const max = rk[0]?.receita || 1;
    $('#ranking').innerHTML = t.receita === 0
      ? `<li style="display:block"><div class="vazio"><div class="vazio-icone">🍗</div><h3>Nenhuma venda no período</h3><p>Escolha outro período ou ponto de venda.</p></div></li>`
      : rk.map((p, i) => `<li><span class="pos">${i + 1}º</span>
        <div><div class="rk-nome">${p.emoji} ${p.nome}</div><div class="rk-barra"><i style="width:${(p.receita / max) * 100}%"></i></div></div>
        <div class="rk-valor">${fmtMoeda(p.receita)}<small>${p.forma === 'peso' ? fmtKg(p.kg) : `${fmtNumero(p.qtd)} ${p.forma === 'porcao' ? 'porções' : 'un.'}`}</small></div></li>`).join('');

    // --- Pedidos ---
    $('#status-pedidos').innerHTML = STATUS_PEDIDO.map((s) => `
      <div class="status-item ${s.id === 'cancelado' ? 'cancelado' : ''}"><span class="st-ic" style="background:${s.cor}">${s.emoji}</span>
      <div><strong>${fmtNumero(pedidos[s.id])}</strong><small>${s.nome}</small></div></div>`).join('');

    // --- Pontos ---
    if (multi) {
      const ps = PONTOS.filter((p) => permitidos.includes(p.id));
      const todos = store.get().ponto === 'todos';
      // Comparativo sempre mostra todos os pontos autorizados (mesmo período) para facilitar a comparação
      const comp = todos ? atual.porPonto : null;
      const usar = comp || null;
      const desenharPontos = (porPonto) => {
        graficos.pt = criarOuAtualizar(graficos.pt, $('#g-pontos'), 'bar', ps.map((p) => p.nome), [
          { type: 'bar', label: 'Faturamento', data: ps.map((p) => +porPonto[p.id].receita.toFixed(2)), backgroundColor: ps.map((p) => (todos || p.id === store.get().ponto ? '#D9481C' : '#E8DDCD')), borderRadius: 8, maxBarThickness: 56, yAxisID: 'y' },
          { type: 'line', label: 'Vendas', data: ps.map((p) => porPonto[p.id].vendas), borderColor: '#1F1B18', backgroundColor: '#1F1B18', pointRadius: 5, tension: .3, yAxisID: 'y1' },
        ], {
          plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }, tooltip: { callbacks: { label: (c) => (c.dataset.label === 'Faturamento' ? ` ${fmtMoeda(c.raw)}` : ` ${fmtNumero(c.raw)} vendas`) } } },
          scales: { y: { beginAtZero: true, grid: { color: '#F0E7DA' }, ticks: { callback: (v) => fmtMoedaCurta(v) } }, y1: { beginAtZero: true, position: 'right', grid: { display: false } }, x: { grid: { display: false } } },
        });
        $('#lista-pontos').innerHTML = ps.map((p) => `<div class="ponto-linha"><div><strong>📍 ${p.nome}</strong><small>${p.referencia}${p.diasFechado.length ? ' · fecha seg/ter' : ''}</small></div>
          <div style="text-align:right"><strong>${fmtMoeda(porPonto[p.id].receita)}</strong><small>${fmtNumero(porPonto[p.id].vendas)} vendas · ${fmtNumero(porPonto[p.id].itens)} itens</small></div></div>`).join('');
      };
      if (usar) desenharPontos(usar);
      else buscarDashboard({ pontos: permitidos, ...per }).then((d) => raiz.isConnected && desenharPontos(d.atual.porPonto));
    }
  }

  atualizar();
}

function variacao(atual, anterior) {
  if (!anterior) return { cls: 'neutra', txt: 'sem comparação' };
  const p = ((atual - anterior) / anterior) * 100;
  if (Math.abs(p) < 0.5) return { cls: 'neutra', txt: 'estável' };
  return { cls: p > 0 ? 'sobe' : 'desce', txt: `${p > 0 ? '+' : ''}${p.toFixed(1).replace('.', ',')}%` };
}

function criarOuAtualizar(grafico, canvas, tipo, labels, datasets, options) {
  if (grafico) {
    grafico.data.labels = labels;
    grafico.data.datasets = datasets;
    Object.assign(grafico.options, options);
    grafico.update();
    return grafico;
  }
  return new Chart(canvas, { type: tipo, data: { labels, datasets }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 500 }, ...options } });
}
