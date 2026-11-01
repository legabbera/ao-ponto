/**
 * TELA DE USUÁRIOS, EQUIPE & PERMISSÕES (Ao Ponto)
 * Gestão de operadores de caixa, frangueiros, gerentes e proprietários.
 */
import { icone } from '../components/icons.js';
import { toast, abrirModal } from '../components/ui.js';
import { store } from '../state/store.js';
import { PONTOS, PERFIS } from '../data/mock.js';
import { 
  listarUsuariosTenant, 
  adicionarUsuarioTenant, 
  atualizarUsuarioTenant, 
  removerUsuarioTenant 
} from '../data/tenants.js';

export function renderUsuarios(raiz, irPara) {
  const st = store.get();
  const perfilAtual = PERFIS[st.perfil] || PERFIS.owner;
  const tenant = store.getTenant();

  function desenhar() {
    const usuarios = listarUsuariosTenant(tenant?.id);
    const totalMembros = usuarios.length;
    const owners = usuarios.filter((u) => u.perfil === 'owner');
    const admins = usuarios.filter((u) => u.perfil === 'admin');
    const vendedores = usuarios.filter((u) => u.perfil === 'vendedor');

    raiz.innerHTML = `
    <div class="usuarios-container">
      <!-- Topo -->
      <div class="clientes-topo" style="margin-bottom: 20px;">
        <div class="clientes-topo-info">
          <h1>Equipe &bull; Usuários & Permissões 👥🔐</h1>
          <p>
            <span class="badge badge-demo">${icone('local', 'mini')} ${tenant?.nome || 'Ao Ponto Assados'}</span>
            &bull; Gerencie frangueiros, operadores de caixa, gerentes e níveis de acesso
          </p>
        </div>
        <div class="clientes-topo-acoes">
          <button class="btn btn-primario" id="btn-novo-usuario">
            ${icone('mais')} Convidar Membro
          </button>
        </div>
      </div>

      <!-- Banner do Usuário Atual Conectado -->
      <div style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); border: 1.5px solid #FDBA74; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: var(--brasa, #EA580C); color: #fff; display: grid; place-items: center; font-size: 22px;">
            ${perfilAtual.emoji || '👨‍🍳'}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="font-size: 15px; color: var(--carvao);">${perfilAtual.nome}</strong>
              <span class="badge badge-primario" style="font-size: 11px;">Sessão Ativa: ${perfilAtual.papel}</span>
            </div>
            <small style="color: var(--texto-suave); display: block; margin-top: 2px;">
              Você tem permissão para visualizar e gerenciar os membros da equipe desta unidade.
            </small>
          </div>
        </div>
        <button class="btn btn-pequeno btn-secundario" id="btn-trocar-perfil-rapido">
          🔄 Testar outro perfil na tela
        </button>
      </div>

      <!-- KPIs da Equipe -->
      <div class="clientes-kpis" style="margin-bottom: 22px;">
        <div class="kpi-card">
          <div class="kpi-rotulo">Total na Equipe</div>
          <div class="kpi-valor">${totalMembros}</div>
          <div class="kpi-sub">Colaboradores cadastrados</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Proprietários (Owners)</div>
          <div class="kpi-valor" style="color: #9A3412;">${owners.length}</div>
          <div class="kpi-sub">Acesso total e faturamento</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Gerentes / Admins</div>
          <div class="kpi-valor" style="color: #2563EB;">${admins.length}</div>
          <div class="kpi-sub">Estoque, equipe e clientes</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-rotulo">Operadores de Balcão / Caixa</div>
          <div class="kpi-valor" style="color: #16A34A;">${vendedores.length}</div>
          <div class="kpi-sub">Vendas rápidas e encomendas</div>
        </div>
      </div>

      <!-- Resumo Visual dos Níveis de Acesso (Cargos) -->
      <div style="background: var(--branco); border: 1.5px solid var(--borda); border-radius: var(--raio); padding: 18px; margin-bottom: 22px; box-shadow: var(--sombra);">
        <h3 style="font-size: 15px; font-weight: 800; margin: 0 0 12px; color: var(--carvao); display: flex; align-items: center; gap: 8px;">
          <span>🛡️</span> Níveis de Acesso e Permissões no Sistema
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
          
          <div style="background: #FFFBF5; border: 1px solid #FED7AA; border-radius: 10px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #9A3412; font-size: 13px;">👑 Proprietário (Owner)</strong>
              <span class="badge" style="background: #FFEDD5; color: #C2410C; font-size: 10px;">Acesso Total</span>
            </div>
            <p style="font-size: 12px; color: var(--texto-suave); margin: 0; line-height: 1.4;">
              Controle absoluto: relatórios financeiros consolidados, configurações de domínio, plano SaaS, pagamentos e exclusões.
            </p>
          </div>

          <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 10px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #0369A1; font-size: 13px;">👔 Administrador / Gerente</strong>
              <span class="badge" style="background: #E0F2FE; color: #0284C7; font-size: 10px;">Gerencial</span>
            </div>
            <p style="font-size: 12px; color: var(--texto-suave); margin: 0; line-height: 1.4;">
              Gerenciamento operacional: controle de estoque da brasa, CRM e fidelidade de clientes, disparos de WhatsApp e equipe.
            </p>
          </div>

          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #15803D; font-size: 13px;">🍗 Vendedor / Frangueiro / Caixa</strong>
              <span class="badge" style="background: #DCFCE7; color: #16A34A; font-size: 10px;">Operação</span>
            </div>
            <p style="font-size: 12px; color: var(--texto-suave); margin: 0; line-height: 1.4;">
              Focado na agilidade: PDV de caixa rápido com pesagem, registro de reservas, pedidos na máquina e consulta de saldo de selos.
            </p>
          </div>

        </div>
      </div>

      <!-- Tabela da Equipe -->
      <div class="cartao" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--borda); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--carvao);">Membros da Equipe Cadastrados</h3>
            <small style="color: var(--texto-suave);">Colaboradores com acesso ao sistema do seu estabelecimento</small>
          </div>
          <span class="badge badge-demo">${usuarios.length} Ativos</span>
        </div>

        <div style="overflow-x: auto;">
          <table class="tabela" style="width: 100%; font-size: 13px; margin: 0;">
            <thead>
              <tr style="background: var(--creme); text-align: left;">
                <th style="padding: 12px 18px;">Membro / Nome</th>
                <th style="padding: 12px 16px;">Contato</th>
                <th style="padding: 12px 16px;">Cargo / Função</th>
                <th style="padding: 12px 16px;">Nível de Acesso</th>
                <th style="padding: 12px 16px;">Unidade / Pontos</th>
                <th style="padding: 12px 16px;">Status</th>
                <th style="padding: 12px 18px; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${usuarios.map((u) => {
                const badgePerfil = {
                  owner: { label: 'Proprietário', bg: '#FFEDD5', color: '#C2410C', icone: '👑' },
                  admin: { label: 'Gerente / Admin', bg: '#E0F2FE', color: '#0369A1', icone: '👔' },
                  vendedor: { label: 'Caixa / Balcão', bg: '#DCFCE7', color: '#15803D', icone: '🍗' },
                }[u.perfil || 'vendedor'] || { label: 'Operador', bg: '#F1F5F9', color: '#475569', icone: '👤' };

                const iniciais = (u.nome || 'Membro').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
                const isUsuarioLogado = st.usuario?.id === u.id || (st.perfil === u.perfil && u.perfil === 'owner');

                const pontosTexto = (u.pontos || ['todos']).includes('todos')
                  ? 'Todas as unidades'
                  : (u.pontos || []).map((pid) => PONTOS.find((p) => p.id === pid)?.nome || pid).join(', ');

                return `
                  <tr>
                    <td style="padding: 14px 18px;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--carvao), #3D2A20); color: #fff; font-weight: 800; display: grid; place-items: center; font-size: 13px;">
                          ${iniciais}
                        </div>
                        <div>
                          <strong style="color: var(--carvao); font-size: 14px; display: block;">${u.nome}</strong>
                          <small style="color: var(--texto-suave);">${u.email || 'Sem e-mail'}</small>
                        </div>
                      </div>
                    </td>

                    <td style="padding: 14px 16px;">
                      <span style="font-family: monospace; font-size: 12px; font-weight: 600;">
                        ${u.celularFormatado || u.celular || 'Não cadastrado'}
                      </span>
                    </td>

                    <td style="padding: 14px 16px;">
                      <span style="font-weight: 600; color: var(--carvao);">${u.cargo || 'Operador'}</span>
                    </td>

                    <td style="padding: 14px 16px;">
                      <span class="badge" style="background: ${badgePerfil.bg}; color: ${badgePerfil.color}; font-weight: 700;">
                        ${badgePerfil.icone} ${badgePerfil.label}
                      </span>
                    </td>

                    <td style="padding: 14px 16px; color: var(--texto-suave); font-size: 12px;">
                      ${pontosTexto}
                    </td>

                    <td style="padding: 14px 16px;">
                      <span class="badge ${u.status === 'inativo' ? 'badge-perigo' : 'badge-sucesso'}" style="font-size: 10px;">
                        ${u.status === 'inativo' ? 'Inativo' : 'Ativo'}
                      </span>
                    </td>

                    <td style="padding: 14px 18px; text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button class="btn btn-pequeno btn-contorno btn-editar-usuario" data-id="${u.id}" title="Editar membro">
                          ✏️ Editar
                        </button>
                        ${u.perfil !== 'owner' ? `
                          <button class="btn btn-pequeno btn-texto btn-perigo-suave btn-remover-usuario" data-id="${u.id}" data-nome="${u.nome}" title="Remover da equipe">
                            🗑️
                          </button>
                        ` : `
                          <span style="font-size: 11px; color: var(--texto-suave); padding: 4px 6px;">(Principal)</span>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `;

    vincularEventos();
  }

  function vincularEventos() {
    // Convidar Novo Membro
    raiz.querySelector('#btn-novo-usuario')?.addEventListener('click', () => {
      abrirModalNovoUsuario(() => desenhar());
    });

    // Troca rápida de perfil para demonstração
    raiz.querySelector('#btn-trocar-perfil-rapido')?.addEventListener('click', () => {
      abrirModalTrocarPerfil(irPara);
    });

    // Editar Usuário
    raiz.querySelectorAll('.btn-editar-usuario').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const usuarios = listarUsuariosTenant(tenant?.id);
        const user = usuarios.find((u) => u.id === id);
        if (user) {
          abrirModalEditarUsuario(user, () => desenhar());
        }
      });
    });

    // Remover Usuário
    raiz.querySelectorAll('.btn-remover-usuario').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const nome = btn.dataset.nome;
        if (confirm(`Tem certeza que deseja remover ${nome} da equipe?`)) {
          try {
            removerUsuarioTenant(id);
            toast(`${nome} removido da equipe.`, 'info');
            desenhar();
          } catch (err) {
            toast(err.message, 'erro');
          }
        }
      });
    });
  }

  desenhar();
}

