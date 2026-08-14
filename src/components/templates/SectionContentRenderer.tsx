import React from 'react';
import { CVSection, DisplayMode, getEffectiveDisplayMode } from '../../types/cv';
import { getFriendlyLinkLabel, getFullUrl } from './linkHelpers';

interface SectionContentRendererProps {
  section: CVSection;
  /** Kept for template API compatibility; current display modes don't tint content. */
  primaryColor?: string;
  isSidebar?: boolean;
}

export const SectionContentRenderer: React.FC<SectionContentRendererProps> = ({
  section,
  isSidebar = false,
}) => {
  const displayMode: DisplayMode = getEffectiveDisplayMode(section);
  const items = section.items || [];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        if (displayMode === 'tags') {
          return (
            <div key={item.id} className="resume-item space-y-1">
              <div className="resume-item-header">
                <h3 className={`font-semibold text-slate-900 ${isSidebar ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-[11px] font-medium text-slate-500">{item.subtitle}</p>
                )}
              </div>
              {item.tags && item.tags.length > 0 && (
                <p className={`text-[#334155] font-normal leading-relaxed ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                  {item.tags.join(' • ')}
                </p>
              )}
            </div>
          );
        }

        if (displayMode === 'compact') {
          return (
            <div key={item.id} className="resume-item space-y-0.5">
              <div className="resume-item-header">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className={`font-bold text-slate-900 ${isSidebar ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    {item.title}
                    {item.linkUrl && (
                      <a
                        href={getFullUrl(item.linkUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs font-medium text-blue-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>[{getFriendlyLinkLabel(item.linkUrl, 'Link')}]</span>
                      </a>
                    )}
                  </h3>
                  {(item.startDate || item.endDate) && (
                    <span className="text-xs font-medium text-slate-500 shrink-0">
                      {item.startDate} {item.startDate && item.endDate ? '-' : ''} {item.endDate}
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className={`font-semibold text-slate-600 ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        }

        if (displayMode === 'bullets') {
          const enabledBullets = (item.bulletItems || []).filter((b) => b.enabled);
          return (
            <div key={item.id} className="resume-item space-y-1">
              <div className="resume-item-header">
                <div className="flex justify-between items-baseline gap-2">
                  <h3 className={`font-bold text-slate-900 ${isSidebar ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    {item.title}
                    {item.linkUrl && (
                      <a
                        href={getFullUrl(item.linkUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs font-medium text-blue-600 hover:underline"
                      >
                        [{getFriendlyLinkLabel(item.linkUrl, 'Project')}]
                      </a>
                    )}
                  </h3>
                  {(item.startDate || item.endDate) && (
                    <span className="text-xs font-medium text-slate-500 shrink-0">
                      {item.startDate} {item.startDate && item.endDate ? '-' : ''} {item.endDate}
                    </span>
                  )}
                </div>

                {item.subtitle && (
                  <p className={`font-semibold text-slate-600 ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                    {item.subtitle}
                  </p>
                )}
              </div>

              {enabledBullets.length > 0 && (
                <ul className={`list-disc list-inside space-y-1 text-slate-700 mt-1 ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                  {enabledBullets.map((b) => (
                    <li key={b.id} className={b.isMetricHighlighted ? 'font-medium text-slate-900' : ''}>
                      {b.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }

        const enabledBullets = (item.bulletItems || []).filter((b) => b.enabled);
        return (
          <div key={item.id} className="resume-item space-y-1">
            <div className="resume-item-header">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className={`font-bold text-slate-900 ${isSidebar ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                  {item.title}
                  {item.linkUrl && (
                    <a
                      href={getFullUrl(item.linkUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-xs font-medium text-blue-600 hover:underline"
                    >
                      [{getFriendlyLinkLabel(item.linkUrl, 'Link')}]
                    </a>
                  )}
                </h3>
                {(item.startDate || item.endDate) && (
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    {item.startDate} {item.startDate && item.endDate ? '-' : ''} {item.endDate}
                  </span>
                )}
              </div>

              {item.subtitle && (
                <p className={`font-semibold text-slate-600 ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                  {item.subtitle} {item.location ? `• ${item.location}` : ''}
                </p>
              )}
            </div>

            {enabledBullets.length > 0 && (
              <ul className={`list-disc list-inside space-y-1 text-slate-700 mt-1 ${isSidebar ? 'text-[11px]' : 'text-xs'}`}>
                {enabledBullets.map((b) => (
                  <li key={b.id} className={b.isMetricHighlighted ? 'font-medium text-slate-900' : ''}>
                    {b.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};
