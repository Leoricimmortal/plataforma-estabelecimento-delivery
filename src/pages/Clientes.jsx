import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, Stat, Info, CheckAll, ArmedButton, usePaged } from '../components/ui';
import { useApp, mut, openModal, toast } from '../store/useApp';
import { ultimaCompra } from '../domain/clientes';
import { baixarModelo, exportarClientes, lerPlanilha } from '../lib/sheets';
import { fmtDate, isoToBR, DAY } from '../lib/format';

export default function Clientes() {
  const C = useApp((s) => s.clientes), pedidos = useApp((s) => s.pedidos);
  const [fl, setFl] = useState({ q: '', ci: '', se: '', so: 'ult' });
  const ult = (c) => ultimaCompra(c, pedidos);
  const now = new Date(), m = now.getMonth(), y = now.getFullYear();
  const novos = C.filter((c) => { const d = new Date(c.cad); return d.getMonth() === m && d.getFullYear() === y; }).length;
  const aniv = C.filter((c) => c.nasc && +c.nasc.slice(5, 7) === m + 1).length;
  const comp = C.filter((c) => { const u = ult(c); return u && Date.now() - u <= 30 * DAY; }).length;
  const cities = [...new Set(C.map((c) => c.cidade).filter(Boolean))].sort(), setores = [...new Set(C.map((c) => c.setor).filter(Boolean))].sort();

  const rows = useMemo(() => {
    const q = fl.q.toLowerCase(), qd = q.replace(/\D/g, '');
    const r = C.filter((c) => (!q || c.nome.toLowerCase().includes(q) || (qd && c.tel.replace(/\D/g, '').includes(qd))) && (!fl.ci || c.cidade === fl.ci) && (!fl.se || c.setor === fl.se));
    const u = (c) => ultimaCompra(c, pedidos) || 0;
    return r.sort(fl.so === 'nome' ? (a, b) => a.nome.localeCompare(b.nome, 'pt-BR') : fl.so === 'cad' ? (a, b) => b.cad - a.cad : (a, b) => u(b) - u(a));
  }, [C, pedidos, fl]);
  const pg = usePaged(rows, 10);
  const filtro = (k) => ({ value: fl[k], onChange: (e) => { setFl({ ...fl, [k]: e.target.value }); pg.reset(); } });

  const importar = async (file) => {
    if (!file) return;
    try {
      const r = await lerPlanilha(file, C);
      openModal('importar', { r });
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <PageHead icon="users" variant="outline" title="Lista de Clientes" sub="Gerencie os clientes da sua loja, importe e exporte sua base de clientes."
        actions={<>
          <button className="btn btn-outline" onClick={() => toast(`${baixarModelo()} baixado`)}><Icon name="download" /> Baixar planilha modelo</button>
          <button className="btn btn-outline" onClick={() => toast(`${exportarClientes(C, ult)} baixado`)}><Icon name="download" /> Exportar clientes</button>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}><Icon name="upload" /> Importar planilha<input type="file" id="cliImport" accept=".xlsx,.xls,.csv" hidden onChange={(e) => { importar(e.target.files[0]); e.target.value = ''; }} /></label>
          <button className="btn btn-primary" onClick={() => openModal('cliente', { id: null })}><Icon name="plus" /> Adicionar cliente</button>
        </>} />
      <Info><b style={{ color: 'var(--ink)' }}>Planilha modelo:</b> nome_cliente e telefone são obrigatórios. Endereço, setor, cidade e aniversário (dd/mm/aaaa) são opcionais. Aceita .xlsx, .xls ou .csv.</Info>
      <div className="stats">
        <Stat icon="user" color="blue" label="Total de clientes" value={C.length.toLocaleString('pt-BR')} />
        <Stat icon="user-plus" color="green" label="Novos este mês" value={String(novos)} />
        <Stat icon="gift" color="purple" label="Aniversariantes do mês" value={String(aniv)} />
        <Stat icon="shopping-cart" label="Compraram nos últimos 30 dias" value={String(comp)} />
      </div>
      <div className="card card-pad">
        <div className="filters">
          <label className="inp grow"><Icon name="search" /><input placeholder="Buscar por nome, telefone..." id="cliSearch" {...filtro('q')} /></label>
          <select className="sel" {...filtro('ci')}><option value="">Todas as cidades</option>{cities.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="sel" {...filtro('se')}><option value="">Todos os setores</option>{setores.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="sel" {...filtro('so')}><option value="ult">Última compra</option><option value="nome">Nome (A-Z)</option><option value="cad">Cadastro mais recente</option></select>
        </div>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th><CheckAll /></th><th>Nome do cliente</th><th>Telefone</th><th>Endereço</th><th>Setor</th><th>Cidade</th><th>Aniversário</th><th>Última compra</th><th>Ações</th></tr></thead><tbody>
          {pg.slice.length ? pg.slice.map((c) => {
            const u = ult(c);
            return (
              <tr key={c.id}><td><input type="checkbox" aria-label={`Selecionar ${c.nome}`} /></td>
                <td><div className="cell-user"><span className="av-sm"><Icon name="user" /></span><b style={{ fontWeight: 600 }}>{c.nome}</b></div></td>
                <td><span style={{ color: 'var(--sub)', display: 'inline-flex', gap: 6, alignItems: 'center' }}>{c.tel} <Icon name="message-circle" className="wa" /></span></td>
                <td className="muted">{c.end || '—'}</td><td className="muted">{c.setor || '—'}</td><td className="muted">{c.cidade || '—'}</td>
                <td className="muted num">{c.nasc ? isoToBR(c.nasc) : '—'}</td><td className="muted num">{u ? fmtDate(u) : 'Nenhuma'}</td>
                <td><div className="acts"><button className="icon-btn" onClick={() => openModal('cliente', { id: c.id })} aria-label={`Editar ${c.nome}`}><Icon name="pencil" /></button>
                  <ArmedButton label={`Excluir ${c.nome}`} onConfirm={() => { mut((s) => { s.clientes = s.clientes.filter((x) => x.id !== c.id); }); toast(`${c.nome} excluído`); }} /></div></td></tr>
            );
          }) : <tr><td colSpan={9} className="muted" style={{ textAlign: 'center', padding: 30 }}>{C.length ? 'Nenhum cliente com esses filtros.' : 'Nenhum cliente cadastrado. Adicione um cliente ou importe uma planilha.'}</td></tr>}
        </tbody></table></div>
        {pg.foot('cliente', 'clientes')}
      </div>
    </>
  );
}
