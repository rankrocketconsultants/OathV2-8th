import { useState } from "react";
import { View, Text, Pressable, TextInput, Linking, ScrollView, Switch } from "react-native";
import { useSafeTokens } from "../src/design/safeTokens";
import ScreenHeader from "../src/components/ScreenHeader";
import SideMenu from "../src/components/SideMenu";
import Segmented from "../src/components/Segmented";
import Card from "../src/components/base/Card";
import SettingsRow from "../src/components/settings/SettingsRow";
import { useSettings } from "../src/stores/settingsStore";
import { EmeraldDockOverlay } from "../src/components/EmeraldDock";

function normalizeHHMM(current: string, incoming: string) {
  const s = incoming.replace(/[^0-9]/g, "");
  if (s.length < 3) return current;
  const hh = Math.max(0, Math.min(23, parseInt(s.slice(0, s.length - 2), 10)));
  const mm = Math.max(0, Math.min(59, parseInt(s.slice(-2), 10)));
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function SettingsScreen() {
  const t = useSafeTokens();
  const { settings, set } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const [editStart, setEditStart] = useState(false);
  const [editEnd, setEditEnd] = useState(false);
  const [tempStart, setTempStart] = useState(settings.quietHoursStart);
  const [tempEnd, setTempEnd] = useState(settings.quietHoursEnd);

  const BankBar = () => {
    const pct = Math.max(0, Math.min(1, settings.smsBank / (settings.smsBankMax || 1)));
    return (
      <View style={{ marginTop: t.spacing.xs }}>
        <Text style={{ color: t.palette.textTertiary, marginBottom: t.spacing.xs }}>
          SMS Bank {settings.smsBank} / {settings.smsBankMax} ({settings.plan})
        </Text>
        <View style={{ height: 8, borderRadius: 6, backgroundColor: t.palette.glass, overflow: "hidden" }}>
          <View style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: t.palette.accent }} />
        </View>
        <Text style={{ color: t.palette.textTertiary, fontSize: t.type.caption.size, marginTop: t.spacing.xs }}>
          Pro/Elite include larger banks. Top-ups add +100.
        </Text>
      </View>
    );
  };

  const InlineEditor = ({ value, onChange, onSave, onCancel }:{
    value:string; onChange:(s:string)=>void; onSave:()=>void; onCancel:()=>void;
  }) => (
    <View style={{ flexDirection:"row", alignItems:"center", gap:t.spacing.sm, marginTop:t.spacing.xs }}>
      <TextInput
        defaultValue={value}
        placeholder="HH:MM"
        placeholderTextColor={t.palette.textTertiary}
        onEndEditing={(e)=>onChange(normalizeHHMM(value, e.nativeEvent.text.trim()))}
        style={{
          flexGrow:1, minWidth:120, color:t.palette.textPrimary,
          borderWidth:t.hairlineWidth, borderColor:t.palette.hairline,
          borderRadius:t.radii.md, paddingHorizontal:t.spacing.md, paddingVertical:t.spacing.sm, textAlign:"center"
        }}
      />
      <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel edit"
        style={{
          paddingHorizontal:t.spacing.md, paddingVertical:t.spacing.sm, minHeight:44,
          borderRadius:t.radii.pill, borderWidth:t.hairlineWidth, borderColor:t.palette.hairline, alignItems:"center", justifyContent:"center"
        }}>
        <Text style={{ color:t.palette.textSecondary, fontWeight:"700" }}>Cancel</Text>
      </Pressable>
      <Pressable onPress={onSave} accessibilityRole="button" accessibilityLabel="Save time"
        style={{
          paddingHorizontal:t.spacing.md, paddingVertical:t.spacing.sm, minHeight:44,
          borderRadius:t.radii.pill, backgroundColor:t.palette.accent, borderWidth:t.hairlineWidth, borderColor:t.palette.accent,
          alignItems:"center", justifyContent:"center"
        }}>
        <Text style={{ color:t.palette.onAccent, fontWeight:"700" }}>Save</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScreenHeader title="Settings" onMenu={() => setMenuOpen(true)} />

      <ScrollView contentContainerStyle={{ padding: t.spacing.lg, gap: t.spacing.lg, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={{ color:t.palette.textPrimary, fontWeight:"700", marginBottom:t.spacing.sm }}>Intensity</Text>
          <View style={{ alignItems:"center" }}>
            <Segmented segments={["Gentle","Standard","Firm"]} value={settings.intensity} onChange={(v)=>set({ intensity:v as any })} />
          </View>
        </Card>

        <Card>
          <Text style={{ color:t.palette.textPrimary, fontWeight:"700" }}>Quiet Hours</Text>
          <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginTop:t.spacing.sm }}>
            <Text style={{ color:t.palette.textSecondary }}>
              {settings.quietHoursEnabled ? `On · ${settings.quietHoursStart}–${settings.quietHoursEnd}` : "Off"}
            </Text>
            <Switch value={settings.quietHoursEnabled} onValueChange={(v)=>set({ quietHoursEnabled:v })}
              trackColor={{ false: t.palette.hairline, true: t.palette.timeChipBg }} thumbColor={"#FFFFFF"} />
          </View>

          {settings.quietHoursEnabled && (
            <View style={{ marginTop:t.spacing.sm }}>
              <SettingsRow label="Start" value={settings.quietHoursStart} onPress={()=>{ setTempStart(settings.quietHoursStart); setEditStart((s)=>!s); setEditEnd(false); }} />
              {editStart && <InlineEditor value={tempStart} onChange={setTempStart} onCancel={()=>setEditStart(false)} onSave={()=>{ set({ quietHoursStart:tempStart }); setEditStart(false); }} />}
              <SettingsRow label="End" value={settings.quietHoursEnd} onPress={()=>{ setTempEnd(settings.quietHoursEnd); setEditEnd((s)=>!s); setEditStart(false); }} />
              {editEnd && <InlineEditor value={tempEnd} onChange={setTempEnd} onCancel={()=>setEditEnd(false)} onSave={()=>{ set({ quietHoursEnd:tempEnd }); setEditEnd(false); }} />}
            </View>
          )}
        </Card>

        <Card>
          <Text style={{ color:t.palette.textPrimary, fontWeight:"700" }}>Display</Text>
          <Text style={{ color:t.palette.textSecondary, marginTop:t.spacing.xs }}>Time Format</Text>
          <View style={{ alignItems:"center" }}>
            <Segmented segments={["12h","24h"]} value={settings.timeFormat24h ? "24h" : "12h"} onChange={(v)=>set({ timeFormat24h: v==="24h" })} />
          </View>
          <View style={{ height:t.spacing.md }} />
          <Text style={{ color:t.palette.textSecondary, marginBottom:t.spacing.xs }}>First day of week</Text>
          <View style={{ alignItems:"center" }}>
            <Segmented segments={["Sun","Mon"]} value={settings.firstDayMonday ? "Mon" : "Sun"} onChange={(v)=>set({ firstDayMonday: v==="Mon" })} />
          </View>
        </Card>

        <Card>
          <Text style={{ color:t.palette.textPrimary, fontWeight:"700" }}>Theme</Text>
          <View style={{ alignItems:"center" }}>
            <Segmented segments={["System","Light","Dark"]} value={settings.theme[0].toUpperCase()+settings.theme.slice(1)} onChange={(v)=>set({ theme: v.toLowerCase() as any })} />
          </View>
          <Text style={{ color:t.palette.textTertiary, marginTop:t.spacing.xs }}>Changes apply immediately across the app.</Text>
        </Card>
      </ScrollView>
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Persistent Emerald Dock on Settings */}
      <EmeraldDockOverlay />
    </View>
  );
}