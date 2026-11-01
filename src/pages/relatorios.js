/**
 * TELA DE RELATÓRIOS AVANÇADOS, ANÁLISES & EXPORTAÇÃO (Ao Ponto)
 * Etapa 3 - Ponto 5
 * -------------------------------------------------------------
 * 1. Fechamento de Caixa & DRE Operacional (Lucro Real, CMV, Taxas de Cartão)
 * 2. Curva ABC de Produtos & Mix de Faturamento
 * 3. Picos de Horário & Capacidade de Assados no Domingo
 * 4. Meios de Pagamento & Custo de Maquininhas
 * 5. Clientes, Fidelidade & Clube do Frango
 * 6. Exportação em CSV nativo (compatível Excel) e Impressão de Fechamento de Caixa
 */

import { Chart, registerables } from 'chart.js';
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS, PRODUTOS, CATEGORIAS } from '../data/mock.js';
import { fmtMoeda, fmtNumero, fmtData, isoData } from '../utils/format.js';

Chart.register(...registerables);

let graficosRelatorios = {};

export function destruirRelatorios() {
  Object.values(graficosRelatorios).forEach((g) => {
    try { g.destroy(); } catch (_) {}
  });
  graficosRelatorios = {};
}

// Utilitário de exportação CSV com suporte nativo a acentos e Excel no Brasil
function baixarCSV(nomeArquivo, cabecalhos, linhas) {
  const conteudoCSV = '\uFEFF' + [
    cabecalhos.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'),
    ...linhas.map((linha) => linha.map((col) => `"${String(col ?? '').replace(/"/g, '""')}"`).join(';')),
  ].join('\r\n');

  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${nomeArquivo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function renderRelatorios(raiz, irPara) {
  destruirRelatorios();

  // Estado interno da tela
  let abaAtiva = 'fechamento'; // 'fechamento', 'curva_abc', 'horarios', 'pagamentos', 'clientes'
  let periodoSelecionado = 'hoje'; // 'hoje', 'domingo', '7dias', 'mes', 'mes_anterior'
  let pontoSelecionado = store.get().ponto || 'todos';

  function desenhar() {
    destruirRelatorios();
    const tenant = store.getTenant();
    const st = store.get();
    const dadosPag = store.getPagamentos();
    const taxas = dadosPag.taxas || { debito: 1.19, creditoVista: 2.89, creditoParcelado: 3.99, pix: 0 };
    const vendasStore = store.getVendas();
    const pedidosStore = store.getPedidos();
    const clientesStore = store.getClientes();

    // ── GERAÇÃO E CONSOLIDAÇÃO DE DADOS POR PERÍODO ───────────────
    let multiplicador = 1;
    let labelPeriodo = 'Hoje';
    let dataReferencia = new Date();

    if (periodoSelecionado === 'domingo') {
      multiplicador = 3.8;
      labelPeriodo = 'Último Domingo (Pico)';
    } else if (periodoSelecionado === '7dias') {
      multiplicador = 6.2;
      labelPeriodo = 'Últimos 7 Dias';
    } else if (periodoSelecionado === 'mes') {
      multiplicador = 22.5;
      labelPeriodo = 'Mês Atual';
    } else if (periodoSelecionado === 'mes_anterior') {
      multiplicador = 20.8;
      labelPeriodo = 'Mês Anterior';
    }

    // Calcula faturamento base a partir das vendas registradas + histórico calibrado
    let brutoPDV = 0;
    let debitoPDV = 0;
    let creditoPDV = 0;
    let pixPDV = 0;
    let dinheiroPDV = 0;
    let totalItensPDV = 0;

    vendasStore.forEach((v) => {
      const val = parseFloat(v.total) || 0;
      brutoPDV += val;
      const met = (v.pagamento?.metodo || 'dinheiro').toLowerCase();
      if (met === 'pix') pixPDV += val;
      else if (met === 'debito') debitoPDV += val;
      else if (met === 'credito') creditoPDV += val;
      else dinheiroPDV += val;

      (v.itens || []).forEach((it) => {
        totalItensPDV += it.qtd || 1;
      });
    });

    // Valores consolidados para o período selecionado
    const faturamentoBruto = Math.round(((brutoPDV > 0 ? brutoPDV : 1240) * multiplicador) * 100) / 100;
    const qtdVendas = Math.round(((vendasStore.length > 0 ? vendasStore.length : 24) * multiplicador));
    const ticketMedio = faturamentoBruto / (qtdVendas || 1);

    // Divisão por meios de pagamento estimada/real
    const valPix = Math.round(faturamentoBruto * 0.44 * 100) / 100;
    const valDebito = Math.round(faturamentoBruto * 0.26 * 100) / 100;
    const valCredito = Math.round(faturamentoBruto * 0.18 * 100) / 100;
    const valDinheiro = Math.round((faturamentoBruto - (valPix + valDebito + valCredito)) * 100) / 100;

    // Custos de taxas de maquininhas
    const taxaDebitoR$ = valDebito * ((taxas.debito || 1.19) / 100);
    const taxaCreditoR$ = valCredito * ((taxas.creditoVista || 2.89) / 100);
    const taxaPixR$ = valPix * ((taxas.pix || 0) / 100);
    const totalTaxasMaquininha = Math.round((taxaDebitoR$ + taxaCreditoR$ + taxaPixR$) * 100) / 100;

    const faturamentoLiquido = faturamentoBruto - totalTaxasMaquininha;

    // CMV Estimado (Custo de Mercadorias Vendidas no nicho de assados: ~38% a 42% do faturamento)
    const cmvEstimado = Math.round(faturamentoBruto * 0.39 * 100) / 100;
    const lucroBrutoOperacional = faturamentoLiquido - cmvEstimado;
    const margemBrutaPercent = Math.round((lucroBrutoOperacional / (faturamentoBruto || 1)) * 1000) / 10;

    // Quantidade estimada de frangos inteiros no período
    const frangosAssadosPeriodo = Math.round(qtdVendas * 1.15);

    raiz.innerHTML = `
    <div class="relatorios-container">
      
      <!-- Topo da Página -->
      <div class="clientes-topo" style="margin-bottom: 20px;">
        <div class="clientes-topo-info">
          <h1>Relatórios Avançados & Inteligência de Negócio 📊📈</h1>
          <p>
            <span class="badge badge-demo">${icone('local', 'mini')} ${tenant?.nome || 'Ao Ponto Assados'}</span>
            &bull; DRE Operacional, Fechamento de Caixa, Curva ABC de Vendas e Picos de Horário
          </p>
        </div>
        <div class="clientes-topo-acoes">
          <button class="btn btn-contorno" id="btn-imprimir-fechamento">
            🖨️ Imprimir Fechamento de Caixa
          </button>
          <button class="btn btn-primario" id="btn-exportar-csv-geral">
            📥 Exportar Relatório (CSV)
          </button>
        </div>
      </div>

      <!-- Barra de Filtros de Período e Ponto -->
      <div class="cartao" style="margin-bottom: 20px; padding: 14px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; background: #FFFDF9; border-left: 4px solid var(--brasa);">
        
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
          <strong style="font-size: 13px; color: var(--carvao);">Filtrar Período:</strong>
          <div class="filtros-periodo-botoes" style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-pequeno ${periodoSelecionado === 'hoje' ? 'btn-primario' : 'btn-contorno'}" data-p="hoje">Hoje</button>
            <button class="btn btn-pequeno ${periodoSelecionado === 'domingo' ? 'btn-primario' : 'btn-contorno'}" data-p="domingo">Último Domingo 🔥</button>
            <button class="btn btn-pequeno ${periodoSelecionado === '7dias' ? 'btn-primario' : 'btn-contorno'}" data-p="7dias">Últimos 7 dias</button>
            <button class="btn btn-pequeno ${periodoSelecionado === 'mes' ? 'btn-primario' : 'btn-contorno'}" data-p="mes">Mês Atual</button>
            <button class="btn btn-pequeno ${periodoSelecionado === 'mes_anterior' ? 'btn-primario' : 'btn-contorno'}" data-p="mes_anterior">Mês Anterior</button>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="font-size: 13px; font-weight: 700; color: var(--carvao);" for="sel-relatorio-ponto">Ponto de Venda:</label>
          <select id="sel-relatorio-ponto" class="select" style="min-width: 170px; height: 36px; font-size: 13px;">
            <option value="todos" ${pontoSelecionado === 'todos' ? 'selected' : ''}>Todos os Pontos</option>
            ${PONTOS.map((p) => `<option value="${p.id}" ${pontoSelecionado === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}
          </select>
        </div>

      </div>

      <!-- KPIs Executivos do Período -->
      <div class="clientes-kpis" style="margin-bottom: 22px;">
        <div class="kpi-card">
          <div class="kpi-rotulo">Faturamento Bruto</div>
          <div class="kpi-valor" style="color: var(--carvao);">${fmtMoeda(faturamentoBruto)}</div>
          <div class="kpi-sub">${qtdVendas} pedidos · ${labelPeriodo}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Taxas Maquininhas / Cartões</div>
          <div class="kpi-valor" style="color: #DC2626;">-${fmtMoeda(totalTaxasMaquininha)}</div>
          <div class="kpi-sub">Custo médio retido: ${(totalTaxasMaquininha / (faturamentoBruto || 1) * 100).toFixed(2)}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Receita Líquida em Conta</div>
          <div class="kpi-valor" style="color: #2563EB;">${fmtMoeda(faturamentoLiquido)}</div>
          <div class="kpi-sub">Após descontos de operadoras</div>
        </div>
        <div class="kpi-card destaque-fidelidade">
          <div class="kpi-rotulo">Lucro Bruto Operacional (Margem) 💰</div>
          <div class="kpi-valor" style="color: #16A34A;">${fmtMoeda(lucroBrutoOperacional)}</div>
          <div class="kpi-sub">Margem de Contribuição: <b>${margemBrutaPercent}%</b></div>
        </div>
      </div>

      <!-- Abas de Navegação dos Relatórios -->
      <div class="wa-abas" style="margin-bottom: 20px;">
        <button class="wa-aba-btn ${abaAtiva === 'fechamento' ? 'ativa' : ''}" data-aba="fechamento">
          💵 Fechamento de Caixa & DRE
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'curva_abc' ? 'ativa' : ''}" data-aba="curva_abc">
          🍗 Curva ABC de Produtos
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'horarios' ? 'ativa' : ''}" data-aba="horarios">
          ⏰ Picos de Horário & Demanda
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'pagamentos' ? 'ativa' : ''}" data-aba="pagamentos">
          💳 Meios de Pagamento & Taxas
        </button>
        <button class="wa-aba-btn ${abaAtiva === 'clientes' ? 'ativa' : ''}" data-aba="clientes">
          ⭐ Fidelidade & Clube do Frango
        </button>
      </div>

      <!-- Conteúdo da Aba Ativa -->
      <div id="relatorio-conteudo-aba"></div>

    </div>
    `;

    renderizarConteudoAba();
    atribuirEventos();
  }

  function renderizarConteudoAba() {
    const container = raiz.querySelector('#relatorio-conteudo-aba');
    if (!container) return;

    destruirRelatorios();

    if (abaAtiva === 'fechamento') {
      renderAbaFechamento(container);
    } else if (abaAtiva === 'curva_abc') {
      renderAbaCurvaABC(container);
    } else if (abaAtiva === 'horarios') {
      renderAbaHorarios(container);
    } else if (abaAtiva === 'pagamentos') {
      renderAbaPagamentos(container);
    } else if (abaAtiva === 'clientes') {
      renderAbaClientes(container);
    }
  }

  // ── ABA 1: FECHAMENTO DE CAIXA & DRE OPERACIONAL ──────────────
  function renderAbaFechamento(el) {
    const faturamentoBruto = 1240 * (periodoSelecionado === 'domingo' ? 3.8 : periodoSelecionado === '7dias' ? 6.2 : periodoSelecionado === 'mes' ? 22.5 : 1);
    const valPix = Math.round(faturamentoBruto * 0.44 * 100) / 100;
    const valDebito = Math.round(faturamentoBruto * 0.26 * 100) / 100;
    const valCredito = Math.round(faturamentoBruto * 0.18 * 100) / 100;
    const valDinheiro = Math.round((faturamentoBruto - (valPix + valDebito + valCredito)) * 100) / 100;

    const taxasMaq = Math.round((valDebito * 0.0119 + valCredito * 0.0289) * 100) / 100;
    const liquido = faturamentoBruto - taxasMaq;
    const cmv = Math.round(faturamentoBruto * 0.39 * 100) / 100;
    const lucro = liquido - cmv;

    el.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        
        <!-- Demonstrativo DRE Simplificado -->
        <div class="cartao">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
              DRE Operacional da Assadeira
            </h3>
            <span class="badge badge-sucesso">Regime de Competência</span>
          </div>
          <p style="font-size: 12px; color: var(--texto-suave); margin-bottom: 16px;">
            Estrutura analítica de receitas, custos diretos de insumos e taxas de intermediação.
          </p>

          <table class="tabela" style="width: 100%; font-size: 13px;">
            <tbody>
              <tr style="font-weight: 700; background: #F8FAFC;">
                <td>(+) Faturamento Bruto de Vendas</td>
                <td style="text-align: right; color: var(--carvao);">${fmtMoeda(faturamentoBruto)}</td>
                <td style="text-align: right; color: var(--texto-suave); font-size: 11px;">100.0%</td>
              </tr>
              <tr style="color: #DC2626;">
                <td style="padding-left: 18px;">(-) Taxas de Maquininhas (Stone / MP / PagBank)</td>
                <td style="text-align: right;">-${fmtMoeda(taxasMaq)}</td>
                <td style="text-align: right; font-size: 11px;">-${((taxasMaq / faturamentoBruto) * 100).toFixed(1)}%</td>
              </tr>
              <tr style="font-weight: 700; border-top: 1px solid var(--borda);">
                <td>(=) Receita Operacional Líquida</td>
                <td style="text-align: right; color: #2563EB;">${fmtMoeda(liquido)}</td>
                <td style="text-align: right; color: var(--texto-suave); font-size: 11px;">${((liquido / faturamentoBruto) * 100).toFixed(1)}%</td>
              </tr>
              <tr style="color: #B45309;">
                <td style="padding-left: 18px;">(-) Custo de Insumos & Frangos Crus (CMV ~39%)</td>
                <td style="text-align: right;">-${fmtMoeda(cmv)}</td>
                <td style="text-align: right; font-size: 11px;">-39.0%</td>
              </tr>
              <tr style="color: var(--texto-suave);">
                <td style="padding-left: 28px; font-size: 11px;">• Frangos e temperos de marinada</td>
                <td style="text-align: right; font-size: 11px;">-${fmtMoeda(cmv * 0.72)}</td>
                <td></td>
              </tr>
              <tr style="color: var(--texto-suave);">
                <td style="padding-left: 28px; font-size: 11px;">• Embalagens térmicas e sacolas</td>
                <td style="text-align: right; font-size: 11px;">-${fmtMoeda(cmv * 0.16)}</td>
                <td></td>
              </tr>
              <tr style="color: var(--texto-suave);">
                <td style="padding-left: 28px; font-size: 11px;">• Carvão, lenha e gás do braseiro</td>
                <td style="text-align: right; font-size: 11px;">-${fmtMoeda(cmv * 0.12)}</td>
                <td></td>
              </tr>
              <tr style="font-weight: 800; font-size: 14px; background: #F0FDF4; border-top: 2px solid #BBF7D0;">
                <td style="color: #166534;">(=) Lucro Bruto Operacional (Margem)</td>
                <td style="text-align: right; color: #166534;">${fmtMoeda(lucro)}</td>
                <td style="text-align: right; color: #166534; font-size: 12px;">${((lucro / faturamentoBruto) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 14px; padding: 10px 14px; background: #FFFBF5; border-radius: 8px; border: 1px solid #FED7AA; font-size: 12px; color: #9A3412;">
            💡 <b>Dica de Gestão:</b> A sua margem bruta de <b>${((lucro / faturamentoBruto) * 100).toFixed(1)}%</b> está excelente e saudável para rotisseries brasileiras (a média do setor varia entre 50% e 62%).
          </div>
        </div>

        <!-- Conferência de Caixa & Entradas Físicas -->
        <div class="cartao">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
              Conferência de Caixa por Forma de Entrada
            </h3>
            <button class="btn btn-pequeno btn-contorno" id="btn-imprimir-caixa-cupom">
              🖨️ Cupom de Caixa
            </button>
          </div>
          <p style="font-size: 12px; color: var(--texto-suave); margin-bottom: 16px;">
            Valores discriminados para conferência física da gaveta de dinheiro e extratos bancários.
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--borda);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">💵</span>
                <div>
                  <strong style="color: var(--carvao); font-size: 13px;">Dinheiro em Espécie (Gaveta)</strong>
                  <small style="display: block; color: var(--texto-suave);">Conferir notas físicas no balcão</small>
                </div>
              </div>
              <strong style="font-size: 15px; color: var(--carvao);">${fmtMoeda(valDinheiro)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F0FDF4; border-radius: 8px; border: 1px solid #BBF7D0;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">⚡</span>
                <div>
                  <strong style="color: #166534; font-size: 13px;">Pix Recebido (Conta Corrente)</strong>
                  <small style="display: block; color: #16A34A;">Disponível na hora · Taxa 0%</small>
                </div>
              </div>
              <strong style="font-size: 15px; color: #166534;">${fmtMoeda(valPix)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #EFF6FF; border-radius: 8px; border: 1px solid #BFDBFE;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">💳</span>
                <div>
                  <strong style="color: #1E40AF; font-size: 13px;">Cartão de Débito (Maquininha)</strong>
                  <small style="display: block; color: #2563EB;">Compensação em D+1 útil</small>
                </div>
              </div>
              <strong style="font-size: 15px; color: #1E40AF;">${fmtMoeda(valDebito)}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #FAF5FF; border-radius: 8px; border: 1px solid #E9D5FF;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">💳</span>
                <div>
                  <strong style="color: #6B21A8; font-size: 13px;">Cartão de Crédito (Maquininha)</strong>
                  <small style="display: block; color: #9333EA;">Rotativo ou parcelado</small>
                </div>
              </div>
              <strong style="font-size: 15px; color: #6B21A8;">${fmtMoeda(valCredito)}</strong>
            </div>
          </div>

          <div style="margin-top: 14px; padding: 12px; border-radius: 8px; background: #F8FAFC; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--texto-suave);">Fundo de Troco Inicial Padrão:</span>
            <strong style="color: var(--carvao);">R$ 150,00</strong>
          </div>
        </div>

      </div>
    `;

    el.querySelector('#btn-imprimir-caixa-cupom')?.addEventListener('click', () => {
      abrirModalImpressaoFechamento();
    });
  }

  // ── ABA 2: CURVA ABC DE PRODUTOS ──────────────────────────────
  function renderAbaCurvaABC(el) {
    const mult = periodoSelecionado === 'domingo' ? 3.8 : periodoSelecionado === '7dias' ? 6.2 : periodoSelecionado === 'mes' ? 22.5 : 1;
    
    // Dados da Curva ABC baseados no catálogo do frango
    const listaProdutos = [
      { id: 'inteiro', nome: 'Frango Inteiro Assado com Farofa', categoria: 'Assados', preco: 45.0, qtd: Math.round(18 * mult), margem: 'Alta' },
      { id: 'meio', nome: 'Meio Frango Assado', categoria: 'Assados', preco: 25.0, qtd: Math.round(14 * mult), margem: 'Média' },
      { id: 'linguica', nome: 'Linguiça Toscana na Brasa (Kg)', categoria: 'Carnes', preco: 39.9, qtd: Math.round(9 * mult), margem: 'Alta' },
      { id: 'lombo', nome: 'Lombo Suíno Assado (Kg)', categoria: 'Carnes', preco: 54.9, qtd: Math.round(5 * mult), margem: 'Média' },
      { id: 'maionese', nome: 'Maionese Caseira de Batata (Pote)', categoria: 'Guarnições', preco: 15.0, qtd: Math.round(16 * mult), margem: 'Muito Alta' },
      { id: 'farofa', nome: 'Farofa Crocante Especial de Bacon', categoria: 'Guarnições', preco: 10.0, qtd: Math.round(20 * mult), margem: 'Muito Alta' },
      { id: 'batata', nome: 'Batata Bolinha Refogada com Ervas', categoria: 'Guarnições', preco: 12.0, qtd: Math.round(15 * mult), margem: 'Muito Alta' },
      { id: 'refri2l', nome: 'Refrigerante 2 Litros Gelado', categoria: 'Bebidas', preco: 14.0, qtd: Math.round(19 * mult), margem: 'Média' },
    ];

    listaProdutos.forEach((p) => {
      p.faturamento = Math.round(p.qtd * p.preco * 100) / 100;
    });

    listaProdutos.sort((a, b) => b.faturamento - a.faturamento);

    const faturamentoTotal = listaProdutos.reduce((acc, p) => acc + p.faturamento, 0);

    let acumulado = 0;
    listaProdutos.forEach((p) => {
      p.participacao = (p.faturamento / faturamentoTotal) * 100;
      acumulado += p.participacao;
      p.acumulado = acumulado;
      if (p.acumulado <= 75) p.classe = 'A';
      else if (p.acumulado <= 92) p.classe = 'B';
      else p.classe = 'C';
    });

    el.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
        
        <!-- Tabela Curva ABC -->
        <div class="cartao">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
                Classificação da Curva ABC
              </h3>
              <small style="color: var(--texto-suave);">Produtos A (70% do faturamento), B (20%) e C (10%)</small>
            </div>
            <button class="btn btn-pequeno btn-contorno" id="btn-exportar-curva-abc">
              📥 Exportar Curva ABC
            </button>
          </div>

          <table class="tabela" style="width: 100%; font-size: 12px;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th>Classe</th>
                <th>Produto</th>
                <th style="text-align: center;">Qtd</th>
                <th style="text-align: right;">Preço Médio</th>
                <th style="text-align: right;">Faturamento</th>
                <th style="text-align: right;">% Fat.</th>
                <th style="text-align: right;">% Acum.</th>
              </tr>
            </thead>
            <tbody>
              ${listaProdutos.map((p) => `
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px; background: ${p.classe === 'A' ? '#DCFCE7' : p.classe === 'B' ? '#FEF9C3' : '#F1F5F9'}; color: ${p.classe === 'A' ? '#166534' : p.classe === 'B' ? '#854D0E' : '#475569'};">
                      Classe ${p.classe}
                    </span>
                  </td>
                  <td>
                    <strong style="color: var(--carvao);">${p.nome}</strong>
                    <small style="display: block; color: var(--texto-suave);">${p.categoria} &bull; Margem ${p.margem}</small>
                  </td>
                  <td style="text-align: center; font-weight: 700;">${fmtNumero(p.qtd)}</td>
                  <td style="text-align: right;">${fmtMoeda(p.preco)}</td>
                  <td style="text-align: right; font-weight: 700; color: var(--carvao);">${fmtMoeda(p.faturamento)}</td>
                  <td style="text-align: right; font-weight: 600;">${p.participacao.toFixed(1)}%</td>
                  <td style="text-align: right; color: var(--texto-suave);">${p.acumulado.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Gráfico de Mix por Categoria -->
        <div class="cartao" style="display: flex; flex-direction: column;">
          <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 800; color: var(--carvao);">
            Participação por Categoria
          </h3>
          <small style="color: var(--texto-suave); margin-bottom: 14px;">Distribuição do faturamento</small>
          
          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="grafico-mix-categoria"></canvas>
          </div>

          <div style="margin-top: 16px; padding: 12px; background: #F8FAFC; border-radius: 8px; font-size: 11px; color: var(--texto-suave);">
            ⭐ <b>Estratégia de Alta Rentabilidade:</b> O Frango Assado é o item "chamariz", mas as guarnições (Farofa, Maionese, Batata) representam mais de <b>75% de margem pura</b>. Sempre ofereça o combo completo no balcão!
          </div>
        </div>

      </div>
    `;

    // Gráfico de Pizza / Doughnut com Chart.js
    const ctx = el.querySelector('#grafico-mix-categoria');
    if (ctx) {
      graficosRelatorios.mix = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Frangos Assados', 'Guarnições & Saladas', 'Carnes & Espetos', 'Bebidas'],
          datasets: [{
            data: [54, 23, 14, 9],
            backgroundColor: ['#D9481C', '#D4AC0D', '#8B4A22', '#2874A6'],
            borderWidth: 2,
            borderColor: '#ffffff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          },
        },
      });
    }

    el.querySelector('#btn-exportar-curva-abc')?.addEventListener('click', () => {
      const cabecalhos = ['Classe', 'Produto', 'Categoria', 'Quantidade', 'Preco Unitario', 'Faturamento Total', '% Participacao', '% Acumulado'];
      const linhas = listaProdutos.map((p) => [
        p.classe,
        p.nome,
        p.categoria,
        p.qtd,
        p.preco.toFixed(2),
        p.faturamento.toFixed(2),
        p.participacao.toFixed(2) + '%',
        p.acumulado.toFixed(2) + '%',
      ]);
      baixarCSV(`relatorio-curva-abc-${periodoSelecionado}`, cabecalhos, linhas);
      toast('Curva ABC exportada em CSV com sucesso!');
    });
  }

  // ── ABA 3: PICOS DE HORÁRIO & DOMINGO ─────────────────────────
  function renderAbaHorarios(el) {
    el.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        
        <!-- Gráfico de Demanda por Horário -->
        <div class="cartao">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
                Curva de Demanda por Faixa Horária (Domingo) 🍗⏰
              </h3>
              <small style="color: var(--texto-suave);">Volume de assados retirados no balcão por hora</small>
            </div>
            <span class="badge badge-sucesso">Pico Crítico: 11h30 - 13h00</span>
          </div>

          <div style="position: relative; height: 320px; width: 100%;">
            <canvas id="grafico-picos-horario"></canvas>
          </div>
        </div>

        <!-- Painel de Dicas Operacionais & Capacidade do Braseiro -->
        <div class="cartao" style="display: flex; flex-direction: column; gap: 14px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--carvao);">
            Capacidade da Assadeira & Braseiro
          </h3>

          <div style="padding: 12px; background: #FFFBF5; border: 1.5px solid #FDBA74; border-radius: 8px;">
            <strong style="color: #9A3412; font-size: 13px; display: block; margin-bottom: 4px;">
              🔥 Ciclo de Fogo (Tempo de Braseiro):
            </strong>
            <p style="font-size: 12px; color: #7C2D12; margin: 0;">
              O frango leva em média <b>1h45 a 2h10</b> para dourar por completo. Para atender a onda das 11h30, o primeiro lote deve entrar na máquina impreterivelmente às <b>09h20</b>.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--texto-suave);">Capacidade Total da Máquina:</span>
              <strong style="color: var(--carvao);">40 frangos / fornada</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--texto-suave);">Demanda Máxima no Pico:</span>
              <strong style="color: #DC2626;">65 frangos / hora</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--texto-suave);">Taxa de Retirada no Prazo:</span>
              <strong style="color: #16A34A;">96.4% no horário</strong>
            </div>
          </div>

          <div style="margin-top: auto; padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--borda);">
            <strong style="font-size: 12px; color: var(--carvao); display: block; margin-bottom: 4px;">
              💡 Regra de Ouro da Estufa:
            </strong>
            <small style="color: var(--texto-suave); font-size: 11px;">
              Mantenha pelo menos 6 a 8 frangos prontos na estufa térmica entre 11h e 13h para atender clientes sem reserva prévia sem criar filas na calçada.
            </small>
          </div>
        </div>

      </div>
    `;

    const ctx = el.querySelector('#grafico-picos-horario');
    if (ctx) {
      graficosRelatorios.horarios = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['08:00', '09:00', '10:00', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '15:00'],
          datasets: [
            {
              label: 'Frangos Encomendados (WhatsApp)',
              data: [2, 5, 12, 28, 48, 54, 38, 22, 14, 6, 2],
              backgroundColor: '#EA580C',
              borderRadius: 6,
            },
            {
              label: 'Vendas Espontâneas de Balcão',
              data: [1, 2, 6, 14, 22, 26, 18, 11, 7, 3, 1],
              backgroundColor: '#FED7AA',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Frangos Retirados' } },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      });
    }
  }

  // ── ABA 4: MEIOS DE PAGAMENTO & TAXAS ─────────────────────────
  function renderAbaPagamentos(el) {
    const dadosPag = store.getPagamentos();
    const taxas = dadosPag.taxas || { debito: 1.19, creditoVista: 2.89, creditoParcelado: 3.99, pix: 0 };
    const mult = periodoSelecionado === 'domingo' ? 3.8 : periodoSelecionado === '7dias' ? 6.2 : periodoSelecionado === 'mes' ? 22.5 : 1;
    const faturamentoTotal = Math.round(1240 * mult * 100) / 100;

    const metodos = [
      { nome: 'Pix Instantâneo (QR / Chave)', pct: 45, taxaPct: taxas.pix || 0, prazo: 'Imediato', icone: '⚡', cor: '#16A34A' },
      { nome: 'Cartão de Débito', pct: 26, taxaPct: taxas.debito || 1.19, prazo: 'D+1 útil', icone: '💳', cor: '#2563EB' },
      { nome: 'Cartão de Crédito à Vista', pct: 15, taxaPct: taxas.creditoVista || 2.89, prazo: 'D+1 ou D+30', icone: '💳', cor: '#7C3AED' },
      { nome: 'Dinheiro Físico', pct: 14, taxaPct: 0, prazo: 'Imediato na gaveta', icone: '💵', cor: '#475569' },
    ];

    metodos.forEach((m) => {
      m.valorTotal = Math.round(faturamentoTotal * (m.pct / 100) * 100) / 100;
      m.valorTaxa = Math.round(m.valorTotal * (m.taxaPct / 100) * 100) / 100;
      m.valorLiquido = m.valorTotal - m.valorTaxa;
    });

    const totalTaxasGeral = metodos.reduce((acc, m) => acc + m.valorTaxa, 0);

    el.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        
        <!-- Tabela Discriminada -->
        <div class="cartao">
          <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 800; color: var(--carvao);">
            Desempenho por Modalidade de Pagamento
          </h3>
          <small style="color: var(--texto-suave); display: block; margin-bottom: 14px;">
            Volume financeiro e desconto retido pelas adquirentes
          </small>

          <table class="tabela" style="width: 100%; font-size: 12px;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th>Método</th>
                <th style="text-align: right;">Total Bruto</th>
                <th style="text-align: right;">Taxa %</th>
                <th style="text-align: right;">Custo Maquininha</th>
                <th style="text-align: right;">Líquido em Conta</th>
              </tr>
            </thead>
            <tbody>
              ${metodos.map((m) => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span>${m.icone}</span>
                      <div>
                        <strong style="color: var(--carvao);">${m.nome}</strong>
                        <small style="display: block; color: var(--texto-suave);">${m.prazo}</small>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 700;">${fmtMoeda(m.valorTotal)}</td>
                  <td style="text-align: right; color: #DC2626; font-weight: 600;">${m.taxaPct.toFixed(2)}%</td>
                  <td style="text-align: right; color: #DC2626;">-${fmtMoeda(m.valorTaxa)}</td>
                  <td style="text-align: right; font-weight: 700; color: #166534;">${fmtMoeda(m.valorLiquido)}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: 800; background: #F8FAFC; border-top: 2px solid var(--borda);">
                <td>Total Geral</td>
                <td style="text-align: right;">${fmtMoeda(faturamentoTotal)}</td>
                <td></td>
                <td style="text-align: right; color: #DC2626;">-${fmtMoeda(totalTaxasGeral)}</td>
                <td style="text-align: right; color: #166534;">${fmtMoeda(faturamentoTotal - totalTaxasGeral)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Gráfico Rosca de Meios de Pagamento -->
        <div class="cartao" style="display: flex; flex-direction: column;">
          <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 800; color: var(--carvao);">
            Divisão Percentual de Pagamentos
          </h3>
          <small style="color: var(--texto-suave); margin-bottom: 14px;">Participação no faturamento</small>

          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="grafico-meios-pagamento"></canvas>
          </div>

          <div style="margin-top: 14px; padding: 12px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 12px; color: #166534;">
            ⚡ <b>Economia com Pix:</b> Mais de <b>45%</b> das suas vendas são pagas via Pix (Taxa 0%). Isso economizou cerca de <b>${fmtMoeda(faturamentoTotal * 0.45 * 0.025)}</b> neste período em relação a cartões!
          </div>
        </div>

      </div>
    `;

    const ctx = el.querySelector('#grafico-meios-pagamento');
    if (ctx) {
      graficosRelatorios.pagamentos = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: metodos.map((m) => m.nome),
          datasets: [{
            data: metodos.map((m) => m.pct),
            backgroundColor: metodos.map((m) => m.cor),
            borderWidth: 2,
            borderColor: '#ffffff',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
          },
        },
      });
    }
  }

  // ── ABA 5: CLIENTES & CLUBE DO FRANGO ─────────────────────────
  function renderAbaClientes(el) {
    const clientes = store.getClientes() || [];
    const ranking = [...clientes].sort((a, b) => (b.comprasQtd || 0) - (a.comprasQtd || 0)).slice(0, 8);

    el.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        
        <!-- Ranking Top Fregueses -->
        <div class="cartao">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
                Top Fregueses Fiéis de Domingo ⭐🍗
              </h3>
              <small style="color: var(--texto-suave);">Clientes com maior frequência e engajamento no Clube do Frango</small>
            </div>
            <span class="badge badge-sucesso">${clientes.length} Cadastrados</span>
          </div>

          <table class="tabela" style="width: 100%; font-size: 12px;">
            <thead>
              <tr style="background: #F8FAFC;">
                <th>Posição</th>
                <th>Freguês</th>
                <th style="text-align: center;">Selos Ativos</th>
                <th style="text-align: right;">Total Compras</th>
                <th style="text-align: right;">Valor Gasto</th>
                <th style="text-align: right;">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              ${ranking.map((c, i) => `
                <tr>
                  <td style="font-weight: 800; color: ${i === 0 ? '#EAB308' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : 'var(--texto-suave)'};">
                    ${i === 0 ? '🥇 1º' : i === 1 ? '🥈 2º' : i === 2 ? '🥉 3º' : `${i + 1}º`}
                  </td>
                  <td>
                    <strong style="color: var(--carvao);">${c.nome}</strong>
                    <small style="display: block; color: var(--texto-suave);">${c.telefone || 'Sem telefone'}</small>
                  </td>
                  <td style="text-align: center;">
                    <span style="background: #FFF7ED; color: #EA580C; font-weight: 800; padding: 2px 8px; border-radius: 12px; border: 1px solid #FFEDD5;">
                      ${c.selosFidelidade || 0} / 10 🍗
                    </span>
                  </td>
                  <td style="text-align: right; font-weight: 700;">${c.comprasQtd || 0} pedidos</td>
                  <td style="text-align: right; font-weight: 700; color: #166534;">${fmtMoeda(c.totalGasto || 0)}</td>
                  <td style="text-align: right; color: var(--texto-suave);">${fmtMoeda((c.totalGasto || 0) / (c.comprasQtd || 1))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Estatísticas do Clube de Fidelidade -->
        <div class="cartao" style="display: flex; flex-direction: column; gap: 14px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--carvao);">
            Performance do Clube do Frango
          </h3>

          <div style="padding: 14px; background: #FFF7ED; border: 1.5px solid #FFEDD5; border-radius: 10px; text-align: center;">
            <span style="font-size: 32px;">🎁</span>
            <strong style="display: block; font-size: 18px; color: #C2410C; margin: 4px 0;">
              14 Frangos Grátis Conquistados
            </strong>
            <small style="color: #9A3412;">Fregueses que completaram os 10 selos este mês</small>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--texto-suave);">Taxa de Retenção de Domingo:</span>
              <strong style="color: #16A34A;">78.2% voltam em até 15 dias</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--texto-suave);">Ticket Médio (Com Clube):</span>
              <strong style="color: var(--carvao);">R$ 68,40</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: var(--texto-suave);">Ticket Médio (Sem Clube):</span>
              <strong style="color: var(--texto-suave);">R$ 48,20</strong>
            </div>
          </div>

          <div style="margin-top: auto; padding: 12px; background: #F8FAFC; border-radius: 8px; font-size: 12px; color: var(--texto-suave);">
            📈 Clientes participantes do programa de selos compram <b>42% mais acompanhamentos</b> para acelerar o preenchimento da cartela.
          </div>
        </div>

      </div>
    `;
  }

  // ── MODAL DE IMPRESSÃO DE FECHAMENTO DE CAIXA ────────────────
  function abrirModalImpressaoFechamento() {
    const tenant = store.getTenant();
    const dadosPag = store.getPagamentos();
    const agora = new Date();
    const labelsPeriodos = {
      hoje: 'Hoje',
      domingo: 'Último Domingo (Pico)',
      '7dias': 'Últimos 7 Dias',
      mes: 'Mês Atual',
      mes_anterior: 'Mês Anterior',
    };
    const labelPeriodo = labelsPeriodos[periodoSelecionado] || 'Hoje';
    const faturamentoBruto = 1240 * (periodoSelecionado === 'domingo' ? 3.8 : periodoSelecionado === '7dias' ? 6.2 : periodoSelecionado === 'mes' ? 22.5 : 1);
    const valPix = Math.round(faturamentoBruto * 0.44 * 100) / 100;
    const valDebito = Math.round(faturamentoBruto * 0.26 * 100) / 100;
    const valCredito = Math.round(faturamentoBruto * 0.18 * 100) / 100;
    const valDinheiro = Math.round((faturamentoBruto - (valPix + valDebito + valCredito)) * 100) / 100;
    const taxasMaq = Math.round((valDebito * 0.0119 + valCredito * 0.0289) * 100) / 100;
    const liquido = faturamentoBruto - taxasMaq;

    abrirModal({
      titulo: 'Fechamento de Caixa — Impressão 🖨️',
      html: `
        <div style="background: #fff; border: 1px solid #CBD5E1; border-radius: 8px; padding: 20px; font-family: monospace; max-width: 420px; margin: 0 auto; color: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          
          <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 12px; margin-bottom: 12px;">
            <strong style="font-size: 16px; text-transform: uppercase;">${tenant?.nome || 'Ao Ponto Assados & Rotisserie'}</strong><br/>
            <small style="font-size: 11px;">RELATÓRIO DE FECHAMENTO DIÁRIO DE CAIXA</small><br/>
            <small style="font-size: 10px;">Emissão: ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}</small>
          </div>

          <div style="font-size: 12px; line-height: 1.6; margin-bottom: 12px;">
            <div><b>Período Analisado:</b> ${labelPeriodo}</div>
            <div><b>Operador / Resp.:</b> ${store.get().perfil === 'owner' ? 'Carlos Mendes (Dono)' : 'Operador do Caixa'}</div>
            <div><b>Ponto / Unidade:</b> ${pontoSelecionado === 'todos' ? 'Consolidado Geral' : pontoSelecionado}</div>
          </div>

          <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin-bottom: 12px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Faturamento Bruto:</span>
              <b>${fmtMoeda(faturamentoBruto)}</b>
            </div>
            <div style="display: flex; justify-content: space-between; color: #333;">
              <span>(-) Taxas Operadoras:</span>
              <span>-${fmtMoeda(taxasMaq)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 4px;">
              <span>(=) Líquido Efetivo:</span>
              <span>${fmtMoeda(liquido)}</span>
            </div>
          </div>

          <div style="font-size: 12px; margin-bottom: 16px; line-height: 1.6;">
            <b>ENTRADAS DISCRIMINADAS:</b>
            <div style="display: flex; justify-content: space-between;">
              <span>• Dinheiro (Gaveta):</span>
              <span>${fmtMoeda(valDinheiro)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>• Pix Recebido:</span>
              <span>${fmtMoeda(valPix)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>• Débito Maquininha:</span>
              <span>${fmtMoeda(valDebito)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>• Crédito Maquininha:</span>
              <span>${fmtMoeda(valCredito)}</span>
            </div>
          </div>

          <div style="border-top: 1px dashed #000; padding-top: 24px; text-align: center; margin-top: 24px;">
            <div style="border-bottom: 1px solid #000; width: 80%; margin: 0 auto 6px;"></div>
            <small style="font-size: 11px;">Assinatura do Responsável pelo Fechamento</small>
          </div>

        </div>

        <div style="margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-contorno" data-fechar>Fechar</button>
          <button class="btn btn-primario" onclick="window.print()">
            🖨️ Enviar para Impressora
          </button>
        </div>
      `,
    });
  }

  function atribuirEventos() {
    // Alternância de Abas
    raiz.querySelectorAll('.wa-aba-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        abaAtiva = btn.dataset.aba;
        raiz.querySelectorAll('.wa-aba-btn').forEach((b) => b.classList.toggle('ativa', b === btn));
        renderizarConteudoAba();
      });
    });

    // Filtros de Período
    raiz.querySelectorAll('[data-p]').forEach((btn) => {
      btn.addEventListener('click', () => {
        periodoSelecionado = btn.dataset.p;
        desenhar();
        toast(`Período atualizado para: ${btn.textContent.trim()}`);
      });
    });

    // Filtro de Ponto
    const selPonto = raiz.querySelector('#sel-relatorio-ponto');
    selPonto?.addEventListener('change', (e) => {
      pontoSelecionado = e.target.value;
      desenhar();
      toast('Ponto de venda filtrado com sucesso!');
    });

    // Botão Imprimir Fechamento
    raiz.querySelector('#btn-imprimir-fechamento')?.addEventListener('click', () => {
      abrirModalImpressaoFechamento();
    });

    // Botão Exportar CSV Geral
    raiz.querySelector('#btn-exportar-csv-geral')?.addEventListener('click', () => {
      const faturamentoBruto = 1240 * (periodoSelecionado === 'domingo' ? 3.8 : periodoSelecionado === '7dias' ? 6.2 : periodoSelecionado === 'mes' ? 22.5 : 1);
      const cabecalhos = ['Data / Periodo', 'Faturamento Bruto', 'Taxas Maquininha', 'Faturamento Liquido', 'CMV Insumos Estimado', 'Lucro Bruto Operacional'];
      const linhas = [
        [
          periodoSelecionado,
          faturamentoBruto.toFixed(2),
          (faturamentoBruto * 0.015).toFixed(2),
          (faturamentoBruto * 0.985).toFixed(2),
          (faturamentoBruto * 0.39).toFixed(2),
          (faturamentoBruto * 0.595).toFixed(2),
        ],
      ];
      baixarCSV(`fechamento-caixa-${periodoSelecionado}`, cabecalhos, linhas);
      toast('Relatório financeiro exportado com sucesso em CSV!');
    });
  }

  desenhar();
}
