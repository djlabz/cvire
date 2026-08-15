/* oxlint-disable react/only-export-components -- react-pdf primitives, not DOM components; fast refresh does not apply */
import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet, Font } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import { CVProfile, CVSection, SectionItem, getEffectiveDisplayMode } from '../types/cv';

// @react-pdf/renderer auto-hyphenates overflowing words by default (e.g.
// "strategies" -> "strate-\ngies"). A resume must never break a word with a
// visible hyphen, so treat every word as a single unbreakable unit — long
// words simply wrap whole to the next line instead.
Font.registerHyphenationCallback((word) => [word]);

/**
 * Text-native, ATS-safe PDF document built with @react-pdf/renderer.
 *
 * Design constraints (see verify-ats-pdf.mjs for the automated checks):
 * - Real selectable text only — no raster images, no invisible text layers.
 * - Real /URI link annotations for every profile and item URL, with the URL
 *   also spelled out as visible text for parsers that ignore annotations.
 * - Single-column linear flow so positional parsers (pdftotext, classic ATS)
 *   read header → sections strictly in document order, even for templates
 *   that render a sidebar on screen.
 * - Keep-together bands: a section title or item header never ends a page
 *   orphaned from its first content line (minPresenceAhead / wrap=false).
 */

const ACCENT = '#1d4ed8';
const MUTED = '#475569';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#0f172a',
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 44,
  },
  name: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
  },
  jobTitle: {
    fontSize: 11.5,
    marginTop: 2,
    color: MUTED,
  },
  contactRow: {
    marginTop: 6,
    fontSize: 9,
    color: MUTED,
  },
  linkText: {
    fontSize: 9,
    color: ACCENT,
    textDecoration: 'none',
  },
  headerRule: {
    borderBottomWidth: 1.2,
    borderBottomColor: ACCENT,
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: ACCENT,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.6,
    borderBottomColor: '#cbd5e1',
  },
  section: {
    marginTop: 12,
  },
  item: {
    marginBottom: 7,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  itemDates: {
    fontSize: 8.5,
    color: MUTED,
    marginLeft: 8,
  },
  itemSubtitle: {
    fontSize: 9,
    color: MUTED,
    marginTop: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 2,
    paddingRight: 6,
  },
  bulletGlyph: {
    width: 10,
    fontSize: 9.5,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
  },
  tagsLine: {
    fontSize: 9.5,
    marginTop: 1,
  },
  summary: {
    marginTop: 8,
    fontSize: 9.5,
  },
});

function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
}

function formatDates(item: SectionItem): string {
  const end = item.current ? 'Present' : item.endDate || '';
  if (item.startDate && end) return `${item.startDate} – ${end}`;
  return item.startDate || end;
}

