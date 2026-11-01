# Manual Oficial do Usuário — Plataforma Ao Ponto 🍗📊
**Guia Completo de Operação, Gestão e Controle de Vendas para Assadeiras, Frangarias e Rotisseries**

---

## Boas-vindas e Apresentação da Plataforma

Seja muito bem-vindo ao **Ao Ponto**, a sua **plataforma de gestão e controle de vendas** desenvolvida exclusivamente para atender às particularidades do comércio de frangos assados, carnes na brasa e guarnições de rotisserie.

Diferente de sistemas genéricos de varejo, o **Ao Ponto** foi arquitetado para o ritmo real do seu negócio:
* **Foco no Domingo:** Preparado para absorver o pico semanal de alta intensidade (das 10h às 14h), eliminando filas e desorganização.
* **Ciclo da Brasa:** Controle do tempo de assamento (1h45 a 2h10) para garantir que o frango esteja sempre dourado e suculento no momento exato em que o freguês chega ao balcão.
* **Automação de Atendimento:** Notificações em tempo real via WhatsApp avisando o cliente que o frango entrou no espeto e quando está pronto na estufa térmica.
* **Controle Financeiro de Ponta a Ponta:** Conciliação de maquininhas físicas de cartão, pagamentos via Pix instantâneo com taxa zero e fechamento diário de caixa simplificado.

---

# Módulo 01: Acesso, Contas e Painel Inicial

```
┌────────────────────────────────────────────────────────────────────────┐
│ TELA INÍCIO (DASHBOARD) - VISÃO GERAL                                  │
│ ┌────────────────────────┐  ┌────────────────────────────────────────┐ │
│ │ KPIs do Dia            │  │ Painel Lateral Direito: Ações Rápidas  │ │
│ │ • Faturamento          │  │ [ + Nova Venda (Gestão de Caixa)     ] │ │
│ │ • Frangos Assados      │  │ [ 📅 Novo Pedido (Reserva Domingo)   ] │ │
│ │ • Reservas WhatsApp    │  │ [ 📲 Conectar WhatsApp               ] │ │
│ └────────────────────────┘  │ [ 📊 Relatório Rápido                ] │ │
│ ┌────────────────────────┐  │ [ ⚙️ Configurar Loja                 ] │ │
│ │ Gráfico Horário        │  └────────────────────────────────────────┘ │
│ └────────────────────────┘                                             │
└────────────────────────────────────────────────────────────────────────┘
```

## 1.1. Acesso à Plataforma
* **Endereço Web:** Acesse o link oficial da sua unidade ou ambiente de demonstração (`https://aoponto.app` ou seu subdomínio exclusivo, ex.: `central.aoponto.app`).
* **Tela de Login:**
  * **Campo Celular / E-mail / Usuário:** Digite seu número de WhatsApp com DDD ou seu e-mail cadastrado.
  * **Campo Senha:** Digite sua senha pessoal ou PIN de operador.
  * **Botão "Entrar no Sistema":** Valida suas credenciais e redireciona instantaneamente para o painel de trabalho.
  * **Botão "Esqueci minha senha":** Envia um código de redefinição de segurança para o seu WhatsApp ou e-mail.

## 1.2. Criação de Conta (Novo Lojista)
* **Link "Criar minha conta":** Localizado no rodapé da tela de login.
* **Passo 1 — Dados do Estabelecimento:**
  * **Nome da Assadeira / Rotisserie:** Nome comercial que aparecerá nos comprovantes e mensagens aos clientes (ex.: *Ao Ponto Assados & Brasa*).
  * **Subdomínio Escolhido:** Seu identificador na internet (ex.: `meufrango.aoponto.app`).
  * **Cidade e Estado:** Para cálculo de horário regional e preferências locais.
* **Passo 2 — Dados do Responsável:**
  * **Nome do Proprietário:** Identificação do administrador principal.
  * **WhatsApp de Contato:** Celular onde serão recebidos avisos do sistema.
  * **Senha de Acesso:** Mínimo de 6 dígitos.
* **Passo 3 — Ativação Imediata:**
  * A conta é criada com o plano gratuito ou período de testes liberado imediatamente, sem necessidade de cartão de crédito antecipado.

## 1.3. Explicação da Tela Início (Dashboard Executivo)
A tela inicial reúne os principais termômetros do seu negócio em tempo real.

