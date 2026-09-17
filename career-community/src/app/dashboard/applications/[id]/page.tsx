import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getApplications, getInterviews } from "@/lib/data";
import { hasSupabaseEnv } from "@/lib/env";
import { formatDateTime, formatOffset, stageLabels, stageTone } from "@/lib/format";
import { InterviewForm } from "../interview-form";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (hasSupabaseEnv) await requireUser("/dashboard");
  const { id } = await params;
  const [applications, interviews] = await Promise.all([getApplications(), getInterviews()]);
  const application = applications.find((item) => item.id === id);
  if (!application) notFound();
  const related = interviews.filter((item) => item.applicationId === application.id);

  return (
    <main className="shell page">
      <div className="dashboard-header">
        <div><Link className="small muted" href="/dashboard">← 返回求职台</Link><h1>{application.company}</h1><p>{application.roleTitle} · {application.city || "城市待定"}</p></div>
        <div className="action-row"><Badge tone={`priority-${application.priority}`}>{`P${application.priority}`}</Badge><Badge tone={stageTone[application.stage]}>{stageLabels[application.stage]}</Badge></div>
      </div>

      <div className="dashboard-shell">
        <aside className="dashboard-nav"><a className="active" href="#overview">岗位信息</a><a href="#interviews">面试节点</a><a href="#add-interview">添加提醒</a><a href="/dashboard">返回列表</a></aside>
        <section className="dashboard-main">
          <div className="grid-2" id="overview">
            <div className="card"><h3 className="card-title">当前状态</h3><p className="card-copy">{application.statusNote || "尚未填写状态说明。"}</p><div className="divider" /><div className="grid-2"><div><div className="small muted">截止日期</div><strong>{application.deadlineAt || "未设置"}</strong></div><div><div className="small muted">下一行动</div><strong>{application.nextActionAt || "未安排"}</strong></div></div></div>
            <div className="card"><h3 className="card-title">提醒设计</h3><p className="card-copy">面试时间按 IANA 时区保存，邮件提醒默认提前 1 天和 2 小时。失败自动重试，发送日志可追踪。</p><div className="reminder-offsets" style={{ marginTop: 14 }}><Badge tone="blue">提前 1 天</Badge><Badge tone="blue">提前 2 小时</Badge><Badge tone="green">ICS 附件</Badge></div></div>
          </div>

          <section className="section" id="interviews">
            <div className="section-heading"><div><h2>面试节点</h2><p>一个岗位可以关联多个面试、测评、笔试或沟通会。</p></div></div>
            {related.length ? <div className="card timeline">{related.map((interview) => <div className="timeline-item" key={interview.id}><div className="timeline-time">{formatDateTime(interview.startsAt, interview.timezone)}</div><div className="timeline-content"><strong>{interview.title}</strong><small>{interview.location} · {interview.timezone}</small><div className="reminder-offsets">{interview.offsets.map((offset) => <Badge key={offset} tone="blue">{formatOffset(offset)}</Badge>)}</div></div></div>)}</div> : <div className="notice notice-blue"><Icon name="calendar" size={18} /><span>还没有面试节点。使用下方表单添加第一个时间和提醒。</span></div>}
          </section>

          <section className="section" id="add-interview">
            <InterviewForm applicationId={application.id} />
          </section>
        </section>
      </div>
    </main>
  );
}
