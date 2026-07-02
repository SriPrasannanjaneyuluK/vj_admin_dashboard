import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "@/components/admin/CourseForm";
import { FadeInItem } from "@/components/motion/FadeIn";

export function AdminAddCoursePage() {
  return (
    <FadeInItem>
      <Link
        to="/courses"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
      >
        <ArrowLeft size={16} />
        Back to courses
      </Link>
      <CourseForm mode="create" />
    </FadeInItem>
  );
}
