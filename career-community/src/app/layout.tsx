import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { hasSupabaseEnv, siteDescription, siteName } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL("https://liebstch.com"),
  title: { default: `${siteName} · 作品与求职社区`, template: `%s · ${siteName}` },
  description: siteDescription,
  openGraph: { title: `${siteName} · 作品与求职社区`, description: siteDescription, url: "https://liebstch.com", siteName },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  const headerUser = user ? {
    email: user.email,
    displayName: profile?.display_name ?? user.email?.split("@")[0] ?? "用户",
    role: profile?.role ?? "user",
  } : null;

  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader user={headerUser} demo={!hasSupabaseEnv} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
