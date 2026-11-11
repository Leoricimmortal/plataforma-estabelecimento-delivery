import Icon from '../components/Icon';
import { PageHead, Switch } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';
import { SOUNDS, playSound } from '../lib/sound';

const EVS = [['novo', 'Novo pedido'], ['status', 'Mudança de status'], ['cancel', 'Pedido cancelado'], ['final', 'Finalização de pedido']];

export default function Alertas() {
  const s = useApp((st) => st.som);
  const set = (patch) => mut((st) => { Object.assign(st.som, patch); });
  const tocar = (key, vol) => { if (!playSound(key, vol)) toast('Seu navegador bloqueou o áudio nesta página'); };

  return (
    <>
      <PageHead icon="volume-2" variant="square" title="Alertas de Som" sub="Configure os sons de notificação do sistema" back={{ to: 'usuarios', label: 'Configurações' }} />
      <div className="card card-pad al-main"><span className="al-bell"><Icon name="bell-ring" /></span>
        <div style={{ flex: 1, minWidth: 0 }}><h2>Ativar alertas sonoros</h2><p>Receba um som sempre que houver um novo pedido, mudança de status ou evento importante.</p></div>
        <div className="al-toggle"><Switch variant="huge" checked={s.on} onChange={(v) => set({ on: v })} label="Ativar alertas sonoros" /><b className={s.on ? '' : 'off'}>{s.on ? 'Ativado' : 'Desativado'}</b>{s.on && <Icon name="check-circle-2" className="ok" />}</div>
      </div>
      <fieldset className="al-set" disabled={!s.on}>
        <div className="card card-pad"><div className="sec-h"><Icon name="volume-2" className="ico-or" /><div><h3 style={{ fontSize: 18 }}>Volume do som</h3><p style={{ fontSize: 14 }}>Ajuste o volume dos alertas sonoros conforme sua preferência.</p></div></div>
          <div className="vol"><Icon name="volume-x" /><input type="range" id="somVol" min="0" max="100" value={s.vol} style={{ '--v': `${s.vol}%` }} aria-label="Volume" onChange={(e) => set({ vol: +e.target.value })} /><Icon name="volume-2" /><b className="num">{s.vol}%</b></div></div>
        <div className="card card-pad"><div className="sec-h"><Icon name="music" className="ico-or" /><div><h3 style={{ fontSize: 18 }}>Som de notificação</h3><p style={{ fontSize: 14 }}>Escolha o som que será reproduzido nos alertas.</p></div></div>
          <div className="pr-row">
            <label className="inp grow" style={{ minHeight: 54 }}><Icon name="play" /><select id="somSel" style={{ fontSize: 16 }} aria-label="Som" value={s.sound} onChange={(e) => { set({ sound: e.target.value }); tocar(e.target.value, s.vol); }}>{Object.entries(SOUNDS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></label>
            <button type="button" className="btn btn-outline-or" style={{ minWidth: 230, fontSize: 17 }} onClick={() => tocar(s.sound, s.vol)}><Icon name="play" /> Testar Som</button>
          </div></div>
        <div className="card card-pad al-events"><span className="ico-c lg blue"><Icon name="info" /></span><div><h3>Eventos que geram alerta</h3><p>Você receberá um som nas seguintes situações. Toque para ligar ou desligar.</p>
          <div className="chips">{EVS.map(([k, l]) => <button key={k} type="button" className={`chip ${s.ev[k] ? 'on' : ''}`} aria-pressed={s.ev[k]} onClick={() => mut((st) => { st.som.ev[k] = !st.som.ev[k]; })}><Icon name={s.ev[k] ? 'check-circle-2' : 'circle'} />{l}</button>)}</div></div></div>
      </fieldset>
      <div className="form-actions"><button className="btn btn-primary" style={{ fontSize: 17, padding: '15px 28px' }} onClick={() => toast(s.on ? `Alertas salvos: ${SOUNDS[s.sound][0]}, volume ${s.vol}%` : 'Alertas sonoros desativados')}><Icon name="check" /> Salvar Configurações</button></div>
    </>
  );
}
