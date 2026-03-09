// Custom hook to keep track of form edits so we can warn users
// if they try to close a modal without saving.
import { useCallback, useState } from "react";
import { useConfirm } from "../components/ui";

interface UseUnsavedChangesReturn {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  // Returns true if the user clicks "Discard" or if no changes were made
  confirmDiscard: () => Promise<boolean>;
}

export function useUnsavedChanges(
  initialDirty = false,
): UseUnsavedChangesReturn {
  const [isDirty, setDirty] = useState(initialDirty);
  const confirm = useConfirm();

  const confirmDiscard = useCallback(async () => {
    if (!isDirty) return true;
    return confirm({
      title: "Discard Changes?",
      message:
        "You have unsaved changes. Are you sure you want to discard them?",
      confirmLabel: "Discard",
      cancelLabel: "Keep Editing",
      variant: "destructive",
    });
  }, [isDirty, confirm]);

  return { isDirty, setDirty, confirmDiscard };
}
