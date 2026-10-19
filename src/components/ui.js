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
 * @param {string} html  conteúdo
 * @param {(el:HTMLElement, fechar:Function)=>void} aoAbrir  liga eventos
 */
export function abrirModal(html, aoAbrir) {
  const raiz = document.getElementById('modal-root');
  const fundo = document.createElement('div');
  fundo.className = 'modal-fundo';
  fundo.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-alca"></div>${html}</div>`;
  const fechar = () => { fundo.remove(); document.removeEventListener('keydown', esc); };
  const esc = (e) => e.key === 'Escape' && fechar();
  fundo.addEventListener('click', (e) => { if (e.target === fundo || e.target.closest('[data-fechar]')) fechar(); });
  document.addEventListener('keydown', esc);
  raiz.appendChild(fundo);
  aoAbrir?.(fundo.querySelector('.modal'), fechar);
  fundo.querySelector('input, button:not([data-fechar])')?.focus();
  return fechar;
}
