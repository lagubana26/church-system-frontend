import { useEffect, useState } from "react";
import api from "../../api/client";
import Layout from "../../components/Layout.jsx";

// Finds the most recent Sunday on/before today, as a sensible default
function mostRecentSunday() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function isSunday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  return !isNaN(d) && d.getDay() === 0;
}

const EMPTY_FORM = {
  service_date: mostRecentSunday(),
  service_name: "10AM",
  adults_count: "",
  kids_count: "",
  serve_team_count: "",
  notes: "",
};

export default function SundayAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/attendance/sunday")
      .then((res) => setRecords(res.data.records))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isSunday(form.service_date)) {
      setError("Only Sundays are allowed for Sunday attendance.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/attendance/sunday", {
        ...form,
        adults_count: Number(form.adults_count) || 0,
        kids_count: Number(form.kids_count) || 0,
        serve_team_count: Number(form.serve_team_count) || 0,
      });
      setForm({ ...EMPTY_FORM, service_date: form.service_date });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl">Sunday attendance</h1>
        <p className="text-ink-soft">Record and review weekly service headcounts.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 text-base">Record a service</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="rounded-sm border border-ink bg-black/[0.03] px-3 py-2 text-sm text-ink">{error}</p>
            )}
            <div>
              <label className="field-label">Date</label>
              <input
                type="date"
                className="input"
                value={form.service_date}
                onChange={(e) => setForm({ ...form, service_date: e.target.value })}
              />
              <p className="mt-1 text-xs text-ink-soft">Sunday dates only.</p>
            </div>
            <div>
              <label className="field-label">Service</label>
              <select
                className="select"
                value={form.service_name}
                onChange={(e) => setForm({ ...form, service_name: e.target.value })}
              >
                <option value="10AM">10AM</option>
                <option value="4PM">4PM</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="field-label">Adults</label>
                <input
                  type="number"
                  className="input"
                  value={form.adults_count}
                  onChange={(e) => setForm({ ...form, adults_count: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Kids</label>
                <input
                  type="number"
                  className="input"
                  value={form.kids_count}
                  onChange={(e) => setForm({ ...form, kids_count: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Serve team</label>
                <input
                  type="number"
                  className="input"
                  value={form.serve_team_count}
                  onChange={(e) => setForm({ ...form, serve_team_count: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="field-label">Notes</label>
              <textarea
                className="input"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button type="submit" disabled={saving} className="btn-gold w-full">
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </div>

        <div className="card overflow-x-auto lg:col-span-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Adults</th>
                <th>Kids</th>
                <th>Serve team</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-soft">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                records.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.service_date).toLocaleDateString()}</td>
                    <td>{r.service_name}</td>
                    <td>{r.adults_count}</td>
                    <td>{r.kids_count}</td>
                    <td>{r.serve_team_count}</td>
                    <td className="font-medium">{r.total_count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