// ── Modais de Gestão de Usuários ──

function abrirModalNovoUsuario(onSalvar) {
  abrirModal({
    titulo: 'Convidar Novo Membro da Equipe 👤',
    html: `
      <div class="form-modal-usuario">
        <p style="font-size: 13px; color: var(--texto-suave); margin-bottom: 14px;">
          Cadastre os dados do colaborador para liberar o acesso ao sistema da sua assadeira:
        </p>

        <div class="campo">
          <label>Nome Completo: *</label>
          <input type="text" id="novo-user-nome" class="input" placeholder="Ex: Rodrigo Alencar" autofocus />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>WhatsApp / Celular: *</label>
            <input type="text" id="novo-user-celular" class="input" placeholder="(11) 98888-7777" />
          </div>
          <div class="campo">
            <label>E-mail: *</label>
            <input type="email" id="novo-user-email" class="input" placeholder="rodrigo@email.com" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Função / Cargo na Loja:</label>
            <input type="text" id="novo-user-cargo" class="input" placeholder="Ex: Operador de Caixa / Frangueiro" value="Operador de Caixa" />
          </div>
          <div class="campo">
            <label>Nível de Permissão: *</label>
            <select id="novo-user-perfil" class="select">
              <option value="vendedor">🍗 Vendedor / Caixa (PDV e Pedidos)</option>
              <option value="admin">👔 Gerente / Admin (Estoque e Clientes)</option>
              <option value="owner">👑 Proprietário (Acesso Completo)</option>
            </select>
          </div>
        </div>

        <div class="campo" style="margin-top: 10px;">
          <label>Unidade / Ponto de Venda Autorizado:</label>
          <select id="novo-user-ponto" class="select">
            <option value="todos">Todas as Unidades (Geral)</option>
            ${PONTOS.map((p) => `<option value="${p.id}">${p.nome}</option>`).join('')}
          </select>
        </div>

        <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
          <button type="button" class="btn btn-primario" id="btn-confirmar-novo-user">
            ${icone('mais')} Convidar e Salvar
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-confirmar-novo-user')?.addEventListener('click', () => {
        const nome = el.querySelector('#novo-user-nome')?.value.trim();
        const celular = el.querySelector('#novo-user-celular')?.value.trim();
        const email = el.querySelector('#novo-user-email')?.value.trim();
        const cargo = el.querySelector('#novo-user-cargo')?.value.trim();
        const perfil = el.querySelector('#novo-user-perfil')?.value;
        const ponto = el.querySelector('#novo-user-ponto')?.value;

        if (!nome) return toast('Informe o nome completo do membro.', 'erro');
        if (!celular) return toast('Informe o telefone/WhatsApp com DDD.', 'erro');

        try {
          adicionarUsuarioTenant({
            nome,
            celular,
            email,
            cargo,
            perfil,
            pontos: [ponto],
            status: 'ativo',
          });
          toast(`Membro "${nome}" cadastrado com sucesso na equipe!`, 'sucesso');
          fechar();
          onSalvar?.();
        } catch (err) {
          toast(err.message, 'erro');
        }
      });
    },
  });
}

function abrirModalEditarUsuario(user, onSalvar) {
  abrirModal({
    titulo: `Editar Membro: ${user.nome}`,
    html: `
      <div class="form-modal-usuario">
        <div class="campo">
          <label>Nome Completo:</label>
          <input type="text" id="edit-user-nome" class="input" value="${user.nome}" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>WhatsApp / Celular:</label>
            <input type="text" id="edit-user-celular" class="input" value="${user.celularFormatado || user.celular || ''}" />
          </div>
          <div class="campo">
            <label>E-mail:</label>
            <input type="email" id="edit-user-email" class="input" value="${user.email || ''}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Função / Cargo na Loja:</label>
            <input type="text" id="edit-user-cargo" class="input" value="${user.cargo || ''}" />
          </div>
          <div class="campo">
            <label>Nível de Permissão:</label>
            <select id="edit-user-perfil" class="select" ${user.perfil === 'owner' ? 'disabled' : ''}>
              <option value="vendedor" ${user.perfil === 'vendedor' ? 'selected' : ''}>🍗 Vendedor / Caixa</option>
              <option value="admin" ${user.perfil === 'admin' ? 'selected' : ''}>👔 Gerente / Admin</option>
              <option value="owner" ${user.perfil === 'owner' ? 'selected' : ''}>👑 Proprietário</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
          <div class="campo">
            <label>Unidade Autorizada:</label>
            <select id="edit-user-ponto" class="select">
              <option value="todos" ${(user.pontos || []).includes('todos') ? 'selected' : ''}>Todas as Unidades</option>
              ${PONTOS.map((p) => `
                <option value="${p.id}" ${(user.pontos || []).includes(p.id) ? 'selected' : ''}>${p.nome}</option>
              `).join('')}
            </select>
          </div>
          <div class="campo">
            <label>Status do Membro:</label>
            <select id="edit-user-status" class="select">
              <option value="ativo" ${user.status !== 'inativo' ? 'selected' : ''}>🟢 Ativo</option>
              <option value="inativo" ${user.status === 'inativo' ? 'selected' : ''}>⚪ Inativo (Acesso suspenso)</option>
            </select>
          </div>
        </div>

        <div class="modal-botoes" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 8px;">
          <button type="button" class="btn btn-contorno" data-fechar>Cancelar</button>
          <button type="button" class="btn btn-primario" id="btn-confirmar-edit-user">
            Salvar Alterações
          </button>
        </div>
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelector('#btn-confirmar-edit-user')?.addEventListener('click', () => {
        const nome = el.querySelector('#edit-user-nome')?.value.trim();
        const celular = el.querySelector('#edit-user-celular')?.value.trim();
        const email = el.querySelector('#edit-user-email')?.value.trim();
        const cargo = el.querySelector('#edit-user-cargo')?.value.trim();
        const perfil = el.querySelector('#edit-user-perfil')?.value;
        const ponto = el.querySelector('#edit-user-ponto')?.value;
        const status = el.querySelector('#edit-user-status')?.value;

        if (!nome) return toast('O nome não pode ficar vazio.', 'erro');

        try {
          atualizarUsuarioTenant(user.id, {
            nome,
            celular: (celular || '').replace(/\D/g, ''),
            celularFormatado: celular,
            email,
            cargo,
            ...(user.perfil !== 'owner' ? { perfil } : {}),
            pontos: [ponto],
            status,
          });
          toast('Dados do membro atualizados!', 'sucesso');
          fechar();
          onSalvar?.();
        } catch (err) {
          toast(err.message, 'erro');
        }
      });
    },
  });
}

