import { useState } from 'react';
import Icon from '../../components/Icon';
import { Logo, AuthField } from './AuthShell';
import { cadastrar, emailValido, SENHA_MIN } from '../../store/auth';
import { maskCnpj, cnpjValido, maskTel } from '../../lib/format';

const VAZIO = { empresa: '', cnpj: '', nome: '', email: '', tel: '', senha: '', conf: '', aceito: false };

export default function Cadastro() {
  const [f, setF] = useState(VAZIO), [conferir, setConferir] = useState(false), [err, setErr] = useState({}), [busy, setBusy] = useState(false);
  const set = (k, v) => { setF((o) => ({ ...o, [k]: v })); setErr((o) => ({ ...o, [k]: '' })); };

  const validar = () => {
    const e = {};
    if (f.empresa.trim().length < 2) e.empresa = 'Informe o nome da empresa.';
    if (!cnpjValido(f.cnpj)) e.cnpj = 'CNPJ inválido.';
    if (f.nome.trim().length < 2) e.nome = 'Informe o nome do responsável.';
    if (!emailValido(f.email.trim())) e.email = 'Informe um e-mail válido.';
    if (f.tel.replace(/\D/g, '').length < 10) e.tel = 'Informe o telefone com DDD.';
    if (f.senha.length < SENHA_MIN) e.senha = `Use pelo menos ${SENHA_MIN} caracteres.`;
    if (f.conf !== f.senha) e.conf = 'As senhas não conferem.';
    if (!f.aceito) e.aceito = 'Aceite os termos para continuar.';
    return e;
  };

  const enviar = async (ev) => {
    ev.preventDefault(); if (busy) return;
    const e = validar(); setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const r = await cadastrar({ empresa: f.empresa, cnpj: f.cnpj, nome: f.nome, email: f.email, tel: f.tel, senha: f.senha });
    if (!r.ok) { setErr({ email: r.msg }); setBusy(false); } else if (r.confirmar) setConferir(true);
  };

  if (conferir) {
    return (
      <div className="au au-login">
        <section className="au-hero"><Logo size="lg" /></section>
        <div className="au-card au-card-sm">
          <h2>Confirme seu e-mail</h2>
          <p className="au-sub">Enviamos um link para <b>{f.email}</b>. Clique nele para ativar a conta e depois faça login.</p>
          <a className="au-btn" href="#login" style={{ color: '#fff' }}>Ir para o login <Icon name="arrow-right" /></a>
        </div>
      </div>
    );
  }

  return (
    <div className="au au-cad">
      <section className="au-hero">
        <Logo size="lg" />
        <h1>Cadastre sua loja<br />e comece a vender<br />com <em>mais alcance!</em></h1>
        <p>Entregas rápidas, clientes satisfeitos e seu negócio ainda mais forte.</p>
        <ul className="au-feats">
          <li><span><Icon name="zap" /></span><div><b>Entregas rápidas</b><small>Sua loja sempre em movimento.</small></div></li>
          <li><span><Icon name="bar-chart-3" /></span><div><b>Mais vendas</b><small>Alcance mais clientes.</small></div></li>
          <li><span><Icon name="shield-check" /></span><div><b>Seguro e Confiável</b><small>Seu negócio protegido.</small></div></li>
        </ul>
      </section>
      <form className="au-card" onSubmit={enviar} noValidate>
        <h2>Criar Conta</h2>
        <p className="au-sub">Preencha os dados da sua empresa para começar</p>
        <div className="au-grid2">
          <AuthField icon="store" placeholder="Nome da sua empresa" value={f.empresa} onChange={(e) => set('empresa', e.target.value)} error={err.empresa} autoFocus />
          <AuthField icon="building-2" placeholder="CNPJ da empresa" inputMode="numeric" value={f.cnpj} onChange={(e) => set('cnpj', maskCnpj(e.target.value))} error={err.cnpj} hint="00.000.000/0001-00" />
        </div>
        <AuthField icon="user" placeholder="Nome do responsável" value={f.nome} onChange={(e) => set('nome', e.target.value)} error={err.nome} />
        <AuthField icon="mail" type="email" placeholder="E-mail da empresa" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} error={err.email} />
        <div className={`au-field-wrap ${err.tel ? 'has-err' : ''}`}>
          <div className="au-field au-tel">
            <Icon name="phone" /><span className="au-ddi">+55</span>
            <input type="tel" inputMode="tel" placeholder="Telefone de contato" value={f.tel} onChange={(e) => set('tel', maskTel(e.target.value))} />
          </div>
          {err.tel && <small className="au-err" role="alert">{err.tel}</small>}
        </div>
        <div className="au-grid2">
          <AuthField icon="lock" type="password" placeholder="Senha" autoComplete="new-password" value={f.senha} onChange={(e) => set('senha', e.target.value)} error={err.senha} />
          <AuthField icon="lock" type="password" placeholder="Confirmar senha" autoComplete="new-password" value={f.conf} onChange={(e) => set('conf', e.target.value)} error={err.conf} />
        </div>
        <div className={`au-field-wrap ${err.aceito ? 'has-err' : ''}`}>
          <label className="au-check">
            <input type="checkbox" checked={f.aceito} onChange={(e) => set('aceito', e.target.checked)} />
            <span>Li e aceito os <a href="#cadastro" onClick={(e) => e.preventDefault()}>Termos de Uso</a> e a <a href="#cadastro" onClick={(e) => e.preventDefault()}>Política de Privacidade</a></span>
          </label>
          {err.aceito && <small className="au-err" role="alert">{err.aceito}</small>}
        </div>
        <button className="au-btn" disabled={busy}>{busy ? 'Cadastrando…' : <>Cadastrar Empresa <Icon name="arrow-right" /></>}</button>
        <div className="au-or"><span>ou</span></div>
        <p className="au-foot">Já tem uma conta? <a href="#login">Entrar</a></p>
      </form>
    </div>
  );
}
