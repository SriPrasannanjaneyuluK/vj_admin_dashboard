import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminCourse } from "@/lib/adminApi";
import { adminCourseToForm } from "@/lib/courseForm";
import { CourseForm } from "@/components/admin/CourseForm";
import type { CourseFormValues } from "@/lib/courseForm";

export function AdminEditCoursePage() {
  const { id } = useParams();
  const courseId = Number(id);
  const { accessToken } = useAuth();
  const [initialValues, setInitialValues] = useState<CourseFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !courseId) return;

    (async () => {
      try {
        const { course } = await fetchAdminCourse(accessToken, courseId);
        setInitialValues(adminCourseToForm(course));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      }
    })();
  }, [accessToken, courseId]);

  if (error) {
    return (
      <div>
        <Link to="/courses" className="text-sm text-muted hover:text-accent">← Back to courses</Link>
        <p className="mt-6 text-red-600">{error}</p>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="flex items-center gap-2 text-muted py-12">
        <Loader2 className="animate-spin" size={18} />
        Loading course…
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={16} />
        Back to courses
      </Link>
      <CourseForm mode="edit" courseId={courseId} initialValues={initialValues} />
    </div>
  );
}
