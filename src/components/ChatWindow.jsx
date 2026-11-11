// Janela de conversa com o entregador (flutuante, continua aberta ao trocar de tela).
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useApp } from '../store/useApp';
import { alternarChat, fecharChat, enviarChat, abrirChat } from '../store/actions';
import { QUICK, chatAtivo } from '../domain/chat';
import { driverOf, etaText, ST } from '../domain/pedidos';
import { fmtTime, fmtDate } from '../lib/format';

export default function ChatWindow() {
  const num = useApp((s) => s.chatOpen);
  const min = useApp((s) => s.chatMin);
  const p = useApp((s) => s.pedidos.find((x) => x.num == s.chatOpen));
  const ch = useApp((s) => s.chats[s.chatOpen]) || { msgs: [], unread: 0, typing: false };
  const now = useApp((s) => s.now);
  const [texto, setTexto] = useState('');
  const body = useRef(null), input = useRef(null);

  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight; }, [ch.msgs.length, ch.typing, min, num]);
  useEffect(() => { if (num && !min) setTimeout(() => input.current?.focus(), 30); }, [num, min]);
  if (!num) return null;

  const d = driverOf(p), ativo = chatAtivo(p), fase = p?.status === 'rota' ? 'rota' : 'coleta';
  const enviar = (t) => { enviarChat(t); setTexto(''); input.current?.focus(); };

  return (
    <section className={`chat-win ${min ? 'min' : ''}`} role="dialog" aria-label={`Chat com ${d?.nome || 'entregador'}, pedido ${num}`}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); fecharChat(); } }}>
      <header className="chat-h" onClick={alternarChat} title={min ? 'Abrir conversa' : 'Minimizar conversa'}>
        <span className="av-sm chat-av"><Icon name="user" /></span>
        <div className="chat-who"><b>{d?.nome || 'Entregador'}</b><small>Pedido #{num} · {ativo ? etaText(p, now) : p ? ST[p.status][0] : ''}</small></div>
        {min && ch.unread > 0 && <span className="chat-badge">{ch.unread}</span>}
        <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); alternarChat(); }} aria-label={min ? 'Abrir conversa' : 'Minimizar conversa'}><Icon name={min ? 'chevron-up' : 'chevron-down'} /></button>
        <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); fecharChat(); }} aria-label="Fechar conversa"><Icon name="x" /></button>
      </header>
      {!min && (
        <>
          <div className="chat-body" ref={body} aria-live="polite">
            {!ch.msgs.length && <p className="chat-empty">Nenhuma mensagem ainda. Escreva para {d?.nome || 'o entregador'} ou use uma resposta rápida.</p>}
            {ch.msgs.map((m, i) => (
              <div key={i} style={{ display: 'contents' }}>
                {i > 0 && fmtDate(m.at) !== fmtDate(ch.msgs[i - 1].at) && <p className="chat-day">{fmtDate(m.at)}</p>}
                {m.from === 'sys' ? <p className="chat-sys">{m.text}</p> : (
                  <div className={`msg ${m.from === 'loja' ? 'me' : 'them'}`}><p>{m.text}</p><time>{fmtTime(m.at)}</time></div>
                )}
              </div>
            ))}
            {ch.typing && <div className="msg them typing" aria-label={`${d?.nome || ''} está digitando`}><p><i /><i /><i /></p></div>}
          </div>
          {ativo ? (
            <>
              <div className="chat-quick">{QUICK[fase].map((q) => <button key={q} type="button" className="chip-q" onClick={() => enviar(q)}>{q}</button>)}</div>
              <form className="chat-form" autoComplete="off" onSubmit={(e) => { e.preventDefault(); if (texto.trim()) enviar(texto); }}>
                <input id="chatInput" ref={input} maxLength={300} placeholder="Escreva uma mensagem..." aria-label={`Mensagem para ${d?.nome || 'o entregador'}`} value={texto} onChange={(e) => setTexto(e.target.value)} />
                <button className="btn btn-primary" aria-label="Enviar mensagem"><Icon name="send" /></button>
              </form>
            </>
          ) : (
            <p className="chat-closed"><Icon name="lock" /> Conversa encerrada: o pedido está {p ? ST[p.status][0].toLowerCase() : 'finalizado'}.</p>
          )}
          <p className="chat-sim">Simulação: respostas automáticas até o app do entregador existir.</p>
        </>
      )}
    </section>
  );
}

/** Botão de balão com contador de não lidas. */
export function ChatButton({ num, nome, children, className = 'round-btn' }) {
  const unread = useApp((s) => s.chats[num]?.unread || 0);
  return (
    <button type="button" className={`${className} has-badge`} onClick={() => abrirChat(num)} aria-label={`Conversar com ${nome}`}>
      <Icon name="message-square" />{children}
      {unread > 0 && <span className="chat-badge">{unread}</span>}
    </button>
  );
}
