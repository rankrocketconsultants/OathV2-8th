import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Query OS Reduce Motion once and cache the result in a hook */
export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => mounted && setReduce(!!v));
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v: boolean) => setReduce(!!v));
    return () => sub?.remove?.();
  }, []);
  return reduce;
}

/** Helper to gate durations when Reduce Motion is on */
export function gated(duration: number, reduceMotion: boolean) {
  return reduceMotion ? 0 : duration;
}