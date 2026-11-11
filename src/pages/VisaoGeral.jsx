import Icon from '../components/Icon';
import { Stat, Stars, StPill, Pill, Thumb } from '../components/ui';
import { LineChart } from '../components/art';
import { useApp, openModal, toast } from '../store/useApp';
import { navigate } from '../store/actions';
import { kanPedidos } from '../domain/pedidos';
import { lojaSituacao } from '../lib/hours';
import { brl, fmtTime } from '../lib/format';

const TOP = [['X-Bacon', 32, 18, '🍔'], ['Batata Frita', 28, 15, '🍟'], ['Refrigerante Lata', 24, 13, '🥤'], ['X-Tudo', 20, 11, '🍔'], ['Porção de Nuggets', 18, 10, '🍗']];
const REVIEWS = [['Maria Silva', '#4586 - 12/06/2025', 'Muito bom! Lanche chegou quente e no horário.', 5], ['João Pereira', '#4582 - 11/06/2025', 'Gostei, mas demorou um pouco.', 4], ['Ana Costa', '#4578 - 10/06/2025', 'Sempre peço e nunca me decepcionei.', 5]];

export default function VisaoGeral() {
  const pedidos = useApp((s) => s.pedidos), now = useApp((s) => s.now);
  const loja = useApp((s) => s.loja), logo = useApp((s) => s.logo), hours = useApp((s) => s.hours), override = useApp((s) => s.override);
  const st = lojaSituacao(hours, override, now);
  const today = new Date(now).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const last = [...pedidos].sort((a, b) => b.created - a.created).slice(0, 5);
  const d24 = kanPedidos(pedidos, now), okd = d24.filter((p) => p.status !== 'cancelado'), fatd = okd.reduce((a, p) => a + p.valor, 0);
  const abrir = (num) => openModal('pedido', { num });

  return (
    <>
      <div className="dash-top">
        <div className="store-hero"><Thumb item={{ img: logo, thumb: '🍔' }} /><div><h2>{loja.nome || 'Minha loja'}</h2><p>{loja.tipo} <span style={{ color: 'var(--sub)' }}>•</span> {loja.cid} - {loja.uf}</p></div></div>
        <div className="card status-card">
          {st.open ? <Pill tone="p-green" icon="check-circle-2">Loja Aberta</Pill> : <Pill tone="p-gray" icon="x-circle">Loja Fechada</Pill>}
          <a className="hint" href="#detalhes-loja" style={{ display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}>{st.hint} <Icon name="chevron-right" /></a>
        </div>
        <div className="card status-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Icon name="calendar" /><div><b style={{ color: 'var(--ink)' }}>Hoje</b><div className="hint" style={{ fontSize: 13 }}>{today}</div></div></div>
      </div>
      <div className="stats">
        <Stat icon="circle-dollar-sign" label="Lucro do dia" value="R$ 1.248,50" d="12%" note="em relação a ontem" go dark />
        <Stat icon="shopping-bag" color="blue" label="Pedidos nas últimas 24h" value={String(d24.length)} go dark extra={<div className="hint">{brl(fatd)} faturados</div>} />
        <Stat icon="receipt" color="purple" label="Ticket médio" value={brl(okd.length ? fatd / okd.length : 0)} go dark extra={<div className="hint">Últimas 24 horas</div>} />
        <div className="card stat"><span className="ico-c lg yellow"><Icon name="star" /></span><div style={{ minWidth: 0, flex: 1 }}><div className="lbl dark">Avaliação dos pedidos</div><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="val">4,8</span><Stars n={5} inline /></div><div className="hint">(128 avaliações)</div></div><Icon name="chevron-right" className="go" /></div>
      </div>
      <div className="grid-dash">
        <div className="card card-pad">
          <div className="card-h"><span className="ico-c"><Icon name="circle-dollar-sign" /></span><h3>Lucro nos últimos 7 dias</h3><select className="sel" style={{ marginLeft: 'auto', minHeight: 36 }} aria-label="Período"><option>7 dias</option><option>15 dias</option><option>30 dias</option></select></div>
          <LineChart labels={['06/06', '07/06', '08/06', '09/06', '10/06', '11/06', '12/06']} series={[{ color: '#ff6a13', data: [460, 180, 520, 920, 520, 880, 1248] }]} max={2000} step={500} />
        </div>
        <div className="card card-pad">
          <div className="card-h"><span className="ico-c"><Icon name="trophy" /></span><h3>Produtos mais vendidos</h3><a className="link" href="#produtos">Ver todos</a></div>
          <div className="top-list">{TOP.map((t, i) => <div key={t[0]} className="top-row"><span className="rk">{i + 1}</span><span className="thumb">{t[3]}</span><div><b>{t[0]}</b><small>{t[1]} pedidos</small></div><div className="bar"><i style={{ width: `${t[2] * 5}%` }} /></div><span className="pct">{t[2]}%</span></div>)}</div>
        </div>
      </div>
      <div className="grid-dash">
        <div className="card card-pad">
          <div className="card-h"><span className="ico-c"><Icon name="clipboard-list" /></span><h3>Pedidos</h3><a className="link" href="#historico">Ver todos</a></div>
          <div className="mini-status">
            <div className="mini"><Icon name="clipboard-list" /><div><small>Em andamento</small><b>{d24.filter((p) => ['recebido', 'preparo', 'pronto'].includes(p.status)).length}</b></div></div>
            <div className="mini" style={{ color: 'var(--orange)' }}><Icon name="truck" /><div><small>Em rota</small><b>{d24.filter((p) => p.status === 'rota').length}</b></div></div>
            <div className="mini"><span className="ico-c green" style={{ width: 28, height: 28 }}><Icon name="check" /></span><div><small>Entregues</small><b>{pedidos.filter((p) => p.status === 'entregue').length}</b></div></div>
            <div className="mini"><span className="ico-c red" style={{ width: 28, height: 28 }}><Icon name="x" /></span><div><small>Cancelados</small><b>{pedidos.filter((p) => p.status === 'cancelado').length}</b></div></div>
          </div>
          <h4 style={{ margin: '0 0 10px', color: 'var(--ink)' }}>Últimos pedidos</h4>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Nº do pedido</th><th>Cliente</th><th>Valor</th><th>Status</th><th>Horário</th><th></th></tr></thead><tbody>
            {last.map((p) => (
              <tr key={p.num} className="clickable" tabIndex={0} onClick={() => abrir(p.num)} onKeyDown={(e) => e.key === 'Enter' && abrir(p.num)}>
                <td><b>#{p.num}</b></td><td className="muted">{p.cli}</td><td className="muted num">{brl(p.valor)}</td><td><StPill status={p.status} /></td><td className="muted num">{fmtTime(p.created)}</td><td><Icon name="chevron-right" /></td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
        <div className="card card-pad">
          <div className="card-h"><span className="ico-c"><Icon name="star" /></span><h3>Avaliações recentes</h3><button className="link" onClick={() => toast('Abrindo todas as avaliações')}>Ver todas</button></div>
          {REVIEWS.map((r) => <div key={r[1]} className="review"><span className="avatar" style={{ width: 40, height: 40 }}><Icon name="user" /></span><div style={{ minWidth: 0 }}><b>{r[0]}</b><div className="meta">Pedido {r[1]}</div><q>{r[2]}</q></div><Stars n={r[3]} /></div>)}
        </div>
      </div>
      <div className="dash-bottom">
        <div className="card card-pad"><div className="card-h"><span className="ico-c" style={{ width: 28, height: 28 }}><Icon name="zap" /></span><h3 style={{ fontSize: 14 }}>Acesso rápido</h3></div>
          <div className="quick">
            <button onClick={() => navigate('produtos')}><Icon name="plus-circle" /><div><b>Novo produto</b><small>Adicionar itens ao cardápio</small></div></button>
            <button onClick={() => openModal('pedidoManual')}><Icon name="monitor" /><div><b>Novo Pedido</b><small>Realizar pedido manual</small></div></button>
            <button onClick={() => navigate('lucro')}><Icon name="line-chart" /><div><b>Relatório de Vendas</b><small>Ver gráficos e lucros</small></div></button>
          </div></div>
        <div className="card card-pad"><div className="card-h"><span className="ico-c" style={{ width: 28, height: 28 }}><Icon name="megaphone" /></span><h3 style={{ fontSize: 14 }}>Marketing</h3><a className="link" href="#cupons">Ver todos</a></div>
          <div className="link-list">
            <a href="#cupons"><span className="ico-c" style={{ width: 30, height: 30 }}><Icon name="ticket" /></span><div><b>Cupons</b><small>Crie descontos para sua loja</small></div><Icon name="chevron-right" /></a>
            <a href="#fidelidade"><span className="ico-c" style={{ width: 30, height: 30 }}><Icon name="heart" /></span><div><b>Fidelidade</b><small>Programa de pontos e selos</small></div><Icon name="chevron-right" /></a>
          </div></div>
        <div className="card card-pad"><div className="card-h"><span className="ico-c" style={{ width: 28, height: 28 }}><Icon name="settings" /></span><h3 style={{ fontSize: 14 }}>Configurações</h3><a className="link" href="#usuarios">Ver todos</a></div>
          <div className="link-list">
            <a href="#usuarios"><Icon name="users" /><div><b>Usuários</b><small>Cadastre seus colaboradores</small></div><Icon name="chevron-right" /></a>
            <a href="#alertas"><Icon name="bell" /><div><b>Alertas de Som</b><small>Ative ou desative os alertas</small></div><Icon name="chevron-right" /></a>
            <a href="#impressao"><Icon name="printer" /><div><b>Impressão</b><small>Configure sua impressora</small></div><Icon name="chevron-right" /></a>
          </div></div>
      </div>
    </>
  );
}
