/**
 * BLINDAGEM CLIENT-SIDE ANTI-SCRAPER & ANTI-BOTS DE IA
 */

export function iniciarEscudoAntiClonagem() {
  if (typeof window === 'undefined') return;

  // 1. Detecção de navegador automatizado (Headless / Puppeteer / Selenium)
  const isAutomated = 
    navigator.webdriver ||
    window.callPhantom ||
    window._phantom ||
    window.__nightmare ||
    Boolean(window.document.__selenium_unwrapped) ||
    Boolean(window.document.__webdriver_evaluate);

  if (isAutomated) {
    console.warn('⚠️ Acesso automatizado detectado.');
    // Insere delay ou impede renderização de dados sensíveis
    document.documentElement.setAttribute('data-bot-detected', 'true');
  }

  // 2. Armadilha Honeypot no DOM
  try {
    if (!document.getElementById('honeypot-trap-ia')) {
      const trap = document.createElement('div');
      trap.id = 'honeypot-trap-ia';
      trap.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;height:0;width:0;overflow:hidden;';
      trap.innerHTML = '<a href="#trap" rel="nofollow">Protected System Integrity Verification</a>';
      document.body?.appendChild(trap);
    }
  } catch (_) {}

  // 3. Proteção contra iframe embedding não autorizado
  try {
    if (window.self !== window.top) {
      // Se estiver em iframe de outro domínio
      try {
        if (window.location.hostname !== window.top.location.hostname) {
          window.top.location = window.self.location;
        }
      } catch (e) {
        // Bloqueio de cross-origin frame
        document.body.innerHTML = '<div style="padding:2rem;text-align:center;font-family:sans-serif;">Acesso via espelho não permitido.</div>';
      }
    }
  } catch (_) {}
}
