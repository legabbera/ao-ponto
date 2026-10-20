/**
 * LANDING PAGE B2B — MEU FRANGO
 * Foco comercial, alta conversão, responsiva e honesta.
 */
import { icone } from '../components/icons.js';
import { fmtMoeda } from '../utils/format.js';

// Configuração centralizada para links e contatos reais
export const LANDING_CONFIG = {
  WHATSAPP_NUMERO: '', // Preencha com o número oficial (ex: '5511999999999')
  WHATSAPP_MENSAGEM: 'Olá! Gostaria de conhecer mais sobre o aplicativo Meu Frango.',
  ANO_ATUAL: 2026,
};

export function renderLanding(raiz, irPara) {
  raiz.innerHTML = `
  <div class="lp-body">
    <!-- 1. BARRA SUPERIOR -->
    <header class="lp-nav">
      <div class="lp-container lp-nav-inner">
        <a href="#hero" class="lp-logo">
          <img src="/logo-badge.jpg" alt="Logo Meu Frango" class="lp-logo-img" />
          <div class="lp-logo-text">
            <strong>Meu Frango</strong>
            <small>Gestão de Vendas</small>
          </div>
        </a>

        <ul class="lp-nav-links">
          <li><a href="#beneficios" class="lp-nav-link">Benefícios</a></li>
          <li><a href="#demonstracao" class="lp-nav-link">Como funciona</a></li>
          <li><a href="#comparativo" class="lp-nav-link">Comparativo</a></li>
          <li><a href="#para-quem" class="lp-nav-link">Para quem é</a></li>
          <li><a href="#faq" class="lp-nav-link">Dúvidas</a></li>
        </ul>

        <div class="lp-nav-actions">
          <button class="lp-btn-demo-link" id="nav-btn-app" title="Abrir protótipo funcional">
            ${icone('vendas', 'mini')} Testar App Demo
          </button>
          <button class="lp-btn-cta" id="nav-btn-cta">
            Quero conhecer
          </button>
          <button class="lp-btn-menu-mobile" id="btn-toggle-menu" aria-label="Abrir menu de navegação">
            ${icone('menu')}
          </button>
        </div>
      </div>

      <!-- Menu Mobile Desdobrável -->
      <div class="lp-mobile-menu" id="mobile-menu">
        <a href="#beneficios" class="mobile-nav-link">Benefícios</a>
        <a href="#demonstracao" class="mobile-nav-link">Como funciona o app</a>
        <a href="#comparativo" class="mobile-nav-link">Comparativo com marketplaces</a>
        <a href="#para-quem" class="mobile-nav-link">Para quem é</a>
        <a href="#faq" class="mobile-nav-link">Perguntas frequentes</a>
        <button class="btn btn-contorno" id="mobile-btn-app" style="margin-top:8px">
          ${icone('vendas')} Experimentar App Demonstrativo
        </button>
        <button class="btn btn-primario" id="mobile-btn-cta">
          Quero conhecer o Meu Frango
        </button>
      </div>
    </header>

    <!-- 2. HERO — PRIMEIRA DOBRA -->
    <section class="lp-hero" id="hero">
      <div class="lp-container lp-hero-grid">
        <div class="lp-hero-content">
          <div class="lp-badge">
            🍗 Feito para quem vende comida na brasa e no balcão
          </div>
          <h1 class="lp-hero-title">
            Você cuida da brasa. <br />
            <span class="destaque-brasa">O Meu Frango ajuda a cuidar das vendas.</span>
          </h1>
          <p class="lp-hero-subtitle">
            Organize suas vendas, acompanhe seus produtos e tenha uma visão mais clara do seu negócio — direto pelo celular, sem complicação.
          </p>

          <div class="lp-hero-ctas">
            <button class="lp-btn-cta" id="hero-btn-cta">
              Quero conhecer o Meu Frango
            </button>
            <a href="#demonstracao" class="lp-btn-secundario">
              ${icone('painel', 'mini')} Ver como funciona
            </a>
          </div>

          <div class="lp-hero-demo-call">
            <span>Quer ver funcionando agora?</span>
            <a href="javascript:void(0)" id="hero-link-app">Experimentar protótipo interativo &rarr;</a>
          </div>

          <div class="lp-hero-pills">
            <div class="lp-hero-pill">
              <span>🍗</span> Mais organização no dia a dia
            </div>
            <div class="lp-hero-pill">
              <span>📊</span> Visão das vendas por produto
            </div>
            <div class="lp-hero-pill">
              <span>📅</span> Pedidos e reservas em um só lugar
            </div>
          </div>
        </div>

        <div class="lp-hero-visual">
          <div class="lp-hero-image-backdrop">
            <img src="/images/hero-frango.jpg" alt="Frango assado dourado com farofa" />
          </div>

          <!-- Celular com tela do app simulada -->
          <div class="lp-phone-frame">
            <div class="lp-phone-notch"></div>
            <div class="lp-phone-screen">
              <div class="lp-mock-header">
                <div>
                  <strong>Meu Frango</strong>
                  <div style="font-size:10px;color:var(--texto-suave)">Ponto Centro &bull; Hoje</div>
                </div>
                <span class="lp-mock-badge">Online</span>
              </div>

              <div class="lp-mock-kpis">
                <div class="lp-mock-kpi">
                  <span>Faturamento</span>
                  <strong>R$ 3.840</strong>
                  <small>+14% vs ontem</small>
                </div>
                <div class="lp-mock-kpi">
                  <span>Frangos</span>
                  <strong>48 un.</strong>
                  <small>Meta: 50 un.</small>
                </div>
              </div>

              <div class="lp-mock-chart-card">
                <div class="lp-mock-chart-title">
                  <span>Pico de Horário</span>
                  <span style="color:var(--brasa)">11h - 13h</span>
                </div>
                <div class="lp-mock-bars">
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:25%"></div><span class="lp-mock-bar-label">9h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:55%"></div><span class="lp-mock-bar-label">10h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar ambar" style="height:95%"></div><span class="lp-mock-bar-label">11h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar ambar" style="height:100%"></div><span class="lp-mock-bar-label">12h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:70%"></div><span class="lp-mock-bar-label">13h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:30%"></div><span class="lp-mock-bar-label">14h</span></div>
                </div>
              </div>

              <div class="lp-mock-list">
                <div style="font-size:11px;font-weight:700;margin-bottom:6px;color:var(--carvao)">Últimas Vendas Balcão</div>
                <div class="lp-mock-list-item">
                  <span>1x Frango inteiro + Farofa</span>
                  <strong style="color:var(--verde)">R$ 45,00</strong>
                </div>
                <div class="lp-mock-list-item">
                  <span>2x Meio Frango + Maionese</span>
                  <strong style="color:var(--verde)">R$ 65,00</strong>
                </div>
                <div class="lp-mock-list-item">
                  <span>500g Linguiça assada</span>
                  <strong style="color:var(--verde)">R$ 19,95</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. IDENTIFICAÇÃO — QUEM VIVE DE VENDA SABE -->
    <section class="lp-realidade">
      <div class="lp-container">
        <div class="lp-realidade-intro">
          <div class="lp-badge lp-badge-dark">🔥 Feito para a sua realidade</div>
          <h2 class="lp-section-title light">Na correria do atendimento, cada detalhe conta.</h2>
          <p>
            Tem o preparo, o cliente chegando, o pedido pelo WhatsApp, o pagamento, a reposição dos produtos e as contas no fim do dia. Quem vende frango assado ou churrasquinho precisa cuidar de tudo ao mesmo tempo.
          </p>
          <p style="color:var(--ambar)">
            O Meu Frango foi pensado para ajudar você a organizar essa rotina e enxergar melhor o movimento do seu negócio.
          </p>
        </div>

        <div class="lp-situacoes-grid">
          <div class="lp-situacao-card">
            <div class="lp-situacao-icon">🏃</div>
            <h3>No atendimento</h3>
            <p>
              Registre vendas com rapidez no balcão, mesmo com as mãos ocupadas. Botões grandes de toque ágil, cálculo automático de troco e fechamento em poucos segundos.
            </p>
          </div>

          <div class="lp-situacao-card">
            <div class="lp-situacao-icon">📅</div>
            <h3>Nas encomendas</h3>
            <p>
              Organize os pedidos antecipados de sábado e domingo com horário combinado de retirada. Chega de comandas de papel perdidas na fumaça ou assados atrasados.
            </p>
          </div>

          <div class="lp-situacao-card">
            <div class="lp-situacao-icon">📈</div>
            <h3>No fechamento</h3>
            <p>
              Consulte os números do dia com clareza. Saiba exatamente quanto faturou, o que mais vendeu e o que sobrou, sem precisar passar horas fazendo contas no caderno.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. BENEFÍCIOS PRINCIPAIS -->
    <section class="lp-beneficios" id="beneficios">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="lp-badge">Controle sem complicação</div>
          <h2 class="lp-section-title">Seu negócio merece mais controle — sem complicar sua rotina.</h2>
          <p class="lp-section-desc">
            Ferramentas práticas e intuitivas, validadas diretamente para a operação do pequeno vendedor de alimentos.
          </p>
        </div>

        <div class="lp-beneficios-grid">
          <div class="lp-beneficio-card">
            <div class="lp-beneficio-icon">⚡</div>
            <h3>1. Vendas organizadas</h3>
            <p>Registre as vendas do balcão em segundos e consulte os resultados e faturamento do ponto de venda em tempo real.</p>
          </div>

          <div class="lp-beneficio-card">
            <div class="lp-beneficio-icon">🍗</div>
            <h3>2. Saiba o que mais sai</h3>
            <p>Visualize a quantidade vendida por produto (frango inteiro, meio, espetos, guarnições ou peso por kg) e identifique os itens de maior saída.</p>
          </div>

          <div class="lp-beneficio-card">
            <div class="lp-beneficio-icon">📅</div>
            <h3>3. Pedidos e reservas mais claros</h3>
            <p>Organize pedidos com nome do cliente, produto, quantidade, data e horário marcado para retirada, separando o fluxo de preparo.</p>
          </div>

          <div class="lp-beneficio-card">
            <div class="lp-beneficio-icon">📊</div>
            <h3>4. Acompanhe o resultado</h3>
            <p>Consulte indicadores consolidados por dia, semana, mês ou período personalizado através de gráficos simples e fáceis de ler.</p>
          </div>

          <div class="lp-beneficio-card">
            <div class="lp-beneficio-icon">👥</div>
            <h3>5. Conheça seus clientes</h3>
            <p>Mantenha os contatos e histórico de quem sempre encomenda com você organizados com total respeito à privacidade.</p>
            <span class="lp-tag-status">Em desenvolvimento &bull; Etapa 2</span>
          </div>

          <div class="lp-beneficio-card">
            <div class="lp-beneficio-icon">📱</div>
            <h3>6. Feito para a rotina do vendedor</h3>
            <p>Interface projetada sob medida para celulares: botões largos, alto contraste para leitura clara e operação sem complicação técnica.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. SEÇÃO COMPARATIVA — MEU FRANGO E MARKETPLACES -->
    <section class="lp-comparativo" id="comparativo">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="lp-badge">Visão Clara &bull; Sem Promessas Falsas</div>
          <h2 class="lp-section-title">Tenha mais clareza sobre a sua operação e os canais que usa para vender.</h2>
        </div>

        <div class="lp-comp-intro">
          Marketplaces de entrega, como o iFood, podem ajudar estabelecimentos a serem descobertos por novos clientes. Cada canal tem suas regras, condições comerciais e custos. O <strong>Meu Frango</strong> foi criado como uma ferramenta de apoio à gestão e à organização das vendas do seu próprio negócio — <strong>não como substituto automático de todos os canais</strong>.
        </div>

        <div class="lp-comp-table-wrap">
          <table class="lp-comp-table">
            <thead>
              <tr>
                <th style="width: 28%;">Aspecto da Operação</th>
                <th class="col-meufrango" style="width: 36%;">Meu Frango 🍗</th>
                <th style="width: 36%;">Marketplaces de Entrega 🛵</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="lp-comp-aspecto">Objetivo principal</td>
                <td class="col-meufrango">Apoiar a organização, o controle do balcão e a clareza dos números do seu ponto de venda.</td>
                <td>Conectar consumidores e estabelecimentos em uma plataforma de entrega com catálogo geral.</td>
              </tr>
              <tr>
                <td class="lp-comp-aspecto">Gestão de vendas próprias (balcão e retirada)</td>
                <td class="col-meufrango">Feito para registrar vendas presenciais, reservas de assados para domingo e clientes fiéis.</td>
                <td>Focado na gestão de pedidos que entram pela própria plataforma do aplicativo.</td>
              </tr>
              <tr>
                <td class="lp-comp-aspecto">Descoberta por novos clientes</td>
                <td class="col-meufrango">Não gera clientes automaticamente: é um sistema para você gerenciar o negócio que você já construiu.</td>
                <td>Pode oferecer visibilidade e exposição para novos consumidores dentro da base do marketplace.</td>
              </tr>
              <tr>
                <td class="lp-comp-aspecto">Custos e condições</td>
                <td class="col-meufrango">Sem comissões por cada assado vendido no balcão. Modelo de assinatura transparente em validação.</td>
                <td>Costuma cobrar comissões percentuais sobre as vendas e mensalidades (consultar tabela vigente da plataforma).</td>
              </tr>
              <tr>
                <td class="lp-comp-aspecto">Relatórios da operação</td>
                <td class="col-meufrango">Indicadores diretos de faturamento, horários de maior movimento e itens mais pedidos na sua loja.</td>
                <td>Relatórios focados nos pedidos e repasses realizados exclusivamente dentro do marketplace.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lp-comp-conclusao">
          <strong>Conclusão prática:</strong> Você não precisa escolher um único canal para vender. Use os canais que fazem sentido para seu negócio e utilize o <strong>Meu Frango</strong> como apoio à gestão da sua operação real.
        </div>
      </div>
    </section>

    <!-- 6. DEMONSTRAÇÃO VISUAL DO PRODUTO -->
    <section class="lp-demo" id="demonstracao">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="lp-badge">Telas do Aplicativo</div>
          <h2 class="lp-section-title">Veja como o Meu Frango pode acompanhar sua rotina.</h2>
          <p class="lp-section-desc">
            Explore as principais ferramentas do protótipo desenvolvido para funcionar com agilidade na tela do seu celular.
          </p>
        </div>

        <div class="lp-demo-tabs">
          <button class="lp-demo-tab-btn ativo" data-tab="tab-dashboard">
            📊 Visão Geral (Dashboard)
          </button>
          <button class="lp-demo-tab-btn" data-tab="tab-pdv">
            🍗 Caixa Rápido (PDV)
          </button>
          <button class="lp-demo-tab-btn" data-tab="tab-pedidos">
            📅 Encomendas e Reservas
          </button>
        </div>

        <div class="lp-demo-screen-wrap">
          <!-- ABA 1: DASHBOARD -->
          <div class="lp-demo-screen-content visivel" id="tab-dashboard">
            <div class="card" style="margin-bottom:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                <div>
                  <strong style="font-size:16px;color:var(--carvao)">Resumo do Domingo &bull; Ponto Centro</strong>
                  <div style="font-size:12px;color:var(--texto-suave)">Período de maior movimento da semana</div>
                </div>
                <span class="badge" style="background:var(--verde-claro);color:var(--verde);font-weight:700">Caixa Aberto</span>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px;margin-bottom:16px">
                <div style="background:var(--creme);padding:12px;border-radius:var(--raio-p);border:1px solid var(--borda)">
                  <span style="font-size:11px;color:var(--texto-suave)">Faturamento Estimado</span>
                  <div style="font-size:20px;font-weight:800;color:var(--carvao)">R$ 4.250,00</div>
                  <small style="color:var(--verde);font-weight:600">▲ 18% vs domingo passado</small>
                </div>
                <div style="background:var(--creme);padding:12px;border-radius:var(--raio-p);border:1px solid var(--borda)">
                  <span style="font-size:11px;color:var(--texto-suave)">Frangos Vendidos</span>
                  <div style="font-size:20px;font-weight:800;color:var(--brasa)">52 unidades</div>
                  <small style="color:var(--texto-suave)">Total de 55 assados</small>
                </div>
                <div style="background:var(--creme);padding:12px;border-radius:var(--raio-p);border:1px solid var(--borda)">
                  <span style="font-size:11px;color:var(--texto-suave)">Ticket Médio</span>
                  <div style="font-size:20px;font-weight:800;color:var(--carvao)">R$ 53,80</div>
                  <small style="color:var(--texto-suave)">79 clientes atendidos</small>
                </div>
              </div>

              <div style="background:var(--creme);padding:14px;border-radius:var(--raio-p);border:1px solid var(--borda)">
                <div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--carvao)">Horários com maior concentração de clientes</div>
                <div style="font-size:12px;color:var(--texto-suave);margin-bottom:12px">Pico observado das 11h30 às 13h15. Ideal para reforçar a saída dos assados.</div>
                <div class="lp-mock-bars" style="height:70px">
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:20%"></div><span class="lp-mock-bar-label">09h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:40%"></div><span class="lp-mock-bar-label">10h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar ambar" style="height:85%"></div><span class="lp-mock-bar-label">11h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar ambar" style="height:100%"></div><span class="lp-mock-bar-label">12h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:65%"></div><span class="lp-mock-bar-label">13h</span></div>
                  <div class="lp-mock-bar-col"><div class="lp-mock-bar" style="height:25%"></div><span class="lp-mock-bar-label">14h</span></div>
                </div>
              </div>
            </div>
            <div class="lp-demo-legend">
              <span><strong>Visão Geral:</strong> Indicadores resumidos e curva horária para planejar quantas peças colocar na brasa.</span>
              <span class="badge badge-demo">Dados ilustrativos de demonstração</span>
            </div>
          </div>

          <!-- ABA 2: PDV / CAIXA RÁPIDO -->
          <div class="lp-demo-screen-content" id="tab-pdv">
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;margin-bottom:16px">
              <div style="border:1px solid var(--borda);border-radius:var(--raio);padding:14px;background:var(--creme)">
                <div style="font-size:30px">🍗</div>
                <strong style="display:block;font-size:15px;margin-top:6px">Frango Inteiro Assado</strong>
                <span style="font-size:12px;color:var(--texto-suave)">Com farofa crocante e tempero da casa</span>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <span style="font-size:16px;font-weight:800;color:var(--brasa)">R$ 45,00</span>
                  <button class="btn btn-primario" style="min-height:36px;padding:6px 12px;font-size:12px">+ Adicionar</button>
                </div>
              </div>

              <div style="border:1px solid var(--borda);border-radius:var(--raio);padding:14px;background:var(--creme)">
                <div style="font-size:30px">🌭</div>
                <strong style="display:block;font-size:15px;margin-top:6px">Linguiça Toscana na Brasa</strong>
                <span style="font-size:12px;color:var(--texto-suave)">Venda por peso: R$ 39,90 / kg</span>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <span style="font-size:16px;font-weight:800;color:var(--brasa)">R$ 39,90 <small style="font-size:11px">/kg</small></span>
                  <button class="btn btn-primario" style="min-height:36px;padding:6px 12px;font-size:12px">+ Adicionar</button>
                </div>
              </div>

              <div style="border:1px solid var(--borda);border-radius:var(--raio);padding:14px;background:var(--creme)">
                <div style="font-size:30px">🥗</div>
                <strong style="display:block;font-size:15px;margin-top:6px">Maionese Caseira de Batata</strong>
                <span style="font-size:12px;color:var(--texto-suave)">Pote tradicional para domingo</span>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
                  <span style="font-size:16px;font-weight:800;color:var(--brasa)">R$ 15,00</span>
                  <button class="btn btn-primario" style="min-height:36px;padding:6px 12px;font-size:12px">+ Adicionar</button>
                </div>
              </div>
            </div>

            <div style="background:var(--carvao);color:var(--branco);border-radius:var(--raio-p);padding:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
              <div>
                <span style="font-size:12px;color:rgba(255,255,255,0.7)">Carrinho rápido &bull; 2 itens</span>
                <div style="font-size:18px;font-weight:800;color:var(--ambar)">Total: R$ 60,00</div>
              </div>
              <div style="display:flex;gap:8px">
                <span class="badge" style="background:rgba(255,255,255,0.15);color:var(--branco)">Dinheiro (troco R$ 40)</span>
                <span class="badge" style="background:var(--verde);color:var(--branco)">PIX Rápido</span>
              </div>
            </div>

            <div class="lp-demo-legend">
              <span><strong>Caixa Rápido (PDV):</strong> Suporte a produtos inteiros, porções e itens pesados por kg com troco descomplicado.</span>
              <span class="badge badge-demo">Simulação de tela</span>
            </div>
          </div>

          <!-- ABA 3: PEDIDOS E RESERVAS -->
          <div class="lp-demo-screen-content" id="tab-pedidos">
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
              <div style="background:var(--creme);border:1px solid var(--borda);border-radius:var(--raio-p);padding:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <strong style="color:var(--carvao)">#1042 &bull; Seu Antônio</strong>
                    <span class="badge" style="background:var(--verde-claro);color:var(--verde);font-weight:700">Pronto</span>
                  </div>
                  <div style="font-size:13px;color:var(--texto-suave);margin-top:4px">
                    1x Frango inteiro bem dourado + 1x Maionese
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:13px;font-weight:700;color:var(--brasa)">Retirada: 11:30</div>
                  <span style="font-size:11px;color:var(--texto-suave)">Pagamento no balcão</span>
                </div>
              </div>

              <div style="background:var(--creme);border:1px solid var(--borda);border-radius:var(--raio-p);padding:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <strong style="color:var(--carvao)">#1045 &bull; Dona Cláudia (WhatsApp)</strong>
                    <span class="badge" style="background:var(--brasa-clara);color:var(--brasa);font-weight:700">Em preparo</span>
                  </div>
                  <div style="font-size:13px;color:var(--texto-suave);margin-top:4px">
                    2x Frangos assados + 500g Linguiça
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:13px;font-weight:700;color:var(--brasa)">Retirada: 12:15</div>
                  <span style="font-size:11px;color:var(--verde);font-weight:600">PIX antecipado</span>
                </div>
              </div>

              <div style="background:var(--creme);border:1px solid var(--borda);border-radius:var(--raio-p);padding:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <strong style="color:var(--carvao)">#1048 &bull; Marcos da Oficina</strong>
                    <span class="badge" style="background:var(--ambar-claro);color:var(--ambar);font-weight:700">Confirmado</span>
                  </div>
                  <div style="font-size:13px;color:var(--texto-suave);margin-top:4px">
                    1x Meio frango + 1x Farofa especial
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:13px;font-weight:700;color:var(--brasa)">Retirada: 13:00</div>
                  <span style="font-size:11px;color:var(--texto-suave)">Aguardando cliente</span>
                </div>
              </div>
            </div>

            <div class="lp-demo-legend">
              <span><strong>Reservas & Encomendas:</strong> Ordem cronológica por horário de saída para ninguém ficar esperando na calçada.</span>
              <span class="badge badge-demo">Simulação de tela</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. COMO FUNCIONA -->
    <section class="lp-como-funciona" id="como-funciona">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="lp-badge">Sem Complicação</div>
          <h2 class="lp-section-title">Começar deve ser simples.</h2>
          <p class="lp-section-desc">
            Três passos adaptados à realidade de quem não tem tempo a perder com manuais difíceis.
          </p>
        </div>

        <div class="lp-etapas-grid">
          <div class="lp-etapa-card">
            <div class="lp-etapa-num">1</div>
            <h3>Conheça o sistema</h3>
            <p>
              Entenda as ferramentas disponíveis para sua rotina: navegue pelo PDV rápido, consulte o painel de pedidos e veja como os números se organizam na tela.
            </p>
          </div>

          <div class="lp-etapa-card">
            <div class="lp-etapa-num">2</div>
            <h3>Organize seu negócio</h3>
            <p>
              Configure seus produtos e preços — seja frango assado por unidade, cortes na brasa por peso (kg) ou acompanhamentos da casa.
            </p>
          </div>

          <div class="lp-etapa-card">
            <div class="lp-etapa-num">3</div>
            <h3>Acompanhe suas vendas</h3>
            <p>
              Consulte os dados na hora em que precisar. Saiba quanto faturou no fim do dia e utilize as informações para comprar a quantidade certa de insumos para a próxima fornada.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. PARA QUEM É -->
    <section class="lp-para-quem" id="para-quem">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="lp-badge">Para Quem Faz Acontecer</div>
          <h2 class="lp-section-title">Feito para quem faz acontecer todos os dias.</h2>
          <p class="lp-section-desc">
            Pensado especialmente para pequenos negócios de alimentação e venda de comida preparada:
          </p>
        </div>

        <div class="lp-publicos-grid">
          <div class="lp-publico-card">
            <div class="lp-publico-emoji">🍗</div>
            <div>
              <h3>Quem vende frango assado aos finais de semana</h3>
              <p>Perfeito para quem acorda cedo aos sábados e domingos para ligar a máquina de frango e precisa organizar a fila de encomendas do almoço.</p>
            </div>
          </div>

          <div class="lp-publico-card">
            <div class="lp-publico-emoji">🍢</div>
            <div>
              <h3>Quem prepara e vende churrasquinho à noite</h3>
              <p>Ideal para pontos de espetinho de rua que precisam registrar dezenas de espetos, refrigerantes e cervejas de forma rápida e prática.</p>
            </div>
          </div>

          <div class="lp-publico-card">
            <div class="lp-publico-emoji">🥩</div>
            <div>
              <h3>Quem trabalha com carnes e guarnições por quilo</h3>
              <p>Facilidade para calcular itens vendidos por peso (linguiça, costela, cupim, lombo) e porções tradicionais como maionese e farofa.</p>
            </div>
          </div>

          <div class="lp-publico-card">
            <div class="lp-publico-emoji">💬</div>
            <div>
              <h3>Quem recebe encomendas pelo WhatsApp</h3>
              <p>Organize em uma tela limpa todos os pedidos combinados para retirada, eliminando a dependência de papéis espalhados no balcão.</p>
            </div>
          </div>

          <div class="lp-publico-card" style="grid-column: 1 / -1">
            <div class="lp-publico-emoji">🏪</div>
            <div>
              <h3>Quem administra trailers, food trucks ou um ponto fixo</h3>
              <p>Controle centralizado para quem trabalha com a família ou com uma pequena equipe de confiança no atendimento e preparo.</p>
            </div>
          </div>
        </div>

        <div class="lp-para-quem-fechamento">
          "Seu negócio pode ser pequeno no tamanho e grande na dedicação. A ferramenta deve acompanhar a sua realidade, não complicá-la."
        </div>
      </div>
    </section>

    <!-- 9. PERGUNTAS FREQUENTES (FAQ) -->
    <section class="lp-faq" id="faq">
      <div class="lp-container">
        <div class="lp-section-header">
          <div class="lp-badge">Tire Suas Dúvidas</div>
          <h2 class="lp-section-title">Perguntas Frequentes</h2>
          <p class="lp-section-desc">
            Respostas claras e transparentes sobre o que o Meu Frango é e como ele funciona.
          </p>
        </div>

        <div class="lp-faq-list">
          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>O que é o Meu Frango?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              O Meu Frango é uma ferramenta digital desenvolvida para ajudar pequenos comerciantes de alimentos — especialmente pontos de frango assado, churrasquinho e carnes preparadas — a registrar vendas de balcão, controlar encomendas e acompanhar o faturamento do negócio direto pelo celular.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>Para quais tipos de vendedor ele foi pensado?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Para vendedores de frango assado na brasa ou na máquina de espeto, barracas de churrasquinho e espetinhos de rua, trailers, food trucks, açougues com assados de fim de semana e pequenos negócios familiares de comida para viagem.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>Funciona pelo celular?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Sim! O Meu Frango foi projetado com prioridade total para celulares (mobile-first). Os botões são grandes para facilitar o toque na correria do balcão e os textos possuem alto contraste para boa visibilidade mesmo em ambientes abertos e sob sol.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>Preciso instalar alguma coisa pesada?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Não. Ele funciona como uma aplicação web moderna que roda direto no navegador do seu celular ou tablet, sem ocupar a memória do seu aparelho.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>Posso acompanhar as vendas por produto?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Sim. O sistema permite visualizar a saída individual de itens, como frangos inteiros, meios frangos, cortes pesados por quilo e acompanhamentos, ajudando você a saber o que mais rende no seu ponto.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>É possível organizar pedidos e reservas?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Com certeza! Essa é uma das principais utilidades: cadastrar as reservas antecipadas com nome do cliente, quantidade e horário combinado de retirada, com tags de status (confirmado, em preparo e pronto).
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>O Meu Frango é integrado ao WhatsApp?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              No momento, o aplicativo ajuda você a organizar as informações de pedidos que chegam pelo seu WhatsApp manualmente na tela de reservas. O disparo automatizado de mensagens é uma funcionalidade planejada para as próximas etapas de evolução do sistema.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>O Meu Frango substitui o iFood?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Não. O Meu Frango é um sistema de gestão e controle próprio para o seu balcão e clientes diretos. Ele não concorre com os marketplaces de entrega; ele complementa a organização da sua operação para você ter total clareza sobre suas vendas próprias.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>Quanto custa?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              O projeto está atualmente em fase de validação e demonstração com pequenos empreendedores de alimentação. As condições comerciais e planos definitivos estão sendo estruturados. Cadastre seu interesse para ser avisado em primeira mão com condições especiais de lançamento.
            </div>
          </div>

          <div class="lp-faq-item">
            <button class="lp-faq-question" aria-expanded="false">
              <span>Como faço para começar?</span>
              <span class="lp-faq-arrow">▼</span>
            </button>
            <div class="lp-faq-answer">
              Você pode experimentar o protótipo interativo agora mesmo clicando no botão "Testar App Demo" no topo da página ou preencher o formulário abaixo para conversar com a equipe.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. CTA FINAL & FORMULÁRIO B2B -->
    <section class="lp-cta-final" id="contato">
      <img src="/images/espetinhos-brasa.jpg" alt="Churrasquinho na brasa com fumaça" class="lp-cta-final-bg" />
      <div class="lp-container">
        <div class="lp-cta-final-content">
          <div class="lp-badge lp-badge-dark">Dê o Próximo Passo</div>
          <h2 class="lp-section-title light">Sua dedicação merece uma gestão mais simples.</h2>
          <p class="lp-section-desc light">
            Conheça o Meu Frango e descubra como organizar melhor a rotina do seu negócio.
          </p>

          <div class="lp-form-box">
            <h3>Manifeste seu interesse</h3>
            <p>Preencha os dados abaixo para receber uma demonstração personalizada e novidades do lançamento:</p>

            <form id="lp-lead-form">
              <div class="lp-form-grid">
                <div class="lp-field">
                  <label for="lead-nome">Seu nome / responsável *</label>
                  <input type="text" id="lead-nome" name="nome" placeholder="Ex.: Zé Batista" required />
                </div>

                <div class="lp-field">
                  <label for="lead-whats">WhatsApp com DDD *</label>
                  <input type="tel" id="lead-whats" name="whatsapp" placeholder="(00) 00000-0000" required />
                </div>

                <div class="lp-field">
                  <label for="lead-tipo">Tipo de negócio *</label>
                  <select id="lead-tipo" name="tipoNegocio" required>
                    <option value="" disabled selected>Selecione seu segmento...</option>
                    <option value="frango_assado">Frango assado (máquina ou brasa)</option>
                    <option value="churrasquinho">Churrasquinho / Espetinhos de rua</option>
                    <option value="carnes_guarnicoes">Carnes assadas e guarnições de fim de semana</option>
                    <option value="trailer_foodtruck">Trailer, barraca ou food truck</option>
                    <option value="outro">Outro ramo de alimentação</option>
                  </select>
                </div>

                <div class="lp-field">
                  <label for="lead-cidade">Cidade / Estado</label>
                  <input type="text" id="lead-cidade" name="cidade" placeholder="Ex.: São Paulo - SP" />
                </div>
              </div>

              <button type="submit" class="lp-btn-cta" style="width:100%;margin-top:20px;height:50px;font-size:16px">
                Quero conhecer o Meu Frango
              </button>

              <div class="lp-form-aviso">
                🔒 Seus dados são confidenciais e serão usados exclusivamente para contato sobre o Meu Frango. Não enviamos spam.
              </div>
            </form>

            <div id="lp-form-sucesso" style="display:none;background:rgba(46,139,87,0.2);border:1px solid var(--verde);border-radius:var(--raio-p);padding:18px;margin-top:20px;text-align:center">
              <div style="font-size:32px;margin-bottom:8px">🍗✨</div>
              <strong style="color:var(--branco);font-size:17px;display:block">Obrigado pelo seu interesse!</strong>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 14px 0" id="msg-sucesso-texto">
                Recebemos suas informações. Nossa equipe entrará em contato assim que abrirmos novas vagas para demonstração.
              </p>
              <button class="btn btn-primario" id="btn-falar-whats-direto" style="display:none">
                Falar com a equipe no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 11. RODAPÉ -->
    <footer class="lp-footer">
      <div class="lp-container">
        <div class="lp-footer-grid">
          <div class="lp-footer-brand">
            <div class="lp-logo" style="color:var(--branco)">
              <img src="/logo-badge.jpg" alt="Logo Meu Frango" class="lp-logo-img" />
              <div class="lp-logo-text">
                <strong style="color:var(--branco)">Meu Frango</strong>
                <small>Gestão de Vendas</small>
              </div>
            </div>
            <p>
              Apoiando pequenos comerciantes e mestres da brasa a organizarem suas vendas com simplicidade e tecnologia que respeita a rotina da rua.
            </p>
          </div>

          <div class="lp-footer-col">
            <h4>Navegação</h4>
            <ul>
              <li><a href="#beneficios">Benefícios</a></li>
              <li><a href="#demonstracao">Como funciona</a></li>
              <li><a href="#comparativo">Comparativo</a></li>
              <li><a href="#para-quem">Para quem é</a></li>
              <li><a href="#faq">Perguntas frequentes</a></li>
            </ul>
          </div>

          <div class="lp-footer-col">
            <h4>Produto</h4>
            <ul>
              <li><a href="javascript:void(0)" id="footer-link-app">Acessar App Demo</a></li>
              <li><a href="#contato">Falar com a equipe</a></li>
              <li><span style="font-size:12px;color:rgba(255,255,255,0.4)">Versão 0.1 (Protótipo B2B)</span></li>
            </ul>
          </div>
        </div>

        <div class="lp-footer-bottom">
          <div>
            &copy; ${LANDING_CONFIG.ANO_ATUAL} Meu Frango &bull; Todos os direitos reservados.
          </div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4)">
            Imagens e dados com fins demonstrativos de protótipo de software.
          </div>
        </div>
      </div>
    </footer>

    <!-- MODAL DE INTERESSE RÁPIDO (LEAD CAPTURE) -->
    <div class="lp-modal-backdrop" id="lp-modal" style="display:none">
      <div class="lp-modal-card">
        <button class="lp-modal-close" id="lp-modal-close" aria-label="Fechar modal">&times;</button>
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:36px;margin-bottom:8px">🍗</div>
          <h3 style="font-family:var(--fonte-titulo);font-size:22px;color:var(--carvao);margin:0 0 6px 0">
            Quero conhecer o Meu Frango
          </h3>
          <p style="font-size:14px;color:var(--texto-suave);margin:0">
            Deixe seus dados para receber uma demonstração sem compromisso:
          </p>
        </div>

        <form id="lp-modal-form">
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="lp-field">
              <label for="modal-nome" style="color:var(--carvao)">Seu nome completo *</label>
              <input type="text" id="modal-nome" style="color:var(--carvao);background:#f9f5ee;border-color:var(--borda)" placeholder="Seu nome" required />
            </div>
            <div class="lp-field">
              <label for="modal-whats" style="color:var(--carvao)">WhatsApp com DDD *</label>
              <input type="tel" id="modal-whats" style="color:var(--carvao);background:#f9f5ee;border-color:var(--borda)" placeholder="(00) 00000-0000" required />
            </div>
            <div class="lp-field">
              <label for="modal-tipo" style="color:var(--carvao)">Qual é o seu negócio? *</label>
              <select id="modal-tipo" style="color:var(--carvao);background:#f9f5ee;border-color:var(--borda)" required>
                <option value="" disabled selected>Selecione...</option>
                <option value="frango_assado">Frango assado</option>
                <option value="churrasquinho">Churrasquinho / Espetinhos</option>
                <option value="carnes_guarnicoes">Carnes e guarnições</option>
                <option value="outro">Trailer / Outro</option>
              </select>
            </div>
            <button type="submit" class="lp-btn-cta" style="margin-top:10px;height:48px">
              Enviar meu interesse
            </button>
          </div>
        </form>
        <div id="lp-modal-sucesso" style="display:none;text-align:center;padding:20px 0">
          <strong style="color:var(--verde);font-size:18px;display:block">Tudo certo! 👍</strong>
          <p style="font-size:14px;color:var(--texto-suave);margin-top:8px">
            Entraremos em contato com você em breve com mais informações.
          </p>
        </div>
      </div>
    </div>
  </div>
  `;

  // --- EVENT LISTENERS ---

  // Navegação para o App Protótipo
  const irParaApp = () => irPara('login');
  raiz.querySelector('#nav-btn-app')?.addEventListener('click', irParaApp);
  raiz.querySelector('#mobile-btn-app')?.addEventListener('click', irParaApp);
  raiz.querySelector('#hero-link-app')?.addEventListener('click', irParaApp);
  raiz.querySelector('#footer-link-app')?.addEventListener('click', irParaApp);

  // Menu Mobile Toggle
  const btnToggleMenu = raiz.querySelector('#btn-toggle-menu');
  const mobileMenu = raiz.querySelector('#mobile-menu');
  btnToggleMenu?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('aberto');
  });

  // Fechar menu mobile ao clicar em um link interno
  raiz.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('aberto');
    });
  });

  // Alternador de Abas de Demonstração (Dashboard, PDV, Pedidos)
  const tabs = raiz.querySelectorAll('.lp-demo-tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('ativo'));
      tab.classList.add('ativo');

      const targetId = tab.dataset.tab;
      raiz.querySelectorAll('.lp-demo-screen-content').forEach((tela) => {
        tela.classList.remove('visivel');
      });
      raiz.querySelector(`#${targetId}`)?.classList.add('visivel');
    });
  });

  // FAQ Acordeão Acessível
  const faqItems = raiz.querySelectorAll('.lp-faq-item');
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.lp-faq-question');
    questionBtn?.addEventListener('click', () => {
      const estaAberto = item.classList.contains('aberto');
      // Fecha os outros para manter foco limpo
      faqItems.forEach((other) => {
        other.classList.remove('aberto');
        other.querySelector('.lp-faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!estaAberto) {
        item.classList.add('aberto');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Modal Lead Capture
  const modal = raiz.querySelector('#lp-modal');
  const abrirModalLead = () => {
    if (modal) modal.style.display = 'flex';
  };
  const fecharModalLead = () => {
    if (modal) modal.style.display = 'none';
  };

  raiz.querySelector('#nav-btn-cta')?.addEventListener('click', abrirModalLead);
  raiz.querySelector('#mobile-btn-cta')?.addEventListener('click', () => {
    mobileMenu?.classList.remove('aberto');
    abrirModalLead();
  });
  raiz.querySelector('#hero-btn-cta')?.addEventListener('click', () => {
    // Scroll suave até o formulário do final
    const formBox = raiz.querySelector('#contato');
    if (formBox) {
      formBox.scrollIntoView({ behavior: 'smooth' });
      raiz.querySelector('#lead-nome')?.focus();
    } else {
      abrirModalLead();
    }
  });

  raiz.querySelector('#lp-modal-close')?.addEventListener('click', fecharModalLead);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) fecharModalLead();
  });

  // Envio de formulário principal B2B
  const formPrincipal = raiz.querySelector('#lp-lead-form');
  const boxSucesso = raiz.querySelector('#lp-form-sucesso');
  const btnWhats = raiz.querySelector('#btn-falar-whats-direto');

  formPrincipal?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = raiz.querySelector('#lead-nome')?.value.trim();
    const whats = raiz.querySelector('#lead-whats')?.value.trim();
    const tipo = raiz.querySelector('#lead-tipo')?.value;

    // Guarda demonstração no sessionStorage
    sessionStorage.setItem('meufrango-lead', JSON.stringify({ nome, whats, tipo, data: new Date().toISOString() }));

    formPrincipal.style.display = 'none';
    if (boxSucesso) {
      boxSucesso.style.display = 'block';
      const msg = raiz.querySelector('#msg-sucesso-texto');
      if (msg) {
        msg.textContent = `Olá ${nome}! Seu interesse foi registrado. Entraremos em contato com você pelo WhatsApp (${whats}) para apresentar o Meu Frango.`;
      }
      if (LANDING_CONFIG.WHATSAPP_NUMERO && btnWhats) {
        btnWhats.style.display = 'inline-flex';
        btnWhats.onclick = () => {
          const url = `https://wa.me/${LANDING_CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(LANDING_CONFIG.WHATSAPP_MENSAGEM)}`;
          window.open(url, '_blank');
        };
      }
    }
  });

  // Envio formulário do modal
  const formModal = raiz.querySelector('#lp-modal-form');
  const modalSucesso = raiz.querySelector('#lp-modal-sucesso');
  formModal?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = raiz.querySelector('#modal-nome')?.value.trim();
    const whats = raiz.querySelector('#modal-whats')?.value.trim();
    const tipo = raiz.querySelector('#modal-tipo')?.value;

    sessionStorage.setItem('meufrango-lead', JSON.stringify({ nome, whats, tipo, data: new Date().toISOString() }));
    formModal.style.display = 'none';
    if (modalSucesso) modalSucesso.style.display = 'block';

    setTimeout(() => {
      fecharModalLead();
      formModal.reset();
      formModal.style.display = 'block';
      if (modalSucesso) modalSucesso.style.display = 'none';
    }, 2800);
  });
}
