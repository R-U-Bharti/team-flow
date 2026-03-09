/**
 * Card component — a generic container with optional header, body, and footer slots.
 */

import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Remove padding from the card body */
  noPadding?: boolean;
}

function Card({
  children,
  noPadding = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-slate-900 rounded-xl border border-slate-800 shadow-sm
        transition-shadow duration-200 hover:shadow-md
        ${noPadding ? "" : "p-4"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
