import { useState } from 'react';
import Icon from './Icon';
import { Switch } from './ui';
import { BrandMark } from './art';
import { useApp, mut } from '../store/useApp';
import { alternarLoja } from '../store/actions';
import { lojaSituacao } from '../lib/hours';
import { coletaList } from '../domain/pedidos';

export const MENU = [
  { id: 'visao-geral', label: 'Visão Geral', icon: 'home' },
  { label: 'Minha Loja', icon: 'store', children: [['detalhes-loja', 'Detalhes da Loja'], ['detalhes-entrega', 'Detalhes da Entrega'], ['pagamento', 'Formas de Pagamento']] },
  { label: 'Painel de Vendas', icon: 'bar-chart-3', children: [['coleta', 'Coleta'], ['painel-vendas', 'Gestor de pedidos']] },
  { label: 'Catálogo', icon: 'package', children: [['produtos', 'Produtos e Catálogo'], ['kits', 'Cardápio de Kits'], ['complementos', 'Complementos']] },
  { label: 'Clientes', icon: 'users', children: [['clientes', 'Lista de clientes']] },
  { label: 'Pedidos e Ganhos', icon: 'file-text', children: [['historico', 'Histórico de pedidos'], ['lucro', 'Lucro']] },
  { label: 'Marketing', icon: 'megaphone', children: [['cupons', 'Cupons'], ['fidelidade', 'Fidelidade']] },
  { label: 'Configurações', icon: 'settings', children: [['usuarios', 'Usuários'], ['alertas', 'Alertas de Som'], ['impressao', 'Impressão']] },
];

export default function Sidebar({ route }) {
  const [abertos, setAbertos] = useState(() => new Set());
  const nColeta = useApp((s) => coletaList(s.pedidos).length);
  const hours = useApp((s) => s.hours), override = useApp((s) => s.override), now = useApp((s) => s.now);
  const loja = useApp((s) => s.loja), logo = useApp((s) => s.logo);
  const st = lojaSituacao(hours, override, now);
  const fechar = () => mut((s) => { s.ui.navOpen = false; });

  return (
    <aside className="sidebar" id="sidebar">
      <div className="brand"><BrandMark /><div><b>Chegou</b><small>DELIVERY</small></div></div>
      <nav className="nav" aria-label="Menu principal">
        {MENU.map((m, gi) => {
          if (!m.children) return <a key={m.id} className={`nav-item ${route === m.id ? 'active' : ''}`} href={`#${m.id}`} onClick={fechar}><Icon name={m.icon} />{m.label}</a>;
          const has = m.children.some((c) => c[0] === route), open = has || abertos.has(gi);
          return (
            <div key={m.label} className={`nav-group ${open ? 'open' : ''} ${has ? 'has-active' : ''}`}>
              <button className="nav-item" aria-expanded={open} onClick={() => setAbertos((o) => { const n = new Set(o); n.has(gi) ? n.delete(gi) : n.add(gi); return n; })}>
                <Icon name={m.icon} />{m.label}<Icon name="chevron-down" className="chev" />
              </button>
              <div className="nav-sub">
                {m.children.map(([id, label]) => (
                  <a key={id} href={`#${id}`} className={route === id ? 'active' : ''} onClick={fechar}>
                    {label}{id === 'coleta' && nColeta > 0 && <span className="nav-badge" aria-label={`${nColeta} aguardando`}>{nColeta}</span>}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="store-box">
        <div className={`store-status ${st.open ? '' : 'closed'} ${st.manual ? 'manual' : ''}`}>
          <span className="dot" /><strong>{st.titulo}</strong>
          <Switch checked={st.open} onChange={alternarLoja} label="Abrir ou fechar a loja agora" />
          <p>{st.hint}</p>
        </div>
        <a className="store-card" href="#detalhes-loja">
          <span className="logo">{logo ? <img src={logo} alt="Logo da loja" /> : <Icon name="store" />}</span>
          <span><b>{loja.nome || 'Minha loja'}</b><small>{loja.tipo}</small></span>
          <Icon name="chevron-right" />
        </a>
      </div>
    </aside>
  );
}
