/**
 * EmptyState — displayed when there are no tasks or no filter results.
 */

import { Button } from "../../components/ui";

interface EmptyStateProps {
  type: "no-tasks" | "no-results" | "error";
  onCreateTask?: () => void;
  onResetFilters?: () => void;
  errorMessage?: string;
}

function EmptyState({
  type,
  onCreateTask,
  onResetFilters,
  errorMessage,
}: EmptyStateProps) {
  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">
          Something went wrong
        </h3>
        <p className="text-sm text-slate-400 max-w-md">
          {errorMessage ||
            "There was an error loading your tasks. Please try refreshing the page."}
        </p>
      </div>
    );
  }

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-900/30 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">
          No tasks found
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          No tasks match your current filters. Try adjusting your search
          criteria.
        </p>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  // no-tasks
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-cyan-900/30 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-cyan-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">
        No tasks yet
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        Get started by creating your first task. Your team's work begins here.
      </p>
      {onCreateTask && (
        <Button variant="primary" onClick={onCreateTask}>
          + Create First Task
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
