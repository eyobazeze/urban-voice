-- Optional hardening for a public launch. Safe to run more than once.
-- These add limits inside the database, so it doesn't rely only on the app behaving well:
-- anyone can talk to a Supabase database directly with the public key, bypassing the app.
--
-- After running it, test once: sign in, file a report with a photo, open it, delete it, then
-- change a status as staff. If anything misbehaves, tell me the exact error.

-- 1. Report text length (the app limits this too, but the app is not the only way in)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reports_body_length') then
    alter table reports add constraint reports_body_length check (char_length(body) <= 2000) not valid;
  end if;
end $$;

-- 2. Photos: small images only, so nobody can fill the free storage quota with large files
update storage.buckets
   set file_size_limit = 2097152,  -- 2 MB
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'report-photos';

-- 3. Citizens cannot set the fields only staff control (status, assignee, resolved time, created time)
create or replace function reports_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- No signed-in user (SQL Editor, service role) or a staff member: no restrictions
  if auth.uid() is null or is_gov() then return new; end if;

  if tg_op = 'INSERT' then
    new.status := 'submitted';
    new.assigned_to := null;
    new.resolved_at := null;
    new.created_at := now();
  else
    new.author_id := old.author_id;
    new.assigned_to := old.assigned_to;
    new.resolved_at := old.resolved_at;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists reports_guard_trg on reports;
create trigger reports_guard_trg before insert or update on reports
  for each row execute function reports_guard();
