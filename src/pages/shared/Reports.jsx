import { useEffect, useState } from "react";
import api from "../../api/client";
import Layout from "../../components/Layout.jsx";
import StatusPill from "../../components/StatusPill.jsx";

const MILESTONE_LABELS = {
  one2one_status: "1-on-1 Discipleship",
  victory_day_status: "Victory Day",
  baptism_status: "Baptism",
  spiritual_foundation_status: "Spiritual Foundation",
  leadership_113_status: "Leadership 113",
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/discipleship/reports/summary")
      .then((res) => setSummary(res.data.summary))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl">Discipleship reports</h1>
        <p className="text-ink-soft">Church-wide progress across every milestone.</p>
      </div>

      {loading && <p className="text-ink-soft">Loading…</p>}

      {!loading && summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(MILESTONE_LABELS).map(([field, label]) => {
            const rows = summary[field] || [];
            const total = rows.reduce((sum, r) => sum + r.count, 0);
            return (
              <div key={field} className="card p-5">
                <h2 className="mb-3 text-base">{label}</h2>
                {rows.length === 0 ? (
                  <p className="text-sm text-ink-soft">No data yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {rows.map((r) => (
                      <li key={r._id} className="flex items-center justify-between text-sm">
                        <StatusPill status={r._id} />
                        <span className="text-ink-soft">
                          {r.count} {total ? `(${Math.round((r.count / total) * 100)}%)` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