### O que significa cada botão no Painel Lateral Direito:
1. **Botão `+ Nova Venda` (Destaque Laranja):**
   * **Função:** Abre instantaneamente a tela de operação de vendas para registrar o pedido de um freguês que está no balcão físico. Permite lançar produtos, calcular peso e receber pagamentos em menos de 10 segundos.
2. **Botão `📅 Novo Pedido (Reserva)`:**
   * **Função:** Abre o formulário de encomenda antecipada. Utilizado para registrar pedidos programados para o almoço de domingo, definindo o horário exato de retirada e preferências do cliente.
3. **Botão `📲 WhatsApp Conectado / Conectar`:**
   * **Função:** Exibe o status da sincronização com o aparelho celular da loja e permite abrir o QR Code para pareamento rápido da automação de mensagens.
4. **Botão `📊 Relatório do Dia`:**
   * **Função:** Atalho direto para a tela de relatórios e fechamento de caixa diário.
5. **Botão `⚙️ Ajustes do Estabelecimento`:**
   * **Função:** Acesso rápido às configurações de dados cadastrais, horários de funcionamento e domínio próprio.

---

# Módulo 02: Vendas, Encomendas e Estoque

## 2.1. Vendas (Gestão e Controle de Vendas no Balcão)

```
┌────────────────────────────────────────────────────────────────────────┐
│ TELA DE GESTÃO E CONTROLE DE VENDAS                                    │
│ ┌───────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ Catálogo de Produtos          │ │ Comanda Atual do Cliente         │ │
│ │ [🍗 Frango Inteiro - R$ 45,00]│ │ • 1x Frango Inteiro    R$ 45,00  │ │
│ │ [🍗 Meio Frango    - R$ 25,00]│ │ • 1x Maionese Caseira  R$ 15,00  │ │
│ │ [🥩 Linguiça Brasa - R$ 39,90]│ │ • 1x Farofa Especial   R$ 10,00  │ │
│ │ [🥗 Maionese Caseira-R$ 15,00]│ ├──────────────────────────────────┤ │
│ │ [🥣 Farofa Especial -R$ 10,00]│ │ TOTAL: R$ 70,00                  │ │
│ └───────────────────────────────┘ │ [ FINALIZAR VENDA (F2) ]         │ │
│                                   └──────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Como adicionar produtos para venda:
* **Toque ou Clique no Card:** Na grade de produtos, basta clicar sobre a foto ou nome do item (ex.: *Frango Inteiro Assado*). O item vai automaticamente para a comanda lateral direita.
* **Controle de Quantidade:** Use os botões `+` e `-` na comanda para ajustar quantas unidades o freguês está levando.
* **Produtos Pesáveis (Por Quilo):** Ao clicar em carnes vendidas por peso (como *Linguiça Toscana* ou *Costela*), abre-se o campo para digitar o peso em gramas ou o valor em reais correspondente aferido na balança de balcão.

### Como adicionar e atualizar os preços:
* Acesse o menu **Estoque** ou clique no ícone de lápis `✏️` sobre o produto.
* No campo **Preço de Venda (R$)**, digite o valor unitário desejado.
* Clique em **Salvar Preço**; o novo valor passa a valer imediatamente em todas as telas da loja.

### O que faz cada botão da Tela de Vendas:
* **Botão `Finalizar Venda (F2)`:** Abre a janela de cobrança, permitindo selecionar o método de pagamento (Dinheiro, Pix, Débito ou Crédito).
* **Botão `Vincular Cliente / Clube do Frango`:** Permite associar o CPF ou celular do cliente para carimbar selos no programa de fidelidade.
* **Botão `Aplicar Desconto / Cortesia`:** Permite abater um valor em reais ou porcentagem mediante autorização.
* **Botão `Limpar Comanda`:** Cancela a operação atual e esvazia os itens selecionados caso o cliente desista da compra.
* **Botão `Imprimir Comprovante / Cupom`:** Emite a via impressa com os itens e o QR Code do Clube do Frango.

---

## 2.2. Pedidos (Reservas e Encomendas de Assados)
A tela de Pedidos é a espinha dorsal do seu domingo. Ela gerencia o fluxo de quem encomendou antecipadamente para evitar esperas no balcão.

### KPIs do Topo da Tela de Pedidos:
1. **Total de Reservas:** Quantidade absoluta de pedidos cadastrados para a data selecionada.
2. **Frangos Encomendados:** Quantidade total de aves reservadas (permite ao assador calcular quantos frangos devem ir ao fogo).
3. **Aguardando Retirada:** Pedidos que já estão prontos na estufa térmica e aguardando o freguês chegar.
4. **Faturamento Previsto:** Valor financeiro total das reservas do dia.

### O que faz cada botão da Tela de Pedidos:
* **Botão `+ Nova Reserva`:** Abre o formulário de cadastro de encomenda (Nome, Celular, Horário de Retirada, Frangos, Acompanhamentos e Observações como "cortar em 4 partes" ou "bem tostado").
* **Botão `Avançar Status (No Espeto / Braseiro)`:** Muda o pedido para a fase de fogo e dispara aviso automático no WhatsApp do freguês.
* **Botão `Avançar Status (Pronto na Estufa)`:** Avisa o cliente que o assado está quentinho e pronto para retirada.
* **Botão `Entregue / Concluir`:** Dá baixa no pedido, registra o pagamento e credita os selos de fidelidade.
* **Botão `Filtro por Faixa Horária`:** Permite visualizar apenas os pedidos de um horário específico (ex.: 11h30 às 12h00).

---

## 2.3. Estoque (Insumos, Frangos Crus e Braseiro)
Gerencia o estoque físico tanto de aves prontas quanto de produtos crus e embalagens.

### KPIs do Topo da Tela de Estoque:
1. **Frangos Crus Marinando:** Quantidade de aves temperadas na câmara fria prontas para entrar no forno.
2. **Frangos no Braseiro / Forno:** Frangos atualmente assando nos espetos.
3. **Frangos Prontos na Estufa:** Frangos dourados disponíveis para venda imediata.
4. **Alertas de Reposição:** Itens que atingiram o nível crítico (ex.: carvão acabando ou poucas embalagens térmicas).

### O que faz cada botão da Tela de Estoque:
* **Botão `+ Entrada de Estoque`:** Registra a chegada de frangos de fornecedores e insumos com quantidade e custo de compra.
* **Botão `Mover para o Fogo / Espeto`:** Dá baixa dos frangos crus marinando e lança no lote do braseiro ativo.
* **Botão `Mover para Estufa Térmica`:** Finaliza o tempo de assamento e disponibiliza as aves para a venda de balcão.
* **Botão `Ajuste / Registro de Perda`:** Registra eventualidades (frango ressecado, queima excessiva ou descarte de carcaça) para manter o estoque real 100% calibrado.

---

# Módulo 03: Clientes, Equipe e Atendimento WhatsApp

## 3.1. Clientes & Clube do Frango (Fidelidade)

```
┌────────────────────────────────────────────────────────────────────────┐
│ TELA DE CLIENTES & CLUBE DO FRANGO                                     │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ + Novo Cliente ]   [ 📥 Importar Contatos ]  [ ⭐ Regras do Clube]│ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────┐  ┌──────────────────────────┐             │
│ │ Card: Cláudio Duarte     │  │ Card: Carla Silveira     │             │
│ │ Preferência: Bem tostado │  │ Preferência: Sem queimar │             │
│ │ Cartela: [🍗🍗🍗🍗🍗]     │  │ Cartela: [🍗🍗🍗🍗🍗]     │             │
│ │          [🍗🍗🍗--] 8/10 │  │          [🍗🍗🍗🍗🎁] 10/10│             │
│ │ [ WhatsApp ] [ Histórico]│  │ [ 🎁 RESGATAR PRÊMIO ]   │             │
│ └──────────────────────────┘  └──────────────────────────┘             │
└────────────────────────────────────────────────────────────────────────┘
```

### KPIs da Tela de Clientes:
1. **Total de Fregueses:** Quantidade de clientes na base ativa.
2. **Prontos para Resgate (🎁):** Clientes que completaram a cartela de 10 selos e têm direito a retirar 1 frango assado grátis.
3. **Clientes VIPs / Frequentes:** Clientes que compram 3 ou mais domingos por mês.
4. **Ticket Médio por Freguês:** Média de gasto por visita.

### O que faz cada botão da Tela de Clientes:
* **Botão `+ Novo Cliente`:** Cadastra nome, WhatsApp, endereço/bairro e a **preferência gastronômica** (ex.: "gosta de frango bem passado", "caprichar na farofa").
* **Botão `📥 Importar Contatos`:** Permite puxar listas de contatos de uma só vez colando texto ou subindo arquivo CSV/VCF do WhatsApp.
* **Botão `⭐ Regras do Clube`:** Abre o painel onde o lojista define quantos selos completam a cartela (padrão: 10) e qual é o prêmio oferecido.
* **Botão `+ Carimbar Selo` (no card do cliente):** Adiciona manualmente 1 selo à cartela do freguês.
* **Botão `🎁 Resgatar Prêmio`:** Fica verde quando o freguês atinge a meta; ao clicar, zera os 10 selos e registra a cortesia entregue.
* **Botão `WhatsApp`:** Abre mensagem rápida de extrato de selos ou lembrete de reserva diretamente no aplicativo do cliente.

---

## 3.2. Usuários & Equipe
Gerencia os colaboradores do estabelecimento e seus níveis de permissão.

### Níveis de Perfil:
1. **Proprietário (Owner):** Acesso total, incluindo faturamento, taxas, relatórios e exclusões.
2. **Gerente / Administrador:** Acesso a vendas, pedidos, clientes, estoque e relatórios parciais.
3. **Operador de Caixa / Atendente:** Acesso focado na gestão e controle de vendas, reservas e cadastro de clientes.
4. **Assador / Frangueiro:** Acesso simplificado visualizando pedidos em preparo e contagem de frangos no fogo.

### O que faz cada botão da Tela de Usuários:
* **Botão `+ Convidar / Novo Colaborador`:** Cadastra nome, cargo, celular, PIN de acesso e permissões.
* **Botão `Bloquear / Inativar Acesso`:** Desativa instantaneamente o login de um funcionário desligado sem apagar o histórico de vendas.
* **Botão `Editar Permissões`:** Permite liberar ou restringir funções (ex.: permitir ou proibir cancelamento de vendas e descontos).

---

## 3.3. Central WhatsApp & Automações

```
┌────────────────────────────────────────────────────────────────────────┐
│ CENTRAL WHATSAPP: AUTOMAÇÃO DO DOMINGO                                │
│ [ 📲 Conectar WhatsApp ]  [ 📋 Importar Contatos em Lote ]             │
│                                                                        │
│ Gatilhos Automáticos:                                                  │
│ 1. Confirmação de Reserva de Domingo      [ Ativado (ON) ]             │
│ 2. Frango entrou no Espeto / Braseiro     [ Ativado (ON) ]             │
│ 3. Assado Pronto na Estufa (Retirada)     [ Ativado (ON) ]             │
│ 4. Extrato de Selos do Clube do Frango    [ Ativado (ON) ]             │
└────────────────────────────────────────────────────────────────────────┘
```

### Como importar contatos em lote:
1. Clique no botão **`📥 Importar Contatos`**.
2. Cole os números de celular e nomes no campo de texto (ex.: `11999998888, João Silva`) ou clique em **`Carregar Arquivo CSV/VCF`**.
3. O sistema remove duplicidades automaticamente e valida os números com o código internacional do Brasil (`+55`).
4. Clique em **Salvar Importação** para integrar a lista à base de fregueses.

### Como conectar com o WhatsApp da loja:
1. Clique no botão **`📲 Conexão WhatsApp`**.
2. Abra o WhatsApp no celular da sua loja, acesse **Aparelhos Conectados** e selecione **Conectar um aparelho**.
3. Aponte a câmera para o QR Code gerado na tela.
4. Uma vez conectado, todas as confirmações de reserva e avisos de retirada serão disparados pelo próprio número da sua loja.

### O que faz cada botão da Tela de WhatsApp:
* **Botão `+ Novo Disparo / Campanha`:** Cria uma mensagem em massa para os clientes cadastrados (ex.: *Cardápio especial de frango com farofa para este domingo*).
* **Botão `Editar Template`:** Permite personalizar o texto de cada mensagem automática mantendo o nome do seu estabelecimento.
* **Botão `Testar Gatilho no Celular`:** Envia uma mensagem de teste para o seu próprio número para você conferir a formatação antes de usar com os clientes.

---

# Módulo de Pagamentos, Provedores & Maquininhas

```
┌────────────────────────────────────────────────────────────────────────┐
│ PAGAMENTOS & MAQUININHAS                                               │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ + Conectar Maquininha ]               [ 📋 Placa Pix de Balcão ] │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ Provedores Homologados: [ Mercado Pago ] [ Stone ] [ PagBank ] [ Cielo ]│
│                                                                        │
│ Maquininhas no Caixa:                                                  │
│ ┌─────────────────────────────┐  ┌──────────────────────────────────┐  │
│ │ Maquininha Balcão Principal │  │ Maquininha Retirada Rápida       │  │
│ │ Modelo: Point Pro 2         │  │ Modelo: Stone SmartPOS S920      │  │
│ │ Status: ONLINE (98% bateria)│  │ Status: ONLINE (85% bateria)     │  │
│ │ [ 📶 Testar Conexão ]       │  │ [ 📶 Testar Conexão ]            │  │
│ └─────────────────────────────┘  └──────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

