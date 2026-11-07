---
name: anti-ai-cloning
description: >-
  Blindagem completa de aplicações web contra raspagem de dados, engenharia reversa e clonagem automatizada por IAs (v0, Bolt, Cursor, Firecrawl, GPTBot, ClaudeBot).
---

# Anti-AI Cloning Shield (Blindagem Contra Clonagem por IA)

Esta skill fornece uma suíte completa de proteção defensiva para aplicações web modernas (React, Vue, Vite, Next.js, SPAs), impedindo que bots de inteligência artificial, scrapers automatizados e ferramentas de engenharia reversa copiem o código, o design system e a lógica da aplicação.

---

## 🛡️ Pilares da Blindagem

1. **Bloqueio no Nível de Rede & Rastreadores (`robots.txt` e Headers HTTP)**:
   - Bloqueio nominal dos user-agents de IA: `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Bytespider`, `CCBot`, `Diffbot`, `Omgilibot`, `FacebookBot`.
   - Headers anti-ingestão: `X-Robots-Tag: noai, noimageai, nosnippet, noarchive`.
   - Prevenção contra incorporação em iframes (`X-Frame-Options: SAMEORIGIN`) para evitar clonagem visual por espelhamento.

2. **Supressão de Metadados e Source Maps**:
   - Desativação explícita de `sourcemap` no empacotador de produção (`vite.config.js` ou webpack).
   - Minificação agressiva com mangling (renomeação de identificadores para caracteres semânticos nulos).
   - Remoção de comentários de licença ou mapeamento de rotas em arquivos estáticos públicos.

3. **Detecção no Lado do Cliente (Anti-Headless & Anti-Scraper)**:
   - Verificação em tempo de execução de propriedades de automação (`navigator.webdriver`, `window.callPhantom`, `window._phantom`, `window.__nightmare`).
   - Detecção de inconsistências de renderização típicas de headless browsers (resolução 0x0, plugins ausentes, User-Agent descompassado).
   - Inserção de **armadilhas honeypot** invisíveis para humanos (links e campos com `display:none` ou `opacity:0`). Se lidos ou acessados por um bot, o cliente pode congelar ou redirecionar a requisição.

4. **Blindagem de Backend & Regras de Acesso**:
   - Recomendações de **Row Level Security (RLS)** no banco de dados (ex: Supabase / PostgreSQL).
   - Validação de tokens e chaves efêmeras para impedir replay de requisições.

---

## 🚀 Como Aplicar em Qualquer Projeto

### Passo 1: Executar o Script Automatizado
Execute na raiz de qualquer projeto web:
```bash
node scripts/aplicar-blindagem.js
```

### Passo 2: Verificação dos Arquivos Gerados
O script adiciona automaticamente:
* `public/robots.txt`: Regras restritivas anti-IA.
* `public/_headers`: Headers de segurança e anti-treinamento para Netlify / Cloudflare.
* `src/utils/anti-clonagem.js`: Monitor leve de proteção no cliente.
* Ajustes no empacotador para desligar `sourcemap`.

---

## 📋 Configurações Detalhadas

### Arquivo `robots.txt` Padrão
```robots.txt
# Bloqueio de Bots de Inteligência Artificial e Clonagem Automatizada
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

User-agent: *
Disallow: /api/
Disallow: /dist/
Disallow: /src/
```

### Headers de Proteção (`_headers`)
```text
/*
  X-Robots-Tag: noai, noimageai, nosnippet, noarchive
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```
