// Nova categoria do catálogo.
import { useState } from 'react';
import Icon from '../components/Icon';
import { ModalHead, TextArea, exigir } from '../components/ui';
import { mut, getState, toast, closeModal } from '../store/useApp';
import { CAT_ICONS } from '../domain/catalogo';

const CORES = ['#ff6a13', '#ef3b3b', '#e83fb5', '#5b5ef0', '#1a8de0', '#20b15a', '#8c9bb0'];

export default function CategoriaModal() {
  const [nome, setNome] = useState(''), [desc, setDesc] = useState('');
  const [icone, setIcone] = useState(CAT_ICONS[0][0]), [cor, setCor] = useState(CORES[0]);

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[nome, 'catNome']])) return;
    const n = nome.trim();
    if (getState().categories.some((c) => c.n.toLowerCase() === n.toLowerCase())) { document.getElementById('catNome').focus(); toast('Já existe uma categoria com esse nome'); return; }
    mut((s) => { s.categories.push({ n, i: icone, cor, desc: desc.trim(), items: [], seq: [] }); s.ui.catSel = n; s.ui.catCollapsed = false; });
    closeModal(); toast(`Categoria ${n} criada`);
  };

  return (
    <form className="modal wide" id="catForm" noValidate onSubmit={salvar}>
      <ModalHead icon="package" title="Nova Categoria" />
      <p className="lead">Crie uma nova categoria para organizar seus produtos.</p>
      <div className="form-stack">
        <div className="field"><label htmlFor="catNome">Nome da categoria <span className="req">*</span></label><div className="inp"><input id="catNome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Hambúrgueres, Porções, Bebidas..." required /></div></div>
        <div className="field"><label htmlFor="catDesc">Descrição <span className="opt">(opcional)</span></label><TextArea id="catDesc" max={200} value={desc} onChange={setDesc} placeholder="Digite uma breve descrição da categoria..." /></div>
        <div className="field"><span className="lab">Ícone da categoria <span className="req">*</span></span>
          <div className="icon-grid">{CAT_ICONS.map(([i, l]) => <button key={i} type="button" className={`icon-opt ${icone === i ? 'on' : ''}`} onClick={() => setIcone(i)}><Icon name={i} />{l}</button>)}</div></div>
        <div className="field"><span className="lab">Cor de destaque <span className="opt">(opcional)</span></span>
          <div className="swatches">{CORES.map((c, i) => <button key={c} type="button" className={`swatch ${cor === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setCor(c)} aria-label={`Cor ${i + 1}`}>{cor === c && <Icon name="check" />}</button>)}</div></div>
      </div>
      <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary">Salvar Categoria</button></div>
    </form>
  );
}
