import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, ProgressBar, StatCard } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getApplications, getInterviews } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatDateTime, formatOffset, stageLabels, stageTone } from "@/lib/format";

const stageProgress: Record<string, number> = { wishlist: 15, applied: 35, assessment: 55, interview: 75, offer: 100, rejected: 100, withdrawn: 100 };

export default async function DashboardPage() {
  if (hasSupabaseEnv) await requireUser("/dashboard");
  const [applications, interviews] = await Promise.all([getApplications(), getInterviews()]);
  const active = applications.filter((item) => !["rejected", "withdrawn"].includes(item.stage));
  const pending = applications.filter((item) => item.stage === "wishlist").length;
  const interviewing = applications.filter((item) => item.stage === "interview").length;
  const offers = applications.filter((item) => item.stage === "offer").length;

  return (
    <main className="shell page">
      <div className="dashboard-shell">
        <aside className="dashboard-nav">
          <a className="active" href="#overview">总览</a><a href="#applications">全部岗位</a><a href="#reminders">邮件提醒</a><a href="/dashboard/applications/new">新增岗位</a><a href="/login">账号设置</a>
        </aside>
        <section className="dashboard-main">
          <div className="dashboard-header">
            <div><h1>我的求职台</h1><p>岗位数据和邮件提醒默认只对当前账号可见。</p></div>
            <div className="action-row"><Link className="button button-dark" href="/dashboard/applications/new"><Icon name="plus" size={16} />新增岗位</Link><Link className="button" href="/community">浏览社区经验</Link></div>
          </div>

          <div className="stat-grid" id="overview">
            <StatCard label="全部岗位" value={applications.length} meta={`${active.length} 个仍在推进`} />
            <StatCard label="准备投递" value={pending} meta="建议先处理 P0" tone="amber" />
            <StatCard label="面试中" value={interviewing} meta="含待安排与等待结果" tone="violet" />
            <StatCard label="Offer" value={offers} meta="最终决策阶段" tone="green" />
          </div>

          <section className="section" id="applications">
            <div className="section-heading"><div><h2>岗位进度</h2><p>点击岗位打开详情，并为面试、测评或笔试设置邮件提醒。</p></div><Link className="button button-small" href="/dashboard/applications/new">新增</Link></div>
            <div className="application-list">
              {applications.map((item) => (
                <Link className="application-row" href={`/dashboard/applications/${item.id}`} key={item.id}>
                  <div className="application-main"><div className="application-title"><span>{item.company}</span><Badge tone={`priority-${item.priority}`}>{`P${item.priority}`}</Badge></div><div className="application-role">{item.roleTitle} · {item.city || "城市待定"}</div></div>
                  <div><Badge tone={stageTone[item.stage]}>{stageLabels[item.stage]}</Badge></div>
                  <div className="application-progress"><ProgressBar value={stageProgress[item.stage] ?? 20} /><span className="small muted">{stageProgress[item.stage] ?? 20}%</span></div>
                  <div className="application-date">{item.nextActionAt ? `下一步 ${item.nextActionAt}` : "未安排日期"}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="section" id="reminders">
            <div className="section-heading"><div><h2>面试与提醒时间线</h2><p>面试时间按用户时区保存，提醒偏移会在数据库中转换成 UTC 发送时间。</p></div><Link className="button button-small" href={`/dashboard/applications/${interviews[0]?.applicationId || "app-1"}`}>设置提醒</Link></div>
            <div className="card timeline">
              {interviews.map((interview) => (
                <div className="timeline-item" key={interview.id}>
                  <div className="timeline-time">{formatDateTime(interview.startsAt, interview.timezone)}</div>
                  <div className="timeline-content"><strong>{interview.company} · {interview.title}</strong><small>{interview.location} · {interview.timezone}</small><div className="reminder-offsets">{interview.offsets.map((offset) => <Badge key={offset} tone={interview.status === "sent" && offset === interview.offsets[0] ? "green" : "blue"}>{formatOffset(offset)} · 邮件</Badge>)}</div></div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="notice notice-blue"><Icon name="shield" size={20} /><div><strong>隐私边界已由数据库执行</strong><p className="small" style={{ margin: "3px 0 0" }}>applications、interview_events 和 reminders 没有管理员读取策略。管理员只能管理账号资料和公开论坛内容。</p></div></div>
          </section>
        </section>
      </div>
    </main>
  );
}

