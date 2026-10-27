/**
 * TELA DE PLANOS — Comparativo e upgrade
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { buscarPlanos, upgradePlano } from '../services/api.js';
import { store } from '../state/store.js';

export async function renderPlanos(raiz, irPara) {
  raiz.innerHTML = `<div class="planos-carregando"><span class="spinner" style="border-color:var(--brasa);border-top-color:transparent;width:32px;height:32px"></span></div>`;

  const [planos, tenant] = await Promise.all([
    buscarPlanos(),
    Promise.resolve(store.getTenant()),
  ]);

  const planoAtual = tenant?.plano || 'plano-00';
  const vendasUsadas = tenant?.vendasMesAtual || 0;
  const planoObj = planos.find((p) => p.id === planoAtual);
  const limite = planoObj?.limiteVendasMes;
  const restam = limite !== null ? Math.max(0, limite - vendasUsadas) : null;

  raiz.innerHTML = `
  <div class="planos-pg">
    <div class="planos-header">
      <h1>Planos</h1>
      <p class="planos-sub">Escolha o plano ideal para o seu negócio.</p>
      ${planoAtual === 'plano-00' && limite !== null ? `
        <div class="planos-uso-barra">
          <div class="planos-uso-info">
            <span>${icone('vendas')} Vendas este mês</span>
            <strong>${vendasUsadas} / ${limite}</strong>
          </div>
          <div class="barra-progresso">
            <div class="barra-fill ${vendasUsadas >= limite ? 'barra-cheia' : ''}"
                 style="width: ${Math.min(100, (vendasUsadas / limite) * 100)}%"></div>
          </div>
          ${restam === 0
            ? `<p class="planos-alerta-limite">⚠️ Limite atingido! Faça upgrade para continuar vendendo.</p>`
            : `<p class="planos-uso-restam">${restam} venda${restam === 1 ? '' : 's'} restante${restam === 1 ? '' : 's'} este mês.</p>`
          }
        </div>
      ` : ''}
    </div>

    <div class="planos-grid">
      ${planos.map((p) => cartaoPlano(p, planoAtual)).join('')}
    </div>

    <div class="planos-faq">
      <h2>Dúvidas frequentes</h2>
      <div class="faq-item">
        <strong>O plano gratuito expira?</strong>
        <p>Não. Você pode usar o plano gratuito para sempre, com o limite de 10 vendas por mês.</p>
      </div>
      <div class="faq-item">
        <strong>O que é domínio personalizado?</strong>
        <p>No plano pago, você pode usar seu próprio domínio (ex.: seunegocio.com.br) apontando para o seu app.</p>
      </div>
      <div class="faq-item">
        <strong>Posso cancelar quando quiser?</strong>
        <p>Sim. O plano pago é mensal e você pode cancelar a qualquer momento.</p>
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
      ${isPago ? `<span class="plano-valor">R$ 79</span><span class="plano-periodo">,00/mês</span>`
               : `<span class="plano-valor">Grátis</span>`}
    </div>
    <div class="plano-limite">
      ${plano.limiteVendasMes !== null
        ? `${plano.limiteVendasMes} vendas/mês`
        : `<strong>Vendas ilimitadas</strong>`}
    </div>
    <ul class="plano-recursos">
      ${plano.recursos.map((r) => `<li>${icone('confirmado')} <span>${r}</span></li>`).join('')}
    </ul>
    ${ativo
      ? `<div class="plano-atual-badge">✅ Seu plano atual</div>`
      : isPago
        ? `<button class="btn btn-primario btn-bloco" data-upgrade="${plano.id}" id="btn-upgrade-${plano.id}">
             Fazer upgrade
           </button>`
        : `<button class="btn btn-contorno btn-bloco" disabled>Plano gratuito</button>`
    }
  </div>`;
}

function confirmarUpgrade(planoId, irPara) {
  abrirModal(`
    <h2>Fazer upgrade para Balcão</h2>
    <p>Você será cobrado <strong>R$ 79,00/mês</strong>. Pode cancelar quando quiser.</p>
    <div class="aviso-demo">${icone('info')}<span><strong>Simulação:</strong> nenhum pagamento real será efetuado.</span></div>
    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" id="btn-confirmar-upgrade">
        <span class="spinner" id="spinner-upgrade" style="display:none"></span>
        Confirmar upgrade (simulação)
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
        toast('🎉 Upgrade realizado! Você agora tem o plano Balcão.', 'sucesso');
        irPara('planos');
      } catch (err) {
        fechar();
        toast('Erro ao processar upgrade: ' + err.message, 'erro');
      }
    });
  });
}
