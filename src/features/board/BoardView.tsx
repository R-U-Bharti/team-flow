// This is the main piece of the puzzle. It brings together the Redux state,
// our filtering logic, and the drag-and-drop library (@dnd-kit).
// It also handles showing the task creation/edit modal.

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  rectIntersection,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "../../types/task";
import { STATUS_ORDER } from "../../types/task";
import { useTaskStore, useTaskFilters } from "../../hooks";
import { filterTasks, sortTasks, groupTasksByStatus } from "../../utils";
import { useToast, Button } from "../../components/ui";
import { BoardColumn } from "./BoardColumn";
import { TaskCardContent } from "./TaskCardContent";
import { TaskForm, type TaskFormValues } from "./TaskForm";
import { FilterBar } from "./FilterBar";
import { EmptyState } from "./EmptyState";

function BoardView() {
  const { tasks, loading, error, addTask, editTask, deleteTask, moveTask } =
    useTaskStore();

  const { filters, updateFilters, resetFilters, hasActiveFilters } =
    useTaskFilters();
  const { addToast } = useToast();

  // Modal visibility and the task we're currently editing
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Keep track of which task is currently being dragged around
  const [activeId, setActiveId] = useState<string | null>(null);

  // Show a generic error toast if something fails (like storage)
  useEffect(() => {
    if (error) {
      addToast(error, "error", 8000);
    }
  }, [error, addToast]);

  // First we filter, then we sort to figure out exactly what to show
  const processedTasks = useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    return sortTasks(filtered, filters.sortBy, filters.sortOrder);
  }, [tasks, filters]);

  // Then we group them into columns based on status
  const groupedTasks = useMemo(
    () => groupTasksByStatus(processedTasks),
    [processedTasks],
  );

  // Set up mouse/touch and keyboard listeners for drag and drop.
  // The activation constraint is nice so we don't accidentally start dragging
  // when the user just meant to click a task.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const activeTask = useMemo(
    () => tasks.find(t => t.id === activeId),
    [tasks, activeId],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // This fires when the user drops a card. We need to figure out
  // if they dropped it on another card, or just in the empty space of a column.
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      // If they dragged it off the screen or nowhere valid, just ignore it
      if (!over) return;

      const taskId = active.id as string;
      const overTarget = over.id as string;

      // Scenario 1: They dropped it explicitly on a column background
      if (STATUS_ORDER.includes(overTarget as TaskStatus)) {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== overTarget) {
          moveTask(taskId, overTarget as TaskStatus);
          addToast(
            `Task moved to ${overTarget === "in-progress" ? "In Progress" : overTarget.charAt(0).toUpperCase() + overTarget.slice(1)}`,
            "success",
            3000,
          );
        }
      } else {
        // Scenario 2: They dropped it on top of another card. We figure out
        // what column that target card is in, and move our card there.
        const overTask = tasks.find(t => t.id === overTarget);
        if (overTask) {
          const task = tasks.find(t => t.id === taskId);
          if (task && task.status !== overTask.status) {
            moveTask(taskId, overTask.status);
            addToast(
              `Task moved to ${overTask.status === "in-progress" ? "In Progress" : overTask.status.charAt(0).toUpperCase() + overTask.status.slice(1)}`,
              "success",
              3000,
            );
          }
        }
      }
    },
    [tasks, moveTask, addToast],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Task form handlers
  const handleOpenCreate = useCallback(() => {
    setEditingTask(null);
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleSubmit = useCallback(
    (values: TaskFormValues) => {
      if (editingTask) {
        editTask(editingTask.id, values);
        addToast("Task updated successfully", "success");
      } else {
        addTask(values);
        addToast("Task created successfully", "success");
      }
      handleCloseForm();
    },
    [editingTask, editTask, addTask, addToast, handleCloseForm],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTask(id);
      addToast("Task deleted", "info");
      handleCloseForm();
    },
    [deleteTask, addToast, handleCloseForm],
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Error state (no storage)
  if (error && tasks.length === 0) {
    return <EmptyState type="error" errorMessage={error} />;
  }

  const hasTasks = tasks.length > 0;
  const hasFilteredTasks = processedTasks.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Workflow Board
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            {hasActiveFilters && ` · ${processedTasks.length} shown`}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Reset */}
          {hasActiveFilters && (
            <Button variant="secondary" size="md" onClick={() => resetFilters()}>
              Clear filters
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            id="create-task-btn"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onUpdateFilters={updateFilters}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Board or empty states */}
      {!hasTasks ? (
        <EmptyState type="no-tasks" onCreateTask={handleOpenCreate} />
      ) : !hasFilteredTasks ? (
        <EmptyState type="no-results" onResetFilters={resetFilters} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map(status => (
              <BoardColumn
                key={status}
                status={status}
                tasks={groupedTasks[status]}
                onTaskClick={handleOpenEdit}
              />
            ))}
          </div>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: "0.4",
                  },
                },
              }),
            }}
          >
            {activeId && activeTask ? (
              <TaskCardContent task={activeTask} isOverlay className="w-70" />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export { BoardView };
