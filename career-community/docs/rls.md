# RLS 验证清单

## 私人数据

使用两个不同用户执行以下查询：

```sql
select * from public.applications;
select * from public.interview_events;
select * from public.reminders;
```

预期：每个用户只能看到 `user_id = auth.uid()` 的记录。

使用管理员账号再次执行以上查询：

预期：管理员同样看不到其他用户的私人记录。管理员策略只覆盖 profiles、公开社区内容、reports、moderation_actions 和 email_logs。

## 公开社区

未登录：

- 可以读取 `moderation_status = 'published'` 且未删除的 posts/comments
- 不能写入 posts/comments/post_likes/reports

登录用户：

- 可以创建自己的帖子、评论和点赞
- 不能修改其他人的帖子或评论审核状态
- 封禁用户不能发帖、评论、点赞或创建面试提醒

版主：

- 可以隐藏和恢复帖子
- 可以处理举报
- 不能修改用户角色

管理员：

- 可以设置版主、封禁账号
- 可以管理公开社区内容
- 不可以读取用户私人求职记录
