import { useEffect } from 'react';

/**
 * Closes an open dialog when Escape is pressed.
 *
 * The listener lives on `document` so it fires wherever focus sits inside the
 * dialog, and it is only registered while the dialog is actually open — nothing
 * is listening for keystrokes when no dialog is on screen.
 */
export function useEscapeToClose(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
