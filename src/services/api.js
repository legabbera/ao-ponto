/**
 * CAMADA DE SERVIÇOS — multi-tenant
 * ------------------------------------------------
 * Hoje: devolve dados fictícios de src/data/mock.js + tenant de src/data/tenants.js.
 * Futuro: trocar o conteúdo destas funções por chamadas reais (ex.: fetch('/api/...'))
 * SEM mudar as telas.
 *
 * ⚠️ Nunca coloque chaves de API, tokens ou segredos neste arquivo.
 */
import { resumoVendas, resumoPedidos } from '../data/mock.js';
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

// ── Autenticação ─────────────────────────────────────────────

/** Login real (multi-tenant mock). Retorna { usuario, tenant } */
export async function loginDemo(identificador, senha) {
  await esperar(700);
  return loginTenant(email, senha);
}

/** Cadastro de novo estabelecimento */
export async function cadastrar(dados) {
  await esperar(900);
  return cadastrarEstabelecimento(dados);
}

/** Logout */
export async function logout() {
  logoutTenant();
}

// ── Dashboard ────────────────────────────────────────────────

export async function buscarDashboard({ pontos, inicio, fim, grupo, anterior }) {
  await esperar(250);
  return {
    atual: resumoVendas(pontos, inicio, fim, grupo),
    anterior: resumoVendas(pontos, anterior.inicio, anterior.fim, 'dia'),
    pedidos: resumoPedidos(pontos, inicio, fim),
  };
}

// ── Vendas (com controle de limite) ─────────────────────────

/**
 * Registra uma venda e incrementa o contador do tenant.
 * Lança 'LIMITE_ATINGIDO' se o plano gratuito estiver no limite.
 */
export async function registrarVenda(dadosVenda) {
  await esperar(150);
  registrarVendaTenant(); // lança LIMITE_ATINGIDO se necessário
  return dadosVenda;
}

// ── Planos ───────────────────────────────────────────────────

export async function buscarPlanos() {
  await esperar(100);
  return Object.values(PLANOS);
}

export async function upgradePlano(planoId) {
  await esperar(1200); // simula processamento de pagamento
  return fazerUpgrade(planoId);
}

// ── Domínio personalizado ────────────────────────────────────

export async function salvarDominioCustom(dominio) {
  await esperar(500);
  return configurarDominioCustom(dominio);
}

export async function checarDominioCustom() {
  return verificarDominioCustom();
}
