import { Badge } from "@/components/ui";
import { demoEmailLogs } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function loadLogs() {
  if (!hasSupabaseEnv || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoEmailLogs;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("email_logs").select("to_email,subject,status,provider_message_id,created_at,error").order("created_at", { ascending: false }).limit(100);
  return (data ?? []).map((log) => ({ recipient: log.to_email, subject: log.subject, status: log.status, providerId: log.provider_message_id || "—", createdAt: String(log.created_at).slice(0, 16).replace("T", " "), error: log.error }));
}

export default async function EmailLogsPage() {
  const logs = await loadLogs();
  return (
    <>
      <div className="admin-header"><div><h1>邮件日志</h1><p>查看登录邮件、面试提醒、失败重试和供应商消息 ID。</p></div><Badge tone="blue">{logs.length} 条记录</Badge></div>
      <div className="notice notice-green" style={{ marginBottom: 16 }}>提醒使用 idempotency_key 保证幂等；失败按指数退避自动重试，超过最大次数后标记为 dead。</div>
      <div className="table-shell">
        <table className="data-table"><thead><tr><th>收件人</th><th>主题</th><th>状态</th><th>供应商 ID</th><th>时间</th></tr></thead><tbody>
          {logs.map((log: any, index) => <tr key={`${log.recipient}-${index}`}><td>{log.recipient}</td><td><strong>{log.subject}</strong>{log.error ? <div className="small" style={{ color: "var(--red)" }}>{log.error}</div> : null}</td><td><Badge tone={log.status === "sent" || log.status === "已送达" ? "green" : log.status === "failed" || log.status === "失败重试" ? "red" : "blue"}>{log.status}</Badge></td><td className="muted small">{log.providerId}</td><td className="muted small">{log.createdAt}</td></tr>)}
        </tbody></table>
      </div>
    </>
  );
}
