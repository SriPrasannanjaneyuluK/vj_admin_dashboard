import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Rocket, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createAdminCourse } from "@/lib/adminApi";
import {
  COURSE_TEMPLATES,
  COURSE_FIELD_HELP,
  EMPTY_COURSE_FORM,
  slugifyTitle,
  type CourseFormValues,
} from "@/lib/courseForm";
import { CoursePreviewPanel } from "@/components/admin/CoursePreviewPanel";
import { IconPicker } from "@/components/admin/IconPicker";

export function CourseForm() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<CourseFormValues>(EMPTY_COURSE_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [stackInput, setStackInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = <K extends keyof CourseFormValues>(
    key: K,
    value: CourseFormValues[K]
  ) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugEdited) {
        next.slug = slugifyTitle(String(value));
      }
      return next;
    });
  };

  const applyTemplate = (templateId: string) => {
    const template = COURSE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setValues(template.values);
    setStackInput(template.values.stack.join(", "));
    setSlugEdited(true);
  };

  const handleSubmit = async (publish: boolean) => {
    if (!accessToken) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...values,
      isPublished: publish,
      stack: stackInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      await createAdminCourse(accessToken, payload);
      setSuccess(
        publish
          ? "Course published! It is now live on the public site."
          : "Course saved as draft."
      );
      setTimeout(() => navigate("/courses"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add new course</h1>
          <p className="mt-2 text-sm text-muted">
            Fill in each field below. Use a template to get started, then customize.
            The preview on the right updates as you type.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-accent" />
            <h2 className="font-semibold text-foreground">Start from a template</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Pick a program type to pre-fill the form with realistic example content.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COURSE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className="rounded-xl border border-border px-4 py-3 text-left hover:border-accent/40 hover:bg-accent/5 transition-colors"
              >
                <p className="font-medium text-sm text-foreground">{template.name}</p>
                <p className="text-xs text-muted mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(values.isPublished);
          }}
        >
          <Field label="Course title" help={COURSE_FIELD_HELP.title}>
            <input
              className={fieldClass}
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Full-Stack Production Patterns"
              required
            />
          </Field>

          <Field label="URL slug" help={COURSE_FIELD_HELP.slug}>
            <input
              className={fieldClass}
              value={values.slug}
              onChange={(e) => {
                setSlugEdited(true);
                update("slug", e.target.value);
              }}
              placeholder="e.g. fullstack-production-patterns"
              required
            />
          </Field>

          <Field label="Description" help={COURSE_FIELD_HELP.description}>
            <textarea
              className={`${fieldClass} resize-none`}
              rows={4}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe what learners will build and learn..."
              required
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Level" help={COURSE_FIELD_HELP.level}>
              <select
                className={fieldClass}
                value={values.level}
                onChange={(e) =>
                  update("level", e.target.value as CourseFormValues["level"])
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </Field>

            <Field label="Duration" help={COURSE_FIELD_HELP.duration}>
              <input
                className={fieldClass}
                value={values.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="e.g. 10 weeks"
                required
              />
            </Field>
          </div>

          <Field label="Card tag" help={COURSE_FIELD_HELP.tag}>
            <input
              className={fieldClass}
              value={values.tag}
              onChange={(e) => update("tag", e.target.value)}
              placeholder="e.g. Industrial focus"
              required
            />
          </Field>

          <Field label="Course icon" help={COURSE_FIELD_HELP.icon}>
            <IconPicker value={values.icon} onChange={(icon) => update("icon", icon)} />
          </Field>

          <Field label="Display order" help={COURSE_FIELD_HELP.sortOrder}>
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={values.sortOrder}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </Field>

          <Field
            label="Homepage tech stack (comma-separated)"
            help={COURSE_FIELD_HELP.stack}
          >
            <input
              className={fieldClass}
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              placeholder="React, Node.js, PostgreSQL, Docker"
            />
          </Field>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.featureOnHomepage}
                onChange={(e) => update("featureOnHomepage", e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Feature on homepage hero
                </span>
                <span className="block text-xs text-muted mt-0.5">
                  {COURSE_FIELD_HELP.featureOnHomepage}
                </span>
              </span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 rounded-lg bg-red-50 px-4 py-3">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 rounded-lg bg-green-50 px-4 py-3">
              {success}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted/30 disabled:opacity-60"
            >
              <Save size={16} />
              Save as draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <Rocket size={16} />
              {submitting ? "Publishing…" : "Publish & launch"}
            </button>
          </div>
        </form>
      </div>

      <div className="xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-1">Live preview</h2>
          <p className="text-sm text-muted mb-6">
            Exactly how visitors will see this course on the website.
          </p>
          <CoursePreviewPanel values={{ ...values, stack: stackInput.split(",").map((s) => s.trim()).filter(Boolean) }} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1">{label}</span>
      <span className="block text-xs text-muted mb-2">{help}</span>
      {children}
    </label>
  );
}
