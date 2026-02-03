"use client";

export type AttachmentStyle = "standard_clip" | "colorful_clip" | "binder_clip" | "staple";

interface AttachmentSVGProps {
  style: AttachmentStyle;
  className?: string;
  size?: number;
}

/** Kağıda baskı yapan kısım — inset shadow ile */
const INSET_SHADOW = "inset 0 1px 3px rgba(0,0,0,0.15)";

export function AttachmentSVG({ style, className = "", size = 24 }: AttachmentSVGProps) {
  const common = { width: size, height: size, className, fill: "none", xmlns: "http://www.w3.org/2000/svg" };

  if (style === "standard_clip") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <defs>
          <linearGradient id="clip-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b8b8b" />
            <stop offset="50%" stopColor="#e0e0e0" />
            <stop offset="100%" stopColor="#6b6b6b" />
          </linearGradient>
        </defs>
        <path
          d="M12 2c-3 0-5 2-6 4l-3 8c-1 2 0 4 2 5s4 0 5-2l5-8c1-1.5 3-2 4.5-.5s1.5 3.5 0 5l-6 7"
          stroke="url(#clip-metal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.25))"
        />
      </svg>
    );
  }

  if (style === "colorful_clip") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <defs>
          <linearGradient id="clip-neon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="50%" stopColor="#c44569" />
            <stop offset="100%" stopColor="#ff9ff3" />
          </linearGradient>
        </defs>
        <path
          d="M12 2c-3 0-5 2-6 4l-3 8c-1 2 0 4 2 5s4 0 5-2l5-8c1-1.5 3-2 4.5-.5s1.5 3.5 0 5l-6 7"
          stroke="url(#clip-neon)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 0 2px rgba(255,107,157,0.6)) drop-shadow(0 1px 1px rgba(0,0,0,0.2))"
        />
      </svg>
    );
  }

  if (style === "binder_clip") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <defs>
          <linearGradient id="binder-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="30%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0d0d0d" />
            <stop offset="100%" stopColor="#2a2a2a" />
          </linearGradient>
        </defs>
        <rect x="6" y="4" width="12" height="4" rx="1" fill="url(#binder-metal)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))" />
        <path
          d="M8 8v10c0 1 1 2 2 2s2-1 2-2V8M16 8v10c0 1-1 2-2 2s-2-1-2-2V8"
          stroke="url(#binder-metal)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.3))"
        />
      </svg>
    );
  }

  if (style === "staple") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <defs>
          <linearGradient id="staple-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a5a5a" />
            <stop offset="50%" stopColor="#d0d0d0" />
            <stop offset="100%" stopColor="#5a5a5a" />
          </linearGradient>
        </defs>
        <path
          d="M4 12h2v4h12v-4h2c0-2-1-4-3-6-2-2-5-3-7-3S4 6 4 12z"
          fill="url(#staple-metal)"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.35))"
        />
      </svg>
    );
  }

  return null;
}
