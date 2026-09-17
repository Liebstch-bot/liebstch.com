import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  if (!hasSupabaseEnv) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user || !hasSupabaseEnv) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}

export async function requireUser(next = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || profile.status !== "active") redirect("/dashboard");
  return profile;
}
