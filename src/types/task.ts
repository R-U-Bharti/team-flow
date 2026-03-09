/**
 * Core task data types for the Team Workflow Board.
 */

export type TaskStatus = "backlog" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

/** Labels for rendering status columns */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In Progress",
  done: "Done",
};

/** Ordered list of statuses for column rendering */
export const STATUS_ORDER: TaskStatus[] = ["backlog", "in-progress", "done"];

/** Labels for rendering priority badges */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** Ordered list of priorities (lowest → highest) */
export const PRIORITY_ORDER: TaskPriority[] = ["low", "medium", "high"];
