# 部署与上线清单

## 1. Supabase 项目

1. 创建 Supabase 项目。
2. 在 SQL Editor 中依次执行三个迁移文件，或使用 `supabase db push`。
3. 在 Authentication 中设置：
   - Site URL：`https://app.liebstch.com`
   - Redirect URL：`https://app.liebstch.com/auth/callback`
   - 本地开发同时保留 `http://localhost:3000/auth/callback`
4. 使用 Resend 作为自定义 SMTP：
   - Host：以 Resend 控制台为准
   - Port：465 或 587
   - Username：`resend`
   - Password：Resend API Key
   - Sender：`noreply@mail.liebstch.com`

## 2. Resend 与腾讯云 DNS

在 Resend 添加 `mail.liebstch.com` 后，按控制台展示的值在腾讯云 DNS 添加：

- MX 记录：邮件退信和发送验证
- TXT 记录：SPF
- DKIM 记录：Resend 提供的域名和值
- TXT 记录：`_dmarc`，初始建议 `v=DMARC1; p=none; rua=mailto:dmarc@liebstch.com`

验证通过后，将 `RESEND_FROM_EMAIL` 设置为 `liebstch <noreply@mail.liebstch.com>`。

## 3. Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. 添加环境变量，生产环境使用正式域名。
3. 在 Vercel 项目域名中添加 `app.liebstch.com`。
4. 腾讯云 DNS 使用 Vercel 页面给出的记录值，不要照搬过期的旧 IP。
5. 通过 `https://app.liebstch.com` 测试所有功能后，再把根域名和 `www` 切换到 Vercel。

## 4. 邮件提醒 Edge Function

设置 Secrets：

```powershell
supabase secrets set RESEND_API_KEY=...
supabase secrets set RESEND_FROM_EMAIL="liebstch <noreply@mail.liebstch.com>"
supabase secrets set CRON_SECRET=一段随机字符串
```

部署函数：

```powershell
supabase functions deploy send-reminders --no-verify-jwt
```

在 Supabase Cron 中每 5 分钟调用一次函数，请求头需要：

```text
Authorization: Bearer <CRON_SECRET>
```

函数会调用 `claim_due_reminders`，一次最多领取 50 条待发送提醒。提醒表有唯一幂等键，发送成功写入 `email_logs`，失败会按指数退避重试，超过最大次数后标记为 `dead`。

## 5. 上线验证

- 邮箱 OTP 能正常进入 `/auth/callback`
- 用户 A 无法读取用户 B 的 applications/interview_events/reminders
- 管理员页面无法读取 applications/interview_events/reminders
- 论坛未登录可以阅读，登录后可以发帖、评论和点赞
- 重复执行发送任务不会重复发送同一条提醒
- Resend 邮件中包含 ICS 附件
- 邮件失败以后存在日志和重试记录
- 封禁用户不能继续发帖、评论或创建提醒
