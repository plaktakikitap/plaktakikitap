"use client";

interface PaperclipSVGProps {
  className?: string;
  size?: number;
}

/** Gerçekçi metalik ataş SVG */
export function PaperclipSVG({ className = "", size = 24 }: PaperclipSVGProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="paperclip-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b8b8b" stopOpacity="1" />
          <stop offset="20%" stopColor="#b5b5b5" stopOpacity="1" />
          <stop offset="50%" stopColor="#e0e0e0" stopOpacity="1" />
          <stop offset="80%" stopColor="#a8a8a8" stopOpacity="1" />
          <stop offset="100%" stopColor="#6b6b6b" stopOpacity="1" />
        </linearGradient>
        <filter id="paperclip-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>
      <path
        d="M12 2c-3 0-5 2-6 4l-3 8c-1 2 0 4 2 5s4 0 5-2l5-8c1-1.5 3-2 4.5-.5s1.5 3.5 0 5l-6 7"
        stroke="url(#paperclip-metal)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#paperclip-shadow)"
      />
    </svg>
  );
}
