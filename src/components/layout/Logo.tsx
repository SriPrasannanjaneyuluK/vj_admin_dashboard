import { forwardRef } from "react";
import { STATIC_SITE } from "@/lib/staticSite";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
  nav: "h-[4.25rem] sm:h-[4.75rem]",
  hero: "h-36 sm:h-44 lg:h-52",
};

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "nav" | "hero";
};

export const Logo = forwardRef<HTMLImageElement, LogoProps>(function Logo(
  { className, size = "md" },
  ref
) {
  return (
    <img
      ref={ref}
      src={STATIC_SITE.logo}
      alt={STATIC_SITE.name}
      className={cn("block w-auto object-contain", sizeClasses[size], className)}
      draggable={false}
    />
  );
});
