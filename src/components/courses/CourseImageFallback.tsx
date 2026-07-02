import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseImageFallbackProps = {
  title: string;
  variant?: "card" | "hero";
  className?: string;
};

function courseInitials(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "C";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function CourseImageFallback({
  title,
  variant = "card",
  className,
}: CourseImageFallbackProps) {
  const initials = courseInitials(title);
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-accent via-indigo-600 to-accent-secondary",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,white_0%,transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_40%,white_40%,white_41%,transparent_41%)] bg-[length:24px_24px]" />

      <span
        className={cn(
          "absolute font-bold text-white/10 select-none",
          isHero ? "text-[10rem] sm:text-[14rem]" : "text-7xl sm:text-8xl"
        )}
      >
        {initials}
      </span>

      <div
        className={cn(
          "relative flex flex-col items-center text-center text-white",
          isHero ? "gap-4 px-8" : "gap-2 px-4"
        )}
      >
        {!isHero && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm sm:h-14 sm:w-14">
              <span className="text-xl font-bold tracking-tight">{initials}</span>
            </div>

            <p className="max-w-[90%] text-sm font-semibold leading-snug line-clamp-2 drop-shadow-sm">
              {title}
            </p>
          </>
        )}
      </div>

      <GraduationCap
        className={cn(
          "absolute text-white/15",
          isHero ? "right-8 top-8 h-16 w-16" : "right-4 top-4 h-10 w-10"
        )}
        strokeWidth={1.25}
      />
    </div>
  );
}
