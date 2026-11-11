// Coleta: pedido pronto recebe código, espera um entregador aceitar e a loja confirma a coleta.
import { useState } from 'react';
import Icon from '../components/Icon';
import MapView from '../components/MapView';
import { ChatButton } from '../components/ChatWindow';
import { PageHead, Pill, Info } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';
import { confirmarColeta, codigoNaoConfere, simularAceite, simularChegada, chamarNovamente, usarEntregadorDaLoja } from '../store/actions';
import { coletaList, etaText, semAceite, STAGE_PILL } from '../domain/pedidos';
import { brl, fmtTime } from '../lib/format';

function Passos({ c }) {
  const ret = c.stage === 'retirada';
  const steps = ret ? ['Pedido pronto', 'Cliente no balcão', 'Retirada confirmada'] : ['Pedido pronto', 'Entregador aceitou', 'Entregador na loja', 'Coleta confirmada'];
  const idx = ret ? 1 : { buscando: 1, aceito: 2, chegou: 3 }[c.stage];
  return (
    <ol className="c-steps">
      {steps.map((s, k) => <li key={s} className={k < idx ? 'done' : k === idx ? 'now' : ''}><span>{k < idx ? <Icon name="check" /> : k + 1}</span>{s}</li>)}
    </ol>
  );
}

