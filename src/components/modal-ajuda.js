/**
 * MODAIS DE SUPORTE E SUGESTÕES DE MELHORIAS
 * Disponíveis no menu lateral da loja operacional e no menu mobile
 */
import { abrirModal, toast } from './ui.js';
import { icone } from './icons.js';
import { store } from '../state/store.js';
import { salvarLead, getNumeroWhatsAppDestino } from '../services/leads.js';
import { escapeHtml } from '../utils/sanitizar.js';

export function abrirModalSuporte() {
  const usuario = store.get().usuario;
  const perfil = store.perfil();
  const tenant = store.getTenant();
  const nomeUsuario = usuario?.nome || perfil?.nome || 'Operador';
  const nomeLoja = tenant?.nome || 'Meu Ponto';
  const telLoja = usuario?.celular || usuario?.celularFormatado || '';
  const numWhatsDestino = getNumeroWhatsAppDestino();

  abrirModal(`
    <div style="text-align:left; max-width:440px;">
      <div style="text-align:center; margin-bottom:18px;">
        <div style="width:52px; height:52px; border-radius:14px; background:#DCFCE7; color:#16A34A; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;">
          ${icone('suporte', 'ic-verde')}
        </div>
        <h3 style="font-size:20px; font-weight:800; color:var(--carvao); margin:0 0 4px 0;">
          Suporte Ao Ponto
        </h3>
        <p style="font-size:13px; color:var(--texto-suave); margin:0;">
          Atendimento direto com nossa equipe para dúvidas, ajuda na operação ou solicitações técnicas.
        </p>
      </div>

      <div style="background:var(--creme); border-radius:12px; padding:12px 14px; margin-bottom:16px; font-size:13px; line-height:1.4;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:var(--texto-suave);">Ponto / Loja:</span>
          <strong>${escapeHtml(nomeLoja)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:var(--texto-suave);">Solicitante:</span>
          <strong>${escapeHtml(nomeUsuario)}</strong>
        </div>
      </div>

      <form id="form-suporte-loja">
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">
            Qual é a sua dúvida ou necessidade? (Opcional)
          </label>
          <textarea id="suporte-mensagem" class="input" rows="3" placeholder="Ex: Preciso de ajuda para configurar balança, adicionar produtos ou dúvidas sobre o fechamento..." style="resize:vertical; min-height:75px; font-size:13px;"></textarea>
        </div>

        <div class="modal-acoes" style="flex-direction:column; gap:8px;">
          <button type="submit" class="btn btn-primario btn-bloco" id="btn-enviar-suporte" style="background:#16A34A; border-color:#16A34A; font-weight:700; font-size:14px; padding:12px;">
            ${icone('whatsapp', 'mini')} Iniciar Conversa no WhatsApp
          </button>
          <button type="button" class="btn btn-fantasma btn-bloco" data-fechar style="font-size:13px;">
            Voltar à Loja
          </button>
        </div>
      </form>
    </div>
  `, (modal, fechar) => {
    const form = modal.querySelector('#form-suporte-loja');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msgTexto = modal.querySelector('#suporte-mensagem')?.value.trim();
      const btn = modal.querySelector('#btn-enviar-suporte');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Conectando ao WhatsApp...';
      }

      const mensagemCompleta = `*SUPORTE AO PONTO*\n` +
        `Olá equipe! Preciso de ajuda com o sistema Ao Ponto.\n\n` +
        `🏪 *Loja / Ponto:* ${nomeLoja}\n` +
        `👤 *Responsável:* ${nomeUsuario}\n` +
        (msgTexto ? `💬 *Assunto / Dúvida:* ${msgTexto}\n` : '') +
        `\n_Enviado direto da loja operacional_`;

      const waUrl = `https://api.whatsapp.com/send?phone=${numWhatsDestino}&text=${encodeURIComponent(mensagemCompleta)}`;

      try {
        await salvarLead({
          nome: nomeUsuario,
          whatsapp: telLoja || 'Não informado',
          tipoNegocio: nomeLoja,
          cidade: '',
          mensagem: `[CHAMADO DE SUPORTE] ${msgTexto || 'Solicitou suporte via WhatsApp'}`,
          origem: 'suporte_operacional'
        });
      } catch (_) {}

      window.open(waUrl, '_blank');
      fechar();
      toast('Abrindo WhatsApp do Suporte! 🎧', 'sucesso');
    });
  });
}

