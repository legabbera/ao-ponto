/**
 * Telas ainda não construídas ("Em breve") e a tela de Menu do celular.
 */
import { icone } from '../components/icons.js';
import { ROTAS, rotasDoPerfil, modalPerfil, modalMeuPerfil, sair } from '../components/shell.js';
import { store } from '../state/store.js';
import { abrirModalSuporte, abrirModalSugestoes } from '../components/modal-ajuda.js';

export function renderEmBreve(raiz, rotaId, irPara) {
  const r = ROTAS.find((x) => x.id === rotaId);
  raiz.innerHTML = `
  <div class="card em-breve"><div class="vazio">
    <div class="vazio-icone">${icone(r.icone)}</div>
    <h3>${r.rotulo} — em construção</h3>
    <p>Esta tela será criada na <strong>Etapa ${r.etapa}</strong>, depois da sua aprovação do visual e do dashboard.</p>
    <button class="btn btn-primario" id="btn-voltar-inicio" style="margin-top:12px">${icone('home')} Voltar ao início</button>
  </div></div>`;
  raiz.querySelector('#btn-voltar-inicio').addEventListener('click', () => irPara('inicio'));
}

export function renderMenu(raiz, irPara) {
  const st = store.get();
  const perfil = store.perfil();
  const isDemo = store.isDemo ? store.isDemo() : (!st.usuario || st.usuario.id === 'user_demo');
  const tenant = store.getTenant ? store.getTenant() : st.tenant;
  const nomeExibicao = (!isDemo && st.usuario?.nome) ? st.usuario.nome : perfil.nome;
  const papelExibicao = (!isDemo && (st.usuario?.role || tenant?.nome)) ? (st.usuario.role || 'Administrador') : perfil.papel;
  const itens = rotasDoPerfil().filter((r) => !r.principal);
  const isDark = document.documentElement.classList.contains('dark');

  raiz.innerHTML = `
  <div style="margin-bottom: 16px;">
    <h1 style="font-size:24px;margin-bottom:4px">Menu</h1>
    <p style="color:var(--texto-suave);margin:0">Módulos e ferramentas disponíveis para: <strong>${papelExibicao}</strong></p>
  </div>

  <!-- Chave Slide Dark Mode / Clear Mode no topo do Menu -->
  <div style="background:var(--creme); border:1.5px solid var(--borda); border-radius:14px; padding:12px 16px; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:22px;" id="menu-icone-tema">${isDark ? '🌙' : '☀️'}</span>
      <div>
        <strong style="font-size:14px; color:var(--carvao); display:block;" id="menu-label-tema">
          ${isDark ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}
        </strong>
        <small style="color:var(--texto-suave); font-size:11px;">Alternar contraste visual (claro / escuro)</small>
      </div>
    </div>
    <label class="switch-slide" title="Alternar Modo Escuro / Claro">
      <input type="checkbox" id="menu-toggle-tema-dark" ${isDark ? 'checked' : ''} />
      <span class="slider"></span>
    </label>
  </div>

  <div class="menu-grade">
    ${itens.map((r) => `
      <button class="menu-card" data-ir="${r.id}" id="menu-${r.id}">
        <span class="mc-ic">${icone(r.icone)}</span>
        <div class="menu-card-conteudo">
          <strong class="menu-card-titulo">${r.rotulo}</strong>
          <span class="menu-card-desc">${r.desc || ''}</span>
        </div>
        <span class="menu-card-seta">&rarr;</span>
      </button>
    `).join('')}
  </div>
  <div style="margin-top:24px; margin-bottom:12px;">
    <h3 style="font-size:16px; font-weight:700; color:var(--carvao); margin:0 0 10px 0;">Ajuda & Apoio</h3>
    <div class="menu-grade">
      <a href="/manual.html" target="_blank" class="menu-card" style="text-decoration:none;">
        <span class="mc-ic">${icone('info')}</span>
        <div class="menu-card-conteudo">
          <strong class="menu-card-titulo">Manual do Usuário (PDF)</strong>
          <span class="menu-card-desc">Guia passo a passo completo de cada ferramenta</span>
        </div>
        <span class="menu-card-seta">&rarr;</span>
      </a>
      <a href="/treinamento-video.html" target="_blank" class="menu-card" style="text-decoration:none;">
        <span class="mc-ic">${icone('grafico')}</span>
        <div class="menu-card-conteudo">
          <strong class="menu-card-titulo">Vídeo de Treinamento</strong>
          <span class="menu-card-desc">Apresentação narrada interativa em Full HD 1080p</span>
        </div>
        <span class="menu-card-seta">&rarr;</span>
      </a>
      <button class="menu-card" id="menu-btn-suporte">
        <span class="mc-ic">${icone('suporte')}</span>
        <div class="menu-card-conteudo">
          <strong class="menu-card-titulo">Suporte</strong>
          <span class="menu-card-desc">Atendimento direto com nossa equipe via WhatsApp</span>
        </div>
        <span class="menu-card-seta">&rarr;</span>
      </button>
      <button class="menu-card" id="menu-btn-sugestoes">
        <span class="mc-ic">${icone('lampada')}</span>
        <div class="menu-card-conteudo">
          <strong class="menu-card-titulo">Sugestões de melhorias</strong>
          <span class="menu-card-desc">Envie ideias e melhorias para o sistema</span>
        </div>
        <span class="menu-card-seta">&rarr;</span>
      </button>
    </div>
  </div>
  <div style="margin-top:24px; margin-bottom:12px;">
    <h3 style="font-size:16px; font-weight:700; color:var(--carvao); margin:0 0 10px 0;">Sessão & Conta</h3>
    <div class="menu-grade">
      ${isDemo ? `
        <button class="menu-card" id="menu-trocar-perfil">
          <span class="mc-ic">${perfil.emoji}</span>
          <div class="menu-card-conteudo">
            <strong class="menu-card-titulo">Trocar perfil (demonstração)</strong>
            <span class="menu-card-desc">Logado como ${perfil.nome} (${perfil.papel})</span>
          </div>
          <span class="menu-card-seta">&rarr;</span>
        </button>
      ` : `
        <button class="menu-card" id="menu-meu-perfil">
          <span class="mc-ic" style="color: var(--brasa); background: var(--creme);">${icone('usuarios')}</span>
          <div class="menu-card-conteudo">
            <strong class="menu-card-titulo">Meu Perfil</strong>
            <span class="menu-card-desc">Logado como ${nomeExibicao} &bull; ${tenant?.nome || 'Minha Loja'}</span>
          </div>
          <span class="menu-card-seta">&rarr;</span>
        </button>
      `}
      <button class="menu-card" id="menu-sair" style="border-color: rgba(220, 38, 38, 0.25);">
        <span class="mc-ic" style="color: #DC2626; background: #FEE2E2;">${icone('sair')}</span>
        <div class="menu-card-conteudo">
          <strong class="menu-card-titulo" style="color: #DC2626;">Sair</strong>
          <span class="menu-card-desc">Encerrar sessão e voltar ao início</span>
        </div>
        <span class="menu-card-seta" style="color: #DC2626;">&rarr;</span>
      </button>
    </div>
  </div>`;
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.ir)));
  
  const toggleMenu = raiz.querySelector('#menu-toggle-tema-dark');
  toggleMenu?.addEventListener('change', (e) => {
    const darkAtivo = e.target.checked;
    document.documentElement.classList.toggle('dark', darkAtivo);
    localStorage.setItem('ao-ponto-tema', darkAtivo ? 'dark' : 'light');
    const label = raiz.querySelector('#menu-label-tema');
    const ic = raiz.querySelector('#menu-icone-tema');
    if (label) label.textContent = darkAtivo ? 'Modo Escuro Ativo' : 'Modo Claro Ativo';
    if (ic) ic.textContent = darkAtivo ? '🌙' : '☀️';
    const icTopo = document.querySelector('#topo-icone-tema');
    if (icTopo) icTopo.textContent = darkAtivo ? '🌙' : '☀️';
    toast(darkAtivo ? 'Modo Escuro ativado! 🌙' : 'Modo Claro ativado! ☀️', 'info');
  });

  raiz.querySelector('#menu-btn-suporte')?.addEventListener('click', () => abrirModalSuporte());
  raiz.querySelector('#menu-btn-sugestoes')?.addEventListener('click', () => abrirModalSugestoes());
  if (isDemo) {
    raiz.querySelector('#menu-trocar-perfil')?.addEventListener('click', () => modalPerfil(irPara));
  } else {
    raiz.querySelector('#menu-meu-perfil')?.addEventListener('click', () => modalMeuPerfil(irPara));
  }
  raiz.querySelector('#menu-sair').addEventListener('click', () => sair(irPara));
}
