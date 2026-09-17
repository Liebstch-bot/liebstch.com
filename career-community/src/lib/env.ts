export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "liebstch";
export const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "作品、求职记录与公开面经社区";
