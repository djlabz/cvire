import { CVProfile } from '../types/cv';

/**
 * Flatten a CV profile into the plain text a human (or ATS) would actually
 * read. Replaces the old JSON.stringify(profile) approach, which polluted
 * matching with JSON keys, ids, URLs, and theme settings.
 */
export function profileToPlainText(profile: CVProfile): string {
  const parts: string[] = [
    profile.personal.fullName,
    profile.personal.jobTitle,
    profile.personal.location,
    profile.summary,
  ];

  for (const sectionId of profile.sectionsOrder) {
    const section = profile.sections[sectionId];
    if (!section || !section.visible) continue;

    parts.push(section.title);
    for (const item of section.items) {
      parts.push(item.title, item.subtitle || '', item.location || '');
      if (item.tags) parts.push(item.tags.join(' '));
      for (const bullet of item.bulletItems || []) {
        if (bullet.enabled) parts.push(bullet.text);
      }
    }
  }

  return parts.filter(Boolean).join('\n');
}
