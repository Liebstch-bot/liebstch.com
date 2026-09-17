import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatCard({ label, value, meta, tone = "default" }: { label: string; value: ReactNode; meta?: string; tone?: "default" | "blue" | "amber" | "green" | "violet" }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {meta ? <div className="stat-meta">{meta}</div> : null}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "amber" | "green" | "violet" | "muted" }) {
  return <div className="progress-track"><div className={`progress-fill progress-${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const label = /^[\u4e00-\u9fa5]/.test(name.trim()) ? name.trim().slice(0, 2) : name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <span className={`avatar avatar-${size}`}>{label || "L"}</span>;
}
