/**
 * GERENCIADOR DE PRODUTOS E CARDÁPIO — Ao Ponto
 * Permite cadastrar, editar, excluir e alternar disponibilidade de produtos no balcão.
 * Integração com LocalStorage + Supabase.
 */
import { PRODUTOS as PRODUTOS_PADRAO, CATEGORIAS } from '../data/mock.js';
import { supabase } from '../services/supabase.js';

const STORAGE_KEY_PRODUTOS = 'ao-ponto-produtos-custom';

export function getCategoriasProdutos() {
  return CATEGORIAS;
}

export function carregarProdutosLocais() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_PRODUTOS);
    if (salvo) {
      const lista = JSON.parse(salvo);
      if (Array.isArray(lista) && lista.length > 0) {
        const mapaPadrao = new Map(PRODUTOS_PADRAO.map((p) => [p.id, p]));
        return lista.map((p) => {
          const padrao = mapaPadrao.get(p.id);
          if (padrao) {
            return {
              ...p,
              iconeUrl: p.iconeUrl || padrao.iconeUrl,
            };
          }
          return p;
        });
      }
    }
  } catch (_) {}
  return JSON.parse(JSON.stringify(PRODUTOS_PADRAO));
}

export function salvarProdutosLocais(produtos) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUTOS, JSON.stringify(produtos));
  } catch (_) {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ao-ponto:produtos-atualizados', { detail: produtos }));
  }
}

export async function listarProdutos(tenantId = null) {
  // 1. Tenta carregar do Supabase se tenantId fornecido
  if (supabase && tenantId) {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapeados = data.map((p) => ({
          id: p.id,
          nome: p.nome,
          categoria: p.categoria_id || 'frangos',
          forma: p.tipo_preco === 'kg' ? 'peso' : 'unidade',
          preco: Number(p.preco) || 0,
          precoKg: p.tipo_preco === 'kg' ? Number(p.preco) : null,
          gramasMedia: 400,
          emoji: p.emoji || '🍗',
          desc: p.descricao || '',
          ativo: p.ativo !== false,
        }));
        salvarProdutosLocais(mapeados);
        return mapeados;
      }
    } catch (err) {
      console.warn('[Produtos] Falha ao carregar do Supabase, usando local:', err);
    }
  }

  return carregarProdutosLocais();
}

export async function salvarProduto(produto, tenantId = null) {
  const lista = carregarProdutosLocais();
  const index = lista.findIndex((p) => p.id === produto.id);

  const formatado = {
    id: produto.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nome: produto.nome.trim(),
    categoria: produto.categoria || 'frangos',
    forma: produto.forma || 'unidade', // 'unidade', 'meia', 'peso', 'porcao'
    preco: parseFloat(produto.preco) || 0,
    precoKg: produto.forma === 'peso' ? parseFloat(produto.precoKg || produto.preco) : null,
    gramasMedia: produto.forma === 'peso' ? (parseInt(produto.gramasMedia) || 400) : null,
    iconeUrl: produto.iconeUrl || null,
    emoji: produto.emoji || '🍗',
    desc: (produto.desc || '').trim(),
    ativo: produto.ativo !== false,
  };

  if (index >= 0) {
    lista[index] = { ...lista[index], ...formatado };
  } else {
    lista.push(formatado);
  }

  salvarProdutosLocais(lista);

  // Sincroniza com Supabase se disponível
  if (supabase && tenantId) {
    try {
      const payload = {
        tenant_id: tenantId,
        nome: formatado.nome,
        descricao: formatado.desc,
        preco: formatado.forma === 'peso' ? formatado.precoKg : formatado.preco,
        tipo_preco: formatado.forma === 'peso' ? 'kg' : 'unidade',
        emoji: formatado.emoji,
        ativo: formatado.ativo,
      };

      if (index >= 0 && produto.id && !produto.id.startsWith('prod_')) {
        await supabase.from('produtos').update(payload).eq('id', produto.id);
      } else {
        await supabase.from('produtos').insert([payload]);
      }
    } catch (err) {
      console.warn('[Produtos] Erro ao sincronizar com Supabase:', err);
    }
  }

  return formatado;
}

export async function excluirProduto(id, tenantId = null) {
  let lista = carregarProdutosLocais();
  lista = lista.filter((p) => p.id !== id);
  salvarProdutosLocais(lista);

  if (supabase && tenantId && !id.startsWith('prod_') && id.length > 20) {
    try {
      await supabase.from('produtos').delete().eq('id', id);
    } catch (_) {}
  }
  return true;
}

export function redefinirProdutosPadrao() {
  const padrao = JSON.parse(JSON.stringify(PRODUTOS_PADRAO));
  salvarProdutosLocais(padrao);
  return padrao;
}

