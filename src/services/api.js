/**
 * CAMADA DE SERVIÇOS — Conexão Supabase Multi-tenant
 * ------------------------------------------------
 * Conecta com o banco de dados oficial do Supabase.
 * Mantém fallback para os dados de demonstração locais caso o banco esteja inacessível.
 */
import { supabase } from './supabase.js';
import { resumoVendas, resumoPedidos, PRODUTOS, CATEGORIAS } from '../data/mock.js';
import {
  loginTenant,
  cadastrarEstabelecimento,
  registrarVendaTenant,
  fazerUpgrade,
  configurarDominioCustom,
  verificarDominioCustom,
  logoutTenant,
  PLANOS,
} from '../data/tenants.js';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. AUTENTICAÇÃO E CADASTRO ────────────────────────────────

/**
 * Login: busca por celular, email, username ou nome no Supabase.
 * Retorna { usuario, tenant }.
 */
export async function loginDemo(identificador, senha) {
  if (senha === 'errada') throw new Error('Usuário ou senha incorretos.');
  if (senha && senha.length < 4) throw new Error('A senha ou PIN deve ter pelo menos 4 dígitos.');

  const termo = (identificador || '').trim();
  const apenasDigitos = termo.replace(/\D/g, '');

  if (supabase) {
    try {
      // 1. Tenta buscar no Supabase
      let query = supabase
        .from('profiles')
        .select('*, tenants(*)');

      // Se informou números suficientes, busca por celular
      if (apenasDigitos.length >= 8) {
        query = query.or(`celular.eq.${apenasDigitos},email.ilike.%${termo}%,username.ilike.%${termo}%,nome.ilike.%${termo}%`);
      } else if (termo.includes('@')) {
        query = query.ilike('email', termo);
      } else {
        query = query.or(`username.ilike.%${termo}%,nome.ilike.%${termo}%`);
      }

      const { data, error } = await query.limit(1);

      if (!error && data && data.length > 0) {
        const p = data[0];
        const tenant = p.tenants;

        const usuarioObj = {
          id: p.id,
          tenantId: p.tenant_id,
          nome: p.nome,
          celular: p.celular,
          email: p.email,
          username: p.username,
          perfil: p.role || 'owner',
        };

        const tenantObj = {
          id: tenant.id,
          slug: tenant.slug,
          nome: tenant.nome,
          cnpj: tenant.cnpj,
          plano: tenant.plano || 'plano-00',
          planoAtivadoEm: tenant.plano_ativado_em,
          dominioCustom: tenant.dominio_custom,
          dominioCustomStatus: tenant.dominio_custom_status,
          vendasMesAtual: tenant.vendas_mes_atual || 0,
        };

        sessionStorage.setItem('fa-tenant-ativo', tenantObj.id);
        return { usuario: usuarioObj, tenant: tenantObj };
      }
    } catch (err) {
      console.warn('[Ao Ponto] Erro ao consultar Supabase no login, usando fallback:', err);
    }
  }

  // Fallback para mock local
  await esperar(350);
  return loginTenant(identificador, senha);
}

/**
 * Cadastro de novo estabelecimento + perfil no Supabase.
 */
export async function cadastrar(dados) {
  const { nomeEstabelecimento, slug, celular, email, nome } = dados;

  if (supabase) {
    try {
      // 1. Verifica se o slug já existe
      const { data: existente } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existente) {
        throw new Error('Este endereço já está em uso. Escolha outro.');
      }

      // 2. Insere o Tenant
      const { data: tenant, error: tErr } = await supabase
        .from('tenants')
        .insert({
          slug,
          nome: nomeEstabelecimento,
          plano: 'plano-00',
          vendas_mes_atual: 0,
        })
        .select()
        .single();

      if (tErr) throw tErr;

      // 3. Insere o Perfil do Dono
      const celLimpo = (celular || '').replace(/\D/g, '');
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .insert({
          tenant_id: tenant.id,
          nome,
          celular: celLimpo,
          email: email || `${slug}@aoponto.app`,
          username: slug,
          role: 'owner',
        })
        .select()
        .single();

      if (pErr) throw pErr;

      // 4. Cria categorias e produtos padrão para o novo estabelecimento
      try {
        const { data: catFrangos } = await supabase
          .from('categorias')
          .insert({ tenant_id: tenant.id, nome: 'Frangos Assados', ordem: 1 })
          .select()
          .single();

        if (catFrangos) {
          await supabase.from('produtos').insert([
            {
              tenant_id: tenant.id,
              categoria_id: catFrangos.id,
              nome: 'Frango Inteiro Assado',
              descricao: 'Com farofa crocante e tempero especial',
              preco: 48.00,
              tipo_preco: 'unidade',
              emoji: '🍗',
            },
            {
              tenant_id: tenant.id,
              categoria_id: catFrangos.id,
              nome: 'Meio Frango Assado',
              descricao: 'Porção para 2 pessoas',
              preco: 26.00,
              tipo_preco: 'unidade',
              emoji: '🍗',
            },
          ]);
        }
      } catch (seedErr) {
        console.warn('Erro ao criar catálogo padrão:', seedErr);
      }

      const usuarioObj = {
        id: profile.id,
        tenantId: tenant.id,
        nome: profile.nome,
        celular: profile.celular,
        email: profile.email,
        username: profile.username,
        perfil: 'owner',
      };

      const tenantObj = {
        id: tenant.id,
        slug: tenant.slug,
        nome: tenant.nome,
        plano: tenant.plano,
        vendasMesAtual: tenant.vendas_mes_atual,
      };

      sessionStorage.setItem('fa-tenant-ativo', tenantObj.id);
      return { tenant: tenantObj, usuario: usuarioObj };
    } catch (err) {
      if (err.message) throw err;
      console.warn('[Ao Ponto] Erro no cadastro Supabase, usando fallback:', err);
    }
  }

  // Fallback mock local
  await esperar(400);
  return cadastrarEstabelecimento(dados);
}

