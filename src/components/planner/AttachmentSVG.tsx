"use client";

import { useId } from "react";

export type AttachmentStyle = "standard_clip" | "colorful_clip" | "binder_clip" | "staple";

interface AttachmentSVGProps {
  style: AttachmentStyle;
  className?: string;
  size?: number;
}

export function AttachmentSVG({ style, className = "", size = 24 }: AttachmentSVGProps) {
  const uid = useId().replace(/:/g, "");
  const common = { width: size, height: size, className, fill: "none", xmlns: "http://www.w3.org/2000/svg" };

  if (style === "standard_clip") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <defs>
          <linearGradient id={`clip-metal-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b8b8b" />
            <stop offset="50%" stopColor="#e0e0e0" />
            <stop offset="100%" stopColor="#6b6b6b" />
          </linearGradient>
          <filter id={`clip-inset-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.35" result="b" />
            <feOffset in="b" dx="0" dy="0.4" result="o" />
            <feComposite in="SourceGraphic" in2="o" operator="out" result="s" />
            <feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Kağıda baskı — iç gölge (aşağıdaki kavis) */}
        <path
          d="M14 18c0-1.5 1-3 2-3.5l2-2"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter={`url(#clip-inset-${uid})`}
        />
        <path
          d="M12 2c-3 0-5 2-6 4l-3 8c-1 2 0 4 2 5s4 0 5-2l5-8c1-1.5 3-2 4.5-.5s1.5 3.5 0 5l-6 7"
          stroke={`url(#clip-metal-${uid})`}
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
          <linearGradient id={`clip-neon-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="50%" stopColor="#c44569" />
            <stop offset="100%" stopColor="#ff9ff3" />
          </linearGradient>
          <filter id={`clip-neon-inset-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.35" result="b" />
            <feOffset in="b" dx="0" dy="0.4" result="o" />
            <feComposite in="SourceGraphic" in2="o" operator="out" result="s" />
            <feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M14 18c0-1.5 1-3 2-3.5l2-2"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="2.6"
          strokeLinecap="round"
          filter={`url(#clip-neon-inset-${uid})`}
        />
        <path
          d="M12 2c-3 0-5 2-6 4l-3 8c-1 2 0 4 2 5s4 0 5-2l5-8c1-1.5 3-2 4.5-.5s1.5 3.5 0 5l-6 7"
          stroke={`url(#clip-neon-${uid})`}
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
          <linearGradient id={`binder-metal-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="30%" stopColor="#1a1a1a" />
            <stop offset="70%" stopColor="#0d0d0d" />
            <stop offset="100%" stopColor="#2a2a2a" />
          </linearGradient>
          <filter id={`binder-inset-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="b" />
            <feOffset in="b" dx="0" dy="0.6" result="o" />
            <feComposite in="SourceGraphic" in2="o" operator="out" result="s" />
            <feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.22 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Mandalın kağıda değen ayakları — iç gölge */}
        <path
          d="M8 8v8c0 0.8 0.8 1.5 2 1.5s2-0.7 2-1.5V8M16 8v8c0 0.8-0.8 1.5-2 1.5s-2-0.7-2-1.5V8"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          filter={`url(#binder-inset-${uid})`}
        />
        <rect x="6" y="4" width="12" height="4" rx="1" fill={`url(#binder-metal-${uid})`} filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))" />
        <path
          d="M8 8v10c0 1 1 2 2 2s2-1 2-2V8M16 8v10c0 1-1 2-2 2s-2-1-2-2V8"
          stroke={`url(#binder-metal-${uid})`}
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
          <linearGradient id={`staple-metal-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a5a5a" />
            <stop offset="50%" stopColor="#d0d0d0" />
            <stop offset="100%" stopColor="#5a5a5a" />
          </linearGradient>
          <filter id={`staple-inset-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" result="b" />
            <feOffset in="b" dx="0" dy="0.5" result="o" />
            <feComposite in="SourceGraphic" in2="o" operator="out" result="s" />
            <feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Zımbanın kağıda giren bacakları — iç gölge */}
        <path
          d="M6 12v4h2v-4M16 12v4h2v-4"
          stroke="rgba(0,0,0,0.14)"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          filter={`url(#staple-inset-${uid})`}
        />
        <path
          d="M4 12h2v4h12v-4h2c0-2-1-4-3-6-2-2-5-3-7-3S4 6 4 12z"
          fill={`url(#staple-metal-${uid})`}
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.35))"
        />
      </svg>
    );
  }

  return null;
}
