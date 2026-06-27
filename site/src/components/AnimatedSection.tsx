"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  distance?: number;
}

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 28,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  /* margin: trigger when element is 10% into viewport — earlier than "-80px" */
  const inView = useInView(ref, { once: true, margin: "-10% 0px -5% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === "up" ? distance : 0,
        x: direction === "left" ? -distance : direction === "right" ? distance : 0,
      }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
