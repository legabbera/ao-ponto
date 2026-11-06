/**
 * Utilitários de Sanitização e Blindagem Anti-XSS (Cross-Site Scripting)
 * Plataforma Ao Ponto
 */

const MAPA_ENTIDADES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escapa caracteres HTML perigosos prevenindo injeção de scripts (XSS).
 * Converte &, <, >, ", ', `, =, / em entidades HTML seguras.
 * @param {any} valor
 * @returns {string}
 */
export function escapeHtml(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/[&<>"'`=\/]/g, (char) => MAPA_ENTIDADES[char] || char);
}

/**
 * Sanitiza texto livre (observações, descrições, receitas):
 * Remove caracteres de controle invisíveis, remove tags HTML diretas e limita comprimento.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function sanitizarTexto(str, maxLen = 500) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '') // strip de tags HTML completas
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // remove caracteres ASCII de controle
    .trim()
    .slice(0, maxLen);
}

/**
 * Sanitiza números de telefone garantindo exclusivamente dígitos numéricos (para wa.me e tel:).
 * Previne injeção de parâmetros maliciosos em URLs de redirecionamento.
 * @param {string} tel
 * @returns {string}
 */
export function sanitizarTelefone(tel) {
  if (!tel) return '';
  return String(tel).replace(/\D/g, '').slice(0, 15);
}

/**
 * Sanitiza nomes de pessoas, estabelecimentos e produtos:
 * Remove caracteres de script, símbolos perigosos e comprime múltiplos espaços.
 * @param {string} nome
 * @param {number} maxLen
 * @returns {string}
 */
export function sanitizarNome(nome, maxLen = 80) {
  if (!nome) return '';
  return String(nome)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`={}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/**
 * Sanitiza URLs externas garantindo que usem exclusivamente protocolos seguros (https:// ou http://).
 * Bloqueia protocolos perigosos como javascript:, data:, vbscript:.
 * @param {string} url
 * @returns {string}
 */
export function sanitizarUrl(url) {
  if (!url) return '';
  const urlLimpa = String(url).trim();
  if (/^(https?:\/\/|mailto:|tel:|https:\/\/wa\.me\/)/i.test(urlLimpa)) {
    return urlLimpa;
  }
  return '#';
}
