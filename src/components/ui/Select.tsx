/**
 * Select component with label, error, and styled dropdown.
 */

import { type SelectHTMLAttributes, forwardRef, useId } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      className = "",
      id: externalId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = externalId || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`
              w-full px-3 py-2 pr-8 text-sm rounded-lg border bg-slate-900 text-slate-100
              appearance-none cursor-pointer
              transition-colors duration-150
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };
