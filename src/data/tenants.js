/**
 * ============================================================
 *  DADOS DE TENANTS (ESTABELECIMENTOS) E PLANOS — MOCK
 * ============================================================
 * No futuro: substituir por chamadas ao backend.
 * Mantém o mesmo formato de retorno para não mudar as telas.
 */

// ── Definição dos planos padrão e dinâmicos com suporte a Descontos Relâmpago ──
export const PLANOS_PADRAO = {
  'plano-00': {
    id: 'plano-00',
    nome: 'Comece Grátis (30 dias)',
    preco: 0,
    precoFormatado: 'Grátis por 30 dias',
    diasTrial: 30,
    valorMensalidadeAposTrial: 79.0,
    diaVencimento: 10,
    limiteVendasMes: null, // Ilimitado durante os 30 dias de teste
    recursos: [
      '30 dias de teste grátis com vendas ilimitadas',
      'Dashboard e controle de vendas em tempo real',
      'Gestão de pedidos e encomendas',
      'Controle de estoque de insumos e produtos',
      'Subdomínio exclusivo (ponto.aoponto.app)',
      'Após 30 dias: R$ 79,00/mês (vence todo dia 10)',
    ],
    cor: '--verde',
    destaque: false,
    descontoRelampago: {
      ativo: false,
      precoPromocional: 0,
      valorAposTrialPromocional: 49.0,
      titulo: '⚡ Desconto na Primeira Mensalidade',
      tagBadge: '⚡ PROMOÇÃO TRIAL',
      validoAte: 'Por tempo limitado',
    },
  },
  'plano-01': {
    id: 'plano-01',
    nome: 'Balcão',
    preco: 79.0,
    precoFormatado: 'R$ 79,00/mês',
    diaVencimento: 10,
    limiteVendasMes: null, // ilimitado
    recursos: [
      'Tudo do plano de teste',
      'Vendas e pedidos ilimitados',
      'Cobrança mensal no dia 10 de cada mês',
      'Domínio personalizado (seuponto.com.br)',
      'Suporte prioritário via WhatsApp e e-mail',
    ],
    cor: '--brasa',
    destaque: true,
    descontoRelampago: {
      ativo: false,
      precoPromocional: 49.0,
      titulo: '⚡ Promoção Relâmpago - Primeiro Mês por R$ 49!',
      tagBadge: '⚡ FLASH SALE -38%',
      validoAte: 'Válido até domingo às 23:59',
    },
  },
  'plano-02': {
    id: 'plano-02',
    nome: 'Redes & Franquias',
    preco: 149.0,
    precoFormatado: 'R$ 149,00/mês',
    diaVencimento: 10,
    limiteVendasMes: null,
    recursos: [
      'Todos os recursos do Plano Balcão',
      'Gestão multi-unidades e franquias',
      'Relatórios e DRE consolidados da rede',
      'Taxa zero no Pix e assessoria de implantação',
      'Atendimento VIP via WhatsApp exclusivo',
    ],
    cor: '--ambar',
    destaque: false,
    descontoRelampago: {
      ativo: false,
      precoPromocional: 99.0,
      titulo: '⚡ Super Condição para Redes!',
      tagBadge: '⚡ REDES VIP -33%',
      validoAte: 'Por tempo limitado',
    },
  },
};

const CHAVE_PLANOS_CONFIG = 'ao-ponto-planos-config';

function carregarPlanosPersistidos() {
  try {
    const s = localStorage.getItem(CHAVE_PLANOS_CONFIG);
    if (!s) return JSON.parse(JSON.stringify(PLANOS_PADRAO));
    const obj = JSON.parse(s);
    return {
      'plano-00': { ...PLANOS_PADRAO['plano-00'], ...(obj['plano-00'] || {}) },
      'plano-01': { ...PLANOS_PADRAO['plano-01'], ...(obj['plano-01'] || {}) },
      'plano-02': { ...PLANOS_PADRAO['plano-02'], ...(obj['plano-02'] || {}) },
    };
  } catch (_) {
    return JSON.parse(JSON.stringify(PLANOS_PADRAO));
  }
}

