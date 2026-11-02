/**
 * PAINEL MASTER DO DONO DA PLATAFORMA AO PONTO (SaaS SuperAdmin)
 * -------------------------------------------------------------
 * 1. Início: KPIs do SaaS (Associados, Produtos vendidos, MRR, GMV, Churn, LTV)
 * 2. Vendas: Faturamento de cada associado por Dia, Semana e Mês
 * 3. Empresas: Cadastro completo de CNPJs e Localização geográfica
 * 4. WhatsApp: Contato de cada empresa e 1-clique para falar com o dono da conta
 * 5. Pagamentos: Envio de Pix/Boleto, planos ativos, alteração de plano e mix de produtos
 */

import { Chart, registerables } from 'chart.js';
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import {
  PLANOS,
  listarTodosTenants,
  bloquearTenant,
  desbloquearTenant,
  alterarPlanoTenant,
  cadastrarTenantManual,
  impersonarTenant,
  obterMetricasSaaS,
} from '../data/tenants.js';
import { fmtMoeda, fmtNumero } from '../utils/format.js';

Chart.register(...registerables);

let graficosMaster = {};

export function destruirMaster() {
  Object.values(graficosMaster).forEach((g) => {
    try { g.destroy(); } catch (_) {}
  });
  graficosMaster = {};
}

