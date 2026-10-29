/**
 * TELA DE CADASTRO DE ESTABELECIMENTO
 * Cria conta + tenant no plano gratuito (plano-00).
 * Inclui Celular / WhatsApp com máscara automática e senha/PIN simplificado.
 */
import { icone } from '../components/icons.js';
import { toast } from '../components/ui.js';
import { cadastrar } from '../services/api.js';
import { store } from '../state/store.js';
import { abrirModalTermos, abrirModalLGPD } from '../components/legal-modal.js';

function formatarCelular(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function renderCadastro(raiz, irPara) {
  raiz.innerHTML = `
  <main class="login">
    <section class="login-hero">
      <div class="logo">
        <div class="logo-marca"><img src="/icon.png" alt="Logo" class="logo-img" /></div>
        <div><div class="logo-nome">Ao Ponto</div></div>
      </div>
      <h1>Comece grátis em segundos.</h1>
      <p>Crie sua conta e tenha <strong>10 vendas por mês sem pagar nada</strong>. Sem cartão de crédito.</p>
      <div class="login-destaques">
        <div>${icone('grafico')}<span>Dashboard em tempo real</span></div>
        <div>${icone('pedidos')}<span>Pedidos e reservas</span></div>
        <div>${icone('local')}<span>Seu link exclusivo: <em>voce.aoponto.app</em></span></div>
      </div>
    </section>

    <section class="login-form-area">
      <form class="login-form" novalidate id="form-cadastro">
        <h2>Criar conta grátis</h2>
        <p class="sub">10 vendas/mês grátis. Rápido e descomplicado.</p>

        <div class="alerta-erro" id="cad-erro" role="alert">${icone('alerta')}<span></span></div>

        <div class="campo" id="campo-nome-estab">
          <label for="cad-nome-estab">Nome do estabelecimento</label>
          <div class="campo-caixa">${icone('local')}
            <input class="input" id="cad-nome-estab" type="text" placeholder="Ex.: Frango do João" autocomplete="organization" style="padding-left:46px;font-size:16px;" />
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="campo" id="campo-slug">
          <label for="cad-slug">Endereço do seu app</label>
          <div class="campo-caixa campo-slug-wrap">
            <input class="input input-slug" id="cad-slug" type="text" placeholder="joao" autocomplete="off" maxlength="32" style="font-size:16px;" />
            <span class="slug-sufixo">.aoponto.app</span>
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
          <span class="campo-dica" id="slug-preview"></span>
        </div>

        <div class="campo" id="campo-nome-dono">
          <label for="cad-nome-dono">Seu nome</label>
          <div class="campo-caixa">${icone('usuarios')}
            <input class="input" id="cad-nome-dono" type="text" placeholder="Ex.: João Silva" autocomplete="name" style="padding-left:46px;font-size:16px;" />
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="campo" id="campo-celular">
          <label for="cad-celular">Celular / WhatsApp <span style="color:var(--brasa);font-weight:700;">(principal para login)</span></label>
          <div class="campo-caixa">${icone('celular')}
            <input class="input" id="cad-celular" type="tel" inputmode="numeric" placeholder="(11) 98765-4321" autocomplete="tel" style="padding-left:46px;font-size:16px;" />
          </div>
          <span class="campo-dica" style="font-size:12px;color:var(--texto-suave);">Usado para você entrar no app de forma rápida.</span>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="campo" id="campo-email">
          <label for="cad-email">E-mail <span style="font-weight:normal;color:var(--texto-suave);">(opcional)</span></label>
          <div class="campo-caixa">${icone('email')}
            <input class="input" id="cad-email" type="email" placeholder="seuemail@exemplo.com" autocomplete="email" style="padding-left:46px;font-size:16px;" />
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <div class="campo" id="campo-senha">
          <label for="cad-senha">Senha ou PIN numérico de 4 a 6 dígitos</label>
          <div class="campo-caixa">${icone('cadeado')}
            <input class="input" id="cad-senha" type="password" placeholder="Ex.: 6 números fáceis de lembrar" autocomplete="new-password" style="padding-left:46px;font-size:16px;" />
            <button type="button" class="campo-acao" id="btn-mostrar-senha" aria-label="Mostrar senha">${icone('olho')}</button>
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
        </div>

        <button class="btn btn-primario btn-bloco" id="btn-cadastrar" type="submit" style="min-height:54px;font-size:16px">
          Criar conta grátis — 10 vendas/mês
        </button>

        <div class="divisor">já tem conta?</div>
        <button type="button" class="btn btn-contorno btn-bloco" id="btn-ir-login">Entrar na minha conta</button>

        <p class="termos-texto">Ao criar sua conta, você concorda com os <a href="javascript:void(0)" id="link-termos">Termos de Uso</a> e com a <a href="javascript:void(0)" id="link-lgpd">Política de Privacidade (LGPD)</a>.</p>
      </form>
    </section>
  </main>`;

  const $ = (s) => raiz.querySelector(s);
  const erroGeral = $('#cad-erro');

  const marcarErro = (id, msg) => {
    const c = $(id);
    c.classList.toggle('erro', !!msg);
    c.querySelector('.campo-erro span').textContent = msg || '';
  };

  // Máscara do slug
  const slugInput = $('#cad-slug');
  const preview = $('#slug-preview');
  const nomeEstabInput = $('#cad-nome-estab');
  const celularInput = $('#cad-celular');

  function slugificar(texto) {
    return texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32);
  }

  nomeEstabInput.addEventListener('input', () => {
    if (!slugInput._editadoManualmente) {
      slugInput.value = slugificar(nomeEstabInput.value);
      atualizarPreview();
    }
  });

  slugInput.addEventListener('input', () => {
    slugInput._editadoManualmente = true;
    slugInput.value = slugificar(slugInput.value);
    atualizarPreview();
  });

  function atualizarPreview() {
    const v = slugInput.value;
    preview.textContent = v ? `Seu link: ${v}.aoponto.app` : '';
  }

  // Máscara dinâmica de celular
  celularInput.addEventListener('input', () => {
    celularInput.value = formatarCelular(celularInput.value);
  });

  // Mostrar senha
  $('#btn-mostrar-senha').addEventListener('click', (e) => {
    const s = $('#cad-senha');
    const mostrar = s.type === 'password';
    s.type = mostrar ? 'text' : 'password';
    e.currentTarget.innerHTML = icone(mostrar ? 'olhoFechado' : 'olho');
  });

  // Navegar para login
  $('#btn-ir-login').addEventListener('click', () => irPara('login'));

  // Modais jurídicos (Termos e LGPD)
  $('#link-termos')?.addEventListener('click', (e) => {
    e.preventDefault();
    abrirModalTermos();
  });

  $('#link-lgpd')?.addEventListener('click', (e) => {
    e.preventDefault();
    abrirModalLGPD();
  });

  // Submit
  $('#form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    erroGeral.classList.remove('visivel');

    const nomeEstab = nomeEstabInput.value.trim();
    const slug = slugInput.value.trim();
    const nomeDono = $('#cad-nome-dono').value.trim();
    const celular = celularInput.value.trim();
    const email = $('#cad-email').value.trim();
    const senha = $('#cad-senha').value;

    let ok = true;
    if (!nomeEstab) { marcarErro('#campo-nome-estab', 'Informe o nome do estabelecimento.'); ok = false; } else marcarErro('#campo-nome-estab');
    if (!slug || slug.length < 3) { marcarErro('#campo-slug', 'Escolha um endereço com pelo menos 3 caracteres.'); ok = false; } else marcarErro('#campo-slug');
    if (!nomeDono) { marcarErro('#campo-nome-dono', 'Informe seu nome.'); ok = false; } else marcarErro('#campo-nome-dono');
    
    // Validação do celular
    const celDigitos = celular.replace(/\D/g, '');
    if (!celDigitos || celDigitos.length < 10) { 
      marcarErro('#campo-celular', 'Informe seu celular com DDD. Ex.: (11) 98765-4321'); 
      ok = false; 
    } else {
      marcarErro('#campo-celular');
    }

    // Email é opcional, mas se digitado deve ser válido
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { 
      marcarErro('#campo-email', 'Informe um e-mail válido ou deixe em branco.'); 
      ok = false; 
    } else {
      marcarErro('#campo-email');
    }

    if (!senha || senha.length < 4) { 
      marcarErro('#campo-senha', 'A senha ou PIN precisa ter pelo menos 4 dígitos/caracteres.'); 
      ok = false; 
    } else {
      marcarErro('#campo-senha');
    }

    if (!ok) return;

    const btn = $('#btn-cadastrar');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Criando sua conta...';

    try {
      const { tenant, usuario } = await cadastrar({
        nomeEstabelecimento: nomeEstab,
        slug,
        celular,
        email,
        nome: nomeDono,
        senha,
      });

      // Simula sessão iniciada
      store.set({
        logado: true,
        perfil: 'owner',
        tenant,
        usuario,
      });

      toast(`Bem-vindo(a), ${nomeDono.split(' ')[0]}! Conta criada com sucesso. 🎉`);
      irPara('inicio');
    } catch (err) {
      erroGeral.querySelector('span').textContent = err.message;
      erroGeral.classList.add('visivel');
      btn.disabled = false;
      btn.innerHTML = 'Criar conta grátis — 10 vendas/mês';
    }
  });
}
