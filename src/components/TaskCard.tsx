import { SyntheticEvent } from 'react';
import { RiDeleteBinLine, RiEdit2Line } from 'react-icons/ri';
import { Task } from '../store/kanbanSlice';

type Props = {
  task: Task;
  isDragging?: boolean;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

const priorityClasses: Record<Task['priority'], string> = {
  Low: 'bg-emerald-950 text-emerald-200 border-emerald-800',
  Medium: 'bg-amber-950 text-amber-200 border-amber-800',
  High: 'bg-red-950 text-red-200 border-red-800',
};

function TaskCard({ task, isDragging, onEdit, onDelete }: Props) {
  const deleteTaskHandler = (event: SyntheticEvent) => {
    event.stopPropagation();
    onDelete(task.id);
  };

  const editHandler = (event: SyntheticEvent) => {
    event.stopPropagation();
    onEdit(task.id);
  };

  return (
    <div
      className={`bg-slate-950 rounded-xl p-3 flex flex-col gap-2 border border-transparent hover:border-red-500 transition ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onEdit(task.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-5 break-words">
          {task.title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={editHandler}
            className="p-1 text-lg text-neutral-500 hover:text-neutral-200 transition"
            aria-label="Edit task"
          >
            <RiEdit2Line />
          </button>
          <button
            onClick={deleteTaskHandler}
            className="p-1 text-lg text-neutral-500 hover:text-neutral-200 transition"
            aria-label="Delete task"
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${priorityClasses[task.priority]}`}
        >
          {task.priority}
        </span>
        <span className="text-xs text-neutral-300 truncate max-w-[9rem]">
          {task.assignee || 'Unassigned'}
        </span>
      </div>
    </div>
  );
}

export default TaskCard;

