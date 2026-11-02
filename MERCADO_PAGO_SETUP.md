# Guia Passo a Passo: Integração do Mercado Pago para Mensalidades SaaS (Ao Ponto) 💳⚡

Este guia foi elaborado para você, **Dono da Plataforma Ao Ponto**, conectar a sua conta do **Mercado Pago** e receber os pagamentos das mensalidades (Pix com confirmação em tempo real, Boleto Bancário e Cartão de Crédito) dos donos de assadeiras e frangarias inscritas no seu sistema.

---

## 1. Visão Geral da Arquitetura de Pagamentos

* **Como funciona:**
  1. Cada assadeira possui um plano (ex.: *Plano Balcão R$ 79,00/mês* ou *Redes & Franquias R$ 149,00/mês*).
  2. No dia do vencimento (ou via botão de cobrança no seu **Painel Master**), o sistema gera o Pix Copia e Cola / QR Code ou Boleto do Mercado Pago.
  3. Quando o lojista paga pelo aplicativo do banco dele, o Mercado Pago envia um aviso instantâneo (**Webhook**) para o Ao Ponto.
  4. O sistema reconhece o pagamento, marca a fatura como `✅ Em Dia` e, caso a loja estivesse bloqueada por atraso, **o acesso é restabelecido automaticamente** no mesmo segundo!

---

## Passo 1: Acessar o Portal de Desenvolvedores do Mercado Pago

1. Acesse: **[https://www.mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)**.
2. Faça login com a sua conta do Mercado Pago (a conta onde você deseja receber o dinheiro das mensalidades).
3. No menu superior direito, clique em **Suas integrações** (ou **Painel do desenvolvedor**).

---

## Passo 2: Criar a Aplicação do Ao Ponto

1. Clique no botão azul **Criar aplicação** (ou *Nova Aplicação*).
2. Preencha as informações:
   * **Nome da aplicação:** `Ao Ponto SaaS`
   * **Tipo de solução de pagamento:** Selecione **Pagamentos online** (Checkout Pro / Checkout Transparente).
   * **Você está usando uma plataforma de e-commerce?** Selecione **Não**.
   * **Qual produto você está integrando?** Selecione **Checkout Transparente / API**.
3. Marque o termo de aceite e clique em **Criar aplicação**.

---

## Passo 3: Obter as Credenciais (Chaves de API)

Dentro da aplicação criada, no menu lateral esquerdo:
1. Clique em **Credenciais de produção** (para receber pagamentos reais) e em **Credenciais de teste** (para simulações).
2. Você verá duas chaves fundamentais:
   * **Public Key (Chave Pública):** Começa com `APP_USR-...` (ou `TEST-...` em testes). Usada no frontend para renderizar o Pix e cartão.
   * **Access Token (Token de Acesso Privado):** Começa com `APP_USR-...` (ou `TEST-...`). **Chave secreta** usada pelo backend para criar cobranças e verificar transações.
3. Copie essas duas chaves para um local seguro.

> ⚠️ **Atenção:** Nunca compartilhe o seu *Access Token* publicamente. Ele é a chave mestre da sua conta.

---

## Passo 4: Configurar as Variáveis no Ao Ponto (`.env`)

Na raiz do projeto `ao ponto`, crie ou edite o arquivo `.env` (ou configure no painel do **Netlify** em *Site configuration > Environment variables*):

```env
# Mercado Pago — Credenciais Oficiais
VITE_MP_PUBLIC_KEY=APP_USR-sua-chave-publica-aqui
MP_ACCESS_TOKEN=APP_USR-seu-access-token-secreto-aqui

# Configurações do SaaS Ao Ponto
VITE_SAAS_CHAVE_PIX=12.345.678/0001-90
VITE_SAAS_NOME_EMPRESA="Ao Ponto Gestao de Vendas"
```

---

## Passo 5: Configurar o Webhook de Notificação Automática

Para que o sistema desbloqueie o cliente no segundo em que ele pagar:
1. No painel do desenvolvedor do Mercado Pago, acesse **Webhooks / Notificações IPN**.
2. Clique em **Configurar notificações**.
3. No campo **URL de produção**, insira a URL do seu webhook:
   ```
   https://seusubdominio.netlify.app/api/mercadopago/webhook
   ```
4. Em **Eventos**, marque as caixas:
   * `Pagamentos` (`payment`)
   * `Planos e assinaturas` (`subscription_preapproval`)
5. Clique em **Salvar**.

---

## Passo 6: Como Gerar e Enviar Cobranças aos Associados

No seu dia a dia como Dono da Plataforma:
1. Acesse o **`👑 Painel Master (SaaS)`** no menu lateral.
2. Clique na aba **`💳 Pagamento de Mensalidades & Planos`**.
3. Na linha da assadeira desejada, clique em **`⚡ Enviar Pix / Boleto`**:
   * O sistema gera o código Copia e Cola Pix e a linha digitável do Boleto com o valor exato do plano (R$ 79 ou R$ 149).
   * Você clica no botão verde **`📲 Disparar Fatura no WhatsApp`** e a mensagem já vai montada e personalizada para o WhatsApp do proprietário da assadeira.
4. Quando o pagamento for confirmado, o status muda automaticamente para `✅ Em Dia`.
5. Se o cliente atrasar mais de 10 dias, basta clicar no botão vermelho **`🛑 Bloquear`** para suspender o acesso da loja até a quitação.

---

## Dúvidas Frequentes

* **O dinheiro cai na minha conta na hora?**
  * **Via Pix:** Sim, o dinheiro cai imediatamente na sua conta do Mercado Pago (D+0).
  * **Via Boleto:** Compensa em 1 dia útil (D+1).
  * **Via Cartão de Crédito:** Conforme a taxa contratada no seu painel do Mercado Pago (na hora, 14 dias ou 30 dias).

* **Posso cadastrar meus próprios dados bancários?**
  * Sim. O saldo acumulado no Mercado Pago pode ser transferido gratuitamente via TED/Pix para qualquer banco da sua preferência a qualquer momento.
