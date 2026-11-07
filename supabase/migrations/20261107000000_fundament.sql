-- Fundament van het CYD-coachplatform.
-- Toegang: een coach ziet alleen klanten van de merken waaraan hij gekoppeld is.
-- Productdatabase, recepten en werkwijze-regels zonder merk zijn gedeeld; alleen beheerders mogen ze wijzigen.

-- ---------------------------------------------------------------------------
-- Coaches en merken
-- ---------------------------------------------------------------------------
create table public.coaches (
  id uuid primary key references auth.users (id) on delete cascade,
  naam text not null default '',
  email text not null,
  is_beheerder boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.merken (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  slug text not null unique,
  soort text not null default 'eigen' check (soort in ('eigen', 'zakelijk', 'whitelabel')),
  logo_url text,
  kleur_primair text not null default '#4FAE35',
  kleur_accent text not null default '#2F7A1D',
  afzender_naam text,
  afzender_email text,
  created_at timestamptz not null default now()
);

create table public.merk_coaches (
  merk_id uuid not null references public.merken (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  rol text not null default 'coach' check (rol in ('eigenaar', 'coach')),
  primary key (merk_id, coach_id)
);

-- Nieuwe gebruiker in Supabase Auth krijgt automatisch een coachrecord (zonder merk = zonder toegang).
create function public.nieuwe_coach() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.coaches (id, email, naam)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'naam', ''));
  return new;
end;
$$;

create trigger bij_nieuwe_gebruiker
after insert on auth.users
for each row execute function public.nieuwe_coach();

