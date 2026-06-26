import type { CourseIcon } from "@/types/site";

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
}

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
      slug: "fullstack-production-patterns",
      title: "Full-Stack Production Patterns",
      description:
        "Learn how production apps are structured, tested, and deployed — not just tutorials.",
      level: "Intermediate",
      duration: "10 weeks",
      icon: "layers",
      tag: "Industrial focus",
      sortOrder: 1,
      isPublished: false,
      featureOnHomepage: true,
      stack: ["React", "Node.js", "PostgreSQL", "Docker"],
    },
  },
  {
    id: "ai-ml",
    name: "AI/ML Program",
    description: "Machine learning in production",
    values: {
      slug: "ai-ml-in-production",
      title: "AI/ML in Production",
      description:
        "From model training to serving APIs — build AI features teams actually ship.",
      level: "Advanced",
      duration: "8 weeks",
      icon: "brain",
      tag: "Industrial focus",
      sortOrder: 2,
      isPublished: false,
      featureOnHomepage: false,
      stack: ["Python", "FastAPI", "Docker", "MLflow"],
    },
  },
  {
    id: "devops",
    name: "DevOps Program",
    description: "CI/CD and cloud engineering",
    values: {
      slug: "devops-cloud-engineering",
      title: "DevOps & Cloud Engineering",
      description:
        "CI/CD, containers, and cloud — master the toolchain modern teams rely on.",
      level: "Intermediate",
      duration: "8 weeks",
      icon: "terminal",
      tag: "Industrial focus",
      sortOrder: 3,
      isPublished: false,
      featureOnHomepage: false,
      stack: ["Docker", "Kubernetes", "GitHub Actions", "AWS"],
    },
  },
  {
    id: "frontend",
    name: "Frontend Program",
    description: "Modern UI engineering",
    values: {
      slug: "modern-frontend-craft",
      title: "Modern Frontend Craft",
      description:
        "Component architecture, performance, and accessibility at production quality.",
      level: "Beginner",
      duration: "8 weeks",
      icon: "code",
      tag: "Industrial focus",
      sortOrder: 4,
      isPublished: false,
      featureOnHomepage: false,
      stack: ["React", "TypeScript", "Tailwind CSS"],
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

export const COURSE_FIELD_HELP: Record<keyof CourseFormValues, string> = {
  slug: "URL-friendly ID. Example: fullstack-production-patterns",
  title: "Main headline on the course card visitors will see.",
  description: "2–3 sentences describing outcomes. Shown under the title on the card.",
  level: "Difficulty badge — Beginner, Intermediate, or Advanced.",
  duration: "How long the program runs. Example: 10 weeks",
  icon: "Visual icon on the course card. Pick what best matches the topic.",
  tag: "Small label above the title. Example: Industrial focus",
  sortOrder: "Display order on the courses page (lower numbers appear first).",
  isPublished: "Only published courses appear on the public website.",
  featureOnHomepage:
    "When published, also shows this course in the homepage hero carousel.",
  stack: "Technologies shown on the homepage hero slide (comma-separated).",
};
