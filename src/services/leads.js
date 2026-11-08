/**
 * SERVIÇO DE LEADS E CONTATOS COMERCIAIS
 * Integração com Supabase + Fallback Local + Disparo para WhatsApp
 */
import { supabase } from './supabase.js';

const STORAGE_KEY_LEADS = 'ao-ponto-leads-cache';
const STORAGE_KEY_WHATSAPP_DESTINO = 'ao-ponto-whatsapp-destino';

// Número padrão de recebimento (pode ser configurado no Master Cockpit)
export const WHATSAPP_DESTINO_PADRAO = '5511988887777';

export function getNumeroWhatsAppDestino() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_WHATSAPP_DESTINO);
    if (salvo && salvo.trim()) return salvo.trim();
  } catch (_) {}
  return WHATSAPP_DESTINO_PADRAO;
}

export function setNumeroWhatsAppDestino(numero) {
  const limpo = String(numero).replace(/\D/g, '');
  localStorage.setItem(STORAGE_KEY_WHATSAPP_DESTINO, limpo);
}

/**
 * Salva o lead no Supabase, no cache local e monta a URL para WhatsApp
 */
export async function salvarLead({ nome, whatsapp, tipoNegocio = '', cidade = '', mensagem = '', origem = 'landing_page' }) {
  const novoLead = {
    id: 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    nome: nome.trim(),
    whatsapp: whatsapp.trim(),
    tipo_negocio: tipoNegocio,
    cidade: cidade.trim(),
    mensagem: mensagem.trim(),
    origem: origem, // 'modal_interesse', 'landing_form', 'rodape_contato'
    status: 'novo', // 'novo', 'em_contato', 'convertido', 'arquivado'
    created_at: new Date().toISOString()
  };

  // 1. Salva no cache local para persistência garantida
  salvarLeadNoCacheLocal(novoLead);

  // 2. Envia para o Supabase se configurado
  if (supabase) {
    try {
      const { data, error } = await supabase.from('leads').insert([{
        nome: novoLead.nome,
        whatsapp: novoLead.whatsapp,
        tipo_negocio: novoLead.tipo_negocio,
        cidade: novoLead.cidade,
        mensagem: novoLead.mensagem,
        origem: novoLead.origem,
        status: novoLead.status
      }]).select();

      if (error) {
        console.warn('[Leads] Aviso ao salvar no Supabase (usando cache local):', error.message);
      } else if (data && data[0]?.id) {
        novoLead.id = data[0].id;
      }
    } catch (err) {
      console.warn('[Leads] Falha de rede ao conectar com Supabase:', err.message);
    }
  }

  // 3. Monta texto formatado para o WhatsApp do Dono da Plataforma
  const textoWhatsApp = formatarMensagemWhatsAppLead(novoLead);
  const numeroDestino = getNumeroWhatsAppDestino();
  const urlWhatsApp = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(textoWhatsApp)}`;

  // Notifica o app sobre novo lead
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ao-ponto:novo-lead', { detail: novoLead }));
  }

  return { sucesso: true, lead: novoLead, urlWhatsApp };
}

function formatarMensagemWhatsAppLead(lead) {
  const dataFormatada = new Date(lead.created_at).toLocaleString('pt-BR');
  
  let msg = `🍗 *Novo Lead Interessado no Ao Ponto!*\n\n`;
  msg += `👤 *Nome:* ${lead.nome}\n`;
  msg += `📱 *WhatsApp:* ${lead.whatsapp}\n`;

  if (lead.tipo_negocio) {
    const tipos = {
      frango_assado: 'Frango assado (máquina ou brasa)',
      churrasquinho: 'Churrasquinho / Espetinhos',
      carnes_guarnicoes: 'Carnes assadas e guarnições',
      trailer_foodtruck: 'Trailer / Food Truck',
      outro: 'Outro ramo de alimentação'
    };
    msg += `🍖 *Negócio:* ${tipos[lead.tipo_negocio] || lead.tipo_negocio}\n`;
  }

  if (lead.cidade) {
    msg += `📍 *Cidade/UF:* ${lead.cidade}\n`;
  }

  if (lead.mensagem) {
    msg += `💬 *Mensagem/Dúvida:* "${lead.mensagem}"\n`;
  }

  const origens = {
    modal_interesse: 'Modal Rápido (Quero conhecer)',
    landing_form: 'Formulário Principal da Página',
    rodape_contato: 'Rodapé (Falar com a equipe)'
  };
  msg += `📌 *Origem:* ${origens[lead.origem] || lead.origem}\n`;
  msg += `⏰ *Data:* ${dataFormatada}\n`;

  return msg;
}

function salvarLeadNoCacheLocal(lead) {
  try {
    const lista = listarLeadsCacheLocal();
    // Insere no início
    lista.unshift(lead);
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(lista.slice(0, 100)));
  } catch (_) {}
}

function listarLeadsCacheLocal() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY_LEADS);
    if (salvo) return JSON.parse(salvo);
  } catch (_) {}
  return [];
}

/**
 * Lista todos os leads (do Supabase ou do cache local)
 */
export async function listarLeads() {
  let leadsSupabase = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        leadsSupabase = data;
      }
    } catch (_) {}
  }

  const leadsLocais = listarLeadsCacheLocal();

  if (leadsSupabase && leadsSupabase.length > 0) {
    // Mescla garantindo que itens locais não sincronizados apareçam
    const mapa = new Map();
    leadsSupabase.forEach(l => mapa.set(l.whatsapp + l.created_at, l));
    leadsLocais.forEach(l => {
      const chave = l.whatsapp + l.created_at;
      if (!mapa.has(chave)) mapa.set(chave, l);
    });
    return Array.from(mapa.values());
  }

  return leadsLocais;
}

/**
 * Atualiza o status do lead (novo -> em_contato -> convertido -> arquivado)
 */
export async function atualizarStatusLead(id, novoStatus) {
  // Atualiza cache local
  try {
    const lista = listarLeadsCacheLocal();
    const item = lista.find(l => l.id === id);
    if (item) {
      item.status = novoStatus;
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(lista));
    }
  } catch (_) {}

  // Atualiza no Supabase
  if (supabase) {
    try {
      await supabase.from('leads').update({ status: novoStatus }).eq('id', id);
    } catch (_) {}
  }

  return true;
}

