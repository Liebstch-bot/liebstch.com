"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateUserRole(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "user");
  if (!["user", "moderator", "admin"].includes(role)) throw new Error("无效角色");
  await createSupabaseAdminClient().from("profiles").update({ role }).eq("id", userId);
  await createSupabaseAdminClient().from("moderation_actions").insert({ actor_id: admin.id, target_type: "user", target_id: userId, action: `role:${role}`, reason: "管理员更新角色" });
  revalidatePath("/admin/users");
}

export async function updateUserStatus(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "active");
  if (!["active", "suspended"].includes(status)) throw new Error("无效状态");
  await createSupabaseAdminClient().from("profiles").update({ status }).eq("id", userId);
  await createSupabaseAdminClient().from("moderation_actions").insert({ actor_id: admin.id, target_type: "user", target_id: userId, action: `status:${status}`, reason: "管理员更新账号状态" });
  revalidatePath("/admin/users");
}

export async function moderatePost(formData: FormData) {
  const admin = await requireAdmin();
  const postId = String(formData.get("postId") || "");
  const status = String(formData.get("status") || "hidden");
  if (!["published", "hidden", "removed"].includes(status)) throw new Error("无效审核状态");
  await createSupabaseAdminClient().from("posts").update({ moderation_status: status }).eq("id", postId);
  revalidatePath("/admin/moderation");
  revalidatePath("/community");
}
