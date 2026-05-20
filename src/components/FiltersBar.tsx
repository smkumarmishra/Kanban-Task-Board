import { Priority, Task, kanbanActions } from '../store/kanbanSlice';
import { useAppDispatch, useAppSelector } from '../util/reduxHooks';

type Props = {
  tasks: Task[];
};

const priorities: Array<'All' | Priority> = ['All', 'Low', 'Medium', 'High'];

function FiltersBar({ tasks }: Props) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.kanban.filters);
  const canUndo = useAppSelector((s) => Boolean(s.kanban.undo.snapshot));

  const assignees = Array.from(
    new Set(tasks.map((t) => t.assignee.trim()).filter((a) => a.length > 0))
  ).sort((a, b) => a.localeCompare(b));

  const setPriority = (value: 'All' | Priority) => {
    dispatch(kanbanActions.setFilters({ priority: value }));
  };
  const setAssignee = (value: 'All' | string) => {
    dispatch(kanbanActions.setFilters({ assignee: value }));
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto mt-10 px-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-300">Priority</span>
            <select
              value={filters.priority}
              onChange={(e) => setPriority(e.target.value as 'All' | Priority)}
              className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 outline-none focus:border-red-500"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-300">Assignee</span>
            <select
              value={filters.assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1 outline-none focus:border-red-500"
            >
              <option value="All">All</option>
              {assignees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => dispatch(kanbanActions.clearFilters())}
            className="text-sm px-3 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-600 transition"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(kanbanActions.undoLast())}
            disabled={!canUndo}
            className="text-sm px-3 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-600 transition disabled:opacity-50 disabled:hover:border-slate-800"
          >
            Undo
          </button>
          <button
            onClick={() => dispatch(kanbanActions.resetBoard())}
            className="text-sm px-3 py-1 rounded-md bg-slate-900 border border-red-900 hover:border-red-500 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default FiltersBar;
