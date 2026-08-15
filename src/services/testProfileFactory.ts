import { CVProfile, CVSection } from '../types/cv';
import { defaultTheme } from '../data/initialData';

/** Minimal CVProfile factory for service unit tests. */
export function makeProfile(overrides: Partial<CVProfile> = {}): CVProfile {
  return {
    id: 'test-profile',
    title: 'Test Profile',
    language: 'en-US',
    isFavorite: false,
    isArchived: false,
    createdAt: 0,
    updatedAt: 0,
    templateId: 'modern-tech',
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      photoFormat: 'hidden',
    },
    summary: '',
    sectionsOrder: [],
    sections: {},
    theme: defaultTheme,
    ...overrides,
  };
}

export function makeExperienceSection(bullets: string[], id = 'sec-exp'): CVSection {
  return {
    id,
    type: 'experience',
    title: 'Work Experience',
    column: 'main',
    visible: true,
    items: [
      {
        id: `${id}-item`,
        title: 'Engineer',
        subtitle: 'Some Company',
        bulletItems: bullets.map((text, index) => ({
          id: `${id}-b${index}`,
          text,
          enabled: true,
        })),
      },
    ],
  };
}
