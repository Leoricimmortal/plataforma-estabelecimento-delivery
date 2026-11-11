import { useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, CheckAll, Thumb, TextArea, UploadZone, Switch, ArmedButton, exigir } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';
import { brl, parseBR, toBR, uid } from '../lib/format';

const VAZIO = { nome: '', desc: '', tipo: 'Grátis', preco: '', ativo: true, img: null };

export default function Complementos() {
  const comps = useApp((s) => s.comps), open = useApp((s) => s.ui.panels.complementos);
  const [f, setF] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const setPanel = (on) => { mut((s) => { s.ui.panels.complementos = on; }); if (!on) { setF(VAZIO); setEditId(null); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const editar = (c) => {
    setEditId(c.id);
    setF({ nome: c.nome, desc: c.desc, tipo: c.tipo, preco: c.preco ? toBR(c.preco) : '', ativo: c.status !== 'Inativo', img: c.img ? { url: c.img, name: 'Imagem atual', info: 'Ajustada para 800 × 800 px' } : null });
    mut((s) => { s.ui.panels.complementos = true; });
  };

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[f.nome, 'kNome'], [f.desc, 'kDesc']])) return;
    if (f.tipo === 'Pago' && !parseBR(f.preco)) { document.getElementById('kPreco').focus(); toast('Informe o preço do complemento'); return; }
    const data = { nome: f.nome.trim(), desc: f.desc.trim(), tipo: f.tipo, preco: f.tipo === 'Pago' ? parseBR(f.preco) : 0, img: f.img?.url || null, status: f.ativo ? 'Ativo' : 'Inativo' };
    mut((s) => {
      const c = s.comps.find((x) => x.id === editId);
      if (c) Object.assign(c, data); else s.comps.unshift({ id: uid('c'), thumb: '🥫', ...data });
    });
    toast(editId ? 'Complemento atualizado' : 'Complemento salvo'); setF(VAZIO); setEditId(null);
  };

  return (
    <>
      <div className="crumb" style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--sub)', fontSize: 13 }}><Icon name="package" /><a href="#produtos" style={{ color: 'var(--sub)' }}>Produtos</a><Icon name="chevron-right" />Hambúrgueres<Icon name="chevron-right" /><span style={{ color: 'var(--blue)' }}>Complementos</span></div>
      <PageHead icon="plus-square" title="Complementos" sub="Gerencie os adicionais disponíveis para seus produtos."
        actions={open ? null : <button className="btn btn-primary" onClick={() => setPanel(true)}><Icon name="plus" /> Novo Complemento</button>} />
      <div className={`with-panel ${open ? '' : 'closed'}`}>
        <div className="card card-pad tbl-wrap"><table className="tbl"><thead><tr><th><CheckAll /></th><th>Complemento</th><th>Tipo</th><th>Preço</th><th>Status</th><th>Ações</th></tr></thead><tbody>
          {comps.map((c) => (
            <tr key={c.id}><td><input type="checkbox" aria-label={`Selecionar ${c.nome}`} /></td>
              <td><div className="cell-user"><Thumb item={c} style={{ width: 58, height: 58, fontSize: 30 }} /><div><div className="t-title">{c.nome}</div><div className="t-sub">{c.desc}</div></div></div></td>
              <td><span className={`pill ${c.tipo === 'Grátis' ? 'p-green' : 'p-orange'}`}>{c.tipo}</span></td><td className="num">{brl(c.preco)}</td>
              <td><button className={`pill ${c.status === 'Inativo' ? 'p-gray' : 'p-green'} pill-btn`} title={`Clique para ${c.status === 'Inativo' ? 'ativar' : 'pausar'}`}
                onClick={() => { mut((s) => { const x = s.comps.find((k) => k.id === c.id); x.status = x.status === 'Inativo' ? 'Ativo' : 'Inativo'; }); toast(`${c.nome}: ${c.status === 'Inativo' ? 'ativo' : 'pausado'}`); }}>{c.status || 'Ativo'}</button></td>
              <td><div className="acts"><button className="icon-btn" aria-label={`Editar ${c.nome}`} onClick={() => editar(c)}><Icon name="pencil" /></button>
                <ArmedButton label={`Excluir ${c.nome}`} onConfirm={() => { mut((s) => { s.comps = s.comps.filter((x) => x.id !== c.id); }); toast(`${c.nome} excluído`); }} /></div></td></tr>
          ))}
        </tbody></table></div>
        {open && (
          <form className="card panel" id="compForm" noValidate onSubmit={salvar}>
            <div className="panel-h"><span className="ico-c"><Icon name={editId ? 'pencil' : 'plus'} /></span><h2>{editId ? 'Editar Complemento' : 'Novo Complemento'}</h2><button type="button" className="icon-btn x" onClick={() => setPanel(false)} aria-label="Fechar"><Icon name="x" /></button></div>
            <div className="form-stack">
              <div className="field"><label htmlFor="kNome">Nome do complemento <span className="req">*</span></label><div className="inp"><input id="kNome" value={f.nome} onChange={set('nome')} placeholder="Ex: Maionese picante" required /></div></div>
              <div className="field"><label htmlFor="kDesc">Descrição <span className="req">*</span></label><TextArea id="kDesc" max={200} value={f.desc} onChange={(v) => setF({ ...f, desc: v })} placeholder="Ex: Molho cremoso com um toque de pimenta especial..." /></div>
              <div className="field"><span className="lab">Tipo de complemento <span className="req">*</span></span>
                <label className="radio green"><input type="radio" name="kTipo" value="Grátis" checked={f.tipo === 'Grátis'} onChange={() => setF({ ...f, tipo: 'Grátis', preco: '' })} /><div><b>Grátis</b><small>Não adiciona valor ao produto.</small></div></label>
                <label className="radio green"><input type="radio" name="kTipo" value="Pago" checked={f.tipo === 'Pago'} onChange={() => { setF({ ...f, tipo: 'Pago' }); setTimeout(() => document.getElementById('kPreco')?.focus(), 0); }} /><div><b>Pago</b><small>Adiciona um valor extra ao produto.</small></div></label></div>
              <div className="field"><label htmlFor="kPreco">Preço <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="kPreco" value={f.preco} onChange={set('preco')} inputMode="decimal" placeholder="0,00" disabled={f.tipo === 'Grátis'} /></div></div>
              <div className="field"><span className="lab">Status</span>
                <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: f.ativo ? 'var(--green)' : 'var(--sub)', fontWeight: 600, fontStyle: 'italic' }}><Switch variant="green" style={{ margin: 0 }} checked={f.ativo} onChange={(v) => setF({ ...f, ativo: v })} label="Ativo" />{f.ativo ? 'Ativo' : 'Inativo'}</label>
                <span className="hint">{f.ativo ? 'O complemento ficará disponível para os clientes.' : 'O complemento fica oculto para os clientes.'}</span></div>
              <div className="field"><span className="lab">Imagem do complemento</span><UploadZone value={f.img} onChange={(img) => setF({ ...f, img })} /></div>
            </div>
            <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={() => setPanel(false)}>Cancelar</button><button className="btn btn-primary">{editId ? 'Salvar alterações' : 'Salvar Complemento'}</button></div>
          </form>
        )}
      </div>
    </>
  );
}
