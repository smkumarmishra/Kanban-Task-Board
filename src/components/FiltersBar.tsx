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
  const setQuery = (value: string) => {
    dispatch(kanbanActions.setFilters({ query: value }));
  };

  return (
    <div className="w-full max-w-[100rem] mx-auto mt-10 px-4">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-400"
              >
                <path
                  d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              value={filters.query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assignee or priority…"
              className="w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-md pl-9 pr-9 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition"
            />
            {filters.query.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-200 transition"
                aria-label="Clear search"
                title="Clear"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

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
