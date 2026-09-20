import type { NavCardVisual } from "@/components/home/nav-cards";

const ink = "#1a1612";
const muted = "#6b6158";
const gold = "#b8934a";
const cream = "#f5f0e8";

/** Her kart için özel küçük SVG — lucide yok, inline */
export function NavCardIllustration({
  visual,
  className,
}: {
  visual: NavCardVisual;
  className?: string;
}) {
  const common = {
    className: className ?? "h-14 w-14",
    viewBox: "0 0 64 64",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (visual) {
    case "about":
      return (
        <svg {...common} className={className ?? "h-16 w-20"}>
          {/* Soft silüet */}
          <ellipse cx="22" cy="18" rx="8" ry="9" fill={ink} opacity="0.12" />
          <path
            d="M10 48c2-12 8-18 12-18s10 6 12 18"
            stroke={ink}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.2"
          />
          {/* El yazısı imza */}
          <path
            d="M30 28c4-6 10-8 14-4 3 3 2 8-2 10 6-1 10 2 11 7"
            stroke={gold}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36 42c8 1 14-2 18-8"
            stroke={ink}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>
      );

    case "reading":
      return (
        <svg {...common}>
          {/* Sayfa */}
          <path
            d="M14 10h28a3 3 0 0 1 3 3v34a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z"
            fill={cream}
            stroke={ink}
            strokeWidth="1.2"
            opacity="0.95"
          />
          {/* Satırlar */}
          <path
            d="M18 22h22M18 28h20M18 34h18M18 40h14"
            stroke={muted}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.45"
          />
          {/* Kıvrık köşe */}
          <path
            d="M36 10v10a3 3 0 0 0 3 3h10"
            fill="#ebe4d8"
            stroke={ink}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M36 10l13 13"
            stroke={ink}
            strokeWidth="1"
            opacity="0.25"
          />
        </svg>
      );

    case "cinema":
      return (
        <svg {...common} className={className ?? "h-12 w-[4.5rem]"}>
          <rect
            x="4"
            y="18"
            width="56"
            height="28"
            rx="2"
            fill={ink}
            opacity="0.88"
          />
          {/* Sprocket holes */}
          {[8, 18, 28, 38, 48].map((x) => (
            <g key={x}>
              <rect x={x} y="20" width="3" height="3" rx="0.5" fill={cream} opacity="0.85" />
              <rect x={x} y="41" width="3" height="3" rx="0.5" fill={cream} opacity="0.85" />
            </g>
          ))}
          {/* Frames */}
          {[12, 24, 36, 48].map((x, i) => (
            <rect
              key={x}
              x={x}
              y="26"
              width="9"
              height="12"
              rx="1"
              fill={i % 2 === 0 ? gold : cream}
              opacity={i % 2 === 0 ? 0.75 : 0.35}
            />
          ))}
        </svg>
      );

    case "photos":
      return (
        <svg {...common}>
          {/* Back polaroid */}
          <g transform="rotate(-8 32 34)">
            <rect
              x="18"
              y="12"
              width="28"
              height="34"
              rx="2"
              fill="#fff"
              stroke={ink}
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
          {/* Front polaroid */}
          <g transform="rotate(6 34 36)">
            <rect
              x="20"
              y="14"
              width="28"
              height="36"
              rx="2"
              fill="#fff"
              stroke={ink}
              strokeWidth="1.2"
            />
            <rect
              x="23"
              y="17"
              width="22"
              height="22"
              rx="1"
              fill={gold}
              opacity="0.35"
            />
            <path
              d="M28 28l4 5 3-3 5 7H25l3-9z"
              fill={ink}
              opacity="0.25"
            />
          </g>
        </svg>
      );

    case "works":
      return (
        <svg {...common}>
          {/* Çekiç */}
          <path
            d="M38 14l8 8-4 2-2 2-8-8 2-2 4-2z"
            fill={gold}
            opacity="0.85"
          />
          <path
            d="M34 22L18 48"
            stroke={ink}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M40 18l6 6"
            stroke={ink}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Küçük vida */}
          <circle cx="46" cy="42" r="4" stroke={muted} strokeWidth="1.2" />
          <path d="M46 39v6M43 42h6" stroke={muted} strokeWidth="1" />
        </svg>
      );

    case "translations":
      return (
        <svg
          className={className ?? "h-14 w-14"}
          viewBox="0 0 64 64"
          aria-hidden
        >
          {/* 2×2 çizimsi bayraklar — soluk mürekkep, canlı bayrak değil */}
          {/* TR */}
          <rect
            x="3.5"
            y="3.5"
            width="26"
            height="26"
            rx="3"
            fill="#c45a52"
            fillOpacity="0.22"
            stroke={ink}
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
          <circle
            cx="13.5"
            cy="16.5"
            r="6.2"
            fill="none"
            stroke={ink}
            strokeWidth="1.15"
            strokeOpacity="0.5"
          />
          <circle
            cx="15.4"
            cy="16.5"
            r="4.6"
            fill="#c45a52"
            fillOpacity="0.22"
            stroke="none"
          />
          <path
            d="M20.6 12.2l0.85 1.75 1.9.28-1.38 1.34.33 1.9-1.7-.9-1.7.9.33-1.9-1.38-1.34 1.9-.28z"
            fill={ink}
            fillOpacity="0.45"
          />
          {/* UK */}
          <rect
            x="34.5"
            y="3.5"
            width="26"
            height="26"
            rx="3"
            fill="#5a6e8a"
            fillOpacity="0.2"
            stroke={ink}
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
          <path
            d="M34.5 3.5l26 26M60.5 3.5l-26 26"
            stroke={ink}
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          <path
            d="M47.5 3.5v26M34.5 16.5h26"
            stroke={ink}
            strokeWidth="2.2"
            strokeOpacity="0.4"
          />
          <path
            d="M47.5 3.5v26M34.5 16.5h26"
            stroke="#a85a5a"
            strokeWidth="1"
            strokeOpacity="0.45"
          />
          {/* FR */}
          <rect
            x="3.5"
            y="34.5"
            width="26"
            height="26"
            rx="3"
            fill="none"
            stroke={ink}
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
          <path
            d="M3.5 37.5a3 3 0 0 1 3-3H12v26H6.5a3 3 0 0 1-3-3v-20z"
            fill="#5a6e8a"
            fillOpacity="0.28"
          />
          <rect
            x="12"
            y="34.5"
            width="9"
            height="26"
            fill={cream}
            fillOpacity="0.6"
          />
          <path
            d="M21 34.5h5a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3h-5v-26z"
            fill="#c45a52"
            fillOpacity="0.28"
          />
          {/* DE */}
          <rect
            x="34.5"
            y="34.5"
            width="26"
            height="26"
            rx="3"
            fill="none"
            stroke={ink}
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
          <path
            d="M34.5 37.5a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3V43h-26v-5.5z"
            fill={ink}
            fillOpacity="0.35"
          />
          <rect
            x="34.5"
            y="43"
            width="26"
            height="8.5"
            fill="#c45a52"
            fillOpacity="0.32"
          />
          <path
            d="M34.5 51.5h26V57.5a3 3 0 0 1-3 3h-20a3 3 0 0 1-3-3v-6z"
            fill={gold}
            fillOpacity="0.45"
          />
        </svg>
      );

    case "plaktaki":
      return (
        <svg {...common}>
          {/* Plak */}
          <circle cx="32" cy="32" r="22" fill={ink} opacity="0.88" />
          <circle cx="32" cy="32" r="18" stroke={gold} strokeWidth="0.6" opacity="0.35" />
          <circle cx="32" cy="32" r="14" stroke={gold} strokeWidth="0.5" opacity="0.25" />
          <circle cx="32" cy="32" r="7" fill={gold} opacity="0.9" />
          <circle cx="32" cy="32" r="2.2" fill={cream} />
          {/* Play */}
          <path
            d="M30 26.5v11l9-5.5-9-5.5z"
            fill={cream}
            opacity="0.95"
          />
        </svg>
      );

    case "writings":
      return (
        <svg {...common}>
          {/* Satırlı kağıt */}
          <rect
            x="14"
            y="10"
            width="30"
            height="40"
            rx="2"
            fill={cream}
            stroke={ink}
            strokeWidth="1.1"
          />
          <path
            d="M20 20h18M20 26h18M20 32h16M20 38h12"
            stroke={muted}
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Kalem ucu */}
          <path
            d="M44 40l8-8 3 3-8 8-4 1 1-4z"
            fill={gold}
            stroke={ink}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path d="M50 34l3 3" stroke={ink} strokeWidth="0.8" opacity="0.4" />
        </svg>
      );

    default:
      return null;
  }
}
