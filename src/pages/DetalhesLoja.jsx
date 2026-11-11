import { useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, SecHead } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';
import { navigate } from '../store/actions';
import { useCep } from '../hooks/useCep';
import { UFS } from '../lib/cep';
import { readImage } from '../lib/images';
import { maskCep, maskTel } from '../lib/format';
import { HHMM, maskHora, normHora, passaMeiaNoite, horasErros, sugerirFaixa } from '../lib/hours';

/* ---------- Horário de atendimento ---------- */
function HoraInput({ v, dia, i, j, p }) {
  const salvar = (val) => mut((s) => { const sl = s.hours[i].slots[j]; if (sl) sl[p] = val; });
  return (
    <input className={`hora ${v && !HHMM.test(v) ? 'bad' : ''}`} type="text" inputMode="numeric" maxLength={5} placeholder="00:00" autoComplete="off" value={v}
      data-h={i} data-s={j} data-p={p} aria-label={`${dia}, ${p ? 'fim' : 'início'} do horário ${j + 1}`}
      onChange={(e) => { const m = maskHora(e.target.value); salvar(HHMM.test(m) ? m : m.length === 5 ? normHora(m) ?? m : m); }}
      onBlur={(e) => { const n = normHora(e.target.value); if (n !== null && n !== e.target.value) salvar(n); }} />
  );
}

function HourRow({ h, i }) {
  const alternar = () => mut((s) => { const d = s.hours[i]; d.open = !d.open; if (d.open && !d.slots.length) d.slots.push(['08:00', '18:00']); });
  const adicionar = () => {
    const sug = sugerirFaixa(h);
    if (!sug) { toast(`Não há espaço para outro horário depois do último de ${h.dia.toLowerCase()}. Ajuste os horários existentes.`); return; }
    mut((s) => { s.hours[i].slots.push(sug); });
    setTimeout(() => { const ins = document.querySelectorAll(`input[data-h="${i}"][data-p="0"]`); ins[ins.length - 1]?.focus(); }, 0);
  };
  const excluir = (j) => {
    let fechou = false;
    mut((s) => { const d = s.hours[i]; d.slots.splice(j, 1); if (!d.slots.length) { d.open = false; fechou = true; } });
    toast(fechou ? `${h.dia} marcado como Fechado` : 'Horário excluído');
  };
  return (
    <div className="hour-row2" data-row={i}>
      <b>{h.dia}</b>
      <button type="button" className={`pill ${h.open ? 'p-green' : 'p-gray'} pill-btn`} onClick={alternar} title={`Clique para ${h.open ? 'fechar' : 'abrir'} neste dia`}>{h.open ? 'Aberto' : 'Fechado'}</button>
      <div className="slots">
        {!h.open ? <span className="hint">Fechado o dia todo</span> : !h.slots.length ? <span className="hint">Sem horário. Adicione um ou marque como Fechado.</span> : h.slots.map(([a, b], j) => (
          <div key={j} className="slot2">
            <HoraInput v={a} dia={h.dia} i={i} j={j} p={0} /><span>às</span><HoraInput v={b} dia={h.dia} i={i} j={j} p={1} />
            <small className="hint nx" hidden={!passaMeiaNoite(a, b)}>dia seguinte</small>
            <button type="button" className="icon-btn del" onClick={() => excluir(j)} aria-label={`Excluir horário ${a} às ${b} de ${h.dia}`}><Icon name="trash-2" /></button>
          </div>
        ))}
      </div>
      {h.open && h.slots.length < 3 ? <button type="button" className="btn btn-outline btn-sm" onClick={adicionar}><Icon name="plus" /> Adicionar horário</button> : <span />}
    </div>
  );
}

