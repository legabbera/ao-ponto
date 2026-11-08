/**
 * "Memória" da sessão — multi-tenant.
 * Guarda: tenant ativo, usuário logado, perfil, filtros, pedidos, vendas, estoque, clientes e whatsapp.
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

export const WHATSAPP_PADRAO = {
  config: {
    modo: 'link', // 'link' (wa.me direto grátis) ou 'instancia' (API conectada)
    instanciaConectada: true,
    nomeInstancia: 'Ao Ponto - Central Balcão',
    nomeEstabelecimento: 'Ao Ponto Assados', // Nome ou apelido do estabelecimento para o cabeçalho das mensagens
    numeroConectado: '(11) 98888-7777',
    bateria: 92,
    gatilhos: {
      reservaConfirmada: true,
      entrouPreparo: true,
      prontoEstufa: true,
      cupomPdv: true,
      clubeFrango: true,
    },
  },
  templates: [
    {
      id: 'reserva_confirmada',
      titulo: 'Confirmação de Reserva',
      categoria: 'pedidos',
      gatilho: 'reservaConfirmada',
      descricao: 'Enviado assim que a reserva for cadastrada no sistema',
      texto: '*{estabelecimento}*\nOlá *{cliente}*! Sua reserva está confirmada.\n\n*Pedido:* #{pedido_id}\n*Retirada:* {data} às {horario}\n*Itens:* {itens}\n*Total:* {total}\n\nEstamos preparando tudo com o maior carinho no braseiro!',
    },
    {
      id: 'pedido_preparo',
      titulo: 'No Espeto (Assando na Brasa)',
      categoria: 'pedidos',
      gatilho: 'entrouPreparo',
      descricao: 'Enviado quando o pedido vai para o fogo/espeto',
      texto: '*{estabelecimento}*\nOi *{cliente}*! O seu frango assado acabou de entrar na máquina giratória/braseiro.\n\nLogo logo estará douradinho, suculento e no ponto para o seu almoço!',
    },
    {
      id: 'pedido_pronto',
      titulo: 'Pronto na Estufa (Retirada)',
      categoria: 'pedidos',
      gatilho: 'prontoEstufa',
      descricao: 'Enviado quando a encomenda atinge o ponto de retirada',
      texto: '*{estabelecimento}*\n*{cliente}*, seu pedido está quentinho na estufa!\n\nPode vir retirar no balcão (Pedido #{pedido_id}). Bom apetite para você e toda a família!',
    },
    {
      id: 'campanha_domingo',
      titulo: 'Cardápio & Reservas de Domingo',
      categoria: 'campanhas',
      descricao: 'Disparo de sexta/sábado para abrir as encomendas do fim de semana',
      texto: '*{estabelecimento}*\nBom dia, *{cliente}*!\n\nJá estamos aceitando as reservas para o almoço deste domingo!\n\nDestaques do cardápio:\n- Frango Inteiro Dourado com Farofa Crocante\n- Costelinha Suína e Linguiça Toscana na Brasa\n- Maionese Caseira Tradicional e Batata Bolinha\n\nGaranta a sua encomenda antes que esgotem as fornadas! Responda esta mensagem para reservar o seu.',
    },
    {
      id: 'lembrete_fidelidade',
      titulo: 'Clube do Frango (Extrato de Selos)',
      categoria: 'fidelidade',
      gatilho: 'clubeFrango',
      descricao: 'Aviso de saldo de pontos e prêmio a retirar',
      texto: '*{estabelecimento}*\nOlá *{cliente}*!\n\nVocê já tem *{selos}/10 selos* no Clube do Frango do *{estabelecimento}*!\n\n{aviso_premio}\n\nTe esperamos neste fim de semana!',
    },
    {
      id: 'cupom_pdv',
      titulo: 'Comprovante de Venda Balcão',
      categoria: 'vendas',
      gatilho: 'cupomPdv',
      descricao: 'Recibo digital emitido após fechamento da venda no PDV',
      texto: '*{estabelecimento} - Comprovante de Venda*\n\nPedido: #{pedido_id}\nCliente: {cliente}\n------------------------------\n{itens}\n------------------------------\n*TOTAL: {total}*\nPagamento: {metodo}\n\nObrigado pela preferência e bom apetite!',
    },
  ],
  historico: [
    {
      id: 1,
      hora: '11:02',
      data: 'Hoje',
      cliente: 'Carla Silveira',
      telefone: '11988887777',
      template: 'Confirmação de Reserva',
      tipo: 'automatico',
      status: 'lido',
    },
    {
      id: 2,
      hora: '10:45',
      data: 'Hoje',
      cliente: 'Cláudio Duarte',
      telefone: '11999991111',
      template: 'Pronto na Estufa',
      tipo: 'automatico',
      status: 'lido',
    },
    {
      id: 3,
      hora: '09:15',
      data: 'Hoje',
      cliente: 'Dona Neide Santos',
      telefone: '11977773333',
      template: 'Cardápio & Reservas de Domingo',
      tipo: 'campanha',
      status: 'entregue',
    },
  ],
};

export const PAGAMENTOS_PADRAO = {
  provedorAtivo: 'mercadopago', // 'mercadopago', 'stone', 'pagbank', 'cielo', 'manual'
  maquininhas: [
    {
      id: 'maq-1',
      nome: 'Maquininha Balcão Principal',
      modelo: 'Mercado Pago Point Pro 2',
      serial: 'PAX-D200-8841',
      ponto: 'todos',
      status: 'online', // 'online', 'offline'
      bateria: 88,
      tipoConexao: 'Wi-Fi / 4G',
    },
    {
      id: 'maq-2',
      nome: 'Maquininha Retirada Rápida',
      modelo: 'Stone Smart POS S920',
      serial: 'STN-8921-2044',
      ponto: 'todos',
      status: 'online',
      bateria: 95,
      tipoConexao: 'Wi-Fi',
    },
  ],
  taxas: {
    debito: 1.19, // %
    creditoVista: 2.89, // %
    creditoParcelado: 3.99, // %
    pix: 0.00, // %
    prazoRecebimento: 'D+1', // 'Na hora', 'D+1', 'D+30'
  },
  pix: {
    tipoChave: 'cnpj', // 'cnpj', 'cpf', 'email', 'telefone', 'aleatoria'
    chave: '12.345.678/0001-90',
    titular: 'Ao Ponto Assados & Rotisserie Ltda',
    cidade: 'São Paulo',
    qrcodeExemplo: '00020126360014BR.GOV.BCB.PIX0114123456780001905204000053039865802BR5925Ao Ponto Assados Ltda6009SAO PAULO62070503***6304E2CA',
  },
  modoOperacao: 'tef_smartpos', // 'tef_smartpos' (envio automático p/ tela da máquina) ou 'manual'
};

let whatsappSalvo = JSON.parse(localStorage.getItem('fa-whatsapp') || 'null');
if (!whatsappSalvo || !whatsappSalvo.config?.nomeEstabelecimento || JSON.stringify(whatsappSalvo.templates || []).includes('🍗') || JSON.stringify(whatsappSalvo.templates || []).includes('\uFFFD')) {
  whatsappSalvo = JSON.parse(JSON.stringify(WHATSAPP_PADRAO));
  localStorage.setItem('fa-whatsapp', JSON.stringify(whatsappSalvo));
}

const pagamentosSalvos = JSON.parse(localStorage.getItem('fa-pagamentos') || 'null') || JSON.parse(JSON.stringify(PAGAMENTOS_PADRAO));

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
  whatsapp: whatsappSalvo,
  pagamentos: pagamentosSalvos,
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
  isDemo: () => {
    const u = estado.usuario;
    const t = estado.tenant || getTenantAtivo();
    if (!u && !t) return true;
    if (u && (u.id === 'user_demo' || u.username === 'demo')) return true;
    if (t && (t.id === 'tenant_demo' || t.slug === 'frango-demo')) return true;
    return false;
  },
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

  /** Importa múltiplos clientes em lote (WhatsApp, CSV, TXT, VCF) */
  importarClientesEmLote: (lista = []) => {
    const existentes = estado.clientes || [];
    const telefonesCadastrados = new Set(
      existentes.map((c) => (c.telefone || '').replace(/\D/g, '')).filter(Boolean)
    );
    const tenantId = (estado.tenant || getTenantAtivo())?.id || 'tenant_demo';

    let adicionados = 0;
    let duplicados = 0;
    const novosParaAdicionar = [];

    lista.forEach((item, idx) => {
      const telLimpo = (item.telefone || '').replace(/\D/g, '');
      if (!telLimpo && !item.nome) return;

      if (telLimpo && telefonesCadastrados.has(telLimpo)) {
        duplicados++;
        return;
      }

      if (telLimpo) {
        telefonesCadastrados.add(telLimpo);
      }

      let nomeCliente = (item.nome || '').trim();
      if (!nomeCliente) {
        const ultimosDigitos = telLimpo.slice(-4) || `${idx + 1}`;
        nomeCliente = `Cliente WhatsApp ${ultimosDigitos}`;
      }

      let telFormatado = item.telefone || '';
      if (telLimpo.length === 11) {
        telFormatado = `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 7)}-${telLimpo.slice(7)}`;
      } else if (telLimpo.length === 10) {
        telFormatado = `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 6)}-${telLimpo.slice(6)}`;
      }

      const novo = {
        id: `cli-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        tenantId,
        nome: nomeCliente,
        telefone: telFormatado,
        bairro: item.bairro || 'Balcão',
        tag: 'novo',
        totalPedidos: 0,
        totalGasto: 0,
        ultimaVisita: 'Recém-importado',
        preferencias: item.preferencias || '',
        pontosFidelidade: 0,
        recompensasResgatadas: 0,
        anotacoes: item.anotacoes || 'Importado via lote do WhatsApp',
        criadoEm: new Date().toISOString(),
      };

      novosParaAdicionar.push(novo);
      adicionados++;
    });

    if (novosParaAdicionar.length > 0) {
      estado.clientes = [...novosParaAdicionar, ...existentes];
      store.salvarClientes();
    }

    return { adicionados, duplicados, total: lista.length };
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

  // ── Central WhatsApp & Automações ───────────────────────────
  getWhatsapp: () => estado.whatsapp || WHATSAPP_PADRAO,

  salvarWhatsapp() {
    localStorage.setItem('fa-whatsapp', JSON.stringify(estado.whatsapp));
    notificar();
  },

  atualizarConfigWhatsapp: (novaConfig) => {
    estado.whatsapp.config = { ...estado.whatsapp.config, ...novaConfig };
    store.salvarWhatsapp();
  },

  toggleGatilhoWhatsapp: (gatilhoNome) => {
    if (!estado.whatsapp.config.gatilhos) estado.whatsapp.config.gatilhos = {};
    const atual = estado.whatsapp.config.gatilhos[gatilhoNome];
    estado.whatsapp.config.gatilhos[gatilhoNome] = !atual;
    store.salvarWhatsapp();
    return estado.whatsapp.config.gatilhos[gatilhoNome];
  },

  atualizarTemplateWhatsapp: (templateId, novoTexto) => {
    const t = (estado.whatsapp.templates || []).find((x) => x.id === templateId);
    if (t) {
      t.texto = novoTexto;
      store.salvarWhatsapp();
    }
  },

  registrarEnvioWhatsapp: (envio) => {
    const item = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      data: 'Hoje',
      cliente: envio.cliente || 'Cliente',
      telefone: envio.telefone || '',
      template: envio.template || 'Mensagem Avulsa',
      tipo: envio.tipo || 'manual', // 'automatico', 'campanha', 'manual'
      status: envio.status || 'lido', // 'enviado', 'entregue', 'lido'
      texto: envio.texto || '',
    };
    estado.whatsapp.historico = [item, ...(estado.whatsapp.historico || [])].slice(0, 50);
    store.salvarWhatsapp();
    return item;
  },

  // ── Módulo de Pagamentos, Provedores & Maquininhas ──────────
  getPagamentos: () => estado.pagamentos || PAGAMENTOS_PADRAO,

  salvarPagamentos() {
    localStorage.setItem('fa-pagamentos', JSON.stringify(estado.pagamentos));
    notificar();
  },

  atualizarConfigPagamentos: (novos) => {
    estado.pagamentos = { ...estado.pagamentos, ...novos };
    store.salvarPagamentos();
  },

  adicionarMaquininha: (dados) => {
    const nova = {
      id: `maq-${Date.now()}`,
      nome: dados.nome || 'Nova Maquininha',
      modelo: dados.modelo || 'Smart POS',
      serial: dados.serial || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      ponto: dados.ponto || 'todos',
      status: 'online',
      bateria: 100,
      tipoConexao: dados.tipoConexao || 'Wi-Fi / 4G',
    };
    if (!estado.pagamentos.maquininhas) estado.pagamentos.maquininhas = [];
    estado.pagamentos.maquininhas.push(nova);
    store.salvarPagamentos();
    return nova;
  },

  atualizarMaquininha: (id, dados) => {
    const maq = (estado.pagamentos.maquininhas || []).find((m) => m.id === id);
    if (!maq) return null;
    Object.assign(maq, dados);
    store.salvarPagamentos();
    return maq;
  },

  removerMaquininha: (id) => {
    estado.pagamentos.maquininhas = (estado.pagamentos.maquininhas || []).filter((m) => m.id !== id);
    store.salvarPagamentos();
  },

  adicionarCash: ({ valor, motivo, operador }) => {
    if (!estado.pagamentos.entradasCash) estado.pagamentos.entradasCash = [];
    const agora = new Date();
    const novaEntrada = {
      id: `cash_${Date.now()}`,
      valor: parseFloat(valor) || 0,
      motivo: motivo || 'Suprimento de Caixa / Entrada Manual',
      operador: operador || store.perfil().nome,
      hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      data: agora.toLocaleDateString('pt-BR'),
      timestamp: agora.toISOString()
    };
    estado.pagamentos.entradasCash.unshift(novaEntrada);
    store.salvarPagamentos();
    return novaEntrada;
  },

  getCashEntries: () => {
    return estado.pagamentos?.entradasCash || [];
  },

  calcularTaxaELiquido: (valorBruto = 0, metodo = 'dinheiro') => {
    const taxas = estado.pagamentos?.taxas || PAGAMENTOS_PADRAO.taxas;
    const v = parseFloat(valorBruto) || 0;
    let taxaPercentual = 0;

    const m = (metodo || '').toLowerCase();
    if (m === 'debito') taxaPercentual = taxas.debito || 0;
    else if (m === 'credito') taxaPercentual = taxas.creditoVista || 0;
    else if (m.includes('parcelado')) taxaPercentual = taxas.creditoParcelado || 0;
    else if (m === 'pix') taxaPercentual = taxas.pix || 0;
    else taxaPercentual = 0; // dinheiro

    const valorTaxa = +(v * (taxaPercentual / 100)).toFixed(2);
    const valorLiquido = +(v - valorTaxa).toFixed(2);

    return {
      valorBruto: v,
      taxaPercentual,
      valorTaxa,
      valorLiquido,
    };
  },
};
