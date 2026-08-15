import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useCVStore } from '../../store/useCVStore';
import { useUIStore } from '../../store/useUIStore';
import { getTemplateRenderer } from '../templates/registry';
import type { CVProfile } from '../../types/cv';

/**
 * Memoized wrapper around the active template renderer.
 *
 * `React.memo` is what makes the `useDeferredValue` below actually pay off: during
 * the urgent render pass the deferred profile is still the previous object, so the
 * whole template subtree bails out instead of re-rendering with stale props.
 */
const TemplateSurface = React.memo<{
  profile: CVProfile;
  previewRef: React.RefObject<HTMLDivElement | null>;
}>(({ profile, previewRef }) => {
  const TemplateComponent = getTemplateRenderer(profile.templateId);
  return <TemplateComponent profile={profile} previewRef={previewRef} />;
});
TemplateSurface.displayName = 'TemplateSurface';

export const A4PaperCanvas: React.FC = () => {
  const liveProfile = useCVStore((state) => state.activeProfile);
  // Typing in the editor updates the store on every keystroke. Deferring the profile
  // keeps the input responsive: React renders the (expensive) A4 template at low
  // priority and can interrupt it when the next keystroke arrives.
  const activeProfile = useDeferredValue(liveProfile);
  const { zoomLevel } = useUIStore();
  const paperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const [effectiveScale, setEffectiveScale] = useState<number>(zoomLevel);
  const [paperHeight, setPaperHeight] = useState<number>(1123);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      // Use offsetWidth to ignore scrollbar appearance/disappearance (prevents trembling loop)
      const availableWidth = containerRef.current.offsetWidth;
      // Reserve generous padding so the paper floats with breathing room (120px on desktop)
      const padding = availableWidth >= 600 ? 120 : 32;
      const maxPaperWidth = availableWidth - padding;
      // Never exceed the user-set zoom level, but always shrink to fit if needed
      const autoScale = Math.min(zoomLevel, maxPaperWidth / 794);
      setEffectiveScale(Math.max(0.3, autoScale));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [zoomLevel]);

  useEffect(() => {
    if (!paperRef.current) return;

    const observer = new ResizeObserver(() => {
      if (!paperRef.current) return;
      const totalHeight = paperRef.current.scrollHeight;
      setPaperHeight(totalHeight);

      const a4PageHeight = 1123; // Standard A4 height at 96 DPI
      const breaks: number[] = [];
      let currentHeight = a4PageHeight;

      while (currentHeight < totalHeight) {
        breaks.push(currentHeight);
        currentHeight += a4PageHeight;
      }

      setPageBreaks(breaks);
    });

    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [activeProfile]);

  if (!activeProfile) return null;

  const scaledWidth = Math.round(794 * effectiveScale);
  const scaledHeight = Math.round(paperHeight * effectiveScale);

  return (
    <div ref={containerRef} className="flex-1 overflow-x-hidden overflow-y-auto bg-[#090d16] p-2 sm:p-8 flex justify-center items-start min-h-screen">
      {/* Outer Scaled Container matching exact scaled dimensions */}
      <div
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          position: 'relative',
        }}
        className="transition-all duration-200"
      >
        <div
          className="transition-transform origin-top-left duration-200"
          style={{ transform: `scale(${effectiveScale})` }}
        >
          <div className="relative">
            {/* Render Active Template */}
            <TemplateSurface profile={activeProfile} previewRef={paperRef} />

            {/* Dynamic Visual Page Cut Lines */}
            {pageBreaks.map((breakY, index) => (
              <div key={index} className="page-break-line" style={{ top: `${breakY}px` }}>
                <span className="page-break-label">A4 Page {index + 2} Split</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