/* ---------- Página ---------- */
export default function DetalhesLoja() {
  const L = useApp((s) => s.loja), logo = useApp((s) => s.logo), hours = useApp((s) => s.hours);
  const [over, setOver] = useState(false);
  const setLoja = (patch) => mut((s) => { Object.assign(s.loja, patch); });
  const { hint, buscar } = useCep('bairro/setor', (r) => setLoja({ ...(r.rua && { rua: r.rua }), ...(r.bairro && { bai: r.bairro }), ...(r.cidade && { cid: r.cidade }), ...(r.uf && { uf: r.uf }) }), 'ljRua', 'ljNro');
  const campo = (k, extra = {}) => ({ value: L[k], onChange: (e) => setLoja({ [k]: e.target.value }), ...extra });
  const erros = horasErros(hours);

  const enviarLogo = async (file) => {
    if (!file) return;
    try { const r = await readImage(file, 'logo'); mut((s) => { s.logo = r.url; }); toast(`Logo atualizado. ${r.info}.`); }
    catch (e) { toast(e.message); }
  };
  const drop = { onDragOver: (e) => { e.preventDefault(); setOver(true); }, onDragLeave: () => setOver(false), onDrop: (e) => { e.preventDefault(); setOver(false); enviarLogo(e.dataTransfer.files[0]); } };

  const copiarSegunda = () => {
    const base = hours[0];
    if (!base.open) { toast('Segunda está fechada. Abra a segunda antes de copiar.'); return; }
    const n = hours.filter((h, i) => i && h.open).length;
    mut((s) => { s.hours.forEach((h, i) => { if (i && h.open) h.slots = s.hours[0].slots.map((x) => [...x]); }); });
    toast(n ? `Horários de segunda copiados para ${n} dia${n > 1 ? 's' : ''} aberto${n > 1 ? 's' : ''}. Dias fechados continuam fechados.` : 'Nenhum outro dia está aberto.');
  };

  const salvar = (e) => {
    e.preventDefault();
    const faltam = [['nome', 'Nome da loja', 'nl'], ['cep', 'CEP', 'ljCep'], ['rua', 'Rua', 'ljRua'], ['nro', 'Número', 'ljNro'], ['bai', 'Bairro', 'ljBai'], ['cid', 'Cidade', 'ljCid'], ['wpp', 'WhatsApp', 'wpp']].filter(([k]) => !String(L[k] || '').trim());
    if (faltam.length) { document.getElementById(faltam[0][2])?.focus(); toast(`Preencha: ${faltam.map((x) => x[1]).join(', ')}`); return; }
    if (L.cep.replace(/\D/g, '').length !== 8) { document.getElementById('ljCep').focus(); toast('CEP inválido. Use 8 dígitos.'); return; }
    if (erros.length) { document.getElementById('hoursList').scrollIntoView({ behavior: 'smooth', block: 'center' }); toast('Corrija os horários de atendimento antes de salvar'); return; }
    if (!hours.some((h) => h.open)) { toast('Deixe pelo menos um dia aberto'); return; }
    toast('Dados da loja salvos');
  };

  return (
    <>
      <PageHead icon="store" variant="outline" title="Detalhes da Loja" sub="Gerencie as informações da sua loja, como dados de contato, endereço, horários e aparência no aplicativo." />
      <form className="form-stack" style={{ gap: 20 }} id="lojaForm" noValidate onSubmit={salvar}>
        <div className="two-col">
          <div className="card card-pad"><SecHead icon="contact" title="Identidade da loja" sub="O logo aparece para os clientes no app e no site." />
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div className={`logo-box ${logo ? 'has' : ''} ${over ? 'over' : ''}`} {...drop}>{logo ? <img src={logo} alt="Logo da loja" /> : <><Icon name="store" /><span>Sem logo</span></>}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }} {...drop}><Icon name="upload" /> {logo ? 'Trocar logo' : 'Enviar logo'}<input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => { enviarLogo(e.target.files[0]); e.target.value = ''; }} /></label>
                  <button type="button" className="btn btn-outline btn-sm" disabled={!logo} onClick={() => { mut((s) => { s.logo = null; }); toast('Logo removido'); }}><Icon name="trash-2" /> Remover</button>
                </div>
                <div className="img-spec"><b>Tamanho do logo</b><span>Quadrado (1:1), recomendado <b>512 × 512 px</b>, mínimo 200 × 200 px. PNG ou JPG até 2MB.</span><span>Imagens retangulares são recortadas no centro e ajustadas para 512 × 512 px, para o logo ficar igual em todas as telas.</span></div>
              </div>
            </div>
            <div className="field" style={{ marginTop: 16 }}><label htmlFor="nl">Nome da loja <span className="req">*</span></label><div className="inp"><input id="nl" {...campo('nome')} required maxLength={60} /></div></div>
          </div>
          <div className="card card-pad"><SecHead icon="map-pin" title="Endereço da loja" sub="Digite o CEP para preencher o endereço automaticamente." />
            <div className="form-stack">
              <div className="row3">
                <div className="field"><label htmlFor="ljCep">CEP <span className="req">*</span></label>
                  <div className="inp"><input id="ljCep" value={L.cep} inputMode="numeric" placeholder="00000-000" onChange={(e) => { const v = maskCep(e.target.value); setLoja({ cep: v }); if (v.length === 9) buscar(v); }} />
                    <button type="button" className="icon-btn" onClick={() => buscar(L.cep)} aria-label="Buscar endereço pelo CEP"><Icon name="search" /></button></div>
                  <span className={`hint cep-hint ${hint.tipo}`} id="ljCepHint">{hint.texto}</span></div>
                <div className="field"><label htmlFor="ljRua">Rua / Avenida <span className="req">*</span></label><div className="inp"><input id="ljRua" {...campo('rua')} /></div></div>
                <div className="field"><label htmlFor="ljNro">Número <span className="req">*</span></label><div className="inp"><input id="ljNro" {...campo('nro')} /></div></div>
              </div>
              <div className="row2">
                <div className="field"><label htmlFor="cpl">Complemento <span className="opt">(opcional)</span></label><div className="inp"><input id="cpl" {...campo('cpl')} placeholder="Ex: Sala 2" /></div></div>
                <div className="field"><label htmlFor="ljBai">Bairro / Setor <span className="req">*</span></label><div className="inp"><input id="ljBai" {...campo('bai')} /></div></div>
              </div>
              <div className="row2">
                <div className="field"><label htmlFor="ljCid">Cidade <span className="req">*</span></label><div className="inp"><input id="ljCid" {...campo('cid')} /></div></div>
                <div className="field"><label htmlFor="ljUf">Estado <span className="req">*</span></label><select className="sel" id="ljUf" {...campo('uf')}>{UFS.map((u) => <option key={u}>{u}</option>)}</select></div>
              </div>
            </div>
          </div>
          <div className="card card-pad"><SecHead icon="badge-check" title="Dados comerciais" sub="Informações fiscais e de contato da loja." />
            <div className="row2">
              <div className="field"><label htmlFor="cnpj">CNPJ <span className="req">*</span></label><div className="inp read"><input id="cnpj" value={L.cnpj} readOnly aria-describedby="cnpjHint" /><Icon name="lock" /></div><span className="hint" id="cnpjHint">Informado no cadastro. Para alterar, fale com o suporte.</span></div>
              <div className="field"><label htmlFor="wpp">WhatsApp da loja <span className="req">*</span></label><div className="inp"><Icon name="message-circle" className="wa" /><input id="wpp" value={L.wpp} onChange={(e) => setLoja({ wpp: maskTel(e.target.value) })} inputMode="tel" /></div></div>
            </div>
          </div>
          <div className="card card-pad"><SecHead icon="calendar-check" title="Pedido mínimo" sub="Valor mínimo para realizar um pedido na sua loja." />
            <div className="field"><label htmlFor="pm">Valor mínimo do pedido (R$) <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="pm" {...campo('pm')} inputMode="decimal" /></div></div>
          </div>
        </div>
        <div className="card card-pad">
          <SecHead icon="alarm-clock" title="Horário de atendimento" sub="Clique em Aberto/Fechado para mudar o dia. Edite os horários direto nos campos e use a lixeira para excluir.">
            <button type="button" className="btn btn-outline btn-sm" onClick={copiarSegunda}><Icon name="copy" /> Copiar segunda para os dias abertos</button>
          </SecHead>
          <div className="pay-list" id="hoursList">{hours.map((h, i) => <HourRow key={h.dia} h={h} i={i} />)}</div>
          <div id="hoursErr">{erros.length > 0 && <div className="info err-box"><Icon name="alert-triangle" /><span>{erros.map((e, k) => <span key={k}>{e}<br /></span>)}</span></div>}</div>
        </div>
        <div className="card card-pad"><SecHead icon="fingerprint" title="Identificação da conta" sub="Código único que diferencia a sua loja de todas as outras na plataforma." />
          <div className="acct"><span className="acct-code" id="acctCode">{L.code}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(L.code).then(() => toast('Código copiado'), () => toast('Selecione o código e use Ctrl+C'))}><Icon name="copy" /> Copiar código</button></div>
          <span className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }}><Icon name="info" /> Gerado na criação da conta e não muda. Informe este código ao suporte para identificar sua loja.</span>
        </div>
        <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => navigate('visao-geral')}>Cancelar</button><button className="btn btn-primary">Salvar alterações</button></div>
      </form>
    </>
  );
}
