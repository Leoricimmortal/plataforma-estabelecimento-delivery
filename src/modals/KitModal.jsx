// Novo kit ou edição de kit (produtos, imagem, preço e categoria no catálogo).
import { useMemo, useState } from 'react';
import ProdPicker, { pickedList } from '../components/ProdPicker';
import { ModalHead, TextArea, UploadZone, exigir } from '../components/ui';
import { useApp, mut, toast, closeModal } from '../store/useApp';
import { allProducts } from '../domain/catalogo';
import { brl, parseBR, toBR, uid, plural } from '../lib/format';

export default function KitModal({ id }) {
  const K = useApp((s) => s.kits.find((k) => k.id === id));
  const categories = useApp((s) => s.categories);
  const catSel = useApp((s) => s.ui.catSel);
  const items = useMemo(() => allProducts({ categories }).map((p) => ({ ...p, sub: p.desc, key: p.id })), [categories]);

  const [nome, setNome] = useState(K?.nome || '');
  const [cat, setCat] = useState(K?.cat || catSel || '');
  const [desc, setDesc] = useState(K?.desc || '');
  const [img, setImg] = useState(K?.img ? { url: K.img, name: 'Imagem atual', info: 'Ajustada para 800 × 800 px' } : null);
  const [pick, setPick] = useState(() => Object.fromEntries((K?.itens || []).map(([n, q]) => [n, { on: true, q }])));
  const [preco, setPreco] = useState(K ? toBR(K.preco) : '');
  const [estoque, setEstoque] = useState('');

  const sel = pickedList(pick, items), soma = sel.reduce((a, x) => a + x[1] * x[2], 0);

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[nome, 'kitNome'], [cat, 'kitCat'], [preco, 'kitPreco']])) return;
    if (!sel.length) { toast('Selecione ao menos um produto para o kit'); return; }
    const v = parseBR(preco); if (!v) { document.getElementById('kitPreco').focus(); toast('Informe um preço válido, ex: 59,90'); return; }
    const data = { nome: nome.trim(), cat, preco: v, desc: desc.trim(), itens: sel.map((x) => [x[0], x[1]]), img: img?.url || null };
    mut((s) => {
      const k = s.kits.find((x) => x.id === id);
      if (k) Object.assign(k, data); else s.kits.push({ id: uid('k'), thumb: '🍱', status: 'Ativo', ...data });
    });
    closeModal();
    toast(K ? 'Kit atualizado' : `Kit salvo e adicionado ao catálogo em ${cat}`);
  };

  return (
    <form className="modal wide" id="kitForm" noValidate onSubmit={salvar}>
      <ModalHead icon="package" title={K ? 'Editar kit' : 'Novo Kit'} />
      <div className="form-stack" style={{ marginTop: 12 }}>
        <div className="row2">
          <div className="field"><label htmlFor="kitNome">Nome do kit <span className="req">*</span></label><div className="inp"><input id="kitNome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Combo Família" required /></div></div>
          <div className="field"><label htmlFor="kitCat">Categoria no catálogo <span className="req">*</span></label>
            <select className="sel" id="kitCat" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">Selecione uma categoria</option>{categories.map((c) => <option key={c.n}>{c.n}</option>)}</select></div>
        </div>
        <div className="field"><label htmlFor="kitDesc">Descrição do kit</label><TextArea id="kitDesc" max={500} value={desc} onChange={setDesc} placeholder="Ex: O combo perfeito para toda a família, com hambúrguer, batata e refrigerante." /></div>
        <div className="field"><span className="lab">Imagem do kit</span><UploadZone value={img} onChange={setImg} /></div>
        <div className="field"><span className="lab">Produtos que compõem o kit <span className="req">*</span></span>
          <ProdPicker id="kitList" items={items} value={pick} onChange={setPick} />
          <span className="hint" id="kitSum">{sel.length ? `${plural(sel.length, 'produto', 'produtos')} · soma avulsa ${brl(soma)}` : 'Nenhum produto selecionado'}</span></div>
        <div className="row2">
          <div className="field"><label htmlFor="kitPreco">Preço do kit <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="kitPreco" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="59,90" inputMode="decimal" required /></div></div>
          <div className="field"><label htmlFor="kitEst">Estoque</label><div className="inp"><input id="kitEst" type="number" min="0" value={estoque} onChange={(e) => setEstoque(e.target.value)} placeholder="Ex: 50" /></div></div>
        </div>
      </div>
      <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary">{K ? 'Salvar alterações' : 'Salvar Kit'}</button></div>
    </form>
  );
}
