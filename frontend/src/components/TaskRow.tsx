import { View, Text, Pressable, Animated } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeTokens } from "../design/safeTokens";
import type { Item } from "../stores/itemsStore";
import { useSettings } from "../stores/settingsStore";
import { formatHM } from "../utils/datetime";
import Chip from "./base/Chip";
import { useEffect, useRef } from "react";
import ItemRow from "./base/ItemRow";
import { useReduceMotion, gated } from "../design/motion";

export type RowItem = Item;

export default function TaskRow({
  item,
  onToggle,
  onDelete,
  onPress,
  showStatus = true
}: {
  item: RowItem;
  onToggle?: (it: RowItem) => void;
  onDelete?: (it: RowItem) => void;
  onPress?: (it: RowItem) => void;
  /** When false, suppresses the status chip (Ledger view) */
  showStatus?: boolean;
}) {
  const t = useSafeTokens();
  const { settings } = useSettings();
  const reduce = useReduceMotion();
  const completed = !!item.completed;
  const use24h = !!settings.timeFormat24h;

  const timeLabel = item.datetime ? formatHM(new Date(item.datetime), use24h) : null;

  const statusKind =
    item.status === "honored" ? "honored" :
    item.status === "missed" ? "missed" :
    item.status === "rescheduled" ? "rescheduled" : "neutral";
  const statusLabel = item.status ? (item.status[0].toUpperCase() + item.status.slice(1)) : null;

  // Mount highlight: soft wash fade-out on first render (kept from P5)
  const wash = useRef(new Animated.Value(0.14)).current;
  useEffect(() => {
    Animated.timing(wash, { toValue: 0, duration: gated(640, reduce), useNativeDriver: true }).start();
  }, [reduce, wash]);

  const RightActions = () => (
    <View style={{ flexDirection: "row", alignItems: "center", paddingRight: t.spacing.sm, backgroundColor: "transparent" }}>
      <Pressable
        onPress={() => onDelete?.(item)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title}`}
        style={{
          paddingHorizontal: t.spacing.md + 2,
          paddingVertical: t.spacing.sm + 2,
          minHeight: 44,
          borderRadius: t.radii.pill,
          backgroundColor: t.palette.accent,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text style={{ color: t.palette.onAccent, fontWeight: "700" }}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable renderRightActions={RightActions} overshootRight={false}>
      {/* NO row-level surface; the Card supplies it. Keep a mount wash overlay. */}
      <View style={{ backgroundColor: "transparent", overflow: "hidden" }}>
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0, right: 0, top: 0, bottom: 0,
            backgroundColor: t.palette.glass,
            opacity: wash
          }}
        />
        <ItemRow>
          <Pressable onPress={() => onPress?.(item)} onLongPress={() => onToggle?.(item)} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => onToggle?.(item)}
                accessibilityRole="button"
                accessibilityLabel={`Toggle ${item.title}`}
                style={{ marginRight: t.spacing.md, minHeight: 44, justifyContent: "center" }}
              >
                <Ionicons
                  name={completed ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={completed ? t.palette.accent : t.palette.textTertiary}
                />
              </Pressable>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: completed ? t.palette.textSecondary : t.palette.textPrimary,
                    fontWeight: "700",
                    fontSize: t.type.body.size,
                    textDecorationLine: completed ? "line-through" : "none"
                  }}
                >
                  {item.title}
                </Text>
                {!!item.subtitle && (
                  <Text style={{ color: t.palette.textTertiary, marginTop: t.spacing.xs, fontSize: t.type.sub.size }}>
                    {item.subtitle}
                  </Text>
                )}
              </View>

              {/* Right chips inside the unified gutter */}
              {timeLabel && <Chip kind="time" label={timeLabel} />}
              {showStatus && statusLabel && <Chip kind={statusKind as any} label={statusLabel} style={{ marginLeft: t.spacing.sm }} />}
            </View>
          </Pressable>
        </ItemRow>
      </View>
    </Swipeable>
  );
}