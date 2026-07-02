import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, EyeOff, Trash2, ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  deleteAdminCourse,
  fetchAdminCourses,
  patchAdminCourse,
  type AdminCourse,
} from "@/lib/adminApi";
import { FadeInItem } from "@/components/motion/FadeIn";

export function AdminCoursesPage() {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const { courses: data } = await fetchAdminCourses(accessToken);
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [accessToken]);

  const togglePublish = async (course: AdminCourse) => {
    if (!accessToken) return;
    try {
      await patchAdminCourse(accessToken, course.id, {
        isPublished: !course.isPublished,
      });
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
    }
  };

  const removeCourse = async (course: AdminCourse) => {
    if (!accessToken) return;
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCourse(accessToken, course.id);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  return (
    <FadeInItem>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Course management</h1>
          <p className="text-sm text-muted mt-1">
            Create, publish, and manage courses on the public site.
          </p>
        </div>
        <Link
          to="/courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} />
          Add new course
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 rounded-lg bg-red-50 px-4 py-3">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading courses…</p>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-medium text-foreground">No courses yet</p>
          <p className="text-sm text-muted mt-2">
            Add your first course to launch it on the public website.
          </p>
          <Link
            to="/courses/new"
            className="inline-flex mt-6 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={16} />
            Add course
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Level</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{course.title}</p>
                    <p className="text-xs text-muted">{course.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{course.level}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        course.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/courses/${course.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted/30"
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => togglePublish(course)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted/30"
                      >
                        {course.isPublished ? (
                          <>
                            <EyeOff size={14} /> Unpublish
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> Publish
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCourse(course)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
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
