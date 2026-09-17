type IconProps = { name: "arrow" | "briefcase" | "calendar" | "check" | "chevron" | "clock" | "community" | "dashboard" | "mail" | "menu" | "plus" | "search" | "shield" | "spark" | "user"; size?: number };

export function Icon({ name, size = 18 }: IconProps) {
  const paths: Record<IconProps["name"], string> = {
    arrow: "M5 12h14M13 6l6 6-6 6",
    briefcase: "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm-2 6h14",
    calendar: "M7 3v3m10-3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z",
    check: "m5 12 4 4L19 6",
    chevron: "m9 6 6 6-6 6",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    community: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a5 5 0 0 1 10 0m-2 0a5 5 0 0 1 10 0",
    dashboard: "M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z",
    mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
    menu: "M4 7h16M4 12h16M4 17h16",
    plus: "M12 5v14M5 12h14",
    search: "m20 20-4.5-4.5m2.5-5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
    shield: "M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
    spark: "m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Zm6 12 .7 2.3L21 18l-2.3.7L18 21l-.7-2.3L15 18l2.3-.7L18 15Z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0",
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
