import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Segmented } from '@/components/field';
import { AppText, Card, Divider, Row } from '@/components/ui';
import { clearPin } from '@/lib/lock';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

const GOAL_LABELS: Record<string, string> = {
  track: 'Tracking my cycle',
  conceive: 'Trying to conceive',
  pregnancy: 'Pregnancy mode',
  contraception: 'Contraception',
};

export default function SettingsScreen() {
  const { colors } = useTheme();
  const profile = useAppStore((state) => state.profile);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const wipeEverything = useAppStore((state) => state.wipeEverything);

  const confirmWipe = () => {
    Alert.alert(
      'Delete all data?',
      'This permanently erases every log, cycle, reminder and setting on this phone. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            wipeEverything();
            router.replace('/onboarding' as Href);
          },
        },
      ],
    );
  };

  const toggleLock = (value: boolean) => {
    if (value) {
      router.push('/lock-setup' as Href);
    } else {
      void clearPin().then(() => updateSettings({ lockEnabled: false, biometricUnlock: false }));
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Settings</AppText>

        <Card onPress={() => router.push('/profile' as Href)}>
          <Row gap={spacing.md}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <AppText variant="title" color="#FFFFFF">
                {(profile?.name?.trim()?.[0] ?? 'F').toUpperCase()}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="heading">{profile?.name?.trim() || 'Your profile'}</AppText>
              <AppText variant="caption" muted>
                {GOAL_LABELS[profile?.goal ?? 'track']} · {profile?.units === 'imperial' ? 'Imperial' : 'Metric'}
              </AppText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
          </Row>
        </Card>

        <Group title="Tracking">
          <LinkRow icon="bell-outline" title="Reminders" subtitle="Period, logging and pill alerts" href="/reminders" />
          <Divider />
          <LinkRow icon="pill" title="Contraception" subtitle="Schedules and adherence" href="/contraception" />
          <Divider />
          <LinkRow
            icon="human-pregnant"
            title="Pregnancy mode"
            subtitle={settings.onboardingComplete ? 'Due date, weekly updates and tools' : ''}
            href="/pregnancy"
          />
        </Group>

        <Group title="Reports & data">
          <LinkRow icon="file-chart-outline" title="Health report" subtitle="Summary you can read in the app" href="/report" />
          <Divider />
          <LinkRow icon="database-export-outline" title="Backup & restore" subtitle="Encrypted export and import" href="/backup" />
          <Divider />
          <LinkRow icon="book-open-page-variant-outline" title="Health library" subtitle="Short reads, always offline" href="/articles" />
        </Group>

        <Group title="Appearance">
          <View style={styles.themeWrap}>
            <AppText variant="bodyStrong">Theme</AppText>
            <Segmented
              options={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              value={settings.theme}
              onChange={(theme) => updateSettings({ theme })}
            />
          </View>
        </Group>

        <Group title="Privacy">
          <ToggleRow
            icon="eye-off-outline"
            title="Discreet mode"
            subtitle="Hide cycle numbers on the home screen"
            value={settings.discreetMode}
            onChange={(discreetMode) => updateSettings({ discreetMode })}
          />
          <Divider />
          <ToggleRow
            icon="lock-outline"
            title="App lock"
            subtitle="Require a PIN or fingerprint to open Flopop"
            value={settings.lockEnabled}
            onChange={toggleLock}
          />
        </Group>

        <Group title="Danger zone">
          <LinkRow
            icon="delete-outline"
            title="Delete all data"
            subtitle="Erase everything on this phone"
            danger
            onPress={confirmWipe}
          />
        </Group>

        <View style={styles.about}>
          <AppText variant="caption" muted center>
            Flopop 1.0.0 · 100% offline
          </AppText>
          <AppText variant="caption" muted center>
            Flopop is a personal tracker, not a medical device. Predictions are estimates and should not be used as
            contraception or for diagnosis. Speak to a healthcare professional about any concerns.
          </AppText>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label" muted style={styles.groupTitle}>
        {title.toUpperCase()}
      </AppText>
      <Card padded={false} style={styles.groupCard}>
        {children}
      </Card>
    </View>
  );
}

function LinkRow({
  icon,
  title,
  subtitle,
  href,
  onPress,
  danger,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  href?: Href;
  onPress?: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress ?? (href ? () => router.push(href) : undefined)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Row gap={spacing.md} style={styles.flex}>
        <View style={[styles.iconWrap, { backgroundColor: danger ? colors.danger + '22' : colors.primarySoft }]}>
          <MaterialCommunityIcons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong" color={danger ? colors.danger : undefined}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" muted>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </Row>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Row gap={spacing.md} style={styles.flex}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="bodyStrong">{title}</AppText>
          {subtitle ? (
            <AppText variant="caption" muted>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </Row>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.lg },
  flex: { flex: 1, gap: 2 },
  avatar: { width: 52, height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { marginLeft: spacing.xs },
  groupCard: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconWrap: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  rowPressed: { opacity: 0.7 },
  themeWrap: { padding: spacing.md, gap: spacing.sm },
  about: { gap: 4, paddingHorizontal: spacing.md },
});
