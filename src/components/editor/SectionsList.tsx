import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCVStore } from '../../store/useCVStore';
import { useTranslation } from 'react-i18next';
import { SectionItem, BulletItem, SectionType, DisplayMode, CVSection } from '../../types/cv';
import { AddSectionPanel } from './sections/AddSectionPanel';
import { SectionCard } from './sections/SectionCard';

export const SectionsList: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeProfile,
    toggleSectionVisibility,
    toggleSectionColumn,
    updateSection,
    reorderSections,
    deleteSection,
    addSection,
    addSectionItem,
    updateSectionItem,
    deleteSectionItem,
    updateSectionTitle,
  } = useCVStore();

  const [expandedSection, setExpandedSection] = useState<string | null>('none');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isAddingSection, setIsAddingSection] = useState(false);

  if (!activeProfile) return null;

  const sectionsList = activeProfile.sectionsOrder
    .map((id) => activeProfile.sections[id])
    .filter(Boolean);

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleAddPresetSection = (type: SectionType, defaultTitle: string, defaultDisplayMode?: DisplayMode) => {
    let mode: DisplayMode = defaultDisplayMode || 'bullets';
    if (type === 'skills') mode = 'tags';
    else if (type === 'education' || type === 'languages' || type === 'certifications') mode = 'compact';

    addSection(type, defaultTitle);

    // Set section-level displayMode on the newly created section
    setTimeout(() => {
      const active = useCVStore.getState().activeProfile;
      if (!active) return;
      const createdSecId = active.sectionsOrder[active.sectionsOrder.length - 1];
      if (createdSecId) {
        updateSection(createdSecId, { displayMode: mode, layout: { displayMode: mode } });
      }
    }, 50);

    setIsAddingSection(false);
  };

  // Reorder Sections Helper (Up / Down)
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionsList.length) return;

    const newOrder = [...activeProfile.sectionsOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    reorderSections(newOrder);
  };

  const handleAddItem = (secId: string, secType: string) => {
    const newItemId = `item-${Date.now()}`;
    let baseItem: Partial<SectionItem> = {
      title: 'New Item',
      subtitle: '',
      startDate: '',
      endDate: '',
      bulletItems: [],
      tags: [],
    };

    if (secType === 'certifications') {
      baseItem = {
        title: 'AWS Certified Solutions Architect',
        subtitle: 'Amazon Web Services',
        startDate: '2025',
        endDate: '',
        linkUrl: 'https://credly.com',
      };
    } else if (secType === 'projects') {
      baseItem = {
        title: 'Full-Stack Data Tool',
        subtitle: 'Lead Developer • Streamlit, Python, PostgreSQL',
        startDate: 'Jan 2025',
        endDate: 'Present',
        current: true,
        linkUrl: 'https://github.com',
        tags: ['Python', 'Streamlit', 'PostgreSQL'],
        bulletItems: [
          { id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, text: 'Built scalable internal data platform reducing processing time by 50%.', enabled: true },
        ],
      };
    } else if (secType === 'languages') {
      baseItem = {
        title: 'Language Name',
        subtitle: 'Proficiency Level (e.g. Native / B2)',
        startDate: '',
        endDate: '',
      };
    } else if (secType === 'education') {
      baseItem = {
        title: 'Degree / Course Name',
        subtitle: 'University / Institution',
        startDate: 'Jan 2022',
        endDate: 'Dec 2025',
      };
    } else if (secType === 'skills') {
      baseItem = {
        title: 'Skill Category',
        tags: ['Python', 'SQL', 'GCP'],
        bulletItems: [
          { id: `b-${Date.now()}-1-${Math.random().toString(36).substring(2, 7)}`, text: 'Python', enabled: true },
          { id: `b-${Date.now()}-2-${Math.random().toString(36).substring(2, 7)}`, text: 'SQL', enabled: true },
          { id: `b-${Date.now()}-3-${Math.random().toString(36).substring(2, 7)}`, text: 'GCP', enabled: true },
        ],
      };
    } else {
      baseItem = {
        title: 'Position / Role Title',
        subtitle: 'Company / Organization',
        startDate: 'Jan 2024',
        endDate: 'Present',
        current: true,
        bulletItems: [
          { id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, text: 'Key accomplishment or responsibility using quantifiable metrics.', enabled: true },
        ],
      };
    }

    addSectionItem(secId, baseItem);
    setExpandedItems((prev) => ({ ...prev, [newItemId]: true }));
  };

  // Display-mode switch, converting content when needed (tags <-> bullets)
  const handleSetDisplayMode = (sec: CVSection, mode: 'tags' | 'bullets' | 'compact') => {
    if (mode === 'tags') {
      const updatedItems = sec.items.map((it) => {
        if ((!it.tags || it.tags.length === 0) && it.bulletItems && it.bulletItems.length > 0) {
          return {
            ...it,
            tags: it.bulletItems.map((b) => b.text).filter(Boolean),
          };
        }
        return it;
      });
      updateSection(sec.id, { displayMode: 'tags', items: updatedItems, layout: { ...sec.layout, displayMode: 'tags' } });
      return;
    }

    if (mode === 'bullets') {
      const updatedItems = sec.items.map((it) => {
        if ((!it.bulletItems || it.bulletItems.length === 0) && it.tags && it.tags.length > 0) {
          return {
            ...it,
            bulletItems: it.tags.map((tText, tIdx) => ({
              id: `b-${Date.now()}-${tIdx}-${Math.random().toString(36).substring(2, 7)}`,
              text: tText,
              enabled: true,
            })),
          };
        }
        return it;
      });
      updateSection(sec.id, { displayMode: 'bullets', items: updatedItems, layout: { ...sec.layout, displayMode: 'bullets' } });
      return;
    }

    updateSection(sec.id, { displayMode: 'compact', layout: { ...sec.layout, displayMode: 'compact' } });
  };

  // Bullet Points Helper Mutations (Surgically scoped by index & bullet.id)
  const handleUpdateBullet = (
    secId: string,
    item: SectionItem,
    bulletId: string,
    targetIdx: number,
    partial: Partial<BulletItem>
  ) => {
    const updatedBullets = (item.bulletItems || []).map((b, idx) => {
      const isTarget = (b.id && b.id === bulletId) || idx === targetIdx;
      return isTarget ? { ...b, ...partial } : b;
    });
    updateSectionItem(secId, item.id, { bulletItems: updatedBullets });
  };

  const handleAddBullet = (secId: string, item: SectionItem) => {
    const newBullet: BulletItem = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: '',
      enabled: true,
    };
    const updatedBullets = [...(item.bulletItems || []), newBullet];
    updateSectionItem(secId, item.id, { bulletItems: updatedBullets });
  };

  const handleDeleteBullet = (secId: string, item: SectionItem, bulletId: string, targetIdx: number) => {
    const updatedBullets = (item.bulletItems || []).filter((b, idx) => {
      if (b.id && bulletId) return b.id !== bulletId;
      return idx !== targetIdx;
    });
    updateSectionItem(secId, item.id, { bulletItems: updatedBullets });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-100">{t('editor.sections')}</h2>
        <button
          onClick={() => setIsAddingSection(!isAddingSection)}
          className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('editor.addSection')}</span>
        </button>
      </div>

      {/* Add Section Quick Selector Panel */}
      {isAddingSection && (
        <AddSectionPanel
          onAdd={handleAddPresetSection}
          onCancel={() => setIsAddingSection(false)}
        />
      )}

      {/* Section List */}
      <div className="space-y-3">
        {sectionsList.map((sec, index) => {
          const isSectionExpanded = expandedSection === sec.id || expandedSection === null;

          return (
            <SectionCard
              key={sec.id}
              section={sec}
              index={index}
              totalSections={sectionsList.length}
              isExpanded={isSectionExpanded}
              expandedItems={expandedItems}
              onToggleItemExpanded={toggleItemExpanded}
              onToggleExpanded={() => setExpandedSection(isSectionExpanded ? 'none' : sec.id)}
              onMove={(direction) => handleMoveSection(index, direction)}
              onToggleVisibility={() => toggleSectionVisibility(sec.id)}
              onToggleColumn={() => toggleSectionColumn(sec.id)}
              onDelete={() => deleteSection(sec.id)}
              onUpdateTitle={(title) => updateSectionTitle(sec.id, title)}
              onSetDisplayMode={(mode) => handleSetDisplayMode(sec, mode)}
              onAddItem={() => handleAddItem(sec.id, sec.type)}
              onUpdateItem={(itemId, partial) => updateSectionItem(sec.id, itemId, partial)}
              onDeleteItem={(itemId) => deleteSectionItem(sec.id, itemId)}
              onUpdateBullet={(item, bulletId, targetIdx, partial) =>
                handleUpdateBullet(sec.id, item, bulletId, targetIdx, partial)}
              onAddBullet={(item) => handleAddBullet(sec.id, item)}
              onDeleteBullet={(item, bulletId, targetIdx) =>
                handleDeleteBullet(sec.id, item, bulletId, targetIdx)}
            />
          );
        })}
      </div>
    </div>
  );
};
