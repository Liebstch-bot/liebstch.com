"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function PostActions({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasSupabaseEnv) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row } = await supabase.from("post_likes").select("post_id").eq("post_id", postId).eq("user_id", data.user.id).maybeSingle();
      setLiked(Boolean(row));
    });
  }, [postId]);

  async function toggle() {
    setMessage("");
    if (!hasSupabaseEnv) return setMessage("原型模式：配置 Supabase 后即可真实点赞。");
    const supabase = createSupabaseBrowserClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return setMessage("登录后才能点赞。");
    if (liked) {
      const { error: deleteError } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      if (deleteError) return setMessage(deleteError.message);
      setLiked(false); setLikes((value) => Math.max(0, value - 1));
    } else {
      const { error: insertError } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      if (insertError) return setMessage(insertError.message);
      setLiked(true); setLikes((value) => value + 1);
    }
  }

  return <div className="action-row"><button className={liked ? "button button-blue button-small" : "button button-small"} onClick={toggle} type="button">{liked ? "已点赞" : "点赞"} · {likes}</button><button className="button button-small" type="button">收藏</button>{message ? <span className="small muted">{message}</span> : null}</div>;
}

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!hasSupabaseEnv) return setMessage("原型模式：配置 Supabase 后即可发表评论。");
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return setMessage("登录后才能评论。");
    const { error: insertError } = await supabase.from("comments").insert({ post_id: postId, user_id: user.id, content: String(form.get("content") || "") });
    if (insertError) return setMessage(insertError.message);
    (event.target as HTMLFormElement).reset();
    setMessage("评论已发布。");
    router.refresh();
  }

  return <form className="card" onSubmit={submit}><div className="form-field"><label>参与讨论</label><textarea name="content" minLength={2} required placeholder="分享你的补充信息、疑问或不同判断。" /></div><div className="form-actions"><span className="soft small">请保持真实、具体和尊重。</span><button className="button button-dark button-small" type="submit">发表评论 <Icon name="arrow" size={15} /></button></div>{message ? <p className="small muted">{message}</p> : null}</form>;
}
