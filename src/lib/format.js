// Formatação e conversões usadas em todo o painel.
export const MIN = 60e3;
export const HR = 60 * MIN;
export const DAY = 24 * HR;

export const pad2 = (n) => String(n).padStart(2, '0');
export const brl = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const fmtDate = (ts) => { const d = new Date(ts); return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`; };
export const fmtTime = (ts) => { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
export const isoToBR = (s) => (s ? s.split('-').reverse().join('/') : '');
export const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/** "1.234,56" -> 1234.56 */
export const parseBR = (v) => +String(v || '0').replace(/\./g, '').replace(',', '.') || 0;
export const toBR = (n) => (n || 0).toFixed(2).replace('.', ',');

/** Telefone: só dígitos, sem o 55 do país. */
export const normTel = (v) => { let d = String(v || '').replace(/\D/g, ''); if (d.startsWith('55') && d.length > 11) d = d.slice(2); return d; };
export const fmtTel = (d) => (d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d);
/** Máscara enquanto digita: (62) 99999-9999 */
export const maskTel = (v) => {
  const d = String(v).replace(/\D/g, '').slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
};
export const maskCep = (v) => { const d = String(v).replace(/\D/g, '').slice(0, 8); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d; };
export const kmTxt = (k) => (k < 1 ? `${Math.round(k * 1000)} m` : `${k.toFixed(1).replace('.', ',')} km`);

const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
/** Código curto da conta, ex.: CHG-B02Z3T (sem I, L, O e U). */
export function novoCodigoConta() {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  return 'CHG-' + [...a].map((b) => B32[b % 32]).join('');
}
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Máscara de CNPJ enquanto digita: 00.000.000/0001-00 */
export const maskCnpj = (v) => {
  const d = String(v).replace(/\D/g, '').slice(0, 14);
  const m = d.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  return [m[1], m[2] && `.${m[2]}`, m[3] && `.${m[3]}`, m[4] && `/${m[4]}`, m[5] && `-${m[5]}`].filter(Boolean).join('');
};
export function cnpjValido(v) {
  const d = String(v).replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const dig = (n) => { let s = 0, p = n - 7; for (let i = 0; i < n; i++) { s += +d[i] * p--; if (p < 2) p = 9; } const r = s % 11; return r < 2 ? 0 : 11 - r; };
  return dig(12) === +d[12] && dig(13) === +d[13];
}
