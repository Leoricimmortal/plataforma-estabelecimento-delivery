import Icon from '../components/Icon';
import { PageHead, Stat, Delta } from '../components/ui';
import { LineChart, Donut } from '../components/art';
import { toast } from '../store/useApp';
import { brl } from '../lib/format';

const TP = [['X-Bacon', 5856.4, 18, '🍔'], ['Batata Frita', 3210.75, 12, '🍟'], ['Refrigerante Lata', 2842.1, 9, '🥤'], ['X-Tudo', 2609.65, 8, '🍔'], ['Porção de Nuggets', 1984.3, 6, '🍗']];
const LABELS = ['06/06', '07/06', '08/06', '09/06', '10/06', '11/06', '12/06'];

export default function Lucro() {
  return (
    <>
      <PageHead icon="circle-dollar-sign" title="Lucro" sub="Acompanhe o desempenho financeiro da sua loja."
        actions={<><label className="inp"><Icon name="calendar" /><input type="date" defaultValue="2025-06-12" aria-label="Data" /></label><select className="sel" style={{ minHeight: 46 }} aria-label="Período"><option>Últimos 7 dias</option><option>Últimos 30 dias</option><option>Este mês</option></select><button className="btn btn-outline" onClick={() => toast('Relatório exportado: lucro.pdf')}><Icon name="download" /> Exportar relatório</button></>} />
      <div className="stats">
        <Stat icon="wallet" color="green" label="Faturamento total" value="R$ 32.584,90" d="15%" />
        <Stat icon="circle-dollar-sign" label="Custos totais" value="R$ 17.320,45" d="-8%" />
        <Stat icon="bar-chart-3" color="blue" label="Lucro líquido" value="R$ 15.264,45" d="22%" />
        <Stat icon="percent" color="purple" label="Margem de lucro" value="46,9%" d="6%" />
      </div>
      <div className="lucro-grid">
        <div className="card card-pad"><div className="card-h" style={{ flexWrap: 'wrap' }}><span className="ico-c"><Icon name="circle-dollar-sign" /></span><h3>Evolução do lucro</h3><div className="legend"><span><i style={{ background: '#2f7bf5' }} />Faturamento</span><span><i style={{ background: '#ff6a13' }} />Custos</span><span><i style={{ background: '#20b15a' }} />Lucro</span></div></div>
          <LineChart labels={LABELS} series={[{ color: '#2f7bf5', data: [17500, 17400, 20200, 24600, 22000, 23800, 30200] }, { color: '#ff6a13', data: [10300, 10400, 12100, 14500, 13900, 14200, 20500] }, { color: '#20b15a', data: [3900, 4100, 6100, 9600, 7800, 10200, 13400] }]} max={40000} step={10000} smooth h={250} /></div>
        <div className="card card-pad"><div className="card-h"><span className="ico-c"><Icon name="briefcase" /></span><h3>Lucro por tipo de pedido</h3></div>
          <div className="donut-wrap"><Donut parts={[{ v: 71, color: '#ff6a13' }, { v: 22, color: '#2f7bf5' }, { v: 7, color: '#7c4dff' }]} center="R$ 15.264,45" sub="Lucro líquido" />
            <div className="donut-leg"><div><i style={{ background: '#ff6a13' }} /><span>Delivery</span><em>71%</em><small>R$ 10.842,30</small></div><div><i style={{ background: '#2f7bf5' }} /><span>Retirada no local</span><em>22%</em><small>R$ 3.295,60</small></div><div><i style={{ background: '#7c4dff' }} /><span>Combinado</span><em>7%</em><small>R$ 1.126,55</small></div></div></div></div>
      </div>
      <div className="lucro-grid">
        <div className="card card-pad"><div className="card-h"><span className="ico-c"><Icon name="package" /></span><h3>Top produtos por lucro</h3><a className="link" href="#produtos">Ver todos</a></div>
          <div className="top-list">{TP.map((t, i) => <div key={t[0]} className="top-row" style={{ gridTemplateColumns: '28px 40px minmax(0,1fr) minmax(0,1fr) 110px 36px' }}><span className="rk">{i + 1}</span><span className="thumb sm">{t[3]}</span><b>{t[0]}</b><div className="bar"><i style={{ width: `${t[2] * 4}%` }} /></div><span className="num" style={{ textAlign: 'right', color: 'var(--ink)' }}>{brl(t[1])}</span><span className="pct">{t[2]}%</span></div>)}</div></div>
        <div className="card card-pad"><div className="card-h"><span className="ico-c"><Icon name="wallet" /></span><h3>Resumo financeiro</h3></div>
          <div className="fin-row"><Icon name="wallet" /><span>Faturamento total</span><b className="num">R$ 32.584,90</b><Delta d="15%" /></div>
          <div className="fin-row"><Icon name="circle-dollar-sign" /><span>Custos totais</span><b className="num">R$ 17.320,45</b><Delta d="-8%" /></div>
          <div className="fin-row"><Icon name="receipt" /><span>Taxas (app e meios de pagamento)</span><b className="num">R$ 1.000,00</b><Delta d="-5%" /></div>
          <div className="fin-row fin-total"><Icon name="wallet" /><span>Lucro líquido</span><b className="num" style={{ fontSize: 19 }}>R$ 15.264,45</b><Delta d="22%" /></div></div>
      </div>
      <div className="lucro-grid">
        <div className="card card-pad"><div className="card-h"><span className="ico-c"><Icon name="bar-chart-3" /></span><h3>Desempenho por período</h3></div>
          <div className="periods">{[['Hoje', 'R$ 2.458,30', '12%'], ['Ontem', 'R$ 4.320,75', '18%'], ['Esta semana', 'R$ 18.742,60', '16%'], ['Este mês', 'R$ 62.380,90', '24%']].map((p) => <div key={p[0]} className="period"><small>{p[0]}</small><b className="num">{p[1]}</b><Delta d={p[2]} /></div>)}</div></div>
        <div className="card card-pad" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#f6f9fd' }}><span className="ico-c" style={{ background: '#e3ebf7', color: 'var(--ink)' }}><Icon name="lightbulb" /></span><div><b style={{ color: 'var(--ink)', fontSize: 15 }}>Dica</b><p style={{ margin: '6px 0 0', color: 'var(--sub)' }}>Fique de olho nos seus produtos mais lucrativos e aproveite para criar combos e promoções!</p></div></div>
      </div>
    </>
  );
}
