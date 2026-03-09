import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import type { Task } from "../../types/task";
import { PRIORITY_LABELS } from "../../types/task";
import { getRelativeTime } from "../../utils/taskHelpers";
import { Card, Tag } from "../../components/ui";
import type { TagVariant } from "../../components/ui";

interface TaskCardContentProps extends HTMLAttributes<HTMLDivElement> {
  task: Task;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const priorityVariantMap: Record<Task["priority"], TagVariant> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

export const TaskCardContent = forwardRef<HTMLDivElement, TaskCardContentProps>(
  ({ task, isDragging, isOverlay, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          ${isDragging && !isOverlay ? "opacity-30" : "opacity-100"}
          ${isOverlay ? "shadow-xl ring-2 ring-indigo-500/50 cursor-grabbing" : "cursor-pointer"}
          transition-opacity duration-200
          ${className}
        `}
        {...props}
      >
        <Card className="p-3! hover:border-cyan-300 hover:shadow-md transition-all duration-200 group">
          {/* Priority Badge */}
          <div className="flex items-center justify-between mb-2">
            <Tag
              variant={priorityVariantMap[task.priority]}
              className="text-[10px]"
            >
              {PRIORITY_LABELS[task.priority]}
            </Tag>
            <span className="text-[10px] text-slate-400">
              {getRelativeTime(task.updatedAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {task.title}
          </h3>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.slice(0, 3).map(tag => (
                <Tag key={tag} variant="primary" className="text-[10px]">
                  {tag}
                </Tag>
              ))}
              {task.tags.length > 3 && (
                <span className="text-[10px] text-slate-400">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-slate-800">
              <div className="w-5 h-5 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {task.assignee.charAt(0)}
              </div>
              <span className="text-xs text-slate-300 truncate">
                {task.assignee}
              </span>
            </div>
          )}
        </Card>
      </div>
    );
  },
);

TaskCardContent.displayName = "TaskCardContent";
