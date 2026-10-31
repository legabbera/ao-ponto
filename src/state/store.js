/**
 * "Memória" da sessão — multi-tenant.
 * Guarda: tenant ativo, usuário logado, perfil, filtros, pedidos, vendas e estoque.
 * Persiste no localStorage/sessionStorage.
 */
import { PERFIS, PEDIDOS_INICIAIS, VENDAS_RECENTES } from '../data/mock.js';
import { getTenantAtivo, getPlanoAtivo, vendasRestantes } from '../data/tenants.js';

const salvo = JSON.parse(sessionStorage.getItem('fa-sessao') || 'null');
const tenantAtivo = getTenantAtivo();

const pedidosSalvos = JSON.parse(localStorage.getItem('fa-pedidos') || 'null') || PEDIDOS_INICIAIS;
const vendasSalvas = JSON.parse(localStorage.getItem('fa-vendas') || 'null') || VENDAS_RECENTES;

export const ESTOQUE_PADRAO = {
  frangos: {
    cru: 80,
    temperado: 45,
    espeto: 30,
    pronto: 15,
    vendidos: 42,
    perdas: 2,
  },
  insumos: [
    { id: 'ins-linguica', nome: 'Linguiça Toscana', categoria: 'carnes', qtd: 18.5, unidade: 'kg', min: 10.0, emoji: '🥩' },
    { id: 'ins-costela', nome: 'Costelinha Suína', categoria: 'carnes', qtd: 12.0, unidade: 'kg', min: 8.0, emoji: '🍖' },
    { id: 'ins-maionese', nome: 'Maionese Caseira', categoria: 'guarnicoes', qtd: 24, unidade: 'potes', min: 15, emoji: '🥗' },
    { id: 'ins-farofa', nome: 'Farofa da Casa', categoria: 'guarnicoes', qtd: 35, unidade: 'potes', min: 20, emoji: '🥣' },
    { id: 'ins-batata', nome: 'Batata Bolinha', categoria: 'guarnicoes', qtd: 16.0, unidade: 'kg', min: 10.0, emoji: '🥔' },
    { id: 'ins-coca2l', nome: 'Coca-Cola 2L', categoria: 'bebidas', qtd: 26, unidade: 'un', min: 12, emoji: '🥤' },
    { id: 'ins-guarana2l', nome: 'Guaraná Antarctica 2L', categoria: 'bebidas', qtd: 20, unidade: 'un', min: 12, emoji: '🥤' },
    { id: 'ins-embalagem', nome: 'Embalagem Térmica Frango', categoria: 'insumos', qtd: 65, unidade: 'un', min: 40, emoji: '📦' },
    { id: 'ins-sacola', nome: 'Sacola Reforçada', categoria: 'insumos', qtd: 120, unidade: 'un', min: 50, emoji: '🛍️' },
    { id: 'ins-carvao', nome: 'Saco de Carvão 10kg', categoria: 'insumos', qtd: 6, unidade: 'sacos', min: 4, emoji: '🪵' },
  ],
  historico: [
    { id: 1, hora: '08:00', tipo: 'entrada', desc: 'Chegada de 80 frangos frescos do frigorífico', autor: 'Carlos' },
    { id: 2, hora: '08:45', tipo: 'movimento', desc: '45 frangos colocados para temperar', autor: 'Carlos' },
    { id: 3, hora: '09:30', tipo: 'movimento', desc: '30 frangos colocados para assar na máquina', autor: 'Zé' },
    { id: 4, hora: '11:15', tipo: 'movimento', desc: '15 frangos dourados transferidos para a estufa', autor: 'Zé' },
  ],
};

const estoqueSalvo = JSON.parse(localStorage.getItem('fa-estoque') || 'null') || JSON.parse(JSON.stringify(ESTOQUE_PADRAO));

