/**
 * ============================================================
 *  DADOS FICTÍCIOS (MOCK) — NÃO SÃO DADOS REAIS
 * ============================================================
 * Tudo aqui é gerado por fórmula para parecer realista.
 * No futuro, estas funções serão substituídas por chamadas
 * ao backend (ver src/services/api.js), mantendo o MESMO formato
 * de retorno — assim as telas não precisam mudar.
 */

export const PONTOS = [
  { id: 'centro', nome: 'Ponto Centro', referencia: 'Praça da Matriz', fator: 1.0, ativo: true, diasFechado: [] },
  { id: 'feira', nome: 'Ponto Feira', referencia: 'Feira livre – Av. Brasil', fator: 1.35, ativo: true, diasFechado: [1, 2] }, // fecha seg/ter
  { id: 'jardim', nome: 'Ponto Jardim', referencia: 'Rua das Flores, 120', fator: 0.75, ativo: true, diasFechado: [] },
];

/** forma: 'unidade' | 'meia' | 'peso' | 'porcao'  — preço por kg quando 'peso'. */
export const PRODUTOS = [
  { id: 'inteiro', nome: 'Frango inteiro', forma: 'unidade', preco: 45.0, base: 18, cor: '#D9481C', emoji: '🍗' },
  { id: 'meio', nome: 'Meio frango', forma: 'meia', preco: 25.0, base: 14, cor: '#E8A33D', emoji: '🍗' },
  { id: 'linguica', nome: 'Linguiça assada', forma: 'peso', precoKg: 39.9, gramasMedia: 400, base: 10, cor: '#8B4A22', emoji: '🌭' },
  { id: 'lombo', nome: 'Lombo assado', forma: 'peso', precoKg: 54.9, gramasMedia: 450, base: 6, cor: '#7A4FB0', emoji: '🥩' },
  { id: 'batata', nome: 'Batata refogada', forma: 'porcao', preco: 12.0, base: 16, cor: '#2E8B57', emoji: '🥔' },
];

/** Perfis demonstrativos — SIMULAÇÃO visual, não é segurança real. */
export const PERFIS = {
  owner: { id: 'owner', nome: 'Carlos Mendes', papel: 'Dono / Administrador técnico', emoji: '👑', pontos: ['centro', 'feira', 'jardim'], consolidado: true },
  admin: { id: 'admin', nome: 'Juliana Rocha', papel: 'Administradora do negócio', emoji: '🧑‍💼', pontos: ['centro', 'jardim'], consolidado: true },
  vendedor: { id: 'vendedor', nome: 'Zé Batista', papel: 'Frangueiro / Vendedor', emoji: '🧑‍🍳', pontos: ['centro'], consolidado: false },
};

export const STATUS_PEDIDO = [
  { id: 'aguardando', nome: 'Aguardando confirmação', emoji: '⏳', cor: '#FCF0DA' },
  { id: 'confirmado', nome: 'Confirmado', emoji: '✅', cor: '#E3ECF8' },
  { id: 'preparo', nome: 'Em preparo', emoji: '🔥', cor: '#FDE7DE' },
  { id: 'pronto', nome: 'Pronto para retirada', emoji: '📦', cor: '#EFE6F8' },
  { id: 'entregue', nome: 'Entregue / retirado', emoji: '🤝', cor: '#E2F3EA' },
  { id: 'cancelado', nome: 'Cancelado', emoji: '✖️', cor: '#FBE4E1' },
];

