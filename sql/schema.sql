-- ============================================
-- PRODIGE STUDIO — Schema Supabase
-- Exécuter dans l'éditeur SQL de Supabase
-- ============================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================
-- FORFAITS
-- ============================================
create table forfaits (
  id uuid primary key default uuid_generate_v4(),
  categorie text not null check (categorie in ('portraits_evenements', 'grands_forfaits')),
  nom text not null,
  sous_titre text,
  prix text not null,
  details text[] not null default '{}',
  populaire boolean default false,
  actif boolean default true,
  ordre integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TEXTES DU SITE (clé/valeur éditables)
-- ============================================
create table site_textes (
  id uuid primary key default uuid_generate_v4(),
  cle text unique not null,
  valeur text not null,
  description text,
  updated_at timestamptz default now()
);

-- ============================================
-- GALERIE PHOTOS
-- ============================================
create table galerie_photos (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  categorie text not null check (categorie in ('corporate', 'mariage', 'nature', 'portrait', 'evenement')),
  storage_path text not null,
  url_publique text not null,
  actif boolean default true,
  ordre integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- TRIGGER updated_at
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger forfaits_updated_at
  before update on forfaits
  for each row execute function set_updated_at();

create trigger site_textes_updated_at
  before update on site_textes
  for each row execute function set_updated_at();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
alter table forfaits enable row level security;
alter table site_textes enable row level security;
alter table galerie_photos enable row level security;

-- Lecture publique (portfolio visible par tous)
create policy "lecture publique forfaits"
  on forfaits for select using (actif = true);

create policy "lecture publique textes"
  on site_textes for select using (true);

create policy "lecture publique galerie"
  on galerie_photos for select using (actif = true);

-- Écriture uniquement pour les utilisateurs authentifiés (admin)
create policy "admin forfaits"
  on forfaits for all using (auth.role() = 'authenticated');

create policy "admin textes"
  on site_textes for all using (auth.role() = 'authenticated');

create policy "admin galerie"
  on galerie_photos for all using (auth.role() = 'authenticated');

-- Storage bucket pour les photos
insert into storage.buckets (id, name, public)
values ('galerie', 'galerie', true);

create policy "lecture publique storage"
  on storage.objects for select using (bucket_id = 'galerie');

create policy "upload admin storage"
  on storage.objects for insert
  with check (bucket_id = 'galerie' and auth.role() = 'authenticated');

create policy "delete admin storage"
  on storage.objects for delete
  using (bucket_id = 'galerie' and auth.role() = 'authenticated');

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Textes éditables
insert into site_textes (cle, valeur, description) values
  ('hero_titre_1', "L'image au", 'Héro — ligne 1 du titre'),
  ('hero_titre_2', 'service', 'Héro — mot doré central'),
  ('hero_titre_3', 'de votre récit', 'Héro — ligne 3 du titre'),
  ('hero_sous_titre', 'Photographie haut de gamme pour les professionnels, portraits, mariages et événements qui comptent.', 'Héro — sous-titre'),
  ('hero_localisation', 'Reims · France · Europe', 'Héro — localisation'),
  ('about_phrase_1', 'Capturer l''authentique,', 'About — phrase signature ligne 1'),
  ('about_phrase_2', 'sublimer l''ordinaire.', 'About — phrase signature ligne 2 (dorée)'),
  ('about_annees', '5+', 'About — années d''expérience'),
  ('about_couverture', 'FR·EU', 'About — couverture géographique'),
  ('footer_cta_titre', 'Parlons de votre projet', 'Footer — titre CTA'),
  ('footer_cta_sous_titre', 'Envie de travailler ensemble ?', 'Footer — sous-titre');

-- Forfaits Portraits & Événements
insert into forfaits (categorie, nom, sous_titre, prix, details, ordre) values
  ('portraits_evenements', 'Pack Flash', 'Portrait Solo · Animal', '79€',
   ARRAY['30 à 45 min de prise de vue', '3 photos retouchées avec soin', 'Livraison sous 7 jours'], 1),
  ('portraits_evenements', 'Portrait Pro', 'Profil LinkedIn · Pro', '149€',
   ARRAY['1h sur le lieu de votre choix', '7 photos retouchées avec soin', 'Idéal profil pro, LinkedIn, CV'], 2),
  ('portraits_evenements', 'Duo & Famille', 'Séance Famille', '179€',
   ARRAY['1h de prise de vue', '10 photos retouchées', 'Sélection personnalisée'], 3),
  ('portraits_evenements', 'Forfait Événementiel', 'Salon · Soirée · Fête', '350€',
   ARRAY['3h consécutives sur place', 'Reportage photo complet', '40 photos sélectionnées & retouchées'], 4);

-- Grands Forfaits
insert into forfaits (categorie, nom, sous_titre, prix, details, populaire, ordre) values
  ('grands_forfaits', 'Pack Premium', '12 photos + 3 offertes', '290€',
   ARRAY['12 photos retouchées', '2 thèmes possibles', 'Retouches avancées'], false, 1),
  ('grands_forfaits', 'Mariage — Grain d''Or', 'Demi-journée', '950€',
   ARRAY['Reportage photo complet', 'Montage soigné inclus', 'Couverture demi-journée'], true, 2),
  ('grands_forfaits', 'Mariage — L''Étoilé', 'Journée complète', '1650€',
   ARRAY['Journée entière', 'Prises de vues spéciales', 'Montage soigné premium'], false, 3);
