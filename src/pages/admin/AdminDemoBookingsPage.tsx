import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminDemoBookings,
  updateAdminDemoBookingStatus,
  type AdminDemoBooking,
} from "@/lib/adminApi";
import { FadeInItem } from "@/components/motion/FadeIn";

export function AdminDemoBookingsPage() {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<AdminDemoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const { bookings: data } = await fetchAdminDemoBookings(accessToken, {
        status: statusFilter || undefined,
      });
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [accessToken, statusFilter]);

  const updateStatus = async (booking: AdminDemoBooking, status: "confirmed" | "cancelled" | "attended") => {
    if (!accessToken) return;
    try {
      await updateAdminDemoBookingStatus(accessToken, booking.id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  return (
    <FadeInItem>
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo bookings</h1>
          <p className="text-sm text-muted mt-1">Student demo class reservations, newest first.</p>
        </div>
        <select
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="attended">Attended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-white">
          <p className="font-medium text-foreground">No demo bookings yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Demo</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs">{b.bookingRef}</p>
                    <p className="text-xs text-muted mt-1">{new Date(b.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{b.studentEmail}</p>
                    {b.studentPhone && <p className="text-xs text-muted">{b.studentPhone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.courseTitle}</p>
                    <p className="text-xs text-muted">{b.courseSlug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <p>{new Date(b.demoStartsAt).toLocaleString()}</p>
                    <p className="text-xs capitalize">{b.demoMode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-border px-2 py-1 text-xs"
                      value={b.status}
                      onChange={(e) =>
                        updateStatus(b, e.target.value as "confirmed" | "cancelled" | "attended")
                      }
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="attended">Attended</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FadeInItem>
  );
}
