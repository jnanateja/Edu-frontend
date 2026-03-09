import { useEffect } from "react";

/**
 * Warn users if they try to refresh/close tab with unsaved changes.
 * (React Router v6 doesn't have a built-in blocking prompt.)
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      // Chrome requires returnValue to be set.
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);
}
