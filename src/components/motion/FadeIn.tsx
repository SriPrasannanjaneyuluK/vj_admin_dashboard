import { motion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInStaggerProps = {
  children: ReactNode;
  className?: string;
};

export function FadeInStagger({ children, className }: FadeInStaggerProps) {
  return <div className={className}>{children}</div>;
}

type FadeInItemProps = {
  children: ReactNode;
  delay?: number;
};

export function FadeInItem({ children, delay = 0 }: FadeInItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
