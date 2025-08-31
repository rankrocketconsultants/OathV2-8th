import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, View, Text, ScrollView, Animated, Easing } from "react-native";
import { useSafeTokens } from "../design/safeTokens";
import Card from "./base/Card";
import GroupedList from "./GroupedList";
import TaskRow, { type RowItem } from "./TaskRow";
import CaptureInput from "./CaptureInput";
import { addItem } from "../stores/itemsStore";
import { useSettings } from "../stores/settingsStore";

/**
 * DaySheet — frosted/elevated overlay card + unified CaptureInput + animated add
 * - Receives ISO start-of-day via dateISO
 * - Adds subtle settle shadow (spring already present in earlier commands)
 */
export default function DaySheet({
  visible,
  dateISO,
  items,
  onClose,
  onToggle,
  onDelete
}: {
  visible: boolean;
  dateISO: string;
  items: RowItem[];
  onClose: () => void;
  onToggle: (it: RowItem) => void;
  onDelete: (it: RowItem) => void;
}) {
  const t = useSafeTokens();
  const { settings } = useSettings();

  // Selected day from ISO
  const selected = useMemo(() => {
    const d = new Date(dateISO);
    return isNaN(d.getTime()) ? new Date() : d;
  }, [dateISO]);

  // settle shadow animation (kept)
  const shadowRadius = useRef(new Animated.Value(4)).current;
  const shadowOpacity = useRef(new Animated.Value(0.06)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(shadowRadius, { toValue: 8, friction: 7, tension: 120, useNativeDriver: false }),
        Animated.timing(shadowOpacity, { toValue: t.shadowOpacity ?? 0.08, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(shadowRadius, { toValue: 4, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: false }),
        Animated.timing(shadowOpacity, { toValue: 0.06, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: false })
      ]).start();
    }
  }, [visible, t.shadowOpacity, shadowRadius, shadowOpacity]);

  // default time parsing
  const parseHHMM = (s: string) => {
    const [hh, mm] = s.split(":").map((x) => parseInt(x, 10));
    return { hh: isNaN(hh) ? 9 : hh, mm: isNaN(mm) ? 0 : mm };
  };

  const onSubmit = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    const base = new Date(selected);
    const def = (settings as any)?.defaultTimes?.morning || (settings as any)?.defaultReminderTime || "09:00";
    const { hh, mm } = parseHHMM(def);
    base.setHours(hh, mm, 0, 0);
    addItem(v, { datetime: base.toISOString(), type: "time" });
    // small nudge: animate list wrapper to acknowledge add (TaskRow also has mount wash)
    Animated.sequence([
      Animated.timing(listNudge, { toValue: 1, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(listNudge, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  };

  // List enter nudge on add
  const listNudge = useRef(new Animated.Value(0)).current;
  const listTranslateY = listNudge.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6] // small upward nudge
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable onPress={onClose} style={{ position:"absolute", top:0, bottom:0, left:0, right:0, backgroundColor: t.palette.backdrop }} />

      {/* Sheet container with frosted Card */}
      <View style={{ position:"absolute", left: 12, right: 12, bottom: 12 }}>
        <Animated.View style={{ shadowRadius, shadowOpacity }}>
          <Card padded elevated style={{ maxHeight: "72%" }}>
            {/* Header */}
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom: t.spacing.md }}>
              <Text style={{ color: t.palette.textPrimary, fontSize: t.type.h2.size, fontWeight: "700" }}>{selected.toDateString()}</Text>
              <Pressable onPress={onClose}><Text style={{ color: t.palette.textSecondary }}>Close</Text></Pressable>
            </View>

            {/* Unified CaptureInput pill (replacing inline TextInput+Add button) */}
            <View style={{ marginBottom: t.spacing.md }}>
              <CaptureInput placeholder="Add an oath for this day…" onSubmit={onSubmit} />
            </View>

            {/* Day list with slight nudge on add (plus TaskRow mount wash) */}
            <Animated.View style={{ flex: 1, transform: [{ translateY: listTranslateY }] }}>
              <GroupedList<RowItem>
                data={items}
                keyExtractor={(it, i) => String(it.id ?? i)}
                renderItem={({ item }) => <TaskRow item={item} onToggle={onToggle} onDelete={onDelete} />}
              />
            </Animated.View>
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
}