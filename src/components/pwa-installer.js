/**
 * GERENCIADOR DE PWA — Registro de Service Worker e Prompt de Instalação (iOS / Android / Desktop)
 */
import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';

let deferredPrompt = null;

export function inicializarPwa() {
  if (typeof window === 'undefined') return;

  // 1. Registro do Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => {
          console.log('✅ Service Worker PWA registrado com escopo:', reg.scope);
        },
        (err) => {
          console.warn('⚠️ Falha ao registrar Service Worker PWA:', err);
        }
      );
    });
  }

  // 2. Captura do evento de instalação (Android / Chrome / Edge)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    exibirBannerInstalacaoSeApropriado();
    exibirBotaoPwaPulsante();
  });

  // 3. Detecta quando o app foi instalado com sucesso
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    toast('🎉 Aplicativo Ao Ponto instalado com sucesso na tela inicial!', 'sucesso');
    removerBannerInstalacao();
    removerBotaoPwaPulsante();
  });

  // 4. Sempre exibe o botão flutuante pulsante se não estiver instalado
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => exibirBotaoPwaPulsante());
  } else {
    exibirBotaoPwaPulsante();
  }
}

// Verifica se já está rodando em modo standalone (PWA instalado)
export function isPwaInstalado() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

// Detecta se o dispositivo é iOS (iPhone / iPad)
export function isIos() {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

// Botão Flutuante Pulsante "Baixar no Celular / Tablet / PC"
export function exibirBotaoPwaPulsante() {
  if (isPwaInstalado()) return;
  if (document.getElementById('pwa-fab-pulse')) return;

  const btn = document.createElement('button');
  btn.id = 'pwa-fab-pulse';
  btn.className = 'pwa-fab-pulse';
  btn.setAttribute('aria-label', 'Baixar aplicativo no celular, tablet ou PC');
  btn.title = 'Instalar o Ao Ponto como aplicativo no seu celular ou PC';
  btn.innerHTML = `
    <span class="pwa-fab-pulse-dot"></span>
    <span>📲 Baixar no Celular / PC</span>
  `;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dispararInstalacaoPwa();
  });

  document.body.appendChild(btn);
}

export function removerBotaoPwaPulsante() {
  const btn = document.getElementById('pwa-fab-pulse');
  if (btn) btn.remove();
}

// Banner flutuante no primeiro acesso
function exibirBannerInstalacaoSeApropriado() {
  if (isPwaInstalado()) return;
  if (sessionStorage.getItem('ao-ponto-pwa-dismissed')) return;
  if (document.getElementById('pwa-install-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 16px;
    right: 16px;
    max-width: 420px;
    margin: 0 auto;
    background: #1F1B18;
    border: 1px solid var(--brasa, #E26A3B);
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    z-index: 9999;
    animation: pwaSlideUp 0.3s ease-out;
  `;

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <img src="/icon-192.png" alt="Ao Ponto" style="width:40px; height:40px; border-radius:8px; object-fit:cover;" />
      <div>
        <strong style="color:#FFF; font-size:14px; display:block;">Instalar Ao Ponto</strong>
        <span style="color:#A8A29E; font-size:12px;">Acesso rápido direto pelo app</span>
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <button id="btn-pwa-instalar" class="btn btn-primario" style="padding:6px 12px; font-size:13px; font-weight:700;">
        Instalar
      </button>
      <button id="btn-pwa-fechar" style="background:transparent; border:none; color:#A8A29E; cursor:pointer; font-size:18px; padding:4px;">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(banner);

  banner.querySelector('#btn-pwa-instalar').addEventListener('click', () => {
    dispararInstalacaoPwa();
  });

  banner.querySelector('#btn-pwa-fechar').addEventListener('click', () => {
    sessionStorage.setItem('ao-ponto-pwa-dismissed', 'true');
    removerBannerInstalacao();
  });
}

function removerBannerInstalacao() {
  const b = document.getElementById('pwa-install-banner');
  if (b) b.remove();
}

/**
 * Dispara o prompt ou abre o guia visual para iOS / Android / PC
 */
export function dispararInstalacaoPwa() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        removerBannerInstalacao();
        removerBotaoPwaPulsante();
      }
      deferredPrompt = null;
    });
  } else if (isIos()) {
    // Guia passo a passo para iPhone / iOS
    abrirModal(`
      <div style="text-align:center; padding:10px 0;">
        <img src="/icon-192.png" alt="Ao Ponto" style="width:64px; height:64px; border-radius:14px; margin-bottom:12px;" />
        <h2 style="font-size:20px; margin-bottom:8px;">Instalar Ao Ponto no iPhone</h2>
        <p style="color:var(--texto-suave); font-size:14px; margin-bottom:20px;">
          Instale o Ao Ponto para abrir em tela cheia direto da tela inicial do seu celular, sem barra de navegação.
        </p>
        
        <div style="background:var(--creme, #26221F); border:1px solid var(--borda); border-radius:12px; padding:16px; text-align:left; font-size:14px; line-height:1.6; display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:var(--brasa, #E26A3B); color:#FFF; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0;">1</span>
            <span>No Safari, toque no botão <strong>Compartilhar</strong> (ícone <span style="font-size:18px;">⎋</span> ou quadrado com seta para cima).</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:var(--brasa, #E26A3B); color:#FFF; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0;">2</span>
            <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (ícone ⊞).</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:var(--brasa, #E26A3B); color:#FFF; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0;">3</span>
            <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
          </div>
        </div>

        <button class="btn btn-primario btn-bloco" style="margin-top:20px;" data-fechar>
          Entendi
        </button>
      </div>
    `);
  } else {
    // Guia para Android (Chrome/Samsung) e Computador (PC / Mac)
    abrirModal(`
      <div style="text-align:center; padding:10px 0;">
        <img src="/icon-192.png" alt="Ao Ponto" style="width:64px; height:64px; border-radius:14px; margin-bottom:12px;" />
        <h2 style="font-size:20px; margin-bottom:8px;">Instalar Aplicativo Ao Ponto</h2>
        <p style="color:var(--texto-suave); font-size:14px; margin-bottom:20px;">
          Tenha o sistema instalado como aplicativo nativo no celular, tablet ou computador.
        </p>

        <div style="background:var(--creme); border:1px solid var(--borda); border-radius:12px; padding:16px; text-align:left; font-size:14px; line-height:1.6; display:flex; flex-direction:column; gap:12px;">
          <div>
            <strong style="color:var(--carvao); display:block; font-size:15px; margin-bottom:4px;">📱 No Celular Android (Chrome / Samsung):</strong>
            <span>Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador e escolha <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
          </div>
          <div style="border-top:1px solid var(--borda); padding-top:10px;">
            <strong style="color:var(--carvao); display:block; font-size:15px; margin-bottom:4px;">💻 No Computador / PC (Chrome / Edge):</strong>
            <span>Clique no ícone de instalação <strong>(⤓)</strong> na barra de endereço do navegador ao lado do endereço do site.</span>
          </div>
        </div>

        <button class="btn btn-primario btn-bloco" style="margin-top:20px;" data-fechar>
          Fechar
        </button>
      </div>
    `);
  }
}
