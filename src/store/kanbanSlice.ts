import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import uniqid from 'uniqid';

export type ColumnId = 'todo' | 'in_progress' | 'done';
export type Priority = 'Low' | 'Medium' | 'High';

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  assignee: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type Column = {
  id: ColumnId;
  title: string;
  taskIds: string[];
};

export type Filters = {
  priority: 'All' | Priority;
  assignee: 'All' | string;
};

type BoardSnapshot = {
  columns: Column[];
  tasks: Record<string, Task>;
  filters: Filters;
};

export type BoardState = BoardSnapshot & {
  undo: {
    snapshot: BoardSnapshot | null;
  };
};

const createInitialState = (): BoardState => ({
  columns: [
    { id: 'todo', title: 'Todo', taskIds: [] },
    { id: 'in_progress', title: 'In Progress', taskIds: [] },
    { id: 'done', title: 'Done', taskIds: [] },
  ],
  tasks: {},
  filters: {
    priority: 'All',
    assignee: 'All',
  },
  undo: { snapshot: null },
});

const STORAGE_KEY = 'kanban_board_v1';

const safeParseStoredState = (): BoardSnapshot | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BoardSnapshot;
    if (!parsed || !Array.isArray(parsed.columns) || typeof parsed.tasks !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const stored = safeParseStoredState();
const initialState: BoardState = stored
  ? { ...createInitialState(), ...stored, undo: { snapshot: null } }
  : createInitialState();

const cloneSnapshot = (state: BoardSnapshot): BoardSnapshot => ({
  columns: state.columns.map((c) => ({ ...c, taskIds: [...c.taskIds] })),
  tasks: Object.fromEntries(
    Object.entries(state.tasks).map(([id, t]) => [id, { ...t }])
  ),
  filters: { ...state.filters },
});

const saveUndo = (state: BoardState) => {
  state.undo.snapshot = cloneSnapshot({
    columns: state.columns,
    tasks: state.tasks,
    filters: state.filters,
  });
};

const getColumnIdByTaskId = (columns: Column[], taskId: string): ColumnId | null => {
  for (const column of columns) {
    if (column.taskIds.includes(taskId)) return column.id;
  }
  return null;
};

const taskPassesFilters = (task: Task, filters: Filters) => {
  if (filters.priority !== 'All' && task.priority !== filters.priority) return false;
  if (filters.assignee !== 'All' && task.assignee !== filters.assignee) return false;
  return true;
};

const getVisibleTaskIds = (
  column: Column,
  tasks: Record<string, Task>,
  filters: Filters
) => column.taskIds.filter((id) => tasks[id] && taskPassesFilters(tasks[id], filters));

const reorderVisibleOnly = (
  allTaskIds: string[],
  visibleTaskIds: string[],
  fromIndex: number,
  toIndex: number
) => {
  const nextVisible = [...visibleTaskIds];
  const [moved] = nextVisible.splice(fromIndex, 1);
  nextVisible.splice(toIndex, 0, moved);

  let vi = 0;
  return allTaskIds.map((id) => {
    if (!visibleTaskIds.includes(id)) return id;
    const replacement = nextVisible[vi];
    vi += 1;
    return replacement;
  });
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    persistRequested: () => {},

    setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      saveUndo(state);
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      saveUndo(state);
      state.filters = { priority: 'All', assignee: 'All' };
    },

    addTask: (
      state,
      action: PayloadAction<{
        columnId: ColumnId;
        title: string;
        priority: Priority;
        assignee: string;
        description?: string;
      }>
    ) => {
      const { columnId, title, priority, assignee, description } = action.payload;
      const trimmedTitle = title.trim();
      if (!trimmedTitle) return;

      saveUndo(state);

      const now = Date.now();
      const id = uniqid();
      state.tasks[id] = {
        id,
        title: trimmedTitle,
        priority,
        assignee: assignee.trim(),
        description: description?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      const column = state.columns.find((c) => c.id === columnId);
      if (!column) return;
      column.taskIds.push(id);
    },

    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        patch: Partial<Pick<Task, 'title' | 'priority' | 'assignee' | 'description'>>;
      }>
    ) => {
      const { taskId, patch } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return;

      const nextTitle =
        patch.title === undefined ? task.title : patch.title.trim();
      if (!nextTitle) return;

      saveUndo(state);

      task.title = nextTitle;
      if (patch.priority !== undefined) task.priority = patch.priority;
      if (patch.assignee !== undefined) task.assignee = patch.assignee.trim();
      if (patch.description !== undefined) {
        task.description = patch.description.trim() || undefined;
      }
      task.updatedAt = Date.now();
    },

    deleteTask: (state, action: PayloadAction<{ taskId: string }>) => {
      const { taskId } = action.payload;
      if (!state.tasks[taskId]) return;

      saveUndo(state);

      delete state.tasks[taskId];
      for (const column of state.columns) {
        column.taskIds = column.taskIds.filter((id) => id !== taskId);
      }
    },

    moveTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        toColumnId: ColumnId;
        overTaskId?: string;
      }>
    ) => {
      const { taskId, toColumnId, overTaskId } = action.payload;
      if (!state.tasks[taskId]) return;

      const fromColumnId = getColumnIdByTaskId(state.columns, taskId);
      if (!fromColumnId) return;

      const fromColumn = state.columns.find((c) => c.id === fromColumnId);
      const toColumn = state.columns.find((c) => c.id === toColumnId);
      if (!fromColumn || !toColumn) return;

      saveUndo(state);

      fromColumn.taskIds = fromColumn.taskIds.filter((id) => id !== taskId);

      if (overTaskId && toColumn.taskIds.includes(overTaskId)) {
        const visible = getVisibleTaskIds(toColumn, state.tasks, state.filters);
        const visibleIndex = visible.findIndex((id) => id === overTaskId);
        if (visibleIndex === -1) {
          toColumn.taskIds.push(taskId);
          return;
        }
        // Insert before the hovered visible task, preserving hidden task positions.
        const beforeVisibleId = visible[visibleIndex];
        const insertionIndex = toColumn.taskIds.findIndex((id) => id === beforeVisibleId);
        const safeIndex = insertionIndex === -1 ? toColumn.taskIds.length : insertionIndex;
        toColumn.taskIds.splice(safeIndex, 0, taskId);
        return;
      }

      toColumn.taskIds.push(taskId);
    },

    reorderTaskWithinColumn: (
      state,
      action: PayloadAction<{
        columnId: ColumnId;
        activeTaskId: string;
        overTaskId: string;
      }>
    ) => {
      const { columnId, activeTaskId, overTaskId } = action.payload;
      const column = state.columns.find((c) => c.id === columnId);
      if (!column) return;
      if (activeTaskId === overTaskId) return;
      if (!column.taskIds.includes(activeTaskId) || !column.taskIds.includes(overTaskId)) return;

      const visible = getVisibleTaskIds(column, state.tasks, state.filters);
      const fromIndex = visible.findIndex((id) => id === activeTaskId);
      const toIndex = visible.findIndex((id) => id === overTaskId);
      if (fromIndex === -1 || toIndex === -1) return;

      saveUndo(state);

      column.taskIds = reorderVisibleOnly(column.taskIds, visible, fromIndex, toIndex);
    },

    undoLast: (state) => {
      if (!state.undo.snapshot) return;
      const snapshot = state.undo.snapshot;
      state.columns = snapshot.columns.map((c) => ({ ...c, taskIds: [...c.taskIds] }));
      state.tasks = Object.fromEntries(
        Object.entries(snapshot.tasks).map(([id, t]) => [id, { ...t }])
      );
      state.filters = { ...snapshot.filters };
      state.undo.snapshot = null;
    },

    resetBoard: (state) => {
      saveUndo(state);
      const fresh = createInitialState();
      state.columns = fresh.columns;
      state.tasks = fresh.tasks;
      state.filters = fresh.filters;
      state.undo = fresh.undo;
    },
  },
});

export const STORAGE = { key: STORAGE_KEY };
export const kanbanActions = kanbanSlice.actions;
export default kanbanSlice;

