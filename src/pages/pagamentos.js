/**
 * TELA DE PAGAMENTOS, PROVEDORES & MAQUININHAS (Ao Ponto)
 * Integração com maquininhas Stone, PagBank, Mercado Pago, Cielo, configuração de taxas e Pix.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS } from '../data/mock.js';
import { fmtMoeda } from '../utils/format.js';
import { escapeHtml } from '../utils/sanitizar.js';

export function renderPagamentos(raiz, irPara) {
  const st = store.get();
  const tenant = store.getTenant();

  function desenhar() {
    const dadosPag = store.getPagamentos();
    const maquininhas = dadosPag.maquininhas || [];
    const taxas = dadosPag.taxas || {};
    const pix = dadosPag.pix || {};
    const vendas = store.getVendas();

    // Calcula conciliação real com base nas vendas do dia
    let brutoHoje = 0;
    let taxasHoje = 0;
    let pixTotal = 0;
    let debitoTotal = 0;
    let creditoTotal = 0;
    let dinheiroTotal = 0;

    vendas.forEach((v) => {
      const val = parseFloat(v.total) || 0;
      brutoHoje += val;
      const m = (v.pagamento?.metodo || 'dinheiro').toLowerCase();
      const calc = store.calcularTaxaELiquido(val, m);
      taxasHoje += calc.valorTaxa;

      if (m === 'pix') pixTotal += val;
      else if (m === 'debito') debitoTotal += val;
      else if (m === 'credito') creditoTotal += val;
      else dinheiroTotal += val;
    });

    const entradasCash = store.getCashEntries ? store.getCashEntries() : [];
    const totalAportesCash = entradasCash.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
    const saldoTotalDinheiro = dinheiroTotal + totalAportesCash;

    const liquidoHoje = brutoHoje - taxasHoje;

    raiz.innerHTML = `
    <div class="pagamentos-container">
      <!-- Topo -->
      <div class="clientes-topo" style="margin-bottom: 20px;">
        <div class="clientes-topo-info">
          <h1>Pagamentos, Maquininhas & Provedores 💳⚡</h1>
          <p>
            <span class="badge badge-demo">${icone('local', 'mini')} ${tenant?.nome || 'Ao Ponto Assados'}</span>
            &bull; Maquininhas de balcão (Stone, Mercado Pago, PagBank), taxas personalizadas e Pix
          </p>
        </div>
        <div class="clientes-topo-acoes" style="display: flex; flex-wrap: wrap; gap: 8px; width: 100%;">
          <button class="btn btn-primario" id="btn-adicionar-cash-topo" style="background:#16A34A; border-color:#16A34A; font-weight:700; flex: 1 1 130px; min-width: 0; justify-content: center; font-size: 13px;">
            ${icone('mais')} Adicionar Cash
          </button>
          <button class="btn btn-contorno" id="btn-nova-maquininha" style="flex: 1 1 130px; min-width: 0; justify-content: center; font-size: 13px;">
            ${icone('mais')} Conectar Maquininha
          </button>
          <button class="btn btn-contorno" id="btn-imprimir-pix-balcao" style="flex: 1 1 130px; min-width: 0; justify-content: center; font-size: 13px;">
            📋 Placa Pix
          </button>
        </div>
      </div>

      <!-- Meios de Entrada de Recursos (Máquinas, Pix e Cash) -->
      <div class="card" style="margin-bottom: 22px; padding: 18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
          <div>
            <strong style="font-size:16px; color:var(--carvao); display:block;">Entradas de Recursos do Caixa & Meios de Pagamento</strong>
            <small style="color:var(--texto-suave);">Acompanhe o faturamento por canal de entrada e registre reforços de dinheiro</small>
          </div>
          <button class="btn btn-pequeno btn-primario" id="btn-adicionar-cash" style="background:#16A34A; border-color:#16A34A; font-weight:700; padding:8px 14px;">
            ${icone('mais')} + Adicionar Cash (Dinheiro)
          </button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
          <!-- Débito -->
          <div style="background:var(--creme); border:1.5px solid var(--borda); border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:700; color:var(--texto-suave);">CARTÃO DÉBITO</span>
              <span style="font-size:18px;">💳</span>
            </div>
            <strong style="font-size:20px; color:var(--carvao); display:block;">${fmtMoeda(debitoTotal)}</strong>
            <small style="color:var(--texto-suave); font-size:11px;">Entradas via maquininhas de balcão</small>
          </div>

          <!-- Crédito -->
          <div style="background:var(--creme); border:1.5px solid var(--borda); border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:700; color:var(--texto-suave);">CARTÃO CRÉDITO</span>
              <span style="font-size:18px;">💳</span>
            </div>
            <strong style="font-size:20px; color:var(--carvao); display:block;">${fmtMoeda(creditoTotal)}</strong>
            <small style="color:var(--texto-suave); font-size:11px;">Vendas parceladas ou à vista</small>
          </div>

          <!-- Pix -->
          <div style="background:#F0FDF4; border:1.5px solid #BBF7D0; border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:700; color:#166534;">PIX INSTANTÂNEO</span>
              <span style="font-size:18px;">⚡</span>
            </div>
            <strong style="font-size:20px; color:#16A34A; display:block;">${fmtMoeda(pixTotal)}</strong>
            <small style="color:#166534; font-size:11px;">Chave oficial e QR Code</small>
          </div>

          <!-- Cash / Dinheiro -->
          <div style="background:#FEF3C7; border:1.5px solid #FCD34D; border-radius:12px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12px; font-weight:700; color:#92400E;">DINHEIRO / CASH</span>
              <span style="font-size:18px;">💵</span>
            </div>
            <strong style="font-size:20px; color:#92400E; display:block;">${fmtMoeda(saldoTotalDinheiro)}</strong>
            <small style="color:#92400E; font-size:11px;">Vendas (${fmtMoeda(dinheiroTotal)}) + Aportes (${fmtMoeda(totalAportesCash)})</small>
          </div>
        </div>

        ${entradasCash.length > 0 ? `
          <div style="margin-top:16px; border-top:1px solid var(--borda); padding-top:12px;">
            <strong style="font-size:13px; color:var(--texto-suave); display:block; margin-bottom:8px;">Últimas Entradas Manuais de Dinheiro (Cash) no Caixa:</strong>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${entradasCash.slice(0, 4).map((c) => `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; background:var(--branco); padding:8px 12px; border-radius:8px; border:1px solid var(--borda);">
                  <div>
                    <strong style="color:#16A34A;">+ ${fmtMoeda(c.valor)}</strong> &bull; <span>${escapeHtml(c.motivo)}</span>
                  </div>
                  <small style="color:var(--texto-suave);">${c.hora} por ${escapeHtml(c.operador)}</small>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- KPIs Financeiros / Conciliação de Hoje -->
      <div class="clientes-kpis" style="margin-bottom: 22px;">
        <div class="kpi-card">
          <div class="kpi-rotulo">Faturamento Bruto (Hoje)</div>
          <div class="kpi-valor" style="color: var(--carvao);">${fmtMoeda(brutoHoje)}</div>
          <div class="kpi-sub">Total de vendas registradas no balcão</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Taxas de Operação (Estimadas)</div>
          <div class="kpi-valor" style="color: #DC2626;">-${fmtMoeda(taxasHoje)}</div>
          <div class="kpi-sub">Custo de maquininhas e cartões</div>
        </div>
        <div class="kpi-card destaque-fidelidade">
          <div class="kpi-rotulo">Líquido na Conta (Lucro Real) 💰</div>
          <div class="kpi-valor" style="color: #16A34A;">${fmtMoeda(liquidoHoje)}</div>
          <div class="kpi-sub">Valor limpo a receber (${taxas.prazoRecebimento || 'D+1'})</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Maquininhas Ativas</div>
          <div class="kpi-valor" style="color: #2563EB;">${maquininhas.filter(m => m.status === 'online').length}/${maquininhas.length}</div>
          <div class="kpi-sub">Prontas no balcão e retiradas</div>
        </div>
      </div>

      <!-- Grid Principal: Provedor Ativo & Maquininhas -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 22px;">
        
        <!-- Bloco 1: Provedor Principal de Maquininhas -->
        <div class="cartao" style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--carvao);">
              Provedor Principal Ativo
            </h3>
            <span class="badge badge-sucesso">Integrado ao Balcão</span>
          </div>
          <p style="font-size: 13px; color: var(--texto-suave); margin: 0;">
            Selecione o ecossistema de pagamentos utilizado no seu ponto para sincronizar as vendas:
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${[
              { id: 'mercadopago', nome: 'Mercado Pago', desc: 'Point Pro 2 / Smart', badge: 'Recomendado' },
              { id: 'stone', nome: 'Stone', desc: 'SmartPOS S920 / TEF', badge: 'Alta Frequência' },
              { id: 'pagbank', nome: 'PagBank', desc: 'Moderninha Pro / Smart', badge: 'D+0 na hora' },
              { id: 'cielo', nome: 'Cielo / Rede', desc: 'LIO / Smart POS', badge: 'Tradicional' },
            ].map((prov) => `
              <div class="provedor-card ${dadosPag.provedorAtivo === prov.id ? 'selecionado' : ''}" data-prov="${prov.id}" style="border: 2px solid ${dadosPag.provedorAtivo === prov.id ? 'var(--brasa, #EA580C)' : 'var(--borda, #cbd5e1)'}; background: ${dadosPag.provedorAtivo === prov.id ? '#FFFBF5' : '#fff'}; border-radius: 10px; padding: 12px; cursor: pointer; transition: all .2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: var(--carvao); font-size: 13px;">${prov.nome}</strong>
                  <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${dadosPag.provedorAtivo === prov.id ? '#FFEDD5' : '#f1f5f9'}; color: ${dadosPag.provedorAtivo === prov.id ? '#C2410C' : '#64748B'}; font-weight: 700;">
                    ${prov.badge}
                  </span>
                </div>
                <small style="color: var(--texto-suave); font-size: 11px;">${prov.desc}</small>
              </div>
            `).join('')}
          </div>

          <!-- Modo de Operação do Caixa -->
          <div style="margin-top: 6px; padding: 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--borda);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13px; color: var(--carvao);">Modo TEF / SmartPOS Push:</strong>
                <small style="display: block; color: var(--texto-suave); margin-top: 2px;">
                  ${dadosPag.modoOperacao === 'tef_smartpos' ? 'Envia o valor automaticamente para a tela da maquininha' : 'Operador digita o valor manualmente na maquininha'}
                </small>
              </div>
              <button class="btn btn-pequeno btn-contorno" id="btn-alternar-modo-operacao">
                ${dadosPag.modoOperacao === 'tef_smartpos' ? 'Desativar Push' : 'Ativar Push Automático'}
              </button>
            </div>
          </div>
        </div>

        <!-- Bloco 2: Chave Pix & QR Code de Balcão -->
        <div class="cartao" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--carvao);">
              Configuração Pix do Ponto ⚡
            </h3>
            <button class="btn btn-pequeno btn-secundario" id="btn-editar-chave-pix">
              ✏️ Editar Chave
            </button>
          </div>
          <p style="font-size: 13px; color: var(--texto-suave); margin: 0;">
            Chave oficial que aparece para os clientes no caixa e nas mensagens do WhatsApp:
          </p>

          <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">
                Chave Pix (${pix.tipoChave || 'CNPJ'})
              </span>
              <span class="badge badge-sucesso" style="font-size: 10px;">Taxa 0%</span>
            </div>
            <strong style="font-family: monospace; font-size: 16px; color: var(--carvao); display: block; word-break: break-all;">
              ${pix.chave || '12.345.678/0001-90'}
            </strong>
            <small style="display: block; color: var(--texto-suave); margin-top: 4px;">
              Favorecido: <b>${pix.titular || tenant?.nome || 'Ao Ponto Assados'}</b> &bull; ${pix.cidade || 'São Paulo'}
            </small>
          </div>

          <div style="display: flex; gap: 8px; margin-top: auto; flex-wrap: wrap;">
            <button class="btn btn-bloco btn-contorno" id="btn-copiar-chave-pix" style="flex: 1 1 130px; min-width: 0; justify-content: center; font-size: 13px; padding: 10px 8px;">
              📋 Copiar Chave
            </button>
            <button class="btn btn-bloco btn-whatsapp" id="btn-ver-qr-pix" style="flex: 1 1 130px; min-width: 0; justify-content: center; font-size: 13px; padding: 10px 8px;">
              👁️ Ver QR Code
            </button>
          </div>
        </div>

      </div>

      <!-- Seção: Maquininhas de Cartão Cadastradas (Hardware) -->
      <div class="cartao" style="margin-bottom: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">
              Maquininhas no Ponto de Venda & Retirada (${maquininhas.length})
            </h3>
            <small style="color: var(--texto-suave);">Aparelhos físicos pareados para receber vendas de cartão no balcão</small>
          </div>
          <button class="btn btn-pequeno btn-primario" id="btn-add-maquininha-inline">
            ${icone('mais')} Nova Maquininha
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px; width: 100%; box-sizing: border-box;">
          ${maquininhas.map((maq) => `
            <div style="background: #FFFDF9; border: 1.5px solid var(--borda); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: transform .2s, border-color .2s; position: relative; width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 6px;">
                <div style="display: flex; gap: 12px; align-items: center; min-width: 0;">
                  <div style="width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #1E293B, #0F172A); color: #fff; display: grid; place-items: center; font-size: 20px; flex-shrink: 0;">
                    💳
                  </div>
                  <div style="min-width: 0;">
                    <strong style="font-size: 14px; color: var(--carvao); display: block; word-break: break-word;">${maq.nome}</strong>
                    <small style="color: var(--texto-suave);">${maq.modelo}</small>
                  </div>
                </div>
                <span class="badge ${maq.status === 'online' ? 'badge-sucesso' : 'badge-perigo'}" style="font-size: 10px; flex-shrink: 0;">
                  ${maq.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>

              <div style="background: var(--creme); border-radius: 8px; padding: 8px 10px; font-size: 12px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
                <span>Série: <b>${maq.serial}</b></span>
                <span>Conexão: <b>${maq.tipoConexao || 'Wi-Fi'}</b></span>
                <span>Bateria: <b>${maq.bateria || 90}% 🔋</b></span>
              </div>

              <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 6px; flex-wrap: wrap; width: 100%; box-sizing: border-box;">
                <button class="btn btn-pequeno btn-contorno btn-testar-comunicacao-maq" data-id="${maq.id}" data-nome="${maq.nome}" style="flex: 1 1 150px; min-width: 0; justify-content: center; text-align: center; font-size: 12px; padding: 8px 10px;">
                  📶 Testar Comunicação
                </button>
                <div style="display: flex; gap: 6px; align-items: center; margin-left: auto;">
                  <button class="btn btn-pequeno btn-contorno btn-editar-maq" data-id="${maq.id}" title="Editar maquininha" style="padding: 6px 10px; font-size: 12px;">
                    ✏️ Editar
                  </button>
                  <button class="btn btn-pequeno btn-texto btn-perigo-suave btn-remover-maq" data-id="${maq.id}" data-nome="${maq.nome}" title="Remover maquininha" style="padding: 6px 10px; font-size: 12px;">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Seção: Tabela de Taxas & Simulador de Custos -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; width: 100%; box-sizing: border-box;">
        
        <!-- Taxas Contratadas -->
        <div class="cartao" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--carvao);">
              Taxas Cadastradas do Seu Contrato
            </h3>
            <button class="btn btn-pequeno btn-secundario" id="btn-editar-taxas">
              ✏️ Ajustar Taxas
            </button>
          </div>
          <p style="font-size: 13px; color: var(--texto-suave); margin: 0;">
            Utilizadas para deduzir automaticamente os custos das maquininhas nos relatórios e no caixa:
          </p>

          <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
            <thead>
              <tr style="background: var(--creme); text-align: left;">
                <th style="padding: 8px 12px;">Modalidade</th>
                <th style="padding: 8px 12px;">Taxa Cobrada</th>
                <th style="padding: 8px 12px;">Recebimento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 12px;"><strong>Pix</strong> (Balcão / QR Code)</td>
                <td style="padding: 10px 12px;"><span class="badge badge-sucesso">${taxas.pix || 0}%</span></td>
                <td style="padding: 10px 12px; color: var(--texto-suave);">Imediato</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px;"><strong>Cartão de Débito</strong></td>
                <td style="padding: 10px 12px;"><span class="badge" style="background: #E2E8F0; color: var(--carvao);">${taxas.debito || 1.19}%</span></td>
                <td style="padding: 10px 12px; color: var(--texto-suave);">${taxas.prazoRecebimento || 'D+1'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px;"><strong>Crédito à Vista (1x)</strong></td>
                <td style="padding: 10px 12px;"><span class="badge" style="background: #FFEDD5; color: #C2410C;">${taxas.creditoVista || 2.89}%</span></td>
                <td style="padding: 10px 12px; color: var(--texto-suave);">${taxas.prazoRecebimento || 'D+1'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px;"><strong>Crédito Parcelado (2x a 6x)</strong></td>
                <td style="padding: 10px 12px;"><span class="badge" style="background: #FEE2E2; color: #B91C1C;">${taxas.creditoParcelado || 3.99}%</span></td>
                <td style="padding: 10px 12px; color: var(--texto-suave);">${taxas.prazoRecebimento || 'D+1'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Simulador Rápido de Venda e Líquido -->
        <div class="cartao" style="display: flex; flex-direction: column; gap: 12px;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: var(--carvao);">
            Simulador de Margem & Líquido 🧮
          </h3>
          <p style="font-size: 13px; color: var(--texto-suave); margin: 0;">
            Simule o desconto real da maquininha em uma venda de assados:
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="campo">
              <label>Valor da Venda (R$):</label>
              <input type="number" id="sim-valor-venda" class="input" value="65.00" step="5" />
            </div>
            <div class="campo">
              <label>Forma de Pagamento:</label>
              <select id="sim-forma-pgto" class="select">
                <option value="pix">Pix (0%)</option>
                <option value="debito">Débito (${taxas.debito}%)</option>
                <option value="credito" selected>Crédito 1x (${taxas.creditoVista}%)</option>
                <option value="parcelado">Crédito Parcelado (${taxas.creditoParcelado}%)</option>
                <option value="dinheiro">Dinheiro (0%)</option>
              </select>
            </div>
          </div>

          <div id="sim-resultado-box" style="background: #FFFBF5; border: 1.5px solid #FED7AA; border-radius: 10px; padding: 14px; margin-top: auto;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
              <span>Valor Bruto Cobrado:</span>
              <strong id="sim-res-bruto">R$ 65,00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #DC2626;">
              <span>Desconto da Maquininha:</span>
              <strong id="sim-res-taxa">- R$ 1,88 (2.89%)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dashed #FED7AA; font-size: 15px; color: #16A34A;">
              <span>Líquido na sua Conta:</span>
              <strong id="sim-res-liquido">R$ 63,12</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
    `;

    vincularEventos();
  }

  function vincularEventos() {
    // Nova Maquininha
    raiz.querySelector('#btn-nova-maquininha')?.addEventListener('click', () => {
      abrirModalNovaMaquininha(() => desenhar());
    });
    raiz.querySelector('#btn-add-maquininha-inline')?.addEventListener('click', () => {
      abrirModalNovaMaquininha(() => desenhar());
    });

    // Seleção de Provedor
    raiz.querySelectorAll('.provedor-card').forEach((card) => {
      card.addEventListener('click', () => {
        const prov = card.dataset.prov;
        store.atualizarConfigPagamentos({ provedorAtivo: prov });
        toast(`Provedor principal alterado para ${card.querySelector('strong').textContent}!`, 'sucesso');
        desenhar();
      });
    });

    // Alternar Modo de Operação (TEF SmartPOS vs Manual)
    raiz.querySelector('#btn-alternar-modo-operacao')?.addEventListener('click', () => {
      const cfg = store.getPagamentos();
      const novoModo = cfg.modoOperacao === 'tef_smartpos' ? 'manual' : 'tef_smartpos';
      store.atualizarConfigPagamentos({ modoOperacao: novoModo });
      toast(`Modo alterado para: ${novoModo === 'tef_smartpos' ? 'Push Automático SmartPOS' : 'Digitação Manual na Maquininha'}!`, 'info');
      desenhar();
    });

    // Editar Chave Pix
    raiz.querySelector('#btn-editar-chave-pix')?.addEventListener('click', () => {
      abrirModalEditarPix(() => desenhar());
    });

    // Copiar Chave Pix
    raiz.querySelector('#btn-copiar-chave-pix')?.addEventListener('click', () => {
      const pix = store.getPagamentos().pix || {};
      navigator.clipboard?.writeText(pix.chave || '');
      toast('Chave Pix copiada para a área de transferência!', 'sucesso');
    });

    // Ver QR Code Pix
    raiz.querySelector('#btn-ver-qr-pix')?.addEventListener('click', () => {
      abrirModalQrCodePix();
    });

    // Placa de Balcão Pix
    raiz.querySelector('#btn-imprimir-pix-balcao')?.addEventListener('click', () => {
      abrirModalPlacaBalcao();
    });

    // Editar Taxas
    raiz.querySelector('#btn-editar-taxas')?.addEventListener('click', () => {
      abrirModalEditarTaxas(() => desenhar());
    });

    // Testar Comunicação com Maquininha
    raiz.querySelectorAll('.btn-testar-comunicacao-maq').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nome = btn.dataset.nome;
        simularEnvioMaquininha(nome);
      });
    });

    // Editar Maquininha
    raiz.querySelectorAll('.btn-editar-maq').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const maq = (store.getPagamentos().maquininhas || []).find((m) => m.id === id);
        if (maq) abrirModalEditarMaquininha(maq, () => desenhar());
      });
    });

    // Remover Maquininha
    raiz.querySelectorAll('.btn-remover-maq').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const nome = btn.dataset.nome;
        if (confirm(`Remover maquininha "${nome}"?`)) {
          store.removerMaquininha(id);
          toast(`Maquininha "${nome}" desconectada.`, 'info');
          desenhar();
        }
      });
    });

    // Adicionar Cash (Entrada Manual / Suprimento)
    raiz.querySelector('#btn-adicionar-cash')?.addEventListener('click', () => {
      abrirModalAdicionarCash(() => desenhar());
    });
    raiz.querySelector('#btn-adicionar-cash-topo')?.addEventListener('click', () => {
      abrirModalAdicionarCash(() => desenhar());
    });

    // Simulador de Margem dinâmico
    const inputVal = raiz.querySelector('#sim-valor-venda');
    const selMetodo = raiz.querySelector('#sim-forma-pgto');
    const atualizarSimulador = () => {
      const v = parseFloat(inputVal?.value) || 0;
      const m = selMetodo?.value || 'credito';
      const calc = store.calcularTaxaELiquido(v, m);

      const elBruto = raiz.querySelector('#sim-res-bruto');
      const elTaxa = raiz.querySelector('#sim-res-taxa');
      const elLiquido = raiz.querySelector('#sim-res-liquido');

      if (elBruto) elBruto.textContent = fmtMoeda(calc.valorBruto);
      if (elTaxa) elTaxa.textContent = `- ${fmtMoeda(calc.valorTaxa)} (${calc.taxaPercentual}%)`;
      if (elLiquido) elLiquido.textContent = fmtMoeda(calc.valorLiquido);
    };

    inputVal?.addEventListener('input', atualizarSimulador);
    selMetodo?.addEventListener('change', atualizarSimulador);
  }

  desenhar();
}

// ── Modais Interativos de Pagamentos ──

function abrirModalNovaMaquininha(onSalvar) {
  abrirModal({
    titulo: 'Conectar Nova Maquininha de Cartão 💳',
    html: `
      <div class="form-modal-maquininha">
        <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 14px;">
          Cadastre o aparelho físico (Smart POS ou maquininha sem fio) para receber pagamentos do caixa:
        </p>

        <div class="campo">
          <label>Identificação / Apelido no Caixa: *</label>
          <input type="text" id="nova-maq-nome" class="input" placeholder="Ex: Maquininha Balcão 1, Retirada Motoqueiro..." autofocus />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Modelo do Aparelho: *</label>
            <select id="nova-maq-modelo" class="select">
              <option value="Mercado Pago Point Pro 2">Mercado Pago Point Pro 2</option>
              <option value="Mercado Pago Point Smart">Mercado Pago Point Smart</option>
              <option value="Stone Smart POS S920">Stone Smart POS S920</option>
              <option value="Stone POS P2">Stone POS P2</option>
              <option value="PagBank Moderninha Pro">PagBank Moderninha Pro</option>
              <option value="PagBank Moderninha Smart">PagBank Moderninha Smart</option>
              <option value="Cielo LIO Smart">Cielo LIO Smart</option>
              <option value="Maquininha Genérica">Maquininha Genérica / Outro</option>
            </select>
          </div>
          <div class="campo">
            <label>Número de Série (S/N):</label>
            <input type="text" id="nova-maq-serial" class="input" placeholder="Ex: PAX-882194" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Tipo de Conexão:</label>
            <select id="nova-maq-conexao" class="select">
              <option value="Wi-Fi / 4G">Wi-Fi / 4G Chip</option>
              <option value="Wi-Fi">Apenas Wi-Fi</option>
              <option value="Bluetooth">Bluetooth (Pareada ao PC/Celular)</option>
            </select>
          </div>
          <div class="campo">
            <label>Unidade / Ponto de Venda:</label>
            <select id="nova-maq-ponto" class="select">
              <option value="todos">Todas as Unidades</option>
              ${PONTOS.map((p) => `<option value="${p.id}">${p.nome}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
          <button type="button" class="btn btn-primario" id="btn-confirmar-add-maq">
            ${icone('mais')} Conectar Aparelho
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-confirmar-add-maq')?.addEventListener('click', () => {
        const nome = el.querySelector('#nova-maq-nome')?.value.trim();
        const modelo = el.querySelector('#nova-maq-modelo')?.value;
        const serial = el.querySelector('#nova-maq-serial')?.value.trim() || `SN-${Math.floor(1000 + Math.random() * 9000)}`;
        const tipoConexao = el.querySelector('#nova-maq-conexao')?.value;
        const ponto = el.querySelector('#nova-maq-ponto')?.value;

        if (!nome) return toast('Informe um nome ou apelido para a maquininha.', 'erro');

        store.adicionarMaquininha({ nome, modelo, serial, tipoConexao, ponto });
        toast(`Maquininha "${nome}" conectada com sucesso!`, 'sucesso');
        fechar();
        onSalvar?.();
      });
    },
  });
}

function abrirModalEditarMaquininha(maq, onSalvar) {
  abrirModal({
    titulo: `Editar: ${maq.nome}`,
    html: `
      <div class="form-modal-maquininha">
        <div class="campo">
          <label>Identificação / Apelido:</label>
          <input type="text" id="edit-maq-nome" class="input" value="${maq.nome}" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Modelo:</label>
            <input type="text" id="edit-maq-modelo" class="input" value="${maq.modelo}" />
          </div>
          <div class="campo">
            <label>Número de Série:</label>
            <input type="text" id="edit-maq-serial" class="input" value="${maq.serial}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Status:</label>
            <select id="edit-maq-status" class="select">
              <option value="online" ${maq.status === 'online' ? 'selected' : ''}>🟢 Online e Pronta</option>
              <option value="offline" ${maq.status === 'offline' ? 'selected' : ''}>🔴 Offline (Desativada)</option>
            </select>
          </div>
          <div class="campo">
            <label>Conexão:</label>
            <input type="text" id="edit-maq-conexao" class="input" value="${maq.tipoConexao || 'Wi-Fi'}" />
          </div>
        </div>

        <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
          <button type="button" class="btn btn-primario" id="btn-confirmar-edit-maq">
            Salvar Alterações
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-confirmar-edit-maq')?.addEventListener('click', () => {
        const nome = el.querySelector('#edit-maq-nome')?.value.trim();
        const modelo = el.querySelector('#edit-maq-modelo')?.value.trim();
        const serial = el.querySelector('#edit-maq-serial')?.value.trim();
        const status = el.querySelector('#edit-maq-status')?.value;
        const tipoConexao = el.querySelector('#edit-maq-conexao')?.value.trim();

        if (!nome) return toast('O nome não pode ficar vazio.', 'erro');

        store.atualizarMaquininha(maq.id, { nome, modelo, serial, status, tipoConexao });
        toast('Dados da maquininha atualizados!', 'sucesso');
        fechar();
        onSalvar?.();
      });
    },
  });
}

function abrirModalEditarTaxas(onSalvar) {
  const taxas = store.getPagamentos().taxas || {};
  abrirModal({
    titulo: 'Ajustar Taxas Contratadas da sua Maquininha ⚙️',
    html: `
      <div class="form-modal-taxas">
        <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 14px;">
          Informe as taxas exatas acordadas com o seu provedor (Stone, PagBank, Mercado Pago, etc.):
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="campo">
            <label>Taxa de Débito (%):</label>
            <input type="number" id="taxa-debito" class="input" value="${taxas.debito || 1.19}" step="0.01" />
          </div>
          <div class="campo">
            <label>Taxa Crédito à Vista 1x (%):</label>
            <input type="number" id="taxa-credito-vista" class="input" value="${taxas.creditoVista || 2.89}" step="0.01" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Taxa Crédito Parcelado (%):</label>
            <input type="number" id="taxa-credito-parc" class="input" value="${taxas.creditoParcelado || 3.99}" step="0.01" />
          </div>
          <div class="campo">
            <label>Taxa Pix Maquininha (%):</label>
            <input type="number" id="taxa-pix" class="input" value="${taxas.pix || 0.00}" step="0.01" />
          </div>
        </div>

        <div class="campo" style="margin-top: 10px;">
          <label>Prazo de Recebimento na Conta:</label>
          <select id="taxa-prazo" class="select">
            <option value="Na hora" ${taxas.prazoRecebimento === 'Na hora' ? 'selected' : ''}>Na hora (Instantâneo)</option>
            <option value="D+1" ${taxas.prazoRecebimento === 'D+1' ? 'selected' : ''}>D+1 (1 dia útil - Padrão)</option>
            <option value="D+14" ${taxas.prazoRecebimento === 'D+14' ? 'selected' : ''}>D+14 (14 dias corridos)</option>
            <option value="D+30" ${taxas.prazoRecebimento === 'D+30' ? 'selected' : ''}>D+30 (30 dias corridos)</option>
          </select>
        </div>

        <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
          <button type="button" class="btn btn-primario" id="btn-salvar-taxas">
            Salvar Taxas
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-salvar-taxas')?.addEventListener('click', () => {
        const debito = parseFloat(el.querySelector('#taxa-debito')?.value) || 0;
        const creditoVista = parseFloat(el.querySelector('#taxa-credito-vista')?.value) || 0;
        const creditoParcelado = parseFloat(el.querySelector('#taxa-credito-parc')?.value) || 0;
        const pix = parseFloat(el.querySelector('#taxa-pix')?.value) || 0;
        const prazoRecebimento = el.querySelector('#taxa-prazo')?.value;

        store.atualizarConfigPagamentos({
          taxas: { debito, creditoVista, creditoParcelado, pix, prazoRecebimento },
        });

        toast('Taxas das maquininhas atualizadas com sucesso!', 'sucesso');
        fechar();
        onSalvar?.();
      });
    },
  });
}

function abrirModalEditarPix(onSalvar) {
  const pix = store.getPagamentos().pix || {};
  abrirModal({
    titulo: 'Configurar Chave Pix do Balcão ⚡',
    html: `
      <div class="form-modal-pix">
        <div class="campo">
          <label>Tipo de Chave:</label>
          <select id="pix-tipo" class="select">
            <option value="cnpj" ${pix.tipoChave === 'cnpj' ? 'selected' : ''}>CNPJ</option>
            <option value="cpf" ${pix.tipoChave === 'cpf' ? 'selected' : ''}>CPF</option>
            <option value="celular" ${pix.tipoChave === 'celular' ? 'selected' : ''}>Celular / Telefone</option>
            <option value="email" ${pix.tipoChave === 'email' ? 'selected' : ''}>E-mail</option>
            <option value="aleatoria" ${pix.tipoChave === 'aleatoria' ? 'selected' : ''}>Chave Aleatória (EVP)</option>
          </select>
        </div>

        <div class="campo" style="margin-top: 10px;">
          <label>Chave Pix: *</label>
          <input type="text" id="pix-chave" class="input" value="${pix.chave || ''}" placeholder="Cole sua chave aqui..." />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Nome do Favorecido / Razão Social:</label>
            <input type="text" id="pix-titular" class="input" value="${pix.titular || ''}" placeholder="Ex: Ao Ponto Assados Ltda" />
          </div>
          <div class="campo">
            <label>Cidade do Estabelecimento:</label>
            <input type="text" id="pix-cidade" class="input" value="${pix.cidade || 'São Paulo'}" />
          </div>
        </div>

        <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
          <button type="button" class="btn btn-primario" id="btn-salvar-pix">
            Salvar Dados Pix
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-salvar-pix')?.addEventListener('click', () => {
        const tipoChave = el.querySelector('#pix-tipo')?.value;
        const chave = el.querySelector('#pix-chave')?.value.trim();
        const titular = el.querySelector('#pix-titular')?.value.trim();
        const cidade = el.querySelector('#pix-cidade')?.value.trim();

        if (!chave) return toast('Informe a chave Pix.', 'erro');

        store.atualizarConfigPagamentos({
          pix: { ...pix, tipoChave, chave, titular, cidade },
        });

        toast('Chave Pix atualizada!', 'sucesso');
        fechar();
        onSalvar?.();
      });
    },
  });
}

function abrirModalQrCodePix() {
  const pix = store.getPagamentos().pix || {};
  abrirModal({
    titulo: 'QR Code Pix do Balcão ⚡',
    html: `
      <div style="text-align: center; padding: 10px;">
        <div style="width: 220px; height: 220px; margin: 0 auto 14px; background: #fff; border: 2px solid var(--borda); border-radius: 12px; display: grid; place-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
          <!-- QR Code Simulado SVG -->
          <svg viewBox="0 0 100 100" width="180" height="180">
            <rect width="100" height="100" fill="white"/>
            <rect x="10" y="10" width="25" height="25" fill="#000"/>
            <rect x="15" y="15" width="15" height="15" fill="#fff"/>
            <rect x="18" y="18" width="9" height="9" fill="#000"/>
            
            <rect x="65" y="10" width="25" height="25" fill="#000"/>
            <rect x="70" y="15" width="15" height="15" fill="#fff"/>
            <rect x="73" y="18" width="9" height="9" fill="#000"/>
            
            <rect x="10" y="65" width="25" height="25" fill="#000"/>
            <rect x="15" y="70" width="15" height="15" fill="#fff"/>
            <rect x="18" y="73" width="9" height="9" fill="#000"/>

            <rect x="42" y="15" width="8" height="8" fill="#000"/>
            <rect x="52" y="25" width="6" height="6" fill="#000"/>
            <rect x="40" y="40" width="20" height="20" fill="#EA580C" rx="4"/>
            <text x="50" y="54" font-size="12" fill="#fff" text-anchor="middle" font-weight="bold">⚡</text>

            <rect x="65" y="48" width="6" height="12" fill="#000"/>
            <rect x="75" y="55" width="14" height="6" fill="#000"/>
            <rect x="45" y="72" width="12" height="6" fill="#000"/>
            <rect x="62" y="72" width="10" height="16" fill="#000"/>
            <rect x="80" y="78" width="10" height="10" fill="#000"/>
          </svg>
        </div>

        <strong style="font-size: 16px; color: var(--carvao); display: block;">${pix.titular || 'Ao Ponto Assados'}</strong>
        <span style="font-family: monospace; font-size: 14px; color: #166534; font-weight: 700; display: block; margin-top: 4px;">
          ${pix.chave || 'Chave Pix'}
        </span>
        <small style="color: var(--texto-suave); display: block; margin-top: 6px;">
          O cliente abre o app do banco, aponta a câmera e transfere na hora sem taxas.
        </small>

        <div style="margin-top: 18px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-contorno" data-fechar>Fechar</button>
          <a href="/placa-pix.html?print=true" target="_blank" class="btn btn-primario" style="text-decoration:none; display:inline-flex; align-items:center;">
            🖨️ Imprimir Placa A4
          </a>
        </div>
      </div>
    `,
  });
}

function abrirModalPlacaBalcao() {
  const pix = store.getPagamentos().pix || {};
  const tenant = store.getTenant();
  const nomeLoja = tenant?.nome || 'Ao Ponto Assados';
  const chavePix = pix.chave || '12.345.678/0001-90';

  abrirModal({
    titulo: 'Placa de Balcão para Impressão 🖨️',
    html: `
      <div id="placa-balcao-impressao" style="text-align: center; border: 3px solid #C2410C; border-radius: 16px; padding: 20px; background: #FFFBF5; margin: 8px 0;">
        <span style="font-size: 32px; display: block; margin-bottom: 4px;">🍗</span>
        <h2 style="margin: 0; color: #C2410C; font-size: 20px; font-weight: 900; text-transform: uppercase;">
          ${escapeHtml(nomeLoja)}
        </h2>
        <p style="margin: 4px 0 14px; font-size: 13px; font-weight: 800; color: #166534; text-transform: uppercase;">
          ⚡ PAGAMENTO INSTANTÂNEO VIA PIX
        </p>

        <div style="width: 180px; height: 180px; margin: 0 auto 12px; background: #fff; border: 1.5px solid #FED7AA; border-radius: 12px; display: grid; place-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); padding: 8px;">
          <svg viewBox="0 0 100 100" width="160" height="160">
            <rect width="100" height="100" fill="white"/>
            <rect x="10" y="10" width="25" height="25" fill="#000"/>
            <rect x="15" y="15" width="15" height="15" fill="#fff"/>
            <rect x="18" y="18" width="9" height="9" fill="#000"/>
            <rect x="65" y="10" width="25" height="25" fill="#000"/>
            <rect x="70" y="15" width="15" height="15" fill="#fff"/>
            <rect x="73" y="18" width="9" height="9" fill="#000"/>
            <rect x="10" y="65" width="25" height="25" fill="#000"/>
            <rect x="15" y="70" width="15" height="15" fill="#fff"/>
            <rect x="18" y="73" width="9" height="9" fill="#000"/>
            <rect x="40" y="40" width="20" height="20" fill="#EA580C" rx="4"/>
            <text x="50" y="54" font-size="12" fill="#fff" text-anchor="middle" font-weight="bold">⚡</text>
            <rect x="65" y="48" width="6" height="12" fill="#000"/>
            <rect x="75" y="55" width="14" height="6" fill="#000"/>
            <rect x="45" y="72" width="12" height="6" fill="#000"/>
            <rect x="62" y="72" width="10" height="16" fill="#000"/>
          </svg>
        </div>

        <div style="background: #fff; border: 1.5px dashed #C2410C; border-radius: 8px; padding: 10px; margin: 10px auto; max-width: 320px;">
          <small style="color: var(--texto-suave); font-size: 11px; text-transform: uppercase; font-weight:700;">Chave Pix (${pix.tipoChave ? pix.tipoChave.toUpperCase() : 'CNPJ'}):</small>
          <strong style="display: block; font-family: monospace; font-size: 15px; color: var(--carvao); word-break: break-all; margin: 2px 0;">
            ${escapeHtml(chavePix)}
          </strong>
          <small style="color: var(--texto-suave); font-size: 12px;">Favorecido: <b>${escapeHtml(pix.titular || nomeLoja)}</b></small>
        </div>

        <small style="color: var(--texto-suave); font-weight: 600; display: block; font-size: 12px; line-height: 1.3;">
          Aponte a câmera do seu celular no aplicativo do banco e confirme o valor!
        </small>
      </div>

      <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
        <a href="/placa-pix.html?print=true" target="_blank" class="btn btn-primario btn-bloco" id="btn-abrir-placa-print" style="text-decoration:none; display:flex; align-items:center; justify-content:center; padding:12px; font-size:14px;">
          🖨️ Abrir & Imprimir Placa A4 (Display)
        </a>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-contorno" id="btn-copiar-chave-placa" style="flex:1; justify-content:center; font-size:13px;">
            📋 Copiar Chave
          </button>
          <button type="button" class="btn btn-fantasma" data-fechar style="flex:1; justify-content:center; font-size:13px;">
            Fechar
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-copiar-chave-placa')?.addEventListener('click', () => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(chavePix);
          } else {
            const ta = document.createElement('textarea');
            ta.value = chavePix;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          toast('Chave Pix copiada com sucesso!', 'sucesso');
        } catch (e) {
          toast('Chave: ' + chavePix, 'info');
        }
      });
    }
  });
}

function simularEnvioMaquininha(nomeMaq) {
  abrirModal({
    titulo: `Comunicação: ${nomeMaq} 📶`,
    html: `
      <div style="text-align: center; padding: 16px;">
        <div style="width: 140px; height: 190px; margin: 0 auto 16px; background: #0F172A; border-radius: 16px; padding: 12px; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.25); display: flex; flex-direction: column; justify-content: space-between;">
          <div style="background: #1E293B; border-radius: 6px; padding: 8px; text-align: center;">
            <span style="font-size: 10px; color: #94A3B8; text-transform: uppercase;">Ao Ponto TEF</span><br/>
            <strong style="font-size: 15px; color: #4ADE80;">R$ 1,00</strong>
          </div>
          <div style="font-size: 26px; animation: pulse 1s infinite;">📶</div>
          <small style="color: #64748B; font-size: 9px;">Insira ou aproxime o cartão</small>
        </div>

        <strong style="font-size: 15px; color: #166534; display: block;">Sinal enviado com 100% de sucesso!</strong>
        <p style="font-size: 13px; color: var(--texto-suave); margin: 6px 0 16px;">
          A maquininha respondeu em <b>84ms</b>. Pronta para receber comandos diretos do balcão.
        </p>

        <button class="btn btn-primario" data-fechar>Fechar</button>
      </div>
    `,
  });
}

function abrirModalAdicionarCash(onConcluir) {
  const perfil = store.perfil();
  const st = store.get();
  const isDemo = store.isDemo ? store.isDemo() : (!st.usuario || st.usuario.id === 'user_demo');
  const nomePadrao = (!isDemo && st.usuario?.nome) ? st.usuario.nome : (perfil?.nome || 'Operador do Caixa');

  abrirModal(`
    <div style="max-width:440px; text-align:left;">
      <div style="text-align:center; margin-bottom:16px;">
        <div style="width:48px; height:48px; border-radius:12px; background:#DCFCE7; color:#16A34A; display:inline-flex; align-items:center; justify-content:center; margin-bottom:8px; font-size:24px;">
          💵
        </div>
        <h3 style="font-size:18px; font-weight:800; color:var(--carvao); margin:0 0 4px 0;">Adicionar Entrada de Cash (Dinheiro)</h3>
        <p style="font-size:13px; color:var(--texto-suave); margin:0;">
          Registre suprimento de troco inicial ou entrada em espécie no caixa
        </p>
      </div>

      <form id="form-novo-cash">
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">Valor em Dinheiro (R$) *</label>
            <input type="number" id="cash-valor" step="0.50" min="0.50" class="input" placeholder="Ex: 100.00" required style="font-size:16px; font-weight:700;" />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">Motivo / Descrição *</label>
            <input type="text" id="cash-motivo" class="input" placeholder="Ex: Fundo de troco inicial, Reforço de moedas..." required />
          </div>
          <div>
            <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">Operador Responsável *</label>
            <input type="text" id="cash-operador" class="input" value="${escapeHtml(nomePadrao)}" placeholder="Nome do operador" required />
          </div>
        </div>

        <div class="modal-acoes" style="flex-direction:column; gap:8px;">
          <button type="submit" class="btn btn-primario btn-bloco" style="background:#16A34A; border-color:#16A34A; font-weight:700; padding:12px;">
            Confirmar Entrada no Caixa
          </button>
          <button type="button" class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
        </div>
      </form>
    </div>
  `, (modal, fechar) => {
    modal.querySelector('#form-novo-cash')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const valor = parseFloat(modal.querySelector('#cash-valor')?.value) || 0;
      const motivo = modal.querySelector('#cash-motivo')?.value.trim();
      const operador = modal.querySelector('#cash-operador')?.value.trim() || nomePadrao;
      if (valor <= 0 || !motivo) return;

      store.adicionarCash({ valor, motivo, operador });
      fechar();
      toast(`Entrada de R$ ${valor.toFixed(2)} adicionada ao caixa por ${operador}! 💵`, 'sucesso');
      onConcluir?.();
    });
  });
}

