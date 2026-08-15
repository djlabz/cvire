import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createCryptoVault,
  VaultCipherRecord,
  VaultProvider,
  VaultStorage,
} from './cryptoVaultCore';

/**
 * In-memory VaultStorage. A single instance shared between two vault
 * instances simulates IndexedDB persisting across a page reload (the vault's
 * in-memory cache dies, the storage survives).
 */
function createMemoryStorage(): VaultStorage & { hasCipher(p: VaultProvider): boolean } {
  let masterKey: CryptoKey | undefined;
  const ciphers = new Map<VaultProvider, VaultCipherRecord>();

  return {
    async getMasterKey() {
      return masterKey;
    },
    async putMasterKey(key) {
      masterKey = key;
    },
    async getCipher(provider) {
      return ciphers.get(provider);
    },
    async putCipher(record) {
      ciphers.set(record.provider, record);
    },
    async deleteCipher(provider) {
      ciphers.delete(provider);
    },
    hasCipher(provider) {
      return ciphers.has(provider);
    },
  };
}

describe('cryptoVault', () => {
  it('decrypts after a simulated reload (key persisted across sessions)', async () => {
    const storage = createMemoryStorage();

    const session1 = createCryptoVault(storage);
    await session1.saveEncryptedAPIKey('gemini', 'AIzaSy-secret-123');

    // "Reload": brand-new vault instance, same persisted storage.
    const session2 = createCryptoVault(storage);
    const decrypted = await session2.getDecryptedAPIKey('gemini');

    assert.equal(decrypted, 'AIzaSy-secret-123');
    assert.equal(session2.consumeResetNotice(), false);
  });

  it('generates the master key once and reuses it', async () => {
    const storage = createMemoryStorage();
    const vault = createCryptoVault(storage);

    await vault.saveEncryptedAPIKey('gemini', 'first');
    const keyAfterFirst = await storage.getMasterKey();
    await vault.saveEncryptedAPIKey('openai', 'second');
    const keyAfterSecond = await storage.getMasterKey();

    assert.ok(keyAfterFirst);
    assert.equal(keyAfterFirst, keyAfterSecond, 'master key must not be regenerated');
  });

  it('creates the master key as non-extractable', async () => {
    const storage = createMemoryStorage();
    const vault = createCryptoVault(storage);

    await vault.saveEncryptedAPIKey('gemini', 'whatever');
    const key = await storage.getMasterKey();

    assert.ok(key);
    assert.equal(key.extractable, false);
  });

  it('purges orphaned ciphertext and raises the reset notice', async () => {
    // Ciphertext written by a key that was never persisted (the pre-fix bug).
    const lostKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedKey = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      lostKey,
      new TextEncoder().encode('unreachable-secret')
    );

    const storage = createMemoryStorage();
    await storage.putCipher({ provider: 'gemini', encryptedKey, iv, updatedAt: Date.now() });

    const vault = createCryptoVault(storage);
    const decrypted = await vault.getDecryptedAPIKey('gemini');

    assert.equal(decrypted, null);
    assert.equal(storage.hasCipher('gemini'), false, 'orphaned ciphertext must be purged');
    assert.equal(vault.consumeResetNotice(), true, 'reset notice must be raised');
    assert.equal(vault.consumeResetNotice(), false, 'notice is consumed on read');
  });

  it('returns null without noise when no key was ever saved', async () => {
    const vault = createCryptoVault(createMemoryStorage());
    assert.equal(await vault.getDecryptedAPIKey('gemini'), null);
    assert.equal(vault.consumeResetNotice(), false);
  });

  it('round-trips unicode secrets', async () => {
    const storage = createMemoryStorage();
    const vault = createCryptoVault(storage);
    const secret = 'chave-π-🔐-ção';

    await vault.saveEncryptedAPIKey('openai', secret);
    assert.equal(await createCryptoVault(storage).getDecryptedAPIKey('openai'), secret);
  });
});
