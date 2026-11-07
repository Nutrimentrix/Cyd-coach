// Alleen publieke sleutels: de toegang wordt in de database afgedwongen met RLS.
// Gebruik hier nooit de service-role-sleutel.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
};

export const envCompleet = Boolean(env.supabaseUrl && env.supabaseKey);
