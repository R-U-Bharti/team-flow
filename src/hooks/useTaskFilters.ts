/**
 * useTaskFilters — syncs filter/sort state with URL query parameters.
 *
 * This enables bookmarkable and shareable filter states.
 * Uses React Router's useSearchParams for URL sync.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  TaskFilters,
  TaskSortField,
  TaskSortOrder,
} from "../types/filters";
import { DEFAULT_FILTERS } from "../types/filters";
import type { TaskPriority, TaskStatus } from "../types/task";

const VALID_STATUSES: TaskStatus[] = ["backlog", "in-progress", "done"];
const VALID_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
const VALID_SORT_FIELDS: TaskSortField[] = [
  "createdAt",
  "updatedAt",
  "priority",
];
const VALID_SORT_ORDERS: TaskSortOrder[] = ["asc", "desc"];

function parseStatuses(param: string | null): TaskStatus[] {
  if (!param) return [];
  return param
    .split(",")
    .filter((s): s is TaskStatus => VALID_STATUSES.includes(s as TaskStatus));
}

function parsePriority(param: string | null): TaskPriority | null {
  if (!param || !VALID_PRIORITIES.includes(param as TaskPriority)) return null;
  return param as TaskPriority;
}

function parseSortField(param: string | null): TaskSortField {
  if (!param || !VALID_SORT_FIELDS.includes(param as TaskSortField))
    return DEFAULT_FILTERS.sortBy;
  return param as TaskSortField;
}

function parseSortOrder(param: string | null): TaskSortOrder {
  if (!param || !VALID_SORT_ORDERS.includes(param as TaskSortOrder))
    return DEFAULT_FILTERS.sortOrder;
  return param as TaskSortOrder;
}

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TaskFilters = useMemo(
    () => ({
      search: searchParams.get("q") || "",
      statuses: parseStatuses(searchParams.get("status")),
      priority: parsePriority(searchParams.get("priority")),
      sortBy: parseSortField(searchParams.get("sort")),
      sortOrder: parseSortOrder(searchParams.get("order")),
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (updates: Partial<TaskFilters>) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);

          if ("search" in updates) {
            if (updates.search) {
              next.set("q", updates.search);
            } else {
              next.delete("q");
            }
          }

          if ("statuses" in updates) {
            if (updates.statuses && updates.statuses.length > 0) {
              next.set("status", updates.statuses.join(","));
            } else {
              next.delete("status");
            }
          }

          if ("priority" in updates) {
            if (updates.priority) {
              next.set("priority", updates.priority);
            } else {
              next.delete("priority");
            }
          }

          if ("sortBy" in updates) {
            if (updates.sortBy && updates.sortBy !== DEFAULT_FILTERS.sortBy) {
              next.set("sort", updates.sortBy);
            } else {
              next.delete("sort");
            }
          }

          if ("sortOrder" in updates) {
            if (
              updates.sortOrder &&
              updates.sortOrder !== DEFAULT_FILTERS.sortOrder
            ) {
              next.set("order", updates.sortOrder);
            } else {
              next.delete("order");
            }
          }

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.statuses.length > 0 ||
    filters.priority !== null;

  return { filters, updateFilters, resetFilters, hasActiveFilters };
}