## 4.1. KPIs da Tela de Pagamentos:
1. **Faturamento Bruto:** Total transacionado no dia.
2. **Taxas Estimadas de Operação:** Valor retido pelas credenciadoras de cartão.
3. **Líquido em Conta (Lucro Real 💰):** Valor limpo que cai na sua conta corrente após os descontos.
4. **Maquininhas Ativas:** Quantidade de aparelhos ligados e prontos para cobrar.

## 4.2. Como conectar e gerenciar maquininhas:
1. Clique no botão **`+ Conectar Maquininha`**.
2. Selecione o modelo (ex.: *Mercado Pago Point Pro*, *Stone SmartPOS*, *PagBank Moderninha* ou *Cielo LIO*).
3. Informe o número de série/patrimônio impresso no verso do aparelho.
4. Selecione se o equipamento opera em **Modo Integrado Push (TEF)** — onde o valor vai sozinho para o visor da máquina — ou em modo manual.
5. Clique em **Salvar Maquininha**.

## 4.3. O que faz cada botão da Tela de Pagamentos:
* **Botão `📶 Testar Conexão / Sinal`:** Envia um comando de comunicação em milissegundos para certificar que a maquininha está respondendo ao caixa.
* **Botão `✏️ Configurar Taxas`:** Abre a tabela de alíquotas para você informar as porcentagens exatas que você paga para a operadora (Débito, Crédito à Vista, Parcelado e Pix).
* **Botão `📋 Placa Pix de Balcão`:** Gera a arte da placa de acrílico com o QR Code oficial da sua loja pronta para impressão (`window.print()`).

