import React, { useEffect, useState } from 'react';
import { useCVStore } from './store/useCVStore';
import { useUIStore } from './store/useUIStore';
import { useTranslation } from 'react-i18next';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { ProfileGrid } from './components/dashboard/ProfileGrid';
import { EditorShell } from './components/editor/EditorShell';
import { A4PaperCanvas } from './components/preview/A4PaperCanvas';
import { ViewportToolbar } from './components/preview/ViewportToolbar';
import { ATSScoreGauge } from './components/ats/ATSScoreGauge';
import { ATSPlainPreviewModal } from './components/ats/ATSPlainPreviewModal';
import { JobMatcherDrawer } from './components/ai/JobMatcherDrawer';
import { APIKeyModal } from './components/ai/APIKeyModal';
import { DemoTemplateModal } from './components/dashboard/DemoTemplateModal';
import { TemplatePickerModal } from './components/templates/TemplatePickerModal';
import { ThemeCustomizerDrawer } from './components/editor/ThemeCustomizerDrawer';
import { VersionHistoryDrawer } from './components/dashboard/VersionHistoryDrawer';
import { CompareModal } from './components/dashboard/CompareModal';
import { AnalyticsModal } from './components/dashboard/AnalyticsModal';
import { ExportModal } from './components/preview/ExportModal';
import { ArrowLeft, LayoutTemplate, Palette, History, BarChart3, Pencil } from 'lucide-react';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const { initStore, activeProfile, selectProfile, updateProfileTitle, isLoading } = useCVStore();
  const { viewMode, openModal } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');

  useEffect(() => {
    initStore();
  }, [initStore]);

  const handleSelectProfile = (id: string) => {
    selectProfile(id);
    setCurrentView('editor');
  };

  const handleExportPDF = () => {
    openModal('export-pdf');
  };

  const handleDashboardExportPDF = (profile: { id: string; title: string }) => {
    selectProfile(profile.id);
    setCurrentView('editor');
    // Let the editor preview mount before offering the export modes (the
    // visual mode rasterizes the on-screen .a4-paper element).
    setTimeout(() => {
      openModal('export-pdf');
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing cvire local database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {currentView === 'dashboard' ? (
        /* Dashboard View */
        <div className="min-h-screen flex flex-col">
          <DashboardHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenDemoModal={() => setIsDemoModalOpen(true)}
          />
          <main className="flex-1">
            <ProfileGrid
              searchQuery={searchQuery}
              onSelectProfile={handleSelectProfile}
              onExportPDF={handleDashboardExportPDF}
            />
          </main>
        </div>
      ) : (
        /* Editor & Preview Split View */
        <div className="min-h-screen flex flex-col">
          {/* Top Bar Navigation */}
          <div className="bg-[#131b2e] border-b border-[#222f47] px-4 sm:px-6 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-3 py-1.5 rounded-xl bg-[#0d1322] border border-[#222f47] hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('topbar.dashboard')}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#0d1322] px-3 py-1 rounded-xl border border-[#222f47] focus-within:border-blue-500 transition-all">
              <Pencil className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={activeProfile?.title || ''}
                onChange={(e) => updateProfileTitle(e.target.value)}
                placeholder={t('topbar.resumeTitlePlaceholder')}
                className="bg-transparent text-xs sm:text-sm font-bold text-slate-100 outline-none w-36 sm:w-52"
              />
              <span className="text-[10px] text-slate-500 shrink-0">{t('topbar.saved')}</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
              <button
                onClick={() => openModal('template-picker')}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>{t('topbar.templates')}</span>
              </button>

              <button
                onClick={() => openModal('theme-customizer')}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{t('topbar.theme')}</span>
              </button>

              <button
                onClick={() => openModal('analytics')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{t('topbar.stats')}</span>
              </button>

              <button
                onClick={() => openModal('version-history')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>{t('topbar.history')}</span>
              </button>
            </div>
          </div>

          {/* Viewport Toolbar */}
          <ViewportToolbar onExportPDF={handleExportPDF} />

          {/* Split Body */}
          <div className="flex-1 flex overflow-hidden">
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'w-1/2 border-r border-[#222f47] overflow-y-auto' : 'w-full overflow-y-auto flex justify-center'}>
                <EditorShell />
              </div>
            )}

            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'w-1/2 overflow-y-auto' : 'w-full overflow-y-auto'}>
                <A4PaperCanvas />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Modals */}
      <TemplatePickerModal />
      <ThemeCustomizerDrawer />
      <AnalyticsModal />
      <VersionHistoryDrawer />
      <CompareModal />
      <ATSScoreGauge />
      <ATSPlainPreviewModal />
      <JobMatcherDrawer />
      <APIKeyModal />
      <ExportModal />
      <DemoTemplateModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelect={handleSelectProfile}
      />
    </div>
  );
};
