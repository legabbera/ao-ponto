/**
 * MÓDULO DE CIBERSEGURANÇA: BACKUP & RECUPERAÇÃO DE DESASTRES (DISASTER RECOVERY)
 * Plataforma Ao Ponto
 * 
 * Permite exportar e restaurar snapshots completos dos dados da loja/SaaS,
 * com validação de schema, hash de integridade e rollback de segurança.
 */

import { store } from '../state/store.js';

const VERSAO_SCHEMA_BACKUP = '2.0.0';
const CHAVE_ROLLBACK = 'fa-snapshot-emergencia-rollback';

/**
 * Gera um hash simples de integridade (checksum) para verificar integridade do JSON
 */
function calcularChecksum(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Converte para 32bit integer
  }
  return 'chk_' + Math.abs(hash).toString(16);
}

/**
 * Coleta todos os dados do sistema e gera o objeto de snapshot completo
 */
export function gerarSnapshotCompleto() {
  const st = store.get();
  const tenant = store.getTenant();
  const perfil = store.perfil();

  const dados = {
    tenant: tenant || null,
    pedidos: store.getPedidos() || [],
    vendas: store.getVendas() || [],
    clientes: store.getClientes() || [],
    estoque: store.getEstoque() || null,
    whatsapp: store.getWhatsapp() || null,
    fichasTecnicas: JSON.parse(localStorage.getItem('ao-ponto-fichas-tecnicas') || '[]'),
    regrasFidelidade: JSON.parse(localStorage.getItem('fa-regras-fidelidade') || 'null'),
    usuarios: JSON.parse(localStorage.getItem('fa-usuarios') || '[]'),
  };

  // Se for admin/SaaS, anexa também dados globais se existirem
  const tenantsGlobal = localStorage.getItem('fa-tenants');
  if (tenantsGlobal) {
    try { dados.tenantsGlobal = JSON.parse(tenantsGlobal); } catch (_) {}
  }
  const emissorFiscal = localStorage.getItem('ao-saas-emissor-fiscal');
  if (emissorFiscal) {
    try { dados.emissorFiscal = JSON.parse(emissorFiscal); } catch (_) {}
  }

  const payloadString = JSON.stringify(dados);
  const checksum = calcularChecksum(payloadString);

  return {
    plataforma: 'Ao Ponto - Gestão de Vendas',
    versaoSchema: VERSAO_SCHEMA_BACKUP,
    timestamp: new Date().toISOString(),
    dataLegivel: new Date().toLocaleString('pt-BR'),
    geradoPor: perfil?.nome || 'Operador',
    tenantId: tenant?.id || 'default',
    tenantNome: tenant?.nome || 'Ao Ponto Assados',
    totalRegistros: {
      pedidos: dados.pedidos.length,
      vendas: dados.vendas.length,
      clientes: dados.clientes.length,
      fichasTecnicas: dados.fichasTecnicas.length,
    },
    checksum,
    dados,
  };
}

/**
 * Dispara o download de um arquivo .json seguro no navegador
 */
