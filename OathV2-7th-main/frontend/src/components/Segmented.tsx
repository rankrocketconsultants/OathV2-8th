import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Text, ScrollView, LayoutChangeEvent, Animated, Easing, useWindowDimensions } from "react-native";
import { useSafeTokens } from "../design/safeTokens";
import { useReduceMotion, gated } from "../design/motion";

/**
 * Segmented — Single Active Pill, Perfect Centering, Sliding Highlight (Reduce-Motion aware)
 */
export default function Segmented({
  segments, value, onChange,
}: { segments: string[]; value: string; onChange: (v: string) => void; }) {
  const t = useSafeTokens();
  const { width: winW } = useWindowDimensions();
  const reduce = useReduceMotion();

  const layoutsRef = useRef<{ x: number; width: number }[]>([]);
  const [measuredCount, setMeasuredCount] = useState(0);
  const reset = () => { layoutsRef.current = []; setMeasuredCount(0); pillOpacity.setValue(0); };
  useEffect(() => { reset(); /* re-measure on width or set change */ }, [winW, segments.join("|")]);

  const setLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    layoutsRef.current[i] = { x, width };
    setMeasuredCount((c) => Math.min(segments.length, c + 1));
  };

  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const activeIdx = useMemo(() => Math.max(0, segments.indexOf(value)), [segments, value]);

  useEffect(() => {
    if (measuredCount < segments.length) return;
    const l = layoutsRef.current[activeIdx]; if (!l) return;
    pillX.setValue(l.x); pillW.setValue(l.width);
    Animated.timing(pillOpacity, { toValue: 1, duration: gated(120, reduce), easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measuredCount, segments.length]);

  useEffect(() => {
    if (measuredCount < segments.length) return;
    const l = layoutsRef.current[activeIdx]; if (!l) return;
    Animated.parallel([
      Animated.timing(pillX, { toValue: l.x, duration: gated(180, reduce), easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(pillW, { toValue: l.width, duration: gated(180, reduce), easing: Easing.out(Easing.cubic), useNativeDriver: false })
    ]).start();
  }, [activeIdx, measuredCount, segments, reduce, pillX, pillW]);

  const onPress = (s: string) => { if (s !== value) onChange(s); };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <View style={{
        position: "relative", flexDirection: "row", backgroundColor: "transparent",
        borderWidth: t.hairlineWidth, borderColor: t.palette.hairline, borderRadius: t.radii.lg, padding: 4,
        minHeight: 44, alignItems: "center", alignSelf: "center"
      }}>
        <Animated.View pointerEvents="none" style={{
          position: "absolute", top: 4, bottom: 4, transform: [{ translateX: pillX }],
          width: pillW, borderRadius: t.radii.md, backgroundColor: t.palette.accent, opacity: pillOpacity
        }} />
        {segments.map((s, i) => {
          const selected = i === activeIdx;
          return (
            <Pressable
              key={`${s}-${i}`} onPress={() => onPress(s)}
              accessibilityRole="button" accessibilityLabel={`Select ${s}`} accessibilityState={{ selected }}
              onLayout={setLayout(i)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={{ paddingVertical: 10, paddingHorizontal: 14, minHeight: 44, borderRadius: t.radii.md, marginHorizontal: 2, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: selected ? t.palette.onAccent : t.palette.textSecondary, fontWeight: selected ? "700" : "500" }}>{s}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}