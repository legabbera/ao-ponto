/**
 * PAINEL MASTER DO DONO DA PLATAFORMA AO PONTO (SaaS SuperAdmin)
 * -------------------------------------------------------------
 * Controle de clientes (assadeiras), planos, mensalidades,
 * bloqueio de inadimplentes e ampliação de recursos.
 */

import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import {
  PLANOS,
  listarTodosTenants,
  bloquearTenant,
  desbloquearTenant,
  alterarPlanoTenant,
  cadastrarTenantManual,
  impersonarTenant,
  obterMetricasSaaS,
} from '../data/tenants.js';
import { fmtMoeda } from '../utils/format.js';

export function renderMaster(raiz, irPara) {
  let filtroStatus = 'todos'; // 'todos', 'ativo', 'atrasado', 'bloqueado'
  let filtroPlano = 'todos';
  let termoBusca = '';

  function desenhar() {
    const metricas = obterMetricasSaaS();
    const todosTenants = listarTodosTenants();

    // Filtros de busca
    const listaFiltrada = todosTenants.filter((t) => {
      const matchStatus = filtroStatus === 'todos'
        || (filtroStatus === 'ativo' && t.status === 'ativo' && t.mensalidadeStatus !== 'atrasado')
        || (filtroStatus === 'atrasado' && t.mensalidadeStatus === 'atrasado')
        || (filtroStatus === 'bloqueado' && t.status === 'bloqueado');

      const matchPlano = filtroPlano === 'todos' || t.plano === filtroPlano;

      const texto = `${t.nome} ${t.responsavel || ''} ${t.cidade || ''} ${t.celular || ''} ${t.slug || ''}`.toLowerCase();
      const matchBusca = !termoBusca || texto.includes(termoBusca.toLowerCase());

      return matchStatus && matchPlano && matchBusca;
    });

    raiz.innerHTML = `
    <div class="master-container" style="max-width: 1280px; margin: 0 auto; padding-bottom: 60px;">
      
      <!-- Topo do Painel Master -->
      <div class="clientes-topo" style="margin-bottom: 24px;">
        <div class="clientes-topo-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 26px;">👑</span>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: var(--carvao);">
              Painel Master — Gestão do SaaS Ao Ponto
            </h1>
          </div>
          <p style="margin: 6px 0 0; color: var(--texto-suave); font-size: 14px;">
            Ambiente exclusivo do Dono da Plataforma &bull; Controle de assadeiras clientes, faturamento de assinaturas e bloqueios por mensalidade
          </p>
        </div>
        <div class="clientes-topo-acoes">
          <button class="btn btn-primario" id="btn-novo-cliente-saas">
            ${icone('mais')} Cadastrar Nova Assadeira
          </button>
        </div>
      </div>

      <!-- KPIs Executivos do Dono da Plataforma -->
      <div class="clientes-kpis" style="margin-bottom: 24px;">
        <div class="kpi-card">
          <div class="kpi-rotulo">Receita Recorrente (MRR) 💰</div>
          <div class="kpi-valor" style="color: #16A34A;">${fmtMoeda(metricas.mrr)}<span style="font-size: 14px; font-weight: 600; color: var(--texto-suave);">/mês</span></div>
          <div class="kpi-sub">Faturamento de assinaturas ativas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Assadeiras Cadastradas</div>
          <div class="kpi-valor" style="color: var(--carvao);">${metricas.totalTenants} lojas</div>
          <div class="kpi-sub">${metricas.ativos} ativas &bull; ${metricas.bloqueados} bloqueadas</div>
        </div>
        <div class="kpi-card" style="${metricas.atrasados > 0 ? 'border: 2px solid #F87171; background: #FEF2F2;' : ''}">
          <div class="kpi-rotulo">Inadimplência / Atrasos ⚠️</div>
          <div class="kpi-valor" style="color: ${metricas.atrasados > 0 ? '#DC2626' : '#16A34A'};">
            ${metricas.atrasados} ${metricas.atrasados === 1 ? 'pendente' : 'pendentes'}
          </div>
          <div class="kpi-sub">${metricas.atrasados > 0 ? 'Mensalidade aguardando quitação' : 'Todas as mensalidades em dia'}</div>
        </div>
        <div class="kpi-card destaque-fidelidade">
          <div class="kpi-rotulo">Vendas Transacionadas no SaaS 🔥</div>
          <div class="kpi-valor" style="color: #EA580C;">${metricas.totalVendasSaaS} pedidos</div>
          <div class="kpi-sub">Volume total de frangos vendidos este mês</div>
        </div>
      </div>

      <!-- Barra de Filtros e Pesquisa -->
      <div class="cartao" style="margin-bottom: 20px; padding: 14px 18px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px;">
        
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 280px;">
          <input 
            type="search" 
            id="busca-tenant" 
            class="input" 
            placeholder="Buscar por assadeira, responsável, cidade ou WhatsApp..." 
            value="${termoBusca}" 
            style="width: 100%; height: 38px; font-size: 13px;"
          />
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <strong style="font-size: 13px; color: var(--carvao);">Status:</strong>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-pequeno ${filtroStatus === 'todos' ? 'btn-primario' : 'btn-contorno'}" data-st="todos">Todos (${todosTenants.length})</button>
            <button class="btn btn-pequeno ${filtroStatus === 'ativo' ? 'btn-primario' : 'btn-contorno'}" data-st="ativo">Em Dia (${metricas.ativos - metricas.atrasados})</button>
            <button class="btn btn-pequeno ${filtroStatus === 'atrasado' ? 'btn-primario' : 'btn-contorno'}" data-st="atrasado">Atrasados (${metricas.atrasados})</button>
            <button class="btn btn-pequeno ${filtroStatus === 'bloqueado' ? 'btn-primario' : 'btn-contorno'}" data-st="bloqueado">Bloqueados (${metricas.bloqueados})</button>
          </div>

          <div style="margin-left: 10px; display: flex; align-items: center; gap: 6px;">
            <strong style="font-size: 13px; color: var(--carvao);">Plano:</strong>
            <select id="sel-filtro-plano" class="select" style="height: 34px; font-size: 12px;">
              <option value="todos" ${filtroPlano === 'todos' ? 'selected' : ''}>Todos os Planos</option>
              ${Object.values(PLANOS).map((p) => `<option value="${p.id}" ${filtroPlano === p.id ? 'selected' : ''}>${p.nome} (${p.precoFormatado})</option>`).join('')}
            </select>
          </div>
        </div>

      </div>

      <!-- Tabela Principal de Clientes SaaS (Assadeiras) -->
      <div class="cartao" style="padding: 0; overflow: hidden;">
        
        <div style="padding: 16px 20px; background: #F8FAFC; border-bottom: 1px solid var(--borda); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 15px; color: var(--carvao);">Assadeiras & Frangarias Clientes</strong>
            <small style="display: block; color: var(--texto-suave);">Exibindo ${listaFiltrada.length} estabelecimentos</small>
          </div>
          <span style="font-size: 12px; color: var(--texto-suave);">
            Ações disponíveis: <b>Bloqueio de Inadimplentes</b>, <b>Ampliação de Plano</b> e <b>Acesso Técnico de Suporte</b>
          </span>
        </div>

        <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
          <thead>
            <tr style="background: #FFFFFF;">
              <th>Estabelecimento / Assadeira</th>
              <th>Proprietário & Contato</th>
              <th>Plano Atual</th>
              <th style="text-align: center;">Vendas (Mês)</th>
              <th>Status Mensalidade</th>
              <th style="text-align: right;">Ações de Controle</th>
            </tr>
          </thead>
          <tbody>
            ${listaFiltrada.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--texto-suave);">
                  Nenhuma assadeira encontrada para os filtros aplicados.
                </td>
              </tr>
            ` : listaFiltrada.map((t) => {
              const plano = PLANOS[t.plano] || PLANOS['plano-00'];
              const isBloqueado = t.status === 'bloqueado';
              const isAtrasado = t.mensalidadeStatus === 'atrasado';
              const celLimpo = (t.celular || '').replace(/\D/g, '');

              return `
                <tr style="background: ${isBloqueado ? '#FEF2F2' : '#FFFFFF'};">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 20px;">🍗</span>
                      <div>
                        <strong style="color: var(--carvao); font-size: 14px;">${t.nome}</strong>
                        <small style="display: block; color: var(--texto-suave); font-size: 11px;">
                          ${t.cidade || 'Brasil'} &bull; <code>${t.slug}.aoponto.app</code>
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong style="color: var(--carvao);">${t.responsavel || 'Proprietário'}</strong>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                      <small style="color: var(--texto-suave);">${t.celular || 'Sem celular'}</small>
                      ${celLimpo ? `
                        <a href="https://wa.me/55${celLimpo}?text=Ol%C3%A1%20${encodeURIComponent(t.responsavel || '')},%20sou%20o%20administrador%20da%20plataforma%20Ao%20Ponto!" target="_blank" style="text-decoration: none; font-size: 13px;" title="Conversar no WhatsApp">
                          📲
                        </a>
                      ` : ''}
                    </div>
                  </td>

                  <td>
                    <span style="font-weight: 700; color: var(--carvao);">${plano.nome}</span>
                    <small style="display: block; color: #166534; font-weight: 600;">
                      ${plano.preco > 0 ? fmtMoeda(plano.preco) + '/mês' : 'Gratuito'}
                    </small>
                    <small style="color: var(--texto-suave); font-size: 11px;">Vencimento: dia ${t.diaVencimento || 10}</small>
                  </td>

                  <td style="text-align: center;">
                    <strong style="font-size: 14px; color: var(--carvao);">${t.vendasMesAtual || 0}</strong>
                    <small style="display: block; color: var(--texto-suave); font-size: 11px;">
                      ${plano.limiteVendasMes ? `de ${plano.limiteVendasMes} vendas` : 'Ilimitado'}
                    </small>
                  </td>

                  <td>
                    ${isBloqueado ? `
                      <span class="badge" style="background: #FEE2E2; color: #991B1B; font-weight: 800;">
                        🛑 Bloqueado (Suspenso)
                      </span>
                      <small style="display: block; color: #B91C1C; font-size: 11px; margin-top: 2px;">
                        ${t.bloqueioMotivo || 'Falta de pagamento'}
                      </small>
                    ` : isAtrasado ? `
                      <span class="badge" style="background: #FEF3C7; color: #92400E; font-weight: 800;">
                        ⚠️ Atrasado (Pendente)
                      </span>
                      <small style="display: block; color: #B45309; font-size: 11px; margin-top: 2px;">
                        Venceu dia ${t.diaVencimento || 10}
                      </small>
                    ` : `
                      <span class="badge" style="background: #DCFCE7; color: #166534; font-weight: 800;">
                        ✅ Em Dia (Ativo)
                      </span>
                    `}
                  </td>

                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
                      
                      <!-- Botão Alterar Plano -->
                      <button class="btn btn-pequeno btn-contorno btn-alterar-plano" data-id="${t.id}" title="Alterar ou Ampliar Plano">
                        🚀 Plano
                      </button>

                      <!-- Botão Bloquear / Desbloquear -->
                      ${isBloqueado ? `
                        <button class="btn btn-pequeno btn-sucesso btn-desbloquear-loja" data-id="${t.id}" title="Reativar Acesso da Loja">
                          ✅ Desbloquear
                        </button>
                      ` : `
                        <button class="btn btn-pequeno btn-contorno btn-bloquear-loja" data-id="${t.id}" style="color: #DC2626; border-color: #FCA5A5;" title="Suspender Acesso por Falta de Pagamento">
                          🛑 Bloquear
                        </button>
                      `}

                      <!-- Botão Acessar como Lojista (Suporte) -->
                      <button class="btn btn-pequeno btn-primario btn-acessar-loja" data-id="${t.id}" title="Acessar Sistema como este Lojista (Suporte Técnico)">
                        👁️ Acessar
                      </button>

                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

    </div>
    `;

    vincularEventos();
  }

  function vincularEventos() {
    // Busca
    const inpBusca = raiz.querySelector('#busca-tenant');
    inpBusca?.addEventListener('input', (e) => {
      termoBusca = e.target.value;
      desenhar();
      // Devolve o foco ao final do texto
      const novoInp = raiz.querySelector('#busca-tenant');
      if (novoInp) {
        novoInp.focus();
        novoInp.setSelectionRange(novoInp.value.length, novoInp.value.length);
      }
    });

    // Filtros de Status
    raiz.querySelectorAll('[data-st]').forEach((btn) => {
      btn.addEventListener('click', () => {
        filtroStatus = btn.dataset.st;
        desenhar();
      });
    });

    // Filtro de Plano
    const selPlano = raiz.querySelector('#sel-filtro-plano');
    selPlano?.addEventListener('change', (e) => {
      filtroPlano = e.target.value;
      desenhar();
    });

    // Botão Cadastrar Nova Assadeira Manualmente
    raiz.querySelector('#btn-novo-cliente-saas')?.addEventListener('click', () => {
      abrirModalNovaAssadeira();
    });

    // Botão Alterar Plano
    raiz.querySelectorAll('.btn-alterar-plano').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = listarTodosTenants().find((t) => t.id === id);
        if (tenant) abrirModalAlterarPlano(tenant);
      });
    });

    // Botão Bloquear Loja
    raiz.querySelectorAll('.btn-bloquear-loja').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = listarTodosTenants().find((t) => t.id === id);
        if (tenant) abrirModalBloqueio(tenant);
      });
    });

    // Botão Desbloquear Loja
    raiz.querySelectorAll('.btn-desbloquear-loja').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = listarTodosTenants().find((t) => t.id === id);
        if (tenant && confirm(`Deseja desbloquear e restabelecer o acesso total de "${tenant.nome}"?`)) {
          desbloquearTenant(id);
          toast(`Acesso de "${tenant.nome}" desbloqueado com sucesso!`, 'sucesso');
          desenhar();
        }
      });
    });

    // Botão Acessar Loja (Suporte Técnico / Impersonate)
    raiz.querySelectorAll('.btn-acessar-loja').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const tenant = impersonarTenant(id);
        store.set({
          tenant,
          perfil: 'owner', // assume perfil de dono da loja para suporte
        });
        toast(`Acessando a assadeira: ${tenant.nome}`, 'info');
        irPara('inicio');
      });
    });
  }

  // ── MODAIS MASTER ───────────────────────────────────────────

  function abrirModalBloqueio(tenant) {
    abrirModal({
      titulo: `Suspender Acesso: ${tenant.nome} 🛑`,
      html: `
        <div style="font-size: 14px;">
          <p style="color: var(--texto-suave); margin-bottom: 14px;">
            Ao bloquear esta assadeira, o lojista e seus atendentes <b>não conseguirão usar o sistema</b> até a regularização do pagamento. Uma tela de bloqueio com aviso será exibida.
          </p>

          <form id="form-bloquear-tenant" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Motivo do Bloqueio / Suspensão:</label>
              <textarea id="motivo-bloqueio" class="input" style="width: 100%; height: 75px; resize: vertical;" required>Mensalidade vencida há mais de 10 dias. Regularize sua fatura para liberar o acesso da sua assadeira.</textarea>
              <small style="color: var(--texto-suave); font-size: 11px;">Este texto aparecerá para o lojista na tela de aviso.</small>
            </div>

            <div style="background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #991B1B;">
              ⚠️ <b>Ação Reversível:</b> Assim que o cliente pagar a mensalidade, basta clicar em "Desbloquear" para reativar tudo sem qualquer perda de dados.
            </div>

            <div class="modal-botoes" style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
              <button type="submit" class="btn btn-primario" style="background: #DC2626; border-color: #B91C1C;">
                🛑 Confirmar Bloqueio Imediato
              </button>
            </div>
          </form>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#form-bloquear-tenant').onsubmit = (e) => {
          e.preventDefault();
          const motivo = el.querySelector('#motivo-bloqueio').value.trim();
          bloquearTenant(tenant.id, motivo);
          toast(`Assadeira "${tenant.nome}" foi bloqueada com sucesso.`, 'alerta');
          fechar();
          desenhar();
        };
      },
    });
  }

  function abrirModalAlterarPlano(tenant) {
    abrirModal({
      titulo: `Plano & Limites: ${tenant.nome} 🚀`,
      html: `
        <div style="font-size: 14px;">
          <p style="color: var(--texto-suave); margin-bottom: 14px;">
            Defina o plano contratado ou amplie os limites de vendas e recursos desta assadeira.
          </p>

          <form id="form-alterar-plano" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Plano Contratado:</label>
              <select id="novo-plano-id" class="select" style="width: 100%; height: 40px;">
                ${Object.values(PLANOS).map((p) => `
                  <option value="${p.id}" ${tenant.plano === p.id ? 'selected' : ''}>
                    ${p.nome} — ${p.precoFormatado} ${p.limiteVendasMes ? `(Até ${p.limiteVendasMes} vendas/mês)` : '(Vendas ilimitadas)'}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Dia de Vencimento da Mensalidade:</label>
              <input type="number" id="novo-dia-vencimento" class="input" min="1" max="31" value="${tenant.diaVencimento || 10}" style="width: 100%;" required />
            </div>

            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Status Financeiro:</label>
              <select id="novo-status-financeiro" class="select" style="width: 100%; height: 40px;">
                <option value="em_dia" ${tenant.mensalidadeStatus === 'em_dia' ? 'selected' : ''}>Em Dia (Mensalidade Paga)</option>
                <option value="atrasado" ${tenant.mensalidadeStatus === 'atrasado' ? 'selected' : ''}>Atrasado (Pendente de Pagamento)</option>
                <option value="gratis" ${tenant.mensalidadeStatus === 'gratis' ? 'selected' : ''}>Gratuito (Período de Testes / Isento)</option>
              </select>
            </div>

            <div class="modal-botoes" style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
              <button type="submit" class="btn btn-primario">💾 Salvar Alterações</button>
            </div>
          </form>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#form-alterar-plano').onsubmit = (e) => {
          e.preventDefault();
          const novoPlano = el.querySelector('#novo-plano-id').value;
          const diaVenc = parseInt(el.querySelector('#novo-dia-vencimento').value, 10) || 10;
          const statusFin = el.querySelector('#novo-status-financeiro').value;

          tenant.diaVencimento = diaVenc;
          tenant.mensalidadeStatus = statusFin;
          alterarPlanoTenant(tenant.id, novoPlano);

          toast(`Plano de "${tenant.nome}" atualizado para ${PLANOS[novoPlano]?.nome}!`, 'sucesso');
          fechar();
          desenhar();
        };
      },
    });
  }

  function abrirModalNovaAssadeira() {
    abrirModal({
      titulo: 'Cadastrar Nova Assadeira no SaaS 🍗✨',
      html: `
        <div style="font-size: 14px;">
          <p style="color: var(--texto-suave); margin-bottom: 14px;">
            Cadastre manualmente uma nova assadeira/frangaria que contratou a plataforma diretamente com você.
          </p>

          <form id="form-nova-assadeira" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Nome Comercial da Assadeira: *</label>
              <input type="text" id="novo-nome-loja" class="input" placeholder="Ex: Galeto da Brasa" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Nome do Proprietário: *</label>
                <input type="text" id="novo-resp" class="input" placeholder="Ex: Márcio Silva" required />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">WhatsApp: *</label>
                <input type="text" id="novo-whats" class="input" placeholder="(11) 99999-8888" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 10px;">
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Cidade - UF:</label>
                <input type="text" id="novo-cidade" class="input" placeholder="Ex: Ribeirão Preto - SP" value="São Paulo - SP" />
              </div>
              <div class="campo">
                <label style="font-weight: 700; color: var(--carvao);">Dia do Vencimento:</label>
                <input type="number" id="novo-venc" class="input" min="1" max="31" value="10" />
              </div>
            </div>

            <div class="campo">
              <label style="font-weight: 700; color: var(--carvao);">Plano Contratado:</label>
              <select id="novo-plano-sel" class="select" style="width: 100%; height: 40px;">
                ${Object.values(PLANOS).map((p) => `
                  <option value="${p.id}" ${p.id === 'plano-01' ? 'selected' : ''}>
                    ${p.nome} — ${p.precoFormatado}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="modal-botoes" style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
              <button type="submit" class="btn btn-primario">🎉 Criar Assadeira no Sistema</button>
            </div>
          </form>
        </div>
      `,
      aoAbrir: (el, fechar) => {
        el.querySelector('[data-fechar]').onclick = fechar;
        el.querySelector('#form-nova-assadeira').onsubmit = (e) => {
          e.preventDefault();
          const nome = el.querySelector('#novo-nome-loja').value.trim();
          const responsavel = el.querySelector('#novo-resp').value.trim();
          const celular = el.querySelector('#novo-whats').value.trim();
          const cidade = el.querySelector('#novo-cidade').value.trim();
          const plano = el.querySelector('#novo-plano-sel').value;
          const diaVencimento = parseInt(el.querySelector('#novo-venc').value, 10) || 10;

          cadastrarTenantManual({
            nome,
            responsavel,
            celular,
            cidade,
            plano,
            diaVencimento,
          });

          toast(`Assadeira "${nome}" cadastrada com sucesso!`, 'sucesso');
          fechar();
          desenhar();
        };
      },
    });
  }

  desenhar();
}