function abrirModalTrocarPerfil(irPara) {
  const perfis = Object.values(PERFIS);
  abrirModal({
    titulo: 'Simular Visão de Outro Perfil (Demonstração)',
    html: `
      <div style="font-size: 13px; color: var(--texto-suave); margin-bottom: 14px;">
        Escolha abaixo para ver instantaneamente a interface e as permissões de cada membro da equipe:
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${perfis.map((p) => `
          <button class="btn btn-bloco btn-contorno btn-escolher-perfil-sim" data-perfil="${p.id}" style="text-align: left; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">${p.emoji}</span>
              <div>
                <strong style="color: var(--carvao); font-size: 14px; display: block;">${p.nome}</strong>
                <small style="color: var(--texto-suave);">${p.papel}</small>
              </div>
            </div>
            <span class="badge" style="font-size: 11px;">Entrar como &rarr;</span>
          </button>
        `).join('')}
      </div>
    `,
    aoAbrir: (el, fechar) => {
      el.querySelectorAll('.btn-escolher-perfil-sim').forEach((btn) => {
        btn.addEventListener('click', () => {
          const pid = btn.dataset.perfil;
          store.setPerfil(pid);
          toast(`Agora você está navegando como ${PERFIS[pid].nome} (${PERFIS[pid].papel})!`, 'info');
          fechar();
          irPara('usuarios');
        });
      });
    },
  });
}

