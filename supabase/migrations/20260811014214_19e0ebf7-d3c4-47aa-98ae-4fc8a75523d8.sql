
-- Roles
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read their own roles"
on public.user_roles for select to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Admin moderation policies on products
create policy "Admins can view all products"
on public.products for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update any product"
on public.products for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete any product"
on public.products for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- WhatsApp click tracking
alter table public.products
  add column if not exists whatsapp_clicks_count integer not null default 0;

create or replace function public.increment_whatsapp_click(_product_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set whatsapp_clicks_count = whatsapp_clicks_count + 1
  where id = _product_id and status = 'active';
$$;

-- Seed the administrator account
insert into public.user_roles (user_id, role)
values ('40808198-4fc7-4629-9e52-d6de7b443d1c', 'admin')
on conflict (user_id, role) do nothing;
