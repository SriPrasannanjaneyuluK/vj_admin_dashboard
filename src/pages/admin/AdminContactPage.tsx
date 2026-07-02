import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminContactSubmissions, type AdminContactSubmission } from "@/lib/adminApi";
import { FadeInItem } from "@/components/motion/FadeIn";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminContactPage() {
  const { accessToken } = useAuth();
  const [submissions, setSubmissions] = useState<AdminContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const token = accessToken ?? "";

  const loadSubmissions = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const { submissions: data } = await fetchAdminContactSubmissions(token);
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, [token]);

  return (
    <FadeInItem>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Contact messages</h1>
        <p className="text-sm text-muted mt-1">
          Inquiries from the public site contact form, newest first.
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 rounded-lg bg-red-50 px-4 py-3">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading messages…</p>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="font-medium text-foreground">No messages yet</p>
          <p className="text-sm text-muted mt-2">
            Submissions will appear here when visitors use the contact form.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((item) => {
            const isOpen = expandedId === item.id;
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-border bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted">{item.email}</p>
                  </div>
                  <p className="text-xs text-muted shrink-0">{formatDate(item.createdAt)}</p>
                </button>
                {isOpen && (
                  <div className="border-t border-border px-5 py-4 bg-muted/10">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </FadeInItem>
  );
}
