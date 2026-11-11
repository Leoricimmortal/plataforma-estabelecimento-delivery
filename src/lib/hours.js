// Horário de atendimento: validação, sugestões e situação automática da loja.
import { pad2, fmtTime, DAY } from './format';

export const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
export const DIAS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
export const DIAS_CURTO = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
export const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
export const fromMin = (m) => `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`;

/** Aceita "2000", "20", "8", "830", "20h", "20:0" e devolve "20:00"; '' se vazio; null se inválido. */
export function normHora(v) {
  const s = String(v || '').trim().toLowerCase().replace('h', ':');
  if (!s) return '';
  let h, m;
  if (s.includes(':')) { [h, m] = s.split(':'); m = m === '' ? '00' : m.padEnd(2, '0'); }
  else {
    const d = s.replace(/\D/g, '');
    if (d.length <= 2) { h = d; m = '00'; }
    else if (d.length === 3) { h = d.slice(0, 1); m = d.slice(1); }
    else { h = d.slice(0, 2); m = d.slice(2, 4); }
  }
  if (!/^\d{1,2}$/.test(h) || !/^\d{2}$/.test(m)) return null;
  const r = `${pad2(+h)}:${m}`;
  return HHMM.test(r) ? r : null;
}
export const maskHora = (v) => { const d = String(v).replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d; };
export const passaMeiaNoite = (a, b) => HHMM.test(a) && HHMM.test(b) && b !== '00:00' && toMin(b) <= toMin(a);

export function horasErros(hours) {
  const out = [];
  hours.forEach((h, i) => {
    if (!h.open) return;
    if (!h.slots.length) out.push(`${h.dia}: está como Aberto mas não tem horário.`);
    h.slots.forEach(([a, b]) => {
      if (!a || !b) out.push(`${h.dia}: preencha início e fim.`);
      else if (!HHMM.test(a) || !HHMM.test(b)) out.push(`${h.dia}: "${!HHMM.test(a) ? a : b}" não é um horário válido. Use de 00:00 a 23:59.`);
      else if (a === b) out.push(`${h.dia}: ${a} às ${b} tem início igual ao fim.`);
    });
    const ok = h.slots
      .filter(([a, b]) => HHMM.test(a) && HHMM.test(b) && a !== b)
      .map(([a, b]) => [toMin(a), toMin(b) <= toMin(a) ? 1440 : toMin(b), a, b])
      .sort((x, y) => x[0] - y[0]);
    for (let k = 1; k < ok.length; k++) if (ok[k][0] < ok[k - 1][1]) out.push(`${h.dia}: os horários ${ok[k - 1][2]} às ${ok[k - 1][3]} e ${ok[k][2]} às ${ok[k][3]} se sobrepõem.`);
    if (ok.filter((x) => x[1] === 1440 && x[3] !== '00:00').length > 1) out.push(`${h.dia}: só pode haver um horário que passa da meia-noite.`);
    const nxt = hours[(i + 1) % 7];
    ok.filter((x) => x[3] !== '00:00' && toMin(x[3]) <= toMin(x[2])).forEach(([, , a, b]) => {
      if (!nxt.open) return;
      nxt.slots.filter(([c, d]) => HHMM.test(c) && HHMM.test(d)).forEach(([c]) => {
        if (toMin(c) < toMin(b)) out.push(`${h.dia} ${a} às ${b} termina depois que ${DIAS_CURTO[(i + 1) % 7]} abre às ${c}. Ajuste um dos dois.`);
      });
    });
  });
  return [...new Set(out)];
}

/** Próxima faixa: 30 min depois do último fim, com até 4h. Sem espaço, devolve null. */
export function sugerirFaixa(h) {
  if (!h.slots.length) return ['08:00', '18:00'];
  const valid = h.slots.filter(([a, b]) => HHMM.test(a) && HHMM.test(b));
  if (valid.some(([a, b]) => toMin(b) <= toMin(a))) return null;
  const end = Math.max(...valid.map(([, b]) => toMin(b)), 0), start = end + 30;
  if (start > 23 * 60) return null;
  return [fromMin(start), fromMin(Math.min(start + 240, 23 * 60 + 59))];
}