export function abrirModalSugestoes() {
  const usuario = store.get().usuario;
  const perfil = store.perfil();
  const tenant = store.getTenant();
  const nomeUsuario = usuario?.nome || perfil?.nome || 'Operador';
  const nomeLoja = tenant?.nome || 'Meu Ponto';
  const telLoja = usuario?.celular || usuario?.celularFormatado || '';
  const numWhatsDestino = getNumeroWhatsAppDestino();

  abrirModal(`
    <div style="text-align:left; max-width:460px;">
      <div style="text-align:center; margin-bottom:18px;">
        <div style="width:52px; height:52px; border-radius:14px; background:#FEF3C7; color:#D97706; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;">
          ${icone('lampada')}
        </div>
        <h3 style="font-size:20px; font-weight:800; color:var(--carvao); margin:0 0 4px 0;">
          Sugestões de Melhorias
        </h3>
        <p style="font-size:13px; color:var(--texto-suave); margin:0;">
          Sua ideia é fundamental para evoluir o Ao Ponto! Conte o que você gostaria de ver no sistema.
        </p>
      </div>

      <form id="form-sugestao-loja">
        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">
            Área da Melhoria *
          </label>
          <select id="sugestao-categoria" class="input" required style="font-size:13px;">
            <option value="Controle de Vendas & Balcão">Controle de Vendas & Balcão</option>
            <option value="Pedidos & Reservas de Fim de Semana">Pedidos & Reservas de Fim de Semana</option>
            <option value="Nova Funcionalidade / Recurso">Nova Funcionalidade / Recurso</option>
            <option value="Melhoria de Visual ou Usabilidade">Melhoria de Visual ou Usabilidade</option>
            <option value="Relatórios & Fechamento Financeiro">Relatórios & Fechamento Financeiro</option>
            <option value="Outra Ideia">Outra Ideia</option>
          </select>
        </div>

        <div style="margin-bottom:14px;">
          <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">
            Descreva sua sugestão em detalhes *
          </label>
          <textarea id="sugestao-descricao" class="input" rows="4" placeholder="Ex: Seria ótimo se no balcão tivesse um atalho para... ou se a lista de pedidos pudesse..." required style="resize:vertical; min-height:85px; font-size:13px;"></textarea>
        </div>

        <div class="modal-acoes" style="flex-direction:column; gap:8px;">
          <button type="submit" class="btn btn-primario btn-bloco" id="btn-enviar-sugestao" style="font-weight:700; font-size:14px; padding:12px;">
            🚀 Enviar Sugestão de Melhoria
          </button>
          <button type="button" class="btn btn-fantasma btn-bloco" data-fechar style="font-size:13px;">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `, (modal, fechar) => {
    const form = modal.querySelector('#form-sugestao-loja');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const categoria = modal.querySelector('#sugestao-categoria')?.value;
      const descricao = modal.querySelector('#sugestao-descricao')?.value.trim();
      const btn = modal.querySelector('#btn-enviar-sugestao');

      if (!descricao) return;

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      }

      try {
        await salvarLead({
          nome: nomeUsuario,
          whatsapp: telLoja || 'Não informado',
          tipoNegocio: nomeLoja,
          cidade: '',
          mensagem: `[SUGESTÃO - ${categoria}]: ${descricao}`,
          origem: 'sugestao_melhoria'
        });

        modal.innerHTML = `
          <div style="text-align:center; padding:12px 6px;">
            <div style="font-size:42px; margin-bottom:8px;">💡🎉</div>
            <h3 style="font-size:20px; font-weight:800; color:var(--carvao); margin:0 0 6px 0;">
              Muito obrigado pela sugestão!
            </h3>
            <p style="font-size:13px; color:var(--texto-suave); margin:0 0 16px 0; line-height:1.4;">
              Sua ideia foi enviada com sucesso para a equipe de desenvolvimento do Ao Ponto e será analisada para os próximos lançamentos.
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <button class="btn btn-primario btn-bloco" id="btn-zap-reforcar-sugestao" style="background:#16A34A; border-color:#16A34A; font-size:13px;">
                ${icone('whatsapp', 'mini')} Compartilhar também no WhatsApp
              </button>
              <button class="btn btn-contorno btn-bloco" data-fechar style="font-size:13px;">
                Fechar
              </button>
            </div>
          </div>
        `;

        modal.querySelector('#btn-zap-reforcar-sugestao')?.addEventListener('click', () => {
          const msgZap = `*SUGESTÃO DE MELHORIA - AO PONTO*\n` +
            `🏪 *Ponto:* ${nomeLoja}\n` +
            `👤 *Por:* ${nomeUsuario}\n` +
            `📂 *Categoria:* ${categoria}\n` +
            `💡 *Ideia:* ${descricao}`;
          window.open(`https://api.whatsapp.com/send?phone=${numWhatsDestino}&text=${encodeURIComponent(msgZap)}`, '_blank');
          fechar();
        });

        toast('Sugestão enviada com sucesso! 💡', 'sucesso');
      } catch (err) {
        toast('Erro ao enviar sugestão: ' + err.message, 'erro');
        if (btn) {
          btn.disabled = false;
          btn.textContent = '🚀 Enviar Sugestão de Melhoria';
        }
      }
    });
  });
}
