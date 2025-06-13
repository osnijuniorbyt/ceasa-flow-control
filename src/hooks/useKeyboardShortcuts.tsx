
import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          config.onEnter?.();
          break;
        case ' ':
          event.preventDefault();
          config.onSpace?.();
          break;
        case 'Escape':
          event.preventDefault();
          config.onEscape?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [config]);
}
