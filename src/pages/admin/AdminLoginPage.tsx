import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth, isSupabaseConfigured } from "@/context/AuthContext";
import { Logo } from "@/components/layout/Logo";
import { STATIC_SITE } from "@/lib/staticSite";
import { toSignInError } from "@/lib/authMessages";

export function AdminLoginPage() {
  const { signIn, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(toSignInError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" />
          <h1 className="mt-6 text-2xl font-bold text-foreground">Sign in</h1>
          <p className="mt-2 text-sm text-muted">{STATIC_SITE.name}</p>
        </div>

        {!isSupabaseConfigured && (
          <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to vi_ai_forge_admin/.env
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-white p-8 shadow-sm space-y-5"
        >
          <label className="block">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="you@example.com"
              autoComplete="username"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !isSupabaseConfigured}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            <LogIn size={16} />
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
