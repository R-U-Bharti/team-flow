/**
 * BoardColumn — a single column in the Kanban board (Backlog, In Progress, Done).
 *
 * Accepts dropped tasks and renders task cards inside a scrollable area.
 */

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "../../types/task";
import { STATUS_LABELS } from "../../types/task";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const statusColorMap: Record<
  TaskStatus,
  { bg: string; border: string; dot: string; count: string }
> = {
  backlog: {
    bg: "bg-red-950/20",
    border: "border-red-900/50",
    dot: "bg-red-500",
    count: "bg-red-900/30 text-red-400",
  },
  "in-progress": {
    bg: "bg-blue-950/20",
    border: "border-blue-900/50",
    dot: "bg-blue-500",
    count: "bg-blue-900/30 text-blue-400",
  },
  done: {
    bg: "bg-emerald-950/20",
    border: "border-emerald-900/50",
    dot: "bg-emerald-500",
    count: "bg-emerald-900/30 text-emerald-400",
  },
};

function BoardColumn({ status, tasks, onTaskClick }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = statusColorMap[status];

  return (
    <div
      className={`
        flex flex-col min-w-[280px] max-w-[350px] w-full
        rounded-2xl ${colors.bg} border ${colors.border}
        transition-all duration-200 m-2
        ${isOver ? "ring-2 ring-indigo-800" : ""}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <h2 className="text-sm font-semibold text-slate-200">
          {STATUS_LABELS[status]}
        </h2>
        <span
          className={`
            text-xs font-medium px-1.5 py-0.5 rounded-full
            ${colors.count}
          `}
        >
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto min-h-37.5 max-h-[calc(100vh-260px)] scrollbar-hide"
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-slate-500">
            <p>No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}

export { BoardColumn };
