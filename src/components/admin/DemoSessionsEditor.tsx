import { useEffect, useState } from "react";
import { Calendar, Loader2, Plus, Trash2 } from "lucide-react";
import {
  createAdminDemoSession,
  deleteAdminDemoSession,
  fetchAdminDemoSessions,
  updateAdminDemoSession,
  type AdminDemoSession,
} from "@/lib/adminApi";

type DemoSessionsEditorProps = {
  courseId: number;
  accessToken: string;
  defaultInstructor?: string;
};

function localDatetimeToIso(value: string) {
  return new Date(value).toISOString();
}

const EMPTY_FORM: {
  startsAt: string;
  durationMinutes: number;
  mode: "online" | "offline";
  maxSeats: number;
  instructorName: string;
  joinLink: string;
  isActive: boolean;
} = {
  startsAt: "",
  durationMinutes: 60,
  mode: "online",
  maxSeats: 20,
  instructorName: "",
  joinLink: "",
  isActive: true,
};

export function DemoSessionsEditor({
  courseId,
  accessToken,
  defaultInstructor = "",
}: DemoSessionsEditorProps) {
  const [sessions, setSessions] = useState<AdminDemoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, instructorName: defaultInstructor });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { sessions: data } = await fetchAdminDemoSessions(accessToken, courseId);
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load demo sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [courseId, accessToken]);

  const handleCreate = async () => {
    if (!form.startsAt) {
      setError("Pick a date and time for the demo.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createAdminDemoSession(accessToken, courseId, {
        startsAt: localDatetimeToIso(form.startsAt),
        durationMinutes: form.durationMinutes,
        mode: form.mode,
        maxSeats: form.maxSeats,
        instructorName: form.instructorName || undefined,
        joinLink: form.joinLink || undefined,
        isActive: form.isActive,
      });
      setForm({ ...EMPTY_FORM, instructorName: defaultInstructor });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (session: AdminDemoSession) => {
    try {
      await updateAdminDemoSession(accessToken, session.id, {
        isActive: !session.isActive,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update session");
    }
  };

  const remove = async (session: AdminDemoSession) => {
    if (!confirm("Delete this demo session?")) return;
    try {
      await deleteAdminDemoSession(accessToken, session.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session");
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        These slots appear on the public course page and in the booking popup.
      </p>

      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 px-4 py-3">{error}</p>
      )}

      <div className="rounded-2xl border border-border bg-muted/10 p-5 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Plus size={16} /> Add demo slot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="font-medium">Date & time</span>
            <input
              type="datetime-local"
              className={`${fieldClass} mt-1`}
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Duration (minutes)</span>
            <input
              type="number"
              min={15}
              className={`${fieldClass} mt-1`}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Mode</span>
            <select
              className={`${fieldClass} mt-1`}
              value={form.mode}
              onChange={(e) =>
                setForm((f) => ({ ...f, mode: e.target.value as "online" | "offline" }))
              }
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Max seats</span>
            <input
              type="number"
              min={1}
              className={`${fieldClass} mt-1`}
              value={form.maxSeats}
              onChange={(e) => setForm((f) => ({ ...f, maxSeats: Number(e.target.value) }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Instructor name</span>
            <input
              className={`${fieldClass} mt-1`}
              value={form.instructorName}
              onChange={(e) => setForm((f) => ({ ...f, instructorName: e.target.value }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Join link (optional)</span>
            <input
              className={`${fieldClass} mt-1`}
              placeholder="https://meet.google.com/..."
              value={form.joinLink}
              onChange={(e) => setForm((f) => ({ ...f, joinLink: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add slot
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted">No demo sessions yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-white p-4"
            >
              <div>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Calendar size={14} className="text-accent" />
                  {new Date(session.startsAt).toLocaleString()}
                </p>
                <p className="text-xs text-muted mt-1">
                  {session.mode} · {session.bookedSeats}/{session.maxSeats} booked ·{" "}
                  {session.isActive ? "Active" : "Hidden"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(session)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted/30"
                >
                  {session.isActive ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(session)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
