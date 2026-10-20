/**
 * PONTO DE ENTRADA DO APP + ROTEADOR
 * Rota padrão: Landing Page B2B comercial
 * Rotas do App: #/app, #/login, #/inicio, #/vendas, #/pedidos, #/menu
 */
import './styles/tokens.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/landing.css';

import { store } from './state/store.js';
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderShell, rotasDoPerfil } from './components/shell.js';
import { renderDashboard, destruirDashboard } from './pages/dashboard.js';
import { renderVendas } from './pages/vendas.js';
import { renderPedidos } from './pages/pedidos.js';
import { renderEmBreve, renderMenu } from './pages/placeholder.js';

const app = document.getElementById('app');

export function irPara(rota) {
  if (location.hash === `#/${rota}`) render();
  else location.hash = `#/${rota}`;
}

function render() {
  let hashRota = location.hash.replace('#/', '').trim();
  destruirDashboard();
  window.scrollTo(0, 0);

  // Rota padrão vazia ou 'landing' -> exibe a Landing Page B2B
  if (!hashRota || hashRota === 'landing') {
    return renderLanding(app, irPara);
  }

  // Atalho para entrar no aplicativo
  if (hashRota === 'app') {
    hashRota = store.get().logado ? 'inicio' : 'login';
  }

  if (!store.get().logado) {
    if (hashRota !== 'login') return (location.hash = '#/login');
    return renderLogin(app, irPara);
  }

  if (hashRota === 'login') return (location.hash = '#/inicio');

  if (hashRota !== 'menu' && hashRota !== 'inicio' && !rotasDoPerfil().some((r) => r.id === hashRota)) {
    hashRota = 'inicio';
  }

  renderShell(app, hashRota, irPara);
  const conteudo = document.getElementById('conteudo');
  
  if (hashRota === 'inicio') renderDashboard(conteudo, irPara);
  else if (hashRota === 'vendas') renderVendas(conteudo, irPara);
  else if (hashRota === 'pedidos') renderPedidos(conteudo, irPara);
  else if (hashRota === 'menu') renderMenu(conteudo, irPara);
  else renderEmBreve(conteudo, hashRota, irPara);
}

window.addEventListener('hashchange', render);
render();
