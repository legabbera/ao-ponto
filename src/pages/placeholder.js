/**
 * Telas ainda não construídas ("Em breve") e a tela de Menu do celular.
 */
import { icone } from '../components/icons.js';
import { ROTAS, rotasDoPerfil, modalPerfil, sair } from '../components/shell.js';
import { store } from '../state/store.js';

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
  <h1 style="font-size:24px;margin-bottom:4px">Menu</h1>
  <p style="color:var(--texto-suave);margin:0 0 16px">Itens disponíveis para: <strong>${perfil.papel}</strong></p>
  <div class="menu-grade">
    ${itens.map((r) => `<button class="menu-card" data-ir="${r.id}" id="menu-${r.id}"><span class="mc-ic">${icone(r.icone)}</span><span>${r.rotulo}<br><small>${r.desc} · Etapa ${r.etapa}</small></span></button>`).join('')}
  </div>
  <div class="perfil-troca" style="margin-top:20px">
    <button class="perfil-op" id="menu-trocar-perfil"><span>${perfil.emoji}</span><span><strong>Trocar perfil (demonstração)</strong><small>Logado como ${perfil.nome}</small></span></button>
    <button class="perfil-op" id="menu-sair"><span>🚪</span><span><strong>Sair</strong><small>Encerrar sessão demonstrativa</small></span></button>
  </div>`;
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.ir)));
  raiz.querySelector('#menu-trocar-perfil').addEventListener('click', () => modalPerfil(irPara));
  raiz.querySelector('#menu-sair').addEventListener('click', () => sair(irPara));
}
