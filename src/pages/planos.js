/**
 * TELA DE PLANOS — Comparativo e upgrade
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { buscarPlanos, upgradePlano } from '../services/api.js';
import { store } from '../state/store.js';
import { diasTrialRestantes, getPlanosConfig, temDescontoRelampagoAtivo } from '../data/tenants.js';
import { escapeHtml } from '../utils/sanitizar.js';

export async function renderPlanos(raiz, irPara) {
  raiz.innerHTML = `<div class="planos-carregando"><span class="spinner" style="border-color:var(--brasa);border-top-color:transparent;width:32px;height:32px"></span></div>`;

  const [planos, tenant] = await Promise.all([
    buscarPlanos(),
    Promise.resolve(store.getTenant()),
  ]);

  const planoAtual = tenant?.plano || 'plano-00';
  const diasRestantes = diasTrialRestantes(tenant);
  const diasUsados = Math.max(0, 30 - diasRestantes);

  raiz.innerHTML = `
  <div class="planos-pg">
    <div class="planos-header">
      <h1>Planos</h1>
      <p class="planos-sub">Escolha o plano ideal para a sua assadeira & balcão.</p>

      ${planoAtual === 'plano-00' ? `
        <div class="planos-uso-barra" style="border-left: 4px solid var(--verde); padding: 1rem 1.25rem;">
          <div class="planos-uso-info" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="display:flex; align-items:center; gap:0.5rem; font-weight:600;">
              ${icone('calendario')} Período de teste grátis (30 dias)
            </span>
            <strong style="color:var(--verde); font-size:16px;">${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} restante${diasRestantes === 1 ? '' : 's'}</strong>
          </div>
          <div class="barra-progresso" style="height:10px; background:var(--creme-medio); border-radius:5px; overflow:hidden;">
            <div class="barra-fill"
                 style="width: ${Math.min(100, (diasUsados / 30) * 100)}%; background: var(--verde); height:100%;"></div>
          </div>
          <p class="planos-uso-restam" style="margin-top:0.6rem; font-size:13px; color:var(--texto-suave);">
            Aproveite todas as vendas e pedidos ilimitados durante o teste. Após os 30 dias, a mensalidade será de <strong>R$ 79,00/mês</strong> com vencimento todo <strong>dia 10</strong> de cada mês.
          </p>
        </div>
      ` : `
        <div class="planos-uso-barra" style="border-left: 4px solid var(--brasa); padding: 1rem 1.25rem;">
          <div class="planos-uso-info" style="display:flex; justify-content:space-between; align-items:center;">
            <span style="display:flex; align-items:center; gap:0.5rem; font-weight:600;">
              ${icone('confirmado')} Plano Balcão Ativo
            </span>
            <strong style="color:var(--brasa); font-size:16px;">Vendas Ilimitadas</strong>
          </div>
          <p class="planos-uso-restam" style="margin-top:0.5rem; font-size:13px; color:var(--texto-suave);">
            Sua mensalidade é de <strong>R$ 79,00/mês</strong> com vencimento programado todo <strong>dia 10</strong> de cada mês.
          </p>
        </div>
      `}
    </div>

    <div class="planos-grid">
      ${planos.map((p) => cartaoPlano(p, planoAtual)).join('')}
    </div>

    <div class="planos-faq">
      <h2>Dúvidas frequentes</h2>
      <div class="faq-item">
        <strong>Como funciona o período Comece Grátis por 30 dias?</strong>
        <p>Ao criar sua conta, você tem 30 dias de uso completo e irrestrito da plataforma sem pagar nada. Suas vendas e pedidos são 100% liberados durante esse período de teste.</p>
      </div>
      <div class="faq-item">
        <strong>Quanto custa e quando vence após os 30 dias?</strong>
        <p>Após o término dos 30 dias de teste grátis, o valor da mensalidade é de <strong>R$ 79,00</strong>, com pagamento todo <strong>dia 10 de cada mês</strong>.</p>
      </div>
      <div class="faq-item">
        <strong>O que é domínio personalizado?</strong>
        <p>No plano Balcão, você pode conectar seu próprio endereço na web (ex.: <em>suaassadeira.com.br</em>) direto na sua loja online e cardápio.</p>
      </div>
      <div class="faq-item">
        <strong>Posso cancelar quando quiser?</strong>
        <p>Sim. A assinatura não tem fidelidade nem carência. Você tem total liberdade para pausar ou cancelar a qualquer momento.</p>
      </div>
    </div>
  </div>`;

  // Eventos dos botões de upgrade
  raiz.querySelectorAll('[data-upgrade]').forEach((btn) => {
    btn.addEventListener('click', () => confirmarUpgrade(btn.dataset.upgrade, irPara));
  });

  // Re-renderiza reativamente se o Dono da Plataforma alterar planos no Master
  window.addEventListener('ao-ponto:planos-atualizados', () => {
    renderPlanos(raiz, irPara);
  }, { once: true });
}

function cartaoPlano(plano, planoAtual) {
  const ativo = plano.id === planoAtual;
  const isPago = plano.preco > 0;
  const temPromo = isPago && plano.descontoRelampago?.ativo && plano.descontoRelampago?.precoPromocional < plano.preco;
  const precoEfetivo = temPromo ? plano.descontoRelampago.precoPromocional : plano.preco;

  return `
  <div class="plano-card ${plano.destaque || temPromo ? 'plano-destaque' : ''} ${ativo ? 'plano-ativo' : ''}" style="${temPromo ? 'border-color:var(--brasa);box-shadow:0 6px 20px rgba(226,106,59,0.18);' : ''}">
    ${temPromo
      ? `<div class="plano-badge-recomendado" style="background:linear-gradient(135deg, #EF4444, #D9481C);">${escapeHtml(plano.descontoRelampago.tagBadge || '⚡ DESCONTO RELÂMPAGO')}</div>`
      : (plano.destaque ? '<div class="plano-badge-recomendado">Mais popular</div>' : '')
    }
    <div class="plano-nome">${escapeHtml(plano.nome)}</div>
    <div class="plano-preco">
      ${temPromo ? `
        <div style="display:flex; flex-direction:column; gap:2px;">
          <del style="color:var(--texto-suave); font-size:14px; font-weight:600;">De R$ ${plano.preco.toFixed(2).replace('.', ',')}</del>
          <div style="display:flex; align-items:baseline; gap:4px;">
            <span class="plano-valor" style="color:var(--brasa); font-size:32px;">R$ ${Math.floor(precoEfetivo)}</span>
            <span class="plano-periodo">,${String((precoEfetivo % 1).toFixed(2)).slice(2)}/mês</span>
          </div>
          ${plano.descontoRelampago.validoAte ? `
            <small style="color:#C2410C; font-size:11px; font-weight:700; display:block; margin-top:2px;">
              🔥 ${escapeHtml(plano.descontoRelampago.validoAte)}
            </small>
          ` : ''}
        </div>
      ` : isPago
        ? `<span class="plano-valor">R$ ${Math.floor(plano.preco)}</span><span class="plano-periodo">,${String((plano.preco % 1).toFixed(2)).slice(2)}/mês</span>`
        : `<span class="plano-valor">Grátis</span><span class="plano-periodo"> por ${plano.diasTrial || 30} dias</span>`
      }
    </div>
    <div class="plano-limite">
      ${isPago
        ? `<strong>Vendas ilimitadas</strong><br><small style="color:var(--texto-suave)">Vencimento todo dia 10</small>`
        : `<strong>${plano.diasTrial || 30} dias de teste grátis</strong><br><small style="color:var(--texto-suave)">Depois R$ ${(plano.valorMensalidadeAposTrial || 79).toFixed(2).replace('.', ',')}/mês no dia 10</small>`
      }
    </div>
    <ul class="plano-recursos">
      ${plano.recursos.map((r) => `<li>${icone('confirmado')} <span>${escapeHtml(r)}</span></li>`).join('')}
    </ul>
    ${ativo
      ? `<div class="plano-atual-badge">✅ Seu plano atual</div>`
      : isPago
        ? `<button class="btn btn-primario btn-bloco" data-upgrade="${plano.id}" id="btn-upgrade-${plano.id}">
             ${temPromo ? `Aproveitar Desconto: R$ ${precoEfetivo.toFixed(2).replace('.', ',')}/mês` : 'Ativar Plano Balcão'}
           </button>`
        : `<button class="btn btn-contorno btn-bloco" disabled>Plano de teste</button>`
    }
  </div>`;
}

function confirmarUpgrade(planoId, irPara) {
  const cfg = getPlanosConfig();
  const pl = cfg[planoId] || {};
  const temPromo = pl.descontoRelampago?.ativo && pl.descontoRelampago?.precoPromocional < pl.preco;
  const preco = temPromo ? pl.descontoRelampago.precoPromocional : (pl.preco || 79);

  abrirModal(`
    <h2>Assinar ${escapeHtml(pl.nome || 'Plano Balcão')}</h2>
    <p>
      ${temPromo ? `
        <span class="badge" style="background:#FFF8F3; border:1px solid #FED7AA; color:#C2410C; font-weight:700; margin-bottom:8px; display:inline-block;">
          ${escapeHtml(pl.descontoRelampago.tagBadge || '⚡ DESCONTO RELÂMPAGO APLICADO')}
        </span><br>
        Preço promocional especial: <strong>R$ ${preco.toFixed(2).replace('.', ',')}/mês</strong> com vencimento no <strong>dia 10</strong>.
      ` : `
        Você terá acesso ilimitado por <strong>R$ ${preco.toFixed(2).replace('.', ',')}/mês</strong> com vencimento todo <strong>dia 10</strong>.
      `}
      Pode cancelar quando quiser.
    </p>
    <div class="aviso-demo">${icone('info')}<span><strong>Simulação:</strong> nenhum pagamento real será debitado agora.</span></div>
    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" id="btn-confirmar-upgrade">
        <span class="spinner" id="spinner-upgrade" style="display:none"></span>
        Confirmar assinatura (${temPromo ? `R$ ${preco.toFixed(2).replace('.', ',')}/mês` : 'simulação'})
      </button>
      <button class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
    </div>
  `, async (m, fechar) => {
    m.querySelector('#btn-confirmar-upgrade').addEventListener('click', async () => {
      const btn = m.querySelector('#btn-confirmar-upgrade');
      const sp = m.querySelector('#spinner-upgrade');
      btn.disabled = true;
      sp.style.display = 'inline-block';
      btn.childNodes[btn.childNodes.length - 1].textContent = ' Processando...';

      try {
        const tenant = await upgradePlano(planoId);
        store.set({ tenant });
        store.refreshTenant();
        fechar();
        toast('🎉 Assinatura ativada! Você agora tem o plano Balcão.', 'sucesso');
        irPara('planos');
      } catch (err) {
        fechar();
        toast('Erro ao processar upgrade: ' + err.message, 'erro');
      }
    });
  });
}
