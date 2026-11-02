/**
 * TELA DE PLANOS — Comparativo e upgrade
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { buscarPlanos, upgradePlano } from '../services/api.js';
import { store } from '../state/store.js';
import { diasTrialRestantes } from '../data/tenants.js';

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
}

function cartaoPlano(plano, planoAtual) {
  const ativo = plano.id === planoAtual;
  const isPago = plano.preco > 0;

  return `
  <div class="plano-card ${plano.destaque ? 'plano-destaque' : ''} ${ativo ? 'plano-ativo' : ''}">
    ${plano.destaque ? '<div class="plano-badge-recomendado">Mais popular</div>' : ''}
    <div class="plano-nome">${plano.nome}</div>
    <div class="plano-preco">
      ${isPago
        ? `<span class="plano-valor">R$ 79</span><span class="plano-periodo">,00/mês</span>`
        : `<span class="plano-valor">Grátis</span><span class="plano-periodo"> por 30 dias</span>`
      }
    </div>
    <div class="plano-limite">
      ${isPago
        ? `<strong>Vendas ilimitadas</strong><br><small style="color:var(--texto-suave)">Vencimento todo dia 10</small>`
        : `<strong>30 dias de teste grátis</strong><br><small style="color:var(--texto-suave)">Depois R$ 79,00/mês no dia 10</small>`
      }
    </div>
    <ul class="plano-recursos">
      ${plano.recursos.map((r) => `<li>${icone('confirmado')} <span>${r}</span></li>`).join('')}
    </ul>
    ${ativo
      ? `<div class="plano-atual-badge">✅ Seu plano atual</div>`
      : isPago
        ? `<button class="btn btn-primario btn-bloco" data-upgrade="${plano.id}" id="btn-upgrade-${plano.id}">
             Ativar Plano Balcão
           </button>`
        : `<button class="btn btn-contorno btn-bloco" disabled>Plano de teste</button>`
    }
  </div>`;
}

function confirmarUpgrade(planoId, irPara) {
  abrirModal(`
    <h2>Assinar Plano Balcão</h2>
    <p>Você terá acesso ilimitado por <strong>R$ 79,00/mês</strong> com vencimento todo <strong>dia 10</strong>. Pode cancelar quando quiser.</p>
    <div class="aviso-demo">${icone('info')}<span><strong>Simulação:</strong> nenhum pagamento real será debitado agora.</span></div>
    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" id="btn-confirmar-upgrade">
        <span class="spinner" id="spinner-upgrade" style="display:none"></span>
        Confirmar assinatura (simulação)
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
