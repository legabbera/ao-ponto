/**
 * Componentes de interface reutilizáveis: avisos (toast) e janelas (modal).
 */
import { icone } from './icons.js';

/** Mostra um aviso rápido na tela. tipo: 'sucesso' | 'erro' | 'info' */
export function toast(mensagem, tipo = 'sucesso') {
  const raiz = document.getElementById('toast-root');
  const el = document.createElement('div');
  const ic = { sucesso: 'ok', erro: 'alerta', info: 'info' }[tipo];
  el.className = `toast ${tipo}`;
  el.innerHTML = `${icone(ic)}<span>${mensagem}</span>`;
  raiz.appendChild(el);
  setTimeout(() => { el.classList.add('saindo'); setTimeout(() => el.remove(), 300); }, 3200);
}

/**
 * Abre uma janela (modal). Retorna uma função para fechar.
 * Suporta tanto a assinatura legado: abrirModal(htmlString, aoAbrirCallback)
 * quanto a assinatura de opções: abrirModal({ titulo, html, aoAbrir })
 * @param {string|object} conteudoOuOpcoes conteúdo HTML ou objeto com { titulo, html, aoAbrir }
 * @param {(el:HTMLElement, fechar:Function)=>void} [callbackAoAbrir] liga eventos (caso use assinatura legada)
 */
export function abrirModal(conteudoOuOpcoes, callbackAoAbrir) {
  const raiz = document.getElementById('modal-root');
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';

  let conteudoHtml = '';
  let aoAbrir = callbackAoAbrir;

  if (typeof conteudoOuOpcoes === 'object' && conteudoOuOpcoes !== null) {
    const { titulo, html = '', aoAbrir: cb } = conteudoOuOpcoes;
    if (cb) aoAbrir = cb;
    conteudoHtml = `
      ${titulo ? `<div class="modal-cabecalho" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--borda, #eee); padding-bottom: 10px;">
        <h2 style="margin: 0; font-size: 1.15rem; color: var(--carvao, #222);">${titulo}</h2>
        <button type="button" class="btn-fechar-modal" data-fechar style="background: none; border: 0; font-size: 22px; cursor: pointer; color: var(--texto-suave, #888); line-height: 1;">&times;</button>
      </div>` : ''}
      ${html}
    `;
  } else {
    conteudoHtml = conteudoOuOpcoes || '';
  }

  fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-alca"></div>${conteudoHtml}</div>`;
  const fechar = () => { fundo.remove(); document.removeEventListener('keydown', esc); };
  const esc = (e) => e.key === 'Escape' && fechar();
  fundo.addEventListener('click', (e) => { if (e.target === fundo || e.target.closest('[data-fechar]')) fechar(); });
  document.addEventListener('keydown', esc);
  raiz.appendChild(fundo);
  aoAbrir?.(fundo.querySelector('.modal'), fechar);
  fundo.querySelector('input, button:not([data-fechar])')?.focus();
  return fechar;
}
