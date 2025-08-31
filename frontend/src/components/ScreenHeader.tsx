import { View, Text, Pressable, StyleSheet, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useSafeTokens } from "../design/safeTokens";

/**
 * ScreenHeader — Transparent header with a subtle theme-aware SCRIM behind content
 * - Maintains transparent background to let the global gradient show
 * - Adds a faint top→transparent gradient UNDER the header content to keep title readable in light/dark
 * - Rhythm: pt=24 (xl), pb=16 (md), px=lg
 */
export default function ScreenHeader({ title, onMenu }: { title: string; onMenu?: () => void }) {
  const t = useSafeTokens();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  // Very light scrim for readability: darker in dark mode, lighter in light mode
  const scrimTopOpacity = isDark ? 0.14 : 0.06;

  return (
    <View style={{ position: "relative" }}>
      {/* Header scrim (under content) */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="hdrScrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={t.palette.backdrop} stopOpacity={scrimTopOpacity} />
              <Stop offset="100%" stopColor={t.palette.backdrop} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#hdrScrim)" />
        </Svg>
      </View>

      {/* Header content */}
      <View
        style={{
          paddingTop: t.spacing.xl,
          paddingBottom: t.spacing.md,
          paddingHorizontal: t.spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "transparent"
        }}
      >
        <Text style={{ color: t.palette.textPrimary, fontSize: t.type.h1.size, fontWeight: "700" }} numberOfLines={1}>
          {title}
        </Text>
        {onMenu ? (
          <Pressable
            onPress={onMenu}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radii.pill,
              backgroundColor: t.palette.pillBg
            }}
          >
            <Ionicons name="menu-outline" size={22} color={t.palette.textSecondary} />
          </Pressable>
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}
      </View>
    </View>
  );
}