-- ============================================
-- AyitiStream — Supabase SQL Schema
-- Kopi tout sa, kole li nan Supabase > SQL Editor > Run
-- ============================================

-- ── PWOFIL ITILIZATÈ ──
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  avatar_url  text default '',
  bio         text default '',
  created_at  timestamp with time zone default now()
);

-- Kreye pwofil otomatikman lè yon moun enskri
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── VIDÉO ──
create table public.videos (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  title               text not null,
  description         text default '',
  category            text default 'lot',
  tags                text[] default '{}',

  -- Boodstream (kache — frontend pa wè boodstream_id)
  boodstream_id       text default '',
  embed_url           text default '',
  thumbnail_url       text default '',

  -- Estatistik
  views               bigint default 0,
  status              text default 'processing', -- processing | ready | failed

  created_at          timestamp with time zone default now()
);

-- ── LIKE ──
create table public.likes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  video_id   uuid references public.videos(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, video_id)
);

-- ── KÒMANTÈ ──
create table public.comments (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  video_id   uuid references public.videos(id) on delete cascade not null,
  text       text not null,
  created_at timestamp with time zone default now()
);

-- ── SWIV ──
create table public.follows (
  id            uuid default gen_random_uuid() primary key,
  follower_id   uuid references public.profiles(id) on delete cascade not null,
  following_id  uuid references public.profiles(id) on delete cascade not null,
  created_at    timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- ── VUE KONPLÈ POU FEED ──
create view public.videos_feed as
  select
    v.id,
    v.title,
    v.description,
    v.category,
    v.tags,
    v.embed_url,        -- pa boodstream_id!
    v.thumbnail_url,
    v.views,
    v.status,
    v.created_at,
    p.id        as user_id,
    p.username,
    p.avatar_url,
    (select count(*) from public.likes    l where l.video_id = v.id) as likes_count,
    (select count(*) from public.comments c where c.video_id = v.id) as comments_count
  from public.videos v
  join public.profiles p on p.id = v.user_id
  where v.status = 'ready'
  order by v.created_at desc;

-- ── ROW LEVEL SECURITY ──
alter table public.profiles  enable row level security;
alter table public.videos    enable row level security;
alter table public.likes     enable row level security;
alter table public.comments  enable row level security;
alter table public.follows   enable row level security;

-- Profiles
create policy "Tout moun ka li pwofil" on public.profiles for select using (true);
create policy "Itilizatè ka modifye pwofil pa li" on public.profiles for update using (auth.uid() = id);

-- Videos
create policy "Tout moun ka li vidéo ready" on public.videos for select using (status = 'ready' or auth.uid() = user_id);
create policy "Itilizatè ka kreye vidéo" on public.videos for insert with check (auth.uid() = user_id);
create policy "Itilizatè ka siprime vidéo pa li" on public.videos for delete using (auth.uid() = user_id);
create policy "Sèvis ka update vidéo" on public.videos for update using (true);

-- Likes
create policy "Tout moun ka li likes" on public.likes for select using (true);
create policy "Itilizatè ka like" on public.likes for insert with check (auth.uid() = user_id);
create policy "Itilizatè ka unlike" on public.likes for delete using (auth.uid() = user_id);

-- Comments
create policy "Tout moun ka li kòmantè" on public.comments for select using (true);
create policy "Itilizatè ka kòmante" on public.comments for insert with check (auth.uid() = user_id);
create policy "Itilizatè ka siprime kòmantè pa li" on public.comments for delete using (auth.uid() = user_id);

-- Follows
create policy "Tout moun ka li follows" on public.follows for select using (true);
create policy "Itilizatè ka swiv" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Itilizatè ka retire swiv" on public.follows for delete using (auth.uid() = follower_id);

-- ── STORAGE POU THUMBNAIL ──
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true);
create policy "Tout moun ka li thumbnail" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "Itilizatè ka uploade thumbnail" on storage.objects for insert with check (bucket_id = 'thumbnails' and auth.uid() is not null);
