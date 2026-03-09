/**
 * Modal component using the native <dialog> element for accessibility.
 *
 * Features:
 * - Focus trap (native <dialog> behavior)
 * - Escape key to close
 * - Overlay click to close
 * - aria-modal, aria-labelledby
 * - Auto-focus first focusable element on open
 */

import { type ReactNode, useEffect, useRef, useCallback } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Width class override, e.g. "max-w-2xl" */
  width?: string;
  /** Show close button in header */
  showCloseButton?: boolean;
}

function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
  showCloseButton = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `modal-title-${title.replace(/\s+/g, "-").toLowerCase()}`;

  // Open / close the dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle Escape key (native <dialog> handles this, but we sync state)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      // Only close if the click was directly on the dialog backdrop (not the inner content)
      if (e.target === dialog) {
        onClose();
      }
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-50 m-auto
        bg-transparent backdrop:bg-black/40 backdrop:backdrop-blur-sm
        md:p-4 overflow-visible
      "
    >
      <div
        className={`
          bg-slate-900 rounded-2xl shadow-2xl ${width} w-full
          animate-in fade-in slide-in-from-bottom-4 duration-200
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 id={titleId} className="text-lg font-semibold text-slate-100">
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800
                         transition-colors focus:outline-none focus-visible:ring-2
                         focus-visible:ring-cyan-500 cursor-pointer"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}

export { Modal };