export const PLANOS = carregarPlanosPersistidos();

export function salvarPlanosConfig(novosPlanos) {
  localStorage.setItem(CHAVE_PLANOS_CONFIG, JSON.stringify(novosPlanos));
  Object.keys(novosPlanos).forEach((k) => {
    PLANOS[k] = novosPlanos[k];
  });
  window.dispatchEvent(new CustomEvent('ao-ponto:planos-atualizados', { detail: novosPlanos }));
}

export function getPlanosConfig() {
  return carregarPlanosPersistidos();
}

export function temDescontoRelampagoAtivo() {
  const p = getPlanosConfig();
  return Object.values(p).some((pl) => pl.descontoRelampago?.ativo);
}

export function getPrecoEfetivoPlano(plano) {
  if (!plano) return 0;
  if (plano.descontoRelampago?.ativo && typeof plano.descontoRelampago.precoPromocional === 'number') {
    return plano.descontoRelampago.precoPromocional;
  }
  return plano.preco || 0;
}

export function aplicarDescontoRelampagoEmLote(porcentagem = 30) {
  const cfg = getPlanosConfig();
  const fator = (100 - porcentagem) / 100;

  if (cfg['plano-01']) {
    const precoPromo = Math.round(cfg['plano-01'].preco * fator);
    cfg['plano-01'].descontoRelampago = {
      ativo: true,
      precoPromocional: precoPromo,
      titulo: `⚡ Oferta Relâmpago com ${porcentagem}% OFF!`,
      tagBadge: `⚡ FLASH SALE -${porcentagem}%`,
      validoAte: 'Válido por tempo limitado',
    };
  }

  if (cfg['plano-02']) {
    const precoPromo = Math.round(cfg['plano-02'].preco * fator);
    cfg['plano-02'].descontoRelampago = {
      ativo: true,
      precoPromocional: precoPromo,
      titulo: `⚡ Oferta Relâmpago Redes com ${porcentagem}% OFF!`,
      tagBadge: `⚡ FLASH SALE -${porcentagem}%`,
      validoAte: 'Válido por tempo limitado',
    };
  }

  if (cfg['plano-00']) {
    cfg['plano-00'].descontoRelampago = {
      ...cfg['plano-00'].descontoRelampago,
      ativo: true,
      valorAposTrialPromocional: Math.round(cfg['plano-00'].valorMensalidadeAposTrial * fator),
    };
  }

  salvarPlanosConfig(cfg);
  return cfg;
}

export function desativarTodosDescontosRelampago() {
  const cfg = getPlanosConfig();
  Object.keys(cfg).forEach((k) => {
    if (cfg[k].descontoRelampago) {
      cfg[k].descontoRelampago.ativo = false;
    }
  });
  salvarPlanosConfig(cfg);
  return cfg;
}

export function redefinirPlanosPadrao() {
  localStorage.removeItem(CHAVE_PLANOS_CONFIG);
  const def = JSON.parse(JSON.stringify(PLANOS_PADRAO));
  Object.keys(def).forEach((k) => {
    PLANOS[k] = def[k];
  });
  window.dispatchEvent(new CustomEvent('ao-ponto:planos-atualizados', { detail: def }));
  return def;
}

// ── Mock de tenants cadastrados ─────────────────────────────
const TENANTS_MOCK = [
  {
    id: '10dc59e8-dce5-4ebd-9600-9a0d363036d2',
    slug: 'master',
    nome: 'Ao Ponto SaaS (Master)',
    cnpj: null,
    plano: 'plano-02',
    planoAtivadoEm: '2026-11-08',
    vendasMesAtual: 0,
    bloqueado: false,
  },
  {
    id: 'tenant_demo',
    slug: 'frango-demo',
    nome: 'Frango Assado Demo',
    cnpj: null,
    plano: 'plano-00',
    planoAtivadoEm: '2026-10-01',
    dominioCustom: null,
    dominioCustomStatus: null,
    vendasMesAtual: 3,
    createdAt: '2026-10-01T12:00:00Z',
  },
];

