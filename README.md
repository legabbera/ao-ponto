# 🍗 Ao Ponto (SaaS Multi-tenant)

Protótipo visual **mobile-first** com **dados fictícios**. Etapa 1: identidade visual, navegação, login demonstrativo e dashboard.

> ⚠️ Não há backend, banco de dados, autenticação real, WhatsApp ou pagamentos. Tudo é simulação.

## 🌐 Deploy em Produção
- **Site Oficial:** [https://aoponto.netlify.app/](https://aoponto.netlify.app/)
- **Repositório:** [https://github.com/legabbera/ao-ponto](https://github.com/legabbera/ao-ponto)

## Como rodar
```bash
npm install
npm run dev
```
Abra o endereço mostrado (ex.: http://localhost:5173). No celular da mesma rede Wi‑Fi, use o endereço "Network".

## Como testar o login
- Celular / WhatsApp com máscara, Nome, E-mail ou Usuário com PIN numérico ou senha.
- Atalhos "Dono / Administrador / Vendedor" entram direto com cada perfil.

## Estrutura (para editar no Claude, Codex, Lovable ou outra IA)
| Pasta | O que tem |
|---|---|
| `src/styles/tokens.css` | **Cores, fontes e medidas** — mude aqui para alterar o visual inteiro |
| `src/styles/*.css` | Componentes, layout e estilos do dashboard |
| `src/components/` | Peças reutilizáveis: ícones, avisos/modal, navegação (`shell.js`), modais legais (`legal-modal.js`) |
| `src/pages/` | Telas: `landing.js`, `login.js`, `cadastro.js`, `dashboard.js`, `vendas.js`, `pedidos.js`, `planos.js`, `configuracoes.js` |
| `src/data/mock.js` | **Dados fictícios** (pontos, produtos, perfis, gerador de vendas) |
| `src/state/store.js` | Estado da sessão (perfil, filtros, tenant) — reativo |
| `src/services/api.js` | **Ponte para o futuro backend** — trocar mocks por chamadas reais aqui |

Tecnologia: Vite + JavaScript puro + CSS puro + Chart.js. Sem framework, para que qualquer ferramenta consiga ler e editar.
Ao migrar para Lovable (que usa React), basta pedir: *"converta este protótipo para React mantendo tokens.css, mock.js e api.js"*.

## Regras para futuras edições
- Nunca colocar chaves de API/tokens no frontend.
- Cancelados não somam no faturamento.
- Manter textos em pt-BR, moeda `R$ 0,00`, datas `DD/MM/AAAA`, horas 24 h.
