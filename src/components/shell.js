/**
 * CASCA DO APP (Header, Sidebar e Bottom Navigation)
 */
import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';
import { store } from '../state/store.js';
import { PONTOS, PERFIS } from '../data/mock.js';
import { PLANOS, logoutTenant, diasTrialRestantes } from '../data/tenants.js';
import { dispararInstalacaoPwa, isPwaInstalado } from './pwa-installer.js';

export const ROTAS = [
  { id: 'inicio', rotulo: 'Início', icone: 'home', principal: true },
  { id: 'vendas', rotulo: 'Vendas', icone: 'vendas', principal: true, desc: 'Controle de vendas e balcão' },
  { id: 'pedidos', rotulo: 'Pedidos', icone: 'pedidos', principal: true, desc: 'Reservas e encomendas' },
  { id: 'estoque', rotulo: 'Estoque', icone: 'pacote', principal: true, desc: 'Frangos e insumos' },
  { id: 'precificacao', rotulo: 'Calculadora de Preços', icone: 'dinheiro', principal: false, desc: 'Custos, ficha técnica e lucro real' },
  { id: 'clientes', rotulo: 'Clientes', icone: 'clientes', perfis: ['owner', 'admin'], desc: 'Histórico e fidelidade' },
  { id: 'usuarios', rotulo: 'Usuários', icone: 'usuarios', perfis: ['owner', 'admin'], desc: 'Equipe e permissões' },
  { id: 'whatsapp', rotulo: 'WhatsApp', icone: 'whatsapp', perfis: ['owner', 'admin'], desc: 'Central de atendimento' },
  { id: 'pagamentos', rotulo: 'Pagamentos', icone: 'cartao', perfis: ['owner'], desc: 'Máquinas e provedores' },
  { id: 'relatorios', rotulo: 'Relatórios', icone: 'grafico', perfis: ['owner', 'admin'], desc: 'Análises e exportação' },
  { id: 'planos', rotulo: 'Meu Plano', icone: 'grafico', perfis: ['owner'], desc: 'Planos e limites de uso' },
  { id: 'configuracoes', rotulo: 'Configurações', icone: 'config', perfis: ['owner', 'admin'], desc: 'Domínio e dados do negócio' },
];
export const rotasDoPerfil = () => ROTAS.filter((r) => !r.perfis || r.perfis.includes(store.get().perfil));

