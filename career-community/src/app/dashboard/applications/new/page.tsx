import Link from "next/link";
import { Icon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { ApplicationForm } from "../application-form";

export default async function NewApplicationPage() {
  if (hasSupabaseEnv) await requireUser("/dashboard/applications/new");
  return (
    <main className="shell page">
      <div className="dashboard-header"><div><Link className="small muted" href="/dashboard">← 返回求职台</Link><h1>新增岗位</h1><p>先记录最关键的信息，后续再补充面试和提醒。</p></div></div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <ApplicationForm />
        <aside className="stack">
          <div className="card"><div className="icon-box"><Icon name="shield" /></div><h3 className="card-title" style={{ marginTop: 14 }}>私密保存</h3><p className="card-copy">求职记录默认只允许当前用户读写，不会出现在个人主页或论坛广场。</p></div>
          <div className="card"><div className="icon-box"><Icon name="calendar" /></div><h3 className="card-title" style={{ marginTop: 14 }}>下一步设置面试</h3><p className="card-copy">保存岗位后，在详情页添加面试时间、时区和提前提醒。</p></div>
        </aside>
      </div>
    </main>
  );
}
