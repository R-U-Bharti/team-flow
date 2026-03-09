// This hook wraps our Redux logic so our React components don't have to
// deal directly with dispatching actions or selecting state.
// We handle persistence through redux-persist now, so no manual storage code here.

import { useCallback } from "react";
import type { Task, TaskStatus } from "../types/task";
import { useAppDispatch, useAppSelector } from "../redux/reduxHooks";
import {
  addTask as addTaskAction,
  editTask as editTaskAction,
  deleteTask as deleteTaskAction,
  moveTask as moveTaskAction,
  selectTasks,
  selectLoading,
  selectError,
} from "../redux/slices/teamSlice";

interface UseTaskStoreReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  addTask: (
    data: Omit<Task, "id" | "createdAt" | "updatedAt"> & { title: string },
  ) => Task;
  editTask: (
    id: string,
    changes: Partial<Omit<Task, "id" | "createdAt">>,
  ) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  getTaskById: (id: string) => Task | undefined;
}

export function useTaskStore(): UseTaskStoreReturn {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasks);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const addTask = useCallback(
    (
      data: Omit<Task, "id" | "createdAt" | "updatedAt"> & { title: string },
    ): Task => {
      // Dispatch returns the action; the prepared payload contains the full Task
      const action = dispatch(addTaskAction(data));
      return (action as ReturnType<typeof addTaskAction>).payload;
    },
    [dispatch],
  );

  const editTask = useCallback(
    (id: string, changes: Partial<Omit<Task, "id" | "createdAt">>) => {
      dispatch(editTaskAction({ id, changes }));
    },
    [dispatch],
  );

  const deleteTask = useCallback(
    (id: string) => {
      dispatch(deleteTaskAction(id));
    },
    [dispatch],
  );

  const moveTask = useCallback(
    (id: string, newStatus: TaskStatus) => {
      dispatch(moveTaskAction({ id, newStatus }));
    },
    [dispatch],
  );

  const getTaskById = useCallback(
    (id: string) => tasks.find(t => t.id === id),
    [tasks],
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    deleteTask,
    moveTask,
    getTaskById,
  };
}
