import React from 'react';
import {
  ArrowDown, ArrowUp, ChevronDown, ChevronUp, Eye, EyeOff, LayoutList, ListFilter,
  Plus, Tag, Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BulletItem, CVSection, SectionItem, getEffectiveDisplayMode } from '../../../types/cv';
import { SectionItemCard } from './SectionItemCard';

interface SectionCardProps {
  section: CVSection;
  index: number;
  totalSections: number;
  isExpanded: boolean;
  expandedItems: Record<string, boolean>;
  onToggleItemExpanded: (itemId: string) => void;
  onToggleExpanded: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onToggleVisibility: () => void;
  onToggleColumn: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
  onSetDisplayMode: (mode: 'tags' | 'bullets' | 'compact') => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, partial: Partial<SectionItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateBullet: (item: SectionItem, bulletId: string, targetIdx: number, partial: Partial<BulletItem>) => void;
  onAddBullet: (item: SectionItem) => void;
  onDeleteBullet: (item: SectionItem, bulletId: string, targetIdx: number) => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section: sec,
  index,
  totalSections,
  isExpanded,
  expandedItems,
  onToggleItemExpanded,
  onToggleExpanded,
  onMove,
  onToggleVisibility,
  onToggleColumn,
  onDelete,
  onUpdateTitle,
  onSetDisplayMode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateBullet,
  onAddBullet,
  onDeleteBullet,
}) => {
  const { t } = useTranslation();
  const sectionDisplayMode = getEffectiveDisplayMode(sec);

  return (
    <div
      className={`bg-[#131b2e] border rounded-2xl transition-all overflow-hidden ${
        sec.visible ? 'border-[#222f47]' : 'border-[#222f47]/50 opacity-60'
      }`}
    >
      {/* Section Header */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-[#131b2e]">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          {/* Up / Down Reorder Arrows */}
          <div className="flex items-center gap-1 shrink-0 bg-[#0d1322] p-1 rounded-lg border border-[#222f47]">
            <button
              type="button"
              onClick={() => onMove('up')}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer transition-colors"
              title="Move Section Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove('down')}
              disabled={index === totalSections - 1}
              className="p-1 text-slate-400 hover:text-blue-400 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer transition-colors"
              title="Move Section Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            value={sec.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="bg-transparent font-bold text-sm text-slate-100 outline-none border-b border-transparent focus:border-blue-500 px-1 transition-all flex-1 min-w-0"
          />

          {/* Interactive Column Switcher Button */}
          <button
            type="button"
            onClick={onToggleColumn}
            title={`Click to move section to ${sec.column === 'main' ? 'Sidebar' : 'Main'} column`}
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border transition-all cursor-pointer shrink-0 ${
              sec.column === 'main'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
            }`}
          >
            {sec.column}
          </button>
        </div>

        {/* Section Level Display Mode Selector (Tags | Bullets | Compact) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0d1322] p-1 rounded-lg border border-[#222f47]">
            <button
              type="button"
              title="Render Section as Tags"
              onClick={() => onSetDisplayMode('tags')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                sectionDisplayMode === 'tags' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Tags</span>
            </button>

            <button
              type="button"
              title="Render Section as Bullets"
              onClick={() => onSetDisplayMode('bullets')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                sectionDisplayMode === 'bullets' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3 h-3" />
              <span>Bullets</span>
            </button>

            <button
              type="button"
              title="Render Section as Compact"
              onClick={() => onSetDisplayMode('compact')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                sectionDisplayMode === 'compact' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3 h-3" />
              <span>Compact</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleVisibility}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Toggle Visibility"
            >
              {sec.visible ? <Eye className="w-4 h-4 text-blue-400" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Section"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleExpanded}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse Section' : 'Expand Section'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Items Expanded Body */}
      {isExpanded && (
        <div className="p-4 border-t border-[#222f47] bg-[#0d1322]/50 space-y-4">
          {sec.items.map((item) => (
            <SectionItemCard
              key={item.id}
              item={item}
              displayMode={sectionDisplayMode}
              isExpanded={expandedItems[item.id] ?? true}
              onToggleExpanded={() => onToggleItemExpanded(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              onUpdateItem={(partial) => onUpdateItem(item.id, partial)}
              onUpdateBullet={(bulletId, targetIdx, partial) => onUpdateBullet(item, bulletId, targetIdx, partial)}
              onAddBullet={() => onAddBullet(item)}
              onDeleteBullet={(bulletId, targetIdx) => onDeleteBullet(item, bulletId, targetIdx)}
            />
          ))}

          <button
            onClick={onAddItem}
            className="w-full py-2.5 border border-dashed border-[#222f47] hover:border-blue-500 text-slate-400 hover:text-blue-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('editor.addItem')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
