// "Adicionar produto": escolha do tipo, produto simples (catálogo geral) ou completo em 3 etapas.
import { useState } from 'react';
import Icon from '../components/Icon';
import { ModalHead, TextArea, exigir } from '../components/ui';
import { useApp, mut, toast, closeModal } from '../store/useApp';
import { navigate } from '../store/actions';
import { CATALOGO_GERAL } from '../domain/catalogo';
import { readImage } from '../lib/images';
import { brl, parseBR, toBR, uid, plural } from '../lib/format';

const inicial = (cat) => ({ step: 'tipo', q: '', found: 0, price: '5,49', promo: false, promoVal: '', promoPct: '', cat: cat || 'Bebidas', nome: '', desc: '', val: '', pcat: cat || '', comps: [], cq: '', img: '', imgName: '' });

const WizSub = ({ icon, t, d }) => <div className="wiz-sub"><Icon name={icon} /><div><b>{t}</b>{d && <small>{d}</small>}</div></div>;
const Dots = ({ n }) => <div className="wiz-dots" aria-label={`Etapa ${n} de 3`}>{[1, 2, 3].map((i) => <i key={i} className={i <= n ? 'on' : ''} />)}</div>;

export default function ProdutoWizard() {
  const categories = useApp((s) => s.categories), comps = useApp((s) => s.comps), catSel = useApp((s) => s.ui.catSel);
  const [W, setW] = useState(() => inicial(catSel));
  const [salvo, setSalvo] = useState(null);
  const up = (patch) => setW((o) => ({ ...o, ...patch }));
  const ir = (step) => up({ step });
  const campo = (k) => ({ value: W[k], onChange: (e) => up({ [k]: e.target.value }) });

  const salvar = (item, catNome) => {
    if (!categories.find((c) => c.n === catNome)) { toast('Escolha uma categoria válida'); return; }
    mut((s) => { s.categories.find((c) => c.n === catNome).items.push({ id: uid('p'), status: 'Ativo', ...item }); s.ui.catSel = catNome; s.ui.catCollapsed = false; });
    setSalvo({ nome: item.nome, cat: catNome }); ir('ok');
  };
  const cats = categories.map((c) => <option key={c.n}>{c.n}</option>);

  if (W.step === 'tipo') return (
    <div className="modal wide">
      <ModalHead icon="package" title="Adicionar produto" />
      <p className="lead" style={{ fontWeight: 600, color: 'var(--ink)' }}>Qual tipo de produto você deseja cadastrar?</p>
      <div className="type-grid">
        <button type="button" className="type-card" onClick={() => ir('simples')}><Icon name="package" /><b>Produto simples</b><span>Produtos industrializados, como refrigerantes, água, chocolates e salgadinhos.</span></button>
        <button type="button" className="type-card" onClick={() => ir('c1')}><Icon name="chef-hat" /><b>Produto completo</b><span>Produtos feitos pela sua loja, como hambúrgueres, pizzas, pratos e lanches.</span></button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button></div>
    </div>
  );

  if (W.step === 'simples') {
    const q = W.q.toLowerCase();
    const res = CATALOGO_GERAL.filter((p) => !q || p.nome.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q));
    const found = res.includes(CATALOGO_GERAL[W.found]) ? W.found : res.length ? CATALOGO_GERAL.indexOf(res[0]) : -1;
    const f = CATALOGO_GERAL[found];
    const enviar = (e) => {
      e.preventDefault(); if (!f) return;
      if (!parseBR(W.price)) { document.getElementById('wPrice').focus(); toast('Informe o preço de venda'); return; }
      const promo = W.promo && parseBR(W.promoVal), preco = promo ? parseBR(W.promoVal) : parseBR(W.price);
      salvar({ nome: f.nome, desc: f.marca + (promo ? ` · promoção de ${brl(parseBR(W.price))} por ${brl(preco)}` : ''), preco, thumb: f.thumb }, W.cat);
    };
    return (
      <form className="modal wide" id="wizSimples" noValidate onSubmit={enviar}>
        <ModalHead icon="package" title="Adicionar produto" onBack={() => ir('tipo')} />
        <WizSub icon="package" t="Produto simples" d="Cadastre rapidamente um item pronto ou industrializado, como refrigerante, água, chocolate ou salgadinho." />
        <div className="form-stack">
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="inp grow"><Icon name="search" /><input id="wQ" {...campo('q')} placeholder="Buscar produto (ex: Coca-Cola, água, chocolate...)" aria-label="Buscar no catálogo" autoFocus /></label>
            <button type="button" className="btn btn-outline" style={{ padding: '0 12px' }} onClick={() => toast('Aponte o leitor de código de barras para o campo de busca')} aria-label="Ler código de barras"><Icon name="scan-barcode" /></button>
          </div>
          <div className="field"><span className="lab">{res.length > 1 && W.q ? 'Produtos encontrados' : 'Produto encontrado'}</span>
            <div id="wRes" className="form-stack" style={{ gap: 8 }}>
              {res.length ? res.slice(0, W.q ? 4 : 1).map((p) => {
                const i = CATALOGO_GERAL.indexOf(p);
                return (
                  <button key={p.nome} type="button" className={`found ${i === found ? 'on' : ''}`} onClick={() => up({ found: i, price: toBR(p.preco) })}>
                    <span className="thumb sm" style={{ background: '#fdecec' }}>{p.thumb}</span>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}><b>{p.nome}</b><small>{p.marca}</small></div>
                    <span className="num">{brl(p.preco)}</span>{i === found && <Icon name="check-circle-2" className="ok-or" />}
                  </button>
                );
              }) : <p className="hint" style={{ margin: 0 }}>Nenhum item do catálogo com esse nome. Use "Produto completo" para cadastrar manualmente.</p>}
            </div>
          </div>
          <div className="row2">
            <div className="field"><label htmlFor="wPrice">Preço de venda <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="wPrice" {...campo('price')} inputMode="decimal" /></div></div>
            <div className="field"><label htmlFor="wCat">Categoria</label><select className="sel" id="wCat" {...campo('cat')}>{cats}</select></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, color: 'var(--ink)' }}>
            <Icon name="badge-percent" /> Aplicar preço promocional
            <label className="switch dark"><input type="checkbox" id="wPromo" checked={W.promo} onChange={(e) => up({ promo: e.target.checked })} /><span /></label>
          </div>
          <div className="row2" id="wPromoRow" style={W.promo ? undefined : { opacity: 0.5 }}>
            <div className="inp"><span className="pre">R$</span><input id="wPromoVal" value={W.promoVal} placeholder="0,00" disabled={!W.promo} aria-label="Preço promocional"
              onChange={(e) => { const base = parseBR(W.price), v = parseBR(e.target.value); up({ promoVal: e.target.value, promoPct: base && v ? String(Math.round((1 - v / base) * 100)) : '' }); }} /></div>
            <div className="inp"><span className="pre">%</span><input id="wPromoPct" value={W.promoPct} placeholder="0" disabled={!W.promo} aria-label="Percentual de desconto"
              onChange={(e) => { const base = parseBR(W.price), pc = parseBR(e.target.value); up({ promoPct: e.target.value, promoVal: base ? toBR(base * (1 - pc / 100)) : '' }); }} /></div>
          </div>
        </div>
        <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary" disabled={!f}>Salvar Produto</button></div>
      </form>
    );
  }

  if (W.step === 'c1') return (
    <form className="modal wide" id="wizC1" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!exigir([[W.nome, 'wNome'], [W.desc, 'wDesc'], [W.val, 'wVal'], [W.pcat, 'wPcat']])) return;
      if (!parseBR(W.val)) { document.getElementById('wVal').focus(); toast('Informe um valor válido, ex: 32,90'); return; }
      ir('c2');
    }}>
      <ModalHead icon="package" title="Adicionar produto" onBack={() => ir('tipo')} />
      <WizSub icon="chef-hat" t="Produto completo" d="Monte um produto preparado pela sua loja, com nome, descrição, preço, categoria e complementos." />
      <Dots n={1} />
      <div className="form-stack">
        <div className="field"><label htmlFor="wNome">Nome do produto <span className="req">*</span></label><div className="inp"><input id="wNome" {...campo('nome')} placeholder="Ex: X-Bacon" required autoFocus /></div></div>
        <div className="field"><label htmlFor="wDesc">Descrição do produto <span className="req">*</span></label><TextArea id="wDesc" max={500} value={W.desc} onChange={(v) => up({ desc: v })} placeholder="Ex: Pão brioche, hambúrguer, queijo cheddar, bacon e molho especial..." /></div>
        <div className="row2">
          <div className="field"><label htmlFor="wVal">Valor <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="wVal" {...campo('val')} placeholder="0,00" inputMode="decimal" /></div></div>
          <div className="field"><label htmlFor="wPcat">Categoria <span className="req">*</span></label><select className="sel" id="wPcat" {...campo('pcat')}><option value="">Selecione uma categoria</option>{cats}</select></div>
        </div>
      </div>
      <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary">Continuar <Icon name="chevron-right" /></button></div>
    </form>
  );

  if (W.step === 'c2') {
    const list = comps.filter((c) => !W.cq || c.nome.toLowerCase().includes(W.cq.toLowerCase()));
    const toggle = (id, on) => up({ comps: on ? [...W.comps, id] : W.comps.filter((x) => x !== id) });
    return (
      <form className="modal wide" id="wizC2" noValidate onSubmit={(e) => { e.preventDefault(); ir('c3'); }}>
        <ModalHead icon="package" title="Adicionar produto" onBack={() => ir('c1')} />
        <WizSub icon="chef-hat" t="Produto completo" />
        <Dots n={2} />
        <div className="field"><span className="lab">Complementos</span><span className="hint">Selecione os complementos que o cliente poderá adicionar a este produto.</span>
          <div className="pay-list" style={{ marginTop: 6 }}>
            <label className="pay-row" style={{ padding: '8px 12px' }}><Icon name="search" /><input id="wCq" {...campo('cq')} placeholder="Buscar complemento..." style={{ border: 0, outline: 'none', flex: 1, background: 'none' }} aria-label="Buscar complemento" /></label>
            <div id="wCompList">
              {list.length ? list.map((c) => (
                <label key={c.id} className="pay-row" style={{ padding: '8px 12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={W.comps.includes(c.id)} onChange={(e) => toggle(c.id, e.target.checked)} style={{ accentColor: 'var(--orange)', width: 16, height: 16 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{c.nome}</span><b className="num" style={{ fontSize: 12 }}>{brl(c.preco)}</b>
                </label>
              )) : <p className="hint" style={{ padding: '10px 12px', margin: 0 }}>Nenhum complemento com esse nome.</p>}
            </div>
          </div>
          <a className="btn btn-outline-or btn-sm" style={{ alignSelf: 'flex-start', marginTop: 10 }} href="#complementos" onClick={closeModal}><Icon name="plus" /> Adicionar mais complemento</a>
          <span className="hint" id="wCompCount">{W.comps.length} selecionado{W.comps.length === 1 ? '' : 's'}</span>
        </div>
        <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={() => ir('c1')}>Voltar</button><button className="btn btn-primary">Continuar <Icon name="chevron-right" /></button></div>
      </form>
    );
  }

  if (W.step === 'c3') {
    const nComp = W.comps.length;
    const enviarImg = async (file) => { if (!file) return; try { const r = await readImage(file, 'item'); up({ img: r.url, imgName: r.name }); toast(r.info); } catch (err) { toast(err.message); } };
    return (
      <form className="modal wide" id="wizC3" noValidate onSubmit={(e) => {
        e.preventDefault();
        salvar({ nome: W.nome.trim(), desc: W.desc.trim() + (nComp ? ` · ${plural(nComp, 'complemento', 'complementos')}` : ''), preco: parseBR(W.val), thumb: '🍽️', img: W.img || null, comps: W.comps }, W.pcat);
      }}>
        <ModalHead icon="package" title="Adicionar produto" onBack={() => ir('c2')} />
        <WizSub icon="chef-hat" t="Produto completo" />
        <Dots n={3} />
        <div className="field"><span className="lab">Imagem do produto</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            {W.img && <div className="img-prev"><img src={W.img} alt={`Prévia de ${W.nome}`} /><button type="button" onClick={() => up({ img: '' })} aria-label="Remover imagem"><Icon name="x" /></button></div>}
            <label className="upload" style={{ flex: 1 }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); enviarImg(e.dataTransfer.files[0]); }}>
              <span className="u-ico"><Icon name="image" /></span>
              <span><b>Clique para enviar</b> ou arraste a imagem<br />Quadrada, 800 × 800 px (mínimo 300 × 300). PNG ou JPG até 2MB.</span>
              <input type="file" accept="image/png,image/jpeg" hidden id="wImg" onChange={(e) => { enviarImg(e.target.files[0]); e.target.value = ''; }} />
            </label>
          </div>
        </div>
        <div className="resumo"><b>Resumo do produto</b>
          <dl><dt>Nome do produto</dt><dd>{W.nome}</dd><dt>Categoria</dt><dd>{W.pcat}</dd><dt>Valor</dt><dd>{brl(parseBR(W.val))}</dd><dt>Complementos</dt><dd>{nComp} selecionado{nComp === 1 ? '' : 's'}</dd></dl>
        </div>
        <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={() => ir('c2')}>Voltar</button><button className="btn btn-primary">Salvar Produto</button></div>
      </form>
    );
  }

  // ok
  return (
    <div className="modal" style={{ textAlign: 'center', padding: '40px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-24px -16px 0' }}><button type="button" className="icon-btn" onClick={closeModal} aria-label="Fechar"><Icon name="x" /></button></div>
      <span className="ico-c lg green" style={{ margin: '0 auto 18px', width: 64, height: 64 }}><Icon name="check" /></span>
      <h2 style={{ margin: '0 0 8px', color: 'var(--ink)', fontSize: 21 }}>Produto cadastrado com sucesso!</h2>
      <p className="hint" style={{ fontSize: 13, margin: '0 0 24px' }}>{salvo?.nome} foi adicionado à categoria <b>{salvo?.cat}</b>.</p>
      <div className="form-stack" style={{ gap: 10, maxWidth: 300, margin: '0 auto' }}>
        <button type="button" className="btn btn-primary" onClick={() => { closeModal(); navigate('produtos'); }}>Ver produto</button>
        <button type="button" className="btn btn-outline" onClick={() => setW(inicial(catSel))}>Cadastrar outro produto</button>
      </div>
    </div>
  );
}
