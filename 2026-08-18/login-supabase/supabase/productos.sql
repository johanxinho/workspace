create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  nombre text not null,
  descripcion text,
  precio numeric not null default 0 check (precio >= 0),
  created_at timestamptz not null default now()
);

alter table public.productos enable row level security;

create policy "Los usuarios pueden ver sus propios productos"
on public.productos for select to authenticated
using (auth.uid() = user_id);

create policy "Los usuarios pueden crear sus propios productos"
on public.productos for insert to authenticated
with check (auth.uid() = user_id);

create policy "Los usuarios pueden editar sus propios productos"
on public.productos for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios productos"
on public.productos for delete to authenticated
using (auth.uid() = user_id);