// accent is kept as a prop for call-site semantics (which stat matters
// most) but maps to weight/shade only — no hue, per the black & white palette.
const ACCENT_BORDER = {
  teal: "border-ink",
  gold: "border-ink",
  rose: "border-ink-soft",
  strong: "border-ink",
  soft: "border-ink-soft",
};

export default function StatCard({ label, value, accent = "strong", sub, icon }) {
  const borderColor = ACCENT_BORDER[accent] || "border-ink";
  return (
    <div className={`card-accent ${borderColor} p-5`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-soft">{label}</p>
        {icon && <span className="text-ink-soft/60">{icon}</span>}
      </div>
      <p className="mt-1 font-display text-3xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
