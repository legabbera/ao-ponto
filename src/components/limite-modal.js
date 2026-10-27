/**
 * MODAL DE LIMITE DE VENDAS ATINGIDO
 * Exibido quando o tenant no plano gratuito tenta registrar
 * uma venda além do limite do mês.
 */
import { abrirModal } from './ui.js';
import { PLANOS } from '../data/tenants.js';

/**
 * Exibe o modal de limite atingido e chama irPara('planos') se o
 * usuário clicar em "Ver planos".
 * @param {function} irPara
 * @param {object} tenant
 */
export function exibirModalLimite(irPara, tenant) {
  const plano = PLANOS[tenant?.plano || 'plano-00'];
  const limite = plano.limiteVendasMes;

  abrirModal(`
    <div class="limite-modal-icone">🚫</div>
    <h2>Limite do mês atingido</h2>
    <p>
      Você utilizou todas as <strong>${limite} vendas gratuitas</strong> deste mês.
      Para continuar registrando vendas, faça upgrade para um plano pago.
    </p>
    <div class="limite-plano-card">
      <div class="limite-plano-nome">🔥 Plano Balcão</div>
      <div class="limite-plano-preco">R$ 79,00<span>/mês</span></div>
      <ul class="limite-plano-lista">
        <li>✅ Vendas ilimitadas</li>
        <li>✅ Domínio personalizado</li>
        <li>✅ Suporte por e-mail</li>
      </ul>
    </div>
    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" id="btn-ver-planos">
        Ver planos e fazer upgrade
      </button>
      <button class="btn btn-fantasma btn-bloco" data-fechar>Agora não</button>
    </div>
  `, (m, fechar) => {
    m.querySelector('#btn-ver-planos').addEventListener('click', () => {
      fechar();
      irPara('planos');
    });
  });
}
