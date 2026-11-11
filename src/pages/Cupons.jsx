import { useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, Stat, CheckAll, exigir } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';
import { navigate } from '../store/actions';
import { brl, isoToBR } from '../lib/format';

const TC = { Percentual: 'p-blue', Frete: 'p-green', Valor: 'p-orange' };
const SC = { Ativo: 'p-green', Expirado: 'p-red', Inativo: 'p-gray' };
const VAZIO = { code: '', desc: '', tipo: 'Percentual', val: '', data: '2026-12-31', lim: '', app: 'Todos os produtos' };

export default function Cupons() {
  const coupons = useApp((s) => s.coupons), open = useApp((s) => s.ui.panels.cupons);
  const [fl, setFl] = useState({ q: '', t: '', s: '' });
  const [f, setF] = useState(VAZIO);
  const setPanel = (on) => mut((s) => { s.ui.panels.cupons = on; });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const q = fl.q.toLowerCase();
  const list = coupons.filter((c) => (!q || (c.c + c.d).toLowerCase().includes(q)) && (!fl.t || c.t === fl.t) && (!fl.s || c.s === fl.s));

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[f.code, 'cCode']])) return;
    if (f.tipo !== 'Frete' && !f.val) { document.getElementById('cVal').focus(); toast('Informe o valor do desconto'); return; }
    mut((s) => { s.coupons.unshift({ c: f.code.trim().toUpperCase().replace(/\s/g, ''), d: f.desc || '—', t: f.tipo, v: f.tipo === 'Frete' ? 'Grátis' : f.tipo === 'Valor' ? brl(+f.val) : `${f.val}%`, val: isoToBR(f.data), s: 'Ativo', u: 0 }); });
    setF(VAZIO); toast('Cupom criado');
  };

  return (
    <>
      <PageHead icon="tag" title="Cupons" sub="Crie e gerencie cupons de desconto para sua loja."
        actions={<><button className="btn btn-outline" onClick={() => navigate('lucro')}><Icon name="bar-chart-3" /> Relatório de Cupons</button><button className="btn btn-primary" onClick={() => setPanel(true)}><Icon name="plus" /> Novo Cupom</button></>} />
      <div className="stats">
        <Stat icon="ticket" color="blue" label="Total de Cupons" value={String(coupons.length)} d="20%" note="vs. mês anterior" />
        <Stat icon="check-circle-2" color="green" label="Cupons Ativos" value={String(coupons.filter((c) => c.s === 'Ativo').length)} d="14%" note="vs. mês anterior" />
        <Stat icon="tag" color="purple" label="Utilizações" value="1.482" d="32%" note="vs. mês anterior" />
        <Stat icon="shopping-cart" label="Desconto Total" value="R$ 3.740,50" d="28%" note="vs. mês anterior" />
      </div>
      <div className={`with-panel ${open ? '' : 'closed'}`}>
        <div className="card card-pad">
          <div className="filters">
            <label className="inp grow"><Icon name="search" /><input placeholder="Buscar cupom..." value={fl.q} onChange={(e) => setFl({ ...fl, q: e.target.value })} /></label>
            <select className="sel" value={fl.t} onChange={(e) => setFl({ ...fl, t: e.target.value })}><option value="">Todos os tipos</option><option>Percentual</option><option>Valor</option><option>Frete</option></select>
            <select className="sel" value={fl.s} onChange={(e) => setFl({ ...fl, s: e.target.value })}><option value="">Todos os status</option><option>Ativo</option><option>Expirado</option></select>
            <select className="sel"><option>Últimos 30 dias</option><option>Últimos 90 dias</option></select>
          </div>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th><CheckAll /></th><th>Código</th><th>Descrição</th><th>Tipo</th><th>Desconto</th><th>Validade</th><th>Status</th><th>Utilizações</th><th>Ações</th></tr></thead><tbody>
            {list.length ? list.map((c) => (
              <tr key={c.c}><td><input type="checkbox" aria-label={`Selecionar ${c.c}`} /></td><td><span className="code-chip">{c.c}</span></td><td>{c.d}</td><td><span className={`pill ${TC[c.t]}`}>{c.t}</span></td><td>{c.v}</td><td className="num">Até {c.val}</td>
                <td><span className={`pill ${SC[c.s] || 'p-gray'}`}>{c.s}</span></td><td className="num">{c.u}</td>
                <td><div className="acts"><button className="icon-btn" aria-label="Ver"><Icon name="eye" /></button><button className="icon-btn" aria-label="Mais"><Icon name="more-vertical" /></button></div></td></tr>
            )) : <tr><td colSpan={9} className="muted" style={{ textAlign: 'center', padding: 30 }}>Nenhum cupom encontrado.</td></tr>}
          </tbody></table></div>
          <div className="tbl-foot"><span>Mostrando {list.length ? 1 : 0} a {list.length} de {list.length} cupons</span></div>
        </div>
        {open && (
          <form className="card panel" id="cupForm" noValidate onSubmit={salvar}>
            <div className="panel-h"><span className="ico-c"><Icon name="plus" /></span><h2>Novo Cupom</h2><button type="button" className="icon-btn x" onClick={() => setPanel(false)} aria-label="Fechar"><Icon name="x" /></button></div>
            <div className="form-stack">
              <div className="field"><label htmlFor="cCode">Código do cupom <span className="req">*</span></label><div className="inp"><input id="cCode" value={f.code} onChange={set('code')} placeholder="Ex: BEMVINDO" style={{ textTransform: 'uppercase' }} required /></div><span className="hint">Use letras e números, sem espaços.</span></div>
              <div className="field"><label htmlFor="cDesc">Descrição <span className="opt">(opcional)</span></label><div className="inp"><input id="cDesc" value={f.desc} onChange={set('desc')} placeholder="Ex: Cupom de boas-vindas" /></div></div>
              <div className="field"><span className="lab">Tipo de desconto <span className="req">*</span></span>
                {[['Percentual', 'Percentual de desconto', 'Ex: 10%, 20%...'], ['Valor', 'Valor fixo', 'Ex: R$ 10,00'], ['Frete', 'Frete grátis', 'Entrega grátis para o pedido.']].map(([v, b, sm]) => (
                  <label key={v} className="radio"><input type="radio" name="cType" value={v} checked={f.tipo === v} onChange={set('tipo')} /><div><b>{b}</b><small>{sm}</small></div></label>
                ))}</div>
              <div className="field" hidden={f.tipo === 'Frete'}><label htmlFor="cVal">Valor do desconto <span className="req">*</span></label><div className="inp"><input id="cVal" type="number" min="0" step="0.01" value={f.val} onChange={set('val')} placeholder="Ex: 10" /><span className="post">{f.tipo === 'Valor' ? 'R$' : '%'}</span></div></div>
              <div className="field"><label htmlFor="cDate">Validade <span className="req">*</span></label><div className="inp"><Icon name="calendar" /><input id="cDate" type="date" value={f.data} onChange={set('data')} /></div></div>
              <div className="field"><label htmlFor="cLim">Limite de uso <span className="opt">(opcional)</span></label><div className="inp"><input id="cLim" type="number" min="1" value={f.lim} onChange={set('lim')} placeholder="Ex: 100" /></div><span className="hint">Deixe em branco para uso ilimitado.</span></div>
              <div className="field"><label htmlFor="cApp">Aplicável em <span className="req">*</span></label><select className="sel" id="cApp" value={f.app} onChange={set('app')}><option>Todos os produtos</option><option>Hambúrgueres</option><option>Porções</option><option>Bebidas</option></select></div>
            </div>
            <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={() => setPanel(false)}>Cancelar</button><button className="btn btn-primary"><Icon name="save" /> Criar Cupom</button></div>
          </form>
        )}
      </div>
    </>
  );
}
