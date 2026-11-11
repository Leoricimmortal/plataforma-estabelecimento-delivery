import Icon from './Icon';
import { mut, toast } from '../store/useApp';
import { useAuth, sair } from '../store/auth';

export default function Topbar() {
  const user = useAuth((st) => st.user);
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={() => mut((s) => { s.ui.navOpen = true; })} aria-label="Abrir menu"><Icon name="menu" /></button>
      <div className="user">
        <button className="icon-btn" aria-label="Notificações" onClick={() => toast('Sem notificações novas')}><Icon name="bell" /><span className="badge-dot">3</span></button>
        <span className="avatar"><Icon name="user" /></span>
        <div><b>{(user?.nome || '').split(' ')[0]}</b><small>Administrador</small></div>
        <button className="icon-btn" aria-label="Sair" title="Sair" onClick={sair}><Icon name="log-out" /></button>
      </div>
    </header>
  );
}
