import Icon from '../components/Icon';
import { PageHead, Info, CheckAll, Thumb, Pill, ArmedButton } from '../components/ui';
import { useApp, mut, openModal, toast } from '../store/useApp';
import { useRowDrag } from '../hooks/useRowDrag';
import { catList, catCount, moverNaCategoria } from '../domain/catalogo';
import { brl, plural } from '../lib/format';

/** Coluna "Ordem": setas quando está organizando, senão só a posição. */
export function OrdemCell({ on, pos, last, onMove }) {
  if (!on) return <><Icon name="more-vertical" /> {pos + 1}</>;
  return (
    <div className="ord-btns">
      <button className="icon-btn" disabled={pos === 0} onClick={() => onMove(pos, pos - 1)} aria-label="Subir"><Icon name="chevron-up" /></button>
      <span className="num">{pos + 1}</span>
      <button className="icon-btn" disabled={pos === last} onClick={() => onMove(pos, pos + 1)} aria-label="Descer"><Icon name="chevron-down" /></button>
    </div>
  );
}

export const StatusBtn = ({ status, onClick }) => (
  <button className={`pill ${status === 'Inativo' ? 'p-gray' : 'p-green'} pill-btn`} onClick={onClick} title={`Clique para ${status === 'Inativo' ? 'ativar' : 'pausar'}`}>{status || 'Ativo'}</button>
);

export function alternarKit(id) {
  let k;
  mut((s) => { k = s.kits.find((x) => x.id === id); k.status = k.status === 'Inativo' ? 'Ativo' : 'Inativo'; k = { ...k }; });
  toast(`Kit ${k.nome}: ${k.status === 'Inativo' ? 'pausado no cardápio' : 'ativo no cardápio'}`);
}
export function excluirKit(id) {
  let nome;
  mut((s) => { nome = s.kits.find((x) => x.id === id)?.nome; s.kits = s.kits.filter((x) => x.id !== id); });
  toast(`Kit ${nome} excluído`);
}

