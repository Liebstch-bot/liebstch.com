import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, ProgressBar, SectionHeading } from "@/components/ui";
import { demoInterviews, demoPosts } from "@/lib/demo-data";
import { formatDateTime, formatOffset } from "@/lib/format";

const features = [
  { icon: "dashboard" as const, title: "私人求职跟踪台", copy: "岗位、投递、测评、面试和 Offer 全部在一处更新，私人数据默认仅本人可见。" },
  { icon: "mail" as const, title: "面向时区的邮件提醒", copy: "保存 IANA 时区，支持提前 1 天、2 小时等偏移，同时把提醒写入发送日志。" },
  { icon: "community" as const, title: "公开面经社区", copy: "分享岗位和面试复盘，支持评论、点赞、标签搜索与内容治理。" },
  { icon: "shield" as const, title: "数据库级权限边界", copy: "RLS 隔离私人数据、公开社区和管理员操作，管理员默认看不到求职记录。" },
];

export default function HomePage() {
  const nextInterview = demoInterviews[0];
  const featuredPost = demoPosts.find((post) => post.featured) ?? demoPosts[0];

  return (
    <main>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <div className="hero-kicker"><span>#青衫求职</span><strong>LIEBSTCH · CAREER OS</strong></div>
            <h1>把作品、求职过程和真实经验，放在同一个长期生长的网站里。</h1>
            <p className="hero-lead">我是黄浩东（大头），四川大学中文系、0→1 创业者。liebstch.com 从个人作品集升级为求职社区：你可以私密管理投递进度，按时收到面试提醒，也可以把有价值的岗位和面经公开分享给其他人。</p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/dashboard">进入求职台 <Icon name="arrow" size={16} /></Link>
              <Link className="button" href="/community">浏览论坛广场</Link>
            </div>
            <div className="hero-note"><span /> 私人求职数据与公开论坛通过数据库 RLS 严格隔离</div>
          </div>
          <div className="hero-demo">
            <div className="demo-top"><div className="demo-title">接下来 72 小时</div><Badge tone="blue">Asia/Shanghai</Badge></div>
            <div className="demo-list">
              {demoInterviews.slice(0, 3).map((item) => (
                <div className="demo-row" key={item.id}>
                  <div><strong>{item.company} · {item.title}</strong><small>{item.location} · {item.offsets.map(formatOffset).join(" / ")}</small></div>
                  <div className="demo-date">{formatDateTime(item.startsAt, item.timezone)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell section">
        <SectionHeading eyebrow="WHAT YOU GET" title="一个产品，三层体验" description="公开主页负责表达，私人工作台负责执行，社区负责连接。" />
        <div className="grid-4">
          {features.map((feature) => (
            <div className="card" key={feature.title}>
              <div className="icon-box"><Icon name={feature.icon} /></div>
              <h3 className="card-title" style={{ marginTop: 15 }}>{feature.title}</h3>
              <p className="card-copy">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="dashboard-shell">
          <div className="dashboard-nav">
            <a href="#tracker" className="active">求职总览</a><a href="#reminders">邮件提醒</a><a href="#privacy">隐私边界</a>
          </div>
          <div className="dashboard-main">
            <SectionHeading eyebrow="PRIVATE WORKSPACE" title="你的求职进度不需要公开" description="登录后的记录只保存在你的账号下。管理员页面有社区治理权限，但没有私人求职记录的访问策略。" />
            <div id="tracker" className="grid-3">
              <div className="card"><div className="stat-label">待推进节点</div><div className="stat-value">6</div><div className="stat-meta">未来 14 天</div></div>
              <div className="card"><div className="stat-label">准备度</div><div className="stat-value">72%</div><div style={{ marginTop: 12 }}><ProgressBar value={72} /></div></div>
              <div className="card"><div className="stat-label">邮箱提醒</div><div className="stat-value">4</div><div className="stat-meta">已启用 2 个偏移</div></div>
            </div>
            <div id="reminders" className="card-soft" style={{ marginTop: 16 }}>
              <div className="card-top"><div><strong>提醒不是普通站内通知</strong><p className="card-copy">每个提醒都有独立状态、重试次数、幂等键和发送日志，附件包含可直接导入日历的 ICS 文件。</p></div><Badge tone="green">幂等发送</Badge></div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell section">
        <SectionHeading eyebrow="PUBLIC COMMUNITY" title="真实经验会被看见" description="公开内容允许访客阅读，登录用户可以发帖、评论和点赞。" action={<Link className="button" href="/community">进入广场 <Icon name="arrow" size={15} /></Link>} />
        <div className="grid-3">
          {demoPosts.slice(0, 3).map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-meta"><Badge tone="blue">{post.company}</Badge><span>{post.city}</span></div>
              <h3 className="post-title"><Link href={`/community/${post.id}`}>{post.title}</Link></h3>
              <p className="post-excerpt">{post.excerpt}</p>
              <div className="post-footer"><span className="muted small">{post.author} · {post.comments} 条评论</span><span className="muted small">{post.likes} 赞</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="card" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 20, alignItems: "center" }}>
          <div><Badge tone="violet">精选面经</Badge><h2 style={{ margin: "10px 0 7px", fontSize: 24 }}>{featuredPost.title}</h2><p className="card-copy">{featuredPost.excerpt}</p></div>
          <Link className="button button-blue" href={`/community/${featuredPost.id}`}>阅读全文</Link>
        </div>
      </section>
    </main>
  );
}



