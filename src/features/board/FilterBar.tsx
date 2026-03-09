// This component holds all the controls for searching, filtering by status/priority,
// and sorting the tasks. It syncs everything with the URL so filters survive a page reload.

import { useCallback } from "react";
import type { TaskFilters } from "../../types/filters";
import type { TaskStatus, TaskPriority } from "../../types/task";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
} from "../../types/task";
import { Select } from "../../components/ui";
import type { SelectOption } from "../../components/ui";

interface FilterBarProps {
  filters: TaskFilters;
  onUpdateFilters: (updates: Partial<TaskFilters>) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const sortOptions: SelectOption[] = [
  { value: "createdAt", label: "Created date" },
  { value: "updatedAt", label: "Updated date" },
  { value: "priority", label: "Priority" },
];

const orderOptions: SelectOption[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

const priorityFilterOptions: SelectOption[] = [
  { value: "", label: "All priorities" },
  ...PRIORITY_ORDER.map(p => ({ value: p, label: PRIORITY_LABELS[p] })),
];

function FilterBar({
  filters,
  onUpdateFilters,
  // onResetFilters,
  // hasActiveFilters,
}: FilterBarProps) {
  const handleStatusToggle = useCallback(
    (status: TaskStatus) => {
      const current = filters.statuses;
      const updated = current.includes(status)
        ? current.filter(s => s !== status)
        : [...current, status];
      onUpdateFilters({ statuses: updated });
    },
    [filters.statuses, onUpdateFilters],
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3 md:gap-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="filter-search"
            className="text-xs font-medium text-slate-400 mb-1 block"
          >
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="filter-search"
              type="search"
              value={filters.search}
              onChange={e => onUpdateFilters({ search: e.target.value })}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-slate-100
                       focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                       placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Status Filter (toggle buttons) */}
        <div className="border px-4 py-2 rounded-xl border-slate-700 md:w-auto w-full">
          <span className="text-xs font-medium text-slate-400 mb-1 block">
            Status
          </span>
          <div className="flex gap-1 flex-wrap">
            {STATUS_ORDER.map(status => {
              const isActive = filters.statuses.includes(status);

              const activeClasses: Record<TaskStatus, string> = {
                backlog: "bg-red-900/30 border-red-700/50 text-red-200",
                "in-progress":
                  "bg-blue-900/30 border-blue-700/50 text-blue-200",
                done: "bg-emerald-900/30 border-emerald-700/50 text-emerald-200",
              };

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className={`
                    px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer
                    ${
                      isActive
                        ? activeClasses[status]
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }
                  `}
                  aria-pressed={isActive}
                >
                  {STATUS_LABELS[status]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Priority Filter */}
          <div className="min-w-[140px] md:w-auto w-full">
            <Select
              label="Priority"
              options={priorityFilterOptions}
              value={filters.priority ?? ""}
              onChange={e =>
                onUpdateFilters({
                  priority: (e.target.value as TaskPriority) || null,
                })
              }
            />
          </div>

          {/* Sort */}
          <div className="min-w-[140px] md:w-auto w-full">
            <Select
              label="Sort by"
              options={sortOptions}
              value={filters.sortBy}
              onChange={e =>
                onUpdateFilters({
                  sortBy: e.target.value as TaskFilters["sortBy"],
                })
              }
            />
          </div>

          {/* Order */}
          <div className="min-w-[130px] md:w-auto w-full">
            <Select
              label="Order"
              options={orderOptions}
              value={filters.sortOrder}
              onChange={e =>
                onUpdateFilters({
                  sortOrder: e.target.value as TaskFilters["sortOrder"],
                })
              }
            />
          </div>
        </div>

        {/* {hasActiveFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            Clear filters
          </Button>
        )} */}
      </div>
    </div>
  );
}

export { FilterBar };
