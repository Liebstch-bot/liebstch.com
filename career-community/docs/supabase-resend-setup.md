# Supabase + Resend 真实登录与邮件配置清单

按顺序执行即可。先把所有真实密钥写入 `.env.local` 或 Vercel 环境变量，不要把 `SUPABASE_SERVICE_ROLE_KEY` 发给任何人。

## 1. 创建 Supabase 项目

1. 打开 `https://supabase.com/dashboard`。
2. 登录后点击 `New project`。
3. Organization 选择默认。
4. Project name 建议 `liebstch-career-community`。
5. Database Password 使用强密码并妥善保存。
6. Region 选择非中国大陆区域即可，例如 `Singapore` 或 `Tokyo`。
7. 创建后进入 `Project Settings → API`，保存：
   - `Project URL`
   - `anon public`
   - `service_role`

## 2. 本地连接项目

在项目根目录执行：

```powershell
cd career-community
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <your-project-ref>
pnpm dlx supabase db push
```

数据库迁移会自动创建身份、求职记录、提醒、邮件日志、帖子、评论、点赞、审核和 RLS。

## 3. 配置认证

1. Supabase Dashboard → `Authentication → URL Configuration`。
2. 本地开发：
   - Site URL：`http://localhost:3000`
   - Redirect URLs：`http://localhost:3000/auth/callback`
3. 生产环境：
   - Site URL：`https://app.liebstch.com`
   - Redirect URLs：`https://app.liebstch.com/auth/callback`
4. `Authentication → Providers → Email` 保持启用。
5. 本项目使用 OTP / Magic Link，不需要密码登录。

## 4. 创建并验证 Resend 发件域名

1. 打开 `https://resend.com/domains`。
2. 添加域名，例如 `mail.liebstch.com`。
3. 根据 Resend 页面给出的记录，在腾讯云 DNS 添加：
   - SPF TXT
   - DKIM 记录
   - MX 记录
   - DMARC TXT
4. 等待域名验证通过。
5. 创建 API Key，保存 `RESEND_API_KEY`。

建议发件地址使用：

```text
liebstch <noreply@mail.liebstch.com>
```

## 5. Supabase 使用 Resend 作为 SMTP

1. `Authentication → Emails → SMTP Settings`。
2. 开启自定义 SMTP。
3. 填写：
   - Host：`smtp.resend.com`
   - Port：`465`
   - Username：`resend`
   - Password：`RESEND_API_KEY`
   - Sender：`liebstch <noreply@mail.liebstch.com>`
4. 保存后点击测试邮件地址，确认能收到邮件。

## 6. 配置 Next.js 环境变量

复制并填写：

```powershell
copy .env.example .env.local
```

`.env.local` 内容：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL="liebstch <noreply@mail.liebstch.com>"
```

`SUPABASE_SERVICE_ROLE_KEY` 只允许在服务端使用。

## 7. 部署邮件提醒 Edge Function

```powershell
cd career-community
pnpm dlx supabase secrets set RESEND_API_KEY=<resend-api-key>
pnpm dlx supabase secrets set RESEND_FROM_EMAIL="liebstch <noreply@mail.liebstch.com>"
pnpm dlx supabase secrets set CRON_SECRET=<随机长字符串>
pnpm dlx supabase functions deploy send-reminders --no-verify-jwt
```

## 8. 配置定时任务

在 Supabase SQL Editor 执行：

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-reminders-every-5-min',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <CRON_SECRET>',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 9. 设置第一个管理员

在 Supabase SQL Editor 执行：

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = '你的邮箱@example.com'
);
```

## 10. 本地验证

```powershell
pnpm install
pnpm dev
```

打开 `http://localhost:3000/login`：

1. 输入邮箱，收到 OTP / Magic Link。
2. 点击链接后自动创建账号。
3. 进入求职台，新增岗位。
4. 在岗位详情创建面试节点并勾选“提前 1 天 / 提前 2 小时”。
5. 等待 Cron 或手动调用函数验证邮件。
6. 管理员后台查看邮件日志。

## 11. Vercel 生产部署

1. Vercel 导入 GitHub 仓库 `Liebstch-bot/liebstch.com`。
2. Root Directory 设置为 `career-community`。
3. 添加同样的生产环境变量。
4. 绑定 `app.liebstch.com`。
5. 腾讯云 DNS 按 Vercel 页面给出的记录配置。
6. 将 `NEXT_PUBLIC_SITE_URL` 改为 `https://app.liebstch.com`。
