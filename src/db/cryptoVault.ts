import { db } from './cvDatabase';
import { createCryptoVault, VaultProvider, VaultStorage } from './cryptoVaultCore';

/**
 * Browser vault backed by Dexie/IndexedDB. The AES-GCM master key is stored
 * as a non-extractable CryptoKey via structured clone and reused across
 * sessions — see cryptoVaultCore.ts for the full behavior contract.
 */

const MASTER_KEY_ID = 'vault-master-key';
const RESET_NOTICE_STORAGE_KEY = 'cvire:vault-reset-notice';

const dexieStorage: VaultStorage = {
  async getMasterKey() {
    const record = await db.cryptoKeys.get(MASTER_KEY_ID);
    return record?.key;
  },
  async putMasterKey(key) {
    await db.cryptoKeys.put({ id: MASTER_KEY_ID, key, createdAt: Date.now() });
  },
  async getCipher(provider) {
    return db.encryptedKeys.get(provider);
  },
  async putCipher(record) {
    await db.encryptedKeys.put(record);
  },
  async deleteCipher(provider) {
    await db.encryptedKeys.delete(provider);
  },
};

const vault = createCryptoVault(dexieStorage);

export async function saveEncryptedAPIKey(provider: VaultProvider, plainKey: string): Promise<void> {
  await vault.saveEncryptedAPIKey(provider, plainKey);
  clearVaultResetNotice();
}

export async function getDecryptedAPIKey(provider: VaultProvider): Promise<string | null> {
  const value = await vault.getDecryptedAPIKey(provider);
  if (vault.consumeResetNotice()) {
    try {
      localStorage.setItem(RESET_NOTICE_STORAGE_KEY, '1');
    } catch {
      // Storage may be unavailable (private mode) — the in-session notice was consumed above.
    }
  }
  return value;
}

/** True when a previously saved key had to be purged and must be re-entered. */
export function hasVaultResetNotice(): boolean {
  try {
    return localStorage.getItem(RESET_NOTICE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearVaultResetNotice(): void {
  try {
    localStorage.removeItem(RESET_NOTICE_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
