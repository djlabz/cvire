import React from 'react';
import type { TemplateProps } from '../../../types/template';
import { SectionContentRenderer } from '../SectionContentRenderer';
import { getFriendlyLinkLabel, getFullUrl } from '../linkHelpers';

export const MinimalistCleanTemplate: React.FC<TemplateProps> = ({ profile, previewRef }) => {
  const { personal, summary, sections, theme } = profile;
  const primaryColor = theme.primaryColor || '#0f172a';

  const visibleSections = profile.sectionsOrder
    .map((id) => sections[id])
    .filter((sec) => sec && sec.visible);

  return (
    <div
      ref={previewRef}
      className="a4-paper p-10 flex flex-col justify-between text-slate-800 text-sm leading-relaxed"
      style={{
        fontFamily: theme.fontFamily || 'Inter',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Clean Minimal Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-light tracking-tight text-slate-900">
          {personal.fullName || 'Your Name'}
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">{personal.jobTitle || 'Professional Title'}</p>

        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedinUrl && (
            <a href={getFullUrl(personal.linkedinUrl)} target="_blank" rel="noreferrer" className="text-slate-700 underline">
              {getFriendlyLinkLabel(personal.linkedinUrl, 'LinkedIn')}
            </a>
          )}
          {personal.githubUrl && (
            <a href={getFullUrl(personal.githubUrl)} target="_blank" rel="noreferrer" className="text-slate-700 underline">
              {getFriendlyLinkLabel(personal.githubUrl, 'GitHub')}
            </a>
          )}
          {personal.portfolioUrl && (
            <a href={getFullUrl(personal.portfolioUrl)} target="_blank" rel="noreferrer" className="text-slate-700 underline">
              {getFriendlyLinkLabel(personal.portfolioUrl, 'Portfolio')}
            </a>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <div className="mb-8">
          <p className="text-xs text-slate-600 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-8 flex-1">
        {visibleSections.map((sec) => (
          <div key={sec.id} className="resume-section grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{sec.title}</h2>
            </div>

            <div className="col-span-3">
              <SectionContentRenderer section={sec} primaryColor={primaryColor} isSidebar={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
