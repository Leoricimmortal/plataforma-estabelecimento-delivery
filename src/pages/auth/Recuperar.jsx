import { useState } from 'react';
import Icon from '../../components/Icon';
import { Logo } from './AuthShell';
import { recuperarSenha } from '../../store/auth';

const Envelope = () => (
  <svg viewBox="0 0 420 340" aria-hidden="true">
    <path d="M70 120C40 40 150 0 250 20s170 60 150 150-60 150-170 160S30 280 50 210z" fill="#ffe7d6" />
    <g stroke="#ff6a13" strokeWidth="8" strokeLinecap="round"><path d="M330 40v36M368 62l-24 26M372 106h-34" /></g>
    <path d="M110 150l80-45h120l60 45v130H110z" fill="#101b33" />
    <rect x="165" y="70" width="170" height="120" rx="12" fill="#ff6a13" />
    <rect x="228" y="105" width="44" height="34" rx="6" fill="#fff" /><path d="M236 105v-9a14 14 0 0 1 28 0v9" fill="none" stroke="#fff" strokeWidth="7" />
    <rect x="198" y="152" width="104" height="24" rx="12" fill="#fff" /><g fill="#ff6a13"><circle cx="218" cy="164" r="5" /><circle cx="236" cy="164" r="5" /><circle cx="254" cy="164" r="5" /><circle cx="272" cy="164" r="5" /><circle cx="290" cy="164" r="5" /></g>
    <path d="M110 150l140 90 140-90v130a12 12 0 0 1-12 12H122a12 12 0 0 1-12-12z" fill="#f6f7ff" stroke="#dfe3f5" strokeWidth="3" />
    <path d="M110 290l110-80M390 290L280 210" stroke="#e1e5f6" strokeWidth="3" />
  </svg>
);

export default function Recuperar() {
  const [email, setEmail] = useState(''), [erro, setErro] = useState(''), [ok, setOk] = useState(false), [busy, setBusy] = useState(false);
  const enviar = async (e) => {
    e.preventDefault(); if (busy) return;
    setBusy(true); setErro('');
    const r = await recuperarSenha(email);
    setBusy(false);
    if (r.ok) setOk(true); else setErro(r.msg);
  };
  return (
    <div className="au au-rec">
      <header className="au-rec-top"><Logo light /><a href="#login"><Icon name="arrow-left" /> Voltar para o login</a></header>
      <main className="au-rec-card">
        <form onSubmit={enviar} noValidate>
          <div className="au-rec-head">
            <span className="au-lock"><Icon name="lock" /></span>
            <div><h2>Redefinir Senha</h2><p>Informe seu e-mail cadastrado para receber as instruções de redefinição de senha.</p></div>
          </div>
          <label className="au-field light"><Icon name="mail" /><input type="email" placeholder="E-mail da sua conta" value={email} onChange={(e) => { setEmail(e.target.value); setOk(false); }} autoComplete="email" autoFocus /></label>
          {erro && <small className="au-err" role="alert">{erro}</small>}
          {ok && <div className="au-alert ok" role="status"><Icon name="check-circle-2" />Se este e-mail estiver cadastrado, as instruções chegarão em instantes.</div>}
          <button className="au-btn" disabled={busy}><Icon name="send" /> {busy ? 'Enviando…' : 'Enviar Instruções'}</button>
          <div className="au-or light"><span>ou</span></div>
          <a className="au-back" href="#login"><Icon name="arrow-left" /> Voltar para o login</a>
        </form>
        <div className="au-rec-art"><Envelope /></div>
        <div className="au-info"><span><Icon name="info" /></span><div><b>Você receberá um e-mail com as instruções</b><small>Verifique sua caixa de entrada e também a pasta de spam.</small></div></div>
      </main>
    </div>
  );
}