export default function Produtos() {
  const categories = useApp((s) => s.categories), kits = useApp((s) => s.kits), ui = useApp((s) => s.ui);
  const c = categories.find((x) => x.n === ui.catSel) || categories[0];
  const cats = categories.filter((x) => !ui.catQ || x.n.toLowerCase().includes(ui.catQ.toLowerCase()));
  const total = c ? catCount(c, kits) : 0;
  const rows = c ? catList(c, kits) : [];
  const mover = (from, to) => mut((s) => { moverNaCategoria(s, c.n, from, to); });
  const rowProps = useRowDrag(ui.organize, mover);
  const setUi = (patch) => mut((s) => { Object.assign(s.ui, patch); });

  const alternarProd = (id) => {
    let p;
    mut((s) => { p = s.categories.find((x) => x.n === c.n).items.find((x) => x.id === id); p.status = p.status === 'Inativo' ? 'Ativo' : 'Inativo'; p = { ...p }; });
    toast(`${p.nome}: ${p.status === 'Inativo' ? 'pausado no cardápio' : 'ativo no cardápio'}`);
  };
  const excluirProd = (id, nome) => { mut((s) => { const k = s.categories.find((x) => x.n === c.n); k.items = k.items.filter((x) => x.id !== id); }); toast(`${nome} excluído`); };

  return (
    <>
      <PageHead icon="package" variant="outline" title="Produtos e Catálogo" sub="Gerencie seus produtos, categorias e mantenha seu cardápio sempre atualizado."
        actions={<>
          <button className={`btn ${ui.organize ? 'btn-outline-or' : 'btn-outline'}`} onClick={() => { setUi({ organize: !ui.organize }); if (ui.organize) toast('Ordem do cardápio salva'); }}><Icon name={ui.organize ? 'check' : 'arrow-up-down'} /> {ui.organize ? 'Concluir ordem' : 'Organizar Ordem'}</button>
          <button className="btn btn-primary" onClick={() => openModal('categoria')}><Icon name="plus" /> Nova Categoria</button>
          <button className="btn btn-primary" onClick={() => openModal('addProduto')}><Icon name="plus" /> Novo Produto</button>
        </>} />
      <div className="cat-layout">
        <div className="card cat-list">
          <label className="inp" style={{ marginBottom: 8 }}><Icon name="search" /><input id="catQ" value={ui.catQ} onChange={(e) => setUi({ catQ: e.target.value })} placeholder="Buscar categoria..." aria-label="Buscar categoria" /></label>
          {cats.length ? cats.map((x) => <button key={x.n} className={`cat-btn ${c?.n === x.n ? 'on' : ''}`} onClick={() => setUi({ catSel: x.n, catCollapsed: false })}><Icon name={x.i} /><span>{x.n}</span><span>{catCount(x, kits)}</span></button>)
            : <p className="hint" style={{ padding: '8px 12px' }}>Nenhuma categoria com esse nome.</p>}
        </div>
        <div className="card cat-panel">
          {!c ? <div className="empty"><h3>Nenhuma categoria</h3><p>Crie uma categoria pelo botão Nova Categoria.</p></div> : <>
            <button className="cat-head" onClick={() => setUi({ catCollapsed: !ui.catCollapsed })} aria-expanded={!ui.catCollapsed}>
              <span className="ico-c" style={{ width: 34, height: 34 }}><Icon name={c.i} /></span><b>{c.n}</b><span className="pill p-gray">{plural(total, 'produto', 'produtos')}</span>
              <Icon name={ui.catCollapsed ? 'chevron-down' : 'chevron-up'} className="chev" />
            </button>
            {ui.catCollapsed ? null : total ? <>
              {ui.organize && <Info style={{ margin: '0 0 12px' }}>Arraste as linhas pela alça à esquerda, ou use as setas na coluna Ordem, para mudar a posição de produtos e kits no cardápio. Clique em <b>Concluir ordem</b> quando terminar.</Info>}
              <div className="tbl-wrap"><table className={`tbl prod-tbl ${ui.organize ? 'organizing' : ''}`}><thead><tr><th style={{ width: 28 }} /><th style={{ width: 28 }}><CheckAll /></th><th>Produto</th><th>Preço</th><th>Status</th><th>Ordem</th><th>Ações</th></tr></thead>
                <tbody id="prodBody">
                  {rows.map(({ tipo, item: r }, pos) => (
                    <tr key={r.id} {...rowProps(pos)}>
                      <td className="handle"><Icon name="menu" /></td>
                      <td><input type="checkbox" aria-label={`Selecionar ${r.nome}`} /></td>
                      <td><div className="cell-user"><Thumb item={r} /><div className="p-txt">
                        <div className="t-title">{r.nome} {tipo === 'kit' && <Pill tone="p-orange" style={{ fontSize: 10.5, padding: '2px 8px' }}>Kit</Pill>}</div>
                        <div className="t-sub">{tipo === 'kit' ? r.itens.map((x) => `${x[1]}x ${x[0]}`).join(', ') : r.desc}</div>
                      </div></div></td>
                      <td className="num">{brl(r.preco)}</td>
                      <td><StatusBtn status={r.status} onClick={() => (tipo === 'kit' ? alternarKit(r.id) : alternarProd(r.id))} /></td>
                      <td className="muted ordem"><OrdemCell on={ui.organize} pos={pos} last={rows.length - 1} onMove={mover} /></td>
                      <td><div className="acts">
                        <button className="icon-btn" onClick={() => (tipo === 'kit' ? openModal('kit', { id: r.id }) : openModal('editProd', { cat: c.n, id: r.id }))} aria-label={`Editar ${tipo === 'kit' ? 'kit ' : ''}${r.nome}`}><Icon name="pencil" /></button>
                        <ArmedButton label={`Excluir ${tipo === 'kit' ? 'kit ' : ''}${r.nome}`} onConfirm={() => (tipo === 'kit' ? excluirKit(r.id) : excluirProd(r.id, r.nome))} />
                      </div></td>
                    </tr>
                  ))}
                </tbody></table></div>
            </> : (
              <div className="empty" style={{ padding: '48px 20px' }}><span className="ico-c lg" style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}><Icon name={c.i} /></span><h3>Nenhum produto em {c.n}</h3><p>Use o botão <b>Novo Produto</b> no topo da página para cadastrar o primeiro item desta categoria.</p></div>
            )}
          </>}
        </div>
      </div>
    </>
  );
}
