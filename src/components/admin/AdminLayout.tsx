import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { STATIC_SITE } from "@/lib/staticSite";

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL ?? "http://localhost:5173";

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-6">
            <Logo size="sm" />
            <div>
              <p className="text-sm font-semibold text-foreground">Admin Portal</p>
              <p className="text-xs text-muted">{STATIC_SITE.name}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted">{user?.email}</span>
            <a
              href={PORTAL_URL}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              View public site
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted/30"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