const estado = {
  logado: !!salvo && !!tenantAtivo,
  perfil: salvo?.perfil || 'owner',
  ponto: 'todos',
  periodo: 'semana',
  custom: null,
  sidebarRecolhida: false,
  pedidos: pedidosSalvos,
  vendas: vendasSalvas,
  estoque: estoqueSalvo,
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
    
    // Dá baixa automática no estoque
    store.baixarEstoqueVenda(nova.itens || []);

    notificar();
    return venda;
  },

  // ── Controle de Estoque Real ────────────────────────────────
  getEstoque: () => estado.estoque || ESTOQUE_PADRAO,

  salvarEstoque() {
    localStorage.setItem('fa-estoque', JSON.stringify(estado.estoque));
    notificar();
  },

  /** Movimenta frangos no Ciclo da Brasa (cru -> temperado -> espeto -> pronto) */
  moverEstoqueFrango: (origem, destino, quantidade) => {
    const qtd = Math.max(1, parseInt(quantidade, 10) || 1);
    if (!estado.estoque.frangos[origem] || estado.estoque.frangos[origem] < qtd) {
      throw new Error(`Quantidade insuficiente em "${origem}". Disponível: ${estado.estoque.frangos[origem] || 0}`);
    }

    estado.estoque.frangos[origem] -= qtd;
    estado.estoque.frangos[destino] = (estado.estoque.frangos[destino] || 0) + qtd;

    const rotulos = {
      cru: 'Frango Cru / Câmara Fria',
      temperado: 'Temperando / Marinado',
      espeto: 'Na Brasa / Espeto',
      pronto: 'Pronto na Estufa',
    };

    store.adicionarHistoricoEstoque(
      'movimento',
      `${qtd} frangos movidos de ${rotulos[origem] || origem} para ${rotulos[destino] || destino}`
    );
    store.salvarEstoque();
  },

  /** Dá entrada de novos frangos comprados (chegada do frigorífico) */
  darEntradaFrango: (quantidade, fornecedor = '') => {
    const qtd = Math.max(1, parseInt(quantidade, 10) || 1);
    estado.estoque.frangos.cru = (estado.estoque.frangos.cru || 0) + qtd;

    const extra = fornecedor ? ` (${fornecedor})` : '';
    store.adicionarHistoricoEstoque('entrada', `Chegada de +${qtd} frangos crus em câmara fria${extra}`);
    store.salvarEstoque();
  },

  /** Registra perda / quebra / queima de frango */
  registrarPerdaFrango: (origem, quantidade, motivo = 'Queima no fogo') => {
    const qtd = Math.max(1, parseInt(quantidade, 10) || 1);
    if (!estado.estoque.frangos[origem] || estado.estoque.frangos[origem] < qtd) {
      throw new Error(`Quantidade insuficiente em "${origem}" para registrar perda.`);
    }

    estado.estoque.frangos[origem] -= qtd;
    estado.estoque.frangos.perdas = (estado.estoque.frangos.perdas || 0) + qtd;

    store.adicionarHistoricoEstoque('perda', `Perda de ${qtd} frangos em "${origem}": ${motivo}`);
    store.salvarEstoque();
  },

  /** Atualiza quantidade de insumo/guarnição */
  ajustarInsumo: (insumoId, novaQtd) => {
    const ins = estado.estoque.insumos.find((i) => i.id === insumoId);
    if (!ins) return;
    const anterior = ins.qtd;
    ins.qtd = Math.max(0, parseFloat(novaQtd) || 0);

    store.adicionarHistoricoEstoque(
      'ajuste',
      `${ins.nome} ajustado de ${anterior} ${ins.unidade} para ${ins.qtd} ${ins.unidade}`
    );
    store.salvarEstoque();
  },

  /** Dá entrada (compra/reposição) de insumo */
  darEntradaInsumo: (insumoId, qtdAdicional) => {
    const ins = estado.estoque.insumos.find((i) => i.id === insumoId);
    if (!ins) return;
    const add = parseFloat(qtdAdicional) || 0;
    ins.qtd = +(ins.qtd + add).toFixed(2);

    store.adicionarHistoricoEstoque(
      'entrada',
      `Reposição de +${add} ${ins.unidade} em ${ins.nome} (Total: ${ins.qtd} ${ins.unidade})`
    );
    store.salvarEstoque();
  },

  /** Registra item no histórico de auditoria de estoque */
  adicionarHistoricoEstoque: (tipo, desc) => {
    const perfil = store.perfil();
    const item = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tipo,
      desc,
      autor: (perfil?.nome || 'Operador').split(' ')[0],
    };
    estado.estoque.historico = [item, ...(estado.estoque.historico || [])].slice(0, 30);
  },

  /**
   * Baixa automática de estoque ao vender no PDV ou retirar pedido.
   * Se for frango inteiro, baixa 1 da estufa. Se for meio frango, baixa 0.5.
   * Baixa automaticamente também embalagem térmica e sacola!
   */
  baixarEstoqueVenda: (itensCarrinho = []) => {
    if (!Array.isArray(itensCarrinho) || itensCarrinho.length === 0) return;

    let frangosBaixados = 0;
    let embalagensBaixadas = 0;

    itensCarrinho.forEach((it) => {
      const nomeLower = (it.nome || '').toLowerCase();

      // Frangos
      if (nomeLower.includes('inteiro')) {
        const qtd = it.qtd || 1;
        frangosBaixados += qtd;
        embalagensBaixadas += qtd;
      } else if (nomeLower.includes('meio')) {
        const qtd = it.qtd || 1;
        frangosBaixados += (qtd * 0.5);
        embalagensBaixadas += qtd;
      }

      // Carnes vendidas por peso
      if (nomeLower.includes('linguiça') || nomeLower.includes('linguica')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-linguica');
        const peso = it.pesoKg || (it.pesoGramas ? it.pesoGramas / 1000 : 0.4);
        if (ins) ins.qtd = Math.max(0, +(ins.qtd - peso).toFixed(2));
      } else if (nomeLower.includes('lombo') || nomeLower.includes('costela')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-costela');
        const peso = it.pesoKg || (it.pesoGramas ? it.pesoGramas / 1000 : 0.45);
        if (ins) ins.qtd = Math.max(0, +(ins.qtd - peso).toFixed(2));
      }

      // Guarnições
      if (nomeLower.includes('maionese')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-maionese');
        if (ins) ins.qtd = Math.max(0, ins.qtd - (it.qtd || 1));
      } else if (nomeLower.includes('farofa')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-farofa');
        if (ins) ins.qtd = Math.max(0, ins.qtd - (it.qtd || 1));
      } else if (nomeLower.includes('batata')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-batata');
        if (ins) ins.qtd = Math.max(0, +(ins.qtd - ((it.qtd || 1) * 0.4)).toFixed(2));
      }

      // Bebidas
      if (nomeLower.includes('coca')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-coca2l');
        if (ins) ins.qtd = Math.max(0, ins.qtd - (it.qtd || 1));
      } else if (nomeLower.includes('guaraná') || nomeLower.includes('guarana')) {
        const ins = estado.estoque.insumos.find((i) => i.id === 'ins-guarana2l');
        if (ins) ins.qtd = Math.max(0, ins.qtd - (it.qtd || 1));
      }
    });

    if (frangosBaixados > 0) {
      const prontoAtual = estado.estoque.frangos.pronto || 0;
      estado.estoque.frangos.pronto = Math.max(0, Math.round((prontoAtual - frangosBaixados) * 10) / 10);
      estado.estoque.frangos.vendidos = (estado.estoque.frangos.vendidos || 0) + frangosBaixados;

      // Baixa embalagem térmica e sacola proporcional
      const emb = estado.estoque.insumos.find((i) => i.id === 'ins-embalagem');
      if (emb) emb.qtd = Math.max(0, emb.qtd - Math.ceil(embalagensBaixadas));

      const sac = estado.estoque.insumos.find((i) => i.id === 'ins-sacola');
      if (sac) sac.qtd = Math.max(0, sac.qtd - Math.ceil(embalagensBaixadas));

      store.adicionarHistoricoEstoque('saida', `Baixa de PDV: ${frangosBaixados} frangos retirados da estufa`);
    }

    store.salvarEstoque();
  },
};
