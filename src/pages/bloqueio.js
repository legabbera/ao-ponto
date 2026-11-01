/**
 * TELA DE BLOQUEIO POR FALTA DE PAGAMENTO DA MENSALIDADE
 * Exibida aos lojistas quando o Dono da Plataforma suspende o acesso por inadimplência.
 */
import { store } from '../state/store.js';
import { sair } from '../components/shell.js';

export function renderBloqueioMensalidade(raiz, irPara) {
  const tenant = store.getTenant();
  const motivo = tenant?.bloqueioMotivo || 'Mensalidade da plataforma pendente de pagamento.';

  raiz.innerHTML = `
    <div style="min-height: 100vh; background: #0F172A; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: 'Montserrat', system-ui, sans-serif; color: #fff;">
      
      <div style="max-width: 520px; width: 100%; background: #1E293B; border: 2px solid #DC2626; border-radius: 16px; padding: 36px 30px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        
        <div style="width: 72px; height: 72px; background: rgba(220, 38, 38, 0.15); border: 2px solid #DC2626; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 20px; font-size: 32px;">
          🛑
        </div>

        <h1 style="font-size: 22px; font-weight: 800; color: #FCA5A5; margin-bottom: 8px;">
          Acesso Temporariamente Suspenso
        </h1>
        <strong style="display: block; font-size: 15px; color: #E2E8F0; margin-bottom: 16px;">
          ${tenant?.nome || 'Assadeira Cliente'}
        </strong>

        <div style="background: rgba(0, 0, 0, 0.25); border-left: 4px solid #DC2626; border-radius: 6px; padding: 14px 16px; text-align: left; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #CBD5E1;">
          <b>Motivo informado pela administração:</b><br/>
          ${motivo}
        </div>

        <p style="font-size: 14px; color: #94A3B8; margin-bottom: 26px; line-height: 1.5;">
          Para restabelecer imediatamente o controle de vendas, reservas e automações do seu estabelecimento, fale com o suporte da plataforma para confirmar o pagamento.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="https://wa.me/5511987654321?text=Ol%C3%A1,%20gostaria%20de%20regularizar%20a%20mensalidade%20da%20minha%20assadeira%20no%20Ao%20Ponto!" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 10px; background: #16A34A; color: #fff; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 700; font-size: 15px; transition: background .2s;">
            <span>📲</span> Regularizar via WhatsApp
          </a>

          <button id="btn-sair-bloqueio" style="background: transparent; border: 1px solid #475569; color: #94A3B8; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">
            🚪 Sair da Conta
          </button>
        </div>

      </div>

    </div>
  `;

  raiz.querySelector('#btn-sair-bloqueio')?.addEventListener('click', () => {
    sair(irPara);
  });
}
