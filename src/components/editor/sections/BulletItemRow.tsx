import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Trash2 } from 'lucide-react';
import { BulletItem } from '../../../types/cv';

/** Individual bullet editor row; local text state preserves cursor position & focus. */
export const BulletItemRow: React.FC<{
  bullet: BulletItem;
  onUpdate: (partial: Partial<BulletItem>) => void;
  onDelete: () => void;
}> = ({ bullet, onUpdate, onDelete }) => {
  const [localText, setLocalText] = useState(bullet.text);

  useEffect(() => {
    setLocalText(bullet.text);
  }, [bullet.text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalText(val);
    onUpdate({ text: val });
  };

  return (
    <div className="flex items-start gap-2 bg-[#0d1322] border border-[#222f47] p-2 rounded-lg">
      <button
        type="button"
        onClick={() => onUpdate({ enabled: !bullet.enabled })}
        className="mt-1 text-slate-400 hover:text-blue-400 cursor-pointer"
        title={bullet.enabled ? 'Disable Bullet' : 'Enable Bullet'}
      >
        {bullet.enabled ? (
          <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
        ) : (
          <Square className="w-3.5 h-3.5" />
        )}
      </button>

      <textarea
        rows={2}
        value={localText}
        onChange={handleChange}
        placeholder="Describe achievement or responsibility..."
        className={`flex-1 bg-transparent text-xs text-slate-200 outline-none resize-y leading-relaxed ${
          !bullet.enabled ? 'line-through opacity-50' : ''
        }`}
      />

      <button
        type="button"
        onClick={onDelete}
        className="mt-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
        title="Delete Bullet"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
