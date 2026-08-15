import React from 'react';
import { X, Sparkles, Code, Palette } from 'lucide-react';
import { demoProfiles } from '../../data/initialData';
import { useCVStore } from '../../store/useCVStore';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';

interface DemoTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export const DemoTemplateModal: React.FC<DemoTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { importProfiles } = useCVStore();
  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  const handleLoadDemo = async (profileIndex: number) => {
    const demo = demoProfiles[profileIndex];
    if (!demo) return;

    const clonedDemo = {
      ...demo,
      id: `cv-demo-${Date.now()}`,
      title: `${demo.personal.jobTitle} (Sample)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await importProfiles([clonedDemo]);
    onSelect(clonedDemo.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-[#222f47] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222f47] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Sample Demo Templates</h2>
              <p className="text-xs text-slate-400">Pick a pre-populated profile to test cvire features</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-[#0d1322] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => handleLoadDemo(0)}
            className="group bg-[#0d1322] border border-[#222f47] hover:border-blue-500 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Code className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              Software Engineer
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Optimized for Web Developers, Fullstack Engineers, and Tech Leads.
            </p>
          </div>

          <div
            onClick={() => handleLoadDemo(1)}
            className="group bg-[#0d1322] border border-[#222f47] hover:border-purple-500 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
              <Palette className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
              UI/UX Product Designer
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Tailored for Product Designers, UX Researchers, and Creative Leads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