// ── Mock de usuários ────────────────────────────────────────
const USUARIOS_MOCK = [
  {
    id: '470e6456-fdb1-43d2-9196-32bee9c55bec',
    tenantId: '10dc59e8-dce5-4ebd-9600-9a0d363036d2',
    email: 'allexandregabbera@gmail.com',
    celular: '11999998877',
    celularFormatado: '(11) 99999-8877',
    username: 'alexandre',
    nome: 'Alexandre Gabbera',
    cargo: 'Gestor Master da Plataforma',
    perfil: 'master_saas',
    role: 'master_saas',
    pontos: ['todos'],
    status: 'ativo',
    createdAt: '2026-11-08T16:47:31Z',
  },
  {
    id: 'user_demo',
    tenantId: 'tenant_demo',
    email: 'demo@aoponto.app',
    celular: '11987654321',
    celularFormatado: '(11) 98765-4321',
    username: 'carlos',
    nome: 'Carlos Mendes',
    cargo: 'Proprietário & Mestre Assador',
    perfil: 'owner',
    pontos: ['todos'],
    status: 'ativo',
    createdAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'user_juliana',
    tenantId: 'tenant_demo',
    email: 'juliana@aoponto.app',
    celular: '11999991122',
    celularFormatado: '(11) 99999-1122',
    username: 'juliana',
    nome: 'Juliana Rocha',
    cargo: 'Gerente Operacional & Estoque',
    perfil: 'admin',
    pontos: ['centro', 'jardim'],
    status: 'ativo',
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'user_ze',
    tenantId: 'tenant_demo',
    email: 'ze.batista@aoponto.app',
    celular: '11988883344',
    celularFormatado: '(11) 98888-3344',
    username: 'zebatista',
    nome: 'Zé Batista',
    cargo: 'Operador de Máquina / Frangueiro',
    perfil: 'vendedor',
    pontos: ['centro'],
    status: 'ativo',
    createdAt: '2026-10-10T14:30:00Z',
  },
  {
    id: 'user_mariana',
    tenantId: 'tenant_demo',
    email: 'mariana.costa@aoponto.app',
    celular: '11977775566',
    celularFormatado: '(11) 97777-5566',
    username: 'mariana',
    nome: 'Mariana Costa',
    cargo: 'Atendente de Caixa & Balcão',
    perfil: 'vendedor',
    pontos: ['todos'],
    status: 'ativo',
    createdAt: '2026-10-15T09:15:00Z',
  },
];

// ── Chave do localStorage ───────────────────────────────────
const CHAVE_TENANTS = 'fa-tenants';
const CHAVE_USUARIOS = 'fa-usuarios';
const CHAVE_TENANT_ATIVO = 'fa-tenant-ativo';

// Carrega ou inicializa o banco mock no localStorage
function carregarTenants() {
  return JSON.parse(localStorage.getItem(CHAVE_TENANTS) || 'null') || [...TENANTS_MOCK];
}
function carregarUsuarios() {
  let us = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || 'null');
  if (!us || us.length <= 1) {
    us = [...USUARIOS_MOCK];
    salvarUsuarios(us);
  }
  return us;
}
function salvarTenants(ts) { localStorage.setItem(CHAVE_TENANTS, JSON.stringify(ts)); }
function salvarUsuarios(us) { localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(us)); }

// ── API mock de tenants ──────────────────────────────────────

/** Retorna o tenant ativo (armazenado em sessionStorage) */
export function getTenantAtivo() {
  const id = sessionStorage.getItem(CHAVE_TENANT_ATIVO);
  if (!id) return null;
  return carregarTenants().find((t) => t.id === id) || null;
}

/** Persiste alterações no tenant ativo */
export function atualizarTenantAtivo(parcial) {
  const tenants = carregarTenants();
  const id = sessionStorage.getItem(CHAVE_TENANT_ATIVO);
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx === -1) return;
  Object.assign(tenants[idx], parcial);
  salvarTenants(tenants);
  return tenants[idx];
}

