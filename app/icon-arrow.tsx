export function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  const d = direction === "right" ? "M2 8h11M9 4l4 4-4 4" : "M14 8H3M7 4 3 8l4 4";

  return (
    <svg className={`arrow-icon arrow-icon-${direction}`} viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
