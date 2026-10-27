/**
 * "Memória" da sessão — multi-tenant.
 * Guarda: tenant ativo, usuário logado, perfil, filtros, pedidos e vendas.
 * Persiste no localStorage/sessionStorage.
 */
import { PERFIS, PEDIDOS_INICIAIS, VENDAS_RECENTES } from '../data/mock.js';
import { getTenantAtivo, getPlanoAtivo, vendasRestantes } from '../data/tenants.js';

const salvo = JSON.parse(sessionStorage.getItem('fa-sessao') || 'null');
const tenantAtivo = getTenantAtivo();

const pedidosSalvos = JSON.parse(localStorage.getItem('fa-pedidos') || 'null') || PEDIDOS_INICIAIS;
const vendasSalvas = JSON.parse(localStorage.getItem('fa-vendas') || 'null') || VENDAS_RECENTES;

const estado = {
  logado: !!salvo && !!tenantAtivo,
  perfil: salvo?.perfil || 'owner',
  ponto: 'todos',
  periodo: 'semana',
  custom: null,
  sidebarRecolhida: false,
  pedidos: pedidosSalvos,
  vendas: vendasSalvas,
  // ── Multi-tenant ──
  tenant: tenantAtivo,
  usuario: salvo?.usuario || null,
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
    sessionStorage.setItem(
      'fa-sessao',
      estado.logado
        ? JSON.stringify({ perfil: estado.perfil, usuario: estado.usuario })
        : 'null'
    );
    notificar();
  },

  assinar(fn) {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },

  pontosPermitidos: () => PERFIS[estado.perfil].pontos,

  // ── Tenant helpers ──────────────────────────────────────────
  getTenant: () => estado.tenant || getTenantAtivo(),
  getPlano: () => getPlanoAtivo(),
  getVendasRestantes: () => vendasRestantes(),

  /** Atualiza tenant no estado (ex: após upgrade ou config) */
  refreshTenant() {
    const t = getTenantAtivo();
    estado.tenant = t;
    notificar();
  },

  // ── Pedidos & Reservas ──────────────────────────────────────
  getPedidos: () => {
    const tid = (estado.tenant || getTenantAtivo())?.id || 'tenant_demo';
    return estado.pedidos.filter((p) => !p.tenantId || p.tenantId === tid);
  },
  adicionarPedido: (novo) => {
    const pedido = {
      id: Math.floor(1000 + Math.random() * 9000),
      criadoEm: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'confirmado',
      tenantId: (estado.tenant || getTenantAtivo())?.id || 'tenant_demo',
      ...novo,
    };
    estado.pedidos = [pedido, ...estado.pedidos];
    localStorage.setItem('fa-pedidos', JSON.stringify(estado.pedidos));
    notificar();
    return pedido;
  },
  atualizarStatusPedido: (pedidoId, novoStatus) => {
    estado.pedidos = estado.pedidos.map((p) =>
      p.id === pedidoId ? { ...p, status: novoStatus } : p
    );
    localStorage.setItem('fa-pedidos', JSON.stringify(estado.pedidos));
    notificar();
  },

  // ── Vendas (PDV) ────────────────────────────────────────────
  getVendas: () => {
    const tid = (estado.tenant || getTenantAtivo())?.id || 'tenant_demo';
    return estado.vendas.filter((v) => !v.tenantId || v.tenantId === tid);
  },
  adicionarVenda: (nova) => {
    const venda = {
      id: `V-${Math.floor(100 + Math.random() * 900)}`,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tenantId: (estado.tenant || getTenantAtivo())?.id || 'tenant_demo',
      ...nova,
    };
    estado.vendas = [venda, ...estado.vendas];
    localStorage.setItem('fa-vendas', JSON.stringify(estado.vendas));
    notificar();
    return venda;
  },
};
