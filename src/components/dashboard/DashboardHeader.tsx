import React, { useRef } from 'react';
import { Plus, Sparkles, Search, Globe, Download, Upload, FileCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCVStore } from '../../store/useCVStore';
import { CvireLogo } from '../common/CvireLogo';
import { exportAllResumesJSON, importResumesJSON, downloadAITemplateJSON } from '../../services/backupService';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenDemoModal: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenDemoModal,
}) => {
  const { t, i18n } = useTranslation();
  const { createProfile } = useCVStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en-US' ? 'pt-BR' : 'en-US';
    i18n.changeLanguage(nextLang);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const count = await importResumesJSON(file);
      alert(`Success! ${count} resume(s) imported into cvire.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON file format';
      alert(`Import Failed: ${message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="bg-[#131b2e] border-b border-[#222f47] px-6 py-5 sticky top-0 z-30 shadow-md">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title Brand with Logo */}
        <div>
          <CvireLogo size={36} />
          <p className="text-xs text-slate-400 mt-1">{t('app.subtitle')}</p>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={toggleLanguage}
            className="p-2.5 rounded-xl bg-[#0d1322] border border-[#222f47] hover:border-slate-500 text-slate-300 transition-all flex items-center gap-2 text-xs font-medium cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>{i18n.language === 'en-US' ? 'EN' : 'PT'}</span>
          </button>

          {/* Download AI Schema Template JSON */}
          <button
            onClick={() => downloadAITemplateJSON()}
            className="px-3 py-2.5 rounded-xl bg-[#0d1322] border border-[#222f47] hover:border-purple-500 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Baixar Modelo JSON de exemplo para a IA preencher seu currículo"
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span className="hidden xl:inline">{t('dashboard.downloadAiJson')}</span>
          </button>

          {/* Export JSON Backup */}
          <button
            onClick={() => {
              exportAllResumesJSON().catch((err) => {
                console.error('[BACKUP] Export failed:', err);
                alert('Backup export failed. Please check the browser console.');
              });
            }}
            className="px-3 py-2.5 rounded-xl bg-[#0d1322] border border-[#222f47] hover:border-emerald-500 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title={t('dashboard.exportJson')}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">{t('dashboard.exportJson')}</span>
          </button>

          {/* Import JSON Backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2.5 rounded-xl bg-[#0d1322] border border-[#222f47] hover:border-amber-500 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title={t('dashboard.importJson')}
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">{t('dashboard.importJson')}</span>
          </button>

          <button
            onClick={onOpenDemoModal}
            className="px-3.5 py-2.5 rounded-xl bg-[#0d1322] border border-[#222f47] hover:border-indigo-500 text-slate-200 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">{t('dashboard.demoProfiles')}</span>
          </button>

          <button
            onClick={() => createProfile()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dashboard.newResume')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
