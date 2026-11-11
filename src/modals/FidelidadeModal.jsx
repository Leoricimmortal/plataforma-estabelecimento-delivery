// Configurações do Programa de Fidelidade.
import { useState } from 'react';
import Icon from '../components/Icon';
import { Info, Stepper, Switch } from '../components/ui';
import { Seal, StarGlyph, GiftArt } from '../components/art';
import { useApp, mut, toast, closeModal } from '../store/useApp';

export default function FidelidadeModal() {
  const fid = useApp((s) => s.fid);
  const [F, setF] = useState({ ...fid });
  const up = (patch) => setF((o) => ({ ...o, ...patch }));
  const campo = (k) => ({ value: F[k], onChange: (e) => up({ [k]: e.target.value }) });
  const radio = (name, v) => ({ type: 'radio', name, value: v, checked: F[name === 'fCond' ? 'cond' : 'premio'] === v, onChange: () => up({ [name === 'fCond' ? 'cond' : 'premio']: v }) });

  const salvar = (e) => {
    e.preventDefault();
    if (F.cond === 'tipo' && !F.tipo) { document.getElementById('fTipo').focus(); toast('Escolha o tipo de pedido que gera selo'); return; }
    if (F.premio === 'outro' && !F.outro.trim()) { document.getElementById('fOutro').focus(); toast('Descreva o prêmio'); return; }
    mut((s) => { Object.assign(s.fid, { ...F, outro: F.premio === 'brinde' ? '' : F.outro.trim() }); });
    closeModal(); toast('Configurações do programa salvas');
  };

  return (
    <form className="modal xl" id="fidForm" noValidate onSubmit={salvar}>
      <div className="modal-h" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
        <Seal content={<StarGlyph />} on size={60} />
        <div><h2 style={{ fontSize: 22 }}>Configurações do Programa de Fidelidade</h2><p className="lead" style={{ margin: '4px 0 0' }}>Defina as regras para seus clientes acumularem selos e ganharem prêmios.</p></div>
        <button type="button" className="icon-btn x" onClick={closeModal} aria-label="Fechar"><Icon name="x" /></button>
      </div>
      <div className="fc-active">
        <Switch variant="green big" checked={F.on} onChange={(v) => up({ on: v })} label="Programa ativo" />
        <div><b>Programa de Fidelidade {F.on ? 'Ativo' : 'Pausado'}</b><small>{F.on ? 'O programa estará disponível para todos os clientes da sua loja.' : 'Os clientes não acumulam selos enquanto o programa estiver pausado.'}</small></div>
      </div>
      <div className="fc-grid">
        <section className="fc-box">
          <div className="sec-h"><span className="ico-c"><Icon name="settings" /></span><div><h3>Condições para ganhar um selo</h3><p>Escolha o que o cliente precisa fazer para ganhar um selo.</p></div></div>
          <div className="form-stack">
            <label className="radio"><input {...radio('fCond', 'compra')} /><div><b>A cada compra realizada</b><small>O cliente ganha 1 selo por compra.</small></div></label>
            <label className="radio" style={{ alignItems: 'center' }}><input {...radio('fCond', 'valor')} /><div style={{ flex: 1 }}><b>A cada valor gasto</b><small>O cliente ganha 1 selo a cada R$</small></div><div className="inp" style={{ width: 110 }}><input id="fValor" {...campo('valor')} aria-label="Valor por selo" /></div></label>
            <label className="radio"><input {...radio('fCond', 'tipo')} /><div style={{ flex: 1 }}><b>A cada pedido de um tipo específico</b>
              <select className="sel" id="fTipo" style={{ width: '100%', marginTop: 8 }} {...campo('tipo')}><option value="">Selecione um tipo...</option>{['Delivery', 'Retirada no local', 'Combos e kits', 'Hambúrgueres'].map((o) => <option key={o}>{o}</option>)}</select></div></label>
          </div>
        </section>
        <section className="fc-box">
          <div className="sec-h"><span className="ico-c" style={{ background: 'none', color: 'var(--orange)' }}><Icon name="trophy" /></span><div><h3>Quantidade de selos</h3><p>Defina quantos selos serão necessários para o cliente ganhar o prêmio.</p></div></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}><Stepper big value={F.n} min={3} max={15} onChange={(n) => up({ n })} label="selos" /><span>selos</span></div>
          <div className="seal-row" id="fSeals">{Array.from({ length: F.n }, (_, i) => <div key={i}><Seal content={<StarGlyph />} on size={52} /><span>{i + 1}</span></div>)}</div>
        </section>
        <section className="fc-box fc-prize">
          <div>
            <div className="sec-h"><span className="ico-c" style={{ background: 'none', color: 'var(--orange)' }}><Icon name="gift" /></span><div><h3>Prêmio ao completar os selos</h3><p>Escolha o que o cliente vai ganhar ao completar os {F.n} selos.</p></div></div>
            <div className="prize-list">
              <label className="radio"><input {...radio('fPremio', 'brinde')} /><b>Brinde especial</b></label>
              <select className="sel" id="fBrinde" {...campo('brinde')}>{['Caneca Personalizada', 'Hambúrguer grátis', 'Porção de batata', 'Milkshake 400ml'].map((o) => <option key={o}>{o}</option>)}</select>
              <label className="radio"><input {...radio('fPremio', 'cupom')} /><b>Cupom de desconto</b></label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><div className="inp" style={{ width: 90 }}><input id="fCupom" {...campo('cupom')} inputMode="numeric" aria-label="Percentual" /></div><span className="hint">% de desconto</span></div>
              <label className="radio"><input {...radio('fPremio', 'desconto')} /><b>Desconto no próximo pedido</b></label>
              <div className="inp" style={{ width: 130 }}><span className="pre">R$</span><input id="fDesc" {...campo('desc')} aria-label="Valor do desconto" /></div>
              <label className="radio"><input {...radio('fPremio', 'outro')} /><b>Outro prêmio</b></label>
              <div className="inp"><input id="fOutro" {...campo('outro')} placeholder="Descreva o prêmio..." aria-label="Outro prêmio" /></div>
            </div>
          </div>
          <div className="congrats"><GiftArt /><b>Parabéns!</b><span>Você completou seus {F.n} selos e ganhou um prêmio especial!</span></div>
        </section>
        <section className="fc-box">
          <div className="sec-h"><span className="ico-c"><Icon name="info" /></span><div><h3>Informações Extras</h3></div></div>
          <div className="form-stack">
            <div className="field"><label htmlFor="fVal">Validade dos selos</label><select className="sel" id="fVal" {...campo('validade')}>{['30 dias', '60 dias', '90 dias', '180 dias', 'Sem validade'].map((o) => <option key={o}>{o}</option>)}</select><span className="hint">Após a última compra, os selos expiram.</span></div>
            <div className="field"><label htmlFor="fMsg">Mensagem para o cliente</label><textarea className="ta" id="fMsg" maxLength={200} {...campo('msg')} /><div className="counter">{F.msg.length}/200</div></div>
          </div>
        </section>
      </div>
      <div className="fc-foot"><Info style={{ flex: 1 }}>As configurações serão aplicadas imediatamente após salvar.</Info><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary"><Icon name="save" /> Salvar Configurações</button></div>
    </form>
  );
}
