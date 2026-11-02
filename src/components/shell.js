/**
 * CASCA DO APP (Header, Sidebar e Bottom Navigation)
 */
import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';
import { store } from '../state/store.js';
import { PONTOS, PERFIS } from '../data/mock.js';
import { PLANOS, logoutTenant } from '../data/tenants.js';

export const ROTAS = [
  { id: 'inicio', rotulo: 'Início', icone: 'home', principal: true },
  { id: 'vendas', rotulo: 'Vendas', icone: 'vendas', principal: true, desc: 'Controle de vendas e balcão' },
  { id: 'pedidos', rotulo: 'Pedidos', icone: 'calendario', principal: true, desc: 'Reservas e encomendas' },
  { id: 'estoque', rotulo: 'Estoque', icone: 'pacote', principal: true, desc: 'Frangos e insumos' },
  { id: 'clientes', rotulo: 'Clientes', icone: 'clientes', perfis: ['owner', 'admin'], desc: 'Histórico e fidelidade' },
  { id: 'usuarios', rotulo: 'Usuários', icone: 'usuarios', perfis: ['owner', 'admin'], desc: 'Equipe e permissões' },
  { id: 'whatsapp', rotulo: 'WhatsApp', icone: 'conversa', perfis: ['owner', 'admin'], desc: 'Central de atendimento' },
  { id: 'pagamentos', rotulo: 'Pagamentos', icone: 'cartao', perfis: ['owner'], desc: 'Máquinas e provedores' },
  { id: 'relatorios', rotulo: 'Relatórios', icone: 'grafico', perfis: ['owner', 'admin'], desc: 'Análises e exportação' },
  { id: 'master', rotulo: 'Painel Master', icone: 'grafico', perfis: ['superadmin'], desc: 'Gestão do SaaS e mensalidades' },
  { id: 'planos', rotulo: 'Meu Plano', icone: 'grafico', perfis: ['owner'], desc: 'Planos e limites de uso' },
  { id: 'configuracoes', rotulo: 'Configurações', icone: 'config', perfis: ['owner', 'admin'], desc: 'Domínio e dados do negócio' },
];

export const ROTAS_SAAS = [
  { id: 'master-inicio', subAba: 'inicio', rotulo: 'Início (KPIs)', icone: 'home', desc: 'KPIs do SaaS e Associados' },
  { id: 'master-vendas', subAba: 'vendas', rotulo: 'Vendas dos Associados', icone: 'vendas', desc: 'Venda de cada associado por período' },
  { id: 'master-empresas', subAba: 'empresas', rotulo: 'Empresas (CNPJs)', icone: 'clientes', desc: 'CNPJs e localização geográfica' },
  { id: 'master-whatsapp', subAba: 'whatsapp', rotulo: 'WhatsApp da Rede', icone: 'conversa', desc: 'Contato e disparo no WhatsApp com 1 clique' },
  { id: 'master-pagamentos', subAba: 'pagamentos', rotulo: 'Cobrança & Mensalidades', icone: 'cartao', desc: 'Pix, boletos, planos e gráficos' },
];

export const rotasDoPerfil = () => {
  const p = store.get().perfil;
  if (p === 'superadmin') return ROTAS;
  return ROTAS.filter((r) => !r.perfis || r.perfis.includes(p));
};

