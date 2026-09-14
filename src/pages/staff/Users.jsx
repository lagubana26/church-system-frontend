import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext.jsx";
import Layout from "../../components/Layout.jsx";
import StatusPill from "../../components/StatusPill.jsx";
import Modal from "../../components/Modal.jsx";

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ role: "", status: "", leader_category: "" });

  function load() {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (roleFilter) params.role = roleFilter;
    api
      .get("/users", { params })
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter, roleFilter]);

  async function handleApprove(id) {
    await api.patch(`/users/${id}/approve`);
    load();
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    await api.patch(`/users/${resetTarget._id}/reset-password`, { newPassword });
    setResetTarget(null);
    setNewPassword("");
  }

  function openEdit(u) {
    setEditTarget(u);
    setEditForm({ role: u.role, status: u.status, leader_category: u.leader_category || "" });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    await api.put(`/users/${editTarget._id}`, editForm);
    setEditTarget(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user and all their records? This can't be undone.")) return;
    await api.delete(`/users/${id}`);
    load();
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl">Manage users</h1>
        <p className="text-ink-soft">Approve accounts and manage leader &amp; staff access.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select className="select w-full sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
        <select className="select w-full sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="leader">Leader</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-soft">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-soft">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u._id}>
                <td className="font-medium">{u.full_name}</td>
                <td>@{u.username}</td>
                <td className="capitalize">{u.role}</td>
                <td>
                  <StatusPill status={u.status} />
                </td>
                <td className="text-right space-x-2 whitespace-nowrap">
                  {u.status === "pending" && (
                    <button onClick={() => handleApprove(u._id)} className="btn-gold btn-sm">
                      Approve
                    </button>
                  )}
                  <button onClick={() => setResetTarget(u)} className="btn-outline btn-sm">
                    Reset password
                  </button>
                  {me.role === "admin" && u._id !== me.id && (
                    <>
                      <button onClick={() => openEdit(u)} className="btn-outline btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="btn-danger btn-sm">
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resetTarget && (
        <Modal title={`Reset password — ${resetTarget.full_name}`} onClose={() => setResetTarget(null)}>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="field-label">New password</label>
              <input
                type="password"
                className="input"
                minLength={6}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResetTarget(null)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Reset password
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editTarget && (
        <Modal title={`Edit — ${editTarget.full_name}`} onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="field-label">Role</label>
              <select
                className="select"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="leader">Leader</option>
              </select>
            </div>
            <div>
              <label className="field-label">Status</label>
              <select
                className="select"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            {editForm.role === "leader" && (
              <div>
                <label className="field-label">Leader category</label>
                <input
                  className="input"
                  value={editForm.leader_category}
                  onChange={(e) => setEditForm({ ...editForm, leader_category: e.target.value })}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditTarget(null)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
