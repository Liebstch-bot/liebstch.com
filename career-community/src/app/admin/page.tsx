import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, SectionHeading, StatCard } from "@/components/ui";
import { demoAdminUsers, demoEmailLogs, demoPosts } from "@/lib/demo-data";

export default function AdminDashboardPage() {
  return (
    <>
      <div className="admin-header"><div><h1>运营总览</h1><p>管理员管理账号、版主、公开内容和邮件发送状态，不读取用户私人求职记录。</p></div><Badge tone="violet">管理员权限</Badge></div>
      <div className="stat-grid">
        <StatCard label="注册用户" value={demoAdminUsers.length} meta="演示数据" />
        <StatCard label="待审核内容" value="2" meta="举报与隐藏内容" tone="amber" />
        <StatCard label="今日邮件" value={demoEmailLogs.length} meta="含重试与失败" tone="blue" />
        <StatCard label="社区帖子" value={demoPosts.length} meta="公开已发布" tone="green" />
      </div>
      <section className="section">
        <SectionHeading title="管理边界" description="后台权限与用户数据权限分开管理。" />
        <div className="grid-4">
          <Link className="card" href="/admin/users"><div className="icon-box"><Icon name="user" /></div><h3 className="card-title" style={{ marginTop: 14 }}>用户与角色</h3><p className="card-copy">设置版主、封禁账号、查看注册状态。</p></Link>
          <Link className="card" href="/admin/moderation"><div className="icon-box"><Icon name="shield" /></div><h3 className="card-title" style={{ marginTop: 14 }}>内容审核</h3><p className="card-copy">处理举报、隐藏内容和记录审核动作。</p></Link>
          <Link className="card" href="/admin/email-logs"><div className="icon-box"><Icon name="mail" /></div><h3 className="card-title" style={{ marginTop: 14 }}>邮件日志</h3><p className="card-copy">检查送达、失败、重试和供应商消息 ID。</p></Link>
          <div className="card"><div className="icon-box"><Icon name="shield" /></div><h3 className="card-title" style={{ marginTop: 14 }}>私人数据隔离</h3><p className="card-copy">applications 和 interview_events 没有管理员读取策略。</p></div>
        </div>
      </section>
      <section className="section">
        <div className="notice notice-violet"><Icon name="shield" size={20} /><div><strong>高风险操作必须写审计日志</strong><p className="small" style={{ margin: "3px 0 0" }}>角色、封禁和内容状态变化都会记录 actor_id、目标对象、动作和时间。</p></div></div>
      </section>
    </>
  );
}
