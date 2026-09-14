import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <p className="font-display text-3xl">Not authorized</p>
      <p className="text-sm text-ink-soft">Your account role can't access that page.</p>
      <Link to="/dashboard" className="btn-outline mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
