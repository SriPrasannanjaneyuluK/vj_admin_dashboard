import type { CourseFormValues } from "@/lib/courseForm";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type UserRole = "admin" | "teacher" | "student" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
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
