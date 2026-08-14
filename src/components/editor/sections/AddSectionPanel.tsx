import React, { useState } from 'react';
import { Award, Briefcase, FolderGit2, GraduationCap, Languages as LangIcon, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DisplayMode, SectionType } from '../../../types/cv';

interface AddSectionPanelProps {
  onAdd: (type: SectionType, defaultTitle: string, defaultDisplayMode?: DisplayMode) => void;
  onCancel: () => void;
}

const PRESETS: {
  type: SectionType;
  title: string;
  mode: DisplayMode;
  label: string;
  Icon: React.ElementType;
  hoverClasses: string;
  iconClasses: string;
}[] = [
  { type: 'certifications', title: 'Certifications', mode: 'compact', label: 'Certifications', Icon: Award, hoverClasses: 'hover:border-amber-500 hover:text-amber-400', iconClasses: 'text-amber-400' },
  { type: 'projects', title: 'Featured Projects', mode: 'bullets', label: 'Projects', Icon: FolderGit2, hoverClasses: 'hover:border-purple-500 hover:text-purple-400', iconClasses: 'text-purple-400' },
  { type: 'skills', title: 'Technical Skills', mode: 'tags', label: 'Technical Skills', Icon: Wrench, hoverClasses: 'hover:border-blue-500 hover:text-blue-400', iconClasses: 'text-blue-400' },
  { type: 'education', title: 'Education', mode: 'compact', label: 'Education', Icon: GraduationCap, hoverClasses: 'hover:border-emerald-500 hover:text-emerald-400', iconClasses: 'text-emerald-400' },
  { type: 'languages', title: 'Languages', mode: 'compact', label: 'Languages', Icon: LangIcon, hoverClasses: 'hover:border-indigo-500 hover:text-indigo-400', iconClasses: 'text-indigo-400' },
  { type: 'experience', title: 'Professional Experience', mode: 'bullets', label: 'Work Experience', Icon: Briefcase, hoverClasses: 'hover:border-sky-500 hover:text-sky-400', iconClasses: 'text-sky-400' },
];

export const AddSectionPanel: React.FC<AddSectionPanelProps> = ({ onAdd, onCancel }) => {
  const { t } = useTranslation();
  const [customTitleInput, setCustomTitleInput] = useState('');

  return (
    <div className="bg-[#131b2e] border border-blue-500/50 p-4 rounded-2xl space-y-3 animate-fade-in">
      <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between">
        <span>{t('editor.selectSectionType')}</span>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
        >
          {t('common.cancel')}
        </button>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRESETS.map(({ type, title, mode, label, Icon, hoverClasses, iconClasses }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type, title, mode)}
            className={`p-3 bg-[#0d1322] border border-[#222f47] ${hoverClasses} rounded-xl text-xs font-semibold text-slate-300 flex flex-col items-center gap-1.5 transition-all cursor-pointer`}
          >
            <Icon className={`w-5 h-5 ${iconClasses}`} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Custom Title Input Option */}
      <div className="pt-2 border-t border-[#222f47] flex gap-2">
        <input
          type="text"
          placeholder="Or type a Custom Section Title..."
          value={customTitleInput}
          onChange={(e) => setCustomTitleInput(e.target.value)}
          className="flex-1 bg-[#0d1322] border border-[#222f47] rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => {
            if (customTitleInput.trim()) {
              onAdd('custom', customTitleInput.trim(), 'bullets');
            }
          }}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          {t('common.add')}
        </button>
      </div>
    </div>
  );
};
