"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease },
  },
};

export function PageWrapper({ children, aside, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className={`flex-1 flex flex-col min-h-0 ${className}`}
    >
      <div className="flex-1 p-4 md:p-6 lg:p-7">
        <div className="max-w-[1200px] mx-auto">
          {aside ? (
            <div className="flex gap-7 items-start">
              <div className="flex-1 min-w-0 space-y-5">{children}</div>
              {aside}
            </div>
          ) : (
            <div className="space-y-5">{children}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* Staggered list animation for children */
export const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease },
  },
};

export function StaggerList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
