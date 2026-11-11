// Sons de alerta gerados no navegador (sem arquivos de áudio).
export const SOUNDS = {
  padrao: ['Padrão (Pedido Novo)', [[880, 0.12], [1175, 0.18]]],
  sino: ['Sino', [[1320, 0.5]]],
  campainha: ['Campainha', [[660, 0.15], [880, 0.15], [660, 0.15], [880, 0.15]]],
  alarme: ['Alarme urgente', [[1000, 0.1], [0, 0.05], [1000, 0.1], [0, 0.05], [1000, 0.1]]],
  suave: ['Suave', [[523, 0.2], [659, 0.2], [784, 0.3]]],
};
let ctx;
/** @returns {boolean} false se o navegador bloqueou o áudio */
export function playSound(key, vol) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    for (const [f, d] of SOUNDS[key][1]) {
      if (f) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = key === 'sino' ? 'sine' : 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (vol / 100) * 0.4), t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + 0.02);
      }
      t += d;
    }
    return true;
  } catch { return false; }
}
