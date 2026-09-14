import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import Modal from "../../components/Modal.jsx";

const EMPTY_FORM = {
  full_name: "",
  member_type: "member",
  gender: "",
  age: "",
  contact_number: "",
  address: "",
  date_joined: "",
  notes: "",
  leader_id: "",
};

export default function Members() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function loadMembers() {
    setLoading(true);
    api
      .get("/members", { params: search ? { search } : {} })
      .then((res) => setMembers(res.data.members))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMembers();
    if (user.role !== "leader") {
      api.get("/users", { params: { role: "leader", status: "approved" } }).then((res) =>
        setLeaders(res.data.users)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(loadMembers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(m) {
    setEditingId(m._id);
    setForm({
      full_name: m.full_name,
      member_type: m.member_type,
      gender: m.gender || "",
      age: m.age || "",
      contact_number: m.contact_number || "",
      address: m.address || "",
      date_joined: m.date_joined ? m.date_joined.slice(0, 10) : "",
      notes: m.notes || "",
      leader_id: m.leader_id?._id || m.leader_id || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, form);
      } else {
        await api.post("/members", form);
      }
      setModalOpen(false);
      loadMembers();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save member.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this member and all their records? This can't be undone.")) return;
    await api.delete(`/members/${id}`);
    loadMembers();
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl">{user.role === "leader" ? "My members" : "Members"}</h1>
          <p className="text-ink-soft">Manage member records and discipleship progress.</p>
        </div>
        <button onClick={openCreate} className="btn-gold self-start sm:self-auto">
          Add member
        </button>
      </div>

      <input
        className="input mb-4 max-w-xs"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contact</th>
              {user.role !== "leader" && <th>Leader</th>}
              <th>Joined</th>
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
            {!loading && members.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ink-soft">
                  No members found.
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m._id}>
                <td>
                  <Link to={`/members/${m._id}`} className="font-medium text-ink hover:underline">
                    {m.full_name}
                  </Link>
                </td>
                <td className="capitalize">{m.member_type}</td>
                <td>{m.contact_number || "—"}</td>
                {user.role !== "leader" && (
                  <td>{m.leader_id?.full_name || "—"}</td>
                )}
                <td>{m.date_joined ? new Date(m.date_joined).toLocaleDateString() : "—"}</td>
                <td className="text-right">
                  <button onClick={() => openEdit(m)} className="btn-outline btn-sm mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(m._id)} className="btn-danger btn-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal title={editingId ? "Edit member" : "Add member"} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {error && (
              <p className="sm:col-span-2 rounded-sm border border-ink bg-black/[0.03] px-3 py-2 text-sm text-ink">
                {error}
              </p>
            )}
            <div className="sm:col-span-2">
              <label className="field-label">Full name</label>
              <input
                className="input"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label">Type</label>
              <select
                className="select"
                value={form.member_type}
                onChange={(e) => setForm({ ...form, member_type: e.target.value })}
              >
                <option value="member">Member</option>
                <option value="intern">Intern</option>
              </select>
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

            <div>
              <label className="field-label">Gender</label>
              <input
                className="input"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label">Age</label>
              <input
                type="number"
                className="input"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label">Contact number</label>
              <input
                className="input"
                value={form.contact_number}
                onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label">Date joined</label>
              <input
                type="date"
                className="input"
                value={form.date_joined}
                onChange={(e) => setForm({ ...form, date_joined: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Address</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Save changes" : "Add member"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
