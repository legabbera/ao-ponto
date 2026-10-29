/**
 * MODAIS JURÍDICOS: TERMOS DE USO & POLÍTICA DE PRIVACIDADE (LGPD)
 * Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
 */
import { icone } from './icons.js';
import { abrirModal } from './ui.js';

export function abrirModalLGPD() {
  abrirModal(`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <span style="color:var(--brasa);display:grid;place-items:center;">${icone('cadeado')}</span>
      <h2 style="margin:0;font-size:20px;">Política de Privacidade & LGPD</h2>
    </div>
    <p style="font-size:13px;color:var(--texto-suave);margin-bottom:12px;">
      Em estrita conformidade com a Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018).
    </p>

    <div class="modal-legal-corpo">
      <h3>1. Nosso Compromisso com sua Privacidade</h3>
      <p>A plataforma <strong>Ao Ponto</strong> tem como princípio basilar o respeito, a transparência e a segurança das informações de todos os nossos usuários e de seus respectivos clientes finais.</p>

      <h3>2. Dados Coletados e Finalidade</h3>
      <p>Coletamos exclusivamente os dados necessários para o funcionamento e a entrega dos serviços:</p>
      <ul>
        <li><strong>Nome do Responsável:</strong> para identificação do titular da conta e personalização do atendimento.</li>
        <li><strong>Celular / WhatsApp:</strong> utilizado como identificador prioritário para login ágil e envio de comprovantes térmicos e códigos de recuperação solicitados.</li>
        <li><strong>E-mail (opcional):</strong> para comunicações formais, recuperação alternativa de conta e notificações administrativas.</li>
        <li><strong>Nome e Dados do Estabelecimento:</strong> para personalização do catálogo, pedidos e subdomínio de atendimento.</li>
        <li><strong>Dados de Vendas e Pedidos:</strong> itens comercializados, valores e horários para fins exclusivos de gestão interna do próprio estabelecimento lojista.</li>
      </ul>

      <h3>3. Não Comercialização de Dados</h3>
      <p><strong>Nós nunca vendemos, alugamos ou repassamos seus dados cadastrais ou o histórico de seus clientes para terceiros para fins de marketing.</strong> Seus dados pertencem a você e são tratados exclusivamente nos limites da prestação do serviço de gestão de vendas.</p>

      <h3>4. Segurança da Informação e Armazenamento</h3>
      <p>Adotamos medidas técnicas e organizacionais de ponta para proteger seus dados contra acessos não autorizados, perdas ou alterações:</p>
      <ul>
        <li>Tráfego 100% criptografado de ponta a ponta via protocolo seguro <strong>HTTPS / TLS</strong>.</li>
        <li>Senhas e PINs gravados com funções de dispersão criptográfica (hash irreversível).</li>
        <li>Bancos de dados com políticas de isolamento rigoroso por estabelecimento (Row Level Security).</li>
      </ul>

      <h3>5. Direitos do Titular (Art. 18 da LGPD)</h3>
      <p>Como titular dos dados pessoais, você pode a qualquer momento exercer seus direitos legais:</p>
      <ul>
        <li>Confirmar a existência de tratamento e acessar os dados arquivados.</li>
        <li>Solicitar a correção imediata de dados incompletos, inexatos ou desatualizados.</li>
        <li>Solicitar a anonimização, bloqueio ou eliminação definitiva de dados desnecessários ou excessivos.</li>
        <li>Revogar o consentimento e solicitar a exclusão total da conta do estabelecimento.</li>
      </ul>

      <h3>6. Encarregado de Dados (DPO) e Contato</h3>
      <p>Para dúvidas, requisições ou solicitações formais relativas à proteção e privacidade de dados, nosso canal oficial de comunicação é: <strong>privacidade@aoponto.app</strong>.</p>
    </div>

    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" data-fechar style="min-height:48px;">
        ${icone('check')} Entendi e estou de acordo
      </button>
    </div>
  `, (m) => {
    m.classList.add('modal-legal');
  });
}

export function abrirModalTermos() {
  abrirModal(`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
      <span style="color:var(--brasa);display:grid;place-items:center;">${icone('recibo')}</span>
      <h2 style="margin:0;font-size:20px;">Termos de Uso do Ao Ponto</h2>
    </div>
    <p style="font-size:13px;color:var(--texto-suave);margin-bottom:12px;">
      Condições gerais de contratação e uso do software SaaS.
    </p>

    <div class="modal-legal-corpo">
      <h3>1. Objeto do Serviço</h3>
      <p>A plataforma <strong>Ao Ponto</strong> é uma solução tecnológica fornecida sob a modalidade de Software como Serviço (SaaS), destinada a apoiar pequenos e médios estabelecimentos na gestão de pedidos, vendas em balcão, caixa rápido e relacionamento com clientes.</p>

      <h3>2. Planos e Condições de Uso</h3>
      <ul>
        <li><strong>Plano Comece Grátis:</strong> permite o registro de até 10 vendas por mês sem qualquer custo ou exigência de dados bancários/cartão de crédito.</li>
        <li><strong>Planos Pagos (Balcão / Ilimitado):</strong> conferem número ilimitado de vendas mensais, suporte prioritário e possibilidade de vincular domínio próprio de internet, mediante pagamento mensal contratado.</li>
      </ul>

      <h3>3. Responsabilidades do Usuário</h3>
      <p>Ao utilizar o Ao Ponto, o lojista se compromete a:</p>
      <ul>
        <li>Fornecer informações verídicas e manter seus dados de contato atualizados.</li>
        <li>Zelar pelo sigilo do seu PIN ou senha de acesso ao caixa.</li>
        <li>Utilizar o sistema em total conformidade com a legislação tributária, sanitária e comercial aplicável ao seu ramo de negócio.</li>
      </ul>

      <h3>4. Disponibilidade do Sistema</h3>
      <p>Nos empenhamos para garantir uma taxa de disponibilidade contínua de 99.5% do serviço. Manutenções programadas serão comunicadas com antecedência para minimizar impactos nas operações do estabelecimento.</p>

      <h3>5. Cancelamento e Encerramento</h3>
      <p>O usuário poderá suspender ou cancelar o uso do plano a qualquer momento através do painel de controle, sem multas rescisórias ou períodos mínimos de fidelidade.</p>
    </div>

    <div class="modal-acoes">
      <button class="btn btn-primario btn-bloco" data-fechar style="min-height:48px;">
        ${icone('check')} Fechar Termos de Uso
      </button>
    </div>
  `, (m) => {
    m.classList.add('modal-legal');
  });
}

