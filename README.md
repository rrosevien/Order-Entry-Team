# Order-Entry-Team
Team Monitoring
-- Run this in Supabase: Project > SQL Editor > New query > Run

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  shift text,
  assigned_suppliers text,
  monitored_suppliers text,
  notes text,
  created_at timestamp with time zone default now()
);

-- Lock the table down so only logged-in users can see/edit it
alter table members enable row level security;

create policy "Logged in users can view members"
on members for select
to authenticated
using (true);

create policy "Logged in users can edit members"
on members for all
to authenticated
using (true)
with check (true);

-- Optional: seed your current team so the dashboard isn't empty on first load
insert into members (name, shift, assigned_suppliers, monitored_suppliers, notes) values
('Krista', 'AU Shift', 'Coles; Woolworths', 'IGA', ''),
('Marie', 'AU Shift', 'Aldi; Metcash', '', ''),
('Ailene', 'UK Shift', 'Tesco; Sainsburys', 'Ocado', '');
