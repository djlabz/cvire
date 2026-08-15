import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BulletItem, SectionItem } from '../../../types/cv';
import { BulletItemRow } from './BulletItemRow';

interface ItemFormProps {
  item: SectionItem;
  onUpdateItem: (partial: Partial<SectionItem>) => void;
}

/** TAGS MODE FORM (Exclusive for Tags displayMode) */
export const TagsItemForm: React.FC<ItemFormProps> = ({ item, onUpdateItem }) => {
  const { t } = useTranslation();
  // Draft keeps the raw comma text while typing (so "React, " isn't eagerly reparsed).
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] text-slate-400 font-medium mb-1">
          Category / Group Title
        </label>
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdateItem({ title: e.target.value })}
          placeholder="e.g. Programming & Databases"
          className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all text-xs"
        />
      </div>

      <div>
        <label className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-blue-400" />
          <span>{t('editor.tags')}</span>
        </label>
        <input
          type="text"
          value={draft !== undefined && draft !== null ? draft : (item.tags || []).join(', ')}
          onChange={(e) => {
            const val = e.target.value;
            setDraft(val);
            const parsed = val
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            onUpdateItem({ tags: parsed });
          }}
          onBlur={() => setDraft(null)}
          placeholder={t('editor.tagsPlaceholder')}
          className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none text-xs transition-all"
        />
      </div>
    </div>
  );
};

const DateAndLinkFields: React.FC<ItemFormProps & { datePlaceholders: [string, string] }> = ({
  item,
  onUpdateItem,
  datePlaceholders,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-[11px] text-slate-400 font-medium mb-1">
          {t('editor.startDate')}
        </label>
        <input
          type="text"
          value={item.startDate || ''}
          onChange={(e) => onUpdateItem({ startDate: e.target.value })}
          placeholder={datePlaceholders[0]}
          className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-[11px] text-slate-400 font-medium mb-1">
          {t('editor.endDate')}
        </label>
        <input
          type="text"
          value={item.current ? t('editor.present') : item.endDate || ''}
          onChange={(e) => onUpdateItem({ endDate: e.target.value })}
          disabled={item.current}
          placeholder={datePlaceholders[1]}
          className={`w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all ${
            item.current ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        />
      </div>

      <div>
        <label className="block text-[11px] text-slate-400 font-medium mb-1">
          {t('editor.linkUrl')}
        </label>
        <input
          type="text"
          value={item.linkUrl || ''}
          onChange={(e) => onUpdateItem({ linkUrl: e.target.value })}
          placeholder="github.com/org/repo"
          className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all"
        />
      </div>
    </div>
  );
};

/** COMPACT MODE FORM (Title, Subtitle, Start Date, End Date, Link URL) */
export const CompactItemForm: React.FC<ItemFormProps> = ({ item, onUpdateItem }) => {
  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            Title / Degree / Language
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onUpdateItem({ title: e.target.value })}
            placeholder="e.g. AWS Certified Engineer / English"
            className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            Subtitle / Institution / Level
          </label>
          <input
            type="text"
            value={item.subtitle || ''}
            onChange={(e) => onUpdateItem({ subtitle: e.target.value })}
            placeholder="e.g. Amazon Web Services / Native"
            className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all"
          />
        </div>
      </div>

      <DateAndLinkFields item={item} onUpdateItem={onUpdateItem} datePlaceholders={['e.g. Jan 2022', 'e.g. Dec 2025']} />
    </div>
  );
};

interface DetailedItemFormProps extends ItemFormProps {
  onUpdateBullet: (bulletId: string, targetIdx: number, partial: Partial<BulletItem>) => void;
  onAddBullet: () => void;
  onDeleteBullet: (bulletId: string, targetIdx: number) => void;
}

/** BULLETS / DETAILED MODE FORM */
export const DetailedItemForm: React.FC<DetailedItemFormProps> = ({
  item,
  onUpdateItem,
  onUpdateBullet,
  onAddBullet,
  onDeleteBullet,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            {t('editor.itemTitle')}
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onUpdateItem({ title: e.target.value })}
            placeholder="e.g. Senior Data Engineer"
            className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-medium mb-1">
            {t('editor.itemSubtitle')}
          </label>
          <input
            type="text"
            value={item.subtitle || ''}
            onChange={(e) => onUpdateItem({ subtitle: e.target.value })}
            placeholder="e.g. Global Automotive"
            className="w-full bg-[#0d1322] border border-[#222f47] focus:border-blue-500 rounded-lg px-3 py-1.5 text-slate-200 outline-none transition-all"
          />
        </div>
      </div>

      <DateAndLinkFields item={item} onUpdateItem={onUpdateItem} datePlaceholders={['May 2025', 'Present']} />

      {/* Bullet Points Editor */}
      <div className="space-y-2 pt-2 border-t border-[#222f47]/50">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300">
            {t('editor.bulletPoints')} ({(item.bulletItems || []).length})
          </label>
          <button
            type="button"
            onClick={onAddBullet}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('editor.addBullet')}</span>
          </button>
        </div>

        <div className="space-y-2">
          {(item.bulletItems || []).map((bullet, bIdx) => (
            <BulletItemRow
              key={bullet.id || `b-idx-${bIdx}`}
              bullet={bullet}
              onUpdate={(partial) => onUpdateBullet(bullet.id, bIdx, partial)}
              onDelete={() => onDeleteBullet(bullet.id, bIdx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
