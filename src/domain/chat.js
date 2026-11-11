// Chat com o entregador. As respostas são simuladas até o app do entregador existir.
import { etaInfo, driverOf, findPedido } from './pedidos';

export const QUICK = {
  coleta: ['Qual sua previsão de chegada?', 'O pedido já está pronto', 'Pode retirar no balcão', 'Aguarde 2 minutos, por favor'],
  rota: ['Como está a entrega?', 'O cliente pediu para tocar o interfone', 'O cliente pediu troco para R$ 50', 'Avise quando entregar'],
};

export const chatOf = (s, num) => s.chats[num] || (s.chats[num] = { msgs: [], unread: 0, typing: false });
export const chatAtivo = (p) => !!p && !!driverOf(p) && ['pronto', 'rota'].includes(p.status) && !driverOf(p).proprio;

/** Mensagem do entregador. Devolve o texto do aviso (toast) quando a conversa não está visível. */
export function driverSay(s, num, text, { silent = false, at = Date.now() } = {}) {
  const ch = chatOf(s, num);
  ch.msgs.push({ from: 'driver', text, at }); ch.typing = false;
  const visivel = s.chatOpen == num && !s.chatMin;
  if (visivel) return null;
  ch.unread++;
  if (silent) return null;
  const nome = driverOf(findPedido(s, num))?.nome || 'entregador';
  return `Nova mensagem de ${nome} (pedido #${num}): ${text.length > 40 ? text.slice(0, 40) + '…' : text}`;
}
export const saudacao = (s, p) => driverSay(s, p.num, `Olá! Aceitei o pedido #${p.num}. Chego na loja em ~${etaInfo(p)?.min || 5} min.`, { silent: true });
export const chegadaMsg = (s, p) => driverSay(s, p.num, `Cheguei na loja! Estou com o código do pedido #${p.num} no app.`, { silent: true });

export function respostaSimulada(p, text) {
  const t = text.toLowerCase(), e = etaInfo(p), rota = p.status === 'rota';
  if (/previs|demora|quanto tempo|chega|onde (vo)?c|está onde|ta onde/.test(t)) return rota ? (e?.chegou ? 'Já estou no endereço do cliente.' : `Faltam uns ${e?.min || 5} min para chegar no cliente.`) : (p.coleta?.stage === 'chegou' ? 'Já estou aqui na frente da loja!' : `Chego aí em uns ${e?.min || 5} min.`);
  if (/troco/.test(t)) return 'Ok, levo o troco certinho.';
  if (/interfone|tocar|campainha|port[aã]o|ligar pro cliente/.test(t)) return 'Pode deixar, faço isso.';
  if (/aguard|espera|minuto/.test(t)) return 'Sem problemas, estou aguardando.';
  if (/pronto|balc[aã]o|retir|subir|entrar/.test(t)) return p.coleta?.stage === 'chegou' ? 'Beleza, já estou indo pegar!' : `Ótimo, chego em ~${e?.min || 5} min.`;
  if (/entreg|como est|tudo certo/.test(t)) return rota ? (e?.chegou ? 'Cheguei no cliente, entregando agora.' : `Tudo certo, a caminho. Faltam ~${e?.min || 5} min.`) : 'Tudo certo por aqui.';
  if (/obrigad|valeu/.test(t)) return 'Eu que agradeço! 👍';
  return 'Ok, entendido! 👍';
}
