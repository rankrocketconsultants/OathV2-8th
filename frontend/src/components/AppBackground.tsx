import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from "react-native-svg";
import { useSafeTokens } from "../design/safeTokens";

/**
 * AppBackground — global, non-scrolling gradient
 * - NO device scheme branching. Reads ONLY app theme tokens via safeTokens.
 * - Dark: graphite wash + very subtle dark-emerald radial in the TOP HALF + faint bottom vignette.
 * - Light: airy wash + faint mint hint up top; never washes the header or cards.
 */
export default function AppBackground() {
  const { width, height } = Dimensions.get("window");
  const t = useSafeTokens();

  // Infer darkness directly from tokens (not device): simple luminance check on the page bg.
  const isDark = (() => {
    const hex = t.palette.bg.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    // ITU-R BT.709 luminance
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return L < 0.5;
  })();

  // Keep the emerald influence subtle; tuned for each theme purely from tokens
  const darkEmerald = "#07221A"; // very dark emerald; not neon
  const radialOpacity = isDark ? 0.12 : 0.18;   // lower in dark to prevent "white headband"
  const vignetteOpacity = isDark ? 0.20 : 0.10; // gently seat content/dock

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Base wash from tokens */}
          <LinearGradient id="bgLinear" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={t.palette.bgGrad0} />
            <Stop offset="100%" stopColor={t.palette.bgGrad2} />
          </LinearGradient>

          {/* Top radial lives in top half; quickly blends to graphite */}
          <RadialGradient id="topRadial" cx="50%" cy="10%" r="60%">
            <Stop offset="0%"   stopColor={isDark ? darkEmerald : t.palette.bgGrad0} />
            <Stop offset="35%"  stopColor={t.palette.bgGrad0} />
            <Stop offset="100%" stopColor={t.palette.bgGrad2} />
          </RadialGradient>

          {/* Bottom vignette to ground content & dock */}
          <LinearGradient id="bottomVignette" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={t.palette.bgGrad2} stopOpacity="0" />
            <Stop offset="100%" stopColor={t.palette.bgGrad2} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* 1) Base wash */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgLinear)" />

        {/* 2) Subtle top halo (app theme aware) */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#topRadial)" fillOpacity={radialOpacity} />

        {/* 3) Bottom vignette (lower ~45%) */}
        <Rect x="0" y={height * 0.55} width={width} height={height * 0.45} fill="url(#bottomVignette)" fillOpacity={vignetteOpacity} />
      </Svg>
    </View>
  );
}