"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { COMPANY_CATEGORIES } from "@/lib/taxonomy";

export function PostForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!hasSupabaseEnv) return setError("当前是页面原型模式。配置 Supabase 后，发布内容会公开到论坛广场。");
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("请先登录");
      const tags = String(form.get("tags") || "").split(/[,，\s]+/).map((tag) => tag.trim()).filter(Boolean).slice(0, 6);
      const { data: post, error: insertError } = await supabase.from("posts").insert({
        user_id: user.id,
        title: String(form.get("title") || ""),
        content: String(form.get("content") || ""),
        company: String(form.get("company") || ""),
        role_title: String(form.get("roleTitle") || ""),
        city: String(form.get("city") || ""),
        company_category: String(form.get("companyCategory") || "other"),
        interview_result: String(form.get("interviewResult") || ""),
        moderation_status: "published",
      }).select("id").single();
      if (insertError) throw insertError;
      if (tags.length) {
        const { error: tagError } = await supabase.rpc("attach_post_tags", { p_post_id: post.id, p_tags: tags });
        if (tagError) throw tagError;
      }
      router.push(`/community/${post.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "发布失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="form-grid">
        <div className="form-field full"><label>标题 *</label><input name="title" minLength={4} maxLength={160} required placeholder="用一句话告诉别人这篇分享最有价值的内容" /></div>
        <div className="form-field"><label>公司</label><input name="company" placeholder="腾讯 / 美团 / 多家" /></div>
        <div className="form-field"><label>岗位</label><input name="roleTitle" placeholder="AI 产品经理" /></div>
        <div className="form-field"><label>城市</label><input name="city" placeholder="成都" /></div>
        <div className="form-field"><label>企业分类 *</label><select name="companyCategory" defaultValue="big_tech" required>{COMPANY_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></div>
        <div className="form-field"><label>面试结果</label><select name="interviewResult" defaultValue=""><option value="">未填写</option><option value="进入下一轮">进入下一轮</option><option value="等待结果">等待结果</option><option value="已结束">已结束</option><option value="获得 Offer">获得 Offer</option></select></div>
        <div className="form-field full"><label>正文 *</label><textarea name="content" minLength={20} required placeholder="建议包含岗位信息、时间线、面试问题、你的回答结构和复盘思考。" style={{ minHeight: 280 }} /></div>
        <div className="form-field full"><label>标签</label><input name="tags" placeholder="AI产品 一面复盘 成都（最多 6 个）" /></div>
      </div>
      {error ? <div className="notice notice-amber" style={{ marginTop: 14 }}><Icon name="mail" size={17} /><span>{error}</span></div> : null}
      <div className="form-actions"><span className="soft small">发布即公开可读，请移除手机号、微信、邮箱等私人信息。</span><button className="button button-dark" type="submit" disabled={saving}>{saving ? "正在发布…" : "发布到广场"} <Icon name="arrow" size={16} /></button></div>
    </form>
  );
}
