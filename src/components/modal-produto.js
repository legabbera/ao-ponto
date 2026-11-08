/**
 * MODAL DE CADASTRO E EDIÇÃO DE PRODUTOS
 */
import { icone } from './icons.js';
import { toast, abrirModal } from './ui.js';
import { salvarProduto, excluirProduto, getCategoriasProdutos } from '../services/produtos.js';
import { escapeHtml } from '../utils/sanitizar.js';

const EMOJIS_SUGESTOES = ['🍗', '🥩', '🍖', '🌭', '🥗', '🥣', '🥔', '🥤', '🍺', '🥖', '🥟', '🍰'];

export function abrirModalProduto(produtoExistente = null, aoSalvar = null, tenantId = null) {
  const isEdicao = Boolean(produtoExistente && produtoExistente.id);
  const prod = produtoExistente || {
    id: '',
    nome: '',
    categoria: 'frangos',
    forma: 'unidade',
    preco: '',
    precoKg: '',
    gramasMedia: 400,
    emoji: '🍗',
    desc: '',
    ativo: true,
  };

  const categorias = getCategoriasProdutos().filter((c) => c.id !== 'todos');

  abrirModal(`
    <div style="max-width:480px; text-align:left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h2 style="font-size:18px; margin:0;">
          ${isEdicao ? '✏️ Editar Produto' : '🍗 Cadastrar Novo Produto'}
        </h2>
        <span class="badge" style="background:#FFF8F3; color:var(--brasa); font-weight:700;">
          ${isEdicao ? 'Edição' : 'Novo Item'}
        </span>
      </div>
      <p style="font-size:13px; color:var(--texto-suave); margin:0 0 16px 0;">
        Defina como o produto aparecerá no controle de vendas e balcão.
      </p>

      <form id="form-modal-produto">
        <div style="display:flex; flex-direction:column; gap:12px;">
          
          <!-- Emoji e Nome -->
          <div style="display:grid; grid-template-columns: 70px 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Ícone</label>
              <select id="prod-emoji" class="input" style="height:42px; font-size:20px; text-align:center; padding:0;">
                ${EMOJIS_SUGESTOES.map((em) => `
                  <option value="${em}" ${prod.emoji === em ? 'selected' : ''}>${em}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Nome do Produto *</label>
              <input type="text" id="prod-nome" class="input" placeholder="Ex.: Frango Recheado Especial" value="${escapeHtml(prod.nome)}" required style="height:42px;" />
            </div>
          </div>

          <!-- Categoria e Forma de Cobrança -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Categoria *</label>
              <select id="prod-categoria" class="input" style="height:42px;" required>
                ${categorias.map((c) => `
                  <option value="${c.id}" ${prod.categoria === c.id ? 'selected' : ''}>${c.nome}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Tipo de Cobrança *</label>
              <select id="prod-forma" class="input" style="height:42px;" required>
                <option value="unidade" ${prod.forma === 'unidade' ? 'selected' : ''}>Por Unidade (R$ fixo)</option>
                <option value="meia" ${prod.forma === 'meia' ? 'selected' : ''}>Meia Unidade</option>
                <option value="peso" ${prod.forma === 'peso' ? 'selected' : ''}>Por Peso / Kg (Balança)</option>
                <option value="porcao" ${prod.forma === 'porcao' ? 'selected' : ''}>Por Porção</option>
              </select>
            </div>
          </div>

          <!-- Preço de Venda -->
          <div id="box-preco-unidade" style="display:${prod.forma === 'peso' ? 'none' : 'block'};">
            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Preço de Venda (R$) *</label>
            <div style="position:relative;">
              <span style="position:absolute; left:12px; top:11px; font-weight:700; color:var(--texto-suave);">R$</span>
              <input type="number" step="0.50" min="0" id="prod-preco" class="input" placeholder="45.00" value="${prod.preco || ''}" style="padding-left:36px; height:42px;" />
            </div>
          </div>

          <!-- Preço por KG (se for peso) -->
          <div id="box-preco-peso" style="display:${prod.forma === 'peso' ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Preço por Kg (R$/kg) *</label>
              <div style="position:relative;">
                <span style="position:absolute; left:12px; top:11px; font-weight:700; color:var(--texto-suave);">R$</span>
                <input type="number" step="0.50" min="0" id="prod-preco-kg" class="input" placeholder="42.00" value="${prod.precoKg || prod.preco || ''}" style="padding-left:36px; height:42px;" />
              </div>
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Peso Médio (gramas)</label>
              <input type="number" step="50" min="50" id="prod-gramas-media" class="input" placeholder="400" value="${prod.gramasMedia || 400}" style="height:42px;" />
            </div>
          </div>

          <!-- Descrição / Observações -->
          <div>
            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px;">Descrição curta</label>
            <input type="text" id="prod-desc" class="input" placeholder="Ex.: Acompanha farofa crocante e batatas coradas" value="${escapeHtml(prod.desc)}" style="height:40px;" />
          </div>

        </div>

        <div class="modal-acoes" style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; gap:8px;">
          <div>
            ${isEdicao ? `
              <button type="button" class="btn btn-contorno" id="btn-excluir-produto" style="color:#DC2626; border-color:#FECACA;" title="Excluir produto">
                🗑️ Excluir
              </button>
            ` : ''}
          </div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-fantasma" data-fechar>Cancelar</button>
            <button type="submit" class="btn btn-primario" id="btn-salvar-produto-submit">
              ${icone('check')} ${isEdicao ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  `, (m, fechar) => {
    const selForma = m.querySelector('#prod-forma');
    const boxUnidade = m.querySelector('#box-preco-unidade');
    const boxPeso = m.querySelector('#box-preco-peso');

    selForma.addEventListener('change', () => {
      const isPeso = selForma.value === 'peso';
      boxUnidade.style.display = isPeso ? 'none' : 'block';
      boxPeso.style.display = isPeso ? 'grid' : 'none';
    });

    // Submissão do formulário
    m.querySelector('#form-modal-produto').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = m.querySelector('#prod-nome').value.trim();
      const emoji = m.querySelector('#prod-emoji').value;
      const categoria = m.querySelector('#prod-categoria').value;
      const forma = m.querySelector('#prod-forma').value;
      const desc = m.querySelector('#prod-desc').value.trim();

      const preco = parseFloat(m.querySelector('#prod-preco').value) || 0;
      const precoKg = parseFloat(m.querySelector('#prod-preco-kg')?.value) || preco;
      const gramasMedia = parseInt(m.querySelector('#prod-gramas-media')?.value) || 400;

      if (!nome) {
        toast('Informe o nome do produto.', 'erro');
        return;
      }

      if (forma === 'peso' && precoKg <= 0) {
        toast('Informe o preço por kg.', 'erro');
        return;
      }
      if (forma !== 'peso' && preco <= 0) {
        toast('Informe o preço de venda.', 'erro');
        return;
      }

      try {
        await salvarProduto({
          id: prod.id,
          nome,
          emoji,
          categoria,
          forma,
          preco: forma === 'peso' ? precoKg : preco,
          precoKg: forma === 'peso' ? precoKg : null,
          gramasMedia,
          iconeUrl: prod.iconeUrl || null,
          desc,
        }, tenantId);

        fechar();
        toast(`🎉 Produto "${nome}" ${isEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`, 'sucesso');
        if (aoSalvar) aoSalvar();
      } catch (err) {
        toast('Erro ao salvar produto: ' + err.message, 'erro');
      }
    });

    // Exclusão
    m.querySelector('#btn-excluir-produto')?.addEventListener('click', async () => {
      if (confirm(`Tem certeza que deseja remover o produto "${prod.nome}"?`)) {
        await excluirProduto(prod.id, tenantId);
        fechar();
        toast('Produto removido do catálogo.', 'info');
        if (aoSalvar) aoSalvar();
      }
    });
  });
}

