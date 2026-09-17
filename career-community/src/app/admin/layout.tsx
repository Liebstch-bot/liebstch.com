import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (hasSupabaseEnv) await requireAdmin();
  return (
    <main className="shell page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-label">Admin</div>
          <Link href="/admin">运营总览</Link>
          <Link href="/admin/users">用户与角色</Link>
          <Link href="/admin/moderation">内容审核</Link>
          <Link href="/admin/email-logs">邮件日志</Link>
          <Link href="/">返回网站</Link>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
