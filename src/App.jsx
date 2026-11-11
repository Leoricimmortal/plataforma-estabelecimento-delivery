import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Toast from './components/Toast';
import ModalHost from './components/ModalHost';
import ChatWindow from './components/ChatWindow';
import ErrorBoundary from './components/ErrorBoundary';
import { useRoute } from './hooks/useRoute';
import { useApp, mut, closeModal } from './store/useApp';
import { tick } from './store/actions';
import { useAuth } from './store/auth';
import NovaSenha from './pages/auth/NovaSenha';
import AuthGate from './pages/auth/AuthGate';

import VisaoGeral from './pages/VisaoGeral';
import DetalhesLoja from './pages/DetalhesLoja';
import DetalhesEntrega from './pages/DetalhesEntrega';
import Pagamento from './pages/Pagamento';
import Coleta from './pages/Coleta';
import PainelVendas from './pages/PainelVendas';
import Produtos from './pages/Produtos';
import Kits from './pages/Kits';
import Complementos from './pages/Complementos';
import Clientes from './pages/Clientes';
import Historico from './pages/Historico';
import Lucro from './pages/Lucro';
import Cupons from './pages/Cupons';
import Fidelidade from './pages/Fidelidade';
import Usuarios from './pages/Usuarios';
import Alertas from './pages/Alertas';
import Impressao from './pages/Impressao';

const PAGES = {
  'visao-geral': VisaoGeral, 'detalhes-loja': DetalhesLoja, 'detalhes-entrega': DetalhesEntrega, pagamento: Pagamento,
  coleta: Coleta, 'painel-vendas': PainelVendas, produtos: Produtos, kits: Kits, complementos: Complementos,
  clientes: Clientes, historico: Historico, lucro: Lucro, cupons: Cupons, fidelidade: Fidelidade,
  usuarios: Usuarios, alertas: Alertas, impressao: Impressao,
};

/** Sem sessão: telas de acesso. Com sessão: o painel. */
export default function App() {
  const { user, pronto, recuperando } = useAuth();
  if (!pronto) return null; // aguardando o Supabase informar se há sessão
  if (recuperando) return <NovaSenha />;
  return user ? <Painel /> : <AuthGate />;
}

function Painel() {
  const route = useRoute(Object.keys(PAGES), 'visao-geral');
  const navOpen = useApp((s) => s.ui.navOpen);
  const Page = PAGES[route];

  // Relógio da simulação: aceite do entregador, deslocamento no mapa e mensagens automáticas.
  useEffect(() => { const t = setInterval(tick, 2000); return () => clearInterval(t); }, []);

  // Ao trocar de tela: fecha o menu no celular e volta ao topo.
  useEffect(() => { mut((s) => { s.ui.navOpen = false; }); document.querySelector('.main')?.scrollTo(0, 0); window.scrollTo(0, 0); }, [route]);

  // Esc fecha a janela aberta e o menu.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !e.target.closest?.('.chat-win')) { closeModal(); mut((s) => { s.ui.navOpen = false; }); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className={`app ${navOpen ? 'nav-open' : ''}`} id="app">
        <Sidebar route={route} />
        <div className="scrim" onClick={() => mut((s) => { s.ui.navOpen = false; })} />
        <div className="main">
          <Topbar />
          <main className="view" id="view"><ErrorBoundary key={route}><Page /></ErrorBoundary></main>
        </div>
      </div>
      <ModalHost />
      <ChatWindow />
      <Toast />
    </>
  );
}
