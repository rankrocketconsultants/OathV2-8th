import React from "react";
import { FlatList, View, Platform } from "react-native";
import { useSafeTokens } from "../design/safeTokens";
import Card from "./base/Card";

type AnyItem = any;

export default function GroupedList<T extends AnyItem>({
  data,
  keyExtractor,
  renderItem,
  style,
  bottomInset = 0,
  topInset = 0,
  keyboardShouldPersistTaps = "handled"
}: {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ({ item, index }: { item: T; index: number }) => JSX.Element;
  style?: any;
  /** extra padding inside the list so content never sits under the dock */
  bottomInset?: number;
  /** optional top padding inside the list (keeps breathing room under header if desired) */
  topInset?: number;
  keyboardShouldPersistTaps?: "never" | "always" | "handled";
}) {
  const t = useSafeTokens();

  return (
    <Card padded={false} style={style}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={{ height: t.hairlineWidth, backgroundColor: t.palette.hairline }} />
        )}
        style={{ flex: 1 }}
        // The list is the ONLY scroller; put space INSIDE it
        contentContainerStyle={{ paddingTop: topInset + t.spacing.xs, paddingBottom: bottomInset }}
        showsVerticalScrollIndicator={false}
        // Helps iOS adjust under translucent bars if system tries to add insets
        contentInsetAdjustmentBehavior={Platform.OS === "ios" ? "automatic" : undefined}
        // Typing in capture / editing rows shouldn't block taps
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
      />
    </Card>
  );
}