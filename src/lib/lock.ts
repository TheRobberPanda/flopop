import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { hashSecret, verifySecret } from './crypto';

const SALT_KEY = 'flopop.pin.salt';
const HASH_KEY = 'flopop.pin.hash';
const LOCK_KEY = 'flopop.lock.enabled';

export async function isLockEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(LOCK_KEY)) === '1';
}

export async function setPin(pin: string): Promise<void> {
  const { salt, hash } = hashSecret(pin);
  await SecureStore.setItemAsync(SALT_KEY, salt);
  await SecureStore.setItemAsync(HASH_KEY, hash);
  await SecureStore.setItemAsync(LOCK_KEY, '1');
}

export async function verifyPin(pin: string): Promise<boolean> {
  const salt = await SecureStore.getItemAsync(SALT_KEY);
  const hash = await SecureStore.getItemAsync(HASH_KEY);
  if (!salt || !hash) return true;
  return verifySecret(pin, salt, hash);
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(SALT_KEY);
  await SecureStore.deleteItemAsync(HASH_KEY);
  await SecureStore.setItemAsync(LOCK_KEY, '0');
}

export async function hasBiometrics(): Promise<boolean> {
  const hardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hardware && enrolled;
}

export async function authenticateBiometric(): Promise<boolean> {
  if (!(await hasBiometrics())) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Flopop',
    cancelLabel: 'Use PIN',
    disableDeviceFallback: true,
  });
  return result.success;
}
