import { useState } from 'react';
import Icon from '../../components/Icon';
import { Logo, AuthField } from './AuthShell';
import { definirNovaSenha, SENHA_MIN } from '../../store/auth';

/** Aparece quando o usuário abre o link de redefinição recebido por e-mail. */
export default function NovaSenha() {
  const [senha, setSenha] = useState(''), [conf, setConf] = useState(''), [erro, setErro] = useState(''), [busy, setBusy] = useState(false);
  const enviar = async (e) => {
    e.preventDefault(); if (busy) return;
    if (senha.length < SENHA_MIN) return setErro(`Use pelo menos ${SENHA_MIN} caracteres.`);
    if (senha !== conf) return setErro('As senhas não conferem.');
    setBusy(true); setErro('');
    const r = await definirNovaSenha(senha);
    if (!r.ok) { setErro(r.msg); setBusy(false); }
  };
  return (
    <div className="au au-login">
      <section className="au-hero"><Logo size="lg" /></section>
      <form className="au-card au-card-sm" onSubmit={enviar} noValidate>
        <h2>Nova senha</h2>
        <p className="au-sub">Escolha uma nova senha para sua conta</p>
        <AuthField icon="lock" type="password" placeholder="Nova senha" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
        <AuthField icon="lock" type="password" placeholder="Confirmar nova senha" autoComplete="new-password" value={conf} onChange={(e) => setConf(e.target.value)} />
        {erro && <div className="au-alert" role="alert"><Icon name="alert-triangle" />{erro}</div>}
        <button className="au-btn" disabled={busy}>{busy ? 'Salvando…' : <>Salvar senha <Icon name="arrow-right" /></>}</button>
      </form>
    </div>
  );
}
