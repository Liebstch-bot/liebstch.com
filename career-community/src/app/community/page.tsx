import Link from "next/link";
import { Icon } from "@/components/icons";
import { Avatar, Badge } from "@/components/ui";
import { getPublicPosts } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { COMPANY_CATEGORIES, getCompanyCategory } from "@/lib/taxonomy";

export const metadata = { title: "论坛广场" };

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const activeCategory = COMPANY_CATEGORIES.some((category) => category.id === params.category) ? params.category : "all";
  const allPosts = await getPublicPosts(100);
  const posts = activeCategory === "all" ? allPosts : allPosts.filter((post) => post.companyCategory === activeCategory);
  const featured = posts[0];
  const trending = ["AI产品", "成都", "一面复盘", "管培生", "大模型"];
  const categoryCounts = Object.fromEntries(COMPANY_CATEGORIES.map((category) => [category.id, allPosts.filter((post) => post.companyCategory === category.id).length]));
  const distribution = [...COMPANY_CATEGORIES].sort((a, b) => (categoryCounts[b.id] ?? 0) - (categoryCounts[a.id] ?? 0));
  const maxCount = Math.max(1, ...Object.values(categoryCounts));

  return (
    <main className="shell page">
      <section className="page-hero">
        <div className="eyebrow">PUBLIC COMMUNITY · 企业分区</div>
        <h1>真实岗位信息与面试复盘，帮助下一个人少走一点弯路。</h1>
        <p>访客可以阅读公开内容。登录后可以发帖、评论、点赞、举报，也可以在发布时选择央国企、互联网大厂、制造业、快消、外企等企业分类。</p>
        <div className="page-actions"><Link className="button button-dark" href="/community/new"><Icon name="plus" size={16} />发布面经 / Idea</Link><Link className="button" href="/dashboard">记录我的求职</Link></div>
      </section>

      <section className="community-category-section">
        <div className="community-category-head">
          <div><h2>按企业类型逛广场</h2><p>先从你正在投递的行业开始，帖子发布时会同步选择分类标签。</p></div>
          <Badge tone="violet">企业分布实时统计</Badge>
        </div>
        <nav className="category-nav" aria-label="企业类型导航">
          <Link className={`category-nav-item${activeCategory === "all" ? " active" : ""}`} href="/community">
            <span className="category-count">{allPosts.length}</span><strong>全部</strong><small>所有行业</small>
          </Link>
          {COMPANY_CATEGORIES.map((category) => (
            <Link className={`category-nav-item${activeCategory === category.id ? " active" : ""}`} href={`/community?category=${category.id}`} key={category.id}>
              <span className="category-count">{categoryCounts[category.id] ?? 0}</span><strong>{category.label}</strong><small>{category.short}</small>
            </Link>
          ))}
        </nav>
      </section>

      <div className="community-layout">
        <section>
          <div className="feed-tabs"><a className="active" href={activeCategory === "all" ? "/community" : `/community?category=${activeCategory}`}>最新</a><a href="#">热门</a><a href="#">面试复盘</a><a href="#">岗位分享</a><a href="#">Offer 经验</a></div>
          <div className="post-list">
            {posts.map((post) => {
              const category = getCompanyCategory(post.companyCategory);
              return (
                <article className={`post-card${post.featured ? " featured" : ""}`} key={post.id}>
                  <div className="post-top"><div><div className="post-meta"><Badge tone="blue">{category.label}</Badge><Badge>{post.company}</Badge>{post.city ? <span>{post.city}</span> : null}<span>{post.roleTitle}</span></div><h2 className="post-title" style={{ marginTop: 8 }}><Link href={`/community/${post.id}`}>{post.title}</Link></h2></div>{post.featured ? <Badge tone="violet">精选</Badge> : null}</div>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="tag-list">{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                  <div className="post-footer"><div className="post-author"><Avatar name={post.author} size="sm" /><span>{post.author} · {formatDateTime(post.publishedAt)}</span></div><div className="post-stats"><span>{post.comments} 评论</span><span>{post.likes} 赞</span></div></div>
                </article>
              );
            })}
            {posts.length === 0 ? <div className="empty-state">这个企业分类暂时还没有帖子，欢迎发布第一篇。</div> : null}
          </div>
        </section>

        <aside className="stack">
          <div className="sidebar-card">
            <h3>企业分布</h3>
            <p className="small muted">按当前公开帖子统计，用于观察大家最活跃的求职赛道。</p>
            <div className="company-distribution">
              {distribution.map((category) => (
                <div className="company-distribution-row" key={category.id}>
                  <span>{category.label}</span>
                  <div className="company-distribution-bar"><div className={`company-distribution-fill${category.id === "big_tech" ? " yellow" : ""}`} style={{ width: `${Math.max(4, ((categoryCounts[category.id] ?? 0) / maxCount) * 100)}%` }} /></div>
                  <strong>{categoryCounts[category.id] ?? 0}</strong>
                </div>
              ))}
            </div>
          </div>
          {featured ? <div className="sidebar-card"><h3>本周精选</h3><p className="card-copy">{featured.title}</p><Link className="button button-small" style={{ marginTop: 13 }} href={`/community/${featured.id}`}>阅读</Link></div> : null}
          <div className="sidebar-card"><h3>热门标签</h3><div className="tag-list">{trending.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
          <div className="sidebar-card"><h3>社区规则</h3><div className="stack-sm muted small"><span>真实具体，不发布未经确认的私人信息。</span><span>尊重不同背景和阶段的求职者。</span><span>商业推广、攻击性内容和隐私泄露会被处理。</span></div></div>
          <div className="notice notice-blue"><Icon name="shield" size={18} /><span>论坛内容公开可读，但发帖、评论和点赞必须登录。</span></div>
        </aside>
      </div>
    </main>
  );
}
