/**
 * Tag / Badge component for displaying labels like priority or tags.
 *
 * Supports color variants and an optional removable state.
 */

import type { HTMLAttributes, ReactNode } from "react";

export type TagVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  removable?: boolean;
  onRemove?: () => void;
  children: ReactNode;
}

const variantClasses: Record<TagVariant, string> = {
  default: "bg-slate-800 text-slate-200 border-slate-700",
  primary: "bg-cyan-900/30 text-cyan-300 border-cyan-800",
  success: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
  warning: "bg-amber-900/30 text-amber-300 border-amber-800",
  danger: "bg-red-900/30 text-red-300 border-red-800",
  info: "bg-sky-900/30 text-sky-300 border-sky-800",
};

function Tag({
  variant = "default",
  removable = false,
  onRemove,
  children,
  className = "",
  ...props
}: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium
        rounded-full border
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full
                     hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={`Remove ${typeof children === "string" ? children : "tag"}`}
        >
          <svg
            className="w-2.5 h-2.5"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3.17 3.17a.75.75 0 011.06 0L6 4.94l1.77-1.77a.75.75 0 111.06 1.06L7.06 6l1.77 1.77a.75.75 0 11-1.06 1.06L6 7.06 4.23 8.83a.75.75 0 01-1.06-1.06L4.94 6 3.17 4.23a.75.75 0 010-1.06z" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { Tag };
