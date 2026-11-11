// Regras do pedido: etapas, código de coleta, aceite do entregador e entrega.
// As funções que mudam dados recebem o "draft" do Immer (pode alterar direto).
import { MIN, DAY, kmTxt } from '../lib/format';
import { LOJA_POS, offsetKm, distKm, lerp, rnd, viagemMs, progresso } from '../lib/geo';

export const ST = {
  recebido: ['Recebido', 'p-gray'], preparo: ['Em preparo', 'p-blue'], pronto: ['Pronto', 'p-purple'],
  rota: ['Em rota', 'p-orange'], entregue: ['Entregue', 'p-green'], cancelado: ['Cancelado', 'p-red'],
};
export const FLOW = ['recebido', 'preparo', 'pronto', 'rota', 'entregue'];
export const COLS = [
  ['recebido', 'Pedido Recebido', 'Pedidos aguardando aceitação ou início do preparo.', 'clipboard-check', '#2f7bf5'],
  ['preparo', 'Preparo', 'Pedidos em produção na cozinha.', 'chef-hat', '#ff8a1f'],
  ['pronto', 'Pedido Pronto', 'Pedidos prontos aguardando a coleta.', 'package-check', '#7c4dff'],
  ['rota', 'Rota', 'Pedidos com motoboy a caminho.', 'bike', '#2f6fe0'],
  ['entregue', 'Entregue', 'Pedidos finalizados com sucesso.', 'check-circle-2', '#20b15a'],
];
export const DRIVERS = [
  { nome: 'Rafael Santos', placa: 'QXZ-4F23', nota: '4,9' },
  { nome: 'Thiago Lopes', placa: 'PRW-2B10', nota: '4,8' },
  { nome: 'Pedro Lima', placa: 'NKO-8C44', nota: '4,9' },
  { nome: 'Carlos Mendes', placa: 'OLA-1D77', nota: '4,7' },
  { nome: 'Eduardo Silva', placa: 'QWE-5E90', nota: '5,0' },
];
export const OWN_DRIVER = { nome: 'Entregador da loja', placa: '—', nota: '—', proprio: true };
/** Sem aceite depois disso, o painel oferece alternativas. */
export const BUSCA_LIMITE = 3 * MIN;
const PASS_COLETA = ['rota', 'entregue'];

export const findPedido = (s, num) => s.pedidos.find((p) => p.num == num);
export const kanPedidos = (pedidos, now = Date.now()) => pedidos.filter((p) => now - p.created < DAY);
export const coletaList = (pedidos) => pedidos.filter((p) => p.status === 'pronto').sort((a, b) => (a.coleta?.at || 0) - (b.coleta?.at || 0));
export const ageMin = (p, now = Date.now()) => Math.floor((now - p.created) / MIN);
export const isLate = (p, now) => (p.status === 'recebido' && ageMin(p, now) > 15) || (p.status === 'preparo' && ageMin(p, now) > 40);
/** Destino simulado do cliente (fixo por pedido). No real, vem da geocodificação do endereço. */
export const destOf = (p) => p.dest || offsetKm(LOJA_POS, 0.9 + ((p.num * 53) % 45) / 10, (p.num * 137) % 360);
export const driverOf = (p) => p?.coleta?.driver || p?.rota?.driver || p?.entregador || null;

const codigoColeta = () => String(1000 + Math.floor(Math.random() * 9000));

export function gerarColeta(p, at = Date.now()) {
  p.coleta = { code: codigoColeta(), at, alerta: null };
  if (p.modo === 'Retirada') { p.coleta.stage = 'retirada'; return; }
  Object.assign(p.coleta, { stage: 'buscando', reqAt: at, autoAt: at + rnd(10, 25) * 1000, driver: null });
}
export function aceitarEntrega(p, own = false, at = Date.now()) {
  const c = p.coleta; if (!c || c.stage !== 'buscando') return;
  const from = own ? LOJA_POS : offsetKm(LOJA_POS, rnd(1.2, 3.5), rnd(0, 360));
  Object.assign(c, {
    stage: own ? 'chegou' : 'aceito',
    driver: own ? { ...OWN_DRIVER } : { ...DRIVERS[Math.floor(Math.random() * DRIVERS.length)] },
    from, acceptedAt: at, arriveAt: at + (own ? 0 : viagemMs(distKm(from, LOJA_POS))), autoAt: null,
  });
}
export function marcarChegada(p, at = Date.now()) { if (p.coleta?.stage === 'aceito') { p.coleta.stage = 'chegou'; p.coleta.arriveAt = Math.min(p.coleta.arriveAt, at); } }
export function iniciarRota(p, driver, at = Date.now()) {
  p.dest = destOf(p);
  p.rota = { driver, startAt: at, arriveAt: at + viagemMs(distKm(LOJA_POS, p.dest)) };
  p.entregador = driver;
}

