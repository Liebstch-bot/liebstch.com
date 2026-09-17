# liebstch career community

`liebstch.com` 的个人作品集、私人求职跟踪、邮件提醒和公开面经社区。

## 已实现的结构

- Next.js App Router + TypeScript
- Supabase Auth：邮箱 OTP / Magic Link，无密码登录
- 私人求职数据：`applications`、`interview_events`、`reminders`
- 用户时区：保存 IANA 时区，面试本地时间通过 PostgreSQL `AT TIME ZONE` 转为 UTC
- 邮件提醒：支持提前 1 天、2 小时、30 分钟等偏移
- 邮件可靠性：幂等键、任务锁定、指数退避重试、发送日志
- ICS 附件：提醒邮件附带可导入日历的事件文件
- 公开论坛：帖子、评论、点赞、标签、举报与审核
- 管理员后台：用户角色、封禁、内容审核、邮件日志
- 数据库 RLS：私人求职记录仅本人可读；管理员没有私人记录读取策略

## 本地启动

```powershell
pnpm install
copy .env.example .env.local
pnpm dev
```

未配置 Supabase 时，页面会自动使用演示数据，方便先检查页面原型。配置环境变量后，注册、发帖、求职记录和邮件队列会连接真实数据库。

## Supabase

```powershell
supabase start
supabase db reset
pnpm supabase:function:deploy
```

数据库迁移位于：

- `supabase/migrations/202609170001_identity_and_helpers.sql`
- `supabase/migrations/202609170002_career_tracker_and_reminders.sql`
- `supabase/migrations/202609170003_community_and_moderation.sql`

## 关键环境变量

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL="liebstch <noreply@mail.liebstch.com>"
NEXT_PUBLIC_SITE_URL=https://app.liebstch.com
```

`SUPABASE_SERVICE_ROLE_KEY` 只能放在服务端环境中，不要暴露给浏览器。

## 部署

详细步骤见 `docs/deployment.md`。简要流程：

1. 将代码仓库连接 Vercel。
2. 先使用 `app.liebstch.com`，现有 `liebstch.com` 保持可用。
3. 在腾讯云 DNS 添加 Vercel 控制台给出的域名记录。
4. 在 Resend 验证 `mail.liebstch.com`，配置 SPF、DKIM、DMARC。
5. 将 Supabase Auth 的 SMTP 指向 Resend。
6. 部署 `send-reminders` Edge Function 并配置 Cron。
7. 验证邮箱登录、面试提醒、论坛互动和管理员权限后，再将根域名切到 Vercel。

## 管理员

新注册用户默认是普通用户。第一个管理员需要在 Supabase SQL Editor 手动提升：

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

管理员可以管理账号和公开社区内容，但不能通过 RLS 读取用户的私人求职记录。

## 2026 视觉与内容升级

- 使用深色 Editorial 风格和琥珀金/荧光绿强调色，与 `liebstch.com` 现有个人主页品牌保持一致。
- 首页新增品牌化大标题、悬浮提醒预览卡片和更强的视觉层次。
- 论坛顶部新增企业分区导航：全部、央国企、互联网大厂、制造业、快消企业、外企、金融银行、AI / 创业公司、其他。
- 发帖表单新增企业分类必选字段，作品集页面已融合现有个人主页中的小竹校友圈、出版作品、短视频、剧本、技能和经历。
