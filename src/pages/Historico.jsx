import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, Stat, StPill, PayIcon, CheckAll, usePaged } from '../components/ui';
import { useApp, openModal, toast } from '../store/useApp';
import { ST } from '../domain/pedidos';
import { exportarPedidos } from '../lib/sheets';
import { brl, fmtDate, fmtTime, DAY } from '../lib/format';

export default function Historico() {
  const all = useApp((s) => s.pedidos), now = useApp((s) => s.now);
  const [fl, setFl] = useState({ q: '', st: '', pg: '', ci: '' });
  const ok = all.filter((p) => p.status !== 'cancelado'), fat = ok.reduce((a, p) => a + p.valor, 0);
  const cities = [...new Set(all.map((p) => p.cidade))];
  const rows = useMemo(() => {
    const q = fl.q.toLowerCase().replace('#', '');
    return all.filter((p) => (!q || (String(p.num) + p.cli + p.tel).toLowerCase().includes(q)) && (!fl.st || p.status === fl.st) && (!fl.pg || p.pg === fl.pg) && (!fl.ci || p.cidade === fl.ci)).sort((a, b) => b.created - a.created);
  }, [all, fl]);
  const pg = usePaged(rows, 8);
  const filtro = (k) => ({ value: fl[k], onChange: (e) => { setFl({ ...fl, [k]: e.target.value }); pg.reset(); } });

  return (
    <>
      <PageHead icon="shopping-bag" title="Histórico de pedidos" sub="Todos os pedidos da loja, inclusive os que já saíram do Gestor de pedidos. O status acompanha o Kanban em tempo real."
        crumb={<div className="crumb"><b style={{ color: 'var(--ink)' }}>Pedidos e Ganhos</b><Icon name="chevron-right" />Histórico de pedidos</div>}
        actions={<button className="btn btn-outline" onClick={() => toast(`${exportarPedidos(rows, ST)} baixado`)}><Icon name="download" /> Exportar pedidos</button>} />
      <div className="stats">
        <Stat icon="shopping-cart" color="blue" label="Total de pedidos" value={all.length.toLocaleString('pt-BR')} extra={<div className="hint">{all.filter((p) => now - p.created < DAY).length} nas últimas 24 horas</div>} />
        <Stat icon="wallet" color="green" label="Faturamento total" value={brl(fat)} extra={<div className="hint">Sem contar cancelados</div>} />
        <Stat icon="receipt" color="purple" label="Ticket médio" value={brl(ok.length ? fat / ok.length : 0)} extra={<div className="hint">{ok.length} pedidos válidos</div>} />
        <Stat icon="x-circle" color="red" label="Cancelados" value={String(all.length - ok.length)} extra={<div className="hint">{all.length ? Math.round(((all.length - ok.length) / all.length) * 100) : 0}% do total</div>} />
      </div>
      <div className="card card-pad">
        <div className="filters">
          <label className="inp grow"><Icon name="search" /><input id="histSearch" placeholder="Buscar por pedido, cliente, telefone..." {...filtro('q')} /></label>
          <select className="sel" {...filtro('st')}><option value="">Todos os status</option>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select>
          <select className="sel" {...filtro('pg')}><option value="">Todas as formas de pagamento</option><option>Pix</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Dinheiro</option></select>
          <select className="sel" {...filtro('ci')}><option value="">Todas as cidades</option>{cities.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th><CheckAll /></th><th>Pedido</th><th>Cliente</th><th>Telefone</th><th>Endereço</th><th>Cidade</th><th>Valor</th><th>Forma de pagamento</th><th>Status</th><th>Data do pedido</th><th>Ações</th></tr></thead><tbody>
          {pg.slice.length ? pg.slice.map((p) => (
            <tr key={p.num}><td><input type="checkbox" aria-label={`Selecionar #${p.num}`} /></td><td><b>#{p.num}</b></td><td>{p.cli}</td>
              <td><span className="wa-link">{p.tel} <Icon name="message-circle" className="wa" /></span></td><td className="muted">{p.end}</td><td className="muted">{p.cidade}</td><td className="num">{brl(p.valor)}</td>
              <td><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><PayIcon pg={p.pg} />{p.pg}</span></td><td><StPill status={p.status} /></td>
              <td className="muted num">{fmtDate(p.created)}<br />{fmtTime(p.created)}</td>
              <td><div className="acts"><button className="icon-btn" onClick={() => openModal('pedido', { num: p.num })} aria-label={`Ver pedido #${p.num}`}><Icon name="eye" /></button></div></td></tr>
          )) : <tr><td colSpan={11} className="muted" style={{ textAlign: 'center', padding: 30 }}>Nenhum pedido com esses filtros.</td></tr>}
        </tbody></table></div>
        {pg.foot('pedido', 'pedidos')}
      </div>
    </>
  );
}
