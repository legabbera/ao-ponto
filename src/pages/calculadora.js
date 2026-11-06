/**
 * CALCULADORA DE PREÇOS, FORMAÇÃO DE CUSTOS & LUCRO REAL
 * Ferramenta estratégica para donos de pontos precificarem com segurança e sem prejuízo.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { escapeHtml, sanitizarNome, sanitizarTexto } from '../utils/sanitizar.js';

const CHAVE_FICHAS = 'ao-ponto-fichas-tecnicas';

// Modelos pré-configurados prontos para uso
const PRESETS = [
  {
    id: 'frango-assado',
    nome: 'Frango Assado Completo com Farofa',
    categoria: 'Assados',
    rendimento: 1,
    unidadeRendimento: 'un',
    margemDesejada: 65,
    taxaCartao: 2.5,
    custoOperacionalFixo: 2.5, // carvão/gás rateado
    custoEmbalagem: 1.4, // embalagem térmica + sacola
    insumos: [
      { id: '1', nome: 'Frango Inteiro Fresco / Cru', qtdUsada: 2.2, unidade: 'kg', custoCompra: 9.90, baseCompraQtd: 1, baseCompraUn: 'kg' },
      { id: '2', nome: 'Tempero Especial da Casa (Alho, Sal, Ervas)', qtdUsada: 120, unidade: 'g', custoCompra: 18.00, baseCompraQtd: 1, baseCompraUn: 'kg' },
      { id: '3', nome: 'Farofa Crocante de Acompanhamento', qtdUsada: 150, unidade: 'g', custoCompra: 12.00, baseCompraQtd: 1, baseCompraUn: 'kg' },
    ]
  },
  {
    id: 'espetinho-carne',
    nome: 'Espetinho de Carne na Brasa (100g)',
    categoria: 'Espetinhos',
    rendimento: 1,
    unidadeRendimento: 'un',
    margemDesejada: 100,
    taxaCartao: 2.0,
    custoOperacionalFixo: 0.60,
    custoEmbalagem: 0.40,
    insumos: [
      { id: '1', nome: 'Carne Bovina Selecionada (Alcatra / Acém)', qtdUsada: 120, unidade: 'g', custoCompra: 38.00, baseCompraQtd: 1, baseCompraUn: 'kg' },
      { id: '2', nome: 'Palito de Madeira Reforçado + Sal Grosso', qtdUsada: 1, unidade: 'un', custoCompra: 15.00, baseCompraQtd: 100, baseCompraUn: 'un' },
      { id: '3', nome: 'Farofa e Molho de Acompanhamento', qtdUsada: 40, unidade: 'g', custoCompra: 12.00, baseCompraQtd: 1, baseCompraUn: 'kg' },
    ]
  },
  {
    id: 'maionese-caseira',
    nome: 'Maionese Caseira de Batata (Pote 500g)',
    categoria: 'Acompanhamentos',
    rendimento: 1,
    unidadeRendimento: 'pote',
    margemDesejada: 150,
    taxaCartao: 2.0,
    custoOperacionalFixo: 0.50,
    custoEmbalagem: 0.90, // pote com tampa
    insumos: [
      { id: '1', nome: 'Batata Bolinha Cozida', qtdUsada: 350, unidade: 'g', custoCompra: 4.80, baseCompraQtd: 1, baseCompraUn: 'kg' },
      { id: '2', nome: 'Ovos, Óleo e Temperos Verdes (Molho Base)', qtdUsada: 150, unidade: 'g', custoCompra: 14.00, baseCompraQtd: 1, baseCompraUn: 'kg' },
    ]
  }
];

function carregarFichas() {
  try {
    const s = localStorage.getItem(CHAVE_FICHAS);
    if (!s) {
      localStorage.setItem(CHAVE_FICHAS, JSON.stringify(PRESETS));
      return [...PRESETS];
    }
    return JSON.parse(s);
  } catch (_) {
    return [...PRESETS];
  }
}

function salvarFichas(fichas) {
  localStorage.setItem(CHAVE_FICHAS, JSON.stringify(fichas));
}

export function renderCalculadora(raiz, irPara) {
  let fichas = carregarFichas();
  
  // Estado da Ficha em edição
  let estado = JSON.parse(JSON.stringify(PRESETS[0]));
  let qtdSimulador = 40; // Simulação padrão de fim de semana (40 frangos)

  function calcularCustoInsumo(ins) {
    const custoCompra = parseFloat(ins.custoCompra) || 0;
    const qtdUsada = parseFloat(ins.qtdUsada) || 0;
    const baseQtd = parseFloat(ins.baseCompraQtd) || 1;
    
    // Normalização para a mesma escala
    let fator = 1;
    if (ins.baseCompraUn === 'kg' && ins.unidade === 'g') fator = 1 / 1000;
    else if (ins.baseCompraUn === 'g' && ins.unidade === 'kg') fator = 1000;
    else if (ins.baseCompraUn === 'L' && ins.unidade === 'ml') fator = 1 / 1000;
    else if (ins.baseCompraUn === 'ml' && ins.unidade === 'L') fator = 1000;
    
    const custoUnitarioBase = custoCompra / (baseQtd || 1);
    return custoUnitarioBase * qtdUsada * fator;
  }

  function calcularTotais() {
    const somaInsumos = estado.insumos.reduce((acc, cur) => acc + calcularCustoInsumo(cur), 0);
    const rendimento = parseFloat(estado.rendimento) || 1;
    const custoInsumosPorUnidade = somaInsumos / rendimento;
    
    const custoEmbalagem = parseFloat(estado.custoEmbalagem) || 0;
    const custoOperacional = parseFloat(estado.custoOperacionalFixo) || 0;
    const custoTotalUnitario = custoInsumosPorUnidade + custoEmbalagem + custoOperacional;
    
    const margem = parseFloat(estado.margemDesejada) || 0;
    const taxaCartaoPct = parseFloat(estado.taxaCartao) || 0;

    // Preço de venda com margem sobre o custo + absorção da taxa de cartão
    // Preço Bruto = (Custo Total * (1 + Margem/100)) / (1 - TaxaCartão/100)
    let precoSugerido = 0;
    if (taxaCartaoPct < 100) {
      precoSugerido = (custoTotalUnitario * (1 + margem / 100)) / (1 - taxaCartaoPct / 100);
    } else {
      precoSugerido = custoTotalUnitario * (1 + margem / 100);
    }

    const valorTaxaCartao = precoSugerido * (taxaCartaoPct / 100);
    const lucroLiquidoUnitario = precoSugerido - custoTotalUnitario - valorTaxaCartao;
    const markup = custoTotalUnitario > 0 ? (precoSugerido / custoTotalUnitario).toFixed(2) : '1.0';
    const margemLiquidaRealPct = precoSugerido > 0 ? ((lucroLiquidoUnitario / precoSugerido) * 100).toFixed(1) : '0';

    // Simulação do lote
    const faturamentoLote = precoSugerido * qtdSimulador;
    const custoTotalLote = custoTotalUnitario * qtdSimulador;
    const lucroTotalLote = lucroLiquidoUnitario * qtdSimulador;

    return {
      somaInsumos,
      custoInsumosPorUnidade,
      custoEmbalagem,
      custoOperacional,
      custoTotalUnitario,
      precoSugerido,
      valorTaxaCartao,
      lucroLiquidoUnitario,
      markup,
      margemLiquidaRealPct,
      faturamentoLote,
      custoTotalLote,
      lucroTotalLote
    };
  }

  function formatarDinheiro(val) {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function renderTela() {
    const totais = calcularTotais();

    raiz.innerHTML = `
    <div class="calc-pagina max-w-5xl mx-auto space-y-6">

      <!-- Topo: Título & Seletor de Modelo -->
      <div class="card p-6 bg-[#1F1B18] text-[#F5EDE3] border border-[#3A332E]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#3A332E]">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9481C]/20 border border-[#D9481C]/40 text-[#F07A3E] text-xs font-bold uppercase tracking-wider mb-2">
              🔥 Ferramenta de Lucratividade
            </div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              Calculadora de Preços & Lucro Real
            </h1>
            <p class="text-sm text-[#C9BDB1] mt-1">
              Descubra com precisão o custo de produção de cada prato e garanta lucro no seu bolso em cada venda.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button class="btn btn-primario" id="btn-salvar-ficha" title="Salvar Ficha Técnica">
              ${icone('check')} <span>Salvar Ficha</span>
            </button>
            <button class="btn btn-escuro" id="btn-imprimir-ficha" title="Imprimir Ficha Técnica">
              ${icone('imprimir')} <span>Imprimir</span>
            </button>
          </div>
        </div>

        <!-- Seletor de Modelos Prontos -->
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-[#A99C90] uppercase tracking-wider">Modelos Rápidos:</span>
          ${fichas.map((f) => `
            <button class="btn btn-pequeno ${f.nome === estado.nome ? 'btn-primario' : 'btn-fantasma'}" data-carregar-ficha="${f.id || f.nome}">
              ${f.nome.includes('Frango') ? '🍗' : (f.nome.includes('Espeto') ? '🍢' : (f.nome.includes('Maionese') ? '🥗' : '📋'))} ${escapeHtml(f.nome.split('(')[0].trim())}
            </button>
          `).join('')}
          <button class="btn btn-pequeno btn-escuro" id="btn-nova-ficha">
            ${icone('mais')} <span>Novo Item</span>
          </button>
        </div>
      </div>

      <!-- Grid Principal: Formulário à Esquerda e Resultado à Direita -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Coluna Esquerda: Edição de Insumos e Custos (7 colunas) -->
        <div class="lg:col-span-7 space-y-5">

          <!-- 1. Dados Básicos do Produto -->
          <div class="card p-5 bg-white border border-[#E8DDCD] shadow-sm">
            <h2 class="text-base font-bold text-[#2A2420] flex items-center gap-2 mb-3">
              ${icone('pacote', 'ic-brasa')} 1. Identificação do Produto Final
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="rotulo text-xs font-semibold text-[#6E625A]">Nome do Produto</label>
                <input class="input" id="inp-nome-produto" type="text" value="${escapeHtml(estado.nome)}" placeholder="Ex: Frango Inteiro com Farofa" />
              </div>
              <div>
                <label class="rotulo text-xs font-semibold text-[#6E625A]">Rendimento (Receita)</label>
                <div class="flex items-center gap-1">
                  <input class="input text-center font-bold" id="inp-rendimento" type="number" min="1" step="1" value="${estado.rendimento}" />
                  <span class="text-xs text-[#6E625A] font-semibold">${estado.unidadeRendimento || 'un'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Lista Dinâmica de Insumos / Ingredientes -->
          <div class="card p-5 bg-white border border-[#E8DDCD] shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-[#F3EADC]">
              <h2 class="text-base font-bold text-[#2A2420] flex items-center gap-2">
                ${icone('vendas', 'ic-brasa')} 2. Insumos e Ingredientes da Receita
              </h2>
              <span class="text-xs font-semibold text-[#6E625A]">
                Subtotal: <strong class="text-[#D9481C]">${formatarDinheiro(totais.somaInsumos)}</strong>
              </span>
            </div>

            <div class="space-y-3" id="lista-insumos">
              ${estado.insumos.map((ins, idx) => {
                const custoCalculado = calcularCustoInsumo(ins);
                return `
                <div class="p-3 rounded-xl bg-[#FBF6EE] border border-[#E8DDCD] relative group hover:border-[#D9481C]/40 transition space-y-2" data-idx="${idx}">
                  <div class="flex items-center justify-between gap-2">
                    <input class="input font-semibold text-sm bg-white" data-campo="nome" value="${escapeHtml(ins.nome)}" placeholder="Nome do insumo..." style="min-height:40px;" />
                    <button class="btn btn-fantasma text-[#C0392B] p-2 hover:bg-[#FBE4E1] rounded-lg" data-remover-insumo="${idx}" title="Remover Insumo">
                      ${icone('lixeira')}
                    </button>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span class="text-[#6E625A] block mb-1">Custo Compra (R$)</span>
                      <input class="input text-xs font-semibold bg-white" data-campo="custoCompra" type="number" step="0.01" min="0" value="${ins.custoCompra}" placeholder="Ex: 10.00" style="min-height:36px;" />
                    </div>
                    <div>
                      <span class="text-[#6E625A] block mb-1">Embalagem Compra</span>
                      <div class="flex items-center gap-1">
                        <input class="input text-xs font-semibold bg-white text-center w-12" data-campo="baseCompraQtd" type="number" step="1" min="1" value="${ins.baseCompraQtd || 1}" style="min-height:36px;padding:0 4px;" />
                        <select class="input text-xs bg-white flex-1" data-campo="baseCompraUn" style="min-height:36px;padding:0 4px;">
                          <option value="kg" ${ins.baseCompraUn === 'kg' ? 'selected' : ''}>kg</option>
                          <option value="g" ${ins.baseCompraUn === 'g' ? 'selected' : ''}>g</option>
                          <option value="L" ${ins.baseCompraUn === 'L' ? 'selected' : ''}>L</option>
                          <option value="ml" ${ins.baseCompraUn === 'ml' ? 'selected' : ''}>ml</option>
                          <option value="un" ${ins.baseCompraUn === 'un' ? 'selected' : ''}>un</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <span class="text-[#6E625A] block mb-1">Qtd Usada</span>
                      <div class="flex items-center gap-1">
                        <input class="input text-xs font-bold bg-white text-center flex-1" data-campo="qtdUsada" type="number" step="0.01" min="0" value="${ins.qtdUsada}" style="min-height:36px;padding:0 4px;" />
                        <select class="input text-xs bg-white w-14" data-campo="unidade" style="min-height:36px;padding:0 4px;">
                          <option value="kg" ${ins.unidade === 'kg' ? 'selected' : ''}>kg</option>
                          <option value="g" ${ins.unidade === 'g' ? 'selected' : ''}>g</option>
                          <option value="L" ${ins.unidade === 'L' ? 'selected' : ''}>L</option>
                          <option value="ml" ${ins.unidade === 'ml' ? 'selected' : ''}>ml</option>
                          <option value="un" ${ins.unidade === 'un' ? 'selected' : ''}>un</option>
                        </select>
                      </div>
                    </div>
                    <div class="bg-[#F3EADC] rounded-lg p-2 flex flex-col justify-center items-end">
                      <span class="text-[10px] text-[#6E625A] uppercase font-bold">Custo no Prato</span>
                      <strong class="text-sm text-[#D9481C] font-mono">${formatarDinheiro(custoCalculado)}</strong>
                    </div>
                  </div>
                </div>
                `;
              }).join('')}
            </div>

            <button class="btn btn-fantasma w-full border border-dashed border-[#E8DDCD] hover:border-[#D9481C] py-2" id="btn-add-insumo">
              ${icone('mais')} <span>Adicionar Outro Insumo</span>
            </button>
          </div>

          <!-- 3. Custos Operacionais e Embalagem -->
          <div class="card p-5 bg-white border border-[#E8DDCD] shadow-sm space-y-3">
            <h2 class="text-base font-bold text-[#2A2420] flex items-center gap-2">
              ${icone('config', 'ic-brasa')} 3. Custos Extras de Produção (por unidade)
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="rotulo text-xs font-semibold text-[#6E625A]">Embalagem Térmica / Sacola (R$)</label>
                <input class="input font-semibold" id="inp-custo-embalagem" type="number" step="0.10" min="0" value="${estado.custoEmbalagem}" />
              </div>
              <div>
                <label class="rotulo text-xs font-semibold text-[#6E625A]">Carvão / Gás / Energia (R$)</label>
                <input class="input font-semibold" id="inp-custo-operacional" type="number" step="0.10" min="0" value="${estado.custoOperacionalFixo}" />
              </div>
              <div>
                <label class="rotulo text-xs font-semibold text-[#6E625A]">Taxa Média de Cartão (%)</label>
                <input class="input font-semibold" id="inp-taxa-cartao" type="number" step="0.1" min="0" max="30" value="${estado.taxaCartao}" />
              </div>
            </div>
          </div>

          <!-- 4. Definição da Margem de Lucro Desejada -->
          <div class="card p-5 bg-[#2B2622] text-white border border-[#3A332E] shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-white flex items-center gap-2">
                ${icone('tendencia', 'ic-viva')} 4. Margem de Lucro Desejada
              </h2>
              <span class="text-xl font-black text-[#F07A3E] font-mono">${estado.margemDesejada}%</span>
            </div>

            <!-- Slider Interativo -->
            <input type="range" class="w-full accent-[#D9481C] cursor-pointer" id="rng-margem" min="10" max="250" step="5" value="${estado.margemDesejada}" />

            <!-- Botões de Atalho Rápido -->
            <div class="flex flex-wrap gap-2 text-xs">
              <span class="text-[#A99C90] text-xs self-center">Atalhos:</span>
              <button class="btn btn-pequeno ${estado.margemDesejada === 40 ? 'btn-primario' : 'btn-escuro'}" data-set-margem="40">+40%</button>
              <button class="btn btn-pequeno ${estado.margemDesejada === 65 ? 'btn-primario' : 'btn-escuro'}" data-set-margem="65">+65% (Padrão)</button>
              <button class="btn btn-pequeno ${estado.margemDesejada === 100 ? 'btn-primario' : 'btn-escuro'}" data-set-margem="100">+100% (Dobro)</button>
              <button class="btn btn-pequeno ${estado.margemDesejada === 150 ? 'btn-primario' : 'btn-escuro'}" data-set-margem="150">+150% (Acomp.)</button>
            </div>
          </div>

        </div>

        <!-- Coluna Direita: O "Painel de Lucro Real" (5 colunas) -->
        <div class="lg:col-span-5 space-y-5">

          <!-- Card de Impacto Financeiro -->
          <div class="card p-6 bg-gradient-to-br from-[#1F1B18] to-[#2B2622] text-white border border-[#3A332E] shadow-xl sticky top-4 space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-[#3A332E]">
              <span class="text-xs uppercase font-bold text-[#A99C90] tracking-wider">Resultado da Precificação</span>
              <span class="px-2.5 py-0.5 rounded-full bg-[#2E8B57]/20 text-[#2E8B57] text-xs font-bold border border-[#2E8B57]/40">
                Markup: ${totais.markup}x
              </span>
            </div>

            <!-- 1. Custo de Produção Total -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-[#C9BDB1]">Custo Real Unitário:</span>
              <span class="text-lg font-bold text-[#E8DDCD] font-mono">${formatarDinheiro(totais.custoTotalUnitario)}</span>
            </div>

            <!-- 2. Preço de Venda Sugerido (DESTAQUE MÁXIMO) -->
            <div class="p-4 rounded-xl bg-[#1F1B18] border-2 border-[#D9481C] text-center space-y-1 shadow-lg">
              <span class="text-xs uppercase font-extrabold text-[#F07A3E] tracking-wider">Preço Sugerido de Venda</span>
              <div class="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                ${formatarDinheiro(totais.precoSugerido)}
              </div>
              <div class="text-xs text-[#A99C90]">
                Já absorvendo taxa média de cartão (${estado.taxaCartao}%)
              </div>
            </div>

            <!-- 3. Lucro Líquido no Bolso por Unidade (EM VERDE) -->
            <div class="p-4 rounded-xl bg-[#2E8B57]/15 border border-[#2E8B57]/30 flex items-center justify-between">
              <div>
                <span class="text-xs text-[#A99C90] uppercase font-bold block">Lucro no Bolso (Líquido)</span>
                <span class="text-2xl font-black text-[#2E8B57] font-mono">${formatarDinheiro(totais.lucroLiquidoUnitario)}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-[#A99C90] block">Margem Líquida</span>
                <span class="text-base font-bold text-white font-mono">${totais.margemLiquidaRealPct}%</span>
              </div>
            </div>

            <!-- 4. Simulador de Faturamento de Fim de Semana -->
            <div class="pt-3 border-t border-[#3A332E] space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  ${icone('relogio', 'ic-viva')} Simulação de Domingo:
                </span>
                <div class="flex items-center gap-1">
                  <input class="w-14 text-center font-bold text-sm bg-[#1F1B18] border border-[#3A332E] rounded px-1 py-0.5 text-white" id="inp-qtd-simulador" type="number" min="1" step="5" value="${qtdSimulador}" />
                  <span class="text-xs text-[#A99C90]">unidades</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 rounded-lg bg-[#1F1B18] border border-[#3A332E]">
                  <span class="text-[#A99C90] block text-[11px]">Faturamento Bruto</span>
                  <strong class="text-white text-sm font-mono">${formatarDinheiro(totais.faturamentoLote)}</strong>
                </div>
                <div class="p-2.5 rounded-lg bg-[#1F1B18] border border-[#2E8B57]/40 bg-[#2E8B57]/10">
                  <span class="text-[#2E8B57] block text-[11px] font-bold">Lucro Líquido Real</span>
                  <strong class="text-[#2E8B57] text-sm font-mono">${formatarDinheiro(totais.lucroTotalLote)}</strong>
                </div>
              </div>

              <p class="text-[11px] text-[#A99C90] italic">
                * Calculado com base no custo exato de todos os insumos, perdas, taxas e embalagens declaradas.
              </p>
            </div>

            <!-- Botão de WhatsApp -->
            <button class="btn btn-escuro w-full border border-[#2E8B57]/50 hover:bg-[#2E8B57]/20 text-white flex items-center justify-center gap-2" id="btn-compartilhar-whatsapp">
              ${icone('whatsapp', 'ic-verde')} <span>Enviar Resumo no WhatsApp</span>
            </button>
          </div>

        </div>

      </div>

    </div>
    `;

    // Eventos de Atualização Reativa
    vincularEventos();
  }

  function vincularEventos() {
    // 1. Inputs básicos do produto
    raiz.querySelector('#inp-nome-produto')?.addEventListener('input', (e) => {
      estado.nome = sanitizarNome(e.target.value);
    });

    raiz.querySelector('#inp-rendimento')?.addEventListener('input', (e) => {
      estado.rendimento = parseFloat(e.target.value) || 1;
      atualizarTotaisRapido();
    });

    // 2. Custos operacionais
    raiz.querySelector('#inp-custo-embalagem')?.addEventListener('input', (e) => {
      estado.custoEmbalagem = parseFloat(e.target.value) || 0;
      atualizarTotaisRapido();
    });

    raiz.querySelector('#inp-custo-operacional')?.addEventListener('input', (e) => {
      estado.custoOperacionalFixo = parseFloat(e.target.value) || 0;
      atualizarTotaisRapido();
    });

    raiz.querySelector('#inp-taxa-cartao')?.addEventListener('input', (e) => {
      estado.taxaCartao = parseFloat(e.target.value) || 0;
      atualizarTotaisRapido();
    });

    // 3. Slider de margem
    raiz.querySelector('#rng-margem')?.addEventListener('input', (e) => {
      estado.margemDesejada = parseFloat(e.target.value) || 0;
      renderTela();
    });

    // 4. Atalhos de margem
    raiz.querySelectorAll('[data-set-margem]').forEach((btn) => {
      btn.addEventListener('click', () => {
        estado.margemDesejada = parseFloat(btn.dataset.setMargem);
        renderTela();
      });
    });

    // 5. Insumos - alteração de campos
    raiz.querySelectorAll('#lista-insumos [data-campo]').forEach((input) => {
      input.addEventListener('input', (e) => {
        const row = e.target.closest('[data-idx]');
        if (!row) return;
        const idx = parseInt(row.dataset.idx, 10);
        const campo = e.target.dataset.campo;
        estado.insumos[idx][campo] = campo === 'nome' ? sanitizarNome(e.target.value) : e.target.value;
        atualizarTotaisRapido();
      });
    });

    // 6. Remover insumo
    raiz.querySelectorAll('[data-remover-insumo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.removerInsumo, 10);
        if (estado.insumos.length <= 1) {
          toast('A receita precisa ter ao menos um insumo.', 'alerta');
          return;
        }
        estado.insumos.splice(idx, 1);
        renderTela();
      });
    });

    // 7. Adicionar insumo
    raiz.querySelector('#btn-add-insumo')?.addEventListener('click', () => {
      estado.insumos.push({
        id: String(Date.now()),
        nome: 'Novo Ingrediente',
        qtdUsada: 1,
        unidade: 'un',
        custoCompra: 5.0,
        baseCompraQtd: 1,
        baseCompraUn: 'un'
      });
      renderTela();
    });

    // 8. Seletor de modelos rápidos
    raiz.querySelectorAll('[data-carregar-ficha]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.carregarFicha;
        const encontrada = fichas.find((f) => f.id === id || f.nome === id);
        if (encontrada) {
          estado = JSON.parse(JSON.stringify(encontrada));
          renderTela();
          toast(`Modelo carregado: ${estado.nome}`, 'sucesso');
        }
      });
    });

    // 9. Nova Ficha do Zero
    raiz.querySelector('#btn-nova-ficha')?.addEventListener('click', () => {
      estado = {
        id: `ficha-${Date.now()}`,
        nome: 'Novo Produto do Ponto',
        categoria: 'Geral',
        rendimento: 1,
        unidadeRendimento: 'un',
        margemDesejada: 60,
        taxaCartao: 2.0,
        custoOperacionalFixo: 1.0,
        custoEmbalagem: 1.0,
        insumos: [
          { id: '1', nome: 'Insumo Principal', qtdUsada: 1, unidade: 'kg', custoCompra: 15.00, baseCompraQtd: 1, baseCompraUn: 'kg' }
        ]
      };
      renderTela();
      toast('Nova ficha iniciada!', 'info');
    });

    // 10. Salvar Ficha Técnica
    raiz.querySelector('#btn-salvar-ficha')?.addEventListener('click', () => {
      const idx = fichas.findIndex((f) => f.id === estado.id || f.nome === estado.nome);
      if (idx >= 0) {
        fichas[idx] = JSON.parse(JSON.stringify(estado));
      } else {
        estado.id = `ficha-${Date.now()}`;
        fichas.push(JSON.parse(JSON.stringify(estado)));
      }
      salvarFichas(fichas);
      toast(`Ficha técnica "${estado.nome}" salva com sucesso!`, 'sucesso');
      renderTela();
    });

    // 11. Quantidade no simulador
    raiz.querySelector('#inp-qtd-simulador')?.addEventListener('input', (e) => {
      qtdSimulador = parseInt(e.target.value, 10) || 1;
      atualizarTotaisRapido();
    });

    // 12. Imprimir
    raiz.querySelector('#btn-imprimir-ficha')?.addEventListener('click', () => {
      window.print();
    });

    // 13. Compartilhar no WhatsApp
    raiz.querySelector('#btn-compartilhar-whatsapp')?.addEventListener('click', () => {
      const t = calcularTotais();
      const msg = `*FICHA TÉCNICA & FORMAÇÃO DE PREÇO — AO PONTO*
🍗 *Produto:* ${estado.nome}
💰 *Custo Unitário de Produção:* ${formatarDinheiro(t.custoTotalUnitario)}
🏷️ *Preço de Venda Sugerido:* ${formatarDinheiro(t.precoSugerido)}
📈 *Margem de Lucro:* ${estado.margemDesejada}% (Markup ${t.markup}x)
💵 *Lucro Líquido no Bolso por Unidade:* ${formatarDinheiro(t.lucroLiquidoUnitario)}

📊 *Simulação de Domingo (${qtdSimulador} unidades):*
- Faturamento Bruto: ${formatarDinheiro(t.faturamentoLote)}
- *Lucro Líquido no Bolso:* ${formatarDinheiro(t.lucroTotalLote)}

_Gerado na plataforma Ao Ponto (aoponto.app.br)_`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  function atualizarTotaisRapido() {
    renderTela();
  }

  renderTela();
}

