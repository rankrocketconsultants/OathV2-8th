import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, Text, Animated, Easing } from "react-native";
import { useEffect, useMemo, useRef } from "react";
import { useSafeTokens } from "../design/safeTokens";
import { useReduceMotion, gated } from "../design/motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * HLS ring — smooth fill + tiny "breath" on value change (Reduce-Motion aware)
 */
export default function HlsRing({ value, size = 200, stroke = 18, duration = 600 }: { value: number; size?: number; stroke?: number; duration?: number; }) {
  const t = useSafeTokens();
  const reduce = useReduceMotion();
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;

  const anim = useRef(new Animated.Value(pct)).current;
  const breath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: gated(duration, reduce), easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(({ finished }) => {
      if (!finished || reduce) return;
      // 1.00 → 1.03 → 1.00 "breath"
      Animated.sequence([
        Animated.timing(breath, { toValue: 1.03, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(breath, { toValue: 1.00, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    });
  }, [pct, duration, reduce, anim, breath]);

  const dashOffset = anim.interpolate({ inputRange: [0, 100], outputRange: [C, 0] });
  const gradId = useMemo(() => `hlsGrad-${size}-${stroke}`, [size, stroke]);

  return (
    <Animated.View style={{ width: size, alignItems: "center", justifyContent: "center", transform: [{ scale: breath }] }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          {/* Keep whatever gradient you currently use; commonly accent→accent2 or gated tail overlay elsewhere */}
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={t.palette.accent} />
            <Stop offset="100%" stopColor={(t.palette as any).accent2 ?? t.palette.accent} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.palette.hairline} strokeWidth={stroke} fill="none" strokeLinecap="round" />

        {/* Progress */}
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${gradId})`} strokeWidth={stroke} fill="none"
          strokeDasharray={`${C} ${C}`} strokeDashoffset={dashOffset as any}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center numeral */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: t.palette.textPrimary, fontWeight: "800", fontSize: 28, letterSpacing: -0.3 }}>{Math.round(pct)}</Text>
        <Text style={{ color: t.palette.textSecondary }}>HLS</Text>
      </View>
    </Animated.View>
  );
}