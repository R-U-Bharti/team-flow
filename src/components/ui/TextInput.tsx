/**
 * TextInput component with label, error, and helper text.
 */

import { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    { label, error, helperText, className = "", id: externalId, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = externalId || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-200"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            [errorId, helperId].filter(Boolean).join(" ") || undefined
          }
          className={`
            w-full px-3 py-2 text-sm rounded-lg border bg-slate-900 text-slate-100
            transition-colors duration-150
            placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-slate-950
            ${
              error
                ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                : "border-slate-700 focus:ring-cyan-500 focus:border-cyan-500"
            }
            disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export { TextInput };
