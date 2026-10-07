import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { base64, utf8 } from '@scure/base';
import * as Crypto from 'expo-crypto';

const PREFIX = 'FLO1.';
const KDF_ITERATIONS = 150_000;
const BLOCK_SIZE = 16;
const NONCE_SIZE = 12;
const KEY_SIZE = 32;

function deriveKey(passphrase: string, salt: Uint8Array): Uint8Array {
  return pbkdf2(sha256, utf8.decode(passphrase), salt, { c: KDF_ITERATIONS, dkLen: KEY_SIZE });
}

export function encryptString(plain: string, passphrase: string): string {
  const salt = Crypto.getRandomBytes(BLOCK_SIZE);
  const nonce = Crypto.getRandomBytes(NONCE_SIZE);
  const key = deriveKey(passphrase, salt);
  const ciphertext = gcm(key, nonce).encrypt(utf8.decode(plain));
  const combined = new Uint8Array(salt.length + nonce.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(nonce, salt.length);
  combined.set(ciphertext, salt.length + nonce.length);
  return PREFIX + base64.encode(combined);
}

export function isEncrypted(token: string): boolean {
  return token.startsWith(PREFIX);
}

export function decryptString(token: string, passphrase: string): string {
  if (!token.startsWith(PREFIX)) throw new Error('This file is not an encrypted Flopop backup.');
  const raw = base64.decode(token.slice(PREFIX.length));
  const salt = raw.slice(0, BLOCK_SIZE);
  const nonce = raw.slice(BLOCK_SIZE, BLOCK_SIZE + NONCE_SIZE);
  const ciphertext = raw.slice(BLOCK_SIZE + NONCE_SIZE);
  const key = deriveKey(passphrase, salt);
  return utf8.encode(gcm(key, nonce).decrypt(ciphertext));
}

export function hashSecret(secret: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex ? hexToBytes(saltHex) : Crypto.getRandomBytes(BLOCK_SIZE);
  const hash = pbkdf2(sha256, utf8.decode(secret), salt, { c: 60_000, dkLen: KEY_SIZE });
  return { salt: bytesToHex(salt), hash: bytesToHex(hash) };
}

export function verifySecret(secret: string, saltHex: string, expectedHashHex: string): boolean {
  const { hash } = hashSecret(secret, saltHex);
  return hash === expectedHashHex;
}
