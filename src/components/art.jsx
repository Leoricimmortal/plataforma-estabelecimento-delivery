// Desenhos em SVG: gráficos, selos de fidelidade, presente, mapa ilustrativo e logo.
import { useId } from 'react';
import { brl } from '../lib/format';

export function LineChart({ labels, series, max, step, h = 230, smooth = false, money = true }) {
  const uid = useId().replace(/:/g, '');
  const W = 700, L = 66, R = 14, T = 14, B = 32, iw = W - L - R, ih = h - T - B;
  const x = (i) => L + i * (iw / (labels.length - 1)), y = (v) => T + ih - (v / max) * ih;
  const path = (d) => {
    if (!smooth) return d.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
    let p = `M${x(0)},${y(d[0])}`;
    for (let i = 0; i < d.length - 1; i++) { const cx = (x(i) + x(i + 1)) / 2; p += ` C${cx},${y(d[i])} ${cx},${y(d[i + 1])} ${x(i + 1)},${y(d[i + 1])}`; }
    return p;
  };
  const ticks = []; for (let v = 0; v <= max; v += step) ticks.push(v);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Gráfico">
      <defs>{series.map((se, k) => (
        <linearGradient key={k} id={`${uid}${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={se.color} stopOpacity=".22" /><stop offset="1" stopColor={se.color} stopOpacity="0" /></linearGradient>
      ))}</defs>
      {ticks.map((v) => (<g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e9eef5" /><text x={L - 10} y={y(v) + 4} textAnchor="end" fontSize="11.5" fill="#3f6cb0">{money ? 'R$ ' + v.toLocaleString('pt-BR') : v}</text></g>))}
      {labels.map((l, i) => (<g key={l}><line x1={x(i)} x2={x(i)} y1={T} y2={T + ih} stroke="#f1f4f8" /><text x={x(i)} y={h - 8} textAnchor="middle" fontSize="11.5" fill="#3f6cb0">{l}</text></g>))}
      {series.map((se, k) => {
        const p = path(se.data);
        return (
          <g key={k}>
            <path d={`${p} L${x(se.data.length - 1)},${T + ih} L${x(0)},${T + ih} Z`} fill={`url(#${uid}${k})`} />
            <path d={p} fill="none" stroke={se.color} strokeWidth="2.5" strokeLinejoin="round" />
            {se.data.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={i === se.data.length - 1 ? 5.5 : 4} fill={se.color} stroke="#fff" strokeWidth="2"><title>{`${labels[i]}: ${money ? brl(v) : v}`}</title></circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ parts, center, sub }) {
  const r = 70, c = 2 * Math.PI * r; let off = 0;
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" style={{ maxWidth: '100%' }}>
      {parts.map((p, i) => { const len = (c * p.v) / 100; const el = <circle key={i} r={r} cx="100" cy="100" fill="none" stroke={p.color} strokeWidth="26" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 100 100)" />; off += len; return el; })}
      <text x="100" y="98" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f1b2d">{center}</text>
      <text x="100" y="118" textAnchor="middle" fontSize="11" fill="#3f6cb0">{sub}</text>
    </svg>
  );
}

const SEAL_PTS = (() => { const pts = [], n = 18, c = 50; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? 44 : 50, a = (Math.PI * i) / n - Math.PI / 2; pts.push(`${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`); } return pts.join(' '); })();
export const GiftGlyph = () => (<g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><rect x="32" y="44" width="36" height="26" rx="2" /><path d="M28 36h44v8H28zM50 36v34M50 36c-4-10-16-10-14-2s14 2 14 2c4-10 16-10 14-2s-14 2-14 2" /></g>);
export const StarGlyph = () => <path d="M50 30l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="#fff" />;
export const MedalGlyph = () => (<g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"><circle cx="50" cy="44" r="12" /><path d="M42 54l-4 16h24l-4-16" /></g>);
/** Selo serrilhado de fidelidade. content: número ou um glifo SVG. */
export function Seal({ content, on, size = 64 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <polygon points={SEAL_PTS} fill={on ? '#ff8a3d' : '#dfe6f1'} />
      <circle cx="50" cy="50" r="38" fill={on ? '#ff6a13' : '#eef2f8'} stroke={on ? '#ffb27d' : '#ffffff'} strokeWidth="3" />
      {typeof content === 'number' ? <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="800" fill={on ? '#fff' : '#3d5680'} fontFamily="Plus Jakarta Sans, sans-serif">{content}</text> : content}
    </svg>
  );
}

export function GiftArt() {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 200 170" width="200" height="170" aria-hidden="true">
      <g stroke="#ffb35c" strokeWidth="6" strokeLinecap="round"><path d="M20 30l14 10M14 80h16M30 130l14-8M178 24l-10 14M186 90h-14" /></g>
      <rect x="48" y="70" width="110" height="90" rx="6" fill="#ffb21f" /><rect x="48" y="70" width="110" height="90" rx="6" fill={`url(#${id})`} />
      <rect x="40" y="56" width="126" height="26" rx="5" fill="#ffc94a" />
      <rect x="94" y="56" width="18" height="104" fill="#e8321e" />
      <path d="M103 56c-18-34-52-30-44-6 6 16 44 6 44 6zM103 56c18-34 52-30 44-6-6 16-44 6-44 6z" fill="#f2412b" stroke="#c42815" strokeWidth="3" />
      <defs><linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".15" /><stop offset="1" stopColor="#e07a00" stopOpacity=".35" /></linearGradient></defs>
    </svg>
  );
}

/** Mapa ilustrativo usado quando o Leaflet não carrega. */
export function MapSvg() {
  const lines = [];
  for (let i = 0; i < 14; i++) lines.push(<line key={`a${i}`} x1={-40 + i * 55} y1="0" x2={i * 55 + 30} y2="260" stroke="#fff" strokeWidth={i % 4 === 0 ? 6 : 3} />);
  for (let i = 0; i < 9; i++) lines.push(<line key={`b${i}`} x1="0" y1={i * 32} x2="700" y2={i * 32 - 50} stroke="#fff" strokeWidth={i % 3 === 0 ? 6 : 3} />);
  return (
    <svg viewBox="0 0 700 260" role="img" aria-label="Mapa ilustrativo">
      <rect width="700" height="260" fill="#e9eef3" />{lines}
      <path d="M470 0 C430 80 480 150 560 200 S600 260 640 260 L700 260 L700 220 C620 200 520 130 520 60 L540 0Z" fill="#cfe3f2" />
      <path d="M240 108 L262 138 L320 128 L350 192 L420 170 L520 168 L560 188" fill="none" stroke="#2f7bf5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="240" cy="96" r="18" fill="#2f7bf5" /><circle cx="564" cy="122" r="20" fill="#ff6a13" />
    </svg>
  );
}

export const BrandMark = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <path d="M31 11.5A13 13 0 1 0 33 26" fill="none" stroke="#ff6a13" strokeWidth="6" strokeLinecap="round" />
    <path d="M14 17.5c2.5-3 7.5-3 9.5 0s-1 6.5-4.5 6.5h-4" fill="none" stroke="#ff6a13" strokeWidth="4" strokeLinecap="round" />
    <path d="M2 15h7M0 21h7" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
