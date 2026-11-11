// Adicionar ou editar cliente (com busca de endereço pelo CEP).
import { useState } from 'react';
import Icon from '../components/Icon';
import { ModalHead, exigir } from '../components/ui';
import { useApp, mut, toast, closeModal } from '../store/useApp';
import { useCep } from '../hooks/useCep';
import { maskTel, maskCep, normTel, fmtTel, uid } from '../lib/format';

export default function ClienteModal({ id }) {
  const clientes = useApp((s) => s.clientes);
  const c = clientes.find((x) => x.id === id) || {};
  const [f, setF] = useState({ nome: c.nome || '', tel: c.tel || '', cep: c.cep || '', end: c.end || '', setor: c.setor || '', cidade: c.cidade || 'Goiânia', nasc: c.nasc || '' });
  const { hint, buscar } = useCep('setor', (r) => setF((o) => ({ ...o, end: r.rua || o.end, setor: r.bairro || o.setor, cidade: r.cidade || o.cidade })), 'clRua');
  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === 'tel') v = maskTel(v);
    if (k === 'cep') { v = maskCep(v); if (v.length === 9) buscar(v); }
    setF({ ...f, [k]: v });
  };

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[f.nome, 'clNome'], [f.tel, 'clTel']])) return;
    const tel = normTel(f.tel);
    if (tel.length < 10 || tel.length > 11) { document.getElementById('clTel').focus(); toast('Telefone inválido. Use DDD + número, ex: (62) 99999-0000'); return; }
    const other = clientes.find((x) => normTel(x.tel) === tel && x.id !== id);
    if (other) { document.getElementById('clTel').focus(); toast(`Este telefone já pertence a ${other.nome}`); return; }
    const data = { nome: f.nome.trim(), tel: fmtTel(tel), cep: f.cep.trim(), end: f.end.trim(), setor: f.setor.trim(), cidade: f.cidade.trim(), nasc: f.nasc };
    mut((s) => {
      const ex = s.clientes.find((x) => x.id === id);
      if (ex) Object.assign(ex, data); else s.clientes.unshift({ ...data, id: uid('c'), cad: Date.now(), ult: null });
    });
    closeModal(); toast(c.id ? 'Cliente atualizado' : 'Cliente adicionado');
  };

  return (
    <form className="modal wide" id="cliForm" noValidate onSubmit={salvar}>
      <ModalHead icon="user-plus" title={c.id ? 'Editar cliente' : 'Adicionar cliente'} />
      <p className="lead">Campos com <span style={{ color: 'var(--orange)' }}>*</span> são obrigatórios.</p>
      <div className="form-stack">
        <div className="row2">
          <div className="field"><label htmlFor="clNome">Nome do cliente <span className="req">*</span></label><div className="inp"><input id="clNome" value={f.nome} onChange={set('nome')} placeholder="Nome completo" required /></div></div>
          <div className="field"><label htmlFor="clTel">Telefone / WhatsApp <span className="req">*</span></label><div className="inp"><Icon name="message-circle" className="wa" /><input id="clTel" value={f.tel} onChange={set('tel')} placeholder="(62) 99999-9999" inputMode="tel" required /></div></div>
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="clCep">CEP <span className="opt">(opcional)</span></label>
            <div className="inp"><input id="clCep" value={f.cep} onChange={set('cep')} inputMode="numeric" placeholder="00000-000" /><button type="button" className="icon-btn" onClick={() => buscar(f.cep)} aria-label="Buscar endereço pelo CEP"><Icon name="search" /></button></div>
            <span className={`hint cep-hint ${hint.tipo}`} id="clCepHint">{hint.texto || 'Digite o CEP para preencher o endereço.'}</span></div>
          <div className="field"><label htmlFor="clRua">Endereço <span className="opt">(opcional)</span></label><div className="inp"><input id="clRua" value={f.end} onChange={set('end')} placeholder="Rua, número" /></div></div>
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="clBai">Setor / Bairro <span className="opt">(opcional)</span></label><div className="inp"><input id="clBai" value={f.setor} onChange={set('setor')} placeholder="Ex: Setor Bueno" /></div></div>
          <div className="field"><label htmlFor="clCid">Cidade <span className="opt">(opcional)</span></label><div className="inp"><input id="clCid" value={f.cidade} onChange={set('cidade')} /></div></div>
        </div>
        <div className="field" style={{ maxWidth: 260 }}><label htmlFor="clNasc">Aniversário <span className="opt">(opcional)</span></label><div className="inp"><Icon name="cake" /><input id="clNasc" type="date" value={f.nasc} onChange={set('nasc')} /></div></div>
      </div>
      <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary"><Icon name="save" /> Salvar cliente</button></div>
    </form>
  );
}
