/**
 * CLIENTE OFICIAL DO SUPABASE
 * Inicializa a conexão com o banco de dados do Ao Ponto.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Ao Ponto] Variáveis de ambiente do Supabase não configuradas no .env');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

