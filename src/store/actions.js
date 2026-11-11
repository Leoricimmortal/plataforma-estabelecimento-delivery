// Ações do painel: juntam regra de negócio + estado + aviso na tela.
// Quando existir back-end, é aqui que entram as chamadas à API.
import { mut, getState, toast, closeModal } from './useApp';
import { findPedido, setStatus, tickEntregas, aceitarEntrega, marcarChegada, FLOW, driverOf } from '../domain/pedidos';
import { chatOf, chatAtivo, driverSay, saudacao, chegadaMsg, respostaSimulada } from '../domain/chat';
import { calcularOverride, lojaSituacao } from '../lib/hours';
import { rnd } from '../lib/geo';
import { playSound } from '../lib/sound';

export const navigate = (route) => { window.location.hash = route; };

function alerta(msg) {
  toast(msg);
  const { som } = getState();
  if (som.on && som.ev.status) playSound(som.sound, som.vol);
}

/* ---------- Pedidos ---------- */
export function mudarStatus(num, st) {
  let r;
  mut((s) => { r = setStatus(s, num, st); });
  toast(r.msg);
  return r.ok;
}
export function avancarPedido(num) {
  const p = findPedido(getState(), num); if (!p) return;
  closeModal();
  if (p.status === 'pronto') { mut((s) => { s.ui.coletaSel = p.num; }); navigate('coleta'); return; }
  mudarStatus(num, FLOW[FLOW.indexOf(p.status) + 1]);
}

/* ---------- Coleta ---------- */
export function confirmarColeta(num) {
  const p = findPedido(getState(), num); if (!p?.coleta) return;
  if (p.coleta.stage === 'buscando') { toast('Aguarde um entregador aceitar o pedido antes de confirmar a coleta.'); return; }
  const ret = p.coleta.stage === 'retirada', nome = p.coleta.driver?.nome;
  mut((s) => { setStatus(s, num, ret ? 'entregue' : 'rota', true); delete findPedido(s, num).coleta; });
  toast(ret ? `Pedido #${num} retirado pelo cliente. Marcado como Entregue.` : `Coleta do pedido #${num} confirmada. ${nome} saiu para a entrega.`);
}
export function codigoNaoConfere(num) {
  mut((s) => { const p = findPedido(s, num); if (p?.coleta) p.coleta.alerta = Date.now(); });
  toast(`Ocorrência registrada no pedido #${num}. Não entregue o pedido até confirmar quem está retirando.`);
}
export function simularAceite(num) {
  let nome;
  mut((s) => { const p = findPedido(s, num); if (p?.coleta?.stage !== 'buscando') return; aceitarEntrega(p); saudacao(s, p); nome = p.coleta.driver.nome; });
  if (nome) alerta(`${nome} aceitou o pedido #${num} e está indo até a loja`);
}
export function simularChegada(num) {
  let nome;
  mut((s) => { const p = findPedido(s, num); if (p?.coleta?.stage !== 'aceito') return; marcarChegada(p); chegadaMsg(s, p); nome = p.coleta.driver.nome; });
  if (nome) alerta(`${nome} chegou na loja para buscar o pedido #${num}`);
}
export function chamarNovamente(num) {
  mut((s) => { const c = findPedido(s, num)?.coleta; if (c?.stage !== 'buscando') return; c.reqAt = Date.now(); c.autoAt = Date.now() + rnd(10, 25) * 1000; });
  toast(`Pedido #${num} oferecido novamente aos entregadores`);
}
export function usarEntregadorDaLoja(num) {
  mut((s) => { const p = findPedido(s, num); if (p?.coleta?.stage === 'buscando') aceitarEntrega(p, true); });
  toast(`Pedido #${num} será entregue pela equipe da loja. Confirme a coleta quando ele sair.`);
}

/* ---------- Simulação (roda a cada 2 s pelo App) ---------- */
export function tick() {
  let ev = [];
  mut((s) => {
    s.now = Date.now();
    ev = tickEntregas(s, s.now);
    for (const e of ev) {
      const p = findPedido(s, e.num);
      if (e.tipo === 'aceite') saudacao(s, p);
      if (e.tipo === 'chegada') chegadaMsg(s, p);
      if (e.tipo === 'cliente') driverSay(s, e.num, 'Cheguei no endereço do cliente.', { silent: true });
    }
  });
  ev.filter((e) => e.msg).forEach((e) => alerta(e.msg));
}

/* ---------- Chat ---------- */
export function abrirChat(num) {
  const p = findPedido(getState(), num), d = driverOf(p);
  if (!d) { toast('Este pedido ainda não tem entregador.'); return; }
  if (d.proprio) { toast('Esta entrega é feita pela equipe da loja.'); return; }
  mut((s) => { s.chatOpen = p.num; s.chatMin = false; chatOf(s, p.num).unread = 0; });
}
export const fecharChat = () => mut((s) => { s.chatOpen = null; });
export const alternarChat = () => mut((s) => { s.chatMin = !s.chatMin; if (!s.chatMin) chatOf(s, s.chatOpen).unread = 0; });
export function enviarChat(text) {
  text = text.trim();
  const { chatOpen: num } = getState();
  if (!text || !chatAtivo(findPedido(getState(), num))) return;
  mut((s) => { chatOf(s, num).msgs.push({ from: 'loja', text, at: Date.now() }); chatOf(s, num).typing = false; });
  setTimeout(() => mut((s) => { if (chatAtivo(findPedido(s, num))) chatOf(s, num).typing = true; }), 600);
  setTimeout(() => {
    let aviso = null;
    mut((s) => {
      const p = findPedido(s, num);
      if (!chatAtivo(p)) { chatOf(s, num).typing = false; return; }
      aviso = driverSay(s, num, respostaSimulada(p, text));
    });
    toast(aviso);
  }, 1800 + Math.random() * 1400);
}

/* ---------- Loja aberta/fechada ---------- */
export function alternarLoja(querAberta) {
  mut((s) => { s.override = calcularOverride(s.hours, querAberta); });
  const { hours, override } = getState(), st = lojaSituacao(hours, override);
  toast(st.open ? (st.manual ? 'Loja aberta fora do horário' : 'Loja aberta. Voltou ao automático.') : (st.manual ? 'Loja fechada temporariamente' : 'Loja fechada. Voltou ao automático.'));
}
