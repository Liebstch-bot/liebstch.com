"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function InterviewForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!hasSupabaseEnv) return setError("当前是原型模式，配置 Supabase 后提醒会真实创建并进入发送队列。");
    setSaving(true);
    try {
      const form = new FormData(event.currentTarget);
      const offsets = form.getAll("offsets").map((value) => Number(value));
      const supabase = createSupabaseBrowserClient();
      const { error: rpcError } = await supabase.rpc("create_interview_event_with_reminders", {
        p_application_id: applicationId,
        p_title: String(form.get("title") || ""),
        p_local_at: String(form.get("localAt") || ""),
        p_timezone: String(form.get("timezone") || "Asia/Shanghai"),
        p_offset_minutes: offsets,
        p_kind: String(form.get("kind") || "interview"),
        p_duration_minutes: Number(form.get("duration") || 60),
        p_location: String(form.get("location") || ""),
        p_meeting_url: String(form.get("meetingUrl") || ""),
        p_contact_name: String(form.get("contactName") || ""),
        p_notes: String(form.get("notes") || ""),
      });
      if (rpcError) throw rpcError;
      setMessage("面试和邮件提醒已创建。提醒会按你选择的偏移时间进入队列。");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "创建失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3 className="card-title">添加面试 / 测评节点</h3>
      <p className="card-copy">时间使用所选 IANA 时区保存，数据库会把本地时间转换成 UTC 并按偏移量创建提醒。</p>
      <div className="form-grid" style={{ marginTop: 16 }}>
        <div className="form-field"><label>节点名称 *</label><input name="title" required placeholder="例如：AI 产品经理二面" /></div>
        <div className="form-field"><label>类型</label><select name="kind" defaultValue="interview"><option value="interview">面试</option><option value="assessment">测评</option><option value="written_test">笔试</option><option value="career_talk">沟通会</option></select></div>
        <div className="form-field"><label>当地时间 *</label><input name="localAt" type="datetime-local" required /></div>
        <div className="form-field"><label>IANA 时区 *</label><select name="timezone" defaultValue="Asia/Shanghai"><option value="Asia/Shanghai">Asia/Shanghai</option><option value="Asia/Hong_Kong">Asia/Hong_Kong</option><option value="Asia/Tokyo">Asia/Tokyo</option><option value="Europe/London">Europe/London</option><option value="America/New_York">America/New_York</option><option value="America/Los_Angeles">America/Los_Angeles</option></select></div>
        <div className="form-field"><label>时长（分钟）</label><input name="duration" type="number" min="15" max="1440" defaultValue="60" /></div>
        <div className="form-field"><label>地点 / 平台</label><input name="location" placeholder="线上会议 / 公司地址" /></div>
        <div className="form-field full"><label>会议链接</label><input name="meetingUrl" type="url" placeholder="https://..." /></div>
        <div className="form-field"><label>联系人</label><input name="contactName" placeholder="HR / 面试官姓名" /></div>
        <div className="form-field"><label>邮件提醒</label><div className="checkbox-group"><label className="checkbox-pill"><input type="checkbox" name="offsets" value="1440" defaultChecked />提前 1 天</label><label className="checkbox-pill"><input type="checkbox" name="offsets" value="120" defaultChecked />提前 2 小时</label><label className="checkbox-pill"><input type="checkbox" name="offsets" value="30" />提前 30 分钟</label></div></div>
        <div className="form-field full"><label>备注</label><textarea name="notes" placeholder="面试准备重点、联系人信息等" /></div>
      </div>
      {message ? <div className="notice notice-green" style={{ marginTop: 14 }}><Icon name="check" size={17} /><span>{message}</span></div> : null}
      {error ? <div className="notice notice-amber" style={{ marginTop: 14 }}><Icon name="mail" size={17} /><span>{error}</span></div> : null}
      <div className="form-actions"><span className="soft small">邮件发送失败会自动重试，并以唯一幂等键避免重复发送。</span><button className="button button-blue" disabled={saving} type="submit">{saving ? "正在创建…" : "创建提醒"} <Icon name="calendar" size={16} /></button></div>
    </form>
  );
}
