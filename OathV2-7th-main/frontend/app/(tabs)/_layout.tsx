import React from "react";
import { Tabs } from "expo-router";
import { EmeraldDockTabBar } from "../../src/components/EmeraldDock";

/** Tabs layout using the Emerald Dock (replaces default bar) */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <EmeraldDockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,  // labels handled inside the custom dock
        tabBarHideOnKeyboard: true
      }}
    >
      <Tabs.Screen name="index"    options={{ title: "Home" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="sparks"   options={{ title: "Sparks" }} />
      <Tabs.Screen name="ledger"   options={{ title: "Ledger" }} />
    </Tabs>
  );
}