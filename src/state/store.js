/**
 * "Memória" da sessão (estado demonstrativo).
 * Guarda: usuário logado, perfil, filtros, pedidos e vendas.
 * Persiste no localStorage/sessionStorage.
 */
import { PERFIS, PEDIDOS_INICIAIS, VENDAS_RECENTES } from '../data/mock.js';

const salvo = JSON.parse(sessionStorage.getItem('fa-sessao') || 'null');
const pedidosSalvos = JSON.parse(localStorage.getItem('fa-pedidos') || 'null') || PEDIDOS_INICIAIS;
const vendasSalvas = JSON.parse(localStorage.getItem('fa-vendas') || 'null') || VENDAS_RECENTES;

const estado = {
  logado: !!salvo,
  perfil: salvo?.perfil || 'owner',
  ponto: 'todos',            // 'todos' ou id do ponto
  periodo: 'semana',         // hoje | semana | mes | ano | custom
  custom: null,              // { inicio, fim } em 'AAAA-MM-DD'
  sidebarRecolhida: false,
  pedidos: pedidosSalvos,
  vendas: vendasSalvas,
};

const ouvintes = new Set();

function notificar() {
  ouvintes.forEach((fn) => fn(estado));
}

export const store = {
  get: () => estado,
  perfil: () => PERFIS[estado.perfil],
  set(parcial) {
    Object.assign(estado, parcial);
    sessionStorage.setItem('fa-sessao', estado.logado ? JSON.stringify({ perfil: estado.perfil }) : 'null');
    notificar();
  },
  assinar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },
  pontosPermitidos: () => PERFIS[estado.perfil].pontos,

  // --- Pedidos & Reservas ---
  getPedidos: () => estado.pedidos,
  adicionarPedido: (novo) => {
    const pedido = {
      id: Math.floor(1000 + Math.random() * 9000),
      criadoEm: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'confirmado',
      ...novo,
    };
    estado.pedidos = [pedido, ...estado.pedidos];
    localStorage.setItem('fa-pedidos', JSON.stringify(estado.pedidos));
    notificar();
    return pedido;
  },
  atualizarStatusPedido: (pedidoId, novoStatus) => {
    estado.pedidos = estado.pedidos.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p));
    localStorage.setItem('fa-pedidos', JSON.stringify(estado.pedidos));
    notificar();
  },

  // --- Vendas (PDV) ---
  getVendas: () => estado.vendas,
  adicionarVenda: (nova) => {
    const venda = {
      id: `V-${Math.floor(100 + Math.random() * 900)}`,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ...nova,
    };
    estado.vendas = [venda, ...estado.vendas];
    localStorage.setItem('fa-vendas', JSON.stringify(estado.vendas));
    notificar();
    return venda;
  },
};
