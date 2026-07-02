import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Rocket } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createAdminCourse, updateAdminCourse } from "@/lib/adminApi";
import {
  COURSE_TEMPLATES,
  EMPTY_COURSE_FORM,
  slugifyTitle,
  type CourseFormValues,
  type CurriculumWeekForm,
} from "@/lib/courseForm";
import { CoursePreviewPanel } from "@/components/admin/CoursePreviewPanel";
import { DemoSessionsEditor } from "@/components/admin/DemoSessionsEditor";
import { CourseImageUpload } from "@/components/admin/CourseImageUpload";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "detail", label: "Detail page" },
  { id: "instructor", label: "Instructor" },
  { id: "curriculum", label: "Curriculum" },
  { id: "pricing", label: "Pricing" },
  { id: "demos", label: "Demo slots" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type CourseFormProps = {
  mode: "create" | "edit";
  courseId?: number;
  initialValues?: CourseFormValues;
};

export function CourseForm({ mode, courseId, initialValues }: CourseFormProps) {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("basics");
  const [values, setValues] = useState<CourseFormValues>(initialValues ?? EMPTY_COURSE_FORM);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [stackInput, setStackInput] = useState(
    (initialValues?.stack ?? []).join(", ")
  );
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

    const payloadValues = {
      ...values,
      stack: stackInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (mode === "edit" && courseId) {
        await updateAdminCourse(accessToken, courseId, payloadValues, publish);
        setSuccess(publish ? "Course updated and published." : "Course saved.");
      } else {
        const { course } = await createAdminCourse(accessToken, payloadValues, publish);
        setSuccess(publish ? "Course published!" : "Course saved as draft.");
        setTimeout(() => navigate(`/courses/${course.id}/edit`, { replace: true }), 800);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

  const previewValues = {
    ...values,
    stack: stackInput.split(",").map((s) => s.trim()).filter(Boolean),
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "edit" ? "Edit course" : "Add new course"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage everything visitors see on the course card, detail page, pricing, and demo slots.
          </p>
        </div>

        {mode === "create" && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted mb-3">Start from a template</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COURSE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className="rounded-xl border border-border px-4 py-3 text-left hover:border-accent/40 hover:bg-accent/5"
                >
                  <p className="font-medium text-sm">{template.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b border-border pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={t.id === "demos" && !courseId}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-t-lg transition-colors",
                tab === t.id
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted hover:text-foreground",
                t.id === "demos" && !courseId && "opacity-40 cursor-not-allowed"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "basics" && (
          <div className="space-y-4">
            <Field label="Course title">
              <input className={fieldClass} value={values.title} onChange={(e) => update("title", e.target.value)} required />
            </Field>
            <Field label="URL slug">
              <input
                className={fieldClass}
                value={values.slug}
                onChange={(e) => { setSlugEdited(true); update("slug", e.target.value); }}
                required
              />
            </Field>
            <Field label="Card description">
              <textarea className={`${fieldClass} resize-none`} rows={3} value={values.description} onChange={(e) => update("description", e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Level">
                <select className={fieldClass} value={values.level} onChange={(e) => update("level", e.target.value as CourseFormValues["level"])}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </Field>
              <Field label="Duration">
                <input className={fieldClass} value={values.duration} onChange={(e) => update("duration", e.target.value)} />
              </Field>
            </div>
            <Field label="Card tag">
              <input className={fieldClass} value={values.tag} onChange={(e) => update("tag", e.target.value)} />
            </Field>
            {accessToken && (
              <CourseImageUpload
                label="Course card image"
                help="Required for a professional look on the homepage. Uploaded to Cloudinary — not stored in Supabase."
                value={values.cardImageUrl}
                onChange={(url) => update("cardImageUrl", url)}
                accessToken={accessToken}
              />
            )}
            <Field label="Display order">
              <input type="number" className={fieldClass} value={values.sortOrder} onChange={(e) => update("sortOrder", Number(e.target.value))} />
            </Field>
            <Field label="Homepage hero stack (comma-separated)">
              <input className={fieldClass} value={stackInput} onChange={(e) => setStackInput(e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values.featureOnHomepage} onChange={(e) => update("featureOnHomepage", e.target.checked)} />
              Feature on homepage hero when published
            </label>
          </div>
        )}

        {tab === "detail" && (
          <div className="space-y-4">
            <Field label="Tagline (hero headline)">
              <input className={fieldClass} value={values.tagline} onChange={(e) => update("tagline", e.target.value)} />
            </Field>
            {accessToken && (
              <CourseImageUpload
                label="Detail page banner"
                help="Wide banner on the course detail page hero. Also stored on Cloudinary."
                value={values.bannerUrl}
                onChange={(url) => update("bannerUrl", url)}
                accessToken={accessToken}
                aspectHint="21:9"
              />
            )}
            <Field label="Mode">
              <input className={fieldClass} value={values.mode} onChange={(e) => update("mode", e.target.value)} placeholder="Live Online" />
            </Field>
            <Field label="Rating (0–5, optional)">
              <input className={fieldClass} value={values.rating} onChange={(e) => update("rating", e.target.value)} placeholder="4.8" />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values.hasCertificate} onChange={(e) => update("hasCertificate", e.target.checked)} />
              Certificate available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values.hasPlacementAssistance} onChange={(e) => update("hasPlacementAssistance", e.target.checked)} />
              Placement assistance
            </label>
            <Field label="Overview (what students learn)">
              <textarea className={`${fieldClass} resize-none`} rows={4} value={values.overview} onChange={(e) => update("overview", e.target.value)} />
            </Field>
            <Field label="Who is this for?">
              <textarea className={`${fieldClass} resize-none`} rows={3} value={values.audience} onChange={(e) => update("audience", e.target.value)} />
            </Field>
            <Field label="Prerequisites">
              <textarea className={`${fieldClass} resize-none`} rows={3} value={values.prerequisites} onChange={(e) => update("prerequisites", e.target.value)} />
            </Field>
            <Field label="Technologies (comma or newline)">
              <textarea className={`${fieldClass} resize-none`} rows={2} value={values.technologies} onChange={(e) => update("technologies", e.target.value)} />
            </Field>
            <Field label="Learning outcomes (one per line)">
              <textarea className={`${fieldClass} resize-none`} rows={4} value={values.outcomes} onChange={(e) => update("outcomes", e.target.value)} />
            </Field>
            <ProjectsEditor
              label="Projects"
              items={values.projects}
              onChange={(projects) => update("projects", projects)}
            />
            <ProjectsEditor
              label="Career paths"
              items={values.careers}
              onChange={(careers) => update("careers", careers)}
            />
          </div>
        )}

        {tab === "instructor" && (
          <div className="space-y-4">
            <Field label="Instructor name">
              <input className={fieldClass} value={values.instructorName} onChange={(e) => update("instructorName", e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={fieldClass} value={values.instructorTitle} onChange={(e) => update("instructorTitle", e.target.value)} />
            </Field>
            <Field label="Bio">
              <textarea className={`${fieldClass} resize-none`} rows={5} value={values.instructorBio} onChange={(e) => update("instructorBio", e.target.value)} />
            </Field>
          </div>
        )}

        {tab === "curriculum" && (
          <CurriculumEditor
            weeks={values.curriculum}
            onChange={(curriculum) => update("curriculum", curriculum)}
          />
        )}

        {tab === "pricing" && (
          <div className="space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-border"
                checked={values.showFeeStructure}
                onChange={(e) => update("showFeeStructure", e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Show fee on course page
                </span>
                <span className="block text-xs text-muted mt-1">
                  When off, learners see a friendly note that a tutor will explain fees after the demo.
                </span>
              </span>
            </label>

            <div className={values.showFeeStructure ? "space-y-4" : "space-y-4 opacity-60 pointer-events-none"}>
            <Field label="Fee type">
              <select className={fieldClass} value={values.fee.type} onChange={(e) => update("fee", { ...values.fee, type: e.target.value as "one_time" | "emi" })}>
                <option value="one_time">One-time fee</option>
                <option value="emi">EMI</option>
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Amount">
                <input type="number" className={fieldClass} value={values.fee.amount} onChange={(e) => update("fee", { ...values.fee, amount: Number(e.target.value) })} />
              </Field>
              <Field label="Currency">
                <input className={fieldClass} value={values.fee.currency} onChange={(e) => update("fee", { ...values.fee, currency: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="EMI monthly">
                <input type="number" className={fieldClass} value={values.fee.emiMonthly} onChange={(e) => update("fee", { ...values.fee, emiMonthly: Number(e.target.value) })} />
              </Field>
              <Field label="EMI months">
                <input type="number" className={fieldClass} value={values.fee.emiMonths} onChange={(e) => update("fee", { ...values.fee, emiMonths: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Discount message">
              <input className={fieldClass} value={values.fee.discount} onChange={(e) => update("fee", { ...values.fee, discount: e.target.value })} />
            </Field>
            <Field label="Scholarship message">
              <input className={fieldClass} value={values.fee.scholarship} onChange={(e) => update("fee", { ...values.fee, scholarship: e.target.value })} />
            </Field>
            </div>
          </div>
        )}

        {tab === "demos" && courseId && accessToken && (
          <DemoSessionsEditor
            courseId={courseId}
            accessToken={accessToken}
            defaultInstructor={values.instructorName}
          />
        )}

        {tab === "demos" && !courseId && (
          <p className="text-sm text-muted">Save the course first, then add demo slots here.</p>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">{success}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" disabled={submitting} onClick={() => handleSubmit(false)} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted/30 disabled:opacity-60">
            <Save size={16} /> Save draft
          </button>
          <button type="button" disabled={submitting} onClick={() => handleSubmit(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            <Rocket size={16} /> {submitting ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      <div className="xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Card preview</h2>
          <CoursePreviewPanel values={previewValues} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}

function CurriculumEditor({
  weeks,
  onChange,
}: {
  weeks: CurriculumWeekForm[];
  onChange: (weeks: CurriculumWeekForm[]) => void;
}) {
  const fieldClass = "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm";

  const addWeek = () => {
    onChange([...weeks, { week: weeks.length + 1, title: "", topics: "" }]);
  };

  return (
    <div className="space-y-4">
      {weeks.map((week, index) => (
        <div key={index} className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex gap-2">
            <input type="number" className={`${fieldClass} w-20`} value={week.week} onChange={(e) => {
              const next = [...weeks];
              next[index] = { ...week, week: Number(e.target.value) };
              onChange(next);
            }} />
            <input className={fieldClass} placeholder="Week title" value={week.title} onChange={(e) => {
              const next = [...weeks];
              next[index] = { ...week, title: e.target.value };
              onChange(next);
            }} />
          </div>
          <textarea className={`${fieldClass} resize-none`} rows={2} placeholder="Topics (comma-separated)" value={week.topics} onChange={(e) => {
            const next = [...weeks];
            next[index] = { ...week, topics: e.target.value };
            onChange(next);
          }} />
        </div>
      ))}
      <button type="button" onClick={addWeek} className="text-sm font-medium text-accent hover:underline">
        + Add week
      </button>
    </div>
  );
}

function ProjectsEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: Array<{ title: string; description: string }>;
  onChange: (items: Array<{ title: string; description: string }>) => void;
}) {
  const fieldClass = "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-border p-3">
          <input className={fieldClass} placeholder="Title" value={item.title} onChange={(e) => {
            const next = [...items];
            next[index] = { ...item, title: e.target.value };
            onChange(next);
          }} />
          <textarea className={`${fieldClass} resize-none`} rows={2} placeholder="Description" value={item.description} onChange={(e) => {
            const next = [...items];
            next[index] = { ...item, description: e.target.value };
            onChange(next);
          }} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { title: "", description: "" }])} className="text-sm text-accent hover:underline">
        + Add item
      </button>
    </div>
  );
}
