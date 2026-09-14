import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Members from "./pages/shared/Members.jsx";
import MemberDetail from "./pages/MemberDetail.jsx";
import Schedules from "./pages/shared/Schedules.jsx";
import SundayAttendance from "./pages/staff/SundayAttendance.jsx";
import Reports from "./pages/shared/Reports.jsx";
import Users from "./pages/staff/Users.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-ink-soft">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["admin", "staff", "leader"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute roles={["admin", "staff", "leader"]}>
            <Members />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:id"
        element={
          <ProtectedRoute roles={["admin", "staff", "leader"]}>
            <MemberDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedules"
        element={
          <ProtectedRoute roles={["admin", "staff", "leader"]}>
            <Schedules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sunday-attendance"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <SundayAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={["admin", "staff"]}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
