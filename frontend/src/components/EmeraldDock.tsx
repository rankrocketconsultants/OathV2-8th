import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Animated, Easing, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeTokens } from "../design/safeTokens";
import { router, usePathname } from "expo-router";

/** Utility: derive "isDark" from tokens (app theme), not device scheme */
function isDarkFromHex(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L < 0.5;
}

type TabRoute = { name: "index" | "calendar" | "sparks" | "ledger"; title: string; icon: keyof typeof Ionicons.glyphMap; href: string };

const TABS: TabRoute[] = [
  { name: "index",    title: "Home",     icon: "home-outline",        href: "/(tabs)" },
  { name: "calendar", title: "Calendar", icon: "calendar-outline",    href: "/(tabs)/calendar" },
  { name: "sparks",   title: "Sparks",   icon: "sparkles-outline",    href: "/(tabs)/sparks" },
  { name: "ledger",   title: "Ledger",   icon: "stats-chart-outline", href: "/(tabs)/ledger" },
];

/** Shared visuals for the Emerald Dock; used by TabBar and Settings overlay */
export function EmeraldDockVisuals({
  activeIndex,
  onPress,
  width,
}: {
  activeIndex: number;
  onPress: (index: number) => void;
  width: number;
}) {
  const t = useSafeTokens();
  const inset = useSafeAreaInsets();
  const isDark = isDarkFromHex(t.palette.bg);

  const outerPadH = 12;
  const bottom = 12 + inset.bottom;
  const innerPadH = 16;
  const underlineW = 18;

  const itemW = useMemo(() => Math.max(1, (width - innerPadH * 2) / TABS.length), [width]);
  const underlineX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width <= 0) return;
    const x = innerPadH + itemW * activeIndex + itemW / 2 - underlineW / 2;
    Animated.timing(underlineX, { toValue: x, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [activeIndex, width, itemW, underlineX]);

  // Per-icon scale anims
  const scalesRef = useRef(TABS.map((_, i) => new Animated.Value(i === activeIndex ? 1 : 0.96)));
  useEffect(() => {
    TABS.forEach((_, i) => {
      Animated.timing(scalesRef.current[i], {
        toValue: i === activeIndex ? 1 : 0.96,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    });
  }, [activeIndex]);

  // Scrim tuned by theme
  const scrimOpacity = isDark ? 0.12 : 0.18;

  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: outerPadH, right: outerPadH, bottom, borderRadius: 20, overflow: "visible" }}>
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <BlurView intensity={isDark ? 32 : 34} tint={isDark ? "dark" : "light"} style={{ borderRadius: 20 }}>
          <View style={{ height: 64 }} />
        </BlurView>
        {/* Scrim to boost icon contrast over the background gradient */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.palette.glass, opacity: scrimOpacity, borderRadius: 20 }]} />
        {/* Top hairline */}
        <View style={{ position: "absolute", left: 0, right: 0, top: 0, height: t.hairlineWidth, backgroundColor: t.palette.hairline }} />
      </View>

      {/* Icons + labels row */}
      <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, paddingHorizontal: innerPadH, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {TABS.map((tab, i) => {
          const focused = i === activeIndex;
          const color = focused ? t.palette.accent : (isDark ? t.palette.textSecondary : t.palette.textTertiary);
          const labelColor = focused ? (isDark ? t.palette.textSecondary : t.palette.textSecondary) : t.palette.textTertiary;

          return (
            <Pressable
              key={tab.name}
              onPress={() => onPress(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.title}
              style={{ width: itemW, alignItems: "center", justifyContent: "center", height: 64 }}
            >
              <Animated.View style={{ transform: [{ scale: scalesRef.current[i] }], alignItems: "center" }}>
                <Ionicons name={tab.icon} size={26} color={color} />
                {/* Subtle label (kept short for readability) */}
                <Text style={{ marginTop: 4, fontSize: 10, color: labelColor }}>
                  {tab.title}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      {/* Animated underline */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 8,
          width: underlineW,
          height: 2,
          borderRadius: 999,
          backgroundColor: t.palette.accent,
          transform: [{ translateX: underlineX }]
        }}
      />
    </View>
  );
}

/** TabBar component for expo-router Tabs (replaces default bar) */
export function EmeraldDockTabBar({ state, navigation }: any) {
  const [width, setWidth] = useState(0);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <EmeraldDockVisuals
        width={width}
        activeIndex={state.index}
        onPress={(i) => {
          if (state.index === i) return;
          const route = state.routes[i];
          navigation.navigate(route.name);
        }}
      />
    </View>
  );
}

/** Overlay version to show the same dock on non-Tab screens (e.g., Settings) */
export function EmeraldDockOverlay() {
  const [width, setWidth] = useState(0);
  const pathname = usePathname();
  const activeIndex = useMemo(() => {
    const idx = TABS.findIndex(t => pathname?.startsWith(t.href));
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  return (
    <View pointerEvents="box-none" onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={StyleSheet.absoluteFill}>
      <EmeraldDockVisuals
        width={width}
        activeIndex={activeIndex}
        onPress={(i) => router.push(TABS[i].href)}
      />
    </View>
  );
}