import type { AdminCourse } from "@/lib/adminApi";
import type { CourseIcon } from "@/types/site";

export interface CurriculumWeekForm {
  week: number;
  title: string;
  topics: string;
}

export interface ProjectForm {
  title: string;
  description: string;
}

export interface CareerForm {
  title: string;
  description: string;
}

export interface FeeStructureForm {
  type: "one_time" | "emi";
  amount: number;
  currency: string;
  emiMonthly: number;
  emiMonths: number;
  discount: string;
  scholarship: string;
}

export interface CourseFormValues {
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  icon: CourseIcon;
  tag: string;
  sortOrder: number;
  isPublished: boolean;
  featureOnHomepage: boolean;
  stack: string[];
  cardImageUrl: string;
  tagline: string;
  bannerUrl: string;
  mode: string;
  hasCertificate: boolean;
  hasPlacementAssistance: boolean;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  rating: string;
  overview: string;
  audience: string;
  prerequisites: string;
  technologies: string;
  outcomes: string;
  curriculum: CurriculumWeekForm[];
  projects: ProjectForm[];
  careers: CareerForm[];
  fee: FeeStructureForm;
  showFeeStructure: boolean;
}

export const EMPTY_FEE: FeeStructureForm = {
  type: "one_time",
  amount: 49999,
  currency: "INR",
  emiMonthly: 4999,
  emiMonths: 12,
  discount: "",
  scholarship: "",
};

export const EMPTY_COURSE_FORM: CourseFormValues = {
  slug: "",
  title: "",
  description: "",
  level: "Intermediate",
  duration: "",
  icon: "layers",
  tag: "Industrial focus",
  sortOrder: 0,
  isPublished: false,
  featureOnHomepage: false,
  stack: [],
  cardImageUrl: "",
  tagline: "",
  bannerUrl: "",
  mode: "Live Online",
  hasCertificate: true,
  hasPlacementAssistance: true,
  instructorName: "",
  instructorTitle: "",
  instructorBio: "",
  rating: "",
  overview: "",
  audience: "",
  prerequisites: "",
  technologies: "",
  outcomes: "",
  curriculum: [],
  projects: [],
  careers: [],
  fee: { ...EMPTY_FEE },
  showFeeStructure: true,
};

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  values: CourseFormValues;
}

