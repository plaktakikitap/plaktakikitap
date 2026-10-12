/** Üst üste binen, elle yırtılmış kağıt. Footer’ın kendisi — metin bunun üzerinde durur. */

const GREEN_FIBER =
  "M0 35 L64 36 L140 40 L209 33 L220 41 L274 41 L323 44 L378 47 L448 49 L516 53 L580 60 L655 69 L729 79 L792 82 L846 84 L919 79 L991 66 L1059 59 L1117 50 L1173 45 L1225 35 L1243 39 L1316 35 L1384 34 L1433 22 L1440 32 L1440 420 L0 420 Z";
const GREEN_BODY =
  "M0 47 L64 51 L140 52 L209 48 L220 53 L274 52 L323 54 L378 60 L448 60 L516 68 L580 71 L655 82 L729 91 L792 96 L846 94 L919 90 L991 78 L1059 69 L1117 59 L1173 54 L1225 45 L1243 47 L1316 45 L1384 42 L1433 33 L1440 42 L1440 420 L0 420 Z";
const GREEN_EDGE =
  "M0 35 L64 36 L140 40 L209 33 L220 41 L274 41 L323 44 L378 47 L448 49 L516 53 L580 60 L655 69 L729 79 L792 82 L846 84 L919 79 L991 66 L1059 59 L1117 50 L1173 45 L1225 35 L1243 39 L1316 35 L1384 34 L1433 22 L1440 32";

const TERRA_FIBER =
  "M0 187 L52 180 L73 172 L94 180 L152 175 L166 174 L180 173 L200 181 L243 179 L294 180 L349 173 L403 167 L472 155 L532 148 L605 142 L673 134 L727 132 L787 127 L850 110 L864 105 L874 116 L951 106 L1001 98 L1070 87 L1086 81 L1097 90 L1165 90 L1209 87 L1278 86 L1325 84 L1384 71 L1400 71 L1418 77 L1440 76 L1440 420 L0 420 Z";
const TERRA_BODY =
  "M0 198 L52 194 L73 180 L94 188 L152 184 L166 187 L180 184 L200 191 L243 191 L294 190 L349 186 L403 181 L472 165 L532 157 L605 157 L673 146 L727 145 L787 140 L850 124 L864 119 L874 131 L951 117 L1001 110 L1070 98 L1086 97 L1097 103 L1165 105 L1209 102 L1278 101 L1325 92 L1384 82 L1400 85 L1418 91 L1440 86 L1440 420 L0 420 Z";
const TERRA_EDGE =
  "M0 187 L52 180 L73 172 L94 180 L152 175 L166 174 L180 173 L200 181 L243 179 L294 180 L349 173 L403 167 L472 155 L532 148 L605 142 L673 134 L727 132 L787 127 L850 110 L864 105 L874 116 L951 106 L1001 98 L1070 87 L1086 81 L1097 90 L1165 90 L1209 87 L1278 86 L1325 84 L1384 71 L1400 71 L1418 77 L1440 76";

const CREAM_FIBER =
  "M0 214 L60 214 L126 215 L193 219 L256 219 L325 220 L372 223 L431 226 L478 231 L529 233 L588 233 L637 227 L649 224 L665 220 L688 229 L735 230 L780 225 L827 224 L881 222 L933 222 L991 224 L1049 223 L1117 221 L1162 223 L1224 220 L1279 221 L1331 219 L1378 220 L1420 221 L1440 219 L1440 420 L0 420 Z";
const CREAM_BODY =
  "M0 223 L60 228 L126 228 L193 233 L256 227 L325 227 L372 232 L431 235 L478 242 L529 242 L588 243 L637 239 L649 233 L665 227 L688 237 L735 246 L780 236 L827 233 L881 236 L933 230 L991 234 L1049 231 L1117 230 L1162 230 L1224 236 L1279 236 L1331 233 L1378 228 L1420 229 L1440 228 L1440 420 L0 420 Z";
