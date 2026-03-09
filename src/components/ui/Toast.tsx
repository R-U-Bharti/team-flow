/**
 * Toast notification system using React Context.
 *
 * Provides a ToastProvider and useToast hook for showing ephemeral notifications.
 * Variants: success, error, warning, info
 */

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number; // ms
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `toast-${++toastCounter}`;
      setToasts(prev => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/* ─── Toast Container ─── */

const variantStyles: Record<
  ToastVariant,
  { bg: string; icon: string; border: string }
> = {
  success: {
    bg: "bg-slate-900",
    border: "border-emerald-800",
    icon: "✓",
  },
  error: {
    bg: "bg-slate-900",
    border: "border-red-800",
    icon: "✕",
  },
  warning: {
    bg: "bg-slate-900",
    border: "border-amber-800",
    icon: "⚠",
  },
  info: {
    bg: "bg-slate-900",
    border: "border-sky-800",
    icon: "ℹ",
  },
};

const variantTextColors: Record<ToastVariant, string> = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-400",
  info: "text-sky-400",
};

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItemComponent
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItemComponent({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const style = variantStyles[toast.variant];
  const textColor = variantTextColors[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timerRef.current = setTimeout(onDismiss, toast.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto min-w-[300px] max-w-md
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
        animate-in slide-in-from-right-5 fade-in duration-300
        ${style.bg} ${style.border}
      `}
    >
      <span
        className={`text-base flex-shrink-0 mt-0.5 ${textColor}`}
        aria-hidden="true"
      >
        {style.icon}
      </span>
      <p className={`text-sm font-medium flex-1 ${textColor}`}>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className={`flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer ${textColor}`}
        aria-label="Dismiss notification"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

export { ToastContainer };