export function renderMaster(raiz, irPara) {
  destruirMaster();

  let abaAtiva = 'inicio'; // 'inicio', 'vendas', 'empresas', 'whatsapp', 'pagamentos'
  let filtroPeriodoVendas = 'mes'; // 'dia', 'semana', 'mes'
  let termoBusca = '';

  function desenhar() {
    destruirMaster();
    const todosTenants = listarTodosTenants();
    const metricas = obterMetricasSaaS();

    // Consolidação de métricas da rede de associados
    const totalAssociados = todosTenants.length;
    const associadosAtivos = todosTenants.filter((t) => t.status === 'ativo').length;
    const associadosBloqueados = todosTenants.filter((t) => t.status === 'bloqueado').length;
    const associadosAtrasados = todosTenants.filter((t) => t.mensalidadeStatus === 'atrasado').length;

    let totalProdutosVendidos = 0;
    let gmvTotal = 0;

    todosTenants.forEach((t) => {
      totalProdutosVendidos += t.produtosVendidos || (t.vendasMesAtual ? Math.round(t.vendasMesAtual * 1.5) : 0);
      gmvTotal += t.faturamentoMes || (t.vendasMesAtual ? t.vendasMesAtual * 45 : 0);
    });

    const ticketMedioAssociado = gmvTotal / (associadosAtivos || 1);

    raiz.innerHTML = `
    <div class="master-container" style="max-width: 1320px; margin: 0 auto; padding-bottom: 60px;">
      
      <!-- Topo do Painel Master -->
      <div class="clientes-topo" style="margin-bottom: 22px;">
        <div class="clientes-topo-info">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 28px;">👑</span>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: var(--carvao);">
              Painel Master — Gestão de Associados & CNPJs (SaaS Ao Ponto)
            </h1>
          </div>
          <p style="margin: 6px 0 0; color: var(--texto-suave); font-size: 14px;">
            Cockpit exclusivo do Dono da Plataforma &bull; Controle de associados, vendas da rede, contatos no WhatsApp e cobrança de mensalidades
          </p>
        </div>
        <div class="clientes-topo-acoes">
          <button class="btn btn-primario" id="btn-cadastrar-novo-cnpj">
            ${icone('mais')} Cadastrar Novo Associado / CNPJ
          </button>
        </div>
      </div>

      <!-- Abas de Navegação do Painel Master -->
      <div class="wa-abas" style="margin-bottom: 24px;">
        <button class="wa-aba-btn ${abaAtiva === 'inicio' ? 'ativa' : ''}" data-aba="inicio">
          📊 Início & KPIs do SaaS
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'vendas' ? 'ativa' : ''}" data-aba="vendas">
          🍗 Vendas dos Associados
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'empresas' ? 'ativa' : ''}" data-aba="empresas">
          🏢 Cadastro & Localização (CNPJs)
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'whatsapp' ? 'ativa' : ''}" data-aba="whatsapp">
          📲 WhatsApp das Empresas
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'pagamentos' ? 'ativa' : ''}" data-aba="pagamentos">
          💳 Pagamento de Mensalidades & Planos
        </button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div id="master-conteudo-aba"></div>

    </div>
    `;

    renderizarConteudoAba(todosTenants, {
      totalAssociados,
      associadosAtivos,
      associadosBloqueados,
      associadosAtrasados,
      totalProdutosVendidos,
      gmvTotal,
      mrr: metricas.mrr,
      ticketMedioAssociado,
    });

    atribuirEventos();
  }

  function renderizarConteudoAba(tenants, kpis) {
    const el = raiz.querySelector('#master-conteudo-aba');
    if (!el) return;

    destruirMaster();

    if (abaAtiva === 'inicio') {
      renderAbaInicio(el, tenants, kpis);
    } else if (abaAtiva === 'vendas') {
      renderAbaVendas(el, tenants);
    } else if (abaAtiva === 'empresas') {
      renderAbaEmpresas(el, tenants);
    } else if (abaAtiva === 'whatsapp') {
      renderAbaWhatsapp(el, tenants);
    } else if (abaAtiva === 'pagamentos') {
      renderAbaPagamentos(el, tenants);
    }
  }

  // ── 1. ABA INÍCIO COM KPIS DO SAAS & RESPOSTA DE KPIS RELEVANTES ──
  function renderAbaInicio(el, tenants, kpis) {
    el.innerHTML = `
      <!-- KPIs Primários Solicitados -->
      <div class="clientes-kpis" style="margin-bottom: 24px;">
        <div class="kpi-card destaque-fidelidade">
          <div class="kpi-rotulo">Número de Associados (CNPJs) 🏢</div>
          <div class="kpi-valor" style="color: #EA580C;">${kpis.totalAssociados} empresas</div>
          <div class="kpi-sub">${kpis.associadosAtivos} ativas &bull; ${kpis.associadosBloqueados} bloqueadas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Número de Produtos Vendidos 🍗</div>
          <div class="kpi-valor" style="color: #16A34A;">${fmtNumero(kpis.totalProdutosVendidos)}</div>
          <div class="kpi-sub">Frangos e guarnições transacionados na rede</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Receita Recorrente (MRR) 💰</div>
          <div class="kpi-valor" style="color: #2563EB;">${fmtMoeda(kpis.mrr)}<small style="font-size: 13px;">/mês</small></div>
          <div class="kpi-sub">Assinaturas mensais recebidas</div>
        </div>
        <div class="kpi-card" style="${kpis.associadosAtrasados > 0 ? 'border: 2px solid #FCA5A5; background: #FEF2F2;' : ''}">
          <div class="kpi-rotulo">Inadimplência / Atrasos ⚠️</div>
          <div class="kpi-valor" style="color: ${kpis.associadosAtrasados > 0 ? '#DC2626' : '#16A34A'};">
            ${kpis.associadosAtrasados} ${kpis.associadosAtrasados === 1 ? 'pendente' : 'pendentes'}
          </div>
          <div class="kpi-sub">${kpis.associadosAtrasados > 0 ? 'Mensalidade aguardando pagamento' : '100% dos associados em dia'}</div>
        </div>
      </div>

      <!-- Resposta ao Usuário: KPIs Estratégicos Relevantes para Gestão do SaaS -->
      <div class="cartao" style="margin-bottom: 24px; border-left: 4px solid var(--brasa);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: var(--carvao);">
              💡 Quais outros KPIs são fundamentais para o controle e gestão do seu SaaS?
            </h3>
            <p style="margin: 4px 0 0; font-size: 13px; color: var(--texto-suave);">
              Indicadores essenciais de saúde financeira e crescimento da plataforma Ao Ponto:
            </p>
          </div>
          <span class="badge badge-sucesso">Métricas de SaaS B2B</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 16px;">
          
          <div style="background: #F8FAFC; border: 1px solid var(--borda); border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: var(--carvao);">GMV (Volume Total de Vendas)</strong>
              <span style="font-size: 18px;">🛒</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #166534; margin-bottom: 4px;">
              ${fmtMoeda(kpis.gmvTotal)}
            </div>
            <small style="color: var(--texto-suave); font-size: 12px; display: block;">
              Total de dinheiro que as assadeiras faturaram usando o sistema. Mostra o tamanho real e o impacto da sua plataforma no mercado.
            </small>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--borda); border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: var(--carvao);">Churn Rate (Taxa de Cancelamento)</strong>
              <span style="font-size: 18px;">📉</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #16A34A; margin-bottom: 4px;">
              0.0% <span style="font-size: 11px; font-weight: normal; color: #166534;">(Meta: &lt; 2%)</span>
            </div>
            <small style="color: var(--texto-suave); font-size: 12px; display: block;">
              Porcentagem de associados que deixaram a plataforma no mês. Quanto menor, mais satisfeitos e dependentes do sistema eles estão.
            </small>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--borda); border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: var(--carvao);">LTV (Valor do Tempo de Vida)</strong>
              <span style="font-size: 18px;">💎</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #7C3AED; margin-bottom: 4px;">
              ${fmtMoeda(kpis.mrr * 14 / (kpis.associadosAtivos || 1))}
            </div>
            <small style="color: var(--texto-suave); font-size: 12px; display: block;">
              Média de receita total que uma assadeira gera para você ao longo de todo o tempo em que permanece pagando as mensalidades (~14 meses).
            </small>
          </div>

          <div style="background: #F8FAFC; border: 1px solid var(--borda); border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: var(--carvao);">Ticket Médio por Associado</strong>
              <span style="font-size: 18px;">📈</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #EA580C; margin-bottom: 4px;">
              ${fmtMoeda(kpis.ticketMedioAssociado)}
            </div>
            <small style="color: var(--texto-suave); font-size: 12px; display: block;">
              Faturamento médio por loja. Permite identificar clientes grandes prontos para upgrade para o Plano Redes & Franquias (R$ 149/mês).
            </small>
          </div>

        </div>
      </div>

      <!-- Resumo Rápido dos Associados Ativos -->
      <div class="cartao" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; background: #F8FAFC; border-bottom: 1px solid var(--borda); display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--carvao); font-size: 15px;">Últimos Associados Inscritos</strong>
          <button class="btn btn-pequeno btn-contorno" onclick="document.querySelector('[data-aba=empresas]').click()">
            Ver Todos no Cadastro 🏢
          </button>
        </div>
        <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
          <thead>
            <tr style="background: #fff;">
              <th>Empresa / Razão Social</th>
              <th>CNPJ</th>
              <th>Localização</th>
              <th>Plano</th>
              <th>Status Mensalidade</th>
            </tr>
          </thead>
          <tbody>
            ${tenants.slice(0, 5).map((t) => `
              <tr>
                <td>
                  <strong style="color: var(--carvao);">${t.nome}</strong>
                  <small style="display: block; color: var(--texto-suave); font-size: 11px;">${t.razaoSocial || t.nome}</small>
                </td>
                <td><code>${t.cnpj || 'Em cadastro'}</code></td>
                <td>${t.cidade} - ${t.estado} (${t.bairro || 'Centro'})</td>
                <td><b>${PLANOS[t.plano]?.nome}</b> (${PLANOS[t.plano]?.precoFormatado})</td>
                <td>
                  ${t.status === 'bloqueado' ? '<span class="badge" style="background:#FEE2E2; color:#991B1B;">🛑 Bloqueado</span>' : t.mensalidadeStatus === 'atrasado' ? '<span class="badge" style="background:#FEF3C7; color:#92400E;">⚠️ Atrasado</span>' : '<span class="badge" style="background:#DCFCE7; color:#166534;">✅ Em Dia</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ── 2. ABA VENDAS DOS ASSOCIADOS (DIAS / SEMANA / MÊS) ───────────
  function renderAbaVendas(el, tenants) {
    el.innerHTML = `
      <div class="cartao" style="margin-bottom: 20px; padding: 14px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
            Performance de Vendas dos Associados 🍗📈
          </h3>
          <small style="color: var(--texto-suave);">Acompanhe o volume e o faturamento transacionado por cada assadeira</small>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="font-size: 13px; color: var(--carvao);">Período de Venda:</strong>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-pequeno ${filtroPeriodoVendas === 'dia' ? 'btn-primario' : 'btn-contorno'}" data-pv="dia">Hoje (Dia)</button>
            <button class="btn btn-pequeno ${filtroPeriodoVendas === 'semana' ? 'btn-primario' : 'btn-contorno'}" data-pv="semana">Esta Semana</button>
            <button class="btn btn-pequeno ${filtroPeriodoVendas === 'mes' ? 'btn-primario' : 'btn-contorno'}" data-pv="mes">Este Mês</button>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
        
        <!-- Tabela de Venda de Cada Associado -->
        <div class="cartao" style="padding: 0; overflow: hidden;">
          <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th>Associado / Empresa</th>
                <th>Cidade / UF</th>
                <th style="text-align: center;">Pedidos</th>
                <th style="text-align: right;">Faturamento (R$)</th>
                <th style="text-align: right;">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              ${tenants.map((t) => {
                let vendas = t.vendasMesAtual || 0;
                let faturamento = t.faturamentoMes || 0;

                if (filtroPeriodoVendas === 'dia') {
                  vendas = t.vendasHoje || Math.round(vendas / 10);
                  faturamento = vendas * 45;
                } else if (filtroPeriodoVendas === 'semana') {
                  vendas = t.vendasSemana || Math.round(vendas / 3.2);
                  faturamento = vendas * 45;
                }

                const ticket = faturamento / (vendas || 1);

                return `
                  <tr>
                    <td>
                      <strong style="color: var(--carvao);">${t.nome}</strong>
                      <small style="display: block; color: var(--texto-suave); font-size: 11px;">CNPJ: ${t.cnpj || 'Em cadastro'}</small>
                    </td>
                    <td>${t.cidade} - ${t.estado}</td>
                    <td style="text-align: center; font-weight: 800; color: #EA580C;">${vendas}</td>
                    <td style="text-align: right; font-weight: 800; color: #166534;">${fmtMoeda(faturamento)}</td>
                    <td style="text-align: right; color: var(--texto-suave);">${fmtMoeda(ticket)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Gráfico Comparativo de Vendas -->
        <div class="cartao" style="display: flex; flex-direction: column;">
          <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 800; color: var(--carvao);">
            Ranking de Faturamento
          </h3>
          <small style="color: var(--texto-suave); margin-bottom: 14px;">Comparativo entre as assadeiras da rede</small>
          
          <div style="position: relative; height: 280px; width: 100%;">
            <canvas id="grafico-ranking-vendas"></canvas>
          </div>
        </div>

      </div>
    `;

    // Gráfico de Barras Horizontais
    const ctx = el.querySelector('#grafico-ranking-vendas');
    if (ctx) {
      const labels = tenants.map((t) => t.nome.replace('Assados', '').replace('Rotisserie', '').trim());
      const dados = tenants.map((t) => {
        if (filtroPeriodoVendas === 'dia') return (t.vendasHoje || 5) * 45;
        if (filtroPeriodoVendas === 'semana') return (t.vendasSemana || 20) * 45;
        return t.faturamentoMes || 4000;
      });

      graficosMaster.vendas = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Faturamento (R$)',
            data: dados,
            backgroundColor: '#EA580C',
            borderRadius: 6,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { display: false } },
          },
        },
      });
    }

    el.querySelectorAll('[data-pv]').forEach((btn) => {
      btn.addEventListener('click', () => {
        filtroPeriodoVendas = btn.dataset.pv;
        renderAbaVendas(el, tenants);
      });
    });
  }

  // ── 3. ABA CADASTRO & LOCALIZAÇÃO DAS EMPRESAS (CNPJS) ────────────
  function renderAbaEmpresas(el, tenants) {
    el.innerHTML = `
      <div class="cartao" style="margin-bottom: 20px; padding: 14px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
            Cadastro das Empresas & Localização Geográfica 🏢🗺️
          </h3>
          <small style="color: var(--texto-suave);">Dados fiscais, endereços, bairros e praças de atendimento de cada associado</small>
        </div>
        <button class="btn btn-primario" id="btn-modal-novo-associado">
          ${icone('mais')} Novo Cadastro de CNPJ
        </button>
      </div>

      <!-- Tabela Completa de Empresas e Localização -->
      <div class="cartao" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
        <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
          <thead>
            <tr style="background: #F8FAFC;">
              <th>Razão Social / Nome Fantasia</th>
              <th>CNPJ</th>
              <th>Localização Completa (Endereço & Bairro)</th>
              <th>Cidade - UF</th>
              <th>Plano Contratado</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tenants.map((t) => `
              <tr>
                <td>
                  <strong style="color: var(--carvao); font-size: 14px;">${t.nome}</strong>
                  <small style="display: block; color: var(--texto-suave); font-size: 11px;">${t.razaoSocial || t.nome}</small>
                  <small style="color: #6366F1; font-family: monospace; font-size: 11px;">${t.slug}.aoponto.app</small>
                </td>

                <td>
                  <strong style="font-family: monospace; font-size: 12px; color: var(--carvao);">${t.cnpj || 'Pendente de emissão'}</strong>
                  <small style="display: block; color: var(--texto-suave); font-size: 11px;">Resp: ${t.responsavel}</small>
                </td>

                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>📍</span>
                    <div>
                      <strong style="color: var(--carvao);">${t.endereco || 'Endereço Comercial'}</strong>
                      <small style="display: block; color: var(--texto-suave);">${t.bairro || 'Bairro Central'}</small>
                    </div>
                  </div>
                </td>

                <td>
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: #EEF2FF; color: #4338CA; font-weight: 700; font-size: 12px;">
                    ${t.cidade} - ${t.estado || 'SP'}
                  </span>
                </td>

                <td>
                  <strong style="color: var(--carvao);">${PLANOS[t.plano]?.nome}</strong>
                  <small style="display: block; color: #166534; font-weight: 600;">${PLANOS[t.plano]?.precoFormatado}</small>
                </td>

                <td style="text-align: center;">
                  ${t.status === 'bloqueado' ? '<span class="badge" style="background:#FEE2E2; color:#991B1B; font-weight:800;">🛑 Bloqueado</span>' : '<span class="badge" style="background:#DCFCE7; color:#166534; font-weight:800;">✅ Ativo</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    el.querySelector('#btn-modal-novo-associado')?.addEventListener('click', () => {
      abrirModalNovoAssociado();
    });
  }

  // ── 4. ABA WHATSAPP DAS EMPRESAS (1-CLIQUE PARA FALAR) ───────────
  function renderAbaWhatsapp(el, tenants) {
    el.innerHTML = `
      <div class="cartao" style="margin-bottom: 20px; padding: 14px 18px;">
        <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 800; color: var(--carvao);">
          Central de Contato WhatsApp das Empresas 📲💬
        </h3>
        <small style="color: var(--texto-suave);">Comunicação direta com o proprietário de cada conta com 1 clique</small>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        ${tenants.map((t) => {
          const celLimpo = (t.celular || '').replace(/\D/g, '');
          const msgSuporte = encodeURIComponent(`Olá ${t.responsavel}, tudo bem? Sou o administrador da plataforma Ao Ponto. Como está a operação de assados da ${t.nome} hoje?`);
          const msgCobranca = encodeURIComponent(`Olá ${t.responsavel}, tudo bem? Sou o administrador da plataforma Ao Ponto. Notamos que a mensalidade da sua loja (${t.nome}) está em aberto. Podemos enviar a chave Pix para quitação?`);

          return `
            <div class="cartao" style="display: flex; flex-direction: column; justify-content: space-between; gap: 12px; border-left: 4px solid #16A34A;">
              
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <strong style="font-size: 15px; color: var(--carvao);">${t.nome}</strong>
                  <span class="badge ${t.status === 'ativo' ? 'badge-sucesso' : 'badge-perigo'}">
                    ${t.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                  </span>
                </div>
                <small style="display: block; color: var(--texto-suave); font-size: 12px; margin-bottom: 8px;">
                  CNPJ: ${t.cnpj || 'Pendente'} &bull; ${t.cidade} - ${t.estado}
                </small>

                <div style="background: #F8FAFC; border-radius: 8px; padding: 10px; font-size: 13px;">
                  <div><b>Responsável:</b> ${t.responsavel} (${t.cargo || 'Proprietário'})</div>
                  <div style="margin-top: 3px;"><b>WhatsApp:</b> <code style="color: #166534;">${t.celular}</code></div>
                  <div style="margin-top: 3px;"><b>E-mail:</b> <small style="color: var(--texto-suave);">${t.email || 'Não informado'}</small></div>
                </div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                <a 
                  href="https://wa.me/55${celLimpo}?text=${msgSuporte}" 
                  target="_blank" 
                  class="btn btn-primario" 
                  style="text-decoration: none; justify-content: center; background: #16A34A; border-color: #15803D; font-size: 13px;"
                >
                  💬 1-Clique: Falar com ${t.responsavel.split(' ')[0]}
                </a>

                ${t.mensalidadeStatus === 'atrasado' ? `
                  <a 
                    href="https://wa.me/55${celLimpo}?text=${msgCobranca}" 
                    target="_blank" 
                    class="btn btn-contorno" 
                    style="text-decoration: none; justify-content: center; color: #DC2626; border-color: #FCA5A5; font-size: 12px;"
                  >
                    📲 Cobrar Mensalidade via WhatsApp
                  </a>
                ` : ''}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ── 5. ABA PAGAMENTOS (PIX / BOLETO, PLANOS & PRODUTOS) ─────────
  function renderAbaPagamentos(el, tenants) {
    el.innerHTML = `
      <div class="cartao" style="margin-bottom: 20px; padding: 14px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
            Gestão de Mensalidades, Cobrança Pix/Boleto & Planos 💳⚡
          </h3>
          <small style="color: var(--texto-suave);">Envio de cobrança, alteração de planos dos associados e análise do mix de produtos</small>
        </div>
      </div>

      <!-- Tabela de Faturamento e Envio de Pix / Boleto -->
      <div class="cartao" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
        <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
          <thead>
            <tr style="background: #F8FAFC;">
              <th>Empresa Associada</th>
              <th>Plano Atual</th>
              <th>Mensalidade</th>
              <th>Vencimento</th>
              <th>Status Financeiro</th>
              <th style="text-align: right;">Ações de Cobrança & Plano</th>
            </tr>
          </thead>
          <tbody>
            ${tenants.map((t) => {
              const plano = PLANOS[t.plano] || PLANOS['plano-00'];
              const isBloqueado = t.status === 'bloqueado';
              const isAtrasado = t.mensalidadeStatus === 'atrasado';

              return `
                <tr style="background: ${isBloqueado ? '#FEF2F2' : '#FFFFFF'};">
                  <td>
                    <strong style="color: var(--carvao);">${t.nome}</strong>
                    <small style="display: block; color: var(--texto-suave); font-size: 11px;">${t.responsavel} &bull; ${t.celular}</small>
                  </td>

                  <td>
                    <span style="font-weight: 700; color: var(--carvao);">${plano.nome}</span>
                    <small style="display: block; color: var(--texto-suave); font-size: 11px;">
                      ${plano.limiteVendasMes ? `Até ${plano.limiteVendasMes} vendas` : 'Ilimitado'}
                    </small>
                  </td>

                  <td>
                    <strong style="color: #166534; font-size: 14px;">
                      ${plano.preco > 0 ? fmtMoeda(plano.preco) : 'Grátis'}
                    </strong>
                  </td>

                  <td>Dia ${t.diaVencimento || 10}</td>

                  <td>
                    ${isBloqueado ? `
                      <span class="badge" style="background:#FEE2E2; color:#991B1B; font-weight:800;">🛑 Bloqueado</span>
                    ` : isAtrasado ? `
                      <span class="badge" style="background:#FEF3C7; color:#92400E; font-weight:800;">⚠️ Atrasado</span>
                    ` : `
                      <span class="badge" style="background:#DCFCE7; color:#166534; font-weight:800;">✅ Em Dia</span>
                    `}
                  </td>

                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
                      
                      <!-- Botão Enviar Pix / Boleto -->
                      <button class="btn btn-pequeno btn-primario btn-enviar-cobranca" data-id="${t.id}" title="Gerar e Enviar Cobrança Pix ou Boleto">
                        ⚡ Enviar Pix / Boleto
                      </button>

                      <!-- Botão Mudar de Plano -->
                      <button class="btn btn-pequeno btn-contorno btn-mudar-plano" data-id="${t.id}" title="Opção de Mudança de Plano">
                        🚀 Mudar Plano
                      </button>

                      <!-- Bloqueio / Desbloqueio -->
                      ${isBloqueado ? `
                        <button class="btn btn-pequeno btn-sucesso btn-desbloquear-empresa" data-id="${t.id}">
                          ✅ Desbloquear
                        </button>
                      ` : `
                        <button class="btn btn-pequeno btn-contorno btn-bloquear-empresa" data-id="${t.id}" style="color: #DC2626; border-color: #FCA5A5;">
                          🛑 Bloquear
                        </button>
                      `}

                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Gráfico de Nível de Venda de Produtos por Empresa -->
      <div class="cartao">
        <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 800; color: var(--carvao);">
          Nível de Venda de Produtos por Associado (Frangos vs Guarnições) 🍗🥗
        </h3>
        <small style="color: var(--texto-suave); display: block; margin-bottom: 16px;">
          Comparativo de volume de aves assadas e guarnições/acompanhamentos vendidos por cada empresa na plataforma
        </small>

        <div style="position: relative; height: 320px; width: 100%;">
          <canvas id="grafico-mix-produtos-empresas"></canvas>
        </div>
      </div>
    `;

    // Gráfico de Barras Empilhadas
    const ctx = el.querySelector('#grafico-mix-produtos-empresas');
    if (ctx) {
      const labels = tenants.map((t) => t.nome.replace('Assados', '').replace('Rotisserie', '').trim());
      const frangos = tenants.map((t) => t.mixFrangos || (t.vendasMesAtual || 20));
      const guarnicoes = tenants.map((t) => t.mixGuarnicoes || Math.round((t.vendasMesAtual || 20) * 0.5));

      graficosMaster.mixEmpresas = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Frangos Assados',
              data: frangos,
              backgroundColor: '#EA580C',
              borderRadius: 6,
            },
            {
              label: 'Guarnições & Acompanhamentos',
              data: guarnicoes,
              backgroundColor: '#D4AC0D',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Unidades Vendidas' } },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    }

    // Eventos da aba de pagamentos
    el.querySelectorAll('.btn-enviar-cobranca').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = tenants.find((t) => t.id === id);
        if (tenant) abrirModalEnvioCobranca(tenant);
      });
    });

    el.querySelectorAll('.btn-mudar-plano').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = tenants.find((t) => t.id === id);
        if (tenant) abrirModalMudarPlano(tenant);
      });
    });

    el.querySelectorAll('.btn-bloquear-empresa').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = tenants.find((t) => t.id === id);
        if (tenant) abrirModalConfirmarBloqueio(tenant);
      });
    });

    el.querySelectorAll('.btn-desbloquear-empresa').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = tenants.find((t) => t.id === id);
        if (tenant && confirm(`Deseja reativar o acesso de "${tenant.nome}"?`)) {
          desbloquearTenant(id);
          toast(`Empresa "${tenant.nome}" desbloqueada com sucesso!`, 'sucesso');
          desenhar();
        }
      });
    });
  }

  // ── MODAL: ENVIAR PIX OU BOLETO ──────────────────────────────────
  function abrirModalEnvioCobranca(tenant) {
    const plano = PLANOS[tenant.plano] || PLANOS['plano-01'];
    const valor = plano.preco || 79.0;
    const celLimpo = (tenant.celular || '').replace(/\D/g, '');
    const chavePix = '12.345.678/0001-90'; // Chave CNPJ do Dono do SaaS
    const pixCopiaCola = `00020126580014BR.GOV.BCB.PIX0114${chavePix.replace(/\D/g, '')}520400005303986540${valor.toFixed(2)}5802BR5920Ao Ponto Plataforma6009SAO PAULO62070503***6304`;
    const linhaBoleto = '34191.79001 01043.510047 91020.150008 4 987600000' + Math.round(valor * 100);

    const textoWhatsApp = encodeURIComponent(
      `Olá ${tenant.responsavel}, tudo bem?\n`
      + `Segue a fatura da mensalidade da plataforma Ao Ponto referente à sua loja *${tenant.nome}*:\n\n`
      + `📦 *Plano:* ${plano.nome}\n`
      + `💰 *Valor:* ${fmtMoeda(valor)}\n`
      + `📅 *Vencimento:* Dia ${tenant.diaVencimento || 10}\n\n`
      + `⚡ *Chave Pix (CNPJ):* ${chavePix}\n`
      + `📄 *Pix Copia e Cola:* ${pixCopiaCola}\n\n`
      + `Assim que efetuar o pagamento, seu acesso continuará 100% liberado!`
    );

    abrirModal({
      titulo: `Cobrança de Mensalidade: ${tenant.nome} 💳⚡`,
      html: `
        <div style="font-size: 14px;">
          <div style="background: #F8FAFC; border: 1px solid var(--borda); border-radius: 8px; padding: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${plano.nome}</strong> &bull; Vencimento dia ${tenant.diaVencimento || 10}
            </div>
            <strong style="font-size: 16px; color: #166534;">${fmtMoeda(valor)}</strong>
          </div>

          <!-- Opção Pix -->
          <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #166534; font-size: 14px;">⚡ Pagamento via Pix Instantâneo</strong>
              <span class="badge badge-sucesso">Compensação Imediata</span>
            </div>
            <small style="color: var(--texto-suave);">Chave Pix Oficial da sua Plataforma:</small>
            <div style="background: #fff; border: 1px dashed #16A34A; border-radius: 6px; padding: 8px; font-family: monospace; font-size: 14px; margin: 4px 0 8px; font-weight: bold; color: #166534;">
              ${chavePix}
            </div>
            <small style="color: var(--texto-suave);">Código Copia e Cola:</small>
            <input type="text" class="input" value="${pixCopiaCola}" readonly style="width: 100%; font-size: 11px; font-family: monospace; height: 32px;" onclick="this.select()" />
          </div>

          <!-- Opção Boleto Bancário -->
          <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #1E40AF; font-size: 14px;">📄 Boleto Bancário (Mercado Pago / Banco)</strong>
              <span class="badge" style="background: #DBEAFE; color: #1E40AF;">D+1 Útil</span>
            </div>
            <small style="color: var(--texto-suave);">Linha Digitável:</small>
            <div style="background: #fff; border: 1px dashed #2563EB; border-radius: 6px; padding: 8px; font-family: monospace; font-size: 12px; margin: 4px 0 6px; color: #1E40AF;">
              ${linhaBoleto}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; gap: 8px;">
            <button class="btn btn-contorno" data-fechar>Fechar</button>
            <a 
              href="https://wa.me/55${celLimpo}?text=${textoWhatsApp}" 
              target="_blank" 
              class="btn btn-primario" 
              style="text-decoration: none; background: #16A34A; border-color: #15803D;"
            >
              📲 Disparar Fatura no WhatsApp de ${tenant.responsavel.split(' ')[0]}
            </a>
          </div>
        </div>
      `,
    });
  }

  // ── MODAL: MUDANÇA DE PLANO (UPGRADE / DOWNGRADE) ────────────────
  function abrirModalMudarPlano(tenant) {
    abrirModal({
      titulo: `Alterar Plano de: ${tenant.nome} 🚀`,
      html: `
        <div style="font-size: 14px;">
          <p style="color: var(--texto-suave); margin-bottom: 14px;">
            Altere o plano de assinatura, ajuste a mensalidade ou defina limites especiais para este associado.
          </p>

          <form id="form-mudar-plano-modal" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Selecione o Novo Plano:</label>
              <select id="sel-novo-plano" class="select" style="width: 100%; height: 42px;">
                ${Object.values(PLANOS).map((p) => `
                  <option value="${p.id}" ${tenant.plano === p.id ? 'selected' : ''}>
                    ${p.nome} — ${p.precoFormatado} ${p.limiteVendasMes ? `(Limite ${p.limiteVendasMes} vendas/mês)` : '(Vendas ilimitadas)'}
                  </option>
                `).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Dia de Vencimento:</label>
                <input type="number" id="inp-novo-vencimento" class="input" min="1" max="31" value="${tenant.diaVencimento || 10}" required />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Status do Pagamento:</label>
                <select id="sel-novo-status-pag" class="select" style="width: 100%; height: 40px;">
                  <option value="em_dia" ${tenant.mensalidadeStatus === 'em_dia' ? 'selected' : ''}>Em Dia (Pago)</option>
                  <option value="atrasado" ${tenant.mensalidadeStatus === 'atrasado' ? 'selected' : ''}>Atrasado (Pendente)</option>
                  <option value="gratis" ${tenant.mensalidadeStatus === 'gratis' ? 'selected' : ''}>Gratuito (Isento)</option>
                </select>
              </div>
            </div>

            <div class="modal-botoes" style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
              <button type="submit" class="btn btn-primario">💾 Salvar Mudança de Plano</button>
            </div>
          </form>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#form-mudar-plano-modal').onsubmit = (e) => {
          e.preventDefault();
          const novoPlanoId = el.querySelector('#sel-novo-plano').value;
          const diaVenc = parseInt(el.querySelector('#inp-novo-vencimento').value, 10) || 10;
          const statusPag = el.querySelector('#sel-novo-status-pag').value;

          tenant.diaVencimento = diaVenc;
          tenant.mensalidadeStatus = statusPag;
          alterarPlanoTenant(tenant.id, novoPlanoId);

          toast(`Plano de "${tenant.nome}" atualizado com sucesso!`, 'sucesso');
          fechar();
          desenhar();
        };
      },
    });
  }

  // ── MODAL: CONFIRMAR BLOQUEIO ───────────────────────────────────
  function abrirModalConfirmarBloqueio(tenant) {
    abrirModal({
      titulo: `Bloquear Acesso: ${tenant.nome} 🛑`,
      html: `
        <div style="font-size: 14px;">
          <p style="color: #991B1B; font-weight: 600; margin-bottom: 12px;">
            Atenção: Ao bloquear esta empresa, o lojista e seus operadores não conseguirão acessar as telas de vendas e pedidos até a regularização da mensalidade.
          </p>
          <div class="campo">
            <label style="font-weight: 700; color: var(--carvao);">Motivo do Bloqueio:</label>
            <textarea id="motivo-bloq-texto" class="input" style="width: 100%; height: 70px;">Mensalidade em atraso. Regularize sua fatura para liberar o acesso ao Ao Ponto.</textarea>
          </div>
          <div class="modal-botoes" style="margin-top: 14px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
            <button type="button" class="btn btn-primario" id="btn-confirma-bloq" style="background: #DC2626; border-color: #B91C1C;">
              🛑 Confirmar Bloqueio
            </button>
          </div>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#btn-confirma-bloq').onclick = () => {
          const motivo = el.querySelector('#motivo-bloq-texto').value.trim();
          bloquearTenant(tenant.id, motivo);
          toast(`Acesso de "${tenant.nome}" suspenso por inadimplência.`, 'alerta');
          fechar();
          desenhar();
        };
      },
    });
  }

  // ── MODAL: CADASTRAR NOVO ASSOCIADO ─────────────────────────────
  function abrirModalNovoAssociado() {
    abrirModal({
      titulo: 'Cadastrar Novo Associado (CNPJ) 🏢✨',
      html: `
        <div style="font-size: 14px;">
          <form id="form-novo-cnpj-empresa" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Nome Fantasia da Assadeira: *</label>
              <input type="text" id="cad-nome" class="input" placeholder="Ex: Frangaria Brasa de Ouro" required />
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Razão Social:</label>
                <input type="text" id="cad-razao" class="input" placeholder="Ex: Brasa de Ouro Alimentos Ltda" />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">CNPJ:</label>
                <input type="text" id="cad-cnpj" class="input" placeholder="00.000.000/0001-00" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Nome do Responsável: *</label>
                <input type="text" id="cad-resp" class="input" placeholder="Ex: Marcelo Silva" required />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">WhatsApp: *</label>
                <input type="text" id="cad-whats" class="input" placeholder="(11) 99999-8888" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Endereço Completo:</label>
                <input type="text" id="cad-end" class="input" placeholder="Rua das Palmeiras, 150" />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Bairro:</label>
                <input type="text" id="cad-bairro" class="input" placeholder="Centro" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Cidade - UF:</label>
                <input type="text" id="cad-cidade" class="input" placeholder="Campinas - SP" value="São Paulo - SP" />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Plano Inicial:</label>
                <select id="cad-plano" class="select" style="width: 100%; height: 40px;">
                  ${Object.values(PLANOS).map((p) => `<option value="${p.id}" ${p.id === 'plano-01' ? 'selected' : ''}>${p.nome} (${p.precoFormatado})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="modal-botoes" style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
              <button type="submit" class="btn btn-primario">🎉 Concluir Cadastro do Associado</button>
            </div>
          </form>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#form-novo-cnpj-empresa').onsubmit = (e) => {
          e.preventDefault();
          const nome = el.querySelector('#cad-nome').value.trim();
          const razaoSocial = el.querySelector('#cad-razao').value.trim() || nome;
          const cnpj = el.querySelector('#cad-cnpj').value.trim();
          const responsavel = el.querySelector('#cad-resp').value.trim();
          const celular = el.querySelector('#cad-whats').value.trim();
          const endereco = el.querySelector('#cad-end').value.trim();
          const bairro = el.querySelector('#cad-bairro').value.trim();
          const cidadeUf = el.querySelector('#cad-cidade').value.trim().split('-');
          const cidade = cidadeUf[0]?.trim() || 'São Paulo';
          const estado = cidadeUf[1]?.trim() || 'SP';
          const plano = el.querySelector('#cad-plano').value;

          const novo = cadastrarTenantManual({
            nome,
            responsavel,
            celular,
            cidade,
            plano,
          });

          novo.razaoSocial = razaoSocial;
          novo.cnpj = cnpj;
          novo.endereco = endereco;
          novo.bairro = bairro;
          novo.estado = estado;

          toast(`Empresa "${nome}" cadastrada com sucesso!`, 'sucesso');
          fechar();
          desenhar();
        };
      },
    });
  }

  function atribuirEventos() {
    // Alternância de Abas Master
    raiz.querySelectorAll('.wa-aba-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        abaAtiva = btn.dataset.aba;
        desenhar();
      });
    });

    // Botão Topo Cadastrar Novo Associado
    raiz.querySelector('#btn-cadastrar-novo-cnpj')?.addEventListener('click', () => {
      abrirModalNovoAssociado();
    });
  }

  desenhar();
}