const CREAM_EDGE =
  "M0 214 L60 214 L126 215 L193 219 L256 219 L325 220 L372 223 L431 226 L478 231 L529 233 L588 233 L637 227 L649 224 L665 220 L688 229 L735 230 L780 225 L827 224 L881 222 L933 222 L991 224 L1049 223 L1117 221 L1162 223 L1224 220 L1279 221 L1331 219 L1378 220 L1420 221 L1440 219";

function Sheet({
  fiber,
  body,
  edge,
  fiberFill,
  bodyFill,
  rough,
}: {
  fiber: string;
  body: string;
  edge: string;
  fiberFill: string;
  bodyFill: string;
  rough: string;
}) {
  const underside = body.replace(/ L1440 420 L0 420 Z$/, "");
  return (
    <g>
      <path
        d={fiber}
        transform="translate(0 -6)"
        fill="#2a241c"
        opacity={0.14}
        filter="url(#tear-shadow)"
      />
      <g filter={`url(#${rough})`}>
        <path
          d={edge}
          fill="none"
          stroke="#f7f2e8"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={fiber} fill={fiberFill} />
        <path d={body} fill={bodyFill} />
        <path
          d={underside}
          fill="none"
          stroke="#2c261e"
          strokeWidth={1.1}
          strokeLinejoin="round"
          opacity={0.22}
        />
      </g>
    </g>
  );
}

function TornPaperFilters() {
  return (
    <defs>
      <filter id="tear-shadow" filterUnits="userSpaceOnUse" x="-40" y="-40" width="1520" height="500">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="rough-green" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-30" y="-30" width="1500" height="490">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.035" numOctaves={2} seed={2} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={8} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="rough-terra" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-30" y="-30" width="1500" height="490">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.03" numOctaves={2} seed={8} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="rough-cream" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="-30" y="-30" width="1500" height="490">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.028" numOctaves={2} seed={15} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="paper-grain" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="1440" height="420">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={3} />
      </filter>
      <filter id="paper-crease" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="1440" height="420" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={3} seed={9} result="n" />
        <feDiffuseLighting in="n" surfaceScale={5} diffuseConstant={1} lightingColor="#fffaf4">
          <feDistantLight azimuth={225} elevation={48} />
        </feDiffuseLighting>
      </filter>
      <clipPath id="paper-sheets" clipPathUnits="userSpaceOnUse">
        <path d={GREEN_BODY} />
        <path d={TERRA_BODY} />
        <path d={CREAM_BODY} />
      </clipPath>
      <linearGradient id="paper-fade" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="330">
        <stop offset="0" stopColor="white" />
        <stop offset="0.4" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <mask id="paper-fade-mask" maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width="1440" height="420" fill="url(#paper-fade)" />
      </mask>
    </defs>
  );
}

export function TornPaper() {
  return (
    <svg className="torn-sheet" viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden="true">
      <TornPaperFilters />
      <Sheet
        fiber={GREEN_FIBER}
        body={GREEN_BODY}
        edge={GREEN_EDGE}
        fiberFill="#efe6d6"
        bodyFill="#66724c"
        rough="rough-green"
      />
      <Sheet
        fiber={TERRA_FIBER}
        body={TERRA_BODY}
        edge={TERRA_EDGE}
        fiberFill="#f8ebdf"
        bodyFill="#d17c52"
        rough="rough-terra"
      />
      <Sheet
        fiber={CREAM_FIBER}
        body={CREAM_BODY}
        edge={CREAM_EDGE}
        fiberFill="#faf6f0"
        bodyFill="#f5f0e8"
        rough="rough-cream"
      />
      <g clipPath="url(#paper-sheets)" mask="url(#paper-fade-mask)" style={{ mixBlendMode: "multiply", opacity: 0.2 }}>
        <rect x="0" y="0" width="1440" height="420" filter="url(#paper-grain)" />
      </g>
      <g clipPath="url(#paper-sheets)" mask="url(#paper-fade-mask)" style={{ mixBlendMode: "soft-light", opacity: 0.55 }}>
        <rect x="0" y="0" width="1440" height="420" filter="url(#paper-crease)" />
      </g>
    </svg>
  );
}
