// Gestor de pedidos (Kanban): arraste o cartão entre as etapas.
import { useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, Stat, Pill, PayIcon } from '../components/ui';
import { useApp, openModal } from '../store/useApp';
import { mudarStatus } from '../store/actions';
import { COLS, kanPedidos, ageMin, isLate, etaText, semAceite } from '../domain/pedidos';
import { brl, fmtTime } from '../lib/format';

function KCard({ p, c, now, hidden }) {
  const col = c[0], a = ageMin(p, now);
  const [drag, setDrag] = useState(false);
  let badge = null;
  if (col === 'recebido') badge = a <= 10 ? <Pill tone="p-blue" icon="sparkles" style={{ marginLeft: 'auto' }}>Novo</Pill> : a > 15 ? <Pill tone="p-red" icon="alert-triangle" style={{ marginLeft: 'auto' }}>Alta prioridade</Pill> : null;
  if (col === 'preparo') badge = <Pill tone="p-orange" icon="clock" style={{ marginLeft: 'auto' }}>Em preparo</Pill>;
  if (col === 'pronto' || col === 'rota') badge = <Pill tone="p-blue" style={{ marginLeft: 'auto' }}>{fmtTime(p.created)}</Pill>;
  if (col === 'entregue') badge = <><span style={{ marginLeft: 'auto', color: 'var(--sub)' }}>{fmtTime(p.updated)}</span><Pill tone="p-green">Entregue</Pill></>;
  const st = p.coleta?.stage;
  const abrir = () => openModal('pedido', { num: p.num });

  return (
    <article className={`ocard ${drag ? 'dragging' : ''}`} draggable tabIndex={0} hidden={hidden} style={{ '--c': c[4] }} aria-label={`Pedido #${p.num}, ${p.cli}`}
      onDragStart={(e) => { setDrag(true); e.dataTransfer.setData('text/plain', String(p.num)); e.dataTransfer.effectAllowed = 'move'; }}
      onDragEnd={() => setDrag(false)} onClick={abrir} onKeyDown={(e) => e.key === 'Enter' && abrir()}>
      {col === 'recebido' && a > 15 && <span className="pill late" style={{ marginBottom: 6 }}><Icon name="alarm-clock" /> Há {a} min</span>}
      {col === 'pronto' && st === 'chegou' && <span className="pill" style={{ background: '#5b3ee8', color: '#fff', marginBottom: 6 }}><Icon name="map-pin" /> Entregador na loja</span>}
      {col === 'pronto' && semAceite(p, now) && <span className="pill late" style={{ marginBottom: 6 }}><Icon name="alert-triangle" /> Sem entregador</span>}
      <div className="o-top"><span className="o-num">#{p.num}</span><span className="o-id">ID: {p.id}</span>{badge}</div>
      <div className="o-line"><Icon name="user" /><div><div className="o-name">{p.cli}</div>{p.itens}</div></div>
      {col === 'pronto' ? <>
        <div className="o-foot"><Pill tone="p-purple" icon="shield-check">{p.coleta?.code || '—'}</Pill><b className="num">{brl(p.valor)}</b></div>
        <div className="o-foot"><span className="o-eta"><Icon name={st === 'buscando' ? 'radar' : st === 'retirada' ? 'store' : 'bike'} /><span>{etaText(p, now)}</span></span></div>
      </> : <>
        <div className="o-foot"><span><Icon name={p.modo === 'Retirada' ? 'store' : 'truck'} />{p.modo}</span><span><PayIcon pg={p.pg} />{p.pg}</span><b className="num">{brl(p.valor)}</b></div>
        {col === 'rota' && <div className="o-foot"><Pill tone="p-purple" icon="bike">{p.rota?.driver?.nome || 'Em rota'}</Pill><span>{etaText(p, now)}</span></div>}
      </>}
    </article>
  );
}

export default function PainelVendas() {
  const pedidos = useApp((s) => s.pedidos), now = useApp((s) => s.now);
  const [q, setQ] = useState('');
  const [over, setOver] = useState(null);
  const K = kanPedidos(pedidos, now), by = (s) => K.filter((p) => p.status === s).sort((a, b) => b.updated - a.updated);
  const total = K.length, and = K.filter((p) => ['recebido', 'preparo', 'pronto', 'rota'].includes(p.status)).length, ent = by('entregue').length, can = by('cancelado').length, late = K.filter((p) => isLate(p, now)).length;
  const pc = (n) => (total ? Math.round((n / total) * 100) : 0);
  const busca = q.trim().replace('#', '');
  const escondido = (p) => !!busca && !(String(p.num).includes(busca) || `${p.cli} ${p.itens} ${p.id}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <>
      <PageHead icon="bar-chart-3" variant="dark" title="Gestor de pedidos" sub="Acompanhe o progresso dos pedidos em tempo real. Pedidos com mais de 24 horas saem daqui e ficam só no Histórico."
        actions={<>
          <label className="inp" style={{ minWidth: 240 }}><Icon name="search" /><input placeholder="Buscar por número do pedido..." id="kanSearch" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <button className="btn btn-primary" onClick={() => openModal('pedidoManual')}><Icon name="plus" /> Adicionar pedido manual</button>
        </>} />
      <div className="kan-stats">
        <Stat icon="calendar-days" color="blue" label="Pedidos nas últimas 24h" value={String(total)} />
        <Stat icon="clock" color="blue" label="Em andamento" value={String(and)} extra={<div className="hint">{pc(and)}% do total</div>} />
        <Stat icon="check" color="green" label="Entregues" value={String(ent)} extra={<div className="hint">{pc(ent)}% do total</div>} />
        <Stat icon="x" color="red" label="Cancelados" value={String(can)} extra={<div className="hint">{pc(can)}% do total</div>} />
        <Stat icon="alarm-clock" label="Atrasados" value={String(late)} extra={<div className="hint">{pc(late)}% do total</div>} />
        <a className="card alert-card" href="#historico" style={{ textDecoration: 'none' }}><Icon name="history" /><div><b>Histórico completo</b><small>{pedidos.length} pedidos no total</small><small>Inclui os cancelados e os de dias anteriores</small></div><Icon name="chevron-right" /></a>
      </div>
      <div className="kanban" id="kanban">
        {COLS.map((c) => {
          const list = by(c[0]);
          return (
            <section key={c[0]} className={`col ${over === c[0] ? 'drag-over' : ''}`} data-col={c[0]}
              onDragOver={(e) => { e.preventDefault(); if (over !== c[0]) setOver(c[0]); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }}
              onDrop={(e) => { e.preventDefault(); setOver(null); const n = e.dataTransfer.getData('text/plain'); if (n) mudarStatus(n, c[0]); }}>
              <div className="col-h" style={{ background: c[4] }}><Icon name={c[3]} /><div><h3>{c[1]}</h3><p>{c[2]}</p></div><span className="cnt">{list.length}</span></div>
              <div className="col-body">
                {list.map((p) => <KCard key={p.num} p={p} c={c} now={now} hidden={escondido(p)} />)}
                <div className="drop-hint"><Icon name="move" /> Arraste o pedido para outra etapa</div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
