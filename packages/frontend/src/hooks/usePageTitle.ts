import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document.title with the brand suffix.
 * Restores previous document title on unmount.
 */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | Naponi`;
    }
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
