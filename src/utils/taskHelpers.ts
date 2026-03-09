/**
 * Helper utilities for creating, filtering, and sorting tasks.
 */

import { v4 as uuidv4 } from "uuid";
import { formatDistanceToNow } from "date-fns";
import type { Task, TaskStatus, TaskPriority } from "../types/task";
import { PRIORITY_ORDER } from "../types/task";
import type {
  TaskFilters,
  TaskSortField,
  TaskSortOrder,
} from "../types/filters";

/**
 * Create a new Task with defaults.
 */
export function createTask(
  overrides: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">> & {
    title: string;
  },
): Task {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: overrides.title,
    description: overrides.description ?? "",
    status: overrides.status ?? "backlog",
    priority: overrides.priority ?? "medium",
    assignee: overrides.assignee ?? "",
    tags: overrides.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a task, bumping `updatedAt`.
 */
export function updateTask(
  task: Task,
  changes: Partial<Omit<Task, "id" | "createdAt">>,
): Task {
  return {
    ...task,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Format a date string to a human-readable relative time (e.g. "3 hours ago").
 */
export function getRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "unknown";
  }
}

/**
 * Get the priority weight for sorting (higher = more urgent).
 */
function getPriorityWeight(priority: TaskPriority): number {
  return PRIORITY_ORDER.indexOf(priority);
}

/**
 * Filter tasks based on filter criteria.
 */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    // Status filter
    if (
      filters.statuses.length > 0 &&
      !filters.statuses.includes(task.status)
    ) {
      return false;
    }

    // Priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    // Text search (in title and description, case-insensitive)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const inTitle = task.title.toLowerCase().includes(searchLower);
      const inDescription = task.description
        .toLowerCase()
        .includes(searchLower);
      const inAssignee = task.assignee.toLowerCase().includes(searchLower);
      if (!inTitle && !inDescription && !inAssignee) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort tasks by a given field and order.
 */
export function sortTasks(
  tasks: Task[],
  sortBy: TaskSortField,
  sortOrder: TaskSortOrder,
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "priority":
        comparison =
          getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Group tasks by status.
 */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    backlog: [],
    "in-progress": [],
    done: [],
  };

  tasks.forEach(task => {
    grouped[task.status].push(task);
  });

  return grouped;
}