const dayIdx = (d) => (d.getDay() + 6) % 7; // 0 = segunda
export function agendaAgora(hours, now = new Date()) {
  const i = dayIdx(now), m = now.getHours() * 60 + now.getMinutes(), hoje = hours[i], ontem = hours[(i + 6) % 7];
  const valid = (h) => (h.open ? h.slots.filter(([a, b]) => HHMM.test(a) && HHMM.test(b) && a !== b) : []);
  for (const [a, b] of valid(ontem)) if (toMin(b) <= toMin(a) && m < toMin(b)) return { open: true, fecha: b, fechaDia: 0 };
  for (const [a, b] of valid(hoje)) {
    const A = toMin(a), B = toMin(b);
    if (B > A && m >= A && m < B) return { open: true, fecha: b, fechaDia: 0 };
    if (B <= A && m >= A) return { open: true, fecha: b, fechaDia: 1 };
  }
  for (let k = 0; k < 8; k++) {
    const d = hours[(i + k) % 7], starts = valid(d).map(([a]) => toMin(a)).filter((x) => k > 0 || x > m).sort((x, y) => x - y);
    if (starts.length) return { open: false, abre: fromMin(starts[0]), abreEm: k, abreDia: (i + k) % 7 };
  }
  return { open: false, semHorario: true };
}
export const quandoAbre = (a) => (a.semHorario ? 'sem horário definido' : `abre ${a.abreEm === 0 ? 'hoje' : a.abreEm === 1 ? 'amanhã' : DIAS_CURTO[a.abreDia]} às ${a.abre}`);
export function quandoTs(ts) {
  const d = new Date(ts), hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const diff = Math.round((new Date(d).setHours(0, 0, 0, 0) - hoje.getTime()) / DAY);
  return `${diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : DIAS_CURTO[dayIdx(d)]} às ${fmtTime(ts)}`;
}

/** Situação da loja: automática pelos horários, com exceção manual temporária (override). */
export function lojaSituacao(hours, override, now = Date.now()) {
  const ov = override && now < override.until ? override : null;
  if (ov) return ov.open
    ? { open: true, titulo: 'Loja Aberta', hint: `Aberta fora do horário até ${quandoTs(ov.until)}. Depois volta ao automático.`, manual: true }
    : { open: false, titulo: 'Loja Fechada', hint: `Fechada temporariamente. Reabre ${quandoTs(ov.until)}, pelo horário.`, manual: true };
  const ag = agendaAgora(hours, new Date(now));
  if (ag.open) return { open: true, titulo: 'Loja Aberta', hint: `Automático: ${!ag.fechaDia ? 'fecha às ' + ag.fecha : ag.fecha === '00:00' ? 'fecha à meia-noite' : 'fecha amanhã às ' + ag.fecha}` };
  return { open: false, titulo: 'Loja Fechada', hint: `Automático: ${quandoAbre(ag)}` };
}

/** Calcula a exceção manual quando o lojista usa o botão Abrir/Fechar. null = volta ao automático. */
export function calcularOverride(hours, querAberta, now = Date.now()) {
  const ag = agendaAgora(hours, new Date(now));
  if (querAberta === ag.open) return null;
  if (querAberta) { const fim = new Date(now); fim.setHours(23, 59, 0, 0); return { open: true, until: fim.getTime() }; }
  const fechaEm = new Date(now); const [hh, mm] = ag.fecha.split(':').map(Number); fechaEm.setHours(hh, mm, 0, 0);
  if (ag.fechaDia || fechaEm.getTime() <= now) fechaEm.setDate(fechaEm.getDate() + 1);
  const prox = agendaAgora(hours, new Date(fechaEm.getTime() + 60e3));
  let until = fechaEm.getTime();
  if (!prox.semHorario) { const d = new Date(fechaEm); d.setDate(d.getDate() + (prox.abreEm || 0)); const [h2, m2] = prox.abre.split(':').map(Number); d.setHours(h2, m2, 0, 0); until = d.getTime(); }
  return { open: false, until };
}

export const horariosIniciais = () => DIAS.map((d, i) => ({ dia: d, open: i < 6, slots: i < 6 ? [['08:00', '12:00'], ['14:00', i >= 4 ? '22:00' : '18:00']] : [] }));
