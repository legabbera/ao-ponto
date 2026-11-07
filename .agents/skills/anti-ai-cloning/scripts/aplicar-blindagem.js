/**
 * Script de aplicação automatizada de blindagem anti-clonagem por IA
 * Uso: node aplicar-blindagem.js [caminho_do_projeto]
 */
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
console.log(`🛡️ Aplicando blindagem Anti-IA em: ${targetDir}`);

const publicDir = path.join(targetDir, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. robots.txt
const robotsContent = `# Proteção Anti-Clonagem e Bloqueio de Scrapers de IA
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Diffbot
Disallow: /

User-agent: Omgilibot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: *
Disallow: /api/
Disallow: /src/
Disallow: /dist/
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent, 'utf8');
console.log('✅ public/robots.txt criado com sucesso!');

// 2. _headers
const headersContent = `/*
  X-Robots-Tag: noai, noimageai, nosnippet, noarchive
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`;

fs.writeFileSync(path.join(publicDir, '_headers'), headersContent, 'utf8');
console.log('✅ public/_headers criado com sucesso!');

// 3. anti-clonagem.js
const srcUtilsDir = path.join(targetDir, 'src', 'utils');
if (!fs.existsSync(srcUtilsDir)) {
  fs.mkdirSync(srcUtilsDir, { recursive: true });
}

const antiClonagemJs = `/**
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
`;

fs.writeFileSync(path.join(srcUtilsDir, 'anti-clonagem.js'), antiClonagemJs, 'utf8');
console.log('✅ src/utils/anti-clonagem.js criado com sucesso!');
console.log('🛡️ Blindagem Anti-IA aplicada com sucesso!');
