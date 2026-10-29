/**
 * ============================================================
 *  DADOS DE TENANTS (ESTABELECIMENTOS) E PLANOS — MOCK
 * ============================================================
 * No futuro: substituir por chamadas ao backend.
 * Mantém o mesmo formato de retorno para não mudar as telas.
 */

// ── Definição dos planos ────────────────────────────────────
export const PLANOS = {
  'plano-00': {
    id: 'plano-00',
    nome: 'Comece Grátis',
    preco: 0,
    precoFormatado: 'Grátis',
    limiteVendasMes: 10,
    recursos: [
      'Dashboard de vendas',
      'Registro de pedidos',
      'Até 10 vendas por mês',
      'Subdomínio automático',
    ],
    cor: '--verde',
    destaque: false,
  },
  'plano-01': {
    id: 'plano-01',
    nome: 'Balcão',
    preco: 79.0,
    precoFormatado: 'R$ 79,00/mês',
    limiteVendasMes: null, // ilimitado
    recursos: [
      'Tudo do plano gratuito',
      'Vendas ilimitadas',
      'Domínio personalizado',
      'Suporte por e-mail',
    ],
    cor: '--brasa',
    destaque: true,
  },
};

// ── Mock de tenants cadastrados ─────────────────────────────
const TENANTS_MOCK = [
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
    id: 'user_demo',
    tenantId: 'tenant_demo',
    email: 'demo@aoponto.app',
    celular: '11987654321',
    celularFormatado: '(11) 98765-4321',
    username: 'carlos',
    nome: 'Carlos Mendes',
    perfil: 'owner',
    createdAt: '2026-10-01T12:00:00Z',
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
  return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || 'null') || [...USUARIOS_MOCK];
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
  return Math.max(0, plano.limiteVendasMes - tenant.vendasMesAtual);
}
