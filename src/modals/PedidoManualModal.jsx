// Pedido feito pelo telefone/balcão: entra em "Pedido Recebido" e no Histórico.
import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import ProdPicker, { pickedList } from '../components/ProdPicker';
import { ModalHead, exigir } from '../components/ui';
import { useApp, mut, toast, closeModal } from '../store/useApp';
import { navigate } from '../store/actions';
import { allProducts } from '../domain/catalogo';
import { proximoNumero } from '../domain/clientes';
import { brl, maskTel, normTel, fmtTel } from '../lib/format';

export default function PedidoManualModal() {
  const categories = useApp((s) => s.categories), kits = useApp((s) => s.kits), clientes = useApp((s) => s.clientes);
  const items = useMemo(() => [
    ...allProducts({ categories }).map((p) => ({ ...p, sub: p.desc, key: p.id })),
    ...kits.map((k) => ({ ...k, sub: `Kit · ${k.cat}`, key: k.id })),
  ], [categories, kits]);
  const [f, setF] = useState({ cli: '', tel: '', modo: 'Entrega', pg: 'Pix', end: '' });
  const [pick, setPick] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: k === 'tel' ? maskTel(e.target.value) : e.target.value });
  const sel = pickedList(pick, items), total = sel.reduce((a, x) => a + x[1] * x[2], 0);

  const salvar = (e) => {
    e.preventDefault();
    if (!exigir([[f.cli, 'pmCli'], [f.tel, 'pmTel']])) return;
    const tel = normTel(f.tel); if (tel.length < 10) { document.getElementById('pmTel').focus(); toast('Telefone inválido. Use DDD + número.'); return; }
    if (f.modo === 'Entrega' && !f.end.trim()) { document.getElementById('pmEnd').focus(); toast('Informe o endereço de entrega'); return; }
    if (!sel.length) { toast('Escolha ao menos um item'); return; }
    const cli = f.cli.trim(), known = clientes.find((c) => c.nome.toLowerCase() === cli.toLowerCase()), now = Date.now();
    let num;
    mut((s) => {
      num = proximoNumero(s.pedidos);
      s.pedidos.push({
        num, id: 1829140 + num, cli, tel: fmtTel(tel), modo: f.modo,
        end: f.modo === 'Retirada' ? 'Retirada no balcão' : f.end.trim(), setor: f.modo === 'Retirada' ? '—' : known?.setor || '—', cidade: known?.cidade || 'Goiânia',
        itens: sel.map((x) => `${x[1]}x ${x[0]}`).join(', '), valor: total, pg: f.pg, status: 'recebido', created: now, updated: now,
      });
    });
    closeModal(); navigate('painel-vendas'); toast(`Pedido #${num} criado`);
  };

  return (
    <form className="modal wide" id="pedForm" noValidate onSubmit={salvar}>
      <ModalHead icon="clipboard-plus" title="Pedido manual" />
      <p className="lead">O pedido entra na coluna Pedido Recebido e já aparece no Histórico.</p>
      <div className="form-stack">
        <div className="row2">
          <div className="field"><label htmlFor="pmCli">Cliente <span className="req">*</span></label><div className="inp"><input id="pmCli" list="pmCliList" value={f.cli} onChange={set('cli')} placeholder="Nome do cliente" required /></div>
            <datalist id="pmCliList">{clientes.map((c) => <option key={c.id} value={c.nome} />)}</datalist></div>
          <div className="field"><label htmlFor="pmTel">Telefone <span className="req">*</span></label><div className="inp"><input id="pmTel" value={f.tel} onChange={set('tel')} placeholder="(62) 99999-9999" inputMode="tel" required /></div></div>
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="pmModo">Tipo</label><select className="sel" id="pmModo" value={f.modo} onChange={set('modo')}><option>Entrega</option><option>Retirada</option></select></div>
          <div className="field"><label htmlFor="pmPg">Pagamento</label><select className="sel" id="pmPg" value={f.pg} onChange={set('pg')}><option>Pix</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Dinheiro</option></select></div>
        </div>
        <div className="field" id="pmEndF" hidden={f.modo === 'Retirada'}><label htmlFor="pmEnd">Endereço de entrega <span className="req">*</span></label><div className="inp"><input id="pmEnd" value={f.end} onChange={set('end')} placeholder="Rua, número" /></div></div>
        <div className="field"><span className="lab">Itens do pedido <span className="req">*</span></span><ProdPicker id="pmList" items={items} value={pick} onChange={setPick} /></div>
        <div className="pm-total"><span>Total do pedido</span><b id="pmTotal" className="num">{brl(total)}</b></div>
      </div>
      <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button><button className="btn btn-primary"><Icon name="check" /> Criar pedido</button></div>
    </form>
  );
}
