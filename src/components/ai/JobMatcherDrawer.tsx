import React, { useState } from 'react';
import { X, Target, CheckCircle2, XCircle, Sparkles, Copy, Check, FileText } from 'lucide-react';
import { useCVStore } from '../../store/useCVStore';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from 'react-i18next';
import { calculateJobMatch } from '../../services/jobMatcher';
import { JobMatchResult } from '../../types/ats';

export const JobMatcherDrawer: React.FC = () => {
  const { t } = useTranslation();
  const { activeProfile } = useCVStore();
  const { activeModal, closeModal } = useUIStore();
  const [jobText, setJobText] = useState('');
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [copiedMissing, setCopiedMissing] = useState(false);

  if (activeModal !== 'job-matcher' || !activeProfile) return null;

  const handleAnalyze = () => {
    const res = calculateJobMatch(activeProfile, jobText);
    setMatchResult(res);
  };

  const handleCopyMissing = () => {
    if (!matchResult) return;
    const missing = matchResult.keywords
      .filter((k) => k.status === 'missing')
      .map((k) => k.keyword)
      .join(', ');

    if (missing) {
      navigator.clipboard
        .writeText(missing)
        .then(() => {
          setCopiedMissing(true);
          setTimeout(() => setCopiedMissing(false), 2000);
        })
        .catch((err) => {
          console.error('[JOB_MATCHER] Clipboard write failed:', err);
        });
    }
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (pct >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const matchedKeywords = matchResult?.keywords.filter((k) => k.status === 'matched' || k.status === 'overused') || [];
  const missingKeywords = matchResult?.keywords.filter((k) => k.status === 'missing') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-[#222f47] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#222f47] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t('jobMatcher.title')}</h2>
              <p className="text-xs text-slate-400">{t('jobMatcher.subtitle')}</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#0d1322] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{t('jobMatcher.label')}</span>
          </label>
          <textarea
            rows={5}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder={t('jobMatcher.placeholder')}
            className="w-full bg-[#0d1322] border border-[#222f47] focus:border-purple-500 rounded-xl p-3 text-xs text-slate-200 outline-none leading-relaxed resize-y"
          />

          <button
            onClick={handleAnalyze}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('jobMatcher.btnAnalyze')}</span>
          </button>
        </div>

        {/* Match Result Display */}
        {matchResult && (
          <div className="space-y-5 bg-[#0d1322] border border-[#222f47] p-5 rounded-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#222f47] pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">{t('jobMatcher.matchResultTitle')}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {matchResult.matchedKeywordsCount} {t('jobMatcher.matchedCount')} • {matchResult.missingKeywordsCount} {t('jobMatcher.missingCount')}
                </p>
              </div>

              <div className={`px-4 py-2 rounded-2xl border font-mono font-extrabold text-2xl ${getScoreColor(matchResult.matchPercentage)}`}>
                {matchResult.matchPercentage}% <span className="text-xs font-normal opacity-70">Match</span>
              </div>
            </div>

            {/* Matched Keywords (Green) */}
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('jobMatcher.matchedTitle')} ({matchedKeywords.length})</span>
              </h4>

              {matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-1.5"
                    >
                      <span>{kw.keyword}</span>
                      <span className="text-[10px] opacity-70 font-mono">({kw.countInCV}x)</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">{t('jobMatcher.noMatched')}</p>
              )}
            </div>

            {/* Missing Keywords (Red / Actionable) */}
            <div className="pt-2 border-t border-[#222f47]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>{t('jobMatcher.missingTitle')} ({missingKeywords.length})</span>
                </h4>

                {missingKeywords.length > 0 && (
                  <button
                    onClick={handleCopyMissing}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedMissing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMissing ? t('jobMatcher.copied') : t('jobMatcher.copyMissing')}</span>
                  </button>
                )}
              </div>

              {missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-1.5"
                    >
                      <span>+ {kw.keyword}</span>
                      <span className="text-[10px] opacity-70 font-mono">(0)</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-medium">{t('jobMatcher.allMatched')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
