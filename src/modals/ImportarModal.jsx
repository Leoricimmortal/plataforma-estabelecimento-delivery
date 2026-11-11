// Prévia da planilha de clientes antes de importar.
import Icon from '../components/Icon';
import { ModalHead, Info } from '../components/ui';
import { mut, toast, closeModal } from '../store/useApp';
import { isoToBR, uid, plural } from '../lib/format';

export default function ImportarModal({ r }) {
  const erros = [...r.bad, ...r.dup];
  const importar = () => {
    const n = r.ok.length, now = Date.now();
    mut((s) => { r.ok.forEach((c) => s.clientes.push({ ...c, id: uid('c'), cad: now, ult: null })); });
    closeModal(); toast(`${plural(n, 'cliente importado', 'clientes importados')}`);
  };
  return (
    <div className="modal wide">
      <ModalHead icon="file-spreadsheet" title="Importar planilha" />
      <p className="lead">{r.file}</p>
      <div className="imp-stats">
        <div><b className="num">{r.ok.length}</b><small>prontos para importar</small></div>
        <div><b className="num">{r.dup.length}</b><small>telefone já cadastrado</small></div>
        <div><b className="num">{r.bad.length}</b><small>com erro</small></div>
      </div>
      {r.ok.length > 0 && (
        <div className="tbl-wrap" style={{ marginTop: 14, maxHeight: 220, overflow: 'auto' }}>
          <table className="tbl"><thead><tr><th>Nome</th><th>Telefone</th><th>Setor</th><th>Cidade</th><th>Aniversário</th></tr></thead>
            <tbody>{r.ok.slice(0, 50).map((c, i) => <tr key={i}><td>{c.nome}</td><td>{c.tel}</td><td className="muted">{c.setor || '—'}</td><td className="muted">{c.cidade || '—'}</td><td className="muted">{c.nasc ? isoToBR(c.nasc) : '—'}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {erros.length > 0 && (
        <div className="info" style={{ marginTop: 14, flexDirection: 'column', gap: 4, background: 'var(--orange-soft)', borderColor: 'var(--orange-line)', color: '#9a4a12' }}>
          {erros.slice(0, 6).map((b, i) => <span key={i}>Linha {b.linha}: {b.msg}</span>)}
          {erros.length > 6 && <span>e mais {erros.length - 6} linha(s).</span>}
        </div>
      )}
      <div className="panel-foot">
        <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
        <button type="button" className="btn btn-primary" disabled={!r.ok.length} onClick={importar}><Icon name="upload" /> Importar {r.ok.length} cliente{r.ok.length === 1 ? '' : 's'}</button>
      </div>
    </div>
  );
}