/** Cria um novo tenant + usuário owner */
export function cadastrarEstabelecimento({ nomeEstabelecimento, slug, celular, email, nome, senha }) {
  const tenants = carregarTenants();
  const usuarios = carregarUsuarios();

  // Valida unicidade do slug
  if (tenants.some((t) => t.slug === slug)) {
    throw new Error('Este endereço já está em uso. Escolha outro.');
  }
  // Valida unicidade do email
  const celLimpo = (celular || '').replace(/\D/g, '');
  if (celLimpo && usuarios.some((u) => (u.celular || '').replace(/\D/g, '') === celLimpo)) {
    throw new Error('Este número de celular já possui uma conta.');
  }
  if (email && usuarios.some((u) => u.email?.toLowerCase() === email.toLowerCase())) {
    throw new Error('Este e-mail já possui uma conta.');
  }

  const tenantId = 'tenant_' + Math.random().toString(36).slice(2, 10);
  const userId = 'user_' + Math.random().toString(36).slice(2, 10);
  const agora = new Date().toISOString();

  const tenant = {
    id: tenantId,
    slug,
    nome: nomeEstabelecimento,
    cnpj: null,
    plano: 'plano-00',
    planoAtivadoEm: agora.slice(0, 10),
    trialDias: 30,
    trialExpiraEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    diaVencimento: 10,
    valorMensalidade: 79.0,
    dominioCustom: null,
    dominioCustomStatus: null,
    vendasMesAtual: 0,
    createdAt: agora,
  };
  const usuario = {
    id: userId,
    tenantId,
    email: email || `${slug}@aoponto.app`,
    celular: celLimpo,
    celularFormatado: celular,
    username: slug,
    nome,
    perfil: 'owner',
    createdAt: agora,
  };

  tenants.push(tenant);
  usuarios.push(usuario);
  salvarTenants(tenants);
  salvarUsuarios(usuarios);

  return { tenant, usuario };
}

/** Login: valida credenciais e ativa o tenant na sessão */
export function loginTenant(identificador, senha) {
  if (senha === 'errada') throw new Error('Usuário ou senha incorretos.');
  if (senha.length < 4) throw new Error('Senha deve ter pelo menos 4 caracteres.');

  const usuarios = carregarUsuarios();
  // Para o mock, qualquer e-mail válido com senha ≥ 4 funciona
  const termo = (identificador || '').trim().toLowerCase();
  const digits = termo.replace(/\D/g, '');
  let usuario = usuarios.find((u) => {
    const cel = (u.celular || '').replace(/\D/g, '');
    const em = (u.email || '').toLowerCase();
    const us = (u.username || '').toLowerCase();
    if (digits.length >= 8 && cel.includes(digits)) return true;
    if (em && em === termo) return true;
    if (us && us === termo) return true;
    const nome = (u.nome || '').toLowerCase();
    if (nome && (nome === termo || nome.startsWith(termo))) return true;
    return false;
  });
  if (!usuario) {
    // fallback: usa o demo (simulação)
    usuario = usuarios[0];
  }

  const tenants = carregarTenants();
  const tenant = tenants.find((t) => t.id === usuario.tenantId);
  if (!tenant) throw new Error('Estabelecimento não encontrado.');

  sessionStorage.setItem(CHAVE_TENANT_ATIVO, tenant.id);
  return { usuario, tenant };
}

/** Incrementa o contador de vendas do mês (retorna novo valor) */
export function registrarVendaTenant() {
  const tenant = getTenantAtivo();
  if (!tenant) return 0;
  const plano = PLANOS[tenant.plano];

  if (plano.limiteVendasMes !== null && tenant.vendasMesAtual >= plano.limiteVendasMes) {
    throw new Error('LIMITE_ATINGIDO');
  }

  const atualizado = atualizarTenantAtivo({ vendasMesAtual: tenant.vendasMesAtual + 1 });
  return atualizado.vendasMesAtual;
}

/** Simula upgrade de plano */
export function fazerUpgrade(planoId) {
  if (!PLANOS[planoId]) throw new Error('Plano inválido.');
  return atualizarTenantAtivo({ plano: planoId, planoAtivadoEm: new Date().toISOString().slice(0, 10) });
}

