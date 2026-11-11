// Autenticação do painel com Supabase Auth (e-mail + senha, recuperação por e-mail).
// A loja do usuário é criada no banco por um gatilho SQL ao cadastrar (veja supabase/schema.sql).
import { create } from 'zustand';
import { mut } from './useApp';
import { uid } from '../lib/format';
import { supabase, supabaseConfigurado } from '../lib/supabase';

export const normEmail = (e) => String(e || '').trim().toLowerCase();
export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export const SENHA_MIN = 6; // mínimo padrão do Supabase Auth

// pronto: já sabemos se existe sessão | recuperando: abriu o link do e-mail de redefinição
export const useAuth = create(() => ({ user: null, pronto: !supabaseConfigurado, recuperando: false }));

const SEM_CONFIG = { ok: false, msg: 'Banco de dados não configurado. Preencha o arquivo .env.local (veja .env.example).' };

function traduzir(error) {
  const m = String(error?.message || '').toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Já existe uma conta com este e-mail.';
  if (m.includes('password should be at least')) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (m.includes('same password') || m.includes('different from the old')) return 'A nova senha deve ser diferente da atual.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor. Verifique sua internet.';
  return 'Não foi possível concluir. Tente novamente.';
}

/** Busca a loja do usuário no banco e preenche o painel. */
async function carregarLoja(authUser) {
  const { data: l } = await supabase.from('lojas').select('*').eq('owner_id', authUser.id).maybeSingle();
  const nome = l?.responsavel || authUser.user_metadata?.nome || authUser.email;
  mut((s) => {
    s.users = [{ id: uid('u'), n: nome, e: authUser.email, p: 'Administrador', s: 'Ativo', a: 'Agora mesmo' }];
    if (l) Object.assign(s.loja, { nome: l.nome, tipo: l.tipo, cnpj: l.cnpj, wpp: l.whatsapp, cep: l.cep, rua: l.rua, nro: l.numero, cpl: l.complemento, bai: l.bairro, cid: l.cidade, uf: l.uf, code: l.codigo_conta || s.loja.code });
  });
  useAuth.setState({ user: { id: authUser.id, email: authUser.email, nome, lojaId: l?.id || null } });
}

if (supabaseConfigurado) {
  supabase.auth.onAuthStateChange((evento, sessao) => {
    // Importante: nada de chamadas ao Supabase direto aqui dentro; adiar evita travar o cliente.
    setTimeout(async () => {
      if (evento === 'PASSWORD_RECOVERY') useAuth.setState({ recuperando: true });
      if (sessao?.user) await carregarLoja(sessao.user);
      else useAuth.setState({ user: null });
      useAuth.setState({ pronto: true });
    }, 0);
  });
}

export async function entrar(email, senha) {
  if (!supabaseConfigurado) return SEM_CONFIG;
  email = normEmail(email);
  if (!emailValido(email)) return { ok: false, msg: 'Informe um e-mail válido.' };
  if (!senha) return { ok: false, msg: 'Informe a senha.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { ok: false, msg: traduzir(error) };
  window.location.hash = 'visao-geral';
  return { ok: true };
}

export async function cadastrar({ empresa, cnpj, nome, email, tel, senha }) {
  if (!supabaseConfigurado) return SEM_CONFIG;
  const { data, error } = await supabase.auth.signUp({
    email: normEmail(email), password: senha,
    options: { data: { empresa: empresa.trim(), cnpj, nome: nome.trim(), telefone: tel } },
  });
  if (error) return { ok: false, msg: traduzir(error) };
  // E-mail já usado: o Supabase devolve um usuário sem identidades, sem dar erro.
  if (data.user && data.user.identities?.length === 0) return { ok: false, msg: 'Já existe uma conta com este e-mail.' };
  // Sem sessão = a confirmação por e-mail está ligada no projeto.
  if (!data.session) return { ok: true, confirmar: true };
  window.location.hash = 'visao-geral';
  return { ok: true };
}

/** Envia o e-mail com o link de redefinição; o link volta para esta página e dispara o evento PASSWORD_RECOVERY. */
export async function recuperarSenha(email) {
  if (!supabaseConfigurado) return SEM_CONFIG;
  email = normEmail(email);
  if (!emailValido(email)) return { ok: false, msg: 'Informe um e-mail válido.' };
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) return { ok: false, msg: traduzir(error) };
  return { ok: true };
}

/** Define a nova senha (usuário chegou pelo link do e-mail). */
export async function definirNovaSenha(senha) {
  if (!supabaseConfigurado) return SEM_CONFIG;
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) return { ok: false, msg: traduzir(error) };
  useAuth.setState({ recuperando: false });
  window.location.hash = 'visao-geral';
  return { ok: true };
}

export async function sair() {
  if (supabaseConfigurado) await supabase.auth.signOut();
  window.location.hash = 'login';
  window.location.reload(); // zera o estado em memória da sessão anterior
}
