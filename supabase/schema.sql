-- Chegou Delivery: banco de dados (Supabase / Postgres)
-- Como aplicar: Supabase > SQL Editor > New query > cole este arquivo inteiro > Run.
-- Pode ser executado de novo sem problemas (usa "if not exists" / "or replace").
--
-- Modelo: cada lojista (usuário do Supabase Auth) tem UMA loja. Todas as tabelas
-- apontam para a loja e o RLS garante que cada um só enxerga os próprios dados.

create extension if not exists pgcrypto;

/* ---------------------------------------------------------------- lojas */
create table if not exists public.lojas (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null unique references auth.users(id) on delete cascade,
  nome        text not null default '',
  tipo        text not null default '',
  cnpj        text not null default '',
  whatsapp    text not null default '',
  responsavel text not null default '',
  email       text not null default '',
  cep text not null default '', rua text not null default '', numero text not null default '',
  complemento text not null default '', bairro text not null default '', cidade text not null default '', uf text not null default '',
  pedido_minimo numeric(10,2) not null default 0,
  codigo_conta  text not null default '',
  logo_url      text,
  -- configurações com formato flexível
  horarios    jsonb not null default '[]'::jsonb,
  fidelidade  jsonb not null default '{}'::jsonb,
  impressao   jsonb not null default '{}'::jsonb,
  som         jsonb not null default '{}'::jsonb,
  loja_aberta_override jsonb,
  criada_em   timestamptz not null default now()
);

/* ------------------------------------------------------------- catálogo */
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  nome text not null, icone text not null default 'tag', cor text, descricao text not null default '',
  ordem int not null default 0,
  unique (loja_id, nome)
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete cascade,
  nome text not null, descricao text not null default '',
  preco numeric(10,2) not null default 0,
  imagem text, status text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  ordem int not null default 0, extras jsonb not null default '{}'::jsonb
);

create table if not exists public.kits (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  nome text not null, categoria text not null default '', descricao text not null default '',
  preco numeric(10,2) not null default 0, imagem text,
  itens jsonb not null default '[]'::jsonb,                -- [["Produto", qtd], ...]
  status text not null default 'Ativo' check (status in ('Ativo','Inativo'))
);

create table if not exists public.complementos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  nome text not null, descricao text not null default '',
  tipo text not null default 'Grátis' check (tipo in ('Grátis','Pago')),
  preco numeric(10,2) not null default 0, imagem text,
  status text not null default 'Ativo' check (status in ('Ativo','Inativo'))
);

/* ------------------------------------------------- clientes e pedidos */
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  nome text not null, telefone text not null default '',
  endereco text not null default '', setor text not null default '', cidade text not null default '',
  nascimento date, criado_em timestamptz not null default now(), ultima_compra timestamptz
);
create index if not exists clientes_loja_idx on public.clientes (loja_id);

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  numero int not null,
  status text not null default 'recebido' check (status in ('recebido','preparo','pronto','rota','entregue','cancelado')),
  modo text not null default 'Entrega' check (modo in ('Entrega','Retirada')),
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente_nome text not null default '', telefone text not null default '',
  endereco text not null default '', setor text not null default '', cidade text not null default '',
  itens text not null default '', valor numeric(10,2) not null default 0,
  pagamento text not null default '',
  coleta jsonb, rota jsonb,                                  -- estado de coleta/entrega em andamento
  criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
  unique (loja_id, numero)
);
create index if not exists pedidos_loja_status_idx on public.pedidos (loja_id, status, criado_em desc);

/* ---------------------------------------------- marketing e equipe */
create table if not exists public.cupons (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  codigo text not null, descricao text not null default '',
  tipo text not null default 'Percentual', valor text not null default '',
  validade text not null default '', status text not null default 'Ativo', usos int not null default 0,
  unique (loja_id, codigo)
);

create table if not exists public.fidelidade_clientes (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete cascade,
  nome text not null, compras int not null default 0, ultima_compra date
);

create table if not exists public.equipe (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  nome text not null, email text not null,
  perfil text not null default 'Operador' check (perfil in ('Administrador','Gerente','Operador')),
  status text not null default 'Ativo' check (status in ('Ativo','Inativo')),
  criado_em timestamptz not null default now()
);

/* ------------------------------------------------------- segurança (RLS) */
-- Retorna a loja do usuário logado. "security definer" evita recursão nas políticas.
create or replace function public.minha_loja() returns uuid
language sql stable security definer set search_path = public as
$$ select id from public.lojas where owner_id = auth.uid() $$;

alter table public.lojas enable row level security;
drop policy if exists lojas_dono on public.lojas;
create policy lojas_dono on public.lojas for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['categorias','produtos','kits','complementos','clientes','pedidos','cupons','fidelidade_clientes','equipe']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_dono', t);
    execute format('create policy %I on public.%I for all to authenticated using (loja_id = public.minha_loja()) with check (loja_id = public.minha_loja())', t || '_dono', t);
  end loop;
end $$;

/* ------------------------------------- cadastro: cria a loja sozinho */
-- Os dados do formulário de cadastro chegam em raw_user_meta_data (ver store/auth.js).
create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = public as
$$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.lojas (owner_id, nome, cnpj, whatsapp, responsavel, email, codigo_conta)
  values (new.id, coalesce(m->>'empresa',''), coalesce(m->>'cnpj',''), coalesce(m->>'telefone',''),
          coalesce(m->>'nome',''), coalesce(new.email,''), upper(substr(md5(random()::text), 1, 8)))
  on conflict (owner_id) do nothing;
  insert into public.equipe (loja_id, nome, email, perfil)
  select id, coalesce(m->>'nome',''), coalesce(new.email,''), 'Administrador' from public.lojas where owner_id = new.id;
  return new;
end
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.novo_usuario();
