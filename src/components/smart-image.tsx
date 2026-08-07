import { useState } from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  /** Tailwind aspect ratio class reserving layout space, e.g. "aspect-[4/5]". */
  aspect?: string;
  /** Extra classes on the wrapper element. */
  wrapperClassName?: string;
  /** Rendered instead of the skeleton/img when there is no src. */
  fallback?: React.ReactNode;
  eager?: boolean;
}

/**
 * Image with a reserved aspect-ratio box (no CLS), a pulsing grey skeleton
 * while the bytes are in flight, lazy loading and async decoding.
 */
export function SmartImage({
  src,
  alt,
  aspect = "aspect-[4/5]",
  className,
  wrapperClassName,
  fallback,
  eager = false,
  ...rest
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspect, wrapperClassName)}>
      {(!src || failed) && fallback}
      {src && !failed && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-surface-2 to-muted" />
          )}
          <img
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={eager ? "high" : "auto"}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
              className,
            )}
            {...rest}
          />
        </>
      )}
    </div>
  );
}
