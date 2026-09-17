"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui";

type HeaderUser = { email?: string | null; displayName?: string | null; role?: string | null } | null;

const links = [
  { href: "/portfolio", label: "作品集" },
  { href: "/community", label: "论坛广场" },
  { href: "/dashboard", label: "我的求职台" },
];

export function SiteHeader({ user, demo = false }: { user: HeaderUser; demo?: boolean }) {
  const pathname = usePathname();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "访客";

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="liebstch 首页">
          <span className="brand-mark">L</span>
          <span>
            <strong>liebstch</strong>
            <small>黄浩东 · 大头</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""}>{link.label}</Link>;
          })}
          {user?.role === "admin" ? <Link href="/admin" className={pathname.startsWith("/admin") ? "active admin-link" : "admin-link"}>管理后台</Link> : null}
        </nav>
        <div className="header-actions">
          {demo ? <span className="demo-pill">演示模式</span> : null}
          {user ? (
            <div className="user-menu">
              <Avatar name={displayName} size="sm" />
              <span className="user-name">{displayName}</span>
              <form action="/auth/signout" method="post"><button type="submit" className="text-button">退出</button></form>
            </div>
          ) : (
            <Link href="/login" className="button button-dark button-small"><Icon name="mail" size={16} />邮箱登录</Link>
          )}
        </div>
      </div>
    </header>
  );
}

