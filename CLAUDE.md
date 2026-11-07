# CYD Coach — werkafspraken

- Next.js 16 (App Router, `src/proxy.ts` in plaats van middleware), TypeScript strict, Tailwind v4, Supabase via `@supabase/ssr`.
  Raadpleeg bij twijfel de docs in `node_modules/next/dist/docs`.
- Alle UI-teksten en code-namen in het Nederlands (klanten, trajecten, metingen). Geen titel "diëtist" in de app: gebruik "coach".
- Huisstijl: groen `#4FAE35`, donkergroen `#2F7A1D`, Oswald voor koppen, Source Sans 3 voor tekst (lokaal in `src/app/fonts`).
- Datamodel staat in `supabase/migrations`. Wijzigingen altijd als nieuwe migratie, met RLS op elke tabel.
  Klantgegevens zijn alleen zichtbaar voor coaches van hetzelfde merk (`mag_klant`, `mijn_merken`).
- Nooit de service-role-sleutel in de app. Geen namen of contactgegevens naar AI sturen.
- Allergieën en "lust niet" worden in code hard gefilterd, niet aan AI overgelaten. Niets gaat naar een klant zonder akkoord van de coach.
- Voor het afronden: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`.