export function renderShell(raiz, rotaAtual, irPara) {
  const st = store.get(), perfil = PERFIS[st.perfil] || PERFIS.owner;
  const tenant = store.getTenant();
  const rotas = rotasDoPerfil();
  const iniciais = (perfil.nome || 'AP').split(' ').map((p) => p[0]).slice(0, 2).join('');
  const nomePonto = st.ponto === 'todos' 
    ? (perfil.pontos?.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos?.[0])?.nome || 'Matriz') 
    : PONTOS.find((p) => p.id === st.ponto)?.nome || 'Matriz';
  
  const isModoSaas = rotaAtual.startsWith('master') || (st.modo === 'saas' && rotaAtual === 'configuracoes') || st.perfil === 'superadmin';
  const atual = ROTAS.find((r) => r.id === rotaAtual);
  const ativo = (id) => (id === rotaAtual || (id === 'menu' && !atual?.principal && rotaAtual !== 'inicio') ? 'aria-current="page"' : '');

  const rotasSaasNomes = {
    'master': 'Início (KPIs SaaS)',
    'master-inicio': 'Início (KPIs SaaS)',
    'master-vendas': 'Vendas dos Associados (SaaS)',
    'master-empresas': 'Empresas & Localização (CNPJs)',
    'master-whatsapp': 'WhatsApp da Rede de Associados',
    'master-pagamentos': 'Cobrança & Mensalidades (SaaS)',
    'configuracoes': 'Configurações da Plataforma',
  };
  const tituloHeader = isModoSaas ? (rotasSaasNomes[rotaAtual] || 'Painel Master (SaaS)') : (atual?.rotulo === 'Início' ? 'Ao Ponto' : atual?.rotulo || 'Menu');
  const subtituloHeader = isModoSaas ? '👑 Gestor Master da Rede de Assadeiras' : `${icone('local', 'mini')} ${nomePonto}`;

  function itemSaas(r) {
    const isAtivo = rotaAtual === r.id || (rotaAtual === 'master' && r.subAba === 'inicio');
    return `<button class="sb-item" data-ir="${r.id}" ${isAtivo ? 'aria-current="page"' : ''} title="${r.rotulo}">
      ${icone(r.icone)}<span>${r.rotulo}</span>
    </button>`;
  }

  function itemSb(r) {
    return `<button class="sb-item" data-ir="${r.id}" ${r.id === rotaAtual ? 'aria-current="page"' : ''} title="${r.rotulo}">
      ${icone(r.icone)}<span>${r.rotulo}</span>${r.etapa ? `<span class="tag-breve">Etapa ${r.etapa}</span>` : ''}
    </button>`;
  }

  // Montagem da Sidebar conforme o Modo
  let sidebarHtml = '';
  if (isModoSaas) {
    sidebarHtml = `
      <div class="logo">
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div>
          <div class="logo-nome">Ao Ponto</div>
          <div style="font-size: 10px; font-weight: 800; color: #EA580C; letter-spacing: 0.5px; text-transform: uppercase;">Modelo SaaS (Master)</div>
        </div>
      </div>
      <div class="sb-secao">Gestão dos CNPJs (SaaS)</div>
      ${ROTAS_SAAS.map(itemSaas).join('')}
      <div class="sb-secao">Plataforma & Apoio</div>
      <a href="/manual.html" target="_blank" class="sb-item" style="text-decoration:none" title="Manual do Usuário (PDF / Impressão)">${icone('info')}<span>Manual do Usuário</span></a>
      <a href="/treinamento-video.html" target="_blank" class="sb-item" style="text-decoration:none" title="Vídeo Treinamento Full HD 1080p">${icone('grafico')}<span>Vídeo Treinamento</span></a>
      <button class="sb-item" data-ir="configuracoes" ${rotaAtual === 'configuracoes' ? 'aria-current="page"' : ''} title="Configurações da Plataforma">${icone('config')}<span>Configurações</span></button>
      
      <div style="margin: 10px 4px 6px;">
        <button class="sb-item" data-acao="visao-loja" style="background: #FFF7ED; border: 1px solid #FFEDD5; color: #C2410C; font-weight: 700; font-size: 13px; border-radius: 8px; width: 100%; min-height: 40px; padding: 0 10px;" title="Alternar para ver a visão de uma assadeira">
          <span style="font-size: 16px; margin-right: 2px;">🏪</span><span>Visão da Assadeira</span>
        </button>
      </div>
      <button class="sb-item" data-acao="landing" title="Ver Apresentação B2B">${icone('globo')}<span>Apresentação B2B</span></button>
      ${(!st.usuario || st.usuario.id === 'user_demo') ? `<button class="sb-item" data-acao="perfil" title="Trocar perfil (demo)">${icone('trocar')}<span>Trocar perfil (demo)</span></button>` : ''}
      <button class="sb-item" data-acao="sair" title="Sair">${icone('sair')}<span>Sair</span></button>
    `;
  } else {
    sidebarHtml = `
      <div class="logo">
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div>
          <div class="logo-nome">Ao Ponto</div>
          <div style="font-size: 10px; font-weight: 700; color: var(--texto-suave);">Assadeira & Balcão</div>
        </div>
      </div>
      <div style="margin: 4px 4px 8px;">
        <button class="sb-item" data-acao="visao-saas" style="color: #EA580C; font-weight: 700; font-size: 13px; background: #FFF7ED; border-radius: 8px; border: 1px solid #FFEDD5; width: 100%; min-height: 40px; padding: 0 10px;" title="Painel Master do Dono da Plataforma SaaS">
          <span style="font-size: 16px; margin-right: 2px;">👑</span><span>Painel Master (SaaS)</span>
        </button>
      </div>
      <button class="btn btn-primario sb-nova" data-acao="nova-venda" title="Nova venda">${icone('mais')}<span>Nova venda</span></button>
      <div class="sb-secao">Principal</div>
      ${rotas.filter((r) => r.principal).map(itemSb).join('')}
      <div class="sb-secao">Gestão</div>
      ${rotas.filter((r) => !r.principal).map(itemSb).join('')}
      ${tenant ? `<div class="sb-plano-badge" data-ir="planos" title="Meu Plano">${icone('grafico')}<span>${PLANOS[tenant.plano]?.nome || 'Grátis'}</span></div>` : ''}
      <a href="/manual.html" target="_blank" class="sb-item" style="text-decoration:none" title="Manual do Usuário (PDF / Impressão)">${icone('info')}<span>Manual do Usuário</span></a>
      <a href="/treinamento-video.html" target="_blank" class="sb-item" style="text-decoration:none" title="Vídeo Treinamento Full HD 1080p">${icone('grafico')}<span>Vídeo Treinamento</span></a>
      <button class="sb-item" data-acao="landing" title="Ver Apresentação B2B">${icone('globo')}<span>Apresentação B2B</span></button>
      ${(!st.usuario || st.usuario.id === 'user_demo') ? `<button class="sb-item" data-acao="perfil" title="Trocar perfil (demo)">${icone('trocar')}<span>Trocar perfil (demo)</span></button>` : ''}
      <button class="sb-item" data-acao="sair" title="Sair">${icone('sair')}<span>Sair</span></button>
    `;
  }

  // Navegação Mobile Bottom
  const isAba = (sub) => (rotaAtual === `master-${sub}` || (rotaAtual === 'master' && sub === 'inicio'));
  const bottomNavHtml = isModoSaas ? `
    <nav class="bottom-nav" aria-label="Navegação SaaS">
      <button class="bn-item" data-ir="master-inicio" ${isAba('inicio') ? 'aria-current="page"' : ''} id="nav-saas-inicio">${icone('home')}<span>Início</span></button>
      <button class="bn-item" data-ir="master-vendas" ${isAba('vendas') ? 'aria-current="page"' : ''} id="nav-saas-vendas">${icone('vendas')}<span>Vendas</span></button>
      <button class="bn-item" data-ir="master-empresas" ${isAba('empresas') ? 'aria-current="page"' : ''} id="nav-saas-empresas">${icone('clientes')}<span>Empresas</span></button>
      <button class="bn-item" data-ir="master-whatsapp" ${isAba('whatsapp') ? 'aria-current="page"' : ''} id="nav-saas-whatsapp">${icone('conversa')}<span>WhatsApp</span></button>
      <button class="bn-item" data-ir="master-pagamentos" ${isAba('pagamentos') ? 'aria-current="page"' : ''} id="nav-saas-pagamentos">${icone('cartao')}<span>Pagamentos</span></button>
    </nav>` : `
    <nav class="bottom-nav" aria-label="Navegação">
      ${rotas.filter((r) => r.principal).map((r) => `<button class="bn-item" data-ir="${r.id}" ${ativo(r.id)} id="nav-${r.id}">${icone(r.icone)}<span>${r.rotulo}</span></button>`).join('')}
      <button class="bn-item" data-ir="menu" ${ativo('menu')} id="nav-menu">${icone('menu')}<span>Menu</span></button>
    </nav>`;

  const fabHtml = isModoSaas ? '' : `<button class="fab" aria-expanded="false" aria-label="Ações rápidas" id="btn-fab">${icone('mais')}</button>`;

  raiz.innerHTML = `
  <div class="app ${st.sidebarRecolhida ? 'recolhido' : ''}">
    <aside class="sidebar" aria-label="Menu principal">
      ${sidebarHtml}
    </aside>

    <div class="principal">
      <header class="topo">
        <button class="topo-btn btn-menu-lateral" data-acao="recolher" aria-label="Recolher ou expandir menu">${icone('painel')}</button>
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div class="topo-titulo">
          <strong>${tituloHeader}</strong>
          <small>${subtituloHeader}</small>
        </div>
        <button class="topo-btn" data-acao="notificacoes" aria-label="Notificações">${icone('sino')}<span class="ponto-notif"></span></button>
        <button class="avatar" data-acao="perfil" aria-label="Perfil de ${perfil.nome}">${iniciais}</button>
      </header>
      <main class="conteudo" id="conteudo"></main>
    </div>

    ${bottomNavHtml}
    ${fabHtml}
  </div>`;

  function itemSb(r) {
    return `<button class="sb-item" data-ir="${r.id}" ${r.id === rotaAtual ? 'aria-current="page"' : ''} title="${r.rotulo}">${icone(r.icone)}<span>${r.rotulo}</span>${r.etapa ? `<span class="tag-breve">Etapa ${r.etapa}</span>` : ''}</button>`;
  }

  // Eventos
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.ir)));
  raiz.querySelectorAll('[data-acao]').forEach((b) => b.addEventListener('click', () => acoes[b.dataset.acao]?.()));

  const fab = raiz.querySelector('#btn-fab');
  fab.addEventListener('click', () => {
    const aberto = fab.getAttribute('aria-expanded') === 'true';
    raiz.querySelector('.fab-menu')?.remove(); raiz.querySelector('.fab-fundo')?.remove();
    fab.setAttribute('aria-expanded', String(!aberto));
    if (aberto) return;
    const fundo = document.createElement('div'); fundo.className = 'fab-fundo';
    const menu = document.createElement('div'); menu.className = 'fab-menu';
    menu.innerHTML = `<button class="btn btn-escuro" data-q="novo-pedido">${icone('calendario')} Novo pedido / reserva</button>
                      <button class="btn btn-primario" data-q="nova-venda">${icone('vendas')} Nova venda (Gestão de Vendas)</button>`;
    const fechar = () => { menu.remove(); fundo.remove(); fab.setAttribute('aria-expanded', 'false'); };
    fundo.addEventListener('click', fechar);
    menu.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { fechar(); acoes[b.dataset.q](); }));
    raiz.querySelector('.app').append(fundo, menu);
  });

  const acoes = {
    'landing': () => irPara('landing'),
    'visao-saas': () => {
      store.set({ modo: 'saas', perfil: 'superadmin' });
      toast('Você entrou no Modo SaaS (Dono da Plataforma).', 'info');
      irPara('master-inicio');
    },
    'visao-loja': () => {
      store.set({ modo: 'loja', perfil: 'owner' });
      toast('Você alternou para a Visão da Assadeira (Loja).', 'info');
      irPara('inicio');
    },
    'nova-venda': () => irPara('vendas'),
    'novo-pedido': () => irPara('pedidos'),
    recolher: () => { store.set({ sidebarRecolhida: !store.get().sidebarRecolhida }); raiz.querySelector('.app').classList.toggle('recolhido'); },
    notificacoes: () => abrirModal(`
      <h2>Notificações</h2><p>Exemplos fictícios.</p>
      <div class="pontos-lista">
        <div class="ponto-linha"><div><strong>⏳ Reserva aguardando confirmação</strong><small>Pedido #1044 &bull; retirada 13:00</small></div></div>
        <div class="ponto-linha"><div><strong>🔥 2 frangos no espeto</strong><small>Ponto Centro &bull; há 12 min</small></div></div>
        <div class="ponto-linha"><div><strong>📈 Meta do dia 80% atingida</strong><small>Todos os pontos</small></div></div>
      </div>
      <div class="modal-acoes"><button class="btn btn-contorno btn-bloco" data-fechar>Fechar</button></div>`),
    perfil: () => modalPerfil(irPara),
    sair: () => sair(irPara),
  };
}

