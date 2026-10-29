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
  { id: 'vendas', rotulo: 'Vendas', icone: 'vendas', principal: true, desc: 'PDV e caixa rápido' },
  { id: 'pedidos', rotulo: 'Pedidos', icone: 'calendario', principal: true, desc: 'Reservas e encomendas' },
  { id: 'estoque', rotulo: 'Estoque', icone: 'pacote', principal: true, etapa: 2, desc: 'Frangos e insumos' },
  { id: 'clientes', rotulo: 'Clientes', icone: 'clientes', etapa: 2, perfis: ['owner', 'admin'], desc: 'Histórico e fidelidade' },
  { id: 'usuarios', rotulo: 'Usuários', icone: 'usuarios', etapa: 2, perfis: ['owner', 'admin'], desc: 'Equipe e permissões' },
  { id: 'whatsapp', rotulo: 'WhatsApp', icone: 'conversa', etapa: 3, perfis: ['owner', 'admin'], desc: 'Central de atendimento' },
  { id: 'pagamentos', rotulo: 'Pagamentos', icone: 'cartao', etapa: 3, perfis: ['owner'], desc: 'Máquinas e provedores' },
  { id: 'relatorios', rotulo: 'Relatórios', icone: 'grafico', etapa: 3, perfis: ['owner', 'admin'], desc: 'Análises e exportação' },
  { id: 'planos', rotulo: 'Meu Plano', icone: 'grafico', perfis: ['owner'], desc: 'Planos e limites de uso' },
  { id: 'configuracoes', rotulo: 'Configurações', icone: 'config', perfis: ['owner', 'admin'], desc: 'Domínio e dados do negócio' },
];
export const rotasDoPerfil = () => ROTAS.filter((r) => !r.perfis || r.perfis.includes(store.get().perfil));

export function renderShell(raiz, rotaAtual, irPara) {
  const st = store.get(), perfil = PERFIS[st.perfil];
  const tenant = store.getTenant();
  const rotas = rotasDoPerfil();
  const iniciais = perfil.nome.split(' ').map((p) => p[0]).slice(0, 2).join('');
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
        ${tenant ? `<div class="sb-plano-badge" data-ir="planos" title="Meu Plano">${icone('grafico')}<span>${PLANOS[tenant.plano]?.nome || 'Grátis'}</span></div>` : ''}
        <button class="sb-item" data-acao="landing" title="Ver Apresentação B2B">${icone('globo')}<span>Apresentação B2B</span></button>
        <button class="sb-item" data-acao="perfil" title="Trocar perfil (demo)">${icone('trocar')}<span>Trocar perfil (demo)</span></button>
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
        <button class="avatar" data-acao="perfil" aria-label="Perfil de ${perfil.nome}">${iniciais}</button>
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
                      <button class="btn btn-primario" data-q="nova-venda">${icone('vendas')} Nova venda (PDV)</button>`;
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
    sair: () => sair(irPara),
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
