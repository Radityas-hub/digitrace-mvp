-- DIGITRACE MVP database schema
-- Run this file in the Supabase SQL editor before seed.sql.

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique check (username ~ '^[a-z0-9._-]{3,32}$'),
    full_name text not null,
    role text not null default 'user' check (role in ('user', 'admin')),
    area text,
    school text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.plastic_types (
    code text primary key check (code in ('PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'OTHER')),
    resin_number smallint check (resin_number between 1 and 7),
    name text not null,
    short_description text not null,
    characteristics text not null,
    environmental_impact text not null,
    recyclable boolean not null default false,
    sorting_steps jsonb not null default '[]'::jsonb,
    examples text[] not null default '{}',
    chart_color text not null check (chart_color ~ '^#[0-9A-Fa-f]{6}$'),
    sort_order smallint not null,
    is_active boolean not null default true,
    updated_at timestamptz not null default now()
);

create table if not exists public.products (
    id bigint generated always as identity primary key,
    name text not null,
    brand text,
    plastic_code text not null references public.plastic_types(code),
    keywords text[] not null default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.scan_records (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    plastic_code text not null references public.plastic_types(code),
    item_name text,
    identification_method text not null check (
        identification_method in ('manual', 'ai_confirmed')
    ),
    confidence numeric(5, 4) check (confidence is null or confidence between 0 and 1),
    sorting_status text not null default 'saved' check (
        sorting_status in ('saved', 'sorted')
    ),
    points_awarded smallint not null default 10 check (points_awarded between 0 and 100),
    created_at timestamptz not null default now()
);

create index if not exists scan_records_user_created_idx
    on public.scan_records(user_id, created_at desc);

create index if not exists scan_records_plastic_code_idx
    on public.scan_records(plastic_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists plastic_types_set_updated_at on public.plastic_types;
create trigger plastic_types_set_updated_at
before update on public.plastic_types
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    requested_username text;
    requested_name text;
begin
    requested_username := lower(coalesce(
        nullif(new.raw_user_meta_data ->> 'username', ''),
        split_part(coalesce(new.email, new.id::text), '@', 1)
    ));
    requested_name := coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        requested_username
    );

    insert into public.profiles (id, username, full_name, role, area, school)
    values (
        new.id,
        requested_username,
        requested_name,
        'user',
        nullif(new.raw_user_meta_data ->> 'area', ''),
        nullif(new.raw_user_meta_data ->> 'school', '')
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = check_user_id
          and role = 'admin'
          and is_active = true
    );
$$;

create or replace function public.save_scan(
    p_plastic_code text,
    p_item_name text default null,
    p_identification_method text default 'manual',
    p_confidence numeric default null,
    p_sorting_status text default 'saved'
)
returns public.scan_records
language plpgsql
security definer
set search_path = ''
as $$
declare
    current_user_id uuid := auth.uid();
    saved_record public.scan_records;
begin
    if current_user_id is null then
        raise exception 'Authentication required';
    end if;

    if not exists (
        select 1 from public.profiles
        where id = current_user_id and is_active = true
    ) then
        raise exception 'Inactive or missing profile';
    end if;

    if p_identification_method not in ('manual', 'ai_confirmed') then
        raise exception 'Invalid identification method';
    end if;

    if p_sorting_status not in ('saved', 'sorted') then
        raise exception 'Invalid sorting status';
    end if;

    if p_confidence is not null and (p_confidence < 0 or p_confidence > 1) then
        raise exception 'Confidence must be between 0 and 1';
    end if;

    insert into public.scan_records (
        user_id,
        plastic_code,
        item_name,
        identification_method,
        confidence,
        sorting_status,
        points_awarded
    )
    values (
        current_user_id,
        p_plastic_code,
        nullif(trim(p_item_name), ''),
        p_identification_method,
        p_confidence,
        p_sorting_status,
        10
    )
    returning * into saved_record;

    return saved_record;
end;
$$;

create or replace function public.get_leaderboard()
returns table (
    user_id uuid,
    full_name text,
    area text,
    total_scans bigint,
    total_points bigint
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        p.id,
        p.full_name,
        p.area,
        count(s.id) as total_scans,
        coalesce(sum(s.points_awarded), 0)::bigint as total_points
    from public.profiles p
    left join public.scan_records s on s.user_id = p.id
    where p.role = 'user' and p.is_active = true
    group by p.id, p.full_name, p.area
    order by total_points desc, total_scans desc, p.full_name asc;
$$;

alter table public.profiles enable row level security;
alter table public.plastic_types enable row level security;
alter table public.products enable row level security;
alter table public.scan_records enable row level security;

revoke all on public.profiles from anon;
revoke all on public.plastic_types from anon;
revoke all on public.products from anon;
revoke all on public.scan_records from anon;

revoke insert, update, delete on public.scan_records from authenticated;
grant select on public.profiles, public.plastic_types, public.products, public.scan_records to authenticated;
revoke execute on function public.is_admin(uuid) from public, anon;
revoke execute on function public.save_scan(text, text, text, numeric, text) from public, anon;
revoke execute on function public.get_leaderboard() from public, anon;
grant execute on function public.save_scan(text, text, text, numeric, text) to authenticated;
grant execute on function public.get_leaderboard() to authenticated;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "plastic_types_select_authenticated" on public.plastic_types;
create policy "plastic_types_select_authenticated"
on public.plastic_types for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "scan_records_select_own_or_admin" on public.scan_records;
create policy "scan_records_select_own_or_admin"
on public.scan_records for select
to authenticated
using ((select auth.uid()) = user_id or public.is_admin());

-- Promote the account used as administrator only after creating it:
-- update public.profiles set role = 'admin' where username = 'admin';

