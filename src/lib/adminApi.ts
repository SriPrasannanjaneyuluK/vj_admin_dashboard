import type { CourseFormValues } from "@/lib/courseForm";
import { formToApiPayload } from "@/lib/courseForm";
import {
  apiFetch,
  isApiConfigured,
  refreshAccessToken,
  setAccessToken,
} from "@/lib/authSession";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type UserRole = "admin" | "teacher" | "student" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  accessRevoked?: boolean;
}

export interface AdminCourse {
  id: number;
  slug: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  icon: string;
  tag: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tagline: string | null;
  cardImageUrl: string | null;
  bannerUrl: string | null;
  mode: string;
  hasCertificate: boolean;
  hasPlacementAssistance: boolean;
  instructorName: string | null;
  instructorTitle: string | null;
  instructorBio: string | null;
  rating: number | null;
  overview: string | null;
  audience: string | null;
  prerequisites: string | null;
  technologies: string[];
  outcomes: string[];
  curriculum: Array<{ week: number; title: string; topics: string[] }>;
  projects: Array<{ title: string; description: string }>;
  careers: Array<{ title: string; description: string }>;
  feeStructure: {
    type: "one_time" | "emi";
    amount: number;
    currency: string;
    emi?: { monthly: number; months: number };
    discount?: string;
    scholarship?: string;
  } | null;
}

export interface AdminDemoSession {
  id: number;
  courseId: number;
  startsAt: string;
  durationMinutes: number;
  mode: "online" | "offline";
  maxSeats: number;
  bookedSeats: number;
  availableSeats: number;
  instructorName: string | null;
  joinLink: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminDemoBooking {
  id: number;
  bookingRef: string;
  status: string;
  createdAt: string;
  studentEmail: string;
  studentPhone: string | null;
  courseTitle: string;
  courseSlug: string;
  demoStartsAt: string;
  demoMode: string;
  instructorName: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  accessRevoked: boolean;
  createdAt: string;
}

export interface AdminContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export { isApiConfigured, refreshAccessToken, setAccessToken };

async function adminRequest<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const response = await apiFetch(
    path,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    },
    token
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.error === "string" ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchAuthUser(token: string) {
  return adminRequest<{ user: AuthUser }>("/api/auth/me", token);
}

export function portalSignIn(
  email: string,
  password: string,
  portal: "public" | "admin"
) {
  return loginRequest<{
    access_token: string;
    user: AuthUser;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, portal }),
  });
}

export function portalLogout() {
  return loginRequest<{ ok: true }>("/api/auth/logout", {
    method: "POST",
  });
}

async function loginRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error("Invalid email or password.");
  }

  return response.json() as Promise<T>;
}

export function fetchAdminCourses(token: string) {
  return adminRequest<{ courses: AdminCourse[] }>("/api/admin/courses", token);
}

export function fetchAdminCourse(token: string, id: number) {
  return adminRequest<{ course: AdminCourse }>(`/api/admin/courses/${id}`, token);
}

export function createAdminCourse(token: string, values: CourseFormValues, publish: boolean) {
  return adminRequest<{ course: AdminCourse }>("/api/admin/courses", token, {
    method: "POST",
    body: JSON.stringify(formToApiPayload(values, publish)),
  });
}

export function updateAdminCourse(
  token: string,
  id: number,
  values: CourseFormValues,
  publish?: boolean
) {
  const payload = formToApiPayload(values, publish ?? values.isPublished);
  return adminRequest<{ course: AdminCourse }>(`/api/admin/courses/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function patchAdminCourse(token: string, id: number, input: Record<string, unknown>) {
  return adminRequest<{ course: AdminCourse }>(`/api/admin/courses/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function uploadAdminImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(
    "/api/admin/uploads/image",
    { method: "POST", body: formData },
    token
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.error === "string" ? body.error : `Upload failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<{ url: string; publicId: string }>;
}

export function deleteAdminCourse(token: string, id: number) {
  return adminRequest<void>(`/api/admin/courses/${id}`, token, {
    method: "DELETE",
  });
}

export function fetchAdminDemoSessions(token: string, courseId: number) {
  return adminRequest<{ sessions: AdminDemoSession[] }>(
    `/api/admin/courses/${courseId}/demo-sessions`,
    token
  );
}

export function createAdminDemoSession(
  token: string,
  courseId: number,
  input: {
    startsAt: string;
    durationMinutes: number;
    mode: "online" | "offline";
    maxSeats: number;
    instructorName?: string;
    joinLink?: string;
    isActive?: boolean;
  }
) {
  return adminRequest<{ session: AdminDemoSession }>(
    `/api/admin/courses/${courseId}/demo-sessions`,
    token,
    { method: "POST", body: JSON.stringify(input) }
  );
}

export function updateAdminDemoSession(
  token: string,
  sessionId: number,
  input: Partial<{
    startsAt: string;
    durationMinutes: number;
    mode: "online" | "offline";
    maxSeats: number;
    instructorName: string;
    joinLink: string;
    isActive: boolean;
  }>
) {
  return adminRequest<{ session: AdminDemoSession }>(
    `/api/admin/demo-sessions/${sessionId}`,
    token,
    { method: "PUT", body: JSON.stringify(input) }
  );
}

export function deleteAdminDemoSession(token: string, sessionId: number) {
  return adminRequest<void>(`/api/admin/demo-sessions/${sessionId}`, token, {
    method: "DELETE",
  });
}

export function fetchAdminDemoBookings(
  token: string,
  filters?: { courseId?: number; status?: string }
) {
  const params = new URLSearchParams();
  if (filters?.courseId) params.set("courseId", String(filters.courseId));
  if (filters?.status) params.set("status", filters.status);
  const query = params.toString();
  return adminRequest<{ bookings: AdminDemoBooking[] }>(
    `/api/admin/demo-bookings${query ? `?${query}` : ""}`,
    token
  );
}

export function updateAdminDemoBookingStatus(
  token: string,
  id: number,
  status: "confirmed" | "cancelled" | "attended"
) {
  return adminRequest<{ booking: { id: number; status: string } }>(
    `/api/admin/demo-bookings/${id}`,
    token,
    { method: "PATCH", body: JSON.stringify({ status }) }
  );
}

export function fetchAdminUsers(token: string) {
  return adminRequest<{ users: AdminUser[] }>("/api/admin/users", token);
}

export function updateAdminUserAccess(
  token: string,
  id: string,
  input: { accessRevoked?: boolean; role?: UserRole }
) {
  return adminRequest<{ user: AdminUser }>(`/api/admin/users/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function fetchAdminContactSubmissions(token: string) {
  return adminRequest<{ submissions: AdminContactSubmission[] }>(
    "/api/admin/contact",
    token
  );
}
