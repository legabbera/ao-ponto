-- ============================================================
-- BANCO DE DADOS: AO PONTO (SaaS Multi-tenant)
-- Script oficial de criação de tabelas, índices e políticas RLS
-- ============================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. TABELA: tenants (Estabelecimentos / Lojas)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cnpj TEXT,
  plano TEXT NOT NULL DEFAULT 'plano-00', -- 'plano-00' (Grátis - 10 vendas) ou 'plano-01' (Balcão - R$ 79)
  plano_ativado_em DATE DEFAULT CURRENT_DATE,
  dominio_custom TEXT,
  dominio_custom_status TEXT, -- 'pendente', 'ativo'
  vendas_mes_atual INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. TABELA: profiles (Usuários / Operadores dos Estabelecimentos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  celular TEXT,
  email TEXT,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'owner', -- 'owner', 'admin', 'vendedor'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. TABELA: categorias (Categorias de Produtos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 5. TABELA: produtos (Catálogo de Venda)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL,
  tipo_preco TEXT NOT NULL DEFAULT 'unidade', -- 'unidade' ou 'kg'
  emoji TEXT DEFAULT '🍗',
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 6. TABELA: pedidos (Encomendas e Reservas de Fim de Semana)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_celular TEXT,
  data_retirada DATE NOT NULL DEFAULT CURRENT_DATE,
  horario_retirada TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando', -- 'aguardando', 'confirmado', 'preparo', 'pronto', 'entregue', 'cancelado'
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade NUMERIC(10,3) NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  observacao TEXT
);

-- ============================================================
-- 7. TABELA: vendas (Caixa Rápido / PDV)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  ponto_id TEXT DEFAULT 'ponto-1',
  total NUMERIC(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL, -- 'pix', 'dinheiro', 'debito', 'credito'
  valor_recebido NUMERIC(10,2),
  troco NUMERIC(10,2) DEFAULT 0.00,
  cliente_nome TEXT,
  cliente_celular TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Itens da Venda
CREATE TABLE IF NOT EXISTS public.itens_venda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venda_id UUID REFERENCES public.vendas(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  quantidade NUMERIC(10,3) NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- 8. ÍNDICES DE PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_celular ON public.profiles(celular);
CREATE INDEX IF NOT EXISTS idx_produtos_tenant ON public.produtos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_tenant ON public.pedidos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON public.pedidos(data_retirada);
CREATE INDEX IF NOT EXISTS idx_vendas_tenant ON public.vendas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON public.vendas(created_at);

-- ============================================================
-- 9. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_venda ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso permissivo para a fase inicial com Anon Key
CREATE POLICY "Permitir leitura publica de tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Permitir criacao de tenants" ON public.tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de tenants" ON public.tenants FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura de perfis" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir criacao de perfis" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de perfis" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Permitir tudo em categorias" ON public.categorias FOR ALL USING (true);
CREATE POLICY "Permitir tudo em produtos" ON public.produtos FOR ALL USING (true);
CREATE POLICY "Permitir tudo em pedidos" ON public.pedidos FOR ALL USING (true);
CREATE POLICY "Permitir tudo em itens_pedido" ON public.itens_pedido FOR ALL USING (true);
CREATE POLICY "Permitir tudo em vendas" ON public.vendas FOR ALL USING (true);
CREATE POLICY "Permitir tudo em itens_venda" ON public.itens_venda FOR ALL USING (true);

-- ============================================================
-- 10. DADOS INICIAIS (SEED - Estabelecimento Demo Oficial)
-- ============================================================
DO $$
DECLARE
  v_tenant_id UUID;
  v_cat_frangos UUID;
  v_cat_carnes UUID;
  v_cat_acomp UUID;
  v_cat_bebidas UUID;
BEGIN
  -- Cria o Tenant Demo se não existir
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE slug = 'frango-demo') THEN
    INSERT INTO public.tenants (slug, nome, plano, vendas_mes_atual)
    VALUES ('frango-demo', 'Frango Assado do Zé', 'plano-00', 3)
    RETURNING id INTO v_tenant_id;

    -- Cria o usuário Demo
    INSERT INTO public.profiles (tenant_id, nome, celular, email, username, role)
    VALUES (v_tenant_id, 'José Carlos (Zé)', '11987654321', 'demo@aoponto.app', 'ze', 'owner');

    -- Categorias
    INSERT INTO public.categorias (tenant_id, nome, ordem) VALUES (v_tenant_id, 'Frangos Assados', 1) RETURNING id INTO v_cat_frangos;
    INSERT INTO public.categorias (tenant_id, nome, ordem) VALUES (v_tenant_id, 'Carnes & Espetos', 2) RETURNING id INTO v_cat_carnes;
    INSERT INTO public.categorias (tenant_id, nome, ordem) VALUES (v_tenant_id, 'Acompanhamentos', 3) RETURNING id INTO v_cat_acomp;
    INSERT INTO public.categorias (tenant_id, nome, ordem) VALUES (v_tenant_id, 'Bebidas Geladas', 4) RETURNING id INTO v_cat_bebidas;

    -- Produtos
    INSERT INTO public.produtos (tenant_id, categoria_id, nome, descricao, preco, tipo_preco, emoji) VALUES
    (v_tenant_id, v_cat_frangos, 'Frango Inteiro Assado', 'Temperado com ervas finas e assado na brasa lenta (com batatas)', 48.00, 'unidade', '🍗'),
    (v_tenant_id, v_cat_frangos, 'Meio Frango Assado', 'Porção individual ou para duas pessoas com batatas coradas', 26.00, 'unidade', '🍗'),
    (v_tenant_id, v_cat_carnes, 'Linguiça Toscana Especial', 'Preço por kg. Vendida pesada na hora no balcão', 42.00, 'kg', '🥩'),
    (v_tenant_id, v_cat_carnes, 'Costelinha Suína Barbecue', 'Preço por kg. Macia e dourada na brasa', 58.00, 'kg', '🍖'),
    (v_tenant_id, v_cat_acomp, 'Maionese Caseira de Batata', 'Pote de 500g tradicional de domingo', 16.00, 'unidade', '🥗'),
    (v_tenant_id, v_cat_acomp, 'Farofa Especial da Casa', 'Pote 400g com bacon crocante e cebola caramelizada', 14.00, 'unidade', '🥣'),
    (v_tenant_id, v_cat_bebidas, 'Coca-Cola 2 Litros', 'Garrafa PET bem gelada', 14.00, 'unidade', '🥤'),
    (v_tenant_id, v_cat_bebidas, 'Guaraná Antarctica 2L', 'Garrafa PET bem gelada', 12.00, 'unidade', '🥤');

    -- Pedidos de exemplo para reservas
    INSERT INTO public.pedidos (tenant_id, cliente_nome, cliente_celular, horario_retirada, status, total, observacoes) VALUES
    (v_tenant_id, 'Dona Maria', '11988887777', '11:30', 'confirmado', 64.00, 'Frango bem moreninho, por favor'),
    (v_tenant_id, 'Seu Antônio', '11977776666', '12:00', 'preparo', 48.00, 'Sem corte, levar inteiro'),
    (v_tenant_id, 'Cláudio Silva', '11966665555', '12:30', 'aguardando', 76.00, 'Adicionar farofa extra');

  END IF;
END $$;

