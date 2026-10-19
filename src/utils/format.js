/** Formatação no padrão brasileiro. */
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR');
const kgFmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtMoeda = (v) => moeda.format(v || 0);                 // R$ 1.234,56
export const fmtMoedaCurta = (v) => v >= 1000 ? `R$ ${kgFmt.format(v / 1000)} mil` : fmtMoeda(v);
export const fmtNumero = (v) => numero.format(Math.round(v || 0));    // 1.234
export const fmtKg = (v) => `${kgFmt.format(v || 0)} kg`;
export const fmtData = (d) => d.toLocaleDateString('pt-BR');          // DD/MM/AAAA
export const fmtHora = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
export const isoData = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const deIso = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
