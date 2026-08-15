import React, { useEffect, useState } from 'react';
import { X, History, RotateCcw, Plus, Clock } from 'lucide-react';
import { useCVStore } from '../../store/useCVStore';
import { useUIStore } from '../../store/useUIStore';
import { getProfileVersions, restoreVersionSnapshot, saveVersionSnapshot } from '../../services/versionService';
import { CVVersion } from '../../types/cv';

export const VersionHistoryDrawer: React.FC = () => {
  const { activeProfile, refreshProfiles } = useCVStore();
  const { activeModal, closeModal } = useUIStore();
  const [versions, setVersions] = useState<(CVVersion & { profileId: string })[]>([]);
  const [commitNote, setCommitNote] = useState('');

  useEffect(() => {
    if (activeProfile && activeModal === 'version-history') {
      getProfileVersions(activeProfile.id).then(setVersions);
    }
  }, [activeProfile, activeModal]);

  if (activeModal !== 'version-history' || !activeProfile) return null;

  const handleCreateSnapshot = async () => {
    const note = commitNote.trim() || 'Manual Checkpoint';
    await saveVersionSnapshot(activeProfile, note);
    setCommitNote('');
    const updated = await getProfileVersions(activeProfile.id);
    setVersions(updated);
  };

  const handleRestore = async (version: CVVersion & { profileId: string }) => {
    const restored = await restoreVersionSnapshot(version);
    // The restored data only exists in IndexedDB at this point — re-read the
    // store from the database so the editor immediately shows the snapshot.
    await refreshProfiles(restored.id);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-[#222f47] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222f47] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Version History</h2>
              <p className="text-xs text-slate-400">Saved checkpoints for {activeProfile.title}</p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#0d1322] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Snapshot Form */}
        <div className="flex gap-2 mb-6 bg-[#0d1322] p-3 rounded-2xl border border-[#222f47]">
          <input
            type="text"
            placeholder="Checkpoint Note (e.g., Before Senior Dev update)"
            value={commitNote}
            onChange={(e) => setCommitNote(e.target.value)}
            className="flex-1 bg-[#131b2e] border border-[#222f47] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
          />
          <button
            onClick={handleCreateSnapshot}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Save Snapshot</span>
          </button>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {versions.length > 0 ? (
            versions.map((ver) => (
              <div
                key={ver.versionId}
                className="bg-[#0d1322] border border-[#222f47] p-4 rounded-2xl flex items-center justify-between hover:border-slate-500 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-200">{ver.commitNote}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {new Date(ver.timestamp).toLocaleString()} • {ver.dataSnapshot.personal.fullName || 'Draft'}
                  </p>
                </div>

                <button
                  onClick={() => handleRestore(ver)}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              No version snapshots saved yet. Click "Save Snapshot" above to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
