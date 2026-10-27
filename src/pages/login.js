/**
 * TELA DE LOGIN — DEMONSTRATIVA (multi-tenant)
 * Agora conecta com loginTenant via api.js.
 */
import { icone } from '../components/icons.js';
import { abrirModal, toast } from '../components/ui.js';
import { loginDemo } from '../services/api.js';
import { store } from '../state/store.js';

export function renderLogin(raiz, irPara) {
  raiz.innerHTML = `
  <main class="login">
    <section class="login-hero">
      <div class="logo">
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div><div class="logo-nome">Ao Ponto</div><div class="logo-sub">Gestão de vendas</div></div>
      </div>
      <h1>Suas vendas na palma da mão.</h1>
      <p>Acompanhe faturamento, pedidos e pontos de venda em tempo real, direto do celular.</p>
      <div class="login-destaques">
        <div>${icone('grafico')}<span>Faturamento por produto e por ponto</span></div>
        <div>${icone('pedidos')}<span>Pedidos e reservas organizados</span></div>
        <div>${icone('local')}<span>Vários pontos de venda em um só lugar</span></div>
      </div>
    </section>

    <section class="login-form-area">
      <form class="login-form" novalidate id="form-login">
        <h2>Entrar</h2>
        <p class="sub">Acesse sua conta para continuar.</p>
        <div class="aviso-demo">${icone('info')}<span><strong>Login demonstrativo.</strong> Use qualquer e-mail e uma senha com 4 ou mais caracteres. Digite a senha <b>errada</b> para ver uma mensagem de erro.</span></div>
        <div class="alerta-erro" id="login-erro" role="alert">${icone('alerta')}<span></span></div>

        <div class="campo" id="campo-usuario">
          <label for="login-usuario">E-mail ou usuário</label>
          <div class="campo-caixa">${icone('email')}
            <input class="input" id="login-usuario" type="text" inputmode="email" autocomplete="username" placeholder="seuemail@exemplo.com" />
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="campo" id="campo-senha">
          <label for="login-senha">Senha</label>
          <div class="campo-caixa">${icone('cadeado')}
            <input class="input" id="login-senha" type="password" autocomplete="current-password" placeholder="Sua senha" />
            <button type="button" class="campo-acao" id="btn-mostrar-senha" aria-label="Mostrar senha">${icone('olho')}</button>
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="linha-entre"><button type="button" class="link-btn" id="btn-esqueci">Esqueci minha senha</button></div>
        <button class="btn btn-primario btn-bloco" id="btn-entrar" type="submit" style="min-height:54px;font-size:16px">Entrar</button>

        <div class="divisor">não tem conta?</div>
        <button type="button" class="btn btn-contorno btn-bloco" id="btn-ir-cadastro">Criar conta grátis — 10 vendas/mês</button>

        <div class="divisor">ou entre direto como</div>
        <div class="atalhos-perfil">
          <button type="button" class="atalho" data-perfil="owner" id="atalho-dono"><span>👑</span><span>Dono</span></button>
          <button type="button" class="atalho" data-perfil="admin" id="atalho-admin"><span>🧑‍💼</span><span>Administrador</span></button>
          <button type="button" class="atalho" data-perfil="vendedor" id="atalho-vendedor"><span>🧑‍🍳</span><span>Vendedor</span></button>
        </div>

        <div style="text-align:center;margin-top:20px;padding-top:14px;border-top:1px solid var(--borda)">
          <button type="button" class="link-btn" id="btn-voltar-landing" style="font-size:14px;color:var(--texto-suave);font-weight:600">
            &larr; Conhecer a Apresentação do Ao Ponto
          </button>
        </div>
      </form>
    </section>
  </main>`;

  const $ = (s) => raiz.querySelector(s);
  const usuario = $('#login-usuario'), senha = $('#login-senha'), erroGeral = $('#login-erro');

  const marcarErro = (id, msg) => { const c = $(id); c.classList.toggle('erro', !!msg); c.querySelector('.campo-erro span').textContent = msg || ''; };

  $('#btn-mostrar-senha').addEventListener('click', (e) => {
    const mostrar = senha.type === 'password';
    senha.type = mostrar ? 'text' : 'password';
    e.currentTarget.innerHTML = icone(mostrar ? 'olhoFechado' : 'olho');
    e.currentTarget.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
  });

  const entrar = (perfil, usuario, tenant) => {
    store.set({ logado: true, perfil, ponto: 'todos', usuario: usuario || null, tenant: tenant || null });
    toast(`Bem-vindo(a), ${(usuario?.nome || store.perfil().nome).split(' ')[0]}!`);
    irPara('inicio');
  };

  $('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    erroGeral.classList.remove('visivel');
    const u = usuario.value.trim(), s = senha.value;
    let ok = true;
    if (!u) { marcarErro('#campo-usuario', 'Informe seu e-mail ou usuário.'); ok = false; }
    else if (u.includes('@') && !/^\S+@\S+\.\S+$/.test(u)) { marcarErro('#campo-usuario', 'E-mail inválido. Ex.: nome@exemplo.com'); ok = false; }
    else marcarErro('#campo-usuario');
    if (!s) { marcarErro('#campo-senha', 'Informe sua senha.'); ok = false; }
    else if (s.length < 4) { marcarErro('#campo-senha', 'A senha precisa ter pelo menos 4 caracteres.'); ok = false; }
    else marcarErro('#campo-senha');
    if (!ok) return;

    const btn = $('#btn-entrar');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Entrando...';
    try {
      const resultado = await loginDemo(u, s);
      entrar('owner', resultado?.usuario, resultado?.tenant);
    } catch (err) {
      erroGeral.querySelector('span').textContent = err.message;
      erroGeral.classList.add('visivel');
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  });

  raiz.querySelectorAll('[data-perfil]').forEach((b) => b.addEventListener('click', () => entrar(b.dataset.perfil, null, null)));

  $('#btn-ir-cadastro')?.addEventListener('click', () => irPara('cadastro'));

  $('#btn-esqueci').addEventListener('click', () => {
    abrirModal(`
      <h2>Recuperar senha</h2>
      <p>Informe seu e-mail. <em>(Simulação: nenhum e-mail será enviado.)</em></p>
      <div class="campo" id="campo-rec"><label for="rec-email">E-mail</label>
        <div class="campo-caixa">${icone('email')}<input class="input" id="rec-email" type="email" placeholder="seuemail@exemplo.com" value="${usuario.value.includes('@') ? usuario.value : ''}"/></div>
        <span class="campo-erro">${icone('alerta')}<span>Digite um e-mail válido.</span></span></div>
      <div class="modal-acoes">
        <button class="btn btn-primario btn-bloco" id="btn-enviar-rec">Enviar link de recuperação</button>
        <button class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
      </div>`, (m, fechar) => {
      m.querySelector('#btn-enviar-rec').addEventListener('click', () => {
        const v = m.querySelector('#rec-email').value.trim();
        const valido = /^\S+@\S+\.\S+$/.test(v);
        m.querySelector('#campo-rec').classList.toggle('erro', !valido);
        if (!valido) return;
        fechar();
        toast('Link enviado! (simulação — nenhum e-mail real foi enviado)', 'info');
      });
    });
  });

  $('#btn-voltar-landing')?.addEventListener('click', () => irPara('landing'));
}
