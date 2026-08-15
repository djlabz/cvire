import React from 'react';
import { Briefcase, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { BulletItem, DisplayMode, SectionItem } from '../../../types/cv';
import { TagsItemForm, CompactItemForm, DetailedItemForm } from './ItemForms';

interface SectionItemCardProps {
  item: SectionItem;
  displayMode: DisplayMode;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDelete: () => void;
  onUpdateItem: (partial: Partial<SectionItem>) => void;
  onUpdateBullet: (bulletId: string, targetIdx: number, partial: Partial<BulletItem>) => void;
  onAddBullet: () => void;
  onDeleteBullet: (bulletId: string, targetIdx: number) => void;
}

export const SectionItemCard: React.FC<SectionItemCardProps> = ({
  item,
  displayMode,
  isExpanded,
  onToggleExpanded,
  onDelete,
  onUpdateItem,
  onUpdateBullet,
  onAddBullet,
  onDeleteBullet,
}) => {
  return (
    <div className="bg-[#131b2e] border border-[#222f47] rounded-xl p-4 space-y-3">
      {/* Item Card Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[#222f47]/60 pb-2">
        <div
          onClick={onToggleExpanded}
          className="flex items-center gap-2 cursor-pointer flex-1"
        >
          <Briefcase className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-xs text-slate-200">
            {item.title || 'Untitled Item'}
          </span>
          {item.subtitle && (
            <span className="text-[11px] text-slate-400 font-normal">
              • {item.subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleExpanded}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Item Expanded Form - Tailored by Section displayMode */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {displayMode === 'tags' ? (
            <TagsItemForm item={item} onUpdateItem={onUpdateItem} />
          ) : displayMode === 'compact' ? (
            <CompactItemForm item={item} onUpdateItem={onUpdateItem} />
          ) : (
            <DetailedItemForm
              item={item}
              onUpdateItem={onUpdateItem}
              onUpdateBullet={onUpdateBullet}
              onAddBullet={onAddBullet}
              onDeleteBullet={onDeleteBullet}
            />
          )}
        </div>
      )}
    </div>
  );
};
