-- Run once in Supabase > SQL Editor. (fragrances table was already created.)
create table if not exists words (
  id uuid primary key default gen_random_uuid(),
  word text unique not null,
  meaning text
);
alter table words enable row level security;
create policy "logged-in only" on words for all to authenticated using (true) with check (true);
