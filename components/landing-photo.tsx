// components/landing-photo.tsx
import Image, { type StaticImageData } from "next/image";

interface PhotoProps {
  // Accepts a string (URL) OR a Next.js imported image object
  srcs: string | StaticImageData; 
  alt: string;
  className?: string;
  priority?: boolean;
}

export function Photo({ srcs, alt, className, priority }: PhotoProps) {
  return (
    <Image
      src={srcs}
      alt={alt}
      className={className}
      priority={priority}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}