-- Schema inicial de referência. Execute no Supabase SQL Editor após revisar políticas.
create extension if not exists pgcrypto;
create type public.booking_status as enum ('pending_payment','confirmed','cancelled','expired','refunded');
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'guest' check (role in ('guest','host','admin')),
  created_at timestamptz not null default now()
);
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text not null default '',
  city text not null,
  region text not null,
  address text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  max_guests integer not null check (max_guests > 0),
  units_total integer not null check (units_total > 0),
  base_price_cents integer not null check (base_price_cents >= 0),
  currency char(3) not null default 'EUR'
);
create table public.room_inventory (
  room_id uuid not null references public.rooms(id) on delete cascade,
  stay_date date not null,
  units_available integer not null check (units_available >= 0),
  price_cents integer not null check (price_cents >= 0),
  primary key(room_id, stay_date)
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.profiles(id),
  room_id uuid not null references public.rooms(id),
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0),
  total_cents integer not null check (total_cents >= 0),
  currency char(3) not null default 'EUR',
  status public.booking_status not null default 'pending_payment',
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  check (check_out > check_in)
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index properties_city_idx on public.properties(city);
create index bookings_dates_idx on public.bookings(check_in, check_out);
create index bookings_guest_idx on public.bookings(guest_id, created_at desc);
-- RLS deve ser ativada e receber políticas específicas antes de expor estas tabelas à aplicação.
-- Não ative acesso público amplo nem permita que clientes alterem status de pagamento.
