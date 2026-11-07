// components/landing-motion.tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { StaticImageData } from "next/image"; // <-- Import this
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { Photo } from "@/components/landing-photo";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-60 h-1 origin-left bg-linear-to-r from-primary via-accent to-highlight"
    />
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 56,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.95, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Parallax({
  children,
  className,
  distance = 50,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

export function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix]);
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}

// Updated to accept StaticImageData or string for the image
export function Marquee({ items }: { items: { name: string; cost: string; srcs: string | StaticImageData }[] }) {
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.ul
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((m, i) => (
          <li key={i} className="pr-4">
            <div className="group flex items-center gap-3 rounded-full border border-border bg-background py-2 pl-2 pr-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-secondary ring-2 ring-card">
                <Photo
                  srcs={m.srcs} // <-- Passed directly, no more array cast
                  alt=""
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110"
                />
              </span>
              <span>
                <span className="block text-sm font-bold leading-tight">{m.name}</span>
                <span className="mt-1 block w-fit rounded-full bg-highlight px-2 py-0.5 text-[11px] font-bold text-highlight-foreground">
                  {m.cost}
                </span>
              </span>
            </div>
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export function Lift({ children, className, lift = 8 }: { children: ReactNode; className?: string; lift?: number }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}