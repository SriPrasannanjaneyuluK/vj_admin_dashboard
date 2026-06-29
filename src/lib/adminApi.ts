import type { CourseFormValues } from "@/lib/courseForm";

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
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  accessRevoked: boolean;
  createdAt: string;
}

async function adminRequest<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

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
    session: { access_token: string; refresh_token: string };
    user: AuthUser;
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, portal }),
  });
}

async function loginRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
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

export function createAdminCourse(token: string, input: CourseFormValues) {
  return adminRequest<{ course: AdminCourse }>("/api/admin/courses", token, {
    method: "POST",
    body: JSON.stringify({
      slug: input.slug,
      title: input.title,
      description: input.description,
      level: input.level,
      duration: input.duration,
      icon: input.icon,
      tag: input.tag,
      sortOrder: input.sortOrder,
      isPublished: input.isPublished,
      featureOnHomepage: input.featureOnHomepage,
      stack: input.stack,
    }),
  });
}

export function updateAdminCourse(
  token: string,
  id: number,
  input: Partial<CourseFormValues>
) {
  return adminRequest<{ course: AdminCourse }>(`/api/admin/courses/${id}`, token, {
    method: "PUT",
    body: JSON.stringify({
      slug: input.slug,
      title: input.title,
      description: input.description,
      level: input.level,
      duration: input.duration,
      icon: input.icon,
      tag: input.tag,
      sortOrder: input.sortOrder,
      isPublished: input.isPublished,
      featureOnHomepage: input.featureOnHomepage,
      stack: input.stack,
    }),
  });
}

export function deleteAdminCourse(token: string, id: number) {
  return adminRequest<void>(`/api/admin/courses/${id}`, token, {
    method: "DELETE",
  });
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
