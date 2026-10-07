import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/field';
import { AppText, Button, Card, IconButton, Row } from '@/components/ui';
import { createBackupFile, importBackup, pickBackup, shareBackup } from '@/lib/backup';
import { useAppStore } from '@/store/useAppStore';
import { spacing, useTheme } from '@/theme';

export default function BackupScreen() {
  const { colors } = useTheme();
  const refresh = useAppStore((state) => state.refresh);
  const [passphrase, setPassphrase] = useState('');
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);

  const onExport = async () => {
    setBusy('export');
    try {
      const { uri } = await createBackupFile(passphrase.trim() || undefined);
      const shared = await shareBackup(uri);
      Alert.alert(
        'Backup created',
        shared
          ? 'Choose where to save or send your backup file. Keep the passphrase safe — without it an encrypted backup cannot be opened.'
          : 'Your backup was saved to the app storage. Sharing is not available on this device.',
      );
    } catch (error) {
      Alert.alert('Could not create backup', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(null);
    }
  };

  const onImport = async () => {
    try {
      const content = await pickBackup();
      if (!content) return;
      importBackup(content, passphrase.trim() || undefined);
      refresh();
      Alert.alert('Backup restored', 'Your data has been restored on this device.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)' as Href) },
      ]);
    } catch (error) {
      Alert.alert('Could not restore', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Backup & restore
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ gap: spacing.sm }}>
          <Row gap={spacing.md}>
            <MaterialCommunityIcons name="shield-lock-outline" size={22} color={colors.primary} />
            <AppText variant="bodyStrong" style={styles.flex}>
              Everything stays on this phone
            </AppText>
          </Row>
          <AppText variant="body" muted>
            Flopop has no servers. A backup is a single file you keep yourself — save it to your storage, email it to
            yourself, or move it to a new phone.
          </AppText>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <AppText variant="heading">Backup file</AppText>
          <TextField
            label="Passphrase (optional)"
            value={passphrase}
            onChangeText={setPassphrase}
            placeholder="Leave empty for an unencrypted file"
            helper="With a passphrase the file is encrypted (AES-256). Keep it safe — it cannot be recovered."
          />
          <Button
            title="Create & share backup"
            icon="database-export-outline"
            fullWidth
            loading={busy === 'export'}
            onPress={onExport}
          />
        </Card>

        <Card style={{ gap: spacing.md }}>
          <AppText variant="heading">Restore</AppText>
          <AppText variant="body" muted>
            Choose a backup file created by Flopop. This replaces the data currently on this phone.
          </AppText>
          <Button
            title="Choose backup file"
            icon="database-import-outline"
            variant="secondary"
            fullWidth
            loading={busy === 'import'}
            onPress={onImport}
          />
        </Card>

        <Card>
          <Row gap={spacing.md}>
            <MaterialCommunityIcons name="alert-outline" size={20} color={colors.warning} />
            <AppText variant="caption" muted style={styles.flex}>
              An unencrypted backup contains sensitive health data in plain text. Only keep it somewhere you trust.
            </AppText>
          </Row>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
});
