import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  return (
    <main className="shell auth-shell">
      <section className="auth-copy">
        <div className="eyebrow">EMAIL OTP · NO PASSWORD</div>
        <h1>一个邮箱，打开你的私人求职空间。</h1>
        <p>第一版不设计密码。输入邮箱后，你会收到一次性登录链接；登录后才能创建岗位、设置面试和邮件提醒。公开论坛仍然允许访客阅读。</p>
        <div className="notice notice-blue"><Icon name="shield" size={18} /><span>私人求职数据、提醒和邮件日志按用户隔离。管理员默认没有访问这些数据的策略。</span></div>
      </section>
      <section className="auth-card">
        <h2>邮箱登录</h2>
        <p>使用 OTP / Magic Link 完成登录，首次登录会自动创建账号。</p>
        <Suspense fallback={<div className="empty-state">正在准备登录表单…</div>}><LoginForm /></Suspense>
        <div className="security-note"><Icon name="mail" size={16} /><span>收不到邮件时请检查垃圾箱，并将 liebstch 发件域名加入白名单。</span></div>
      </section>
    </main>
  );
}
