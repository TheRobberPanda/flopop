import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { exportData, importData, validateBackup, type BackupPayload } from '@/db/repositories/backup';
import { today } from '@/lib/dates';

import { decryptString, encryptString, isEncrypted } from './crypto';

export interface BackupResult {
  uri: string;
  shared: boolean;
}

export async function createBackupFile(passphrase?: string): Promise<BackupResult> {
  const payload = exportData();
  const raw = JSON.stringify(payload);
  const content = passphrase ? encryptString(raw, passphrase) : raw;
  const filename = `flopop-backup-${today()}.flopop`;
  const file = new File(Paths.document, filename);
  if (file.exists) file.delete();
  file.create({ intermediates: true });
  file.write(content);
  return { uri: file.uri, shared: false };
}

export async function shareBackup(uri: string, title = 'Export Flopop backup'): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, {
    mimeType: 'application/octet-stream',
    dialogTitle: title,
    UTI: 'public.data',
  });
  return true;
}

export async function pickBackup(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const file = new File(result.assets[0].uri);
  return file.textSync();
}

export function importBackup(content: string, passphrase?: string): BackupPayload {
  let raw = content;
  if (isEncrypted(content)) {
    if (!passphrase) throw new Error('This backup is encrypted. Enter its passphrase.');
    raw = decryptString(content, passphrase);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That file could not be read as a Flopop backup.');
  }
  if (!validateBackup(parsed)) throw new Error('That file is not a valid Flopop backup.');
  importData(parsed);
  return parsed;
}
