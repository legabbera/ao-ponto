/**
 * TELA DE LOGIN — ACESSÍVEL & MULTI-TENANT
 * Suporta Login por Celular / WhatsApp, E-mail ou Nome de Usuário.
 * Otimizado com foco em facilidade de uso para idosos e operadores de caixa.
 */
import { icone } from '../components/icons.js';
import { abrirModal, toast } from '../components/ui.js';
import { loginDemo } from '../services/api.js';
import { store } from '../state/store.js';

function formatarCelular(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function renderLogin(raiz, irPara) {
  raiz.innerHTML = `
  <main class="login">
    <section class="login-hero">
      <div class="logo">
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div><div class="logo-nome">Ao Ponto</div></div>
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
        
        <div class="aviso-demo">${icone('info')}<span><strong>Acesso facilitado:</strong> Entre com seu <b>nome</b>, <b>celular</b> ou <b>e-mail</b> e sua senha ou PIN numérico.</span></div>
        <div class="alerta-erro" id="login-erro" role="alert">${icone('alerta')}<span></span></div>

        <div class="campo" id="campo-usuario">
          <label for="login-usuario">Seu Nome, Celular ou E-mail</label>
          <div class="campo-caixa">
            <span id="icone-tipo-usuario" class="campo-icone-esq">${icone('usuario')}</span>
            <input class="input" id="login-usuario" type="text" autocomplete="username" placeholder="Ex.: João, (11) 98765-4321 ou seu e-mail" style="padding-left:46px;font-size:16px;" />
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="campo" id="campo-senha">
          <label for="login-senha">Senha ou PIN de 4 a 6 dígitos</label>
          <div class="campo-caixa">${icone('cadeado')}
            <input class="input" id="login-senha" type="password" autocomplete="current-password" placeholder="Digite sua senha ou PIN" style="padding-left:46px;font-size:16px;" />
            <button type="button" class="campo-acao" id="btn-mostrar-senha" aria-label="Mostrar senha">${icone('olho')}</button>
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="linha-entre"><button type="button" class="link-btn" id="btn-esqueci">Esqueci minha senha / PIN</button></div>
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
  const iconeWrap = $('#icone-tipo-usuario');

  const marcarErro = (id, msg) => { 
    const c = $(id); 
    c.classList.toggle('erro', !!msg); 
    c.querySelector('.campo-erro span').textContent = msg || ''; 
  };

  // Detecção inteligente e máscara dinâmica no campo de login
  usuario.addEventListener('input', () => {
    const v = usuario.value;
    const apenasDigitos = v.replace(/\D/g, '');

    // Se começa ou contém principalmente números, formata como celular
    if (/^\d/.test(v.trim())) {
      usuario.value = formatarCelular(v);
      iconeWrap.innerHTML = icone('celular');
    } else if (v.includes('@')) {
      iconeWrap.innerHTML = icone('email');
    } else {
      iconeWrap.innerHTML = icone('usuario');
    }
  });

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

    if (!u) { 
      marcarErro('#campo-usuario', 'Informe seu nome, celular ou e-mail.'); 
      ok = false; 
    } else if (/^\d/.test(u)) {
      // Se digitou número, valida se tem DDD + 8 ou 9 dígitos
      const digitos = u.replace(/\D/g, '');
      if (digitos.length < 10) {
        marcarErro('#campo-usuario', 'Digite o número do celular com DDD. Ex.: (11) 98765-4321');
        ok = false;
      } else {
        marcarErro('#campo-usuario');
      }
    } else if (u.includes('@') && !/^\S+@\S+\.\S+$/.test(u)) { 
      marcarErro('#campo-usuario', 'E-mail inválido. Ex.: nome@exemplo.com'); 
      ok = false; 
    } else {
      marcarErro('#campo-usuario');
    }

    if (!s) { 
      marcarErro('#campo-senha', 'Informe sua senha ou PIN.'); 
      ok = false; 
    } else if (s.length < 4) { 
      marcarErro('#campo-senha', 'A senha ou PIN precisa ter pelo menos 4 caracteres ou dígitos.'); 
      ok = false; 
    } else {
      marcarErro('#campo-senha');
    }

    if (!ok) return;

    const btn = $('#btn-entrar');
    btn.disabled = true; 
    btn.innerHTML = '<span class="spinner"></span> Entrando...';

    try {
      const resultado = await loginDemo(u, s);
      entrar('owner', resultado?.usuario, resultado?.tenant);
    } catch (err) {
      erroGeral.querySelector('span').textContent = err.message;
      erroGeral.classList.add('visivel');
      btn.disabled = false; 
      btn.textContent = 'Entrar';
    }
  });

  raiz.querySelectorAll('[data-perfil]').forEach((b) => b.addEventListener('click', () => entrar(b.dataset.perfil, null, null)));

  $('#btn-ir-cadastro')?.addEventListener('click', () => irPara('cadastro'));

  $('#btn-esqueci').addEventListener('click', () => {
    const valorAtual = usuario.value.trim();
    const isCelular = /^\d/.test(valorAtual) || valorAtual.replace(/\D/g, '').length >= 10;
    
    abrirModal(`
      <h2>Recuperar acesso</h2>
      <p>Você pode receber um código de recuperação rápido direto no seu <strong>WhatsApp</strong> ou por <strong>e-mail</strong>.</p>
      
      <div class="campo" id="campo-rec">
        <label for="rec-contato">Celular (WhatsApp) ou E-mail</label>
        <div class="campo-caixa">
          <span id="icone-rec">${icone(isCelular ? 'whatsapp' : 'email')}</span>
          <input class="input" id="rec-contato" type="text" placeholder="(11) 98765-4321 ou seu@email.com" value="${valorAtual}" style="padding-left:46px;font-size:16px;" />
        </div>
        <span class="campo-erro">${icone('alerta')}<span>Informe um celular ou e-mail válido.</span></span>
      </div>

      <div class="modal-acoes">
        <button class="btn btn-primario btn-bloco" id="btn-enviar-rec" style="min-height:50px;">
          ${icone('whatsapp')} Enviar código de recuperação
        </button>
        <button class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
      </div>`, (m, fechar) => {
      
      const inputRec = m.querySelector('#rec-contato');
      const iconeRec = m.querySelector('#icone-rec');

      inputRec.addEventListener('input', () => {
        const v = inputRec.value;
        if (/^\d/.test(v.trim())) {
          inputRec.value = formatarCelular(v);
          iconeRec.innerHTML = icone('whatsapp');
        } else {
          iconeRec.innerHTML = icone('email');
        }
      });

      m.querySelector('#btn-enviar-rec').addEventListener('click', () => {
        const v = inputRec.value.trim();
        const digitos = v.replace(/\D/g, '');
        const valido = digitos.length >= 10 || /^\S+@\S+\.\S+$/.test(v);
        
        m.querySelector('#campo-rec').classList.toggle('erro', !valido);
        if (!valido) return;
        
        fechar();
        if (digitos.length >= 10) {
          toast(`Código de 6 dígitos enviado para seu WhatsApp ${v}! (Simulação)`, 'sucesso');
        } else {
          toast(`Link de recuperação enviado para ${v}! (Simulação)`, 'sucesso');
        }
      });
    });
  });

  $('#btn-voltar-landing')?.addEventListener('click', () => irPara('landing'));
}
