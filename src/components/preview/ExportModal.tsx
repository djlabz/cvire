import React, { useState } from 'react';
import { X, FileText, Image as ImageIcon, Download, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/useUIStore';
import { useCVStore } from '../../store/useCVStore';
import { exportResumeToPDF } from '../../services/exportService';
import { exportResumeToAtsPdf } from '../../services/atsPdfExport';

type ExportMode = 'ats' | 'visual';

function toFilename(title: string, suffix: string): string {
  const slug = title.toLowerCase().replace(/\s+/g, '-') || 'resume';
  return `${slug}${suffix}.pdf`;
}

export const ExportModal: React.FC = () => {
  const { t } = useTranslation();
  const { activeModal, closeModal } = useUIStore();
  const activeProfile = useCVStore((state) => state.activeProfile);
  const [busyMode, setBusyMode] = useState<ExportMode | null>(null);
  const [error, setError] = useState(false);

  if (activeModal !== 'export-pdf' || !activeProfile) return null;

  const handleExport = async (mode: ExportMode) => {
    if (busyMode) return;
    setBusyMode(mode);
    setError(false);
    try {
      if (mode === 'ats') {
        await exportResumeToAtsPdf(activeProfile, toFilename(activeProfile.title, '-ats'));
      } else {
        await exportResumeToPDF(toFilename(activeProfile.title, ''));
      }
      closeModal();
    } catch (err) {
      console.error('[EXPORT_MODAL] Export failed:', err);
      setError(true);
    } finally {
      setBusyMode(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={t('export.title')}
    >
      <div className="bg-[#131b2e] border border-[#222f47] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222f47] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t('export.title')}</h2>
              <p className="text-xs text-slate-400">{t('export.subtitle')}</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            aria-label={t('common.close')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#0d1322] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleExport('ats')}
            disabled={busyMode !== null}
            className="w-full text-left p-4 rounded-2xl bg-blue-500/10 border border-blue-500/40 hover:bg-blue-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="flex items-start gap-3">
              {busyMode === 'ats' ? (
                <LoaderCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 animate-spin" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{t('export.atsTitle')}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {t('export.recommended')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('export.atsDesc')}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleExport('visual')}
            disabled={busyMode !== null}
            className="w-full text-left p-4 rounded-2xl bg-[#0d1322] border border-[#222f47] hover:border-slate-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="flex items-start gap-3">
              {busyMode === 'visual' ? (
                <LoaderCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-sm font-bold text-slate-100">{t('export.visualTitle')}</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('export.visualDesc')}</p>
              </div>
            </div>
          </button>

          {error && (
            <p className="text-xs text-rose-400 font-medium" role="alert">
              {t('export.error')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