---

# Módulo de Relatórios Avançados & Inteligência de Negócio

```
┌────────────────────────────────────────────────────────────────────────┐
│ RELATÓRIOS AVANÇADOS & DRE                                             │
│ Filtros: [ Hoje ] [ Último Domingo 🔥 ] [ Últimos 7 dias ] [ Mês Atual]│
│                                                                        │
│ Abas de Análise:                                                       │
│ [💵 Fechamento & DRE] [🍗 Curva ABC] [⏰ Picos de Horário] [💳 Taxas]  │
│                                                                        │
│ [ 🖨️ Imprimir Fechamento de Caixa ]       [ 📥 Exportar Relatório CSV] │
└────────────────────────────────────────────────────────────────────────┘
```

## 5.1. KPIs da Tela de Relatórios:
1. **Faturamento Bruto do Período:** Receita total gerada pelas vendas.
2. **Custo de Intermediação:** Total de taxas pagas a maquininhas no período.
3. **Custo de Mercadorias (CMV Estimado ~39%):** Gasto estimado com aves cruas, carvão e embalagens.
4. **Lucro Operacional Bruto:** Margem líquida real que sobra para o negócio.

## 5.2. O que faz cada botão da Tela de Relatórios:
* **Botões de Filtro de Período (`Hoje`, `Último Domingo`, `7 Dias`, `Mês Atual`):** Recalculam todos os gráficos e números da tela instantaneamente com um toque.
* **Botão `🖨️ Imprimir Fechamento de Caixa`:** Abre o comprovante diário formatado em padrão cupom térmico com resumo de entradas (Dinheiro em gaveta, Pix e Cartões) e linha para assinatura física do responsável.
* **Botão `📥 Exportar Relatório (CSV)`:** Faz o download imediato de planilha compatível com Microsoft Excel e Google Sheets com codificação brasileira (UTF-8 BOM).
* **Aba `🍗 Curva ABC de Produtos`:** Exibe a lista dos produtos mais lucrativos classificados em Classe A (75% do faturamento), B e C para auxiliar nas compras de insumos.
* **Aba `⏰ Picos de Horário`:** Exibe o gráfico com a quantidade de frangos demandados entre 08h e 15h para calibrar o acendimento da churrasqueira.

