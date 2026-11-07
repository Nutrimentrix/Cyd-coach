import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, envCompleet } from "@/lib/env";

const OPENBAAR = ["/login", "/auth"];

/** Ververst de Supabase-sessie en stuurt niet-ingelogde bezoekers naar /login. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!envCompleet) return response;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lijst) => {
        lijst.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lijst.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const pad = request.nextUrl.pathname;
  if (!data.user && !OPENBAAR.some((p) => pad.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
