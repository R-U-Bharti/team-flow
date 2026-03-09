import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../../types/task";
import { TaskCardContent } from "./TaskCardContent";

export interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard = memo(function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TaskCardContent
      ref={setNodeRef}
      task={task}
      isDragging={isDragging}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    />
  );
});

export { TaskCard };
