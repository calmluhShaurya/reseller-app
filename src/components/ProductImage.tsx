"use client";

import { useState } from "react";

export default function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--background)] text-muted ${className}`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M21 16l-5.5-5.5a1.5 1.5 0 00-2.1 0L4 19"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote/user-provided URLs of unknown domains
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
