/**
 * teamSlice — Redux slice managing task state for the workflow board.
 *
 * All task CRUD operations live here. Persistence is handled automatically
 * by redux-persist (configured in store.ts), so no manual localStorage
 * or sessionStorage calls are needed.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task, TaskStatus } from "../../types/task";
import {
  createTask as createTaskHelper,
  updateTask as updateTaskHelper,
} from "../../utils/taskHelpers";

/* ─── State shape ─── */
interface TeamState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  tasks: [],
  loading: false,
  error: null,
};

/* ─── Slice definition ─── */
const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    /**
     * Add a new task. Generates id + timestamps via createTask helper.
     */
    addTask: {
      reducer(state, action: PayloadAction<Task>) {
        state.tasks.unshift(action.payload);
      },
      prepare(
        data: Omit<Task, "id" | "createdAt" | "updatedAt"> & { title: string },
      ) {
        return { payload: createTaskHelper(data) };
      },
    },

    /**
     * Edit an existing task by id.
     */
    editTask(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<Omit<Task, "id" | "createdAt">>;
      }>,
    ) {
      const { id, changes } = action.payload;
      const index = state.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        state.tasks[index] = updateTaskHelper(state.tasks[index], changes);
      }
    },

    /**
     * Delete a task by id.
     */
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },

    /**
     * Move a task to a new status column.
     */
    moveTask(
      state,
      action: PayloadAction<{ id: string; newStatus: TaskStatus }>,
    ) {
      const { id, newStatus } = action.payload;
      const index = state.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        state.tasks[index] = updateTaskHelper(state.tasks[index], {
          status: newStatus,
        });
      }
    },

    /**
     * Bulk-set tasks (useful for testing or data import).
     */
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },

    /**
     * Set an error message.
     */
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },

    /**
     * Clear the current error.
     */
    clearError(state) {
      state.error = null;
    },
  },
});

/* ─── Action exports ─── */
export const {
  addTask,
  editTask,
  deleteTask,
  moveTask,
  setTasks,
  setError,
  clearError,
} = teamSlice.actions;

/* ─── Selector exports ─── */
export const selectTasks = (state: { team: TeamState }) => state.team.tasks;
export const selectLoading = (state: { team: TeamState }) => state.team.loading;
export const selectError = (state: { team: TeamState }) => state.team.error;
export const selectTaskById = (state: { team: TeamState }, id: string) =>
  state.team.tasks.find(t => t.id === id);

/* ─── Reducer export ─── */
export default teamSlice.reducer;
