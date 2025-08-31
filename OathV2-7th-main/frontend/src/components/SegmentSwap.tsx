import React, { useEffect, useRef } from "react";
import { Animated, Easing, View, ViewProps } from "react-native";
import { useReduceMotion, gated } from "../design/motion";

/**
 * SegmentSwap — cross-fade + 6–8px slide for content under segmented controls
 * Wrap the content that changes when a segment toggles. Pass a depKey (e.g., mode or seg).
 */
export default function SegmentSwap({
  depKey,
  children,
  slide = 8,
  duration = 180,
  style
}: ViewProps & { depKey: string | number; slide?: number; duration?: number }) {
  const reduce = useReduceMotion();
  const op = useRef(new Animated.Value(1)).current;
  const ty = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    op.setValue(0);
    ty.setValue(slide);
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: gated(duration, reduce), easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: gated(duration, reduce), easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, [depKey, reduce, slide, duration, op, ty]);

  return (
    <Animated.View style={[{ opacity: op, transform: [{ translateY: ty }] }, style as any]}>
      {children}
    </Animated.View>
  );
}