export function posEntregador(p, now = Date.now()) {
  if (p.status === 'pronto' && p.coleta?.stage === 'chegou') return LOJA_POS;
  if (p.status === 'pronto' && p.coleta?.stage === 'aceito') return lerp(p.coleta.from, LOJA_POS, progresso(p.coleta.acceptedAt, p.coleta.arriveAt, now));
  if (p.status === 'rota' && p.rota) return lerp(LOJA_POS, destOf(p), progresso(p.rota.startAt, p.rota.arriveAt, now));
  return null;
}
export function etaInfo(p, now = Date.now()) {
  const pos = posEntregador(p, now);
  if (p.status === 'rota' && p.rota) { const left = Math.max(0, p.rota.arriveAt - now); return { pos, km: distKm(pos, destOf(p)), min: Math.ceil(left / MIN), chegou: left <= 0, driver: p.rota.driver }; }
  const c = p.coleta; if (!c || !pos) return null;
  const left = Math.max(0, c.arriveAt - now);
  return { pos, km: distKm(pos, LOJA_POS), min: Math.ceil(left / MIN), chegou: c.stage === 'chegou', driver: c.driver };
}
export function etaText(p, now = Date.now()) {
  if (p.status === 'pronto') {
    const c = p.coleta; if (!c) return '';
    if (c.stage === 'retirada') return `Pronto há ${Math.floor((now - c.at) / MIN)} min`;
    if (c.stage === 'buscando') { const m = Math.floor((now - c.reqAt) / MIN); return m < 1 ? 'Buscando entregador...' : `Buscando entregador há ${m} min`; }
    const e = etaInfo(p, now); return e.chegou ? `${e.driver.nome} chegou na loja` : `${e.driver.nome} a ${kmTxt(e.km)} · chega em ~${e.min} min`;
  }
  if (p.status === 'rota' && p.rota) { const e = etaInfo(p, now); return e.chegou ? 'No endereço do cliente' : `A ${kmTxt(e.km)} do cliente · ~${e.min} min`; }
  return '';
}
export const semAceite = (p, now = Date.now()) => p.coleta?.stage === 'buscando' && now - p.coleta.reqAt > BUSCA_LIMITE;

/**
 * Muda a etapa do pedido. viaColeta=true só quando a coleta foi confirmada na tela Coleta.
 * @returns {{ok:boolean, msg:string}}
 */
export function setStatus(s, num, st, viaColeta = false) {
  const p = findPedido(s, num);
  if (!p || p.status === st) return { ok: false, msg: '' };
  if (!viaColeta && PASS_COLETA.includes(st) && FLOW.indexOf(p.status) < FLOW.indexOf('rota')) {
    return { ok: false, msg: `O pedido #${num} só sai depois da coleta. Confirme na tela Coleta quando o entregador chegar.` };
  }
  const driver = p.coleta?.driver;
  p.status = st; p.updated = Date.now();
  if (st === 'pronto') gerarColeta(p);
  else if (st !== 'rota' || !viaColeta) delete p.coleta;
  if (st === 'rota' && viaColeta && driver) iniciarRota(p, driver);
  if (st !== 'rota') delete p.rota;
  if (st === 'pronto') return { ok: true, msg: p.modo === 'Retirada' ? `Pedido #${num} pronto para retirada. Código ${p.coleta.code} enviado ao cliente.` : `Pedido #${num} pronto. Código ${p.coleta.code} gerado. Buscando entregador...` };
  return { ok: true, msg: `Pedido #${num}: ${ST[st][0]}` };
}

/**
 * Avança a simulação (aceite automático e chegada pelo tempo de viagem).
 * @returns {Array<{num, tipo:'aceite'|'chegada'|'cliente', msg?:string}>}
 */
export function tickEntregas(s, now = Date.now()) {
  const ev = [];
  for (const p of s.pedidos) {
    const c = p.coleta;
    if (p.status === 'pronto' && c) {
      if (c.stage === 'buscando' && c.autoAt && now >= c.autoAt) { aceitarEntrega(p, false, now); ev.push({ num: p.num, tipo: 'aceite', msg: `${c.driver.nome} aceitou o pedido #${p.num} e está indo até a loja` }); }
      else if (c.stage === 'aceito' && now >= c.arriveAt) { c.stage = 'chegou'; ev.push({ num: p.num, tipo: 'chegada', msg: `${c.driver.nome} chegou na loja para buscar o pedido #${p.num}` }); }
    }
    if (p.status === 'rota' && p.rota && !p.rota.avisado && now >= p.rota.arriveAt) { p.rota.avisado = true; ev.push({ num: p.num, tipo: 'cliente' }); }
  }
  return ev;
}

export const STAGE_PILL = {
  retirada: ['p-blue', 'store', 'Retirada no balcão'],
  buscando: ['p-orange', 'radar', 'Buscando entregador'],
  aceito: ['p-purple', 'bike', 'Entregador a caminho'],
  chegou: ['p-green', 'map-pin', 'Entregador na loja'],
};
