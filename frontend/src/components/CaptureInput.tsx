import React, { useState } from "react";
import { View, TextInput, Pressable, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeTokens } from "../design/safeTokens";

/**
 * CaptureInput — unified capture pill with integrated mic (RIGHT)
 * - Used on Home and inside DaySheet
 * - 44×44 mic target; pill radius; tokenized colors
 */
export default function CaptureInput({
  placeholder,
  onSubmit
}: {
  placeholder: string;
  onSubmit: (text: string) => void;
}) {
  const t = useSafeTokens();
  const [text, setText] = useState("");

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    onSubmit(v);
    setText("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: t.palette.surface,
        borderWidth: t.hairlineWidth,
        borderColor: t.palette.hairline,
        borderRadius: t.radii.xl,
        paddingHorizontal: t.spacing.md,
        paddingVertical: t.spacing.md,
        // mild depth; parents control elevation
        shadowColor: t.shadowColor,
        shadowOpacity: t.shadowOpacity,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={t.palette.textTertiary}
        style={{
          flex: 1,
          color: t.palette.textPrimary,
          fontSize: t.type.body.size,
          paddingVertical: Platform.OS === "web" ? t.spacing.xs : 0
        }}
        onSubmitEditing={submit}
        blurOnSubmit
        returnKeyType="done"
      />
      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Submit"
        style={{
          width: 44,
          height: 44,
          marginLeft: t.spacing.sm,
          borderRadius: t.radii.pill,
          backgroundColor: t.palette.accent,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name="mic-outline" size={22} color={t.palette.onAccent} />
      </Pressable>
    </View>
  );
}