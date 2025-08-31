/* Full palette with refined bgGrad*; keep your current font family; sizes from P1 retained. */
export type Mode = "light" | "dark";

type TypeScale = {
  h1: { size: number };
  h2: { size: number };
  body: { size: number };
  sub: { size: number };
  caption: { size: number };
};

type Palette = {
  bg: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accent2: string;
  onAccent: string;

  hairline: number;
  hairlineColor: string;
  glass: string;
  pillBg: string;
  backdrop: string;

  timeChipBg: string;

  statusHonoredBg: string;
  statusHonoredText: string;
  statusMissedBg: string;
  statusMissedText: string;
  statusRescheduledBg: string;
  statusRescheduledText: string;

  /* background gradient stops */
  bgGrad0: string;
  bgGrad1: string;
  bgGrad2: string;

  radii: { sm: number; md: number; lg: number; xl: number; "2xl": number; pill: number };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  shadowOpacity: number;
  shadowColor: string;

  type: TypeScale;
};

export const tokens: Record<Mode, Palette> = {
  light: {
    bg: "#FFFFFF",
    surface: "#FAFAFB",
    surfaceElevated: "#FFFFFF",
    text: "#0A0A0B",
    textSecondary: "#3C3D40",
    textTertiary: "#6B6E73",
    accent: "#00C896",
    accent2: "#00C896",
    onAccent: "#FFFFFF",

    hairline: 1,
    hairlineColor: "#E5E7EB",
    glass: "rgba(255,255,255,0.70)",
    pillBg: "rgba(0,0,0,0.04)",
    backdrop: "rgba(0,0,0,0.45)",

    timeChipBg: "rgba(0, 200, 150, 0.10)",
    statusHonoredBg: "rgba(0, 200, 150, 0.12)",
    statusHonoredText: "#00C896",
    statusMissedBg: "rgba(255, 59, 48, 0.12)",
    statusMissedText: "#FF3B30",
    statusRescheduledBg: "rgba(0, 122, 255, 0.12)",
    statusRescheduledText: "#007AFF",

    /* Airy light gradient (subtle mint hint at top) */
    bgGrad0: "#FFFFFF",
    bgGrad1: "#F4F7F6",
    bgGrad2: "#EEF3F2",

    radii: { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, pill: 999 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
    shadowOpacity: 0.08,
    shadowColor: "#000000",
    type: { h1: { size: 30 }, h2: { size: 22 }, body: { size: 16 }, sub: { size: 14 }, caption: { size: 12 } }
  },
  dark: {
    bg: "#0C0F10",
    surface: "#111416",
    surfaceElevated: "#15181A",
    text: "#F5F6F7",
    textSecondary: "#C7CBD1",
    textTertiary: "#9AA0A6",
    accent: "#00C896",
    accent2: "#00C896",
    onAccent: "#001B14",

    hairline: 1,
    hairlineColor: "#262B30",
    glass: "rgba(21,24,26,0.78)",
    pillBg: "rgba(255,255,255,0.06)",
    backdrop: "rgba(0,0,0,0.45)",

    timeChipBg: "rgba(0, 200, 150, 0.16)",
    statusHonoredBg: "rgba(0, 200, 150, 0.22)",
    statusHonoredText: "#00C896",
    statusMissedBg: "rgba(255, 69, 58, 0.22)",
    statusMissedText: "#FF453A",
    statusRescheduledBg: "rgba(10, 132, 255, 0.22)",
    statusRescheduledText: "#0A84FF",

    /* TRUE graphite stops (no milky wash) */
    bgGrad0: "#0A0F10",
    bgGrad1: "#0B1112",
    bgGrad2: "#0C1214",

    radii: { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, pill: 999 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
    shadowOpacity: 0.08,
    shadowColor: "#000000",
    type: { h1: { size: 30 }, h2: { size: 22 }, body: { size: 16 }, sub: { size: 14 }, caption: { size: 12 } }
  }
};