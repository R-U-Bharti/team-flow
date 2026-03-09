/**
 * Filter and sort types for the task board.
 */

import type { TaskPriority, TaskStatus } from "./task";

export type TaskSortField = "createdAt" | "updatedAt" | "priority";
export type TaskSortOrder = "asc" | "desc";

export interface TaskFilters {
  /** Text search across title and description */
  search: string;
  /** Filter by one or more statuses (empty = show all) */
  statuses: TaskStatus[];
  /** Filter by priority (null = show all) */
  priority: TaskPriority | null;
  /** Sort field */
  sortBy: TaskSortField;
  /** Sort direction */
  sortOrder: TaskSortOrder;
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: "",
  statuses: [],
  priority: null,
  sortBy: "createdAt",
  sortOrder: "desc",
};