---

# Módulo de Configurações do Estabelecimento

## 6.1. O que faz cada botão e campo da Tela de Configurações:
* **Campo `Nome Comercial da Loja`:** Nome que aparece no topo do sistema, nas placas impressas e no WhatsApp.
* **Campo `Chave Pix Oficial`:** Informa a chave (CNPJ, Celular ou E-mail) que recebe os pagamentos dos clientes.
* **Campo `Tempo Médio de Preparo / Fornada`:** Tempo estimado (em minutos) do ciclo de brasa para cálculo automático das previsões de pedidos.
* **Campo `Subdomínio / Domínio Próprio`:** Permite configurar seu endereço próprio na internet (ex.: `pedidos.suafrangaria.com.br`).
* **Botão `💾 Salvar Configurações`:** Grava todas as alterações imediatamente no servidor e no banco de dados.

---

# Módulo Exclusivo: Painel Master do Dono da Plataforma (SaaS SuperAdmin) 👑

Este módulo destina-se **exclusivamente a você**, proprietário do negócio Ao Ponto, que comercializa o sistema para donos de assadeiras e frangarias em todo o país.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PAINEL MASTER - GESTÃO DO SAAS AO PONTO 👑                            │
│ ┌───────────────────┐ ┌───────────────────┐ ┌────────────────────────┐ │
│ │ MRR Recorrente    │ │ Assadeiras Ativas │ │ Inadimplência / Atraso │ │
│ │ R$ 386,00/mês     │ │ 4 ativas (5 total)│ │ 1 pendente ⚠️          │ │
│ └───────────────────┘ └───────────────────┘ └────────────────────────┘ │
│                                                                        │
│ Tabela de Clientes (Assadeiras):                                       │
│ • Ao Ponto Assados & Brasa | Plano Balcão (R$ 79) | [Em Dia]  | [Ações]│
│ • Frangaria da Villa       | Plano Balcão (R$ 79) | [Em Dia]  | [Ações]│
│ • Brasa Nobre Rotisserie   | Plano Redes  (R$ 149)| [Em Dia]  | [Ações]│
│ • Galeto Dourado do Bairro | Plano Grátis (R$ 0)  | [Grátis]  | [Ações]│
│ • Assados do Povo          | Plano Balcão (R$ 79) | [BLOQUEADO]🛑      │
└────────────────────────────────────────────────────────────────────────┘
```

## 7.1. KPIs Executivos do SaaS:
1. **MRR (Receita Recorrente Mensal):** Soma de todas as mensalidades ativas recebidas no mês.
2. **Total de Assadeiras Cadastradas:** Número de lojas ativas, gratuitas e bloqueadas.
3. **Inadimplência / Atrasos:** Identificação imediata de lojistas com pagamentos pendentes de mensalidade.
4. **Volume Transacionado no SaaS:** Total de vendas processadas por todos os seus clientes reunidos.

## 7.2. Ferramentas de Controle de Clientes e Mensalidades:
* **Botão `🛑 Bloquear Acesso`:** Suspende imediatamente o uso da plataforma pela assadeira em atraso. O lojista vê uma tela de bloqueio informando o motivo e um link para regularizar a mensalidade via WhatsApp com você.
* **Botão `✅ Desbloquear`:** Restabelece o acesso imediato da assadeira assim que a fatura for quitada.
* **Botão `🚀 Alterar / Ampliar Plano`:** Permite ao Dono da Plataforma fazer upgrades (ex.: mudar de Grátis para Balcão ou Redes), definir limites de vendas customizados e alterar a data de vencimento.
* **Botão `👁️ Acessar Loja (Suporte Técnico)`:** Permite a você entrar na conta do lojista com 1 clique para prestar assistência, configurar produtos ou tirar dúvidas operacionais.
* **Botão `+ Cadastrar Nova Assadeira`:** Para cadastrar manualmente novos clientes que fecharam contrato diretamente pelo seu WhatsApp comercial.

---

## Orientações de Impressão e Suporte

* **Impressão do Manual em PDF:** Abra a versão online deste manual no navegador e pressione as teclas `Ctrl + P` (ou clique no botão **Imprimir / Salvar em PDF**). O arquivo já possui regras de estilo de impressão dedicadas que removem barras de rolagem e ajustam as quebras de página com qualidade gráfica impecável.
* **Suporte e Atendimento Técnico:** Em caso de dúvidas operacionais ou suporte com maquininhas de cartão, consulte a Central de Ajuda interna no menu lateral ou entre em contato com o suporte da plataforma Ao Ponto.