/** Configura domínio personalizado (apenas plano pago) */
export function configurarDominioCustom(dominio) {
  const tenant = getTenantAtivo();
  const plano = PLANOS[tenant?.plano];
  if (!plano || plano.preco === 0) {
    throw new Error('Domínio personalizado disponível apenas no plano pago.');
  }
  // Simula status "pendente" (em produção: verificar CNAME)
  return atualizarTenantAtivo({
    dominioCustom: dominio,
    dominioCustomStatus: 'pendente',
  });
}

/** Verifica CNAME (simulação: após 3s vira 'ativo') */
export function verificarDominioCustom() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const t = atualizarTenantAtivo({ dominioCustomStatus: 'ativo' });
      resolve(t);
    }, 3000);
  });
}

/** Encerra a sessão do tenant */
export function logoutTenant() {
  sessionStorage.removeItem(CHAVE_TENANT_ATIVO);
}

/** Retorna o plano do tenant ativo */
export function getPlanoAtivo() {
  const tenant = getTenantAtivo();
  return tenant ? PLANOS[tenant.plano] : null;
}

/** Retorna quantas vendas restam no mês (null = ilimitado) */
export function vendasRestantes() {
  const tenant = getTenantAtivo();
  const plano = getPlanoAtivo();
  if (!tenant || !plano) return null;
  if (plano.limiteVendasMes === null) return null;
  return Math.max(0, plano.limiteVendasMes - (tenant.vendasMesAtual || 0));
}

/** Retorna quantos dias de teste gratuito ainda restam */
export function diasTrialRestantes(tenant = null) {
  const t = tenant || getTenantAtivo();
  if (!t || t.plano !== 'plano-00') return 0;
  if (t.trialExpiraEm) {
    const diff = Math.ceil((new Date(t.trialExpiraEm) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }
  const criacao = t.createdAt ? new Date(t.createdAt) : new Date();
  const expira = new Date(criacao.getTime() + 30 * 24 * 60 * 60 * 1000);
  const diff = Math.ceil((expira - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}


/** Lista os usuários da equipe do tenant */
export function listarUsuariosTenant(tenantId = null) {
  const tId = tenantId || getTenantAtivo()?.id || 'tenant_demo';
  const usuarios = carregarUsuarios();
  return usuarios.filter((u) => u.tenantId === tId);
}

/** Adiciona novo membro à equipe */
export function adicionarUsuarioTenant(dados) {
  const usuarios = carregarUsuarios();
  const tenant = getTenantAtivo();
  const tenantId = tenant?.id || 'tenant_demo';
  const celLimpo = (dados.celular || '').replace(/\D/g, '');

  if (dados.email && usuarios.some((u) => u.email?.toLowerCase() === dados.email.toLowerCase() && u.tenantId === tenantId)) {
    throw new Error('Já existe um membro na equipe com este e-mail.');
  }

  const novo = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    tenantId,
    nome: dados.nome || 'Membro da Equipe',
    email: dados.email || '',
    celular: celLimpo,
    celularFormatado: dados.celular || '',
    cargo: dados.cargo || 'Operador de Balcão & Caixa',
    perfil: dados.perfil || 'vendedor',
    pontos: dados.pontos || ['todos'],
    status: dados.status || 'ativo',
    createdAt: new Date().toISOString(),
  };

  usuarios.push(novo);
  salvarUsuarios(usuarios);
  return novo;
}

/** Atualiza dados de um usuário da equipe */
export function atualizarUsuarioTenant(id, dados) {
  const usuarios = carregarUsuarios();
  const idx = usuarios.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('Usuário não encontrado.');
  usuarios[idx] = { ...usuarios[idx], ...dados };
  salvarUsuarios(usuarios);
  return usuarios[idx];
}

/** Remove um usuário da equipe */
export function removerUsuarioTenant(id) {
  let usuarios = carregarUsuarios();
  const alvo = usuarios.find((u) => u.id === id);
  if (alvo?.perfil === 'owner') {
    throw new Error('Não é possível remover o Proprietário principal da conta.');
  }
  usuarios = usuarios.filter((u) => u.id !== id);
  salvarUsuarios(usuarios);
  return true;
}
