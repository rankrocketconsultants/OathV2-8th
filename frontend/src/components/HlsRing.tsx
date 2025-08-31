import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, Text, Animated, Easing } from "react-native";
import { useEffect, useMemo, useRef } from "react";
import { useSafeTokens } from "../design/safeTokens";
import { AccessibilityInfo } from "react-native";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * HLS ring — Solid GREY track + ACCENT progress with FOLLOWING fade-to-GREY tail
 * - Preserves P5 "breath" and Reduce Motion gating
 * - NO device scheme branching — reads ONLY app theme tokens
 */
export default function HlsRing({
  value,
  size = 200,
  stroke = 18,
  duration = 600,
  tailFrac = 0.10   // fraction of circumference to use for the tail
}: {
  value: number;
  size?: number;
  stroke?: number;
  duration?: number;
  tailFrac?: number;
}) {
  const t = useSafeTokens();
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  // Reduce Motion gating
  const reduceRef = useRef(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (mounted) reduceRef.current = !!v; });
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v:boolean) => { reduceRef.current = !!v; });
    return () => { if (mounted) mounted = false; sub?.remove?.(); };
  }, []);

  const gated = (ms: number) => (reduceRef.current ? 0 : ms);

  // Animate 0..100
  const animPct = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(animPct, {
      toValue: pct,
      duration: gated(duration),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start(({ finished }) => {
      if (!finished || reduceRef.current) return;
      // "Breath" 1.00 → 1.03 → 1.00 after fill update
      Animated.sequence([
        Animated.timing(breath, { toValue: 1.03, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 1.00, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();
    });
  }, [pct, duration, animPct]);

  // Breath scale
  const breath = useRef(new Animated.Value(1)).current;

  // Derived progress length & base offset: L = C * (pct/100); offset = C - L
  const progressLen = animPct.interpolate({
    inputRange: [0, 100],
    outputRange: [0, C]
  });
  const baseOffset = animPct.interpolate({
    inputRange: [0, 100],
    outputRange: [C, 0]
  });

  // Tail length: min(progressLen, C*tailFrac)
  const tailLenRaw = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const tailTarget = Math.max(0, Math.min(C * tailFrac, (pct / 100) * C));
    Animated.timing(tailLenRaw, {
      toValue: tailTarget,
      duration: gated(180),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  }, [pct, C, tailFrac, tailLenRaw]);

  // Place tail so its END matches the live end:
  // tail offset = C - tailLen (since we want the tail to end at the progress end)
  const tailOffset = Animated.subtract(C, tailLenRaw);

  const gradTailId = useMemo(() => `hlsTailGrad-${size}-${stroke}`, [size, stroke]);

  return (
    <Animated.View style={{ width: size, alignItems: "center", justifyContent: "center", transform: [{ scale: breath }] }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          {/* Tail gradient: ACCENT → GREY (hairline) to visually blend into the track */}
          <LinearGradient id={gradTailId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor={t.palette.accent} />
            <Stop offset="100%" stopColor={t.palette.hairline} />
          </LinearGradient>
        </Defs>

        {/* TRACK: solid grey (blank) */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={t.palette.hairline} strokeWidth={stroke} fill="none" strokeLinecap="round"
        />

        {/* BASE PROGRESS: solid ACCENT (animated dash) */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={t.palette.accent} strokeWidth={stroke} fill="none"
          strokeDasharray={`${C} ${C}`}
          strokeDashoffset={baseOffset}
          strokeLinecap="round"
        />

        {/* TAIL OVERLAY: short dash at arc end with gradient ACCENT → GREY */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${gradTailId})`} strokeWidth={stroke} fill="none"
          strokeDasharray={[tailLenRaw, C]}
          strokeDashoffset={tailOffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center numeral */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: t.palette.textPrimary, fontWeight: "800", fontSize: 28, letterSpacing: -0.3 }}>
          {Math.round(pct)}
        </Text>
        <Text style={{ color: t.palette.textSecondary }}>HLS</Text>
      </View>
    </Animated.View>
  );
}