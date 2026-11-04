-- Run this ONCE in the Supabase SQL Editor if you already set up the database with an earlier schema.sql.
-- It is safe to run again: nothing here fails if it already exists.

-- 1. Settings column for the Profile and Settings pages
alter table profiles add column if not exists settings jsonb not null default '{}'::jsonb;

-- 2. Let people delete their own report photos
drop policy if exists "photos delete own folder" on storage.objects;
create policy "photos delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Staff: change a report's status and add a note in one step
create or replace function gov_set_status(p_report uuid, p_status report_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare cur report_status;
begin
  if not is_gov() then raise exception 'not allowed'; end if;
  select status into cur from reports where id = p_report for update;
  if cur is null then raise exception 'report not found'; end if;
  if cur is distinct from p_status then
    update reports set status = p_status where id = p_report;
    update status_history set note = nullif(btrim(p_note), '')
      where id = (select max(id) from status_history where report_id = p_report);
  elsif nullif(btrim(p_note), '') is not null then
    insert into status_history (report_id, changed_by, from_status, to_status, note)
    values (p_report, auth.uid(), cur, cur, btrim(p_note));
  end if;
end $$;
grant execute on function gov_set_status(uuid, report_status, text) to authenticated;
