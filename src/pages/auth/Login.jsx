import { useState } from 'react';
import Icon from '../../components/Icon';
import { Logo, AuthField } from './AuthShell';
import { entrar } from '../../store/auth';

export default function Login() {
  const [email, setEmail] = useState(''), [senha, setSenha] = useState('');
  const [erro, setErro] = useState(''), [busy, setBusy] = useState(false);

  const enviar = async (e) => {
    e.preventDefault(); if (busy) return;
    setBusy(true); setErro('');
    const r = await entrar(email, senha);
    if (!r.ok) { setErro(r.msg); setBusy(false); }
  };

  return (
    <div className="au au-login">
      <section className="au-hero">
        <Logo size="lg" />
        <h1>Sua loja sempre<br />conectada com<br />seus <em>clientes.</em></h1>
        <p>Gerencie seus pedidos, acompanhe as entregas e ofereça uma experiência ainda melhor.</p>
      </section>
      <form className="au-card au-card-sm" onSubmit={enviar} noValidate>
        <div className="au-card-logo"><Logo size="sm" /></div>
        <h2>Bem-vindo!</h2>
        <p className="au-sub">Faça login para continuar</p>
        <AuthField icon="mail" type="email" placeholder="E-mail" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <AuthField icon="lock" type="password" placeholder="Senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <div className="au-row"><a href="#recuperar">Esqueci minha senha</a></div>
        {erro && <div className="au-alert" role="alert"><Icon name="alert-triangle" />{erro}</div>}
        <button className="au-btn" disabled={busy}>{busy ? 'Entrando…' : <>Entrar <Icon name="arrow-right" /></>}</button>
        <div className="au-or"><span>Ainda não tem uma conta? <a href="#cadastro">Cadastrar</a></span></div>
      </form>
    </div>
  );
}
