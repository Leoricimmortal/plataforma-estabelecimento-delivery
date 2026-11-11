// Detalhes de um pedido: dados, mapa do entregador, etapa, cancelar e avançar.
import { useState } from 'react';
import Icon from '../components/Icon';
import MapView from '../components/MapView';
import { ChatButton } from '../components/ChatWindow';
import { ModalHead, StPill, Info } from '../components/ui';
import { useApp, closeModal } from '../store/useApp';
import { mudarStatus, avancarPedido } from '../store/actions';
import { findPedido, FLOW, ST, etaText } from '../domain/pedidos';
import { brl, fmtDate, fmtTime, DAY } from '../lib/format';

export default function PedidoModal({ num }) {
  const p = useApp((s) => findPedido(s, num));
  const now = useApp((s) => s.now);
  const [armed, setArmed] = useState(false);
  if (!p) return <div className="modal"><p>Pedido não encontrado.</p></div>;

  const next = FLOW[FLOW.indexOf(p.status) + 1], inKan = now - p.created < DAY, ret = p.modo === 'Retirada';
  const ativo = inKan && p.status !== 'cancelado';
  const acomp = p.status === 'rota' ? p.rota : p.coleta;
  const mostraMapa = (p.status === 'rota' && p.rota) || (p.status === 'pronto' && ['aceito', 'chegou'].includes(p.coleta?.stage) && !p.coleta.driver.proprio);

  return (
    <div className="modal wide">
      <ModalHead icon="receipt" title={`Pedido #${p.num}`}><StPill status={p.status} /></ModalHead>
      <p className="lead">{fmtDate(p.created)} às {fmtTime(p.created)} · ID {p.id}{inKan ? '' : ' · fora do Gestor de pedidos (mais de 24h)'}</p>
      <div className="resumo" style={{ marginTop: 0 }}>
        <dl>
          <dt>Cliente</dt><dd>{p.cli}</dd><dt>Telefone</dt><dd>{p.tel}</dd>
          <dt>{ret ? 'Retirada' : 'Entrega'}</dt><dd>{p.end}{ret ? '' : `, ${p.setor} · ${p.cidade}`}</dd>
          <dt>Itens</dt><dd>{p.itens}</dd><dt>Pagamento</dt><dd>{p.pg}</dd><dt>Total</dt><dd>{brl(p.valor)}</dd>
        </dl>
      </div>

      {mostraMapa ? (
        <div className="field" style={{ marginTop: 16 }}>
          <div className="map-label">
            <span className="lab">{p.status === 'rota' ? 'Acompanhar entrega' : 'Entregador indo até a loja'} · {acomp.driver.nome}</span>
            {!acomp.driver.proprio && <ChatButton num={p.num} nome={acomp.driver.nome} className="btn btn-outline btn-sm"> Conversar</ChatButton>}
          </div>
          <MapView num={p.num} height={230} />
        </div>
      ) : p.status === 'pronto' && p.coleta?.stage === 'buscando' ? (
        <Info icon="radar" style={{ marginTop: 16 }}>{etaText(p, now)}</Info>
      ) : null}

      {ativo && (
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="pedSt">Etapa do pedido</label>
          <select className="sel" id="pedSt" value={p.status} onChange={(e) => { mudarStatus(p.num, e.target.value); closeModal(); }}>
            {FLOW.map((s) => <option key={s} value={s}>{ST[s][0]}</option>)}
          </select>
        </div>
      )}

      <div className="panel-foot">
        {ativo && p.status !== 'entregue' ? (
          <button type="button" className={`btn btn-outline ${armed ? 'armed' : ''}`} style={{ color: 'var(--red)', borderColor: '#f3b4b4' }}
            onClick={() => { if (!armed) { setArmed(true); return; } mudarStatus(p.num, 'cancelado'); closeModal(); }}>
            <Icon name={armed ? 'alert-triangle' : 'x'} /> {armed ? 'Confirmar cancelamento' : 'Cancelar pedido'}
          </button>
        ) : <button type="button" className="btn btn-outline" onClick={closeModal}>Fechar</button>}
        {ativo && next ? (
          <button type="button" className="btn btn-primary" onClick={() => avancarPedido(p.num)}>
            {p.status === 'pronto' ? <><Icon name="shield-check" /> Confirmar coleta</> : <><Icon name="arrow-right" /> Mover para {ST[next][0]}</>}
          </button>
        ) : <button type="button" className="btn btn-primary" onClick={closeModal}>OK</button>}
      </div>
    </div>
  );
}
