import { Badge } from "@/components/ui";
import { demoPosts } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { moderatePost } from "../actions";

export const dynamic = "force-dynamic";

async function loadPosts() {
  if (!hasSupabaseEnv || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoPosts.map((post) => ({ id: post.id, title: post.title, author: post.author, company: post.company, status: "published" }));
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("posts").select("id,title,company,moderation_status,profiles(display_name)").order("created_at", { ascending: false }).limit(100);
  return (data ?? []).map((post: any) => ({ id: post.id, title: post.title, author: post.profiles?.display_name ?? "匿名用户", company: post.company, status: post.moderation_status }));
}

export default async function ModerationPage() {
  const posts = await loadPosts();
  return (
    <>
      <div className="admin-header"><div><h1>内容审核</h1><p>处理公开帖子、评论和举报。隐藏与删除都写入 moderation_actions 审计日志。</p></div><Badge tone="amber">审核队列</Badge></div>
      <div className="notice notice-blue" style={{ marginBottom: 16 }}>管理员只能处理公开社区内容，不能借此权限读取用户的私人求职记录。</div>
      <div className="table-shell">
        <table className="data-table"><thead><tr><th>帖子</th><th>作者</th><th>公司</th><th>状态</th><th>操作</th></tr></thead><tbody>
          {posts.map((post: any) => <tr key={post.id}>
            <td><strong>{post.title}</strong></td><td>{post.author}</td><td>{post.company || "—"}</td><td><Badge tone={post.status === "published" ? "green" : post.status === "hidden" ? "amber" : "red"}>{post.status === "published" ? "公开" : post.status === "hidden" ? "已隐藏" : post.status === "removed" ? "已删除" : post.status}</Badge></td>
            <td><form action={moderatePost} style={{ display: "flex", gap: 6 }}><input type="hidden" name="postId" value={post.id} /><select name="status" defaultValue={post.status === "published" ? "hidden" : "published"}><option value="published">恢复公开</option><option value="hidden">隐藏</option><option value="removed">删除</option></select><button className="button button-small" type="submit">执行</button></form></td>
          </tr>)}
        </tbody></table>
      </div>
    </>
  );
}
