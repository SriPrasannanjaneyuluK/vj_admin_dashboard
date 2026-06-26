import type { CourseFormValues } from "@/lib/courseForm";
import type { Course } from "@/types/site";
import { CourseCard } from "@/components/courses/CourseCard";
import { STATIC_SITE } from "@/lib/staticSite";

type CoursePreviewPanelProps = {
  values: CourseFormValues;
};

export function CoursePreviewPanel({ values }: CoursePreviewPanelProps) {
  const previewCourse: Course = {
    id: values.slug || "preview",
    title: values.title,
    description: values.description,
    level: values.level,
    duration: values.duration,
    icon: values.icon,
    tag: values.tag,
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
          Courses page preview
        </p>
        <p className="text-sm text-muted mb-4">
          This is how the course card will appear in the Courses section.
        </p>
        <div className="max-w-sm mx-auto">
          <CourseCard course={previewCourse} preview />
        </div>
      </div>

      {values.featureOnHomepage && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-secondary mb-2">
            Homepage hero preview
          </p>
          <p className="text-sm text-muted mb-4">
            Shown in the hero carousel when &ldquo;Feature on homepage&rdquo; is enabled
            and the course is published.
          </p>
          <div className="text-center rounded-xl bg-gradient-to-br from-accent/5 to-accent-secondary/5 p-8">
            <span className="inline-block text-xs font-semibold text-accent-secondary uppercase tracking-widest mb-3">
              Latest Course
            </span>
            <h3 className="text-2xl font-bold text-foreground">
              {values.title || "Course title"}
            </h3>
            <p className="mt-3 text-sm text-muted max-w-md mx-auto">
              {values.description || "Course description"}
            </p>
            {values.stack.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {values.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-white border border-border px-3 py-1 text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-center gap-3 text-xs text-muted">
              <span className="rounded-full bg-accent/10 px-3 py-1 text-accent font-medium">
                {values.level}
              </span>
              <span>{values.duration}</span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-muted/30 px-4 py-3 text-xs text-muted">
        Public site branding: <strong>{STATIC_SITE.name}</strong> — only published
        courses are visible to visitors.
      </div>
    </div>
  );
}
