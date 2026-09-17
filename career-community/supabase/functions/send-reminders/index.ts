import { createClient } from "npm:@supabase/supabase-js@2.49.1";

type DueReminder = {
  reminder_id: string;
  user_id: string;
  recipient_email: string;
  interview_title: string;
  company: string;
  starts_at: string;
  timezone: string;
  duration_minutes: number;
  location: string;
  meeting_url: string;
  contact_name: string;
  notes: string;
  offset_minutes: number;
  attempt_count: number;
  max_attempts: number;
  idempotency_key: string;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "liebstch <noreply@mail.liebstch.com>";
const cronSecret = Deno.env.get("CRON_SECRET") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatOffset(minutes: number) {
  if (minutes % 1440 === 0) return `提前 ${minutes / 1440} 天`;
  if (minutes % 60 === 0) return `提前 ${minutes / 60} 小时`;
  return `提前 ${minutes} 分钟`;
}

function formatInTimezone(value: string, timezone: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function buildIcs(reminder: DueReminder) {
  const start = new Date(reminder.starts_at);
  const end = new Date(start.getTime() + reminder.duration_minutes * 60_000);
  const description = [
    `${reminder.company} · ${reminder.interview_title}`,
    reminder.location ? `地点：${reminder.location}` : "",
    reminder.meeting_url ? `会议链接：${reminder.meeting_url}` : "",
    reminder.contact_name ? `联系人：${reminder.contact_name}` : "",
    reminder.notes ? `备注：${reminder.notes}` : "",
  ].filter(Boolean).join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//liebstch//Career Reminder//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${reminder.idempotency_key}@liebstch.com`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
    `DTSTART:${formatIcsDate(reminder.starts_at)}`,
    `DTEND:${formatIcsDate(end.toISOString())}`,
    `SUMMARY:${reminder.company} · ${reminder.interview_title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    reminder.location ? `LOCATION:${reminder.location}` : "",
    reminder.meeting_url ? `URL:${reminder.meeting_url}` : "",
    `BEGIN:VALARM`,
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:面试提醒",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

function buildEmail(reminder: DueReminder) {
  const when = formatInTimezone(reminder.starts_at, reminder.timezone);
  const subject = `[${formatOffset(reminder.offset_minutes)}] ${reminder.company} · ${reminder.interview_title}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI','Microsoft YaHei',sans-serif;max-width:620px;margin:0 auto;color:#17212b">
      <div style="padding:20px 0;border-bottom:1px solid #d8dee7">
        <div style="font-weight:800;font-size:18px">liebstch 求职提醒</div>
        <div style="color:#667085;font-size:13px;margin-top:4px">${escapeHtml(formatOffset(reminder.offset_minutes))}</div>
      </div>
      <div style="padding:24px 0">
        <div style="font-size:23px;font-weight:800;line-height:1.35">${escapeHtml(reminder.company)} · ${escapeHtml(reminder.interview_title)}</div>
        <p style="font-size:16px;margin:20px 0;color:#2858bc;font-weight:700">${escapeHtml(when)}（${escapeHtml(reminder.timezone)}）</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${reminder.location ? `<tr><td style="padding:8px 0;color:#667085;width:80px">地点</td><td style="padding:8px 0">${escapeHtml(reminder.location)}</td></tr>` : ""}
          ${reminder.meeting_url ? `<tr><td style="padding:8px 0;color:#667085">链接</td><td style="padding:8px 0"><a href="${escapeHtml(reminder.meeting_url)}">${escapeHtml(reminder.meeting_url)}</a></td></tr>` : ""}
          ${reminder.contact_name ? `<tr><td style="padding:8px 0;color:#667085">联系人</td><td style="padding:8px 0">${escapeHtml(reminder.contact_name)}</td></tr>` : ""}
        </table>
        ${reminder.notes ? `<div style="margin-top:18px;padding:14px;background:#f3f5f8;border-radius:10px;white-space:pre-wrap">${escapeHtml(reminder.notes)}</div>` : ""}
      </div>
      <div style="padding:16px 0;border-top:1px solid #d8dee7;color:#667085;font-size:12px">此邮件由 liebstch.com 求职提醒服务自动发送。日历附件可直接导入日历。</div>
    </div>`;
  return { subject, html };
}

async function sendWithResend(reminder: DueReminder) {
  const { subject, html } = buildEmail(reminder);
  const ics = buildIcs(reminder);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": reminder.idempotency_key,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [reminder.recipient_email],
      subject,
      html,
      attachments: [{ filename: "interview.ics", content: toBase64(ics) }],
      tags: [
        { name: "category", value: "interview-reminder" },
        { name: "reminder_id", value: reminder.reminder_id },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `Resend HTTP ${response.status}`);
  return { subject, providerMessageId: payload.id as string };
}

async function processReminder(reminder: DueReminder) {
  try {
    const result = await sendWithResend(reminder);
    await supabase.from("email_logs").insert({
      user_id: reminder.user_id,
      reminder_id: reminder.reminder_id,
      provider: "resend",
      provider_message_id: result.providerMessageId,
      to_email: reminder.recipient_email,
      subject: result.subject,
      status: "sent",
      sent_at: new Date().toISOString(),
      metadata: { idempotency_key: reminder.idempotency_key, offset_minutes: reminder.offset_minutes },
    });
    await supabase.rpc("finish_reminder", {
      p_reminder_id: reminder.reminder_id,
      p_success: true,
      p_error: null,
      p_provider_message_id: result.providerMessageId,
    });
    return { reminder_id: reminder.reminder_id, status: "sent" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("email_logs").insert({
      user_id: reminder.user_id,
      reminder_id: reminder.reminder_id,
      provider: "resend",
      to_email: reminder.recipient_email,
      subject: `面试提醒：${reminder.company}`,
      status: "failed",
      error: message,
      metadata: { idempotency_key: reminder.idempotency_key, offset_minutes: reminder.offset_minutes },
    });
    await supabase.rpc("finish_reminder", {
      p_reminder_id: reminder.reminder_id,
      p_success: false,
      p_error: message,
      p_provider_message_id: null,
    });
    return { reminder_id: reminder.reminder_id, status: "failed", error: message };
  }
}

Deno.serve(async (request) => {
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return Response.json({ error: "missing environment variables" }, { status: 500 });
  }

  const { data, error } = await supabase.rpc("claim_due_reminders", { batch_size: 50 });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const reminders = (data ?? []) as DueReminder[];
  const results = [];
  for (const reminder of reminders) results.push(await processReminder(reminder));

  return Response.json({ claimed: reminders.length, results });
});

