// Cálculos de mapa para a simulação do entregador.
import { MIN } from './format';

// Setor Bueno, Goiânia. No sistema real vem da geocodificação do endereço da loja.
export const LOJA_POS = [-16.7055, -49.2647];

export const rnd = (a, b) => a + Math.random() * (b - a);
export function offsetKm([lat, lng], km, deg) {
  const r = (deg * Math.PI) / 180;
  return [lat + (km / 111.32) * Math.cos(r), lng + (km / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(r)];
}
export function distKm(a, b) {
  const R = 6371, dLa = ((b[0] - a[0]) * Math.PI) / 180, dLo = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Moto a ~22 km/h, entre 3 e 9 minutos. */
export const viagemMs = (km) => Math.max(3, Math.min(9, (km / 22) * 60)) * MIN;
export const progresso = (a, b, now = Date.now()) => (now >= b ? 1 : Math.min(1, Math.max(0, (now - a) / Math.max(1, b - a))));

export const gmapsUrl = (o, d) => `https://www.google.com/maps/dir/?api=1&origin=${o[0].toFixed(6)},${o[1].toFixed(6)}&destination=${d[0].toFixed(6)},${d[1].toFixed(6)}&travelmode=driving`;
export const wazeUrl = (d) => `https://waze.com/ul?ll=${d[0].toFixed(6)},${d[1].toFixed(6)}&navigate=yes`;
