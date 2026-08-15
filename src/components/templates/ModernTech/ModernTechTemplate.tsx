import React from 'react';
import { TemplateProps } from '../../../types/template';
import { SectionContentRenderer } from '../SectionContentRenderer';
import { getFriendlyLinkLabel, getFullUrl } from '../linkHelpers';

export const ModernTechTemplate: React.FC<TemplateProps> = ({ profile, previewRef }) => {
  const { personal, summary, sections, theme } = profile;

  const primaryColor = theme.primaryColor || '#2563eb';
  const mainSections = profile.sectionsOrder
    .map((id) => sections[id])
    .filter((sec) => sec && sec.visible && sec.column !== 'sidebar');

  const sidebarSections = profile.sectionsOrder
    .map((id) => sections[id])
    .filter((sec) => sec && sec.visible && sec.column === 'sidebar');

  return (
    <div
      ref={previewRef}
      className="a4-paper p-8 flex flex-col justify-between text-slate-800 text-sm leading-relaxed"
      style={{
        fontFamily: theme.fontFamily,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Header Banner */}
      <header className="border-b-2 pb-5 mb-6 flex justify-between items-end" style={{ borderColor: primaryColor }}>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: primaryColor }}>
            {personal.fullName || 'Your Name'}
          </h1>
          <p className="text-base font-semibold text-slate-600 mt-1">{personal.jobTitle || 'Professional Title'}</p>
        </div>

        <div className="text-right text-xs text-slate-600 space-y-1">
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.linkedinUrl && (
            <div className="text-blue-600 font-medium">
              <a href={getFullUrl(personal.linkedinUrl)} target="_blank" rel="noreferrer">
                {getFriendlyLinkLabel(personal.linkedinUrl, 'LinkedIn')}
              </a>
            </div>
          )}
          {personal.githubUrl && (
            <div className="text-blue-600 font-medium">
              <a href={getFullUrl(personal.githubUrl)} target="_blank" rel="noreferrer">
                {getFriendlyLinkLabel(personal.githubUrl, 'GitHub')}
              </a>
            </div>
          )}
          {personal.portfolioUrl && (
            <div className="text-blue-600 font-medium">
              <a href={getFullUrl(personal.portfolioUrl)} target="_blank" rel="noreferrer">
                {getFriendlyLinkLabel(personal.portfolioUrl, 'Portfolio')}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Summary with Optimal Line-Length */}
      {summary && (
        <div className="mb-6 max-w-[650px]">
          <p className="text-xs text-slate-700 leading-relaxed border-l-2 pl-3" style={{ borderColor: `${primaryColor}60` }}>
            {summary}
          </p>
        </div>
      )}

      {/* 2-Column Body Grid */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {/* Main Column (2/3 width) */}
        <div className="col-span-2 space-y-6">
          {mainSections.map((sec) => (
            <div key={sec.id} className="resume-section space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}40` }}>
                {sec.title}
              </h2>

              <SectionContentRenderer section={sec} primaryColor={primaryColor} isSidebar={false} />
            </div>
          ))}
        </div>

        {/* Sidebar Column (1/3 width) - h-fit ensures border stops when sidebar content ends */}
        {sidebarSections.length > 0 && (
          <div className="col-span-1 space-y-6 border-l pl-5 border-slate-200 h-fit">
            {sidebarSections.map((sec) => (
              <div key={sec.id} className="resume-section space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1" style={{ color: primaryColor, borderColor: `${primaryColor}40` }}>
                  {sec.title}
                </h2>

                <SectionContentRenderer section={sec} primaryColor={primaryColor} isSidebar={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
