import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { saveEncryptedAPIKey, hasVaultResetNotice } from '../../db/cryptoVault';
import { useUIStore } from '../../store/useUIStore';

export const APIKeyModal: React.FC = () => {
  const { t } = useTranslation();
  const { activeModal, closeModal } = useUIStore();
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (activeModal !== 'api-key-byok') return null;

  const showResetNotice = hasVaultResetNotice();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;

    await saveEncryptedAPIKey('gemini', geminiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closeModal();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-[#222f47] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222f47] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">BYOK Key Vault</h2>
              <p className="text-xs text-slate-400">Bring Your Own Key for AI Features</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#0d1322] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {showResetNotice && (
            <div
              className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-300"
              role="alert"
            >
              <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{t('apiKey.resetNotice')}</span>
            </div>
          )}
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Your API key is encrypted locally using Web Crypto API (AES-GCM 256-bit) and stored strictly in your browser's IndexedDB.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved & Encrypted!</span>
              </>
            ) : (
              <span>Save Encrypted Key</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
