/**
 * PONTO DE ENTRADA DO APP + ROTEADOR SIMPLES
 * A URL usa "#/nome-da-tela" (ex.: #/inicio). Assim o botão
 * "voltar" do celular funciona entre as telas.
 */
import './styles/tokens.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';

import { store } from './state/store.js';
import { renderLogin } from './pages/login.js';
import { renderShell, rotasDoPerfil } from './components/shell.js';
import { renderDashboard, destruirDashboard } from './pages/dashboard.js';
import { renderEmBreve, renderMenu } from './pages/placeholder.js';

const app = document.getElementById('app');

export function irPara(rota) {
  if (location.hash === `#/${rota}`) render();
  else location.hash = `#/${rota}`;
}

function render() {
  let rota = location.hash.replace('#/', '') || 'inicio';
  destruirDashboard();
  window.scrollTo(0, 0);

  if (!store.get().logado) { if (rota !== 'login') return (location.hash = '#/login'); return renderLogin(app, irPara); }
  if (rota === 'login') return (location.hash = '#/inicio');

  // perfil sem permissão para a tela → volta ao início
  if (rota !== 'menu' && rota !== 'inicio' && !rotasDoPerfil().some((r) => r.id === rota)) rota = 'inicio';

  renderShell(app, rota, irPara);
  const conteudo = document.getElementById('conteudo');
  if (rota === 'inicio') renderDashboard(conteudo, irPara);
  else if (rota === 'menu') renderMenu(conteudo, irPara);
  else renderEmBreve(conteudo, rota, irPara);
}

window.addEventListener('hashchange', render);
render();
