import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <p className="font-display text-3xl">Page not found</p>
      <Link to="/dashboard" className="btn-outline mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
