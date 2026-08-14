/**
 * Storage-agnostic AES-GCM vault for BYOK API keys.
 *
 * The master CryptoKey is generated ONCE with extractable: false and persisted
 * through the injected storage (IndexedDB structured clone supports CryptoKey
 * natively), so ciphertexts survive page reloads. If a ciphertext can no
 * longer be decrypted (e.g. it was written by a pre-fix build whose in-memory
 * key died with the session), it is detected, purged, and flagged so the UI
 * can ask the user to re-enter the key.
 */

export type VaultProvider = 'gemini' | 'openai';

export interface VaultCipherRecord {
  provider: VaultProvider;
  encryptedKey: ArrayBuffer;
  iv: Uint8Array;
  updatedAt: number;
}

export interface VaultStorage {
  getMasterKey(): Promise<CryptoKey | undefined>;
  putMasterKey(key: CryptoKey): Promise<void>;
  getCipher(provider: VaultProvider): Promise<VaultCipherRecord | undefined>;
  putCipher(record: VaultCipherRecord): Promise<void>;
  deleteCipher(provider: VaultProvider): Promise<void>;
}

export interface CryptoVault {
  saveEncryptedAPIKey(provider: VaultProvider, plainKey: string): Promise<void>;
  getDecryptedAPIKey(provider: VaultProvider): Promise<string | null>;
  /** True once an undecryptable (orphaned) ciphertext was purged. Cleared on read. */
  consumeResetNotice(): boolean;
}

export function createCryptoVault(storage: VaultStorage, cryptoApi: Crypto = globalThis.crypto): CryptoVault {
  let cachedKey: CryptoKey | null = null;
  let resetNotice = false;

  async function getOrCreateMasterKey(): Promise<CryptoKey> {
    if (cachedKey) return cachedKey;

    const existing = await storage.getMasterKey();
    if (existing) {
      cachedKey = existing;
      return existing;
    }

    const key = await cryptoApi.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false, // non-extractable: the raw key material can never leave the browser
      ['encrypt', 'decrypt']
    );

    await storage.putMasterKey(key);
    cachedKey = key;
    return key;
  }

  return {
    async saveEncryptedAPIKey(provider, plainKey) {
      const masterKey = await getOrCreateMasterKey();
      const iv = cryptoApi.getRandomValues(new Uint8Array(12));
      const encodedKey = new TextEncoder().encode(plainKey);

      const encryptedKey = await cryptoApi.subtle.encrypt(
        { name: 'AES-GCM', iv },
        masterKey,
        encodedKey
      );

      await storage.putCipher({ provider, encryptedKey, iv, updatedAt: Date.now() });
    },

    async getDecryptedAPIKey(provider) {
      const record = await storage.getCipher(provider);
      if (!record) return null;

      const masterKey = await getOrCreateMasterKey();

      try {
        const decrypted = await cryptoApi.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(record.iv) },
          masterKey,
          record.encryptedKey
        );
        return new TextDecoder().decode(decrypted);
      } catch {
        // Orphaned ciphertext: encrypted by a key that no longer exists.
        // Purge it so the UI can ask the user for the key again.
        await storage.deleteCipher(provider);
        resetNotice = true;
        return null;
      }
    },

    consumeResetNotice() {
      const value = resetNotice;
      resetNotice = false;
      return value;
    },
  };
}
