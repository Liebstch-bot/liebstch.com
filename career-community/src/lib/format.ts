export const stageLabels: Record<string, string> = {
  wishlist: "准备投递",
  applied: "已投递",
  assessment: "测评 / 笔试",
  interview: "面试中",
  offer: "Offer",
  rejected: "已结束",
  withdrawn: "已撤回",
};

export const stageTone: Record<string, string> = {
  wishlist: "neutral",
  applied: "blue",
  assessment: "amber",
  interview: "violet",
  offer: "green",
  rejected: "muted",
  withdrawn: "muted",
};

export function formatDateTime(value: string, timezone = "Asia/Shanghai") {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatOffset(minutes: number) {
  if (minutes % 1440 === 0) return `提前 ${minutes / 1440} 天`;
  if (minutes % 60 === 0) return `提前 ${minutes / 60} 小时`;
  return `提前 ${minutes} 分钟`;
}

export function initials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "L";
  return /^[\u4e00-\u9fa5]/.test(trimmed) ? trimmed.slice(0, 2) : trimmed.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
