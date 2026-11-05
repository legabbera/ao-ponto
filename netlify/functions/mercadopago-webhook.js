/**
 * WEBHOOK OFICIAL MERCADO PAGO — NETLIFY SERVERLESS FUNCTION
 */
import crypto from 'crypto';

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const headers = event.headers || {};
    const xSignature = headers['x-signature'] || '';
    const xRequestId = headers['x-request-id'] || '';

    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch (_) {}

    const acao = body.action || body.type || '';
    const queryParams = event.queryStringParameters || {};
    const dataId = body.data?.id || queryParams['data.id'] || queryParams['id'];

    if (dataId && (acao.includes('payment') || body.type === 'payment')) {
      const accessToken = process.env.MP_ACCESS_TOKEN || process.env.VITE_MP_ACCESS_TOKEN;

      if (!accessToken) {
        return { statusCode: 500, body: JSON.stringify({ error: 'MP_ACCESS_TOKEN pendente' }) };
      }

      // Consulta de dupla checagem direta na API do Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!mpResponse.ok) {
        return { statusCode: 200, body: JSON.stringify({ received: true, verified: false }) };
      }

      const pagamento = await mpResponse.json();

      if (pagamento.status === 'approved') {
        const pontoId = pagamento.external_reference || pagamento.metadata?.ponto_id;
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseServiceKey && pontoId) {
          try {
            await fetch(`${supabaseUrl}/rest/v1/tenants?id=eq.${pontoId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify({
                status_assinatura: 'em_dia',
                bloqueado: false,
                ultimo_pagamento_mp: new Date().toISOString(),
              }),
            });
          } catch (e) {
            console.error('Erro ao atualizar Supabase:', e);
          }
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ received: true, status: 'approved', ponto_id: pontoId }),
        };
      }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    return { statusCode: 200, body: JSON.stringify({ received: true, error: err.message }) };
  }
}
