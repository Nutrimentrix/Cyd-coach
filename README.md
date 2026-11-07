# CYD Coach

Coachomgeving van Choose Your Diet: klantdossiers, metingen met behoefteberekening, notities en taken.
Later volgen de schema-bouwer, recepten, variatielijsten, verzending in de huisstijl van elk merk en een klant-app.

Gebouwd met Next.js 16, TypeScript, Tailwind CSS en Supabase (database, inloggen en toegangsregels).

## Wat er nu in zit (fundament)

- Inloggen met een link per e-mail. Alleen coaches die een beheerder heeft aangemaakt kunnen inloggen.
- **Merken**: Choose Your Diet, en later CYD for Work of een whitelabel-studio. Een coach ziet alleen klanten van zijn eigen merken; dat wordt in de database afgedwongen.
- **Klanten**: lijst met zoeken en filteren op status, nieuwe klant aanmaken.
- **Dossier**: gegevens, facturatie, toestemmingen (gezondheidsgegevens, AI, nieuwsbrief) en trajecten (start, duur, doel, voedingscategorie, allergieën, lust niet, kooktijd, mealprep, verzenddag en -tijd, instellingen voor de behoefte).
- **Metingen** met behoefteberekening: Mifflin-St Jeor als standaard en Katch-McArdle op basis van vetvrije massa, × PAL, met advies en eiwit volgens het actieve traject.
- **Notities** en **taken** per klant.
- Het volledige datamodel voor de volgende stappen staat er al: producten, recepten, variatielijsten, werkwijze-regels en weekschema's.

## Eenmalig instellen

1. **Supabase-project** aanmaken in een **EU-regio** (bijvoorbeeld Frankfurt).
2. In Supabase > **SQL Editor** de inhoud van `supabase/migrations/20261107000000_fundament.sql` uitvoeren.
   (Of met de Supabase CLI: `supabase link` en daarna `supabase db push`.)
3. In Supabase > **Authentication > Sign In / Providers**: e-mail aan laten staan en **"Allow new users to sign up" uitzetten**.
   Bij **URL Configuration** de adressen van de app toevoegen als Redirect URL, bijvoorbeeld
   `http://localhost:3000/auth/callback` en `https://<jouw-domein>/auth/callback`.
4. Jezelf toevoegen via **Authentication > Users > Add user** (met je e-mailadres). Daarna in de SQL Editor:
   ```sql
   update public.coaches set naam = 'Dylan', is_beheerder = true where email = 'jouw@email.nl';
   insert into public.merk_coaches (merk_id, coach_id, rol)
   select m.id, c.id, 'eigenaar' from public.merken m, public.coaches c
   where m.slug = 'cyd' and c.email = 'jouw@email.nl';
   ```
5. `.env.example` kopiëren naar `.env.local` en de URL en de publishable key invullen
   (Supabase > Project Settings > API). Bij hosting (bijvoorbeeld Vercel) dezelfde twee variabelen instellen.

## Lokaal draaien

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # rekentests
npm run lint
npm run typecheck
```

## Privacy

Er worden gezondheidsgegevens verwerkt (AVG artikel 9). Daarom:
- data staat in een EU-regio en toegang loopt via Row Level Security per merk;
- de app gebruikt alleen de publieke sleutel, nooit de service-role-sleutel;
- toestemming voor gezondheidsgegevens en voor AI wordt per klant vastgelegd;
- lettertypes staan lokaal, zodat er geen verzoeken naar Google gaan;
- naar een AI-model gaan straks nooit namen of contactgegevens mee.

Sluit met Supabase en de hostingpartij een verwerkersovereenkomst af.
