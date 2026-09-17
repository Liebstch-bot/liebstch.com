"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 环境变量尚未配置");
  }
  if (!browserClient) browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
