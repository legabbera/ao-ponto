/**
 * "Memória" da sessão — multi-tenant.
 * Guarda: tenant ativo, usuário logado, perfil, filtros, pedidos, vendas, estoque e clientes.
 * Persiste no localStorage/sessionStorage.
 */
import { PERFIS, PEDIDOS_INICIAIS, VENDAS_RECENTES, CLIENTES_INICIAIS } from '../data/mock.js';
import { getTenantAtivo, getPlanoAtivo, vendasRestantes } from '../data/tenants.js';

const salvo = JSON.parse(sessionStorage.getItem('fa-sessao') || 'null');
const tenantAtivo = getTenantAtivo();

const pedidosSalvos = JSON.parse(localStorage.getItem('fa-pedidos') || 'null') || PEDIDOS_INICIAIS;
const vendasSalvas = JSON.parse(localStorage.getItem('fa-vendas') || 'null') || VENDAS_RECENTES;
const clientesSalvos = JSON.parse(localStorage.getItem('fa-clientes') || 'null') || CLIENTES_INICIAIS;

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
  clientes: clientesSalvos,
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

  subscrever: (fn) => {
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  },

  // ── Multi-tenant helpers ────────────────────────────────────
  getTenant: () => estado.tenant || getTenantAtivo(),
  getPlano: () => getPlanoAtivo(estado.tenant),
  vendasRestantes: () => vendasRestantes(estado.tenant, estado.vendas),
  limiteVendasAtingido: () => {
    const vr = vendasRestantes(estado.tenant, estado.vendas);
    return vr !== null && vr <= 0;
  },

  // ── Pedidos & Reservas ──────────────────────────────────────
  getPedidos: () => {
    const tid = (estado.tenant || getTenantAtivo())?.id;
    if (!tid) return estado.pedidos;
    return estado.pedidos.filter((p) => !p.tenantId || p.tenantId === tid);
  },
  salvarPedidos() {
    localStorage.setItem('fa-pedidos', JSON.stringify(estado.pedidos));
    notificar();
  },
  adicionarPedido: (novo) => {
    const pedido = {
      id: Math.floor(1000 + Math.random() * 9000),
      tenantId: (estado.tenant || getTenantAtivo())?.id || 'tenant_demo',
      ...novo,
    };
    estado.pedidos = [pedido, ...estado.pedidos];
    store.salvarPedidos();

    // Se tiver cliente vinculado, registra movimentação
    if (pedido.cliente) {
      store.registrarCompraCliente(pedido.cliente, pedido.total, pedido.itens);
    }

    return pedido;
  },
  atualizarStatusPedido: (id, novoStatus) => {
    const p = estado.pedidos.find((x) => x.id === id);
    if (!p) return;
    p.status = novoStatus;
    if (novoStatus === 'entregue') {
      p.pagamento = { ...p.pagamento, status: 'pago' };
      // Ao entregar, dá baixa correspondente de estoque
      store.baixarEstoqueVenda(p.itens || []);
    }
    store.salvarPedidos();
  },

  // ── Vendas & PDV ────────────────────────────────────────────
  getVendas: () => {
    const tid = (estado.tenant || getTenantAtivo())?.id;
    if (!tid) return estado.vendas;
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

    // Atualiza histórico do cliente se identificado
    if (nova.cliente && nova.cliente !== 'Balcão') {
      store.registrarCompraCliente(nova.cliente, nova.total, nova.itens);
    }

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
      return { ok: false, erro: `Quantidade insuficiente em "${origem}". Disponível: ${estado.estoque.frangos[origem] || 0}` };
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
    return { ok: true };
  },

  /** Dá entrada de novos frangos comprados (chegada do frigorífico) */
  darEntradaFrango: (quantidade, fornecedor = '') => {
    const qtd = Math.max(1, parseInt(quantidade, 10) || 1);
    estado.estoque.frangos.cru = (estado.estoque.frangos.cru || 0) + qtd;

    const extra = fornecedor ? ` (${fornecedor})` : '';
    store.adicionarHistoricoEstoque('entrada', `Chegada de +${qtd} frangos crus em câmara fria${extra}`);
    store.salvarEstoque();
    return { ok: true };
  },

  /** Registra perda / quebra / queima de frango */
  registrarPerdaFrango: (origem, quantidade, motivo = 'Queima no fogo') => {
    const qtd = Math.max(1, parseInt(quantidade, 10) || 1);
    if (!estado.estoque.frangos[origem] || estado.estoque.frangos[origem] < qtd) {
      return { ok: false, erro: `Quantidade insuficiente em "${origem}" para registrar perda.` };
    }

    estado.estoque.frangos[origem] -= qtd;
    estado.estoque.frangos.perdas = (estado.estoque.frangos.perdas || 0) + qtd;

    store.adicionarHistoricoEstoque('perda', `Perda de ${qtd} frangos em "${origem}": ${motivo}`);
    store.salvarEstoque();
    return { ok: true };
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
      data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tipo,
      desc,
      operador: (perfil?.nome || 'Operador').split(' ')[0],
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

      store.adicionarHistoricoEstoque('venda', `Baixa de PDV: ${frangosBaixados} frangos retirados da estufa`);
    }

    store.salvarEstoque();
  },

  // ── Módulo de Clientes, CRM & Fidelidade ─────────────────────
  getClientes: () => {
    const tid = (estado.tenant || getTenantAtivo())?.id;
    if (!tid) return estado.clientes || [];
    return (estado.clientes || []).filter((c) => !c.tenantId || c.tenantId === tid);
  },

  salvarClientes() {
    localStorage.setItem('fa-clientes', JSON.stringify(estado.clientes));
    notificar();
  },

  adicionarCliente: (dados) => {
    const novo = {
      id: `cli-${Date.now()}`,
      tenantId: (estado.tenant || getTenantAtivo())?.id || 'tenant_demo',
      nome: dados.nome || 'Cliente',
      telefone: dados.telefone || '',
      bairro: dados.bairro || 'Balcão',
      tag: dados.tag || 'novo',
      preferencias: dados.preferencias || '',
      pontosFidelidade: parseInt(dados.pontosFidelidade, 10) || 0,
      totalPedidos: 0,
      totalGasto: 0,
      ultimaVisita: 'Hoje',
      anotacoes: dados.anotacoes || '',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
    };
    estado.clientes = [novo, ...(estado.clientes || [])];
    store.salvarClientes();
    return novo;
  },

  atualizarCliente: (id, dadosAtualizados) => {
    const cli = (estado.clientes || []).find((c) => c.id === id);
    if (!cli) return null;
    Object.assign(cli, dadosAtualizados);
    store.salvarClientes();
    return cli;
  },

  removerCliente: (id) => {
    estado.clientes = (estado.clientes || []).filter((c) => c.id !== id);
    store.salvarClientes();
  },

  adicionarPontoFidelidade: (id, qtd = 1) => {
    const cli = (estado.clientes || []).find((c) => c.id === id);
    if (!cli) return null;
    cli.pontosFidelidade = (cli.pontosFidelidade || 0) + qtd;
    store.salvarClientes();
    return cli;
  },

  resgatarFidelidade: (id) => {
    const cli = (estado.clientes || []).find((c) => c.id === id);
    if (!cli) return { ok: false, erro: 'Cliente não encontrado' };
    if ((cli.pontosFidelidade || 0) < 10) {
      return { ok: false, erro: 'Pontos insuficientes para resgate (mínimo 10 selos)' };
    }
    cli.pontosFidelidade -= 10;
    cli.recompensasResgatadas = (cli.recompensasResgatadas || 0) + 1;
    store.salvarClientes();
    return { ok: true, pontosRestantes: cli.pontosFidelidade };
  },

  /** Registra compra/reserva feita por um cliente */
  registrarCompraCliente: (nomeOuId, valor = 0, itens = []) => {
    if (!nomeOuId || nomeOuId === 'Balcão') return;
    const nomeLimpo = String(nomeOuId).toLowerCase().trim();
    const cli = (estado.clientes || []).find(
      (c) => c.id === nomeOuId || c.nome.toLowerCase().trim() === nomeLimpo
    );
    if (!cli) return;

    cli.totalPedidos = (cli.totalPedidos || 0) + 1;
    cli.totalGasto = +((cli.totalGasto || 0) + (parseFloat(valor) || 0)).toFixed(2);
    cli.ultimaVisita = 'Hoje';

    // Se comprou frango inteiro ou meio frango, credita pontos de fidelidade
    let frangos = 0;
    itens.forEach((it) => {
      const n = (it.nome || '').toLowerCase();
      if (n.includes('inteiro')) frangos += (it.qtd || 1);
      else if (n.includes('meio')) frangos += (it.qtd || 1) * 0.5;
    });

    if (frangos > 0) {
      cli.pontosFidelidade = (cli.pontosFidelidade || 0) + Math.round(frangos);
    }

    // Promove tag se passar de 5 pedidos
    if (cli.totalPedidos >= 8) cli.tag = 'vip';
    else if (cli.totalPedidos >= 3) cli.tag = 'frequente';

    store.salvarClientes();
  },
};
