import Link from "next/link";
import { Icon } from "@/components/icons";
import { Badge, SectionHeading } from "@/components/ui";

const products = [
  { name: "小竹校友圈", type: "校园产品 · 核心", status: "已上线", description: "从 0 长出来的多校校园社区产品。我参与产品框架、用户体系、内容板块、互动插件和冷启动，注册用户 5.3 万，日活 4000+。", tags: ["0→1", "用户增长", "校园社区"], metrics: ["5.3w 注册用户", "4k+ 日活", "5+ 高校团队"] },
  { name: "liebstch 求职社区", type: "Vibe Coding · 正在产品化", status: "开发中", description: "当前这个项目：把私人求职跟踪、时区邮件提醒、公开面经广场和管理员治理放在同一套产品里。", tags: ["Next.js", "Supabase", "求职效率"], metrics: ["邮件提醒", "企业分区", "RLS 权限"] },
  { name: "《万物生长》", type: "出版物", status: "正式出版", description: "收录于校级刊物，由四川大学出版社正式出版。文字被印刷成纸、被更多人读到。", tags: ["中文写作", "出版", "内容创作"], metrics: ["1 次正式出版", "校级刊物"] },
  { name: "《消失的爱人》", type: "短视频", status: "第一名", description: "代表四川大学参加长虹高校创意短视频大赛并获得第一名，负责创意、脚本与内容表达。", tags: ["短视频", "脚本", "影像"], metrics: ["长虹赛事第 1", "原创内容"] },
  { name: "《秋风起》", type: "原创剧本", status: "获奖", description: "原创剧本，获四川大学影视文化艺术节奖。用中文系的文字功底和影像语言讲一个完整故事。", tags: ["剧本", "影像", "叙事"], metrics: ["影艺节获奖", "原创剧本"] },
];

const skills = [
  ["0→1 产品冷启动", "用户体系、内容板块、互动插件、产品框架"],
  ["数据驱动运营", "AARRR、留存分析、Power Query、Excel 透视"],
  ["文案与内容创作", "商业文案、故事写作、剧本、深度长文"],
  ["新媒体运营", "公众号、视频号、抖音、IP 打造"],
  ["Vibe Coding", "AI 辅助开发、SQL、快速原型、把想法做出来"],
];

const journey = [
  { date: "2024.09 – 至今", title: "小竹校友圈 · 联合发起人", org: "柳岸网络科技", copy: "0→1 设计产品框架，完成 1.0 上线并迭代；注册用户 5.3w / 日活 4000+。" },
  { date: "2024.09 – 至今", title: "招生宣传融媒体中心 · 副会长", org: "四川大学", copy: "统筹官方融媒体矩阵，主导招生宣传视频策划、拍摄、剪辑与发布。" },
  { date: "2024 – 2025", title: "校园市场经理", org: "中国联合网络通信", copy: "搭建校园私域流量池，整合视频号等渠道实现用户增长 1w+。" },
  { date: "2023.09 – 2027.06", title: "汉语言文学 · 本科在读", org: "四川大学（985）", copy: "GPA 3.72/4.0，专业前 30%；校级单项一等奖学金。" },
];

export default function PortfolioPage() {
  return (
    <main className="shell page">
      <section className="page-hero">
        <div className="eyebrow">HUANG HAODONG · PORTFOLIO</div>
        <h1>黄浩东（大头）的作品与经历，继续在这个网站里生长。</h1>
        <p>985 中文系 + 0→1 创业者。这里把原有个人主页中的产品、出版物、短视频、剧本和经历重新组织，并加入正在建设的 liebstch 求职社区。</p>
        <div className="page-actions"><a className="button button-dark" href="mailto:hello@liebstch.com">联系我 <Icon name="arrow" size={16} /></a><Link className="button" href="/community">查看公开复盘</Link></div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="SELECTED WORK" title="作品与项目" description="不只展示结果，也保留产品判断、执行动作和可验证指标。" />
        <div className="stack">
          {products.map((product, index) => (
            <article className="card" key={product.name} style={{ display: "grid", gridTemplateColumns: "74px minmax(0, 1fr) auto", gap: 20, alignItems: "start" }}>
              <div className="stat-value" style={{ color: "var(--soft)" }}>0{index + 1}</div>
              <div>
                <div className="post-meta"><Badge tone={index === 1 ? "violet" : index === 2 ? "amber" : "blue"}>{product.type}</Badge><Badge tone={product.status.includes("开发") ? "green" : "neutral"}>{product.status}</Badge></div>
                <h2 style={{ margin: "10px 0 7px", fontSize: 24 }}>{product.name}</h2>
                <p className="card-copy" style={{ maxWidth: 760 }}>{product.description}</p>
                <div className="tag-list" style={{ marginTop: 13 }}>{product.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                <div className="tag-list" style={{ marginTop: 13 }}>{product.metrics.map((metric) => <span className="chip" key={metric}>{metric}</span>)}</div>
              </div>
              <Link className="button button-small" href={index === 1 ? "/dashboard" : "/community"}>{index === 1 ? "进入产品" : "查看复盘"}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="SKILLS" title="能力栈" description="从产品、内容到数据与协作，技能都来自真实项目中的反复使用。" />
        <div className="grid-2">
          {skills.map(([name, copy], index) => (
            <div className="card" key={name}><div className="post-meta"><Badge tone={index === 4 ? "violet" : "blue"}>{name}</Badge></div><p className="card-copy" style={{ marginTop: 12 }}>{copy}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="JOURNEY" title="经历时间线" description="做过产品、内容和增长，也持续把中文表达与互联网方法结合。" />
        <div className="card timeline">
          {journey.map((item) => <div className="timeline-item" key={`${item.date}-${item.title}`}><div className="timeline-time">{item.date}</div><div className="timeline-content"><strong>{item.title}</strong><small>{item.org}</small><p className="card-copy" style={{ marginTop: 5 }}>{item.copy}</p></div></div>)}
        </div>
      </section>
    </main>
  );
}