-- ---------------------------------------------------------------------------
-- Klanten en trajecten
-- ---------------------------------------------------------------------------
create table public.klanten (
  id uuid primary key default gen_random_uuid(),
  merk_id uuid not null references public.merken (id),
  voornaam text not null,
  achternaam text not null default '',
  email text,
  telefoon text,
  geboortedatum date,
  geslacht text check (geslacht in ('man', 'vrouw', 'anders')),
  woonplaats text,
  bedrijf text,
  status text not null default 'lead' check (status in ('lead', 'actief', 'gepauzeerd', 'afgerond')),
  factuur_naam text,
  factuur_adres text,
  factuur_email text,
  toestemming_gezondheid_op timestamptz,
  toestemming_ai boolean not null default false,
  nieuwsbrief boolean not null default true,
  primaire_coach uuid references public.coaches (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.klanten (merk_id);

create table public.trajecten (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  start_datum date not null,
  duur_weken integer check (duur_weken is null or duur_weken > 0), -- leeg = doorlopend
  doel text not null default 'afvallen'
    check (doel in ('afvallen', 'aankomen', 'gewicht_behouden', 'meer_energie', 'darmgezondheid', 'sportprestatie')),
  voedingscategorie text not null default 'normaal'
    check (voedingscategorie in ('normaal', 'vegetarisch', 'veganistisch', 'glutenvrij', 'lactosevrij',
                                 'gluten_en_lactosevrij', 'koolhydraatbeperkt', 'geen_vis', 'geen_vlees')),
  lust_niet text[] not null default '{}',
  allergieen text[] not null default '{}',
  kooktijd_max_min integer,
  mealprep boolean not null default false,
  verzend_dag smallint not null default 0 check (verzend_dag between 0 and 6), -- 0 = zondag
  verzend_tijd time not null default '18:00',
  energie_formule text not null default 'mifflin' check (energie_formule in ('mifflin', 'katch')),
  aanpassing_pct numeric(5, 1) not null default -15,
  eiwit_g_per_kg numeric(3, 1) not null default 1.8,
  eiwit_basis text not null default 'gewicht' check (eiwit_basis in ('gewicht', 'vetvrij')),
  is_actief boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.trajecten (klant_id);

create table public.intakes (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  antwoorden jsonb not null default '{}',
  ingevuld_op timestamptz not null default now()
);
create index on public.intakes (klant_id);

create table public.notities (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  coach_id uuid references public.coaches (id) default auth.uid(),
  datum date not null default current_date,
  onderwerp text not null,
  inhoud text not null default '',
  created_at timestamptz not null default now()
);
create index on public.notities (klant_id);

create table public.taken (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid references public.klanten (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) default auth.uid(),
  titel text not null,
  omschrijving text,
  deadline date,
  klaar boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.taken (coach_id, klaar);

create table public.metingen (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  datum date not null default current_date,
  lengte_cm numeric(5, 1),
  gewicht_kg numeric(5, 1),
  vet_pct numeric(4, 1),
  spier_pct numeric(4, 1),
  visceraal numeric(4, 1),
  borst_cm numeric(5, 1),
  taille_cm numeric(5, 1),
  heup_cm numeric(5, 1),
  biceps_mm numeric(4, 1),
  triceps_mm numeric(4, 1),
  rug_mm numeric(4, 1),
  buik_mm numeric(4, 1),
  pal numeric(3, 2) check (pal is null or pal between 1.2 and 2.5),
  notitie text,
  created_at timestamptz not null default now()
);
create index on public.metingen (klant_id, datum desc);

-- ---------------------------------------------------------------------------
-- Voeding: producten, recepten, variatielijsten, werkwijze-regels
-- ---------------------------------------------------------------------------
create table public.producten (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  bron text not null default 'eigen' check (bron in ('nevo', 'eigen')),
  bron_code text,
  groep text,
  kcal_100 numeric(6, 1) not null,
  eiwit_100 numeric(5, 1) not null default 0,
  kh_100 numeric(5, 1) not null default 0,
  vet_100 numeric(5, 1) not null default 0,
  vezel_100 numeric(5, 1),
  eenheid_naam text,      -- bijv. 'snee', 'stuk'
  eenheid_meervoud text,  -- bijv. 'sneeën'
  eenheid_gram numeric(6, 1),
  allergenen text[] not null default '{}',
  is_actief boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.producten using gin (to_tsvector('dutch', naam));

create table public.recepten (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  porties integer not null default 2,
  bereidingstijd_min integer,
  moeilijkheid text check (moeilijkheid in ('makkelijk', 'gemiddeld', 'uitdagend')),
  mealprep boolean not null default false,
  maaltijd text not null default 'avond' check (maaltijd in ('ontbijt', 'lunch', 'tussendoor', 'avond')),
  categorieen text[] not null default '{}',
  allergenen text[] not null default '{}',
  ingredienten jsonb not null default '[]', -- [{product_id, gram, tekst}]
  stappen jsonb not null default '[]',      -- ["stap 1", ...]
  kcal_portie numeric(6, 1),
  eiwit_portie numeric(5, 1),
  kh_portie numeric(5, 1),
  vet_portie numeric(5, 1),
  status text not null default 'concept' check (status in ('concept', 'goedgekeurd', 'archief')),
  bron text,
  opmerkingen text, -- twijfels uit het opschonen
  created_at timestamptz not null default now()
);

create table public.variatielijsten (
  id uuid primary key default gen_random_uuid(),
  merk_id uuid references public.merken (id) on delete cascade, -- leeg = voor iedereen
  titel text not null,
  maaltijd text not null check (maaltijd in ('ontbijt', 'lunch', 'tussendoor')),
  labels text[] not null default '{}', -- bijv. eiwitrijk, koolhydraatbeperkt
  items jsonb not null default '[]',    -- [{titel, onderdelen:[{product_id, gram}], kcal}]
  created_at timestamptz not null default now()
);

create table public.werkwijze_regels (
  id uuid primary key default gen_random_uuid(),
  merk_id uuid references public.merken (id) on delete cascade, -- leeg = voor iedereen
  naam text not null,
  signaal text not null,          -- bijv. 'ontbijt_overslaan'
  actie jsonb not null default '{}',
  advies_tekst text,
  is_actief boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Schema's
-- ---------------------------------------------------------------------------
create table public.schema_weken (
  id uuid primary key default gen_random_uuid(),
  klant_id uuid not null references public.klanten (id) on delete cascade,
  traject_id uuid not null references public.trajecten (id) on delete cascade,
  week_nr integer not null,
  start_datum date not null,
  status text not null default 'concept' check (status in ('concept', 'goedgekeurd', 'verstuurd')),
  advies jsonb not null default '[]', -- [{regel_id, tekst}]
  variatielijst_ids uuid[] not null default '{}',
  goedgekeurd_door uuid references public.coaches (id),
  goedgekeurd_op timestamptz,
  verstuurd_op timestamptz,
  created_at timestamptz not null default now(),
  unique (traject_id, week_nr)
);

create table public.schema_items (
  id uuid primary key default gen_random_uuid(),
  schema_week_id uuid not null references public.schema_weken (id) on delete cascade,
  dag smallint not null check (dag between 0 and 6), -- 0 = maandag
  maaltijd text not null check (maaltijd in ('ontbijt', 'lunch', 'tussendoor', 'avond', 'avondsnack')),
  positie integer not null default 0,
  product_id uuid references public.producten (id),
  recept_id uuid references public.recepten (id),
  gram numeric(6, 1),
  check ((product_id is not null and gram is not null) or recept_id is not null)
);
create index on public.schema_items (schema_week_id);

-- ---------------------------------------------------------------------------
-- Toegangsregels (RLS)
-- ---------------------------------------------------------------------------
create function public.is_beheerder() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select is_beheerder from public.coaches where id = auth.uid()), false);
$$;

create function public.mijn_merken() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select merk_id from public.merk_coaches where coach_id = auth.uid();
$$;

create function public.mag_klant(k uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.klanten kl
    join public.merk_coaches mc on mc.merk_id = kl.merk_id
    where kl.id = k and mc.coach_id = auth.uid()
  );
$$;

alter table public.coaches enable row level security;
alter table public.merken enable row level security;
alter table public.merk_coaches enable row level security;
alter table public.klanten enable row level security;
alter table public.trajecten enable row level security;
alter table public.intakes enable row level security;
alter table public.notities enable row level security;
alter table public.taken enable row level security;
alter table public.metingen enable row level security;
alter table public.producten enable row level security;
alter table public.recepten enable row level security;
alter table public.variatielijsten enable row level security;
alter table public.werkwijze_regels enable row level security;
alter table public.schema_weken enable row level security;
alter table public.schema_items enable row level security;

create policy "coach ziet zichzelf en collega's" on public.coaches for select to authenticated
  using (id = auth.uid() or public.is_beheerder() or id in (
    select coach_id from public.merk_coaches where merk_id in (select public.mijn_merken())));
create policy "coach wijzigt eigen naam" on public.coaches for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and is_beheerder = public.is_beheerder());

create policy "merken lezen" on public.merken for select to authenticated
  using (id in (select public.mijn_merken()) or public.is_beheerder());
create policy "merken beheren" on public.merken for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

create policy "koppelingen lezen" on public.merk_coaches for select to authenticated
  using (coach_id = auth.uid() or public.is_beheerder());
create policy "koppelingen beheren" on public.merk_coaches for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

create policy "klanten van eigen merken" on public.klanten for all to authenticated
  using (merk_id in (select public.mijn_merken()))
  with check (merk_id in (select public.mijn_merken()));

create policy "trajecten" on public.trajecten for all to authenticated
  using (public.mag_klant(klant_id)) with check (public.mag_klant(klant_id));
create policy "intakes" on public.intakes for all to authenticated
  using (public.mag_klant(klant_id)) with check (public.mag_klant(klant_id));
create policy "notities" on public.notities for all to authenticated
  using (public.mag_klant(klant_id)) with check (public.mag_klant(klant_id));
create policy "metingen" on public.metingen for all to authenticated
  using (public.mag_klant(klant_id)) with check (public.mag_klant(klant_id));
create policy "taken" on public.taken for all to authenticated
  using (coach_id = auth.uid() and (klant_id is null or public.mag_klant(klant_id)))
  with check (coach_id = auth.uid() and (klant_id is null or public.mag_klant(klant_id)));
create policy "schema_weken" on public.schema_weken for all to authenticated
  using (public.mag_klant(klant_id)) with check (public.mag_klant(klant_id));
create policy "schema_items" on public.schema_items for all to authenticated
  using (exists (select 1 from public.schema_weken w where w.id = schema_week_id and public.mag_klant(w.klant_id)))
  with check (exists (select 1 from public.schema_weken w where w.id = schema_week_id and public.mag_klant(w.klant_id)));

create policy "producten lezen" on public.producten for select to authenticated using (true);
create policy "producten beheren" on public.producten for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());
create policy "recepten lezen" on public.recepten for select to authenticated using (true);
create policy "recepten beheren" on public.recepten for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

create policy "variatielijsten lezen" on public.variatielijsten for select to authenticated
  using (merk_id is null or merk_id in (select public.mijn_merken()));
create policy "variatielijsten beheren" on public.variatielijsten for all to authenticated
  using (public.is_beheerder() or merk_id in (select public.mijn_merken()))
  with check (public.is_beheerder() or merk_id in (select public.mijn_merken()));

create policy "regels lezen" on public.werkwijze_regels for select to authenticated
  using (merk_id is null or merk_id in (select public.mijn_merken()));
create policy "regels beheren" on public.werkwijze_regels for all to authenticated
  using (public.is_beheerder()) with check (public.is_beheerder());

-- updated_at bijhouden
create function public.zet_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger klanten_updated before update on public.klanten
for each row execute function public.zet_updated_at();

-- Startmerk
insert into public.merken (naam, slug, soort, kleur_primair, kleur_accent, afzender_naam, afzender_email)
values ('Choose Your Diet', 'cyd', 'eigen', '#4FAE35', '#2F7A1D', 'Choose Your Diet', 'voedingsschema@chooseyourdiet.nl');
