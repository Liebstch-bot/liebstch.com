import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Badge } from "@/components/ui";
import { getComments, getPostById } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { getCompanyCategory } from "@/lib/taxonomy";
import { CommentForm, PostActions } from "../post-actions";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, comments] = await Promise.all([getPostById(id), getComments(id)]);
  if (!post) notFound();
  const category = getCompanyCategory(post.companyCategory);

  return (
    <main className="shell page">
      <div className="post-detail">
        <article className="article">
          <Link className="small muted" href="/community">← 返回论坛广场</Link>
          <div className="post-meta" style={{ marginTop: 18 }}><Badge tone="blue">{category.label}</Badge><Badge>{post.company}</Badge><span>{post.roleTitle}</span><span>{post.city}</span></div>
          <h1 style={{ marginTop: 14 }}>{post.title}</h1>
          <div className="post-author"><Avatar name={post.author} /><span>{post.author} · {formatDateTime(post.publishedAt)}</span></div>
          <div className="tag-list" style={{ marginTop: 16 }}>{post.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          <div className="article-body">{post.content.split(/\n\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <div className="divider" />
          <PostActions postId={post.id} initialLikes={post.likes} />
          <section className="comment-section">
            <h2 style={{ fontSize: 19 }}>讨论 {comments.length}</h2>
            {comments.map((comment) => <div className="comment" key={comment.id}><Avatar name={comment.author} size="md" /><div><div className="comment-head"><span className="comment-author">{comment.author}</span><span className="comment-time">{formatDateTime(comment.createdAt)}</span></div><p className="comment-copy">{comment.content}</p></div></div>)}
            <div style={{ marginTop: 16 }}><CommentForm postId={post.id} /></div>
          </section>
        </article>

        <aside className="stack">
          <div className="sidebar-card"><h3>作者</h3><div className="post-author"><Avatar name={post.author} size="lg" /><div><strong>{post.author}</strong><div className="small muted">@{post.authorHandle}</div></div></div><p className="card-copy" style={{ marginTop: 12 }}>分享真实求职经验，也欢迎指出补充信息。</p></div>
          <div className="sidebar-card"><h3>内容提醒</h3><p className="card-copy small">面经只代表个人经历，岗位要求会随时间变化。请以公司最新招聘信息为准。</p></div>
          <div className="sidebar-card"><h3>需要治理？</h3><p className="card-copy small">如果内容包含隐私泄露、攻击或无效信息，可以登录后举报，版主会进入审核队列。</p><button className="button button-small" type="button">举报内容</button></div>
        </aside>
      </div>
    </main>
  );
}


