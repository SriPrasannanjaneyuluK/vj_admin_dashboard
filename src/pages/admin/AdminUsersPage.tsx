import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminUsers,
  updateAdminUserAccess,
  type AdminUser,
} from "@/lib/adminApi";
import { FadeInItem } from "@/components/motion/FadeIn";

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  user: "User",
};

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const token = accessToken ?? "";

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(token);
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [token]);

  const handleRevoke = async (user: AdminUser) => {
    if (!token || user.accessRevoked) return;
    const confirmed = window.confirm(
      `Revoke access for ${user.email}? They will be signed out and cannot use the portal.`
    );
    if (!confirmed) return;

    setBusyId(user.id);
    try {
      const { user: updated } = await updateAdminUserAccess(token, user.id, {
        accessRevoked: true,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revoke access");
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (user: AdminUser) => {
    if (!token || !user.accessRevoked) return;
    setBusyId(user.id);
    try {
      const { user: updated } = await updateAdminUserAccess(token, user.id, {
        accessRevoked: false,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore access");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <FadeInItem>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User access</h1>
        <p className="mt-2 text-sm text-muted max-w-2xl">
          Manage portal access for registered users. Revoking access signs the user
          out and blocks API authentication until restored.
        </p>
      </div>

      {loading && <p className="text-sm text-muted">Loading users…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-background/80 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{user.email}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.accessRevoked
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {user.accessRevoked ? "Revoked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.accessRevoked ? (
                      <button
                        type="button"
                        disabled={busyId === user.id}
                        onClick={() => handleRestore(user)}
                        className="text-accent hover:underline disabled:opacity-50"
                      >
                        Restore access
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === user.id || user.role === "admin"}
                        onClick={() => handleRevoke(user)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                        title={
                          user.role === "admin"
                            ? "Admin accounts cannot be revoked here"
                            : undefined
                        }
                      >
                        Revoke access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="px-4 py-8 text-center text-muted">No users found.</p>
          )}
        </div>
      )}
    </FadeInItem>
  );
}
