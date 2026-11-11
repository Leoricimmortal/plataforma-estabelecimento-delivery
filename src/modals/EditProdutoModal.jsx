// Editar produto do catálogo (nome, descrição, preço, categoria e imagem).
import { useState } from 'react';
import { ModalHead, UploadZone, exigir } from '../components/ui';
import { useApp, mut, toast, closeModal } from '../store/useApp';
import { parseBR, toBR } from '../lib/format';

export default function EditProdutoModal({ cat, id }) {
  const categories = useApp((s) => s.categories);
  const p = categories.find((c) => c.n === cat)?.items.find((x) => x.id === id);
  const [f, setF] = useState({ nome: p?.nome || '', desc: p?.desc || '', preco: p ? toBR(p.preco) : '', cat });
  const [img, setImg] = useState(p?.img ? { url: p.img, name: 'Imagem atual', info: 'Ajustada para 800 × 800 px' } : null);
  if (!p) return <div className="modal"><p>Produto não encontrado.</p></div>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[f.nome, 'epNome'], [f.preco, 'epVal']])) return;
    const v = parseBR(f.preco); if (!v) { document.getElementById('epVal').focus(); toast('Informe um preço válido'); return; }
    mut((s) => {
      const from = s.categories.find((c) => c.n === cat), i = from.items.findIndex((x) => x.id === id), it = from.items[i];
      Object.assign(it, { nome: f.nome.trim(), desc: f.desc.trim(), preco: v, img: img?.url || null });
      if (f.cat !== cat) { from.items.splice(i, 1); s.categories.find((c) => c.n === f.cat).items.push(it); }
    });
    toast(f.cat !== cat ? `${f.nome.trim()} movido para ${f.cat}` : 'Produto atualizado');
    closeModal();
  };

  return (
    <form className="modal wide" id="editProdForm" noValidate onSubmit={salvar}>
      <ModalHead icon="pencil" title="Editar produto" />
      <div className="form-stack" style={{ marginTop: 12 }}>
        <div className="row2">
          <div className="field"><label htmlFor="epNome">Nome <span className="req">*</span></label><div className="inp"><input id="epNome" value={f.nome} onChange={set('nome')} required /></div></div>
          <div className="field"><label htmlFor="epCat">Categoria</label><select className="sel" id="epCat" value={f.cat} onChange={set('cat')}>{categories.map((x) => <option key={x.n}>{x.n}</option>)}</select></div>
        </div>
        <div className="field"><label htmlFor="epDesc">Descrição</label><textarea className="ta" id="epDesc" maxLength={500} value={f.desc} onChange={set('desc')} /></div>
        <div className="field" style={{ maxWidth: 220 }}><label htmlFor="epVal">Preço <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="epVal" value={f.preco} onChange={set('preco')} inputMode="decimal" /></div></div>
        <div className="field"><span className="lab">Imagem do produto</span><UploadZone value={img} onChange={setImg} /></div>
      </div>
      <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary">Salvar alterações</button></div>
    </form>
  );
}
