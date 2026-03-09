/**
 * Storage schema versioning types for localStorage persistence.
 *
 * Migration strategy:
 * - Each schema version is a number (starting at 1).
 * - When loading data, we compare the stored version against CURRENT_SCHEMA_VERSION.
 * - If older, we run all migration functions sequentially until current.
 * - A toast notification is shown when migration occurs.
 */

import type { Task } from "./task";

/** The current schema version. Increment when changing the Task shape. */
export const CURRENT_SCHEMA_VERSION = 2;

/** localStorage key for the task data */
export const STORAGE_KEY = "teamflow_tasks";

/** Shape of what we store in localStorage */
export interface StorageSchema {
  schemaVersion: number;
  tasks: Task[];
}

/**
 * V1 Task shape — before tags were added.
 * Used for migration from v1 → v2.
 */
export interface TaskV1 {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageSchemaV1 {
  schemaVersion: 1;
  tasks: TaskV1[];
}

export interface MigrationResult {
  data: StorageSchema;
  migrated: boolean;
  fromVersion: number;
}
