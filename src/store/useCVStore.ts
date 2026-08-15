import { create } from 'zustand';
import { CVProfile, CVSection, PersonalInfo, SectionItem, ThemeSettings } from '../types/cv';
import { db, seedDatabaseIfEmpty } from '../db/cvDatabase';
import { demoProfiles } from '../data/initialData';

interface CVStoreState {
  profiles: CVProfile[];
  activeProfileId: string | null;
  activeProfile: CVProfile | null;
  isLoading: boolean;

  // Database initialization & load
  initStore: () => Promise<void>;
  selectProfile: (id: string) => void;
  /** Re-read all profiles from IndexedDB (e.g. after a version restore) and select `selectId`. */
  refreshProfiles: (selectId?: string) => Promise<void>;

  // Profile CRUD
  createProfile: (title?: string) => Promise<string>;
  duplicateProfile: (id: string) => Promise<string>;
  deleteProfile: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  importProfiles: (profiles: CVProfile[]) => Promise<void>;

  updateProfileTitle: (title: string) => void;
  updatePersonal: (personal: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  setTemplateId: (templateId: string) => void;

  // Section Updates
  updateSectionTitle: (sectionId: string, title: string) => void;
  updateSection: (sectionId: string, partial: Partial<CVSection>) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  toggleSectionColumn: (sectionId: string) => void;
  reorderSections: (newOrder: string[]) => void;
  addSection: (type: CVSection['type'], title: string) => void;
  deleteSection: (sectionId: string) => void;

  // Item Updates
  addSectionItem: (sectionId: string, item: Partial<SectionItem>) => void;
  updateSectionItem: (sectionId: string, itemId: string, item: Partial<SectionItem>) => void;
  deleteSectionItem: (sectionId: string, itemId: string) => void;
  reorderSectionItems: (sectionId: string, newItems: SectionItem[]) => void;
}

export const useCVStore = create<CVStoreState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  activeProfile: null,
  isLoading: true,

  initStore: async () => {
    set({ isLoading: true });
    await seedDatabaseIfEmpty();
    const allProfiles = await db.profiles.toArray();
    const activeId = allProfiles.length > 0 ? allProfiles[0].id : null;
    const active = allProfiles.find((p) => p.id === activeId) || null;

    set({
      profiles: allProfiles,
      activeProfileId: activeId,
      activeProfile: active,
      isLoading: false,
    });
  },

  selectProfile: (id: string) => {
    const found = get().profiles.find((p) => p.id === id) || null;
    set({ activeProfileId: id, activeProfile: found });
  },

  refreshProfiles: async (selectId?: string) => {
    const all = await db.profiles.toArray();
    const targetId = selectId ?? get().activeProfileId;
    const active = all.find((p) => p.id === targetId) || all[0] || null;
    set({ profiles: all, activeProfileId: active?.id || null, activeProfile: active });
  },

