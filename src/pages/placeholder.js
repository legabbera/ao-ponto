/**
 * Telas ainda não construídas ("Em breve") e a tela de Menu do celular.
 */
import { icone } from '../components/icons.js';
import { ROTAS, rotasDoPerfil, modalPerfil, sair } from '../components/shell.js';
import { store } from '../state/store.js';

export function renderEmBreve(raiz, rotaId, irPara) {
  irPara('inicio');
}

export function renderMenu(raiz, irPara) {
  const perfil = store.perfil();
  const st = store.get();
  const isDemo = !st.usuario || st.usuario.id === 'user_demo';
  const isModoSaas = st.modo === 'saas' || st.perfil === 'superadmin';

  if (isModoSaas) {
    const itensSaas = [
      { id: 'master-inicio', rotulo: 'Início com KPIs', icone: 'home', desc: 'Métricas gerais e KPIs do SaaS' },
      { id: 'master-vendas', rotulo: 'Vendas dos Associados', icone: 'vendas', desc: 'Faturamento por dia, semana e mês' },
      { id: 'master-empresas', rotulo: 'Cadastro das Empresas', icone: 'clientes', desc: 'CNPJs e localização física' },
      { id: 'master-whatsapp', rotulo: 'WhatsApp das Empresas', icone: 'conversa', desc: 'Contato com 1 clique para falar' },
      { id: 'master-pagamentos', rotulo: 'Pagamentos (Mensalidade)', icone: 'cartao', desc: 'Pix, boletos, planos e gráficos' },
      { id: 'configuracoes', rotulo: 'Configurações', icone: 'config', desc: 'Ajustes e dados da plataforma' },
    ];

    raiz.innerHTML = `
    <h1 style="font-size:24px;margin-bottom:4px">👑 Menu SaaS Master</h1>
    <p style="color:var(--texto-suave);margin:0 0 16px">Gestão geral dos CNPJs e da rede de associados</p>
    <div class="menu-grade">
      ${itensSaas.map((r) => `<button class="menu-card" data-ir="${r.id}" id="menu-${r.id}"><span class="mc-ic">${icone(r.icone)}</span><span>${r.rotulo}<br><small>${r.desc}</small></span></button>`).join('')}
    </div>
    <div class="perfil-troca" style="margin-top:20px">
      <button class="perfil-op" id="menu-alternar-loja" style="background:#FFF7ED;border:1px solid #FFEDD5;color:#C2410C;">
        <span>🏪</span><span><strong>Visão da Assadeira (Loja)</strong><small>Alternar para simular uma loja de frango</small></span>
      </button>
      <button class="perfil-op" id="menu-sair"><span>🚪</span><span><strong>Sair</strong><small>Encerrar sessão</small></span></button>
    </div>`;

    raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.ir)));
    raiz.querySelector('#menu-alternar-loja')?.addEventListener('click', () => {
      store.set({ modo: 'loja', perfil: 'owner' });
      irPara('inicio');
    });
    raiz.querySelector('#menu-sair').addEventListener('click', () => sair(irPara));
    return;
  }

  const itens = rotasDoPerfil().filter((r) => !r.principal);
  raiz.innerHTML = `
  <h1 style="font-size:24px;margin-bottom:4px">Menu</h1>
  <p style="color:var(--texto-suave);margin:0 0 16px">Itens disponíveis para: <strong>${perfil.papel}</strong></p>
  <div class="menu-grade">
    ${itens.map((r) => `<button class="menu-card" data-ir="${r.id}" id="menu-${r.id}"><span class="mc-ic">${icone(r.icone)}</span><span>${r.rotulo}<br><small>${r.desc} · Etapa ${r.etapa}</small></span></button>`).join('')}
  </div>
  <div class="perfil-troca" style="margin-top:20px">
    <button class="perfil-op" id="menu-alternar-saas" style="background:#FFF7ED;border:1px solid #FFEDD5;color:#EA580C;">
      <span>👑</span><span><strong>Painel Master (SaaS)</strong><small>Acessar gestão dos associados e CNPJs</small></span>
    </button>
    ${isDemo ? `<button class="perfil-op" id="menu-trocar-perfil"><span>${perfil.emoji}</span><span><strong>Trocar perfil (demonstração)</strong><small>Logado como ${perfil.nome}</small></span></button>` : ''}
    <button class="perfil-op" id="menu-sair"><span>🚪</span><span><strong>Sair</strong><small>Encerrar sessão</small></span></button>
  </div>`;
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => irPara(b.dataset.ir)));
  raiz.querySelector('#menu-alternar-saas')?.addEventListener('click', () => {
    store.set({ modo: 'saas', perfil: 'superadmin' });
    irPara('master-inicio');
  });
  if (isDemo) {
    raiz.querySelector('#menu-trocar-perfil')?.addEventListener('click', () => modalPerfil(irPara));
  }
  raiz.querySelector('#menu-sair').addEventListener('click', () => sair(irPara));
}
