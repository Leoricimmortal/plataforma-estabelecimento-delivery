import { useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, Switch, Info, exigir } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';
import { uid } from '../lib/format';

const PC = { Administrador: 'p-orange', Gerente: 'p-blue', Operador: 'p-purple' };
const PERMS = ['Ver pedidos', 'Gerenciar pedidos', 'Editar catálogo', 'Ver relatórios financeiros', 'Gerenciar cupons', 'Gerenciar usuários', 'Configurações da loja'];
const VAZIO = { nome: '', email: '', login: '', senha: '', perfil: '', ativo: true, perms: PERMS.map((_, i) => i < 3) };

export default function Usuarios() {
  const users = useApp((s) => s.users), open = useApp((s) => s.ui.panels.usuarios), tab = useApp((s) => s.ui.userTab);
  const [fl, setFl] = useState({ q: '', perfil: '', status: '' });
  const [f, setF] = useState(VAZIO);
  const [verSenha, setVerSenha] = useState(false);
  const setPanel = (on, t) => mut((s) => { s.ui.panels.usuarios = on; if (t) s.ui.userTab = t; });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const q = fl.q.toLowerCase();
  const list = users.filter((u) => (!q || (u.n + u.e).toLowerCase().includes(q)) && (!fl.perfil || u.p === fl.perfil) && (!fl.status || u.s === fl.status));

  const salvar = (e) => {
    e.preventDefault();
    if (tab !== 'dados') { setPanel(true, 'dados'); toast('Preencha os dados do usuário'); return; }
    if (!exigir([[f.nome, 'uNome'], [f.email, 'uEmail'], [f.login, 'uLogin'], [f.senha, 'uSenha'], [f.perfil, 'uPerfil']])) return;
    if (f.senha.length < 8) { toast('A senha precisa ter pelo menos 8 caracteres'); document.getElementById('uSenha').focus(); return; }
    mut((s) => { s.users.push({ id: uid('u'), n: f.nome.trim(), e: f.email.trim(), p: f.perfil, s: f.ativo ? 'Ativo' : 'Inativo', a: 'Nunca acessou' }); });
    setF(VAZIO); toast('Usuário salvo');
  };

  return (
    <>
      <PageHead icon="users" title="Cadastro de Usuários" sub="Gerencie os usuários que têm acesso ao painel administrativo da sua loja."
        actions={<><button className="btn btn-outline" onClick={() => setPanel(true, 'perm')}><Icon name="shield" /> Permissões e Acessos</button><button className="btn btn-primary" onClick={() => setPanel(true, 'dados')}><Icon name="plus" /> Novo Usuário</button></>} />
      <div className={`with-panel ${open ? '' : 'closed'}`}>
        <div style={{ minWidth: 0 }}>
          <div className="filters">
            <label className="inp grow"><Icon name="search" /><input placeholder="Buscar por nome, e-mail ou login..." value={fl.q} onChange={(e) => setFl({ ...fl, q: e.target.value })} /></label>
            <select className="sel" value={fl.perfil} onChange={(e) => setFl({ ...fl, perfil: e.target.value })}><option value="">Todos os perfis</option><option>Administrador</option><option>Gerente</option><option>Operador</option></select>
            <select className="sel" value={fl.status} onChange={(e) => setFl({ ...fl, status: e.target.value })}><option value="">Todos os status</option><option>Ativo</option><option>Inativo</option></select>
          </div>
          <div className="card tbl-wrap"><table className="tbl" style={{ fontSize: 14 }}><thead><tr><th>Usuário</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Último acesso</th><th>Ações</th></tr></thead><tbody>
            {list.length ? list.map((u) => (
              <tr key={u.id}><td><div className="cell-user"><span className="av-sm"><Icon name="user" /></span><b>{u.n}</b></div></td><td>{u.e}</td><td><span className={`pill ${PC[u.p]}`}>{u.p}</span></td>
                <td><span className={`pill p-dot ${u.s === 'Ativo' ? 'p-green' : 'p-gray'}`}>{u.s}</span></td><td>{u.a}</td>
                <td><div className="acts"><button className="icon-btn" aria-label="Editar"><Icon name="pencil" /></button><button className="icon-btn" aria-label="Mais opções"><Icon name="more-vertical" /></button></div></td></tr>
            )) : <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 30 }}>Nenhum usuário encontrado com esses filtros.</td></tr>}
          </tbody></table></div>
          <div className="tbl-foot"><span>Mostrando {list.length ? 1 : 0} a {list.length} de {list.length} usuários</span></div>
        </div>
        {open && (
          <form className="card panel" id="userForm" noValidate onSubmit={salvar}>
            <div className="panel-h"><Icon name="user-plus" /><h2>Novo Usuário</h2><button type="button" className="icon-btn x" onClick={() => setPanel(false)} aria-label="Fechar"><Icon name="x" /></button></div>
            <div className="tabs">
              <button type="button" className={`tab ${tab === 'dados' ? 'on' : ''}`} onClick={() => setPanel(true, 'dados')}><Icon name="user" /> Dados do Usuário</button>
              <button type="button" className={`tab ${tab === 'perm' ? 'on' : ''}`} onClick={() => setPanel(true, 'perm')}><Icon name="shield" /> Permissões</button>
            </div>
            <div className="form-stack" hidden={tab !== 'dados'}>
              <div className="field"><label htmlFor="uNome">Nome Completo <span className="req">*</span></label><div className="inp"><input id="uNome" value={f.nome} onChange={set('nome')} placeholder="Digite o nome completo" required /></div></div>
              <div className="field"><label htmlFor="uEmail">E-mail <span className="req">*</span></label><div className="inp"><input id="uEmail" type="email" value={f.email} onChange={set('email')} placeholder="usuario@exemplo.com" required /></div></div>
              <div className="field"><label htmlFor="uLogin">Login <span className="req">*</span></label><div className="inp"><input id="uLogin" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value.replace(/\s/g, '') })} placeholder="Escolha um login (sem espaços)" required /></div></div>
              <div className="field"><label htmlFor="uSenha">Senha <span className="req">*</span></label><div className="inp"><input id="uSenha" type={verSenha ? 'text' : 'password'} value={f.senha} onChange={set('senha')} placeholder="Mínimo 8 caracteres" minLength={8} required /><button type="button" className="icon-btn" onClick={() => setVerSenha(!verSenha)} aria-label={verSenha ? 'Esconder senha' : 'Mostrar senha'}><Icon name={verSenha ? 'eye-off' : 'eye'} /></button></div></div>
              <div className="field"><label htmlFor="uPerfil">Perfil de Acesso <span className="req">*</span></label><select className="sel" id="uPerfil" value={f.perfil} onChange={set('perfil')} required><option value="">Selecione o perfil</option><option>Administrador</option><option>Gerente</option><option>Operador</option></select></div>
              <div className="field"><span className="lab">Status</span><label style={{ display: 'flex', gap: 12, alignItems: 'center', fontWeight: 600, color: 'var(--ink)' }}><Switch variant="green" style={{ margin: 0, width: 50, height: 28 }} checked={f.ativo} onChange={(v) => setF({ ...f, ativo: v })} label="Usuário ativo" />Usuário ativo</label></div>
              <Info>O usuário receberá um e-mail com as informações de acesso.</Info>
            </div>
            <div className="form-stack" hidden={tab !== 'perm'}>
              <p className="hint" style={{ margin: 0 }}>Escolha o que este usuário pode fazer no painel.</p>
              {PERMS.map((p, i) => <label key={p} className="radio"><input type="checkbox" checked={f.perms[i]} onChange={(e) => setF({ ...f, perms: f.perms.map((x, j) => (j === i ? e.target.checked : x)) })} /><div><b>{p}</b></div></label>)}
            </div>
            <div className="panel-foot"><button type="button" className="btn btn-outline" onClick={() => setPanel(false)}>Cancelar</button><button className="btn btn-primary"><Icon name="save" /> Salvar Usuário</button></div>
          </form>
        )}
      </div>
    </>
  );
}
