import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Layers,
  Brain,
  Network,
  Terminal,
  Code,
  Server,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import type { Course, CourseIcon } from "@/types/site";
import { EASE_OUT } from "@/lib/motion";
import { FadeInItem } from "@/components/motion/FadeIn";

export const COURSE_ICON_MAP = {
  layers: Layers,
  brain: Brain,
  network: Network,
  terminal: Terminal,
  code: Code,
  server: Server,
} as const;

export const COURSE_ICON_OPTIONS: { value: CourseIcon; label: string }[] = [
  { value: "layers", label: "Full-Stack" },
  { value: "brain", label: "AI / ML" },
  { value: "network", label: "System Design" },
  { value: "terminal", label: "DevOps" },
  { value: "code", label: "Frontend" },
  { value: "server", label: "Backend" },
];

type CourseCardProps = {
  course: Course;
  preview?: boolean;
};

export function CourseCard({
  course,
  preview = false,
}: CourseCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  const Icon = COURSE_ICON_MAP[course.icon];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current || preview) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const card = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        reduced || preview
          ? {}
          : { rotateX, rotateY, transformPerspective: 800 }
      }
      whileHover={reduced || preview ? {} : { y: -8 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="shimmer-border group relative bg-card rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow h-full"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-300">
          <Icon size={22} />
        </div>
        <ArrowUpRight
          size={18}
          className="text-muted group-hover:text-accent transition-colors"
        />
      </div>

      <span className="inline-block text-xs font-semibold text-accent-secondary uppercase tracking-wider mb-2">
        {course.tag || "Course tag"}
      </span>

      <h3 className="text-lg font-bold text-foreground mb-2">
        {course.title || "Course title"}
      </h3>

      <p className="text-sm text-muted leading-relaxed mb-5">
        {course.description || "Course description will appear here."}
      </p>

      <div className="flex items-center gap-3 text-xs font-medium">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">
          {course.level || "Level"}
        </span>
        <span className="flex items-center gap-1 text-muted">
          <Clock size={12} />
          {course.duration || "Duration"}
        </span>
      </div>
    </motion.div>
  );

  if (preview) return card;
  return <FadeInItem>{card}</FadeInItem>;
}