/** Logout */
export async function logout() {
  logoutTenant();
}

// ── 2. CATÁLOGO DE PRODUTOS ───────────────────────────────────

export async function buscarCatalogo(tenantId) {
  if (supabase && tenantId) {
    try {
      const { data: prods, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('ativo', true);

      if (!error && prods && prods.length > 0) {
        return prods.map((p) => ({
          id: p.id,
          nome: p.nome,
          categoria: p.categoria_id,
          forma: p.tipo_preco === 'kg' ? 'peso' : 'unidade',
          preco: Number(p.preco),
          precoKg: p.tipo_preco === 'kg' ? Number(p.preco) : null,
          gramasMedia: 400,
          emoji: p.emoji || '🍗',
          desc: p.descricao || '',
        }));
      }
    } catch (err) {
      console.warn('[Ao Ponto] Erro ao buscar catálogo no Supabase:', err);
    }
  }
  return PRODUTOS;
}

// ── 3. RESERVAS E PEDIDOS ─────────────────────────────────────

export async function buscarPedidosDoBanco(tenantId) {
  if (supabase && tenantId) {
    try {
      const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (!error && pedidos) {
        return pedidos.map((p) => ({
          id: p.id,
          cliente: p.cliente_nome,
          telefone: p.cliente_celular || '',
          data: p.data_retirada,
          hora: p.horario_retirada,
          status: p.status,
          total: Number(p.total),
          obs: p.observacoes || '',
          itens: (p.itens_pedido || []).map((it) => ({
            nome: it.produto_nome,
            qtd: Number(it.quantidade),
            precoUnit: Number(it.preco_unitario),
            obs: it.observacao,
          })),
        }));
      }
    } catch (err) {
      console.warn('[Ao Ponto] Erro ao buscar pedidos no Supabase:', err);
    }
  }
  return null;
}

export async function salvarPedidoNoBanco(tenantId, dados) {
  if (supabase && tenantId) {
    try {
      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert({
          tenant_id: tenantId,
          cliente_nome: dados.cliente,
          cliente_celular: dados.telefone,
          data_retirada: dados.data === 'hoje' ? new Date().toISOString().slice(0, 10) : dados.data,
          horario_retirada: dados.hora || '12:00',
          status: dados.status || 'confirmado',
          total: dados.total,
          observacoes: dados.itens?.[0]?.obs || '',
        })
        .select()
        .single();

      if (!error && pedido && dados.itens?.length > 0) {
        const itensFormatados = dados.itens.map((it) => ({
          pedido_id: pedido.id,
          produto_nome: it.nome,
          quantidade: it.qtd,
          preco_unitario: it.precoUnit || 0,
        }));
        await supabase.from('itens_pedido').insert(itensFormatados);
      }
      return pedido;
    } catch (err) {
      console.warn('[Ao Ponto] Erro ao gravar pedido no Supabase:', err);
    }
  }
  return null;
}

// ── 4. VENDAS (PDV / CAIXA RÁPIDO) ────────────────────────────

export async function registrarVenda(dadosVenda, tenantId) {
  if (supabase && tenantId) {
    try {
      // 1. Grava a Venda
      const { data: venda, error: vErr } = await supabase
        .from('vendas')
        .insert({
          tenant_id: tenantId,
          total: dadosVenda.total,
          forma_pagamento: dadosVenda.pagamento?.metodo || 'pix',
          valor_recebido: dadosVenda.pagamento?.valorRecebido || dadosVenda.total,
          troco: dadosVenda.pagamento?.troco || 0,
          cliente_nome: dadosVenda.cliente?.nome || null,
          cliente_celular: dadosVenda.cliente?.telefone || null,
        })
        .select()
        .single();

      if (!vErr && venda && dadosVenda.itens?.length > 0) {
        const itens = dadosVenda.itens.map((it) => ({
          venda_id: venda.id,
          produto_nome: it.nome,
          quantidade: it.qtd || (it.pesoGramas ? it.pesoGramas / 1000 : 1),
          preco_unitario: it.precoUnitario,
          subtotal: it.total,
        }));
        await supabase.from('itens_venda').insert(itens);

        // 2. Incrementa contador de vendas do mês
        await supabase.rpc('incrementar_venda_tenant', { p_tenant_id: tenantId });
      }
    } catch (err) {
      console.warn('[Ao Ponto] Erro ao registrar venda no Supabase:', err);
    }
  }

  // Atualiza contador no tenant mock
  registrarVendaTenant();
  return dadosVenda;
}

// ── 5. DASHBOARD ──────────────────────────────────────────────

export async function buscarDashboard({ pontos, inicio, fim, grupo, anterior }) {
  await esperar(200);
  return {
    atual: resumoVendas(pontos, inicio, fim, grupo),
    anterior: resumoVendas(pontos, anterior.inicio, anterior.fim, 'dia'),
    pedidos: resumoPedidos(pontos, inicio, fim),
  };
}

// ── 6. PLANOS & DOMÍNIO ───────────────────────────────────────

export async function buscarPlanos() {
  await esperar(100);
  return Object.values(PLANOS);
}

export async function upgradePlano(planoId) {
  await esperar(800);
  return fazerUpgrade(planoId);
}

export async function salvarDominioCustom(dominio) {
  await esperar(400);
  return configurarDominioCustom(dominio);
}

export async function checarDominioCustom() {
  return verificarDominioCustom();
}
