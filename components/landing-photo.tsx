// components/landing-photo.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface PhotoProps {
  srcs: string[];
  alt: string;
  className?: string;
  priority?: boolean;
}

/** Tries each source in order. If all fail it renders nothing, so the parent's background shows. */
export function Photo({ srcs, alt, className = "", priority = false }: PhotoProps) {
  return <Chain key={srcs.join("|")} srcs={srcs} alt={alt} className={className} priority={priority} />;
}

function Chain({ srcs, alt, className, priority }: Required<PhotoProps>) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const src = srcs[index];

  // Catches images that already failed before React attached onError
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setIndex((i) => i + 1);
  }, [src]);

  if (!src) return null;

  return (
    <img
      ref={ref}
      key={src}
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
      className={className}
    />
  );
}