// ---------- gerador pseudoaleatório (sempre gera os mesmos números para a mesma data) ----------
function semente(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const FATOR_DIA = [1.7, 0.7, 0.8, 0.9, 1.0, 1.25, 1.55]; // dom..sáb
const chave = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const mesmoDia = (a, b) => chave(a) === chave(b);

/** Vendas fictícias de UM ponto em UM dia. */
function diaPonto(ponto, data, hoje) {
  const zero = { produtos: {}, itens: 0, vendas: 0, receita: 0 };
  if (data > hoje && !mesmoDia(data, hoje)) return zero;          // futuro não tem venda
  if (ponto.diasFechado.includes(data.getDay())) return zero;
  const r = semente(ponto.id + chave(data));
  let f = FATOR_DIA[data.getDay()] * ponto.fator * (1 + 0.1 * Math.sin(data.getMonth() / 1.9));
  if (mesmoDia(data, hoje)) f *= Math.max(0, Math.min(1, (hoje.getHours() + hoje.getMinutes() / 60 - 8) / 12));
  const out = { produtos: {}, itens: 0, vendas: 0, receita: 0 };
  for (const p of PRODUTOS) {
    const qtd = Math.round(p.base * f * (0.75 + r() * 0.5));
    let receita, kg = 0;
    if (p.forma === 'peso') { kg = (qtd * p.gramasMedia * (0.85 + r() * 0.3)) / 1000; receita = kg * p.precoKg; }
    else receita = qtd * p.preco;
    out.produtos[p.id] = { qtd, kg, receita };
    out.itens += qtd; out.receita += receita;
  }
  out.vendas = Math.round(out.itens / (2.1 + r() * 0.4));
  return out;
}

// Distribuição das vendas ao longo do dia (08h às 20h): picos no almoço e fim da tarde
const CURVA_HORA = [2, 4, 7, 12, 14, 9, 5, 4, 5, 9, 12, 10, 7];
const HORAS = CURVA_HORA.map((_, i) => `${String(i + 8).padStart(2, '0')}h`);

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DIAS_SEM = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function* dias(inicio, fim) {
  const d = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
  while (d <= fim) { yield new Date(d); d.setDate(d.getDate() + 1); }
}

/**
 * Calcula o resumo de vendas.
 * @param {string[]} pontosIds  pontos a considerar
 * @param {Date} inicio @param {Date} fim
 * @param {'hora'|'dia'|'diaSemana'|'semana'|'mes'} grupo  agrupamento do gráfico de evolução
 */
export function resumoVendas(pontosIds, inicio, fim, grupo, hoje = new Date()) {
  const pontos = PONTOS.filter((p) => pontosIds.includes(p.id));
  const porProduto = Object.fromEntries(PRODUTOS.map((p) => [p.id, { qtd: 0, kg: 0, receita: 0 }]));
  const porPonto = Object.fromEntries(pontos.map((p) => [p.id, { receita: 0, vendas: 0, itens: 0 }]));
  const serie = new Map();
  const totais = { receita: 0, itens: 0, vendas: 0 };

  const rotulo = (d) => {
    if (grupo === 'diaSemana') return `${DIAS_SEM[d.getDay()]} ${d.getDate()}`;
    if (grupo === 'dia') return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (grupo === 'semana') return `Sem ${Math.ceil(d.getDate() / 7) > 4 ? 5 : Math.ceil(d.getDate() / 7)}`;
    if (grupo === 'mes') return MESES[d.getMonth()] + (inicio.getFullYear() !== fim.getFullYear() ? `/${String(d.getFullYear()).slice(2)}` : '');
    return '';
  };
  if (grupo === 'hora') HORAS.forEach((h) => serie.set(h, { receita: 0, vendas: 0 }));

  for (const d of dias(inicio, fim)) {
    const lb = rotulo(d);
    if (grupo !== 'hora' && !serie.has(lb)) serie.set(lb, { receita: 0, vendas: 0 });
    for (const p of pontos) {
      const r = diaPonto(p, d, hoje);
      for (const id in r.produtos) {
        porProduto[id].qtd += r.produtos[id].qtd; porProduto[id].kg += r.produtos[id].kg; porProduto[id].receita += r.produtos[id].receita;
      }
      Object.assign(porPonto[p.id], { receita: porPonto[p.id].receita + r.receita, vendas: porPonto[p.id].vendas + r.vendas, itens: porPonto[p.id].itens + r.itens });
      totais.receita += r.receita; totais.itens += r.itens; totais.vendas += r.vendas;
      if (grupo === 'hora') {
        const soma = CURVA_HORA.reduce((a, b) => a + b, 0);
        const horaAtual = mesmoDia(d, hoje) ? hoje.getHours() : 99;
        const ativos = CURVA_HORA.map((w, i) => (i + 8 <= horaAtual ? w : 0));
        const somaAtiva = ativos.reduce((a, b) => a + b, 0) || soma;
        HORAS.forEach((h, i) => { const s = serie.get(h); s.receita += (r.receita * ativos[i]) / somaAtiva; s.vendas += (r.vendas * ativos[i]) / somaAtiva; });
      } else {
        const s = serie.get(lb); s.receita += r.receita; s.vendas += r.vendas;
      }
    }
  }
  return {
    totais,
    porProduto,
    porPonto,
    serie: [...serie].map(([rotulo, v]) => ({ rotulo, ...v })),
  };
}

/** Resumo fictício de pedidos/reservas por status. Cancelados NÃO entram no faturamento. */
export function resumoPedidos(pontosIds, inicio, fim, hoje = new Date()) {
  const r = semente(pontosIds.join() + chave(inicio) + chave(fim));
  const fimEf = fim > hoje ? hoje : fim;
  const diasPassados = Math.max(1, Math.round((fimEf - inicio) / 864e5) + 1);
  const n = pontosIds.length;
  const incluiHoje = inicio <= hoje && fim >= new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const entregue = Math.round(diasPassados * n * (2.2 + r() * 1.2));
  return {
    aguardando: incluiHoje || fim > hoje ? Math.round(n * (1 + r() * 3)) : 0,
    confirmado: incluiHoje || fim > hoje ? Math.round(n * (2 + r() * 4)) : 0,
    preparo: incluiHoje ? Math.round(n * (r() * 2.5)) : 0,
    pronto: incluiHoje ? Math.round(n * (r() * 2)) : 0,
    entregue,
    cancelado: Math.round(entregue * (0.03 + r() * 0.04)),
  };
}
