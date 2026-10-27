/**
 * PONTO DE ENTRADA DO APP + ROTEADOR (Ao Ponto Multi-tenant)
 * Rota padrão: Landing Page B2B comercial (#/landing)
 * Rotas públicas: #/login, #/cadastro
 * Rotas do App: #/inicio, #/vendas, #/pedidos, #/planos, #/configuracoes, #/menu
 */
import './styles/tokens.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/landing.css';

import { store } from './state/store.js';
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderCadastro } from './pages/cadastro.js';
import { renderShell, rotasDoPerfil } from './components/shell.js';
import { renderDashboard, destruirDashboard } from './pages/dashboard.js';
import { renderVendas } from './pages/vendas.js';
import { renderPedidos } from './pages/pedidos.js';
import { renderEmBreve, renderMenu } from './pages/placeholder.js';
import { renderPlanos } from './pages/planos.js';
import { renderConfiguracoes } from './pages/configuracoes.js';

const app = document.getElementById('app');

export function irPara(rota) {
  if (location.hash === `#/${rota}`) render();
  else location.hash = `#/${rota}`;
}

// Rotas públicas (sem login)
const ROTAS_PUBLICAS = ['login', 'cadastro'];

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

  // ── Rota pública: login e cadastro ──────────────────────────
  if (ROTAS_PUBLICAS.includes(hashRota)) {
    if (store.get().logado) return (location.hash = '#/inicio');
    if (hashRota === 'login') return renderLogin(app, irPara);
    if (hashRota === 'cadastro') return renderCadastro(app, irPara);
  }

  // ── Protegida: precisa estar logado ─────────────────────────
  if (!store.get().logado) {
    return (location.hash = '#/login');
  }

  // ── Validação de rota pelo perfil ────────────────────────────
  const rotasPermitidas = rotasDoPerfil().map((r) => r.id);
  const rotasEspeciais = ['menu', 'inicio', 'planos', 'configuracoes'];
  if (!rotasEspeciais.includes(hashRota) && !rotasPermitidas.includes(hashRota)) {
    hashRota = 'inicio';
  }

  // ── Shell ────────────────────────────────────────────────────
  renderShell(app, hashRota, irPara);
  const conteudo = document.getElementById('conteudo');

  if (hashRota === 'inicio')           renderDashboard(conteudo, irPara);
  else if (hashRota === 'vendas')      renderVendas(conteudo, irPara);
  else if (hashRota === 'pedidos')     renderPedidos(conteudo, irPara);
  else if (hashRota === 'planos')      renderPlanos(conteudo, irPara);
  else if (hashRota === 'configuracoes') renderConfiguracoes(conteudo, irPara);
  else if (hashRota === 'menu')        renderMenu(conteudo, irPara);
  else                                 renderEmBreve(conteudo, hashRota, irPara);
}

window.addEventListener('hashchange', render);
render();
