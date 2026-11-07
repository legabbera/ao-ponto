/**
 * GERENCIADOR DE PWA — Registro de Service Worker e Prompt de Instalação (iOS / Android)
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
    // Exibe banner ou botão se não estiver instalado
    exibirBannerInstalacaoSeApropriado();
  });

  // 3. Detecta quando o app foi instalado com sucesso
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    toast('🎉 Aplicativo Ao Ponto instalado com sucesso na tela inicial!', 'sucesso');
    removerBannerInstalacao();
  });
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

// Banner flutuante ou botão discreto na barra
function exibirBannerInstalacaoSeApropriado() {
  if (isPwaInstalado()) return;

  // Se já foi dispensado nesta sessão, não incomoda
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
 * Dispara o prompt ou abre o guia para iOS
 */
export function dispararInstalacaoPwa() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        removerBannerInstalacao();
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
        
        <div style="background:var(--creme-medio, #26221F); border-radius:12px; padding:16px; text-align:left; font-size:14px; line-height:1.6; display:flex; flex-direction:column; gap:12px;">
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
    toast('Para instalar, use a opção "Instalar aplicativo" no menu do seu navegador (⋮)', 'info');
  }
}
