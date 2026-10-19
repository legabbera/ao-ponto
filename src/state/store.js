/**
 * "Memória" da sessão (estado demonstrativo).
 * Guarda: usuário logado (de mentira), perfil, filtros e preferências.
 * ⚠️ Não é banco de dados. O login fica no sessionStorage só para
 * não deslogar ao recarregar; fechar a aba limpa tudo.
 * Nunca guarde senhas, tokens ou chaves aqui.
 */
import { PERFIS } from '../data/mock.js';

const salvo = JSON.parse(sessionStorage.getItem('fa-sessao') || 'null');

const estado = {
  logado: !!salvo,
  perfil: salvo?.perfil || 'owner',
  ponto: 'todos',            // 'todos' ou id do ponto
  periodo: 'semana',         // hoje | semana | mes | ano | custom
  custom: null,              // { inicio, fim } em 'AAAA-MM-DD'
  sidebarRecolhida: false,
};

const ouvintes = new Set();

export const store = {
  get: () => estado,
  perfil: () => PERFIS[estado.perfil],
  set(parcial) {
    Object.assign(estado, parcial);
    sessionStorage.setItem('fa-sessao', estado.logado ? JSON.stringify({ perfil: estado.perfil }) : 'null');
    ouvintes.forEach((fn) => fn(estado));
  },
  assinar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); },
  /** Pontos que o perfil atual pode ver */
  pontosPermitidos: () => PERFIS[estado.perfil].pontos,
};
