/**
 * Telas ainda não construídas ("Em breve") e a tela de Menu do celular.
 */
import { icone } from '../components/icons.js';
import { ROTAS, rotasDoPerfil, modalPerfil, sair } from '../components/shell.js';
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
  const perfil = store.perfil();
  const itens = rotasDoPerfil().filter((r) => !r.principal);
  raiz.innerHTML = `
  <div style="margin-bottom: 20px;">
    <h1 style="font-size:24px;margin-bottom:4px">Menu</h1>
    <p style="color:var(--texto-suave);margin:0">Módulos e ferramentas disponíveis para: <strong>${perfil.papel}</strong></p>
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
  <div class="perfil-troca" style="margin-top:20px">
    <button class="perfil-op" id="menu-trocar-perfil"><span>${perfil.emoji}</span><span><strong>Trocar perfil (demonstração)</strong><small>Logado como ${perfil.nome}</small></span></button>
    <button class="perfil-op" id="menu-sair"><span>🚪</span><span><strong>Sair</strong><small>Encerrar sessão</small></span></button>
  </div>`;
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.ir)));
  raiz.querySelector('#menu-btn-suporte')?.addEventListener('click', () => abrirModalSuporte());
  raiz.querySelector('#menu-btn-sugestoes')?.addEventListener('click', () => abrirModalSugestoes());
  raiz.querySelector('#menu-trocar-perfil').addEventListener('click', () => modalPerfil(irPara));
  raiz.querySelector('#menu-sair').addEventListener('click', () => sair(irPara));
}
