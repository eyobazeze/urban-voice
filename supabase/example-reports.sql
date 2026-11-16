-- Example reports for the live site. They are clearly marked "Example" in the app and are not real complaints.
--
-- Before you run this:
--   1. On your live site, sign up with a spare email (for example yourname+examples@gmail.com) and confirm it.
--   2. Put that email in the line marked  <-- CHANGE THIS  below.
--
-- Run it in the Supabase SQL Editor. Run it again any time to refresh the dates: it only ever replaces
-- reports written by that one example account, never real people's reports.

do $$
declare
  example_email text := 'eyobazeze9@gmail.com';  
  uid uuid;
  staff uuid;
begin
  select id into uid from auth.users where email = example_email;
  if uid is null then
    raise exception 'No account found for %. Sign up with that email on the live site and confirm it, then run this again.', example_email;
  end if;

  -- The handle is how the app recognises example reports and labels them
  update profiles set full_name = 'UrbanVoice Examples', handle = 'urbanvoice_examples' where id = uid;

  -- Optional: an existing staff member shows as the officer on some examples (stays empty if there is none)
  select id into staff from profiles where role = 'gov' limit 1;

  delete from reports where author_id = uid;  -- clears the old examples so the dates are fresh

  insert into reports (id, author_id, title, body, category, status, lat, lng, address, created_at, resolved_at, assigned_to) values
  ('e0000000-0000-4000-8000-000000000001', uid, 'Deep pothole outside the Bole Medhanialem church gate',
   'Taxis swerve into the opposite lane to avoid it. Two motorbikes have gone down this week.',
   'roads', 'in_progress', 8.9969, 38.7867, 'Bole Medhanialem, Bole', now() - interval '2 hours 30 minutes', null, staff),
  ('e0000000-0000-4000-8000-000000000002', uid, 'Five streetlights out along the Kazanchis walkway',
   'The stretch between the Nile Hotel and the underpass has been dark for over a week. Women are avoiding it after 7pm.',
   'lighting', 'in_review', 9.0163, 38.7694, 'Kazanchis Junction, Kirkos', now() - interval '5 hours', null, staff),
  ('e0000000-0000-4000-8000-000000000003', uid, 'Uncollected waste piling up near Merkato bus terminal',
   'Collection has not come in nine days. The smell is reaching the shops across the road.',
   'waste', 'submitted', 9.0305, 38.7352, 'Merkato Terminal, Addis Ketema', now() - interval '9 hours', null, null),
  ('e0000000-0000-4000-8000-000000000004', uid, 'Open manhole without a cover near Mexico Square',
   'Someone has placed a branch in it as a warning. It is right where people step off the minibus.',
   'safety', 'in_progress', 9.0108, 38.7428, 'Mexico Square, Lideta', now() - interval '6 hours', null, staff),
  ('e0000000-0000-4000-8000-000000000005', uid, 'Broken swings and glass in the Arat Kilo playground',
   'Children have been cutting their hands on the glass. The two swings are unsafe.',
   'parks', 'resolved', 9.0342, 38.7629, 'Arat Kilo, Arada', now() - interval '3 days', now() - interval '1 day 4 hours', staff),
  ('e0000000-0000-4000-8000-000000000006', uid, 'Bus stop shelter collapsed at Megenagna interchange',
   'The roof panel fell onto the bench. Commuters are now queuing in the road.',
   'transport', 'submitted', 9.0204, 38.8012, 'Megenagna, Yeka', now() - interval '14 hours', null, null),
  ('e0000000-0000-4000-8000-000000000007', uid, 'Blocked drain flooding the Sar Bet junction after rain',
   'Water reaches the pavement within ten minutes of rain. The drain is full of silt.',
   'roads', 'resolved', 8.9957, 38.7506, 'Sar Bet, Nifas Silk-Lafto', now() - interval '6 days', now() - interval '4 days', staff),
  ('e0000000-0000-4000-8000-000000000008', uid, 'Traffic signal stuck on red at Piassa roundabout',
   'Traffic police are directing by hand but the queue goes back to Churchill Avenue.',
   'lighting', 'in_progress', 9.0353, 38.7503, 'Piassa, Arada', now() - interval '1 day 3 hours', null, staff);

  -- The updates citizens see on each report ("Updates from the city")
  insert into status_history (report_id, changed_by, from_status, to_status, note, created_at) values
  ('e0000000-0000-4000-8000-000000000001', staff, 'submitted',  'in_review',   'Report received. An inspection is booked.',                 now() - interval '2 hours'),
  ('e0000000-0000-4000-8000-000000000001', staff, 'in_review',  'in_progress', 'Road crew assigned. The repair is planned for this week.',  now() - interval '1 hour'),
  ('e0000000-0000-4000-8000-000000000002', staff, 'submitted',  'in_review',   'A technician will inspect the poles tomorrow morning.',     now() - interval '3 hours'),
  ('e0000000-0000-4000-8000-000000000004', staff, 'submitted',  'in_review',   'Report received and passed to the safety team.',            now() - interval '5 hours'),
  ('e0000000-0000-4000-8000-000000000004', staff, 'in_review',  'in_progress', 'A temporary barrier is in place. A permanent cover is on order.', now() - interval '3 hours'),
  ('e0000000-0000-4000-8000-000000000005', staff, 'submitted',  'in_review',   'Report received.',                                          now() - interval '2 days 20 hours'),
  ('e0000000-0000-4000-8000-000000000005', staff, 'in_review',  'in_progress', 'A crew will clear the glass and check the swings.',         now() - interval '2 days'),
  ('e0000000-0000-4000-8000-000000000005', staff, 'in_progress','resolved',    'Glass cleared and the swings repaired. Thank you for reporting this.', now() - interval '1 day 4 hours'),
  ('e0000000-0000-4000-8000-000000000007', staff, 'submitted',  'in_review',   'Report received.',                                          now() - interval '5 days 12 hours'),
  ('e0000000-0000-4000-8000-000000000007', staff, 'in_review',  'resolved',    'Drain cleared and tested during the next rain.',            now() - interval '4 days'),
  ('e0000000-0000-4000-8000-000000000008', staff, 'submitted',  'in_progress', 'Signal technicians have been dispatched.',                  now() - interval '1 day 1 hour');
end $$;
