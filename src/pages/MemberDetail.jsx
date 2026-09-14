import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import Layout from "../components/Layout.jsx";
import StatusPill from "../components/StatusPill.jsx";

const MILESTONES = [
  { key: "one2one", label: "1-on-1 Discipleship" },
  { key: "victory_day", label: "Victory Day" },
  { key: "baptism", label: "Baptism" },
  { key: "spiritual_foundation", label: "Spiritual Foundation" },
  { key: "leadership_113", label: "Leadership 113" },
];

export default function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [track, setTrack] = useState(null);
  const [logs, setLogs] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attForm, setAttForm] = useState({
    attendance_date: new Date().toISOString().slice(0, 10),
    service_time: "10AM",
    status: "present",
  });

  function loadAll() {
    setLoading(true);
    Promise.all([
      api.get(`/members/${id}`),
      api.get(`/discipleship/${id}`),
      api.get(`/discipleship/${id}/logs`),
      api.get("/attendance", { params: { member_id: id } }),
    ])
      .then(([m, t, l, a]) => {
        setMember(m.data.member);
        setTrack(t.data.track);
        setLogs(l.data.logs);
        setAttendance(a.data.records);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, [id]);

  async function handleTrackSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/discipleship/${id}`, track);
      setTrack(res.data.track);
      const logsRes = await api.get(`/discipleship/${id}/logs`);
      setLogs(logsRes.data.logs);
    } finally {
      setSaving(false);
    }
  }

  async function handleAttendanceSubmit(e) {
    e.preventDefault();
    await api.post("/attendance", { member_id: id, ...attForm });
    const a = await api.get("/attendance", { params: { member_id: id } });
    setAttendance(a.data.records);
  }

  if (loading || !member || !track) {
    return (
      <Layout>
        <p className="text-ink-soft">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to="/members" className="text-sm link">
        ← Back to members
      </Link>

      <div className="mt-3 mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl">{member.full_name}</h1>
          <p className="text-ink-soft capitalize">
            {member.member_type} · {member.gender || "—"} · {member.age ? `${member.age} yrs old` : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Discipleship track */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-base">Discipleship progress</h2>
          <form onSubmit={handleTrackSave} className="space-y-4">
            {MILESTONES.map((ms) => (
              <div
                key={ms.key}
                className="grid grid-cols-1 items-center gap-3 border-b border-line pb-4 last:border-0 sm:grid-cols-[1fr_auto_140px_100px]"
              >
                <p className="text-sm font-medium">{ms.label}</p>
                <StatusPill status={track[`${ms.key}_status`]} />
                <select
                  className="select"
                  value={track[`${ms.key}_status`]}
                  onChange={(e) =>
                    setTrack({ ...track, [`${ms.key}_status`]: e.target.value })
                  }
                >
                  <option value="not_started">Not started</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  {ms.key === "baptism" && <option value="n/a">N/A</option>}
                </select>
                <input
                  type="number"
                  placeholder="Year"
                  className="input"
                  value={track[`${ms.key}_year`] || ""}
                  onChange={(e) =>
                    setTrack({ ...track, [`${ms.key}_year`]: e.target.value || null })
                  }
                />
              </div>
            ))}

            <div>
              <label className="field-label">Remarks</label>
              <textarea
                className="input"
                rows={2}
                value={track.remarks || ""}
                onChange={(e) => setTrack({ ...track, remarks: e.target.value })}
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save progress"}
            </button>
          </form>
        </div>

        {/* Sidebar: attendance + history */}
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 text-base">Record attendance</h2>
            <form onSubmit={handleAttendanceSubmit} className="space-y-3">
              <div>
                <label className="field-label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={attForm.attendance_date}
                  onChange={(e) => setAttForm({ ...attForm, attendance_date: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Service</label>
                <select
                  className="select"
                  value={attForm.service_time}
                  onChange={(e) => setAttForm({ ...attForm, service_time: e.target.value })}
                >
                  <option value="10AM">10AM</option>
                  <option value="4PM">4PM</option>
                </select>
              </div>
              <div>
                <label className="field-label">Status</label>
                <select
                  className="select"
                  value={attForm.status}
                  onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <button type="submit" className="btn-gold w-full">
                Save
              </button>
            </form>

            {attendance.length > 0 && (
              <ul className="mt-4 divide-y divide-line text-sm">
                {attendance.slice(0, 6).map((a) => (
                  <li key={a._id} className="flex items-center justify-between py-2">
                    <span>
                      {new Date(a.attendance_date).toLocaleDateString()} · {a.service_time}
                    </span>
                    <StatusPill status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-base">Progress history</h2>
            {logs.length === 0 ? (
              <p className="text-sm text-ink-soft">No changes logged yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {logs.slice(0, 8).map((log) => (
                  <li key={log._id} className="border-b border-line pb-3 last:border-0">
                    <p className="text-ink-soft">
                      {new Date(log.logged_at).toLocaleString()} by{" "}
                      {log.updated_by?.full_name || "—"}
                    </p>
                    {log.remarks && <p className="mt-1">{log.remarks}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