export function renderShell(raiz, rotaAtual, irPara) {
  const st = store.get(), perfil = PERFIS[st.perfil];
  const isDemo = store.isDemo ? store.isDemo() : (!st.usuario || st.usuario.id === 'user_demo');
  const tenant = store.getTenant();
  const rotas = rotasDoPerfil();
  const nomeExibicao = (!isDemo && st.usuario?.nome) ? st.usuario.nome : perfil.nome;
  const iniciais = nomeExibicao.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const nomePonto = st.ponto === 'todos' 
    ? (perfil.pontos.length > 1 ? 'Todos os pontos' : PONTOS.find((p) => p.id === perfil.pontos[0]).nome) 
    : PONTOS.find((p) => p.id === st.ponto)?.nome;
  const atual = ROTAS.find((r) => r.id === rotaAtual);
  const ativo = (id) => (id === rotaAtual || (id === 'menu' && !atual?.principal && rotaAtual !== 'inicio') ? 'aria-current="page"' : '');

  raiz.innerHTML = `
  <div class="app ${st.sidebarRecolhida ? 'recolhido' : ''}">
    <aside class="sidebar" aria-label="Menu principal">
      <div class="logo"><div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div><div><div class="logo-nome">Ao Ponto</div></div></div>
      <button class="btn btn-primario sb-nova" data-acao="nova-venda" title="Nova venda">${icone('mais')}<span>Nova venda</span></button>
      <div class="sb-secao">Principal</div>
      ${rotas.filter((r) => r.principal).map(itemSb).join('')}
      <div class="sb-secao">Gestão</div>
      ${rotas.filter((r) => !r.principal).map(itemSb).join('')}
        ${!isPwaInstalado() ? `<button class="sb-item" data-acao="instalar-app" title="Instalar Aplicativo no Celular / Computador" style="color:var(--brasa); font-weight:600;">${icone('mais')}<span>📲 Instalar App (PWA)</span></button>` : ''}
        ${tenant ? `<div class="sb-plano-badge" data-ir="planos" title="Meu Plano">${icone('grafico')}<span>${PLANOS[tenant.plano]?.nome || 'Grátis'}</span></div>` : ''}
        <a href="/manual.html" target="_blank" class="sb-item" style="text-decoration:none" title="Manual do Usuário (PDF / Impressão)">${icone('info')}<span>Manual do Usuário</span></a>
        <a href="/treinamento-video.html" target="_blank" class="sb-item" style="text-decoration:none" title="Vídeo Treinamento Full HD 1080p">${icone('grafico')}<span>Vídeo Treinamento</span></a>
        <button class="sb-item" data-acao="landing" title="Ver Apresentação B2B">${icone('globo')}<span>Apresentação B2B</span></button>
        ${isDemo ? `
          <button class="sb-item" data-acao="perfil" title="Trocar perfil (demo)">${icone('trocar')}<span>Trocar perfil (demo)</span></button>
        ` : `
          <button class="sb-item" data-acao="meu-perfil" title="Meu Perfil">${icone('usuarios')}<span>Meu Perfil</span></button>
        `}
        <button class="sb-item" data-acao="sair" title="Sair">${icone('sair')}<span>Sair</span></button>
    </aside>

    <div class="principal">
      <header class="topo">
        <button class="topo-btn btn-menu-lateral" data-acao="recolher" aria-label="Recolher ou expandir menu">${icone('painel')}</button>
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div class="topo-titulo">
          <strong>${atual?.rotulo === 'Início' ? 'Ao Ponto' : atual?.rotulo || 'Menu'}</strong>
          <small>${icone('local', 'mini')} ${nomePonto}</small>
        </div>
        <button class="topo-btn" data-acao="notificacoes" aria-label="Notificações">${icone('sino')}<span class="ponto-notif"></span></button>
        <button class="avatar" data-acao="${isDemo ? 'perfil' : 'meu-perfil'}" aria-label="Perfil de ${nomeExibicao}">${iniciais}</button>
      </header>
      <main class="conteudo" id="conteudo"></main>
    </div>

    <nav class="bottom-nav" aria-label="Navegação">
      ${rotas.filter((r) => r.principal).map((r) => `<button class="bn-item" data-ir="${r.id}" ${ativo(r.id)} id="nav-${r.id}">${icone(r.icone)}<span>${r.rotulo}</span></button>`).join('')}
      <button class="bn-item" data-ir="menu" ${ativo('menu')} id="nav-menu">${icone('menu')}<span>Menu</span></button>
    </nav>
    <button class="fab" aria-expanded="false" aria-label="Ações rápidas" id="btn-fab">${icone('mais')}</button>
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
    'meu-perfil': () => modalMeuPerfil(irPara),
    sair: () => sair(irPara),
    'instalar-app': () => dispararInstalacaoPwa(),
  };
}

export function modalPerfil(irPara) {
  const st = store.get();
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

export function modalMeuPerfil(irPara) {
  const st = store.get();
  const u = st.usuario || {};
  const t = st.tenant || {};
  const p = PLANOS[t.plano] || PLANOS['plano-00'];
  const diasRestantes = diasTrialRestantes(t);

  abrirModal(`
    <div style="text-align:center;margin-bottom:1.25rem;">
      <div class="avatar" style="width:56px;height:56px;font-size:22px;margin:0 auto 0.5rem auto;display:flex;align-items:center;justify-content:center;background:var(--brasa);color:#fff;border-radius:50%;">
        ${(u.nome || 'U').slice(0, 2).toUpperCase()}
      </div>
      <h2 style="margin:0 0 0.25rem 0;">${u.nome || 'Minha Conta'}</h2>
      <p style="margin:0;color:var(--texto-suave);font-size:14px;">${u.email || u.celularFormatado || ''}</p>
    </div>

    <div style="background:var(--creme-medio);border-radius:12px;padding:1rem;margin-bottom:1.25rem;font-size:14px;display:flex;flex-direction:column;gap:0.6rem;">
      <div style="display:flex;justify-content:space-between;gap:1rem;">
        <span style="color:var(--texto-suave);">Estabelecimento:</span>
        <strong>${t.nome || 'Meu Estabelecimento'}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:1rem;">
        <span style="color:var(--texto-suave);">Link do app:</span>
        <strong style="color:var(--brasa);">${t.slug ? `${t.slug}.aoponto.app` : '—'}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:1rem;">
        <span style="color:var(--texto-suave);">Plano ativo:</span>
        <span class="badge" style="background:#e8f5e9;color:#2e7d32;font-weight:700;">${p.nome}</span>
      </div>
      ${t.plano === 'plano-00' ? `
        <div style="display:flex;justify-content:space-between;gap:1rem;">
          <span style="color:var(--texto-suave);">Período de teste:</span>
          <strong>${diasRestantes} dias restantes</strong>
        </div>
        <div style="display:flex;justify-content:space-between;gap:1rem;">
          <span style="color:var(--texto-suave);">Mensalidade após teste:</span>
          <strong>R$ 79,00 (todo dia 10)</strong>
        </div>
      ` : `
        <div style="display:flex;justify-content:space-between;gap:1rem;">
          <span style="color:var(--texto-suave);">Vencimento mensal:</span>
          <strong>Todo dia 10 (R$ 79,00)</strong>
        </div>
      `}
    </div>

    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" id="btn-modal-meu-plano">${icone('grafico')} Ver detalhes do plano</button>
      <button class="btn btn-contorno btn-bloco" data-sair>${icone('sair')} Sair da conta</button>
      <button class="btn btn-fantasma btn-bloco" data-fechar>Fechar</button>
    </div>
  `, (m, fechar) => {
    m.querySelector('#btn-modal-meu-plano')?.addEventListener('click', () => {
      fechar();
      irPara('planos');
    });
    m.querySelector('[data-sair]')?.addEventListener('click', () => {
      fechar();
      sair(irPara);
    });
  });
}
