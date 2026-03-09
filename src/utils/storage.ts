/**
 * localStorage persistence utilities with schema versioning and migration.
 */

import type { Task } from "../types/task";
import type {
  StorageSchema,
  StorageSchemaV1,
  MigrationResult,
  TaskV1,
} from "../types/storage";
import { CURRENT_SCHEMA_VERSION, STORAGE_KEY } from "../types/storage";

/**
 * Checks if localStorage is available.
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = "__teamflow_test__";
    localStorage.setItem(testKey, "ok");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Migrate V1 data → V2. Adds the `tags` field to every task.
 */
function migrateV1toV2(v1Data: StorageSchemaV1): StorageSchema {
  const migratedTasks: Task[] = v1Data.tasks.map((t: TaskV1) => ({
    ...t,
    tags: [],
    status: t.status as Task["status"],
    priority: t.priority as Task["priority"],
  }));

  return {
    schemaVersion: 2,
    tasks: migratedTasks,
  };
}

/**
 * Run all migrations needed to bring data up to CURRENT_SCHEMA_VERSION.
 */
function runMigrations(raw: {
  schemaVersion: number;
  tasks: unknown[];
}): MigrationResult {
  let data = raw as StorageSchema;
  const fromVersion = raw.schemaVersion;
  let migrated = false;

  if (raw.schemaVersion < 2) {
    data = migrateV1toV2(raw as unknown as StorageSchemaV1);
    migrated = true;
  }

  // Future migrations would go here:
  // if (data.schemaVersion < 3) { data = migrateV2toV3(data); migrated = true; }

  return { data, migrated, fromVersion };
}

/**
 * Load tasks from localStorage, running migrations if needed.
 */
export function loadTasksFromStorage(): MigrationResult & { error?: string } {
  if (!isStorageAvailable()) {
    return {
      data: { schemaVersion: CURRENT_SCHEMA_VERSION, tasks: [] },
      migrated: false,
      fromVersion: CURRENT_SCHEMA_VERSION,
      error: "localStorage is not available. Your data will not be persisted.",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      // First time — return empty data
      const data: StorageSchema = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        tasks: [],
      };
      return { data, migrated: false, fromVersion: CURRENT_SCHEMA_VERSION };
    }

    const parsed = JSON.parse(raw);

    // Handle legacy data without schema version
    if (!parsed.schemaVersion) {
      // Treat as v1 if it's an array or has tasks
      const asV1: StorageSchemaV1 = {
        schemaVersion: 1,
        tasks: Array.isArray(parsed) ? parsed : parsed.tasks || [],
      };
      const result = runMigrations(asV1);
      saveTasksToStorage(result.data.tasks);
      return { ...result, fromVersion: 1 };
    }

    if (parsed.schemaVersion < CURRENT_SCHEMA_VERSION) {
      const result = runMigrations(parsed);
      saveTasksToStorage(result.data.tasks);
      return result;
    }

    return {
      data: parsed as StorageSchema,
      migrated: false,
      fromVersion: parsed.schemaVersion,
    };
  } catch (err) {
    console.error("Failed to load tasks from storage:", err);
    return {
      data: { schemaVersion: CURRENT_SCHEMA_VERSION, tasks: [] },
      migrated: false,
      fromVersion: CURRENT_SCHEMA_VERSION,
      error: "Failed to read saved data. Starting with empty board.",
    };
  }
}

/**
 * Save tasks to localStorage.
 */
export function saveTasksToStorage(tasks: Task[]): { error?: string } {
  if (!isStorageAvailable()) {
    return { error: "localStorage is not available." };
  }

  try {
    const data: StorageSchema = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return {};
  } catch (err) {
    console.error("Failed to save tasks to storage:", err);
    return { error: "Failed to save data. Changes may be lost." };
  }
}

/**
 * Clear all task data from localStorage.
 */
export function clearTaskStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear storage:", err);
  }
}