  createProfile: async (title = 'Untitled Resume') => {
    const newId = `cv-${Date.now()}`;
    const base = demoProfiles[0];
    const newProfile: CVProfile = {
      ...base,
      id: newId,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.profiles.add(newProfile);
    const updated = await db.profiles.toArray();
    set({ profiles: updated, activeProfileId: newId, activeProfile: newProfile });
    return newId;
  },

  duplicateProfile: async (id: string) => {
    const original = get().profiles.find((p) => p.id === id);
    if (!original) return '';

    const dupId = `cv-${Date.now()}`;
    const duplicate: CVProfile = {
      ...original,
      id: dupId,
      title: `${original.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.profiles.add(duplicate);
    const updated = await db.profiles.toArray();
    set({ profiles: updated, activeProfileId: dupId, activeProfile: duplicate });
    return dupId;
  },

  deleteProfile: async (id: string) => {
    await db.profiles.delete(id);
    const updated = await db.profiles.toArray();
    const nextActiveId = updated.length > 0 ? updated[0].id : null;
    const nextActive = updated.find((p) => p.id === nextActiveId) || null;
    set({ profiles: updated, activeProfileId: nextActiveId, activeProfile: nextActive });
  },

  toggleFavorite: async (id: string) => {
    const profile = get().profiles.find((p) => p.id === id);
    if (!profile) return;

    const updatedProfile = { ...profile, isFavorite: !profile.isFavorite, updatedAt: Date.now() };
    await db.profiles.put(updatedProfile);
    const all = await db.profiles.toArray();
    const active = all.find((p) => p.id === get().activeProfileId) || null;
    set({ profiles: all, activeProfile: active });
  },

  toggleArchive: async (id: string) => {
    const profile = get().profiles.find((p) => p.id === id);
    if (!profile) return;

    const updatedProfile = { ...profile, isArchived: !profile.isArchived, updatedAt: Date.now() };
    await db.profiles.put(updatedProfile);
    const all = await db.profiles.toArray();
    const active = all.find((p) => p.id === get().activeProfileId) || null;
    set({ profiles: all, activeProfile: active });
  },

  importProfiles: async (incoming: CVProfile[]) => {
    await db.profiles.bulkPut(incoming);
    const all = await db.profiles.toArray();
    set({ profiles: all, activeProfileId: all[0]?.id || null, activeProfile: all[0] || null });
  },

  updateProfileTitle: (title: string) => {
    const active = get().activeProfile;
    if (!active) return;

    const updated: CVProfile = {
      ...active,
      title,
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === active.id ? updated : p)),
    });
  },

  // Active Profile Mutation Helper
  updatePersonal: (personal: Partial<PersonalInfo>) => {
    const active = get().activeProfile;
    if (!active) return;

    const updated: CVProfile = {
      ...active,
      personal: { ...active.personal, ...personal },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  updateSummary: (summary: string) => {
    const active = get().activeProfile;
    if (!active) return;

    const updated: CVProfile = { ...active, summary, updatedAt: Date.now() };
    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  updateTheme: (themePartial: Partial<ThemeSettings>) => {
    const active = get().activeProfile;
    if (!active) return;

    const updated: CVProfile = {
      ...active,
      theme: { ...active.theme, ...themePartial },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  setTemplateId: (templateId: string) => {
    const active = get().activeProfile;
    if (!active) return;

    const updated: CVProfile = { ...active, templateId, updatedAt: Date.now() };
    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  updateSectionTitle: (sectionId: string, title: string) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const updated: CVProfile = {
      ...active,
      sections: {
        ...active.sections,
        [sectionId]: { ...active.sections[sectionId], title },
      },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  updateSection: (sectionId: string, partial: Partial<CVSection>) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const updated: CVProfile = {
      ...active,
      sections: {
        ...active.sections,
        [sectionId]: { ...active.sections[sectionId], ...partial },
      },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  toggleSectionVisibility: (sectionId: string) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const currentVis = active.sections[sectionId].visible;
    const updated: CVProfile = {
      ...active,
      sections: {
        ...active.sections,
        [sectionId]: { ...active.sections[sectionId], visible: !currentVis },
      },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  toggleSectionColumn: (sectionId: string) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const currentCol = active.sections[sectionId].column;
    const nextCol = currentCol === 'main' ? 'sidebar' : 'main';

    const updated: CVProfile = {
      ...active,
      sections: {
        ...active.sections,
        [sectionId]: { ...active.sections[sectionId], column: nextCol },
      },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  reorderSections: (newOrder: string[]) => {
    const active = get().activeProfile;
    if (!active) return;

    const updated: CVProfile = {
      ...active,
      sectionsOrder: newOrder,
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  addSection: (type: CVSection['type'], title: string) => {
    const active = get().activeProfile;
    if (!active) return;

    const sectionId = `sec-${Date.now()}`;
    const newSection: CVSection = {
      id: sectionId,
      type,
      title,
      column: 'main',
      visible: true,
      items: [],
    };

    const updated: CVProfile = {
      ...active,
      sectionsOrder: [...active.sectionsOrder, sectionId],
      sections: { ...active.sections, [sectionId]: newSection },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  deleteSection: (sectionId: string) => {
    const active = get().activeProfile;
    if (!active) return;

    const { [sectionId]: _deleted, ...remainingSections } = active.sections;
    const updated: CVProfile = {
      ...active,
      sectionsOrder: active.sectionsOrder.filter((id) => id !== sectionId),
      sections: remainingSections,
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  addSectionItem: (sectionId: string, itemPartial: Partial<SectionItem>) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const newItem: SectionItem = {
      id: `item-${Date.now()}`,
      title: itemPartial.title || 'New Item',
      subtitle: itemPartial.subtitle || '',
      location: itemPartial.location || '',
      startDate: itemPartial.startDate || '',
      endDate: itemPartial.endDate || '',
      current: itemPartial.current || false,
      bulletItems: itemPartial.bulletItems || [],
      tags: itemPartial.tags || [],
      linkUrl: itemPartial.linkUrl || '',
    };

    const section = active.sections[sectionId];
    const updatedSection: CVSection = {
      ...section,
      items: [...section.items, newItem],
    };

    const updated: CVProfile = {
      ...active,
      sections: { ...active.sections, [sectionId]: updatedSection },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  updateSectionItem: (sectionId: string, itemId: string, itemPartial: Partial<SectionItem>) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const section = active.sections[sectionId];
    const updatedItems = section.items.map((it) =>
      it.id === itemId ? { ...it, ...itemPartial } : it
    );

    const updatedSection: CVSection = { ...section, items: updatedItems };
    const updated: CVProfile = {
      ...active,
      sections: { ...active.sections, [sectionId]: updatedSection },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  deleteSectionItem: (sectionId: string, itemId: string) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const section = active.sections[sectionId];
    const updatedItems = section.items.filter((it) => it.id !== itemId);
    const updatedSection: CVSection = { ...section, items: updatedItems };

    const updated: CVProfile = {
      ...active,
      sections: { ...active.sections, [sectionId]: updatedSection },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },

  reorderSectionItems: (sectionId: string, newItems: SectionItem[]) => {
    const active = get().activeProfile;
    if (!active || !active.sections[sectionId]) return;

    const section = active.sections[sectionId];
    const updatedSection: CVSection = { ...section, items: newItems };

    const updated: CVProfile = {
      ...active,
      sections: { ...active.sections, [sectionId]: updatedSection },
      updatedAt: Date.now(),
    };

    db.profiles.put(updated);
    set({
      activeProfile: updated,
      profiles: get().profiles.map((p) => (p.id === updated.id ? updated : p)),
    });
  },
}));
