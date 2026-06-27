export type EraKey =
  | "2003"
  | "2003-2015"
  | "2015-2020"
  | "2021"
  | "2022"
  | "2023"
  | "2024"
  | "2025"
  | "2026";

export type EraCardTheme = {
  border: string;
  background: string;
  shadow: string;
  highlightBorder: string;
  highlightBackground: string;
  highlightShadow: string;
};

/** Dönem kartları — erken yıllar sıcak/amber, ilerledikçe soğuk/mavi */
export const ERA_CARD_THEMES: Record<EraKey, EraCardTheme> = {
  "2003": {
    border: "rgba(200,160,90,0.22)",
    background: "rgba(180,140,80,0.07)",
    shadow: "0 4px 24px rgba(180,140,80,0.06)",
    highlightBorder: "rgba(210,170,95,0.42)",
    highlightBackground: "rgba(180,140,80,0.11)",
    highlightShadow: "0 0 28px rgba(200,160,90,0.14)",
  },
  "2003-2015": {
    border: "rgba(190,150,85,0.22)",
    background: "rgba(170,130,75,0.07)",
    shadow: "0 4px 24px rgba(170,130,75,0.06)",
    highlightBorder: "rgba(200,160,90,0.4)",
    highlightBackground: "rgba(170,130,75,0.11)",
    highlightShadow: "0 0 28px rgba(190,150,85,0.13)",
  },
  "2015-2020": {
    border: "rgba(165,135,90,0.2)",
    background: "rgba(150,120,80,0.06)",
    shadow: "0 4px 24px rgba(150,120,80,0.05)",
    highlightBorder: "rgba(175,145,95,0.38)",
    highlightBackground: "rgba(150,120,80,0.1)",
    highlightShadow: "0 0 26px rgba(165,135,90,0.12)",
  },
  "2021": {
    border: "rgba(120,140,175,0.22)",
    background: "rgba(80,100,140,0.07)",
    shadow: "0 4px 24px rgba(80,100,140,0.07)",
    highlightBorder: "rgba(130,155,190,0.4)",
    highlightBackground: "rgba(80,100,140,0.11)",
    highlightShadow: "0 0 28px rgba(90,115,155,0.14)",
  },
  "2022": {
    border: "rgba(100,125,170,0.24)",
    background: "rgba(60,80,130,0.08)",
    shadow: "0 4px 24px rgba(60,80,130,0.08)",
    highlightBorder: "rgba(110,140,185,0.42)",
    highlightBackground: "rgba(60,80,130,0.12)",
    highlightShadow: "0 0 28px rgba(70,95,150,0.15)",
  },
  "2023": {
    border: "rgba(115,90,150,0.22)",
    background: "rgba(100,60,120,0.07)",
    shadow: "0 4px 24px rgba(100,60,120,0.07)",
    highlightBorder: "rgba(130,100,165,0.4)",
    highlightBackground: "rgba(100,60,120,0.11)",
    highlightShadow: "0 0 28px rgba(110,75,140,0.14)",
  },
  "2024": {
    border: "rgba(140,120,100,0.2)",
    background: "rgba(120,100,85,0.06)",
    shadow: "0 4px 24px rgba(120,100,85,0.05)",
    highlightBorder: "rgba(150,130,110,0.38)",
    highlightBackground: "rgba(120,100,85,0.1)",
    highlightShadow: "0 0 26px rgba(130,110,95,0.12)",
  },
  "2025": {
    border: "rgba(175,145,90,0.22)",
    background: "rgba(160,130,60,0.07)",
    shadow: "0 4px 24px rgba(160,130,60,0.07)",
    highlightBorder: "rgba(190,160,100,0.4)",
    highlightBackground: "rgba(160,130,60,0.11)",
    highlightShadow: "0 0 28px rgba(175,145,90,0.14)",
  },
  "2026": {
    border: "rgba(201,166,90,0.26)",
    background: "rgba(201,166,90,0.08)",
    shadow: "0 4px 24px rgba(201,166,90,0.08)",
    highlightBorder: "rgba(201,166,90,0.45)",
    highlightBackground: "rgba(201,166,90,0.12)",
    highlightShadow: "0 0 30px rgba(201,166,90,0.16)",
  },
};

const ERA_KEYS = Object.keys(ERA_CARD_THEMES) as EraKey[];

/** Admin'deki year_or_period metnini dönem anahtarına eşler. */
export function resolveEraKey(yearOrPeriod: string): EraKey {
  const trimmed = yearOrPeriod.trim();
  if (trimmed in ERA_CARD_THEMES) return trimmed as EraKey;

  const match = ERA_KEYS.find((key) => trimmed.startsWith(key));
  return match ?? "2003";
}

export function getEraCardTheme(eraKey: EraKey, isHighlight: boolean) {
  const theme = ERA_CARD_THEMES[eraKey];
  return isHighlight
    ? {
        borderColor: theme.highlightBorder,
        backgroundColor: theme.highlightBackground,
        boxShadow: theme.highlightShadow,
      }
    : {
        borderColor: theme.border,
        backgroundColor: theme.background,
        boxShadow: theme.shadow,
      };
}
