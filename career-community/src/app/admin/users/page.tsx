import { Avatar, Badge } from "@/components/ui";
import { demoAdminUsers } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateUserRole, updateUserStatus } from "../actions";

export const dynamic = "force-dynamic";

async function loadUsers() {
  if (!hasSupabaseEnv || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoAdminUsers;
  const admin = createSupabaseAdminClient();
  const { data: profiles } = await admin.from("profiles").select("id,display_name,handle,role,status,created_at").order("created_at", { ascending: false }).limit(100);
  const { data: authUsers } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  const emailById = new Map(authUsers.users.map((user) => [user.id, user.email]));
  return (profiles ?? []).map((profile) => ({ id: profile.id, name: profile.display_name, email: emailById.get(profile.id) ?? "未公开", role: profile.role, status: profile.status, joined: String(profile.created_at).slice(0, 10), posts: 0 }));
}

export default async function AdminUsersPage() {
  const users = await loadUsers();
  return (
    <>
      <div className="admin-header"><div><h1>用户与角色</h1><p>管理员可以设置普通用户、版主和管理员，也可以封禁异常账号。</p></div><Badge tone="blue">{users.length} 个用户</Badge></div>
      <div className="notice notice-amber" style={{ marginBottom: 16 }}>管理员可以看到账号邮箱，但不能读取用户的 applications、interview_events 或 reminders。</div>
      <div className="table-shell">
        <table className="data-table"><thead><tr><th>用户</th><th>角色</th><th>状态</th><th>加入时间</th><th>操作</th></tr></thead><tbody>
          {users.map((user: any) => <tr key={user.id ?? user.email}>
            <td><div className="table-person"><Avatar name={user.name} size="sm" /><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td>
            <td><form action={updateUserRole} style={{ display: "flex", gap: 6 }}><input type="hidden" name="userId" value={user.id ?? ""} /><select name="role" defaultValue={user.role}><option value="user">用户</option><option value="moderator">版主</option><option value="admin">管理员</option></select><button className="button button-small" type="submit">保存</button></form></td>
            <td><Badge tone={user.status === "active" ? "green" : "red"}>{user.status === "active" ? "正常" : user.status === "suspended" ? "已封禁" : user.status}</Badge></td>
            <td className="muted small">{user.joined}</td>
            <td><form action={updateUserStatus}><input type="hidden" name="userId" value={user.id ?? ""} /><input type="hidden" name="status" value={user.status === "active" ? "suspended" : "active"} /><button className="button button-small" type="submit">{user.status === "active" ? "封禁" : "解封"}</button></form></td>
          </tr>)}
        </tbody></table>
      </div>
    </>
  );
}

