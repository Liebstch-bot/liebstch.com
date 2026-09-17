"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ApplicationForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!hasSupabaseEnv) return setError("当前是原型模式，配置 Supabase 后表单会直接写入数据库。");
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError ?? new Error("请先登录");
      const payload = {
        user_id: user.id,
        company: String(form.get("company") || ""),
        role_title: String(form.get("roleTitle") || ""),
        city: String(form.get("city") || ""),
        priority: Number(form.get("priority") || 2),
        stage: String(form.get("stage") || "wishlist"),
        status_note: String(form.get("statusNote") || ""),
        deadline_at: form.get("deadlineAt") ? new Date(String(form.get("deadlineAt"))).toISOString() : null,
      };
      const { error: insertError } = await supabase.from("applications").insert(payload);
      if (insertError) throw insertError;
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="form-grid">
        <div className="form-field"><label>公司 *</label><input name="company" required placeholder="例如：腾讯" /></div>
        <div className="form-field"><label>岗位名称 *</label><input name="roleTitle" required placeholder="例如：AI 产品经理培训生" /></div>
        <div className="form-field"><label>城市</label><input name="city" placeholder="成都 / 北京 / 线上" /></div>
        <div className="form-field"><label>优先级</label><select name="priority" defaultValue="2"><option value="0">P0 · 最高</option><option value="1">P1 · 高</option><option value="2">P2 · 常规</option></select></div>
        <div className="form-field"><label>当前阶段</label><select name="stage" defaultValue="wishlist"><option value="wishlist">准备投递</option><option value="applied">已投递</option><option value="assessment">测评 / 笔试</option><option value="interview">面试中</option><option value="offer">Offer</option></select></div>
        <div className="form-field"><label>截止日期</label><input name="deadlineAt" type="date" /><span className="form-help">只用于个人追踪，不会公开。</span></div>
        <div className="form-field full"><label>当前状态 / 下一行动</label><textarea name="statusNote" placeholder="例如：等待 HR 安排一面，准备项目复盘" /></div>
      </div>
      {error ? <div className="notice notice-amber" style={{ marginTop: 14 }}><Icon name="mail" size={17} /><span>{error}</span></div> : null}
      <div className="form-actions"><span className="soft small">私人数据仅本人可读，管理员团队默认无法读取。</span><button className="button button-dark" disabled={saving} type="submit">{saving ? "正在保存…" : "保存岗位"} <Icon name="check" size={16} /></button></div>
    </form>
  );
}
