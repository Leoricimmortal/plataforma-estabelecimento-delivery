import Icon from '../components/Icon';
import { PageHead, Info } from '../components/ui';
import { Seal, GiftGlyph, MedalGlyph, GiftArt } from '../components/art';
import { useApp, mut, openModal } from '../store/useApp';

export const premioTxt = (F) => ({ brinde: 'um brinde especial', cupom: `${F.cupom}% de desconto`, desconto: `R$ ${F.desc} no próximo pedido`, outro: F.outro || 'um prêmio especial' }[F.premio]);
const HIST = []; // histórico de recompensas: vazio até o primeiro prêmio ser entregue

export default function Fidelidade() {
  const F = useApp((s) => s.fid), clientes = useApp((s) => s.fidClients);
  const sel = F.sel < clientes.length ? F.sel : 0;
  const cli = clientes[sel] || ['Nenhum cliente participando ainda', 0, '—'];
  const done = Math.min(cli[1], F.n), falta = F.n - done;
  const escolher = (i) => mut((s) => { s.fid.sel = i; });

  return (
    <>
      <PageHead icon="star" title="Fidelidade" sub="Premie seus clientes e aumente a recorrência de pedidos."
        actions={<button className="btn btn-outline" onClick={() => openModal('fidConfig')}><Icon name="settings" /> Configurações do Programa</button>} />
      {!F.on && <Info icon="alert-triangle" style={{ background: 'var(--orange-soft)', borderColor: 'var(--orange-line)', color: '#b14708' }}>O programa está pausado. Os clientes não acumulam selos até você reativá-lo nas configurações.</Info>}
      <div className="fid-top">
        <div className="fid-banner">
          <div className="fid-medal"><Seal content={<MedalGlyph />} on size={120} /></div>
          <div className="fid-copy"><h2>Compre {F.n} vezes e ganhe <span>{premioTxt(F)}!</span></h2><p>Quanto mais pede, mais vantagens!</p></div>
          <div className="fid-gift"><GiftArt /></div>
        </div>
        <div className="card card-pad fid-how">
          <div className="card-h"><span className="ico-c"><Icon name="help-circle" /></span><h3 style={{ fontSize: 18 }}>Como funciona?</h3></div>
          <ol className="steps">
            <li><span>1</span>{F.cond === 'valor' ? `A cada R$ ${F.valor} em compras, o cliente ganha 1 selo.` : F.cond === 'tipo' ? 'A cada pedido do tipo escolhido, o cliente ganha 1 selo.' : 'A cada compra no restaurante, o cliente ganha 1 selo.'}</li>
            <li><span>2</span>Após {F.n} selos, ele ganha {premioTxt(F)}.</li>
            <li><span>3</span>O selo é vinculado ao cliente e pode ser acompanhado pelo app.</li>
          </ol>
          <Info>Você pode personalizar o prêmio e o período da campanha nas configurações.</Info>
        </div>
      </div>
      <div className="card card-pad fid-prog">
        <div><h3 className="fid-h">Seu programa de fidelidade</h3>
          <div className="seals">{Array.from({ length: F.n }, (_, i) => (i === F.n - 1 ? <Seal key={i} content={<GiftGlyph />} on size={72} /> : <Seal key={i} content={i + 1} on={i < done} size={72} />))}</div></div>
        <div className="fid-cli"><h4>Progresso do cliente <small>· {cli[0]}</small></h4><div className="big"><b>{done}</b> de {F.n} compras</div><div className="bar lg"><i style={{ width: `${(done / F.n) * 100}%` }} /></div>
          <div className="fid-note"><Icon name="trophy" /><span>{falta <= 0 ? 'Prêmio liberado! Entregue no próximo pedido.' : `Falta${falta > 1 ? 'm' : ''} apenas ${falta} compra${falta > 1 ? 's' : ''} para ganhar o prêmio!`}</span></div>
          <p className="hint" style={{ margin: '10px 0 0' }}>Clique em um cliente da tabela abaixo para ver o progresso dele.</p></div>
      </div>
      <div className="grid-dash" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,520px),1fr))' }}>
        <div className="card card-pad">
          <div className="card-h"><Icon name="users" className="ico-or" /><h3 style={{ fontSize: 18 }}>Clientes participantes</h3><a className="link" href="#clientes">Ver todos</a></div>
          <div className="tbl-wrap"><table className="tbl" style={{ fontSize: 14 }}><thead><tr><th>Cliente</th><th>Compras</th><th>Prêmio</th><th>Última compra</th></tr></thead><tbody>
            {!clientes.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Nenhum cliente participando ainda.</td></tr>}
            {clientes.map((c, i) => {
              const d = Math.min(c[1], F.n);
              return (
                <tr key={c[0]} className={`clickable ${i === sel ? 'sel' : ''}`} tabIndex={0} onClick={() => escolher(i)} onKeyDown={(e) => e.key === 'Enter' && escolher(i)}>
                  <td><div className="cell-user"><span className="av-sm"><Icon name="user" /></span>{c[0]}</div></td>
                  <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="num">{d} / {F.n}</span><div className="bar" style={{ width: 140 }}><i style={{ width: `${(d / F.n) * 100}%` }} /></div></div></td>
                  <td>{d >= F.n ? <span className="pill p-green"><Icon name="gift" /> Prêmio liberado</span> : d === F.n - 1 ? 'Aguardando 1 compra' : 'Em andamento'}</td>
                  <td className="num">{c[2]}</td>
                </tr>
              );
            })}
          </tbody></table></div>
        </div>
        <div className="card card-pad">
          <div className="card-h"><Icon name="gift" className="ico-or" /><h3 style={{ fontSize: 18 }}>Histórico de recompensas</h3></div>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Cliente</th><th>Tipo de recompensa</th><th>Data</th></tr></thead><tbody>
            {!HIST.length && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Nenhuma recompensa entregue ainda.</td></tr>}
            {HIST.map((r) => <tr key={r[0] + r[3]}><td><div className="cell-user"><span className="av-sm"><Icon name="user" /></span>{r[0]}</div></td><td><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontWeight: 600 }}><Icon name={r[1]} className="ico-or" />{r[2]}</span></td><td className="num">{r[3]}</td></tr>)}
          </tbody></table></div>
        </div>
      </div>
    </>
  );
}
