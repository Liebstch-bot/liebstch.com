import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { PostForm } from "../post-form";

export const metadata = { title: "发布面经" };

export default async function NewPostPage() {
  if (hasSupabaseEnv) await requireUser("/community/new");
  return (
    <main className="shell page">
      <div className="dashboard-header"><div><Link className="small muted" href="/community">← 返回广场</Link><h1>发布岗位 / 面经</h1><p>结构化的背景信息会让你的经验对更多人有用。</p></div></div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <PostForm />
        <aside className="stack">
          <div className="card"><h3 className="card-title">建议写清楚</h3><div className="stack-sm muted small"><span>岗位和公司：至少让读者知道讨论对象。</span><span>时间线：投递、笔试、面试分别发生在什么时候。</span><span>问题与回答：尽量写出你的判断框架。</span><span>结果和复盘：哪些准备真正有帮助。</span></div></div>
          <div className="notice notice-amber"><strong>隐私提醒</strong><span>不要发布面试官个人信息、未公开的内部材料或可识别到具体个人的内容。</span></div>
        </aside>
      </div>
    </main>
  );
}
