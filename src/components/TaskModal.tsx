import { useEffect, useMemo, useState } from 'react';
import { ColumnId, Priority, Task, kanbanActions } from '../store/kanbanSlice';
import { useAppDispatch } from '../util/reduxHooks';

export type TaskModalMode =
  | { type: 'create'; columnId: ColumnId }
  | { type: 'edit'; task: Task; columnId: ColumnId };

type Props = {
  mode: TaskModalMode | null;
  onClose: () => void;
};

const priorities: Priority[] = ['Low', 'Medium', 'High'];

function TaskModal({ mode, onClose }: Props) {
  const dispatch = useAppDispatch();
  const isOpen = mode !== null;

  const initial = useMemo(() => {
    if (!mode) {
      return { title: '', priority: 'Medium' as Priority, assignee: '', description: '' };
    }
    if (mode.type === 'edit') {
      return {
        title: mode.task.title,
        priority: mode.task.priority,
        assignee: mode.task.assignee,
        description: mode.task.description || '',
      };
    }
    return { title: '', priority: 'Medium' as Priority, assignee: '', description: '' };
  }, [mode]);

  const [title, setTitle] = useState(initial.title);
  const [priority, setPriority] = useState<Priority>(initial.priority);
  const [assignee, setAssignee] = useState(initial.assignee);
  const [description, setDescription] = useState(initial.description);

  useEffect(() => {
    setTitle(initial.title);
    setPriority(initial.priority);
    setAssignee(initial.assignee);
    setDescription(initial.description);
  }, [initial]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mode) return;

    if (mode.type === 'create') {
      dispatch(
        kanbanActions.addTask({
          columnId: mode.columnId,
          title,
          priority,
          assignee,
          description,
        })
      );
      onClose();
      return;
    }

    dispatch(
      kanbanActions.updateTask({
        taskId: mode.task.id,
        patch: { title, priority, assignee, description },
      })
    );
    onClose();
  };

  const heading = mode.type === 'create' ? 'Create Task' : 'Edit Task';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-[36rem] max-w-[92vw] bg-slate-950 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold">{heading}</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-900 border border-transparent hover:border-red-500 transition"
          >
            Close
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-300">
              Title <span className="text-red-400">*</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 outline-none focus:border-red-500"
              autoFocus
              placeholder="e.g. Fix login redirect"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-neutral-300">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 outline-none focus:border-red-500"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-neutral-300">Assignee</span>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 outline-none focus:border-red-500"
                placeholder="e.g. Asha"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-300">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 outline-none focus:border-red-500 resize-none h-28"
              placeholder="Optional details…"
            />
          </label>

          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 transition text-white disabled:opacity-50"
              disabled={!title.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
