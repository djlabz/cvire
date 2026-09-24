import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileJson, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { importResumesJSON } from '../../services/backupService';

type Toast = { kind: 'success' | 'error'; title: string; detail: string };

const isFileDrag = (e: DragEvent) => !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files');

const isJsonFile = (file: File) =>
  file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

/**
 * Window-wide drag & drop target: dropping one or more cvire JSON files
 * anywhere on the page runs the same import as the header's "Import JSON".
 */
export const JsonDropZone: React.FC = () => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  // dragenter/dragleave fire for every child element crossed, so count depth.
  const depth = useRef(0);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((next: Toast) => {
    window.clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = window.setTimeout(() => setToast(null), 5000);
  }, []);

  const importFiles = useCallback(
    async (files: File[]) => {
      const jsonFiles = files.filter(isJsonFile);
      if (jsonFiles.length === 0) {
        showToast({ kind: 'error', title: t('dropzone.errorTitle'), detail: t('dropzone.notJson') });
        return;
      }

      setIsImporting(true);
      let total = 0;
      const failures: string[] = [];
      for (const file of jsonFiles) {
        try {
          total += await importResumesJSON(file);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Invalid JSON';
          failures.push(`${file.name}: ${message}`);
        }
      }
      setIsImporting(false);

      if (total > 0) {
        showToast({
          kind: 'success',
          title: t('dropzone.successTitle'),
          detail: t('dropzone.successDetail', { count: total }) + (failures.length ? ` · ${failures.join(' · ')}` : ''),
        });
      } else {
        showToast({ kind: 'error', title: t('dropzone.errorTitle'), detail: failures.join(' · ') });
      }
    },
    [showToast, t]
  );

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      depth.current += 1;
      setIsDragging(true);
    };
    const onDragOver = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };
    const onDragLeave = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      void importFiles(Array.from(e.dataTransfer?.files ?? []));
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [importFiles]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  return (
    <>
      {/* Full-screen drop overlay */}
      <div
        aria-hidden={!isDragging}
        className={`no-print fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#090d16]/75 backdrop-blur-sm transition-opacity duration-200 pointer-events-none ${
          isDragging ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`relative w-full max-w-xl h-[min(340px,60vh)] rounded-3xl bg-[#131b2e]/95 shadow-2xl shadow-black/50 flex flex-col items-center justify-center gap-4 text-center transition-all duration-200 ease-out ${
            isDragging ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'
          }`}
        >
          {/* SVG border so the dashes follow the rounded corners without clipping */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" aria-hidden>
            <rect
              x="1"
              y="1"
              rx="23"
              style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
              fill="none"
              stroke="rgb(245 158 11 / 0.6)"
              strokeWidth="1.5"
              strokeDasharray="10 8"
              className="cv-dropzone-dash"
            />
          </svg>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center cv-dropzone-float">
            <FileJson className="w-8 h-8 text-amber-400" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5 px-6">
            <h2 className="text-xl font-semibold text-slate-50">{t('dropzone.title')}</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">{t('dropzone.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Importing indicator */}
      {isImporting && (
        <div className="no-print fixed bottom-6 right-6 z-[101] flex items-center gap-3 rounded-2xl bg-[#131b2e] border border-[#222f47] px-4 py-3 shadow-2xl text-sm text-slate-200">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>{t('dropzone.importing')}</span>
        </div>
      )}

      {/* Result toast */}
      {toast && !isImporting && (
        <div
          role="status"
          className={`no-print cv-toast-in fixed bottom-6 right-6 z-[101] w-[min(380px,calc(100vw-2rem))] flex items-start gap-3 rounded-2xl bg-[#131b2e] border px-4 py-3.5 shadow-2xl ${
            toast.kind === 'success' ? 'border-emerald-500/40 shadow-emerald-500/10' : 'border-rose-500/40 shadow-rose-500/10'
          }`}
        >
          {toast.kind === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
            <p className="text-xs text-slate-400 mt-0.5 break-words">{toast.detail}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
