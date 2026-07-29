import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

/** Refresh Supabase Auth session cookies on each request (Next.js proxy). */
export async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return response;
  }

  let nextResponse = response;

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        nextResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          nextResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();
  return nextResponse;
}