export const COURSE_TEMPLATES: CourseTemplate[] = [
  {
    id: "fullstack",
    name: "Full-Stack Program",
    description: "Production web development track",
    values: {
      ...EMPTY_COURSE_FORM,
      slug: "fullstack",
      title: "Full-Stack Production Patterns",
      description:
        "Learn how production apps are structured, tested, and deployed — not just tutorials.",
      level: "Intermediate",
      duration: "10 weeks",
      icon: "layers",
      tag: "Industry aligned",
      sortOrder: 1,
      featureOnHomepage: true,
      stack: ["React", "Node.js", "PostgreSQL", "Docker"],
      tagline: "Build production-ready apps with modern full-stack patterns",
      technologies: "React, TypeScript, Node.js, PostgreSQL, Docker",
      outcomes:
        "Build full-stack apps\nWrite maintainable TypeScript\nDeploy to the cloud",
      overview:
        "Master the end-to-end lifecycle of production web applications with mentor-led modules.",
      audience: "Aspiring developers and professionals who want job-ready skills.",
      prerequisites: "Basic programming familiarity. No prior React experience required.",
      instructorName: "VJ AI Forge Faculty",
      instructorTitle: "Senior Full-Stack Engineer",
      instructorBio: "Industry practitioner with 10+ years building scalable applications.",
      rating: "4.8",
      curriculum: [
        { week: 1, title: "Foundations", topics: "Git, JS, tooling" },
        { week: 2, title: "React", topics: "Components, hooks, forms" },
      ],
      projects: [
        { title: "SaaS Dashboard", description: "Admin UI with auth and charts." },
      ],
      careers: [
        { title: "Full Stack Developer", description: "End-to-end web product roles." },
      ],
      fee: {
        ...EMPTY_FEE,
        discount: "Early bird: 10% off for demo attendees",
      },
    },
  },
];

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function adminCourseToForm(course: AdminCourse): CourseFormValues {
  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    level: course.level as CourseFormValues["level"],
    duration: course.duration,
    icon: course.icon as CourseIcon,
    tag: course.tag,
    sortOrder: course.sortOrder,
    isPublished: course.isPublished,
    featureOnHomepage: false,
    stack: [],
    cardImageUrl: course.cardImageUrl ?? "",
    tagline: course.tagline ?? "",
    bannerUrl: course.bannerUrl ?? "",
    mode: course.mode || "Live Online",
    hasCertificate: course.hasCertificate,
    hasPlacementAssistance: course.hasPlacementAssistance,
    instructorName: course.instructorName ?? "",
    instructorTitle: course.instructorTitle ?? "",
    instructorBio: course.instructorBio ?? "",
    rating: course.rating != null ? String(course.rating) : "",
    overview: course.overview ?? "",
    audience: course.audience ?? "",
    prerequisites: course.prerequisites ?? "",
    technologies: course.technologies.join(", "),
    outcomes: course.outcomes.join("\n"),
    curriculum: course.curriculum.map((w) => ({
      week: w.week,
      title: w.title,
      topics: w.topics.join(", "),
    })),
    projects: course.projects.length > 0 ? course.projects : [{ title: "", description: "" }],
    careers: course.careers.length > 0 ? course.careers : [{ title: "", description: "" }],
    fee: {
      type: course.feeStructure?.type ?? "one_time",
      amount: course.feeStructure?.amount ?? 0,
      currency: course.feeStructure?.currency ?? "INR",
      emiMonthly: course.feeStructure?.emi?.monthly ?? 0,
      emiMonths: course.feeStructure?.emi?.months ?? 12,
      discount: course.feeStructure?.discount ?? "",
      scholarship: course.feeStructure?.scholarship ?? "",
    },
    showFeeStructure: course.showFeeStructure !== false,
  };
}

export function formToApiPayload(values: CourseFormValues, publish: boolean) {
  return {
    slug: values.slug,
    title: values.title,
    description: values.description,
    level: values.level,
    duration: values.duration,
    icon: values.icon,
    tag: values.tag,
    sortOrder: values.sortOrder,
    isPublished: publish,
    featureOnHomepage: values.featureOnHomepage,
    stack: values.stack,
    cardImageUrl: values.cardImageUrl || undefined,
    tagline: values.tagline || undefined,
    bannerUrl: values.bannerUrl || undefined,
    mode: values.mode || undefined,
    hasCertificate: values.hasCertificate,
    hasPlacementAssistance: values.hasPlacementAssistance,
    instructorName: values.instructorName || undefined,
    instructorTitle: values.instructorTitle || undefined,
    instructorBio: values.instructorBio || undefined,
    rating: values.rating ? Number(values.rating) : null,
    overview: values.overview || undefined,
    audience: values.audience || undefined,
    prerequisites: values.prerequisites || undefined,
    technologies: splitLines(values.technologies.replace(/,/g, "\n")),
    outcomes: splitLines(values.outcomes),
    curriculum: values.curriculum
      .filter((w) => w.title.trim())
      .map((w) => ({
        week: w.week,
        title: w.title.trim(),
        topics: splitLines(w.topics.replace(/,/g, "\n")),
      })),
    projects: values.projects.filter((p) => p.title.trim()),
    careers: values.careers.filter((c) => c.title.trim()),
    feeStructure: {
      type: values.fee.type,
      amount: values.fee.amount,
      currency: values.fee.currency,
      emi:
        values.fee.emiMonthly > 0
          ? { monthly: values.fee.emiMonthly, months: values.fee.emiMonths }
          : undefined,
      discount: values.fee.discount || undefined,
      scholarship: values.fee.scholarship || undefined,
    },
    showFeeStructure: values.showFeeStructure,
  };
}
