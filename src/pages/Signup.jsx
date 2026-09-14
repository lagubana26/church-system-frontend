import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "leader",
    leader_category: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && form.password !== confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await signup(form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="card w-full max-w-sm p-6 text-center">
          <h2 className="mb-2 text-lg">Account created</h2>
          <p className="text-sm text-ink-soft">
            An admin or staff member needs to approve your account before you can sign in.
          </p>
          <Link to="/login" className="btn-outline mt-5 inline-flex">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl">Create an account</p>
          <p className="text-sm text-ink-soft">For group leaders &amp; staff</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <p className="rounded-sm border border-ink bg-black/[0.03] px-3 py-2 text-sm text-ink">{error}</p>
          )}

          <div>
            <label className="field-label">Full name</label>
            <input
              className="input"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label">Role</label>
            <select
              className="select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="leader">Group Leader</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {form.role === "leader" && (
            <div>
              <label className="field-label">Group / category (optional)</label>
              <input
                className="input"
                value={form.leader_category}
                onChange={(e) => setForm({ ...form, leader_category: e.target.value })}
                placeholder="e.g. Youth, Young Pro"
              />
            </div>
          )}

          <div>
            <label className="field-label">Username</label>
            <input
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label">Email (optional)</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="field-label">Confirm password</label>
            <input
              type="password"
              className={`input ${passwordsMismatch ? "border-ink" : ""}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            {passwordsMismatch && (
              <p className="mt-1 text-xs text-ink-soft">Passwords don't match yet.</p>
            )}
          </div>

          <button type="submit" disabled={busy || passwordsMismatch} className="btn-primary w-full">
            {busy ? "Creating…" : "Create account"}
          </button>

          <p className="text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
