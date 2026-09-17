import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase 环境变量尚未配置");
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as any));
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes them instead.
        }
      },
    },
  });
}