export function modalPerfil(irPara) {
  const st = store.get();
  const isDemo = !st.usuario || st.usuario.id === 'user_demo';

  if (!isDemo) {
    const u = st.usuario;
    const t = store.getTenant();
    const plano = PLANOS[t?.plano]?.nome || 'Comece Grátis';
    abrirModal(`
      <h2>Meu Perfil</h2>
      <p style="color:var(--texto-suave);margin-bottom:16px">Informações da sua conta cadastrada no Ao Ponto</p>
      <div style="background:#F8FAFC;border:1px solid var(--borda);border-radius:12px;padding:16px;margin-bottom:16px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:8px;">
          <span style="color:var(--texto-suave)">Nome:</span>
          <strong>${u.nome || 'Proprietário'}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:8px;">
          <span style="color:var(--texto-suave)">Estabelecimento:</span>
          <strong>${t?.nome || 'Minha Assadeira'}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:8px;">
          <span style="color:var(--texto-suave)">WhatsApp:</span>
          <strong>${u.celular || u.celularFormatado || 'Não informado'}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;border-bottom:1px solid #E2E8F0;padding-bottom:8px;">
          <span style="color:var(--texto-suave)">E-mail:</span>
          <strong>${u.email || 'Não informado'}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:var(--texto-suave)">Plano Atual:</span>
          <strong style="color:var(--brasa)">${plano}</strong>
        </div>
      </div>
      <div class="modal-acoes">
        <button class="btn btn-contorno btn-bloco" data-sair>${icone('sair')} Sair da conta</button>
        <button class="btn btn-fantasma btn-bloco" data-fechar>Fechar</button>
      </div>`, (m, fechar) => {
      m.querySelector('[data-sair]').addEventListener('click', () => { fechar(); sair(irPara); });
    });
    return;
  }

  abrirModal(`
    <h2>Trocar perfil (demonstração)</h2>
    <p>Veja como o menu e o dashboard mudam para cada tipo de usuário. <strong>Simulação visual - não é segurança real.</strong></p>
    <div class="perfil-troca">
      ${Object.values(PERFIS).map((p) => `<button class="perfil-op" data-p="${p.id}" aria-pressed="${p.id === st.perfil}"><span>${p.emoji}</span><span><strong>${p.nome}</strong><small>${p.papel} &bull; ${p.pontos.length === 3 ? 'todos os pontos' : p.pontos.map((id) => PONTOS.find((x) => x.id === id).nome).join(', ')}</small></span></button>`).join('')}
    </div>
    <div class="modal-acoes">
      <button class="btn btn-contorno btn-bloco" data-sair>${icone('sair')} Sair da sessão demonstrativa</button>
      <button class="btn btn-fantasma btn-bloco" data-fechar>Fechar</button>
    </div>`, (m, fechar) => {
    m.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
      fechar();
      store.set({ perfil: b.dataset.p, ponto: 'todos' });
      toast(`Agora você está vendo como: ${PERFIS[b.dataset.p].papel}`, 'info');
      irPara('inicio');
    }));
    m.querySelector('[data-sair]').addEventListener('click', () => { fechar(); sair(irPara); });
  });
}

export function sair(irPara) {
  abrirModal(`<h2>Sair da sessão?</h2><p>Você voltará para a tela de login.</p>
    <div class="modal-acoes"><button class="btn btn-primario btn-bloco" data-ok>Sim, sair</button><button class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button></div>`,
  (m, fechar) => m.querySelector('[data-ok]').addEventListener('click', () => {
    fechar();
    logoutTenant();
    store.set({ logado: false, tenant: null, usuario: null });
    toast('Você saiu da sessão.', 'info');
    irPara('login');
  }));
}
