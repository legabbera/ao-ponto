/**
 * TELA DE CONFIGURAÇÕES DO ESTABELECIMENTO
 * - Dados do negócio
 * - Domínio personalizado
 * - Meu plano
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { salvarDominioCustom, checarDominioCustom } from '../services/api.js';
import { store } from '../state/store.js';
import { PLANOS, atualizarTenantAtivo } from '../data/tenants.js';
import { baixarArquivoBackup, validarArquivoBackup, aplicarRestauracaoBackup, temRollbackDisponivel, executarRollbackEmergencia } from '../utils/backup.js';
import { escapeHtml } from '../utils/sanitizar.js';
import { iniciarEnvioGoogleDrive } from '../components/modal-gdrive.js';

export function renderConfiguracoes(raiz, irPara) {
  const tenant = store.getTenant();
  const plano = PLANOS[tenant?.plano || 'plano-00'];
  const isPago = plano.preco > 0;
  const domStatus = tenant?.dominioCustomStatus;

  const statusDom = {
    null: '',
    pendente: '<span class="badge badge-demo">⏳ Verificando DNS...</span>',
    ativo: '<span class="badge badge-verde">✅ Ativo</span>',
    erro: '<span class="badge badge-vermelho">❌ Erro no DNS</span>',
  };

  raiz.innerHTML = `
  <div class="config-pg">
    <h1 class="config-titulo">Configurações</h1>

    <!-- Meu plano -->
    <section class="card config-secao" id="secao-plano">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('cartao')} Meu plano</div>
          <div class="card-sub">Plano atual e limites de uso</div>
        </div>
        <span class="badge ${isPago ? 'badge-verde' : 'badge-demo'}">${plano.nome}</span>
      </div>
      <div class="config-plano-info">
        <div class="config-plano-preco">${plano.precoFormatado}</div>
        ${!isPago ? `
          <div class="planos-uso-barra" style="margin-top:12px">
            <div class="planos-uso-info">
              <span>Vendas este mês</span>
              <strong>${tenant?.vendasMesAtual || 0} / ${plano.limiteVendasMes}</strong>
            </div>
            <div class="barra-progresso">
              <div class="barra-fill ${(tenant?.vendasMesAtual || 0) >= plano.limiteVendasMes ? 'barra-cheia' : ''}"
                   style="width:${Math.min(100, ((tenant?.vendasMesAtual || 0) / plano.limiteVendasMes) * 100)}%"></div>
            </div>
          </div>
        ` : '<p class="config-plano-desc">Vendas ilimitadas ✅</p>'}
      </div>
      <button class="btn btn-contorno" id="btn-ver-planos" style="margin-top:16px">
        ${isPago ? 'Ver detalhes do plano' : 'Fazer upgrade'} ${icone('grafico')}
      </button>
    </section>

    <!-- Dados do estabelecimento -->
    <section class="card config-secao" id="secao-estabelecimento">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('local')} Estabelecimento</div>
          <div class="card-sub">Nome e endereço do app</div>
        </div>
      </div>
      <div class="campo" id="campo-config-nome">
        <label for="config-nome">Nome do estabelecimento</label>
        <div class="campo-caixa">${icone('local')}
          <input class="input" id="config-nome" type="text" value="${tenant?.nome || ''}" placeholder="Nome do seu negócio" />
        </div>
      </div>
      <div class="campo">
        <label>Seu link gratuito</label>
        <div class="config-link-box">
          <span class="config-link-url">${tenant?.slug || 'demo'}.aoponto.app</span>
          <button class="btn btn-contorno btn-icone" id="btn-copiar-link" title="Copiar link">${icone('copiar')}</button>
        </div>
      </div>
      <button class="btn btn-primario" id="btn-salvar-nome" style="margin-top:4px">
        Salvar alterações
      </button>
    </section>

    <!-- Domínio personalizado -->
    <section class="card config-secao" id="secao-dominio">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('config')} Domínio personalizado</div>
          <div class="card-sub">Use seu próprio domínio (ex.: seunegocio.com.br)</div>
        </div>
        ${isPago ? statusDom[domStatus] || '' : '<span class="badge badge-demo">🔒 Plano pago</span>'}
      </div>

      ${!isPago ? `
        <div class="config-dominio-bloqueado">
          <p>O domínio personalizado está disponível no <strong>Plano Balcão</strong> (R$ 79,00/mês).</p>
          <button class="btn btn-primario" id="btn-upgrade-dominio">Ver planos</button>
        </div>
      ` : `
        <div class="campo" id="campo-dominio">
          <label for="config-dominio">Seu domínio</label>
          <div class="campo-caixa">${icone('config')}
            <input class="input" id="config-dominio" type="text"
              value="${tenant?.dominioCustom || ''}"
              placeholder="meunegocio.com.br" />
          </div>
          <span class="campo-erro">${icone('alerta')}<span></span></span>
          <span class="campo-dica">Aponte um CNAME do seu domínio para <strong>cname.aoponto.app</strong></span>
        </div>
        ${domStatus === 'pendente' || domStatus === 'ativo' ? `
          <div class="config-dns-instrucoes">
            <strong>Como configurar:</strong>
            <ol>
              <li>Acesse o painel DNS do seu domínio</li>
              <li>Crie um registro <code>CNAME</code> apontando para <code>cname.aoponto.app</code></li>
              <li>Aguarde a propagação (até 24h)</li>
            </ol>
            ${domStatus === 'pendente' ? `<button class="btn btn-contorno" id="btn-verificar-cname">Verificar agora</button>` : ''}
          </div>
        ` : ''}
        <button class="btn btn-primario" id="btn-salvar-dominio" style="margin-top:8px">
          Salvar domínio
        </button>
      `}
    </section>

    <!-- Backup & Recuperação de Desastres (Disaster Recovery) -->
    <section class="card config-secao" id="secao-backup">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('escudo')} Cibersegurança & Backup de Contingência</div>
          <div class="card-sub">Snapshot completo de pedidos, vendas, clientes e receitas para recuperação de desastres</div>
        </div>
        <span class="badge badge-verde">🛡️ Criptografado & Verificado</span>
      </div>

      <div class="config-backup-info" style="margin-top:12px; font-size:13px; color:var(--texto-suave); line-height:1.5;">
        Proteja seu ponto contra perda de celular, pane no computador do caixa ou instabilidade de rede. Baixe um snapshot local em arquivo JSON seguro ou restaure dados anteriores com 1 clique.
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:16px;">
        <button class="btn btn-primario" id="btn-baixar-backup">
          ${icone('download')} Baixar Backup (.JSON)
        </button>
        <button class="btn btn-primario" id="btn-gdrive-backup" style="background:linear-gradient(135deg, #1A73E8, #4285F4); border-color:#1A73E8;">
          ☁️ Salvar no Google Drive
        </button>
        <button class="btn btn-contorno" id="btn-abrir-restaurar">
          ${icone('upload')} Restaurar de Arquivo
        </button>
        ${temRollbackDisponivel() ? `
          <button class="btn btn-contorno" id="btn-desfazer-restauracao" style="color:#DC2626; border-color:#FECACA;" title="Desfazer a última restauração e voltar aos dados anteriores">
            ↩️ Desfazer Restauração (Rollback)
          </button>
        ` : ''}
      </div>
      <input type="file" id="input-arquivo-backup" accept=".json" style="display:none;" />
    </section>

    <!-- Acessibilidade e Tamanho da Fonte -->
    <section class="card config-secao" id="secao-acessibilidade">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('olho')} Tamanho da Fonte & Leitura</div>
          <div class="card-sub">Ajuste o tamanho dos textos para facilitar a visualização no balcão e smartphone</div>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
        <p style="font-size:14px; color:var(--texto-suave); margin:0;">
          Escolha o tamanho ideal para você e seus operadores lerem no celular sem esforço:
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          <button type="button" class="btn btn-contorno btn-fonte-opcao" data-tamanho="1" id="btn-fonte-padrao">
            <strong>Padrão</strong>
            <small style="display:block; font-size:11px; color:var(--texto-suave)">17px (Recomendado)</small>
          </button>
          <button type="button" class="btn btn-contorno btn-fonte-opcao" data-tamanho="1.06" id="btn-fonte-media">
            <strong>Médio</strong>
            <small style="display:block; font-size:11px; color:var(--texto-suave)">+1px (18px)</small>
          </button>
          <button type="button" class="btn btn-contorno btn-fonte-opcao" data-tamanho="1.12" id="btn-fonte-grande">
            <strong>Grande</strong>
            <small style="display:block; font-size:11px; color:var(--texto-suave)">+2px (19px)</small>
          </button>
          <button type="button" class="btn btn-contorno btn-fonte-opcao" data-tamanho="1.20" id="btn-fonte-extragrande">
            <strong>Extra Grande</strong>
            <small style="display:block; font-size:11px; color:var(--texto-suave)">+3px (20px)</small>
          </button>
        </div>
        <div style="background:var(--creme); border:1px solid var(--borda); border-radius:10px; padding:12px; font-size:14px;">
          <span style="color:var(--texto-suave)">Exemplo de visualização:</span>
          <strong style="color:var(--carvao); display:block; margin-top:2px;">
            🍗 1x Frango Inteiro Assado com Farofa — R$ 45,00
          </strong>
        </div>
      </div>
    </section>

    <!-- Modo Visual: Claro / Escuro (Dark Mode Slide Switch) -->
    <section class="card config-secao" id="secao-aparencia">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('olho')} Modo Visual (Claro / Escuro)</div>
          <div class="card-sub">Alterne entre o tema clássico claro e o modo escuro (ideal para a noite)</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; background:var(--creme); border:1px solid var(--borda); border-radius:12px; padding:14px 18px; margin-top:8px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;" id="icone-tema-atual">${document.documentElement.classList.contains('dark') ? '🌙' : '☀️'}</span>
          <div>
            <strong style="font-size:15px; display:block;" id="label-tema-atual">${document.documentElement.classList.contains('dark') ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}</strong>
            <small style="color:var(--texto-suave); font-size:12px;">Deslize a chave para alternar o contraste visual</small>
          </div>
        </div>
        <label class="switch-slide" title="Alternar Modo Escuro / Claro">
          <input type="checkbox" id="toggle-tema-dark" ${document.documentElement.classList.contains('dark') ? 'checked' : ''} />
          <span class="slider"></span>
        </label>
      </div>
    </section>

    <!-- Máquinas de Cartão & Gateways de Pagamento -->
    <section class="card config-secao" id="secao-maquininhas-config">
      <div class="card-cabecalho">
        <div>
          <div class="card-titulo">${icone('cartao')} Código de Máquinas & Gateways de Pagamento</div>
          <div class="card-sub">Cadastre os códigos (POS/Serial) das suas maquininhas e configure o gateway para computar vendas no balcão</div>
        </div>
        <button type="button" class="btn btn-pequeno btn-primario" id="btn-add-maq-config" style="font-weight:700;">
          ${icone('mais')} Nova Máquina
        </button>
      </div>

      <div id="lista-maquininhas-config-el" style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
        <!-- Lista gerada dinamicamente via JS -->
      </div>
    </section>
  </div>`;

  const $ = (s) => raiz.querySelector(s);

  // Ir para planos
  $('#btn-ver-planos')?.addEventListener('click', () => irPara('planos'));
  $('#btn-upgrade-dominio')?.addEventListener('click', () => irPara('planos'));

  // Copiar link
  $('#btn-copiar-link')?.addEventListener('click', () => {
    const url = `${tenant?.slug || 'demo'}.aoponto.app`;
    navigator.clipboard?.writeText(url).then(() => toast('Link copiado! 📋', 'info'));
  });

  // Salvar nome do estabelecimento
  $('#btn-salvar-nome')?.addEventListener('click', () => {
    const nome = $('#config-nome').value.trim();
    if (!nome) return;
    atualizarTenantAtivo({ nome });
    store.refreshTenant();
    toast('Nome atualizado com sucesso! ✅');
  });

  // Salvar domínio personalizado
  $('#btn-salvar-dominio')?.addEventListener('click', async () => {
    const input = $('#config-dominio');
    const campo = $('#campo-dominio');
    const dominio = input.value.trim().toLowerCase().replace(/^https?:\/\//, '');

    if (!dominio) {
      campo.classList.add('erro');
      campo.querySelector('.campo-erro span').textContent = 'Informe o domínio.';
      return;
    }
    if (!/^[a-z0-9][a-z0-9\-\.]+\.[a-z]{2,}$/.test(dominio)) {
      campo.classList.add('erro');
      campo.querySelector('.campo-erro span').textContent = 'Domínio inválido. Ex.: meunegocio.com.br';
      return;
    }
    campo.classList.remove('erro');

    const btn = $('#btn-salvar-dominio');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Salvando...';

    try {
      const tenant = await salvarDominioCustom(dominio);
      store.set({ tenant });
      store.refreshTenant();
      toast('Domínio salvo! Aguardando verificação de DNS. ⏳', 'info');
      renderConfiguracoes(raiz, irPara); // re-render
    } catch (err) {
      toast(err.message, 'erro');
      btn.disabled = false;
      btn.textContent = 'Salvar domínio';
    }
  });

  // Verificar CNAME
  $('#btn-verificar-cname')?.addEventListener('click', async () => {
    const btn = $('#btn-verificar-cname');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Verificando...';
    try {
      const tenant = await checarDominioCustom();
      store.set({ tenant });
      store.refreshTenant();
      toast('Domínio verificado e ativo! 🎉', 'sucesso');
      renderConfiguracoes(raiz, irPara);
    } catch (err) {
      toast('Erro na verificação: ' + err.message, 'erro');
      btn.disabled = false;
      btn.textContent = 'Verificar novamente';
    }
  });

  // ── Cibersegurança & Backup de Contingência ─────────────────
  $('#btn-baixar-backup')?.addEventListener('click', () => {
    try {
      const { nomeArquivo, snapshot } = baixarArquivoBackup();
      toast(`Backup gerado com sucesso! Arquivo "${nomeArquivo}" baixado. 🛡️`, 'sucesso');
    } catch (err) {
      toast('Erro ao gerar backup: ' + err.message, 'erro');
    }
  });

  // Salvar no Google Drive (OAuth + Picker)
  $('#btn-gdrive-backup')?.addEventListener('click', () => {
    iniciarEnvioGoogleDrive();
  });

  const inputBackup = $('#input-arquivo-backup');
  $('#btn-abrir-restaurar')?.addEventListener('click', () => {
    inputBackup?.click();
  });

  inputBackup?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const conteudo = evt.target?.result;
      const validacao = validarArquivoBackup(conteudo);
      inputBackup.value = ''; // reset para permitir selecionar mesmo arquivo novamente

      if (!validacao.valido) {
        toast(validacao.erro || 'Arquivo de backup inválido.', 'erro');
        return;
      }

      const res = validacao.resumo;
      abrirModal({
        titulo: 'Restaurar Dados de Backup 🛡️',
        html: `
          <div class="modal-restaurar-backup" style="font-size:14px; color:var(--texto);">
            <p style="margin-bottom:12px;">O arquivo de backup foi verificado e é autêntico:</p>
            
            <div style="background:var(--fundo-suave, #f8f6f2); border:1px solid var(--borda, #e5e0d8); border-radius:10px; padding:12px; margin-bottom:16px;">
              <div style="margin-bottom:6px;"><strong>Ponto:</strong> ${escapeHtml(res.tenantNome)}</div>
              <div style="margin-bottom:6px;"><strong>Data do Backup:</strong> ${escapeHtml(res.data)}</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:13px; margin-top:8px; border-top:1px dashed var(--borda, #ddd); padding-top:8px;">
                <span>🍗 <strong>${res.pedidos}</strong> pedidos</span>
                <span>💰 <strong>${res.vendas}</strong> vendas</span>
                <span>👥 <strong>${res.clientes}</strong> clientes</span>
                <span>📋 <strong>${res.fichasTecnicas}</strong> fichas técnicas</span>
              </div>
            </div>

            <div style="margin-bottom:16px;">
              <label style="font-weight:600; display:block; margin-bottom:6px;">Como deseja aplicar a restauração?</label>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer;">
                  <input type="radio" name="modo-restauracao" value="substituir" checked style="margin-top:3px;" />
                  <div>
                    <strong>Substituir Base Completa (Recomendado)</strong>
                    <div style="font-size:12px; color:var(--texto-suave);">Substitui todos os dados pelo snapshot do arquivo (ideal para troca de aparelho ou restauração limpa).</div>
                  </div>
                </label>
                <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer;">
                  <input type="radio" name="modo-restauracao" value="mesclar" style="margin-top:3px;" />
                  <div>
                    <strong>Mesclar Dados (Merge Seguro)</strong>
                    <div style="font-size:12px; color:var(--texto-suave);">Preserva registros criados recentemente e adiciona apenas dados faltantes.</div>
                  </div>
                </label>
              </div>
            </div>

            <p style="font-size:12px; color:#10B981; margin-bottom:16px;">
              🛡️ <em>Um snapshot de emergência será gerado automaticamente antes da aplicação para permitir Rollback (desfazer) caso necessário.</em>
            </p>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-contorno" data-fechar>Cancelar</button>
              <button class="btn btn-primario" id="btn-confirmar-restauracao">
                ${icone('check')} Confirmar e Restaurar
              </button>
            </div>
          </div>
        `,
        aoAbrir: (elModal, fecharModal) => {
          elModal.querySelector('#btn-confirmar-restauracao')?.addEventListener('click', () => {
            const modo = elModal.querySelector('input[name="modo-restauracao"]:checked')?.value || 'substituir';
            try {
              aplicarRestauracaoBackup(validacao.snapshot, modo);
              toast('Backup restaurado com sucesso! 🎉', 'sucesso');
              fecharModal();
              renderConfiguracoes(raiz, irPara);
            } catch (err) {
              toast('Erro ao restaurar: ' + err.message, 'erro');
            }
          });
        }
      });
    };
    reader.readAsText(file);
  });

  // Rollback de Emergência
  $('#btn-desfazer-restauracao')?.addEventListener('click', () => {
    if (confirm('Deseja desfazer a última restauração e retornar aos dados anteriores à importação?')) {
      try {
        executarRollbackEmergencia();
        toast('Rollback de emergência executado com sucesso! Dados anteriores restabelecidos.', 'sucesso');
        renderConfiguracoes(raiz, irPara);
      } catch (err) {
        toast('Erro ao executar rollback: ' + err.message, 'erro');
      }
    }
  });

  // Ajuste dinâmico de tamanho de fonte
  const escalaAtual = localStorage.getItem('ao-ponto-tamanho-fonte') || '1';
  raiz.querySelectorAll('.btn-fonte-opcao').forEach((btn) => {
    if (btn.dataset.tamanho === escalaAtual) {
      btn.classList.remove('btn-contorno');
      btn.classList.add('btn-primario');
    }
    btn.addEventListener('click', () => {
      const escala = btn.dataset.tamanho;
      document.documentElement.style.setProperty('--escala-fonte', escala);
      localStorage.setItem('ao-ponto-tamanho-fonte', escala);
      raiz.querySelectorAll('.btn-fonte-opcao').forEach((b) => {
        b.classList.remove('btn-primario');
        b.classList.add('btn-contorno');
      });
      btn.classList.remove('btn-contorno');
      btn.classList.add('btn-primario');
      toast('Tamanho da fonte atualizado! 🔤', 'sucesso');
    });
  });

  // Alternância de Modo Escuro / Modo Claro (Dark Mode / Clear Mode)
  const toggleDark = $('#toggle-tema-dark');
  toggleDark?.addEventListener('change', (e) => {
    const isDark = e.target.checked;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ao-ponto-tema', isDark ? 'dark' : 'light');
    const label = $('#label-tema-atual');
    const ic = $('#icone-tema-atual');
    if (label) label.textContent = isDark ? 'Modo Escuro Ativo' : 'Modo Claro Ativo';
    if (ic) ic.textContent = isDark ? '🌙' : '☀️';
    toast(isDark ? 'Modo Escuro ativado! 🌙' : 'Modo Claro ativado! ☀️', 'info');
  });

  // Gestão de Máquinas de Cartão e Gateways
  function desenharMaquininhasConfig() {
    const el = $('#lista-maquininhas-config-el');
    if (!el) return;
    const pag = store.getPagamentos();
    const maqs = pag.maquininhas || [];

    if (maqs.length === 0) {
      el.innerHTML = `
        <div style="text-align:center; padding:18px; background:var(--creme); border-radius:10px; color:var(--texto-suave); font-size:13px;">
          Nenhuma máquina cadastrada ainda. Clique em <strong>+ Nova Máquina</strong> para inserir o código do seu terminal.
        </div>
      `;
      return;
    }

    el.innerHTML = maqs.map((m) => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--branco); border:1.5px solid var(--borda); border-radius:12px; padding:12px 16px; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:var(--creme-2); display:grid; place-items:center; font-size:18px;">
            💳
          </div>
          <div>
            <strong style="color:var(--carvao); font-size:14px; display:block;">${escapeHtml(m.nome)}</strong>
            <span style="font-size:12px; color:var(--texto-suave);">
              Código / Serial: <strong style="color:var(--brasa);">${escapeHtml(m.serial || m.codigo || 'N/A')}</strong> &bull; Gateway: ${escapeHtml(m.modelo || 'Smart POS')}
            </span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge ${m.status === 'online' ? 'badge-verde' : 'badge-demo'}">
            ${m.status === 'online' ? 'Ativa' : 'Inativa'}
          </span>
          <button class="btn btn-pequeno btn-fantasma btn-del-maq" data-maq-id="${m.id}" title="Remover máquina" style="color:var(--vermelho); font-size:14px; padding:6px 8px;">
            ${icone('lixeira')}
          </button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-del-maq').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Deseja remover esta máquina de cartão?')) {
          store.removerMaquininha(btn.dataset.maqId);
          toast('Máquina removida com sucesso.', 'info');
          desenharMaquininhasConfig();
        }
      });
    });
  }

  desenharMaquininhasConfig();

  $('#btn-add-maq-config')?.addEventListener('click', () => {
    abrirModal(`
      <div style="max-width:440px; text-align:left;">
        <h3 style="font-size:18px; margin-bottom:6px; font-weight:800; color:var(--carvao);">Adicionar Código de Máquina</h3>
        <p style="font-size:13px; color:var(--texto-suave); margin-bottom:16px;">
          Insira o código do terminal e o gateway para computar as vendas no caixa:
        </p>
        <form id="form-nova-maq">
          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">Nome / Identificador *</label>
              <input type="text" id="maq-nome" class="input" placeholder="Ex: Balcão 1, Espeto, Caixa Principal" required />
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">Código do Terminal / Serial (POS ID) *</label>
              <input type="text" id="maq-serial" class="input" placeholder="Ex: POS-8841, ST-9920, MP-331" required />
            </div>
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:var(--carvao); margin-bottom:4px;">Gateway / Provedor *</label>
              <select id="maq-provedor" class="input" required style="font-size:13px;">
                <option value="Mercado Pago Point">Mercado Pago Point (Pro 2 / Smart)</option>
                <option value="Stone / Ton">Stone / Ton (SmartPOS / TEF)</option>
                <option value="PagBank / PagSeguro">PagBank / PagSeguro (Moderninha)</option>
                <option value="Cielo / Rede">Cielo / Rede (LIO / Smart)</option>
                <option value="Outro Provedor">Outro Provedor de Cartão</option>
              </select>
            </div>
          </div>
          <div class="modal-acoes" style="flex-direction:column; gap:8px;">
            <button type="submit" class="btn btn-primario btn-bloco" style="font-weight:700; padding:12px;">
              Salvar Máquina
            </button>
            <button type="button" class="btn btn-fantasma btn-bloco" data-fechar>Cancelar</button>
          </div>
        </form>
      </div>
    `, (modal, fechar) => {
      modal.querySelector('#form-nova-maq')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = modal.querySelector('#maq-nome')?.value.trim();
        const serial = modal.querySelector('#maq-serial')?.value.trim();
        const modelo = modal.querySelector('#maq-provedor')?.value;

        if (!nome || !serial) return;

        store.adicionarMaquininha({
          nome,
          serial,
          modelo,
          ponto: 'todos',
          status: 'online'
        });

        fechar();
        toast('Máquina cadastrada com sucesso! 💳', 'sucesso');
        desenharMaquininhasConfig();
      });
    });
  });
}
