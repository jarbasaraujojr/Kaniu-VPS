-- Tabela de perfis de usuários
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  phone text,
  address text,
  city text,
  state text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Função para atualizar o timestamp de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger para atualizar o timestamp
create trigger profiles_handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

-- Policies para a tabela profiles
alter table profiles enable row level security;

-- Usuários podem ver seus próprios perfis
create policy "Usuários podem ver seus próprios perfis"
on profiles for select
to authenticated
using ( auth.uid() = id );

-- Usuários podem atualizar seus próprios perfis
create policy "Usuários podem atualizar seus próprios perfis"
on profiles for update
to authenticated
using ( auth.uid() = id )
with check ( auth.uid() = id );

-- Abrigos podem ver perfis de adotantes
create policy "Abrigos podem ver perfis de adotantes"
on profiles for select
to authenticated
using (
  exists (
    select 1 from adoptions
    join shelters on shelters.id = adoptions.shelter_id
    where adoptions.adopter_id = profiles.id
    and shelters.owner_id = auth.uid()
  )
);

-- Function para criar perfil após signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil após signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();