import Icon from '../components/Icon';
import { PageHead, Info, Thumb, ArmedButton } from '../components/ui';
import { useApp, mut, openModal, toast } from '../store/useApp';
import { navigate } from '../store/actions';
import { useRowDrag } from '../hooks/useRowDrag';
import { moveIn } from '../domain/catalogo';
import { OrdemCell, StatusBtn, alternarKit, excluirKit } from './Produtos';
import { brl } from '../lib/format';

export default function Kits() {
  const kits = useApp((s) => s.kits), org = useApp((s) => s.ui.kitOrganize);
  const mover = (from, to) => mut((s) => { moveIn(s.kits, from, to); });
  const rowProps = useRowDrag(org, mover);
  const verNoCatalogo = (cat) => { mut((s) => { s.ui.catSel = cat; s.ui.catCollapsed = false; }); navigate('produtos'); };

  return (
    <>
      <PageHead icon="package" variant="outline" title="Cardápio de Kits" sub="Crie e gerencie kits de produtos. Cada kit também aparece no catálogo, dentro da categoria escolhida."
        actions={<>
          {kits.length > 1 && <button className={`btn ${org ? 'btn-outline-or' : 'btn-outline'}`} onClick={() => { mut((s) => { s.ui.kitOrganize = !org; }); if (org) toast('Ordem dos kits salva'); }}><Icon name={org ? 'check' : 'arrow-up-down'} /> {org ? 'Concluir ordem' : 'Organizar Ordem'}</button>}
          <button className="btn btn-primary" onClick={() => openModal('kit', { id: null })}><Icon name="plus" /> Novo Kit</button>
        </>} />
      <div className="card card-pad">
        {org && <Info style={{ margin: '0 0 12px' }}>Arraste os kits pela alça à esquerda, ou use as setas, para definir a ordem em que aparecem no Cardápio de Kits. A posição dentro de cada categoria do catálogo é ajustada em Produtos e Catálogo.</Info>}
        {kits.length ? (
          <div className="tbl-wrap"><table className={`tbl prod-tbl ${org ? 'organizing' : ''}`}><thead><tr><th style={{ width: 28 }} /><th>Nome do Kit</th><th>Itens</th><th>Preço</th><th>Status</th><th>Ordem</th><th>Ações</th></tr></thead>
            <tbody id="kitBody">
              {kits.map((k, i) => (
                <tr key={k.id} {...rowProps(i)}>
                  <td className="handle"><Icon name="menu" /></td>
                  <td><div className="cell-user"><Thumb item={k} /><div><div className="t-title">{k.nome}</div><div className="t-sub">{k.cat}</div></div></div></td>
                  <td className="muted" style={{ whiteSpace: 'normal', maxWidth: 320 }}>{k.itens.map((x) => `${x[1]}x ${x[0]}`).join(', ')}</td>
                  <td className="num">{brl(k.preco)}</td>
                  <td><StatusBtn status={k.status} onClick={() => alternarKit(k.id)} /></td>
                  <td className="muted ordem"><OrdemCell on={org} pos={i} last={kits.length - 1} onMove={mover} /></td>
                  <td><div className="acts">
                    <button className="icon-btn" onClick={() => verNoCatalogo(k.cat)} aria-label="Ver no catálogo"><Icon name="eye" /></button>
                    <button className="icon-btn" onClick={() => openModal('kit', { id: k.id })} aria-label={`Editar ${k.nome}`}><Icon name="pencil" /></button>
                    <ArmedButton label={`Excluir ${k.nome}`} onConfirm={() => excluirKit(k.id)} />
                  </div></td>
                </tr>
              ))}
            </tbody></table></div>
        ) : <div className="empty"><h3>Nenhum kit cadastrado</h3><p>Use o botão Novo Kit para montar o primeiro combo.</p></div>}
      </div>
    </>
  );
}
