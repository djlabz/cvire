import React from 'react';
import { Star, Copy, Trash2, FileText, ArrowRight, Download, FileCode, Archive } from 'lucide-react';
import { CVProfile } from '../../types/cv';
import { useCVStore } from '../../store/useCVStore';
import { useTranslation } from 'react-i18next';
import { exportSingleResumeJSON } from '../../services/backupService';

interface ProfileCardProps {
  profile: CVProfile;
  onSelect: (id: string) => void;
  onExportPDF?: (profile: CVProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSelect, onExportPDF }) => {
  const { t } = useTranslation();
  const { toggleFavorite, toggleArchive, duplicateProfile, deleteProfile } = useCVStore();

  const formattedDate = new Date(profile.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onSelect(profile.id)}
      className="group bg-[#131b2e] border border-[#222f47] hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Bar */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {profile.templateId}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(profile.id);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              profile.isFavorite
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Info */}
        <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
          {profile.title}
        </h3>
        <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-3">
          {profile.personal.fullName || 'No Candidate Name'} • {profile.personal.jobTitle || 'No Title'}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#222f47]/60 flex items-center justify-between mt-4">
        <span className="text-[11px] text-slate-500 font-medium">
          {t('dashboard.lastEdited')}: {formattedDate}
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onExportPDF && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExportPDF(profile);
              }}
              title="Download PDF"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              exportSingleResumeJSON(profile);
            }}
            title={t('dashboard.exportJson')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateProfile(profile.id);
            }}
            title={t('dashboard.duplicate')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleArchive(profile.id);
            }}
            title={profile.isArchived ? t('dashboard.unarchive') : t('dashboard.archive')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              profile.isArchived
                ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(t('dashboard.deleteConfirm', { title: profile.title }))) {
                deleteProfile(profile.id);
              }
            }}
            title={t('common.delete')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="p-1.5 rounded-lg text-blue-400 group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