export function baixarArquivoBackup() {
  const snapshot = gerarSnapshotCompleto();
  const slug = (snapshot.tenantNome || 'ao-ponto').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const dataIso = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const nomeArquivo = `ao-ponto-backup-${slug}-${dataIso}.json`;

  const conteudoJson = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([conteudoJson], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return { nomeArquivo, snapshot };
}

/**
 * Valida o arquivo carregado pelo usuário
 * @param {string} textoJson
 * @returns {{ valido: boolean, snapshot?: object, erro?: string }}
 */
export function validarArquivoBackup(textoJson) {
  try {
    const obj = JSON.parse(textoJson);

    if (!obj || typeof obj !== 'object') {
      return { valido: false, erro: 'Formato inválido. O arquivo não é um JSON válido.' };
    }

    if (!obj.plataforma || !obj.plataforma.includes('Ao Ponto')) {
      return { valido: false, erro: 'Este arquivo não pertence à plataforma Ao Ponto.' };
    }

    if (!obj.dados || typeof obj.dados !== 'object') {
      return { valido: false, erro: 'Estrutura corrompida: bloco de dados não encontrado.' };
    }

    // Conferência de Checksum (aviso preventivo de adulteração)
    const payloadStr = JSON.stringify(obj.dados);
    const checksumCalculado = calcularChecksum(payloadStr);
    const integro = (obj.checksum === checksumCalculado);

    return {
      valido: true,
      integro,
      snapshot: obj,
      resumo: {
        data: obj.dataLegivel || obj.timestamp,
        tenantNome: obj.tenantNome || 'Desconhecido',
        pedidos: obj.totalRegistros?.pedidos ?? (obj.dados.pedidos?.length || 0),
        vendas: obj.totalRegistros?.vendas ?? (obj.dados.vendas?.length || 0),
        clientes: obj.totalRegistros?.clientes ?? (obj.dados.clientes?.length || 0),
        fichasTecnicas: obj.totalRegistros?.fichasTecnicas ?? (obj.dados.fichasTecnicas?.length || 0),
      }
    };
  } catch (err) {
    return { valido: false, erro: 'Erro ao interpretar JSON: ' + (err.message || 'Arquivo corrompido') };
  }
}

/**
 * Executa a restauração do snapshot com salvamento prévio de rollback
 * @param {object} snapshot
 * @param {'substituir' | 'mesclar'} modo
 */
export function aplicarRestauracaoBackup(snapshot, modo = 'substituir') {
  if (!snapshot || !snapshot.dados) {
    throw new Error('Snapshot inválido para restauração.');
  }

  // 1. Criar Auto-Snapshot de Emergência antes de alterar qualquer dado (Segurança Absoluta)
  const backupEmergencia = gerarSnapshotCompleto();
  localStorage.setItem(CHAVE_ROLLBACK, JSON.stringify(backupEmergencia));

  const dados = snapshot.dados;

  if (modo === 'substituir') {
    if (Array.isArray(dados.pedidos)) {
      localStorage.setItem('fa-pedidos', JSON.stringify(dados.pedidos));
    }
    if (Array.isArray(dados.vendas)) {
      localStorage.setItem('fa-vendas', JSON.stringify(dados.vendas));
    }
    if (Array.isArray(dados.clientes)) {
      localStorage.setItem('fa-clientes', JSON.stringify(dados.clientes));
    }
    if (dados.estoque) {
      localStorage.setItem('fa-estoque', JSON.stringify(dados.estoque));
    }
    if (dados.whatsapp) {
      localStorage.setItem('fa-whatsapp', JSON.stringify(dados.whatsapp));
    }
    if (Array.isArray(dados.fichasTecnicas)) {
      localStorage.setItem('ao-ponto-fichas-tecnicas', JSON.stringify(dados.fichasTecnicas));
    }
    if (dados.regrasFidelidade) {
      localStorage.setItem('fa-regras-fidelidade', JSON.stringify(dados.regrasFidelidade));
    }
    if (Array.isArray(dados.usuarios)) {
      localStorage.setItem('fa-usuarios', JSON.stringify(dados.usuarios));
    }
    if (Array.isArray(dados.tenantsGlobal)) {
      localStorage.setItem('fa-tenants', JSON.stringify(dados.tenantsGlobal));
    }
  } else {
    // Modo Mesclar (Merge inteligente por IDs)
    if (Array.isArray(dados.pedidos)) {
      const atuais = store.getPedidos() || [];
      const mapa = new Map(atuais.map(p => [p.id, p]));
      dados.pedidos.forEach(p => mapa.set(p.id, p));
      localStorage.setItem('fa-pedidos', JSON.stringify(Array.from(mapa.values())));
    }
    if (Array.isArray(dados.vendas)) {
      const atuais = store.getVendas() || [];
      const mapa = new Map(atuais.map(v => [v.id, v]));
      dados.vendas.forEach(v => mapa.set(v.id, v));
      localStorage.setItem('fa-vendas', JSON.stringify(Array.from(mapa.values())));
    }
    if (Array.isArray(dados.clientes)) {
      const atuais = store.getClientes() || [];
      const mapa = new Map(atuais.map(c => [c.id || c.nome, c]));
      dados.clientes.forEach(c => mapa.set(c.id || c.nome, c));
      localStorage.setItem('fa-clientes', JSON.stringify(Array.from(mapa.values())));
    }
    if (Array.isArray(dados.fichasTecnicas)) {
      const atuais = JSON.parse(localStorage.getItem('ao-ponto-fichas-tecnicas') || '[]');
      const mapa = new Map(atuais.map(f => [f.id || f.nome, f]));
      dados.fichasTecnicas.forEach(f => mapa.set(f.id || f.nome, f));
      localStorage.setItem('ao-ponto-fichas-tecnicas', JSON.stringify(Array.from(mapa.values())));
    }
  }

  // Recarrega os dados na store reativa
  if (dados.pedidos) store.set({ pedidos: JSON.parse(localStorage.getItem('fa-pedidos')) });
  if (dados.vendas) store.set({ vendas: JSON.parse(localStorage.getItem('fa-vendas')) });
  if (dados.clientes) store.set({ clientes: JSON.parse(localStorage.getItem('fa-clientes')) });
  if (dados.estoque && modo === 'substituir') store.set({ estoque: dados.estoque });
  if (dados.whatsapp && modo === 'substituir') store.set({ whatsapp: dados.whatsapp });

  return {
    sucesso: true,
    dataRestaurada: snapshot.dataLegivel || snapshot.timestamp,
    modo,
  };
}

/**
 * Checa se existe um rollback de emergência disponível
 */
export function temRollbackDisponivel() {
  return !!localStorage.getItem(CHAVE_ROLLBACK);
}

/**
 * Restaura o Auto-Snapshot de emergência desfazendo a última importação
 */
export function executarRollbackEmergencia() {
  const salvo = localStorage.getItem(CHAVE_ROLLBACK);
  if (!salvo) throw new Error('Nenhum ponto de restauração de emergência encontrado.');
  const snapshot = JSON.parse(salvo);
  // Aplica sem criar novo rollback para não sobrescrever
  const dados = snapshot.dados;
  if (dados.pedidos) { localStorage.setItem('fa-pedidos', JSON.stringify(dados.pedidos)); store.set({ pedidos: dados.pedidos }); }
  if (dados.vendas) { localStorage.setItem('fa-vendas', JSON.stringify(dados.vendas)); store.set({ vendas: dados.vendas }); }
  if (dados.clientes) { localStorage.setItem('fa-clientes', JSON.stringify(dados.clientes)); store.set({ clientes: dados.clientes }); }
  if (dados.estoque) { localStorage.setItem('fa-estoque', JSON.stringify(dados.estoque)); store.set({ estoque: dados.estoque }); }
  if (dados.whatsapp) { localStorage.setItem('fa-whatsapp', JSON.stringify(dados.whatsapp)); store.set({ whatsapp: dados.whatsapp }); }
  if (dados.fichasTecnicas) localStorage.setItem('ao-ponto-fichas-tecnicas', JSON.stringify(dados.fichasTecnicas));
  localStorage.removeItem(CHAVE_ROLLBACK);
  return snapshot;
}
