import React from "react";
import { View, ViewProps } from "react-native";
import { useSafeTokens } from "../../design/safeTokens";

/**
 * ItemRow — unified row wrapper used inside list Cards
 * - Transparent background (the Card supplies the surface)
 * - Spacing: pv=md, ph=lg
 * - Never draws shadows or borders
 */
export default function ItemRow({ style, children, ...rest }: ViewProps) {
  const t = useSafeTokens();
  return (
    <View
      {...rest}
      style={[
        {
          paddingVertical: t.spacing.md,
          paddingHorizontal: t.spacing.lg,
          backgroundColor: "transparent",
        },
        style
      ]}
    >
      {children}
    </View>
  );
}