function Detalhe({ p, now }) {
  const c = p.coleta, ret = c.stage === 'retirada', d = c.driver, quem = ret ? 'cliente' : 'entregador';
  const buscando = c.stage === 'buscando', late = semAceite(p, now), podeConfirmar = !buscando;

  let bloco;
  if (ret) bloco = <Info icon="store">Pedido para <b>retirada no balcão</b>. O código foi enviado ao cliente. Ao confirmar, o pedido é marcado como Entregue.</Info>;
  else if (buscando) bloco = (
    <div className={`card card-pad busca ${late ? 'late' : ''}`}>
      <span className="busca-ico"><Icon name={late ? 'alert-triangle' : 'radar'} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{late ? 'Nenhum entregador aceitou ainda' : 'Buscando entregador'}</b>
        <p>{etaText(p, now)}</p>
        <p className="hint" style={{ marginTop: 4 }}>{late ? 'Chame novamente para oferecer o pedido a mais entregadores, ou use um entregador da sua loja.' : 'O pedido foi oferecido aos entregadores próximos. Assim que um aceitar, ele aparece aqui com a localização no mapa.'}</p>
        {late && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={() => chamarNovamente(p.num)}><Icon name="refresh-cw" /> Chamar novamente</button>
          <button className="btn btn-outline btn-sm" onClick={() => usarEntregadorDaLoja(p.num)}><Icon name="user-check" /> Usar entregador da loja</button>
        </div>}
      </div>
    </div>
  );
  else bloco = <>
    <div className="card driver"><span className="av"><Icon name="user" /></span>
      <div><b style={{ fontSize: 17, color: 'var(--ink)' }}>{d.nome}</b><div className="hint">{d.proprio ? 'Equipe da loja' : <>Moto · Placa {d.placa} · <Icon name="star" /> {d.nota}</>}</div></div>
      {!d.proprio && <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
        <button className="round-btn" onClick={() => toast(`Ligando para ${d.nome}...`)} aria-label="Ligar"><Icon name="phone" /></button>
        <ChatButton num={p.num} nome={d.nome} />
      </div>}
    </div>
    {!d.proprio && <MapView num={p.num} height={260} />}
  </>;

  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span className="ico-c lg"><Icon name="shopping-bag" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><b style={{ fontSize: 24, color: 'var(--ink)' }}>#{p.num}</b><Pill tone="p-purple" icon="package-check">Pronto</Pill></div>
          <div style={{ color: 'var(--sub)', display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, fontSize: 15 }}><Icon name="user" /> {p.cli}</div>
          <div style={{ color: 'var(--sub)', marginTop: 4, fontSize: 13 }}>{p.itens} · {brl(p.valor)}</div>
        </div>
        <Pill tone="p-gray" icon="clock">Pronto às {fmtTime(c.at)}</Pill>
      </div>
      <Passos c={c} />
      {bloco}
      <div className="card card-pad coleta-code-card">
        <div style={{ display: 'flex', gap: 14 }}><Icon name="shield-check" /><div><b style={{ fontSize: 17, color: 'var(--ink)' }}>Código de coleta</b><p className="hint" style={{ margin: '4px 0 0' }}>Gerado quando o pedido ficou pronto, às {fmtTime(c.at)}. {ret ? 'O cliente recebe' : 'O entregador que aceitar recebe'} o mesmo código no app.</p></div></div>
        <div className="code-show" aria-label={`Código de coleta ${c.code.split('').join(' ')}`}>{c.code.split('').map((x, i) => <span key={i}>{x}</span>)}</div>
        <p className="code-step">{buscando ? 'A coleta pode ser confirmada depois que um entregador aceitar o pedido.' : c.stage === 'aceito' ? `${d.nome} ainda está a caminho. Quando ele chegar, confira o código no celular dele e confirme.` : `Confira se o código no celular do ${quem} é igual a este e confirme.`}</p>
        {c.alerta && <div className="info err-box" style={{ margin: '0 0 12px' }}><Icon name="alert-triangle" /><span>Ocorrência registrada às {fmtTime(c.alerta)}: código não conferiu. Só libere o pedido para quem apresentar o código certo.</span></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-block" style={{ fontSize: 16, padding: 14 }} disabled={!podeConfirmar} onClick={() => confirmarColeta(p.num)}>
            <Icon name={podeConfirmar ? 'check' : 'hourglass'} /> {podeConfirmar ? `Código confere, confirmar ${ret ? 'retirada' : 'coleta'}` : 'Aguardando um entregador aceitar'}
          </button>
          {podeConfirmar && <button className="btn btn-outline btn-block" style={{ fontSize: 16, padding: 13 }} onClick={() => codigoNaoConfere(p.num)}><Icon name="x" /> Código não confere</button>}
        </div>
      </div>
      {!(ret || d?.proprio || c.stage === 'chegou') && (
        <div className="demo-note"><Icon name="flask-conical" />
          <div><b>Simulação:</b> o app do entregador ainda não existe, então o aceite acontece sozinho em alguns segundos e a chegada segue o tempo de viagem.
            <div style={{ marginTop: 8 }}>{buscando
              ? <button className="btn btn-outline btn-sm" onClick={() => simularAceite(p.num)}><Icon name="hand" /> Simular aceite agora</button>
              : <button className="btn btn-outline btn-sm" onClick={() => simularChegada(p.num)}><Icon name="map-pin" /> Simular chegada agora</button>}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Coleta() {
  const pedidos = useApp((s) => s.pedidos), now = useApp((s) => s.now), coletaSel = useApp((s) => s.ui.coletaSel);
  const [q, setQ] = useState('');
  const L = coletaList(pedidos);
  const sel = L.find((p) => p.num == coletaSel) || L[0];
  const qd = q.replace(/\D/g, '');
  const vis = L.filter((p) => !qd || String(p.num).includes(qd));
  const escolher = (num) => mut((s) => { s.ui.coletaSel = num; });

  return (
    <>
      <PageHead icon="package" variant="dark" title="Coleta" sub="Pedido pronto recebe um código e é oferecido aos entregadores. Quando um aceitar, acompanhe no mapa e confirme a coleta quando ele chegar." />
      {L.length ? (
        <div className="coleta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <label className="inp"><Icon name="search" /><input placeholder="Buscar por número do pedido..." id="colSearch" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <div id="colList" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {vis.length ? vis.map((p) => {
                const c = p.coleta, ret = c.stage === 'retirada', [pc, pi, pt] = STAGE_PILL[c.stage], late = semAceite(p, now);
                return (
                  <button key={p.num} className={`card c-item ${p.num === sel?.num ? 'on' : ''}`} onClick={() => escolher(p.num)}>
                    <span style={{ color: 'var(--ink)' }}><Icon name="shopping-bag" /></span>
                    <div className="c-main">
                      <h4>#{p.num} <Pill tone={ret ? 'p-blue' : 'p-orange'} icon={ret ? 'store' : 'package'} style={{ fontSize: 11 }}>{ret ? 'Retirada' : 'Coleta'}</Pill>{c.alerta && <Pill tone="p-red" icon="alert-triangle" style={{ fontSize: 11 }}>Ocorrência</Pill>}</h4>
                      <span className="code-chip num" aria-label="Código de coleta"><Icon name="shield-check" /> {c.code}</span>
                      <span className="cl"><Icon name="user" /> {p.cli}</span>
                      <span className="cl small">{ret ? <><Icon name="store" /> Cliente retira no balcão</> : c.driver ? <><Icon name="bike" /> {c.driver.nome}</> : <><Icon name="hourglass" /> Aguardando um entregador aceitar</>}</span>
                    </div>
                    <div className="c-side"><Pill tone={late ? 'p-red' : pc} icon={late ? 'alert-triangle' : pi} style={{ alignSelf: 'flex-start' }}>{late ? 'Sem aceite' : pt}</Pill><small>{etaText(p, now)}</small></div>
                    <Icon name="chevron-right" />
                  </button>
                );
              }) : <p className="hint">Nenhum pedido pronto com esse número.</p>}
            </div>
          </div>
          {sel && <Detalhe key={sel.num} p={sel} now={now} />}
        </div>
      ) : (
        <div className="card empty"><span className="ico-c lg green"><Icon name="check" /></span><h3>Nenhuma coleta pendente</h3><p>Quando um pedido for movido para <b>Pedido Pronto</b> no Gestor de pedidos, ele aparece aqui com o código de coleta.</p>
          <a className="btn btn-outline" href="#painel-vendas" style={{ marginTop: 14 }}><Icon name="bar-chart-3" /> Abrir Gestor de pedidos</a></div>
      )}
    </>
  );
}
