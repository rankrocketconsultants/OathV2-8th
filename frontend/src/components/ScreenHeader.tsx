import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useSafeTokens } from "../design/safeTokens";

/**
 * ScreenHeader — Transparent header with a subtle theme-aware SCRIM behind content
 * - Transparent to let the global gradient show (P1)
 * - Adds a faint top→transparent scrim UNDER the header content to keep title readable
 * - Supports optional LEFT action (icon or text) and RIGHT action (hamburger/menu)
 * - Rhythm: pt=24 (xl), pb=16 (md), px=lg
 */
export default function ScreenHeader({
  title,
  onMenu,
  leftIcon = "chevron-back",
  leftLabel,
  onLeftPress
}: {
  title: string;
  onMenu?: () => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftLabel?: string;
  onLeftPress?: () => void;
}) {
  const t = useSafeTokens();
  // Very light scrim for readability
  const scrimTopOpacity = 0.10; // dark enough in both themes due to tokens.backdrop

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
        {/* LEFT: back/done action (optional) */}
        {onLeftPress ? (
          <Pressable
            onPress={onLeftPress}
            accessibilityRole="button"
            accessibilityLabel={leftLabel || "Back"}
            style={{
              minWidth: 44,
              height: 44,
              paddingHorizontal: 6,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              backgroundColor: t.palette.pillBg,
              flexDirection: "row",
              gap: 6
            }}
          >
            <Ionicons name={leftIcon} size={20} color={t.palette.textSecondary} />
            {leftLabel ? (
              <Text style={{ color: t.palette.textSecondary, fontWeight: "700" }}>{leftLabel}</Text>
            ) : null}
          </Pressable>
        ) : (
          <View style={{ width: 44, height: 44 }} />
        )}

        {/* TITLE */}
        <Text
          style={{ color: t.palette.textPrimary, fontSize: t.type.h1.size, fontWeight: "700" }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* RIGHT: hamburger/menu (optional) */}
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