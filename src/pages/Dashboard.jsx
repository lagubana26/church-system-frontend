import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import StatCard from "../components/StatCard.jsx";
import { CalendarIcon, ChartIcon, TrophyIcon, UsersIcon, LeafIcon, ClockIcon } from "../components/Icons.jsx";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function SectionHeader({ icon, title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-ink-soft">{icon}</span>
        <h2 className="text-base">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Simple monochrome horizontal bar — value relative to the largest in the set
function MiniBar({ label, value, max }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-black/[0.06]">
        <div className="h-1.5 rounded-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function LeaderDashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/members"), api.get("/schedules")])
      .then(([m, s]) => {
        setMembers(m.data.members);
        setSchedules(s.data.schedules);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="mb-8 border-b-2 border-ink pb-5">
        <h1 className="font-display text-3xl">Welcome back, {user.full_name?.split(" ")[0]}</h1>
        <p className="mt-1 text-ink-soft">Here's a look at your group.</p>
      </div>

      {loading ? (
        <p className="text-ink-soft">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="My members" value={members.length} icon={<UsersIcon />} />
            <StatCard label="My group schedules" value={schedules.length} icon={<CalendarIcon />} />
          </div>

          <div className="mt-8 card p-5">
            <SectionHeader
              icon={<UsersIcon />}
              title="My members"
              action={
                <Link to="/members" className="text-sm link">
                  View all
                </Link>
              }
            />
            {members.length === 0 ? (
              <p className="text-sm text-ink-soft">No members yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {members.slice(0, 6).map((m) => (
                  <li key={m._id} className="flex items-center justify-between py-2 text-sm">
                    <span>{m.full_name}</span>
                    <span className="text-ink-soft capitalize">{m.member_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
}

function AdminStaffDashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);

  function load() {
    setLoading(true);
    Promise.all([
      api.get("/dashboard/summary", { params: { month, year } }),
      api.get("/users", { params: { status: "pending" } }),
    ])
      .then(([s, u]) => {
        setSummary(s.data);
        setPendingUsers(u.data.users);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [month, year]);

  const discipleshipRows = summary
    ? [
        { label: "1-on-1 Discipleship", value: summary.discipleship.one2one_completed || 0 },
        { label: "Victory Day", value: summary.discipleship.victory_day_completed || 0 },
        { label: "Baptism", value: summary.discipleship.baptism_completed || 0 },
        { label: "Spiritual Foundation", value: summary.discipleship.spiritual_foundation_completed || 0 },
        { label: "Leadership 113", value: summary.discipleship.leadership_113_completed || 0 },
      ]
    : [];
  const discipleshipMax = Math.max(1, ...discipleshipRows.map((r) => r.value));
  const categoryMax = summary
    ? Math.max(1, ...summary.leaderCategoryBreakdown.map((c) => c.total))
    : 1;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 border-b-2 border-ink pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Church overview</h1>
          <p className="mt-1 text-ink-soft">
            Attendance, leaders, members, interns, and discipleship — all in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="select w-36" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select className="select w-28" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !summary ? (
        <p className="text-ink-soft">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={`Sundays recorded — ${summary.monthLabel}`}
              value={summary.attendanceSummary.total_sundays}
              icon={<CalendarIcon />}
            />
            <StatCard
              label="Average Sunday attendance"
              value={summary.attendanceSummary.avg_sunday_attendance}
              icon={<ChartIcon />}
            />
            <StatCard
              label="Highest Sunday attendance"
              value={summary.attendanceSummary.highest_sunday_attendance}
              icon={<TrophyIcon />}
            />
            <StatCard
              label="Pending leader/staff approvals"
              value={pendingUsers.length}
              icon={<ClockIcon />}
              sub={pendingUsers.length ? "Needs review" : "All caught up"}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total people" value={summary.peopleSummary.total_people} icon={<UsersIcon />} />
            <StatCard label="Members" value={summary.peopleSummary.total_members} icon={<UsersIcon />} />
            <StatCard label="Interns" value={summary.peopleSummary.total_interns} icon={<LeafIcon />} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Leader category breakdown */}
            <div className="card p-5">
              <SectionHeader icon={<UsersIcon />} title="Leaders by category" />
              <p className="mb-4 -mt-2 text-xs text-ink-soft">
                {summary.leaders.approved} approved · {summary.leaders.pending} pending
              </p>
              {summary.leaderCategoryBreakdown.length === 0 ? (
                <p className="text-sm text-ink-soft">No approved leaders yet.</p>
              ) : (
                <div className="space-y-3">
                  {summary.leaderCategoryBreakdown.map((c) => (
                    <MiniBar key={c.label} label={c.label} value={c.total} max={categoryMax} />
                  ))}
                </div>
              )}
            </div>

            {/* Discipleship completion counts */}
            <div className="card p-5">
              <SectionHeader
                icon={<LeafIcon />}
                title="Discipleship milestones completed"
                action={
                  <Link to="/reports" className="text-sm link">
                    Full breakdown
                  </Link>
                }
              />
              <div className="space-y-3">
                {discipleshipRows.map((r) => (
                  <MiniBar key={r.label} label={r.label} value={r.value} max={discipleshipMax} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent attendance */}
            <div className="card p-5">
              <SectionHeader
                icon={<CalendarIcon />}
                title="Recent Sunday attendance"
                action={
                  <Link to="/sunday-attendance" className="text-sm link">
                    View all
                  </Link>
                }
              />
              {summary.recentAttendance.length === 0 ? (
                <p className="text-sm text-ink-soft">No records yet.</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {summary.recentAttendance.map((r) => (
                    <li key={r._id} className="flex items-center justify-between py-2">
                      <span>
                        {new Date(r.service_date).toLocaleDateString()} · {r.service_name}
                      </span>
                      <span className="font-medium">{r.total_count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Top leaders */}
            <div className="card p-5">
              <SectionHeader icon={<TrophyIcon />} title="Top leaders by group size" />
              {summary.topLeaders.length === 0 ? (
                <p className="text-sm text-ink-soft">No data yet.</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {summary.topLeaders.map((l, i) => (
                    <li key={l._id} className="flex items-center gap-3 py-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-ink text-xs font-medium">
                        {i + 1}
                      </span>
                      <span className="flex-1">{l.full_name}</span>
                      <span className="text-ink-soft">
                        {l.total_people} ({l.members_count}m, {l.interns_count}i)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {pendingUsers.length > 0 && (
            <div className="mt-6 card p-5">
              <SectionHeader
                icon={<ClockIcon />}
                title="Accounts awaiting approval"
                action={
                  <Link to="/users" className="text-sm link">
                    Review all
                  </Link>
                }
              />
              <ul className="divide-y divide-line">
                {pendingUsers.slice(0, 5).map((u) => (
                  <li key={u._id} className="flex items-center justify-between py-2 text-sm">
                    <span>
                      {u.full_name} <span className="text-ink-soft">· {u.role}</span>
                    </span>
                    <span className="text-ink-soft">@{u.username}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      {user.role === "leader" ? <LeaderDashboard /> : <AdminStaffDashboard />}
    </Layout>
  );
}
