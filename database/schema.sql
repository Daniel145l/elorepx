-- ============================================================
-- 4.1 Autenticação e Perfil (RF-01, RF-02, RF-03)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  xp integer not null default 0,
  nivel_narrativo text not null default 'Aspirante', -- RF-12
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "usuário vê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'nickname', 'Cientista' || substr(new.id::text, 1, 6)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4.2 Divulgação e Conteúdo (RF-04 a RF-08)
-- ============================================================

create table if not exists public.olimpiadas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  site_oficial text,
  rede_social text,
  data_inscricao_inicio date,
  data_inscricao_fim date,
  data_prova date
);

create table if not exists public.cientistas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  biografia text not null,
  foto_url text,
  fonte_url text,
  fonte_licenca text default 'CC BY-SA 4.0',
  importado_em timestamptz default now()
);

create table if not exists public.relatos_alunos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text not null,
  fonte_url text not null,     -- link da reportagem original
  fonte_nome text not null,    -- ex.: 'G1', 'Diário do Nordeste'
  foto_url text                -- opcional: ilustração/avatar genérico, NUNCA a foto da matéria
);

alter table public.olimpiadas enable row level security;
alter table public.cientistas enable row level security;
alter table public.relatos_alunos enable row level security;

create policy "leitura pública de olimpíadas" on public.olimpiadas for select using (true);
create policy "leitura pública de cientistas" on public.cientistas for select using (true);
create policy "leitura pública de relatos" on public.relatos_alunos for select using (true);

-- ============================================================
-- 4.3 Quizzes e Avaliação (RF-09, RF-10, RF-11)
-- ============================================================

create table if not exists public.questoes (
  id uuid primary key default gen_random_uuid(),
  olimpiada_id uuid references public.olimpiadas(id),
  assunto text not null,
  nivel_dificuldade text not null check (nivel_dificuldade in ('facil', 'medio', 'dificil')),
  enunciado text not null,
  alternativas jsonb not null,
  resposta_correta text not null
);

create table if not exists public.tentativas_resposta (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  questao_id uuid not null references public.questoes(id),
  resposta_dada text not null,
  correta boolean not null,
  respondida_em timestamptz not null default now()
);

alter table public.questoes enable row level security;
alter table public.tentativas_resposta enable row level security;

create policy "leitura pública de questões" on public.questoes for select using (true);

create policy "usuário vê as próprias tentativas"
  on public.tentativas_resposta for select
  using (auth.uid() = user_id);

create policy "usuário registra as próprias tentativas"
  on public.tentativas_resposta for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 4.4 Gamificação (RF-12, RF-13, RF-14)
-- ============================================================

create table if not exists public.medalhas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  descricao text
);

create table if not exists public.usuario_medalhas (
  user_id uuid not null references auth.users(id) on delete cascade,
  medalha_id uuid not null references public.medalhas(id),
  conquistada_em timestamptz not null default now(),
  primary key (user_id, medalha_id)
);

create table if not exists public.missoes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text not null,
  meta jsonb not null 
);

create table if not exists public.usuario_missoes (
  user_id uuid not null references auth.users(id) on delete cascade,
  missao_id uuid not null references public.missoes(id),
  progresso integer not null default 0,
  concluida boolean not null default false,
  primary key (user_id, missao_id)
);

alter table public.medalhas enable row level security;
alter table public.usuario_medalhas enable row level security;
alter table public.missoes enable row level security;
alter table public.usuario_missoes enable row level security;

create policy "leitura pública de medalhas" on public.medalhas for select using (true);
create policy "leitura pública de missões" on public.missoes for select using (true);

create policy "usuário vê as próprias medalhas"
  on public.usuario_medalhas for select using (auth.uid() = user_id);

create policy "usuário vê o próprio progresso em missões"
  on public.usuario_missoes for select using (auth.uid() = user_id);

create policy "usuário atualiza o próprio progresso em missões"
  on public.usuario_missoes for update using (auth.uid() = user_id);

-- ============================================================
-- 4.7 Feedback e Suporte (RF-21)
-- ============================================================

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  mensagem text not null,
  criado_em timestamptz not null default now()
);

alter table public.feedbacks enable row level security;

create policy "usuário insere o próprio feedback"
  on public.feedbacks for insert
  with check (auth.uid() = user_id or user_id is null);
