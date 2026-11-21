-- Heaven: accounts, homes, bookings and wishlists.

-- Profiles: one row per signed-up user, filled from sign-up metadata.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Homes. Prices live here so checkout totals are computed on the server, never trusted from the browser.
create table public.listings (
  id text primary key,
  host_id uuid references auth.users(id) on delete set null,
  title text not null,
  city text not null,
  price integer not null check (price > 0),          -- nightly, whole USD
  cleaning_fee integer not null default 0 check (cleaning_fee >= 0),
  max_guests integer not null default 2 check (max_guests > 0),
  instant_book boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bookings. Created as 'pending' by the create-checkout function, then set to
-- 'confirmed' (instant book) or 'requested' by the Stripe webhook once paid.
create table public.bookings (
  code text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id text not null references public.listings(id),
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0),
  guest_name text not null,
  email text not null,
  phone text,
  message text,
  total integer not null,                 -- whole USD
  amount_due integer not null,            -- charged now (full or 50%)
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'requested', 'cancelled', 'expired')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  check (check_out > check_in)
);
create index bookings_user_idx on public.bookings (user_id, created_at desc);
create index bookings_listing_idx on public.bookings (listing_id, check_in);

create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id text not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- Row level security: everyone reads active homes; people only see their own rows.
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.bookings enable row level security;
alter table public.wishlists enable row level security;

create policy "own profile read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = id);

create policy "homes are public" on public.listings for select to anon, authenticated using (active);

create policy "own bookings read" on public.bookings for select to authenticated using ((select auth.uid()) = user_id);
-- Inserts and status changes go through edge functions (service role) or the cancel function below.

create policy "own wishlist read" on public.wishlists for select to authenticated using ((select auth.uid()) = user_id);
create policy "own wishlist add" on public.wishlists for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own wishlist remove" on public.wishlists for delete to authenticated using ((select auth.uid()) = user_id);

-- Guests cancel their own upcoming trips. Refunds are handled manually in Stripe for now.
create or replace function public.cancel_booking(p_code text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.bookings
     set status = 'cancelled'
   where code = p_code
     and user_id = (select auth.uid())
     and status in ('pending', 'confirmed', 'requested')
     and check_in > current_date;
  if not found then
    raise exception 'Booking not found or can no longer be cancelled';
  end if;
end $$;
revoke all on function public.cancel_booking(text) from public, anon;
grant execute on function public.cancel_booking(text) to authenticated;
