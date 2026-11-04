# UrbanVoice

Citizen feedback and complaint platform for city issues: citizens report problems on a map, the community follows and discusses them, and government staff triage and resolve them.

Built entirely on free tiers: Next.js, Tailwind CSS, Supabase (auth, Postgres, storage, realtime), Leaflet + OpenStreetMap, Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local   # optional: the UI runs on demo data without it
npm run dev
```

## Connect the backend (free)
1. Create a project at supabase.com.
2. SQL Editor: paste and run `supabase/schema.sql`.
3. Project settings > API: copy the URL and anon key into `.env.local`.
4. To create a government account: sign up normally, then run
   `update profiles set role = 'gov' where id = '<user uuid>';`

5. Authentication > URL Configuration: set Site URL to your site (`http://localhost:3000` locally, your Vercel URL when deployed) and add `<site>/auth/callback` under Redirect URLs. Confirmation emails link back through that address.
6. Supabase's built-in email sender is limited to a few messages per hour on the free plan. That is enough for testing; for a public launch, add a free SMTP sender such as Resend.

## Staff portal (`/gov`)
1. Re-run `supabase/schema.sql` in the SQL Editor (it adds the status-update function; safe to run again).
2. Create the staff member's account the normal way (sign up on the citizen site and confirm the email).
3. In the SQL Editor, make that account staff (replace the email):
   `update profiles set role = 'gov' where id = (select id from auth.users where email = 'staff@example.com');`
4. Sign in at `/gov/login`. Citizens can never promote themselves: the role can only be changed in the SQL Editor.

Without Supabase keys the portal runs in demo mode with a sample staff member (Citizen account menu > Staff portal).

## Deploy
Push to GitHub, import the repo in Vercel, add the two env vars.

## Credits
Interface designed from the "Urban Feedback - Complaint Platform (Community)" Figma Community file. Check the file's license and credit the original designer.
Map data (c) OpenStreetMap contributors.