const ItemLink: React.FC<{ url: string }> = ({ url }) => (
  <Link src={normalizeUrl(url)} style={styles.linkText}>
    {url.replace(/^https?:\/\//, '')}
  </Link>
);

const ItemHeader: React.FC<{ item: SectionItem; showDates?: boolean }> = ({
  item,
  showDates = true,
}) => {
  const dates = showDates ? formatDates(item) : '';
  return (
    <View>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {dates ? <Text style={styles.itemDates}>{dates}</Text> : null}
      </View>
      {item.subtitle || item.location ? (
        <Text style={styles.itemSubtitle}>
          {[item.subtitle, item.location].filter(Boolean).join(' • ')}
        </Text>
      ) : null}
      {item.linkUrl ? <ItemLink url={item.linkUrl} /> : null}
    </View>
  );
};

const SectionItems: React.FC<{ section: CVSection }> = ({ section }) => {
  const displayMode = getEffectiveDisplayMode(section);

  return (
    <View>
      {section.items.map((item, index) => {
        if (displayMode === 'tags') {
          const tags =
            item.tags && item.tags.length > 0
              ? item.tags
              : (item.bulletItems || []).filter((b) => b.enabled).map((b) => b.text);
          return (
            <View key={item.id} style={styles.item} minPresenceAhead={index === 0 ? 20 : 0}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
              {tags.length > 0 ? <Text style={styles.tagsLine}>{tags.join(', ')}</Text> : null}
            </View>
          );
        }

        if (displayMode === 'compact') {
          return (
            <View key={item.id} style={styles.item} wrap={false}>
              <ItemHeader item={item} />
            </View>
          );
        }

        const enabledBullets = (item.bulletItems || []).filter((b) => b.enabled);
        return (
          <View key={item.id} style={styles.item}>
            {/* Keep the item header attached to its first bullet line */}
            <View minPresenceAhead={28}>
              <ItemHeader item={item} />
            </View>
            {enabledBullets.map((bullet) => (
              <View key={bullet.id} style={styles.bulletRow}>
                <Text style={styles.bulletGlyph}>•</Text>
                <Text style={styles.bulletText}>{bullet.text}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

function collectKeywords(profile: CVProfile): string[] {
  const keywords = new Set<string>();
  Object.values(profile.sections).forEach((sec) => {
    sec.items.forEach((item) => {
      (item.tags || []).forEach((tag) => keywords.add(tag));
    });
  });
  return Array.from(keywords);
}

export function buildAtsPdfDocument(profile: CVProfile): React.ReactElement<DocumentProps> {
  const { personal, summary } = profile;

  const orderedSections = profile.sectionsOrder
    .map((id) => profile.sections[id])
    .filter((sec): sec is CVSection => Boolean(sec && sec.visible && sec.items.length > 0));

  // Linearize: on-screen "main" sections first, then sidebar sections, each
  // group preserving the user's ordering. A single reading column is the
  // correct shape for positional ATS parsers.
  const linearSections = [
    ...orderedSections.filter((sec) => sec.column !== 'sidebar'),
    ...orderedSections.filter((sec) => sec.column === 'sidebar'),
  ];

  const profileLinks: { label: string; url: string }[] = [];
  if (personal.linkedinUrl) profileLinks.push({ label: 'LinkedIn', url: personal.linkedinUrl });
  if (personal.githubUrl) profileLinks.push({ label: 'GitHub', url: personal.githubUrl });
  if (personal.portfolioUrl) profileLinks.push({ label: 'Portfolio', url: personal.portfolioUrl });

  const documentTitle = [personal.fullName, personal.jobTitle].filter(Boolean).join(' — ');

  return (
    <Document
      title={documentTitle || profile.title}
      author={personal.fullName || 'cvire'}
      subject={profile.title}
      keywords={collectKeywords(profile).join(', ')}
      creator="cvire"
      producer="cvire (@react-pdf/renderer)"
      language={profile.language}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View>
          <Text style={styles.name}>{personal.fullName}</Text>
          {personal.jobTitle ? <Text style={styles.jobTitle}>{personal.jobTitle}</Text> : null}
          <Text style={styles.contactRow}>
            {[personal.location, personal.phone].filter(Boolean).join('  •  ')}
            {personal.email ? '  •  ' : ''}
            {personal.email ? (
              <Link src={`mailto:${personal.email}`} style={styles.linkText}>
                {personal.email}
              </Link>
            ) : null}
          </Text>
          {profileLinks.length > 0 ? (
            <Text style={styles.contactRow}>
              {profileLinks.map((link, idx) => (
                <React.Fragment key={link.url}>
                  {idx > 0 ? '  •  ' : ''}
                  <ItemLink url={link.url} />
                </React.Fragment>
              ))}
            </Text>
          ) : null}
          <View style={styles.headerRule} />
        </View>

        {/* Summary */}
        {summary ? <Text style={styles.summary}>{summary}</Text> : null}

        {/* Sections, strictly linear */}
        {linearSections.map((sec) => (
          <View key={sec.id} style={styles.section}>
            <View minPresenceAhead={36}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            <SectionItems section={sec} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
