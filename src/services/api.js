/**
 * CAMADA DE SERVIÇOS (ponte para o futuro backend)
 * ------------------------------------------------
 * Hoje: devolve dados fictícios de src/data/mock.js.
 * Futuro: trocar o conteúdo destas funções por chamadas reais
 * (ex.: fetch('/api/vendas?...')) SEM mudar as telas.
 *
 * ⚠️ Nunca coloque chaves de API, tokens de WhatsApp ou de
 * pagamento neste arquivo nem em nenhum arquivo do frontend.
 */
import { resumoVendas, resumoPedidos } from '../data/mock.js';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/** LOGIN DEMONSTRATIVO — não verifica nada de verdade. */
export async function loginDemo(usuario, senha) {
  await esperar(700);
  if (senha === 'errada') throw new Error('Usuário ou senha incorretos (erro simulado).');
  return { ok: true };
}

export async function buscarDashboard({ pontos, inicio, fim, grupo, anterior }) {
  await esperar(250); // simula o tempo de resposta de um servidor
  return {
    atual: resumoVendas(pontos, inicio, fim, grupo),
    anterior: resumoVendas(pontos, anterior.inicio, anterior.fim, 'dia'),
    pedidos: resumoPedidos(pontos, inicio, fim),
  };
}
