import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import Modal from "../../components/Modal.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY_FORM = {
  group_name: "",
  schedule_day: "Monday",
  schedule_time: "18:00",
  location: "",
  notes: "",
  leader_id: "",
};

export default function Schedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function loadSchedules() {
    setLoading(true);
    api
      .get("/schedules")
      .then((res) => setSchedules(res.data.schedules))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSchedules();
    if (user.role !== "leader") {
      api.get("/users", { params: { role: "leader", status: "approved" } }).then((res) =>
        setLeaders(res.data.users)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(s) {
    setEditingId(s._id);
    setForm({
      group_name: s.group_name,
      schedule_day: s.schedule_day,
      schedule_time: s.schedule_time,
      location: s.location || "",
      notes: s.notes || "",
      leader_id: s.leader_id?._id || s.leader_id || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/schedules/${editingId}`, form);
      } else {
        await api.post("/schedules", form);
      }
      setModalOpen(false);
      loadSchedules();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save schedule.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this schedule?")) return;
    await api.delete(`/schedules/${id}`);
    loadSchedules();
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl">
            {user.role === "leader" ? "My group schedules" : "Group schedules"}
          </h1>
          <p className="text-ink-soft">Weekly victory group meeting times.</p>
        </div>
        <button onClick={openCreate} className="btn-gold self-start sm:self-auto">
          Add schedule
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Day</th>
              <th>Time</th>
              <th>Location</th>
              {user.role !== "leader" && <th>Leader</th>}
              <th></th>
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
            {!loading && schedules.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ink-soft">
                  No schedules yet.
                </td>
              </tr>
            )}
            {schedules.map((s) => (
              <tr key={s._id}>
                <td className="font-medium">{s.group_name}</td>
                <td>{s.schedule_day}</td>
                <td>{s.schedule_time}</td>
                <td>{s.location || "—"}</td>
                {user.role !== "leader" && <td>{s.leader_id?.full_name || "—"}</td>}
                <td className="text-right">
                  <button onClick={() => openEdit(s)} className="btn-outline btn-sm mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s._id)} className="btn-danger btn-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit schedule" : "Add schedule"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-sm border border-ink bg-black/[0.03] px-3 py-2 text-sm text-ink">{error}</p>
            )}
            <div>
              <label className="field-label">Group name</label>
              <input
                className="input"
                required
                value={form.group_name}
                onChange={(e) => setForm({ ...form, group_name: e.target.value })}
              />
            </div>

            {user.role !== "leader" && (
              <div>
                <label className="field-label">Leader</label>
                <select
                  className="select"
                  required
                  value={form.leader_id}
                  onChange={(e) => setForm({ ...form, leader_id: e.target.value })}
                >
                  <option value="">Select a leader…</option>
                  {leaders.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.full_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Day</label>
                <select
                  className="select"
                  value={form.schedule_day}
                  onChange={(e) => setForm({ ...form, schedule_day: e.target.value })}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Time</label>
                <input
                  type="time"
                  className="input"
                  value={form.schedule_time}
                  onChange={(e) => setForm({ ...form, schedule_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Location</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
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

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Save changes" : "Add schedule"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
