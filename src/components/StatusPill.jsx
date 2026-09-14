// Monochrome status system: meaning is carried by dot fill (solid vs
// outlined) and shade, not color — solid black = done/good, mid-gray =
// in progress, outlined = not started/pending/negative.
const STYLES = {
  not_started: { dot: "border border-ink-soft/50 bg-transparent", text: "text-ink-soft", bg: "bg-black/[0.03]" },
  ongoing: { dot: "bg-ink-soft", text: "text-ink", bg: "bg-black/[0.05]" },
  completed: { dot: "bg-ink", text: "text-ink", bg: "bg-black/[0.06]" },
  "n/a": { dot: "border border-ink-soft/30 bg-transparent", text: "text-ink-soft/70", bg: "bg-black/[0.02]" },
  present: { dot: "bg-ink", text: "text-ink", bg: "bg-black/[0.06]" },
  absent: { dot: "border border-ink bg-transparent", text: "text-ink-soft", bg: "bg-black/[0.03]" },
  approved: { dot: "bg-ink", text: "text-ink", bg: "bg-black/[0.06]" },
  pending: { dot: "bg-ink-soft", text: "text-ink", bg: "bg-black/[0.05]" },
};

const LABELS = {
  not_started: "Not started",
  ongoing: "Ongoing",
  completed: "Completed",
  "n/a": "N/A",
  present: "Present",
  absent: "Absent",
  approved: "Approved",
  pending: "Pending",
};

export default function StatusPill({ status }) {
  const style = STYLES[status] || STYLES.not_started;
  return (
    <span className={`pill ${style.bg} ${style.text}`}>
      <span className={`pill-dot ${style.dot}`} />
      {LABELS[status] || status}
    </span>
  );
}
