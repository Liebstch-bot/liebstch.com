"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/icons";
import { hasSupabaseEnv, siteUrl } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const next = searchParams.get("next") || "/dashboard";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!hasSupabaseEnv) {
      setError("当前是页面原型模式：请先配置 Supabase 环境变量，才能真实发送登录邮件。");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (signInError) throw signInError;
      setMessage("登录链接已发送。请打开邮箱完成验证，链接有效期以 Supabase 设置为准。");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "发送失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <div className="form-field"><label htmlFor="email">邮箱地址</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>
      {message ? <div className="notice notice-green"><Icon name="check" size={17} /><span>{message}</span></div> : null}
      {error ? <div className="notice notice-amber"><Icon name="mail" size={17} /><span>{error}</span></div> : null}
      <button className="button button-dark button-block" type="submit" disabled={submitting}>{submitting ? "正在发送…" : "发送登录链接"}<Icon name="arrow" size={16} /></button>
    </form>
  );
}
