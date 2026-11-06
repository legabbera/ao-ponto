/**
 * GERENCIADOR DE IDEMPOTÊNCIA & TRAVA ANTI-DUPLO CLIQUE (ANTI-REPLAY)
 * -------------------------------------------------------------------
 * Impede que toques repetidos em telas touch, duplos cliques no mouse
 * ou instabilidades de conexão gerem cobranças, vendas ou reservas duplicadas.
 */

// Memória de assinaturas de transações em processamento e recentes (janela deslizante)
const transacoesAtivas = new Map();

/**
 * Gera uma chave de idempotência criptográfica única (UUID v4)
 */
export function gerarIdempotencyKey(prefixo = 'tx') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefixo}_${crypto.randomUUID()}`;
  }
  return `${prefixo}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Executa uma operação garantindo que requisições idênticas disparadas
 * dentro da janela de retenção sejam descartadas de forma segura.
 *
 * @param {string} assinatura - Hash ou identificador único da ação (ex: "venda_45.00_itens_1|2")
 * @param {Function} operacao - Ação assíncrona ou síncrona a ser executada
 * @param {number} janelaMs - Tempo de bloqueio contra disparos repetidos (padrão: 4000ms)
 * @returns {Promise<any>}
 */
export async function executarComIdempotencia(assinatura, operacao, janelaMs = 4000) {
  const agora = Date.now();

  // 1. Limpeza automática de transações expiradas
  for (const [chave, expiraEm] of transacoesAtivas.entries()) {
    if (agora > expiraEm) {
      transacoesAtivas.delete(chave);
    }
  }

  // 2. Se a mesma ação já está em processamento ou foi concluída recentemente, bloqueia
  if (transacoesAtivas.has(assinatura)) {
    console.warn(`[Anti-Replay] Bloqueada tentativa de disparo duplicado para: ${assinatura}`);
    const erro = new Error('Operação já em processamento. Aguarde a conclusão.');
    erro.code = 'DUPLICATE_TRANSACTION';
    throw erro;
  }

  // 3. Registra a assinatura imediatamente
  transacoesAtivas.set(assinatura, agora + janelaMs);

  try {
    const resultado = await operacao();
    return resultado;
  } catch (err) {
    // Se a operação falhar antes de registrar, libera imediatamente a chave
    transacoesAtivas.delete(assinatura);
    throw err;
  }
}
