import React, { useState } from 'react';
import { X, GitCompare } from 'lucide-react';
import { useCVStore } from '../../store/useCVStore';
import { useUIStore } from '../../store/useUIStore';
import { calculateATSScore } from '../../services/atsEngine';

export const CompareModal: React.FC = () => {
  const { profiles } = useCVStore();
  const { activeModal, closeModal } = useUIStore();

  const [leftProfileId, setLeftProfileId] = useState<string>(profiles[0]?.id || '');
  const [rightProfileId, setRightProfileId] = useState<string>(profiles[1]?.id || profiles[0]?.id || '');

  if (activeModal !== 'compare-cv' || profiles.length === 0) return null;

  const leftProfile = profiles.find((p) => p.id === leftProfileId) || profiles[0];
  const rightProfile = profiles.find((p) => p.id === rightProfileId) || profiles[1] || profiles[0];

  const leftATS = calculateATSScore(leftProfile);
  const rightATS = calculateATSScore(rightProfile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-[#222f47] rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222f47] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Side-by-Side CV Comparison</h2>
              <p className="text-xs text-slate-400">Compare metrics, keywords, and ATS scores between two resumes</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#0d1322] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Selectors */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Resume A</label>
            <select
              value={leftProfileId}
              onChange={(e) => setLeftProfileId(e.target.value)}
              className="w-full bg-[#0d1322] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.personal.fullName || 'Draft'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Resume B</label>
            <select
              value={rightProfileId}
              onChange={(e) => setRightProfileId(e.target.value)}
              className="w-full bg-[#0d1322] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.personal.fullName || 'Draft'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Comparison Metrics */}
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Resume A Column */}
          <div className="bg-[#0d1322] border border-[#222f47] p-5 rounded-2xl space-y-4">
            <div className="border-b border-[#222f47] pb-3">
              <h3 className="text-sm font-bold text-blue-400">{leftProfile.title}</h3>
              <p className="text-xs text-slate-400">{leftProfile.personal.fullName} • {leftProfile.personal.jobTitle}</p>
            </div>

            <div className="flex justify-between items-center bg-[#131b2e] p-3 rounded-xl border border-[#222f47]">
              <span className="text-xs text-slate-300 font-medium">ATS Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{leftATS.breakdown.totalScore} / 100</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Summary Words:</span>
                <span className="font-mono">{leftProfile.summary.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="font-mono text-blue-400">{leftProfile.templateId}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sections:</span>
                <span className="font-mono">{leftProfile.sectionsOrder.length}</span>
              </div>
            </div>
          </div>

          {/* Resume B Column */}
          <div className="bg-[#0d1322] border border-[#222f47] p-5 rounded-2xl space-y-4">
            <div className="border-b border-[#222f47] pb-3">
              <h3 className="text-sm font-bold text-purple-400">{rightProfile.title}</h3>
              <p className="text-xs text-slate-400">{rightProfile.personal.fullName} • {rightProfile.personal.jobTitle}</p>
            </div>

            <div className="flex justify-between items-center bg-[#131b2e] p-3 rounded-xl border border-[#222f47]">
              <span className="text-xs text-slate-300 font-medium">ATS Score</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{rightATS.breakdown.totalScore} / 100</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Summary Words:</span>
                <span className="font-mono">{rightProfile.summary.split(/\s+/).filter(Boolean).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Template:</span>
                <span className="font-mono text-purple-400">{rightProfile.templateId}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Sections:</span>
                <span className="font-mono">{rightProfile.sectionsOrder.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
