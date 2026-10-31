-- UrbanVoice schema. Paste into Supabase -> SQL Editor -> Run.

create type report_category as enum ('roads','lighting','waste','transport','parks','safety');
create type report_status   as enum ('submitted','in_review','in_progress','resolved');
create type user_role       as enum ('citizen','gov');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  handle text unique,
  avatar_url text,
  role user_role not null default 'citizen',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 140),
  body text not null default '',
  category report_category not null,
  status report_status not null default 'submitted',
  lat double precision not null,
  lng double precision not null,
  address text not null default '',
  photo_urls text[] not null default '{}',
  assigned_to uuid references profiles(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index reports_created_idx on reports (created_at desc);
create index reports_status_idx on reports (status);

create table comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table likes (
  report_id uuid not null references reports(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  primary key (report_id, user_id)
);

create table follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  primary key (follower_id, followee_id)
);

create table status_history (
  id bigserial primary key,
  report_id uuid not null references reports(id) on delete cascade,
  changed_by uuid references profiles(id),
  from_status report_status,
  to_status report_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  report_id uuid references reports(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Feed view with counts
create view report_feed as
select r.*, p.full_name as author_name, p.handle as author_handle, p.avatar_url as author_avatar,
  (select count(*) from likes l where l.report_id = r.id) as like_count,
  (select count(*) from comments c where c.report_id = r.id) as comment_count
from reports r join profiles p on p.id = r.author_id;

-- Helper: is the current user government staff?
create function is_gov() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'gov');
$$;

-- Auto-create a profile on sign-up (always as citizen)
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, handle)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1) || floor(random()*900+100)::text);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Log status changes and notify the reporter
create function log_status_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into status_history (report_id, changed_by, from_status, to_status) values (new.id, auth.uid(), old.status, new.status);
    insert into notifications (user_id, report_id, message)
      values (new.author_id, new.id, 'Your report "' || new.title || '" is now ' || replace(new.status::text,'_',' ') || '.');
    if new.status = 'resolved' then new.resolved_at = now(); end if;
  end if;
  return new;
end $$;
create trigger reports_status_change before update on reports
  for each row execute function log_status_change();

-- Row-level security
alter table profiles enable row level security;
alter table reports enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table status_history enable row level security;
alter table notifications enable row level security;

create policy "profiles readable" on profiles for select using (true);
create policy "edit own profile (not role)" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

create policy "reports readable" on reports for select using (true);
create policy "citizens create own reports" on reports for insert with check (author_id = auth.uid() and status = 'submitted');
create policy "authors edit own submitted reports" on reports for update using (author_id = auth.uid() and status = 'submitted') with check (author_id = auth.uid() and status = 'submitted');
create policy "gov manage reports" on reports for update using (is_gov());
create policy "authors delete own reports" on reports for delete using (author_id = auth.uid());

create policy "comments readable" on comments for select using (true);
create policy "comment as self" on comments for insert with check (author_id = auth.uid());
create policy "delete own comment" on comments for delete using (author_id = auth.uid());

create policy "likes readable" on likes for select using (true);
create policy "like as self" on likes for insert with check (user_id = auth.uid());
create policy "unlike as self" on likes for delete using (user_id = auth.uid());

create policy "follows readable" on follows for select using (true);
create policy "follow as self" on follows for insert with check (follower_id = auth.uid());
create policy "unfollow as self" on follows for delete using (follower_id = auth.uid());

create policy "history readable" on status_history for select using (true);
create policy "own notifications" on notifications for select using (user_id = auth.uid());
create policy "mark own read" on notifications for update using (user_id = auth.uid());

-- Storage bucket for report photos (public read, signed-in upload into own folder)
insert into storage.buckets (id, name, public) values ('report-photos','report-photos', true) on conflict do nothing;
create policy "photos public read" on storage.objects for select using (bucket_id = 'report-photos');
create policy "photos delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- To make someone government staff (run manually, never from the app):
-- update profiles set role = 'gov' where id = '<user uuid>';

-- Already ran an earlier version of this file? This adds the new profile settings column (safe to run again).
alter table profiles add column if not exists settings jsonb not null default '{}'::jsonb;
