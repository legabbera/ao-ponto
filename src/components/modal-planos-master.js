/**
 * MODAL DE GESTÃO DE PLANOS & DESCONTOS RELÂMPAGO — MASTER SAAS
 * Permite ao Dono da Plataforma alterar valores e disparar promoções relâmpago.
 */
import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';
import {
  getPlanosConfig,
  salvarPlanosConfig,
  aplicarDescontoRelampagoEmLote,
  desativarTodosDescontosRelampago,
  redefinirPlanosPadrao,
} from '../data/tenants.js';
import { fmtMoeda } from '../utils/format.js';
import { escapeHtml, sanitizarNome, sanitizarTexto } from '../utils/sanitizar.js';

export function abrirModalPlanosMaster(aoAtualizar) {
  let planos = JSON.parse(JSON.stringify(getPlanosConfig()));

  function calcularEconomia(normal, promo) {
    if (!promo || promo >= normal) return '';
    const diff = normal - promo;
    const perc = Math.round((diff / normal) * 100);
    return `⚡ Desconto de ${perc}% (Economia de ${fmtMoeda(diff)}/mês para o cliente)`;
  }

  function desenharHtml() {
    const balcao = planos['plano-01'];
    const trial = planos['plano-00'];
    const redes = planos['plano-02'];

    const balcaoPromoAtivo = !!balcao.descontoRelampago?.ativo;
    const redesPromoAtivo = !!redes?.descontoRelampago?.ativo;

    return `
    <div class="modal-planos-master" style="max-width: 640px; font-size: 13.5px; color: var(--texto);">
      <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; border-bottom:1px solid var(--borda, #eee); padding-bottom:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:22px;">👑</span>
            <h2 style="margin:0; font-size:18px; color:var(--carvao, #222);">Planos & Descontos Relâmpago</h2>
          </div>
          <p style="margin:4px 0 0; color:var(--texto-suave); font-size:12.5px;">
            Altere mensalidades e crie promoções relâmpago para toda a rede em tempo real.
          </p>
        </div>
      </div>

      <!-- Barra de Ações Rápidas (1 Clique) -->
      <div style="background:#FFF8F3; border:1px solid #FED7AA; border-radius:10px; padding:10px 12px; margin-bottom:16px;">
        <div style="font-weight:700; color:#C2410C; font-size:12px; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
          ⚡ ATALHOS RÁPIDOS DE PROMOÇÃO:
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <button type="button" class="btn btn-pequeno btn-primario" id="btn-lote-30" style="padding:5px 10px; font-size:12px;">
            ⚡ Ativar -30% em Todos os Planos
          </button>
          <button type="button" class="btn btn-pequeno btn-contorno" id="btn-lote-desativar" style="padding:5px 10px; font-size:12px; color:#DC2626; border-color:#FECACA;">
            🛑 Desativar Todos os Descontos
          </button>
          <button type="button" class="btn btn-pequeno btn-fantasma" id="btn-restaurar-padroes" style="padding:5px 8px; font-size:12px; color:var(--texto-suave);">
            🔄 Restaurar Padrões (R$ 79)
          </button>
        </div>
      </div>

      <!-- Grade dos Planos -->
      <div style="display:flex; flex-direction:column; gap:14px; max-height:55vh; overflow-y:auto; padding-right:4px;">
        
        <!-- CARD 1: PLANO BALCÃO (CARRO-CHEFE) -->
        <div class="card-plano-edit" style="border:1.5px solid ${balcaoPromoAtivo ? 'var(--brasa, #E26A3B)' : 'var(--borda, #E5E0D8)'}; border-radius:12px; padding:14px; background:#fff; position:relative;">
          ${balcaoPromoAtivo ? `<span class="badge" style="position:absolute; top:10px; right:12px; background:var(--brasa); color:#fff; font-size:11px; font-weight:700;">⚡ DESCONTO RELÂMPAGO ATIVO</span>` : ''}
          
          <div style="font-weight:700; font-size:15px; color:var(--brasa); margin-bottom:6px;">
            🍗 ${escapeHtml(balcao.nome)} (Plano Oficial)
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:11.5px; font-weight:600; color:var(--texto-suave); display:block; margin-bottom:4px;">Preço Padrão Normal (R$/mês)</label>
              <input type="number" step="1" id="inp-balcao-preco" class="input input-sm font-bold" value="${balcao.preco}" style="font-size:14px;" />
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:600; color:var(--texto-suave); display:block; margin-bottom:4px;">Dia de Vencimento</label>
              <input type="text" class="input input-sm" value="Dia 10 (Padrão SaaS)" disabled style="background:#f9f9f9;" />
            </div>
          </div>

          <!-- Bloco do Desconto Relâmpago -->
          <div style="background:${balcaoPromoAtivo ? '#FFFBF5' : '#F8F6F2'}; border:1px dashed ${balcaoPromoAtivo ? '#F97316' : '#DDD'}; border-radius:8px; padding:10px; margin-top:8px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; color:${balcaoPromoAtivo ? '#C2410C' : 'var(--texto)'}; margin-bottom:8px;">
              <input type="checkbox" id="chk-balcao-promo" ${balcaoPromoAtivo ? 'checked' : ''} style="accent-color:var(--brasa); width:16px; height:16px;" />
              <span>⚡ Ativar Desconto Relâmpago no Plano Balcão</span>
            </label>

            <div id="box-balcao-promo-campos" style="display:${balcaoPromoAtivo ? 'block' : 'none'};">
              <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:10px; margin-bottom:8px;">
                <div>
                  <label style="font-size:11px; font-weight:600; color:#B45309; display:block; margin-bottom:2px;">Preço Promocional (R$)</label>
                  <input type="number" step="1" id="inp-balcao-promo-preco" class="input input-sm font-bold" value="${balcao.descontoRelampago?.precoPromocional || 49}" style="color:#D9481C; font-size:14px;" />
                </div>
                <div>
                  <label style="font-size:11px; font-weight:600; color:#B45309; display:block; margin-bottom:2px;">Etiqueta / Badge Visual</label>
                  <input type="text" id="inp-balcao-promo-tag" class="input input-sm" value="${escapeHtml(balcao.descontoRelampago?.tagBadge || '⚡ FLASH SALE -38%')}" placeholder="Ex: ⚡ FLASH SALE" />
                </div>
              </div>
              <div>
                <label style="font-size:11px; font-weight:600; color:#B45309; display:block; margin-bottom:2px;">Mensagem de Urgência / Validade</label>
                <input type="text" id="inp-balcao-promo-valido" class="input input-sm" value="${escapeHtml(balcao.descontoRelampago?.validoAte || 'Válido até domingo às 23:59')}" placeholder="Ex: Válido até domingo às 23:59" />
              </div>
              <div id="lbl-balcao-economia" style="font-size:11.5px; font-weight:700; color:#10B981; margin-top:6px;">
                ${calcularEconomia(balcao.preco, balcao.descontoRelampago?.precoPromocional)}
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: PLANO COMECE GRÁTIS (30 DIAS) -->
        <div class="card-plano-edit" style="border:1.5px solid var(--borda, #E5E0D8); border-radius:12px; padding:14px; background:#fff;">
          <div style="font-weight:700; font-size:15px; color:var(--verde); margin-bottom:6px;">
            🎉 ${escapeHtml(trial.nome)}
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-size:11.5px; font-weight:600; color:var(--texto-suave); display:block; margin-bottom:4px;">Dias de Teste Grátis (Trial)</label>
              <input type="number" id="inp-trial-dias" class="input input-sm font-bold" value="${trial.diasTrial || 30}" min="7" max="60" />
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:600; color:var(--texto-suave); display:block; margin-bottom:4px;">Cobrança pós-trial (R$/mês no dia 10)</label>
              <input type="number" id="inp-trial-pos" class="input input-sm font-bold" value="${trial.valorMensalidadeAposTrial || 79}" />
            </div>
          </div>
        </div>

        <!-- CARD 3: PLANO REDES & FRANQUIAS -->
        <div class="card-plano-edit" style="border:1.5px solid ${redesPromoAtivo ? '#F59E0B' : 'var(--borda, #E5E0D8)'}; border-radius:12px; padding:14px; background:#fff; position:relative;">
          ${redesPromoAtivo ? `<span class="badge" style="position:absolute; top:10px; right:12px; background:#D97706; color:#fff; font-size:11px; font-weight:700;">⚡ DESCONTO RELÂMPAGO ATIVO</span>` : ''}
          <div style="font-weight:700; font-size:15px; color:#B45309; margin-bottom:6px;">
            🏢 ${escapeHtml(redes.nome)}
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="font-size:11.5px; font-weight:600; color:var(--texto-suave); display:block; margin-bottom:4px;">Preço Padrão Redes (R$/mês)</label>
              <input type="number" step="1" id="inp-redes-preco" class="input input-sm font-bold" value="${redes.preco || 149}" />
            </div>
            <div>
              <label style="font-size:11.5px; font-weight:600; color:var(--texto-suave); display:block; margin-bottom:4px;">Preço Promocional Relâmpago (R$)</label>
              <input type="number" step="1" id="inp-redes-promo-preco" class="input input-sm font-bold" value="${redes.descontoRelampago?.precoPromocional || 99}" style="color:#D9481C;" />
            </div>
          </div>
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; font-size:12px; color:var(--texto);">
            <input type="checkbox" id="chk-redes-promo" ${redesPromoAtivo ? 'checked' : ''} style="accent-color:#D97706;" />
            <span>Ativar desconto relâmpago no plano de Redes</span>
          </label>
        </div>

      </div>

      <!-- Rodapé do Modal -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; border-top:1px solid var(--borda, #eee); padding-top:12px;">
        <button type="button" class="btn btn-contorno" data-fechar style="padding:8px 16px;">
          Cancelar
        </button>
        <button type="button" class="btn btn-primario" id="btn-salvar-planos-master" style="padding:8px 20px;">
          ${icone('check')} Salvar e Publicar na Rede
        </button>
      </div>
    </div>
    `;
  }

  abrirModal({
    titulo: '',
    html: desenharHtml(),
    aoAbrir: (elModal, fecharModal) => {
      // Toggle da exibição dos campos de promoção balcão
      const chkBalcao = elModal.querySelector('#chk-balcao-promo');
      const boxBalcao = elModal.querySelector('#box-balcao-promo-campos');
      chkBalcao?.addEventListener('change', () => {
        boxBalcao.style.display = chkBalcao.checked ? 'block' : 'none';
      });

      // Cálculo dinâmico da economia
      const inpPreco = elModal.querySelector('#inp-balcao-preco');
      const inpPromo = elModal.querySelector('#inp-balcao-promo-preco');
      const lblEco = elModal.querySelector('#lbl-balcao-economia');
      function recalcular() {
        const pNorm = parseFloat(inpPreco.value) || 79;
        const pProm = parseFloat(inpPromo.value) || 49;
        lblEco.textContent = calcularEconomia(pNorm, pProm);
      }
      inpPreco?.addEventListener('input', recalcular);
      inpPromo?.addEventListener('input', recalcular);

      // Botão lote -30%
      elModal.querySelector('#btn-lote-30')?.addEventListener('click', () => {
        aplicarDescontoRelampagoEmLote(30);
        toast('⚡ Desconto relâmpago de 30% ativado em todos os planos com sucesso!', 'sucesso');
        fecharModal();
        aoAtualizar?.();
      });

      // Botão desativar todos os descontos
      elModal.querySelector('#btn-lote-desativar')?.addEventListener('click', () => {
        desativarTodosDescontosRelampago();
        toast('🛑 Todos os descontos relâmpago foram desativados. Preços normais restabelecidos.', 'info');
        fecharModal();
        aoAtualizar?.();
      });

      // Botão restaurar padrões
      elModal.querySelector('#btn-restaurar-padroes')?.addEventListener('click', () => {
        if (confirm('Deseja restaurar as configurações de preços originais de fábrica (Balcão R$ 79 / Trial 30d)?')) {
          redefinirPlanosPadrao();
          toast('Padrões originais restaurados com sucesso!', 'sucesso');
          fecharModal();
          aoAtualizar?.();
        }
      });

      // Salvar formulário customizado
      elModal.querySelector('#btn-salvar-planos-master')?.addEventListener('click', () => {
        const balcaoPreco = parseFloat(elModal.querySelector('#inp-balcao-preco').value) || 79;
        const balcaoPromoAtivo = elModal.querySelector('#chk-balcao-promo').checked;
        const balcaoPromoPreco = parseFloat(elModal.querySelector('#inp-balcao-promo-preco').value) || 49;
        const balcaoPromoTag = sanitizarNome(elModal.querySelector('#inp-balcao-promo-tag').value, 30);
        const balcaoPromoValido = sanitizarTexto(elModal.querySelector('#inp-balcao-promo-valido').value, 60);

        const trialDias = parseInt(elModal.querySelector('#inp-trial-dias').value, 10) || 30;
        const trialPos = parseFloat(elModal.querySelector('#inp-trial-pos').value) || 79;

        const redesPreco = parseFloat(elModal.querySelector('#inp-redes-preco').value) || 149;
        const redesPromoAtivo = elModal.querySelector('#chk-redes-promo').checked;
        const redesPromoPreco = parseFloat(elModal.querySelector('#inp-redes-promo-preco').value) || 99;

        const cfg = getPlanosConfig();

        // Atualiza Balcão
        cfg['plano-01'].preco = balcaoPreco;
        cfg['plano-01'].precoFormatado = `R$ ${balcaoPreco.toFixed(2).replace('.', ',')}/mês`;
        cfg['plano-01'].descontoRelampago = {
          ativo: balcaoPromoAtivo,
          precoPromocional: balcaoPromoPreco,
          tagBadge: balcaoPromoTag || '⚡ FLASH SALE',
          validoAte: balcaoPromoValido || 'Por tempo limitado',
          titulo: `⚡ Oferta Relâmpago por R$ ${balcaoPromoPreco.toFixed(2).replace('.', ',')}/mês!`,
        };

        // Atualiza Trial
        cfg['plano-00'].diasTrial = trialDias;
        cfg['plano-00'].nome = `Comece Grátis (${trialDias} dias)`;
        cfg['plano-00'].precoFormatado = `Grátis por ${trialDias} dias`;
        cfg['plano-00'].valorMensalidadeAposTrial = trialPos;

        // Atualiza Redes
        if (cfg['plano-02']) {
          cfg['plano-02'].preco = redesPreco;
          cfg['plano-02'].precoFormatado = `R$ ${redesPreco.toFixed(2).replace('.', ',')}/mês`;
          cfg['plano-02'].descontoRelampago = {
            ativo: redesPromoAtivo,
            precoPromocional: redesPromoPreco,
            tagBadge: '⚡ REDES VIP',
            validoAte: 'Por tempo limitado',
            titulo: `⚡ Condição Especial para Redes por R$ ${redesPromoPreco.toFixed(2).replace('.', ',')}/mês!`,
          };
        }

        salvarPlanosConfig(cfg);
        toast('Planos e descontos atualizados e publicados com sucesso para toda a plataforma! 🎉', 'sucesso');
        fecharModal();
        aoAtualizar?.();
      });
    }
  });
}

