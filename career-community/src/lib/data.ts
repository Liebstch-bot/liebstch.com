import { demoApplications, demoInterviews, demoPosts, type DemoApplication, type DemoInterview, type DemoPost } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function fallbackStage(stage: string): DemoApplication["stage"] {
  return ["wishlist", "applied", "assessment", "interview", "offer"].includes(stage) ? stage as DemoApplication["stage"] : "applied";
}

export async function getApplications(): Promise<DemoApplication[]> {
  if (!hasSupabaseEnv) return demoApplications;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,company,role_title,city,stage,priority,status_note,applied_at,deadline_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => ({
    id: item.id,
    company: item.company,
    roleTitle: item.role_title,
    city: item.city,
    stage: fallbackStage(item.stage),
    priority: Math.min(2, Math.max(0, item.priority ?? 2)) as 0 | 1 | 2,
    statusNote: item.status_note ?? "",
    appliedAt: item.applied_at ? String(item.applied_at).slice(0, 10) : null,
    deadlineAt: item.deadline_at ? String(item.deadline_at).slice(0, 10) : null,
    nextAction: item.status_note ?? "补充下一行动",
    nextActionAt: item.deadline_at ? String(item.deadline_at).slice(0, 10) : null,
  }));
}

export async function getInterviews(): Promise<DemoInterview[]> {
  if (!hasSupabaseEnv) return demoInterviews;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("interview_events")
    .select("id,application_id,title,starts_at,timezone,location,reminders(offset_minutes,status),applications(company)")
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    id: item.id,
    applicationId: item.application_id,
    company: item.applications?.company ?? "未知公司",
    title: item.title,
    startsAt: item.starts_at,
    timezone: item.timezone,
    location: item.location || "待确认",
    offsets: (item.reminders ?? []).map((reminder: any) => reminder.offset_minutes),
    status: (item.reminders ?? []).some((reminder: any) => reminder.status === "sent") ? "sent" : "scheduled",
  }));
}

export async function getPublicPosts(limit = 20): Promise<DemoPost[]> {
  if (!hasSupabaseEnv) return demoPosts.slice(0, limit);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,content,company,role_title,city,company_category,published_at,like_count,comment_count,profiles(display_name,handle),post_tags(tags(name))")
    .eq("moderation_status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    id: item.id,
    title: item.title,
    excerpt: String(item.content ?? "").slice(0, 150),
    company: item.company || "经验分享",
    roleTitle: item.role_title || "",
    city: item.city || "",
    companyCategory: item.company_category || "other",
    author: item.profiles?.display_name ?? "匿名用户",
    authorHandle: item.profiles?.handle ?? "anonymous",
    publishedAt: item.published_at,
    tags: (item.post_tags ?? []).map((entry: any) => entry.tags?.name).filter(Boolean),
    likes: item.like_count ?? 0,
    comments: item.comment_count ?? 0,
  }));
}

export async function getPostById(id: string): Promise<(DemoPost & { content: string }) | null> {
  if (!hasSupabaseEnv) {
    const post = demoPosts.find((item) => item.id === id);
    return post ? { ...post, content: `${post.excerpt}\n\n这是一份页面原型示例。接入 Supabase 后，正文、标签、评论和点赞都会从数据库实时读取。` } : null;
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,content,company,role_title,city,company_category,published_at,like_count,comment_count,profiles(display_name,handle),post_tags(tags(name))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    excerpt: String(data.content ?? "").slice(0, 150),
    content: data.content,
    company: data.company || "经验分享",
    roleTitle: data.role_title || "",
    city: data.city || "",
    companyCategory: data.company_category || "other",
    author: (data as any).profiles?.display_name ?? "匿名用户",
    authorHandle: (data as any).profiles?.handle ?? "anonymous",
    publishedAt: data.published_at,
    tags: ((data as any).post_tags ?? []).map((entry: any) => entry.tags?.name).filter(Boolean),
    likes: data.like_count ?? 0,
    comments: data.comment_count ?? 0,
  };
}

export type DemoComment = { id: string; content: string; author: string; createdAt: string };

export async function getComments(postId: string): Promise<DemoComment[]> {
  if (!hasSupabaseEnv) {
    return [
      { id: "comment-1", content: "时间线很清楚，尤其是笔试和面试之间的准备重点，对我很有帮助。", author: "求职中的小周", createdAt: "2026-09-16T13:20:00.000Z" },
      { id: "comment-2", content: "想问一下二面更偏向业务案例还是项目追问？", author: "Mia", createdAt: "2026-09-16T15:05:00.000Z" },
    ];
  }
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id,content,created_at,profiles(display_name)")
    .eq("post_id", postId)
    .eq("moderation_status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((item: any) => ({ id: item.id, content: item.content, author: item.profiles?.display_name ?? "匿名用户", createdAt: item.created_at }));
}


