import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useEffect, useMemo, useState } from 'react';
import FiltersBar from './FiltersBar';
import KanbanColumn from './KanbanColumn';
import TaskModal, { TaskModalMode } from './TaskModal';
import { ColumnId, STORAGE, Task, kanbanActions } from '../store/kanbanSlice';
import { useAppDispatch, useAppSelector } from '../util/reduxHooks';
import TaskCard from './TaskCard';

const getColumnIdByTaskId = (columns: { id: ColumnId; taskIds: string[] }[], taskId: string) => {
  for (const column of columns) {
    if (column.taskIds.includes(taskId)) return column.id;
  }
  return null;
};

function KanbanBoard() {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((s) => s.kanban.columns);
  const tasksById = useAppSelector((s) => s.kanban.tasks);
  const filters = useAppSelector((s) => s.kanban.filters);

  const allTasks = useMemo(() => Object.values(tasksById), [tasksById]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<TaskModalMode | null>(null);

  useEffect(() => {
    const payload = JSON.stringify({ columns, tasks: tasksById, filters });
    localStorage.setItem(STORAGE.key, payload);
  }, [columns, tasksById, filters]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const filteredTasksByColumn = useMemo(() => {
    const passes = (task: Task) => {
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false;
      if (filters.assignee !== 'All' && task.assignee !== filters.assignee) return false;
      return true;
    };

    const result: Record<ColumnId, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    for (const column of columns) {
      result[column.id] = column.taskIds
        .map((id) => tasksById[id])
        .filter((t): t is Task => Boolean(t))
        .filter(passes);
    }
    return result;
  }, [columns, tasksById, filters]);

  const openCreate = (columnId: ColumnId) => setModalMode({ type: 'create', columnId });

  const openEdit = (taskId: string) => {
    const task = tasksById[taskId];
    if (!task) return;
    const columnId = getColumnIdByTaskId(columns, taskId);
    if (!columnId) return;
    setModalMode({ type: 'edit', task, columnId });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as any;
    if (!data || data.type !== 'task') return;
    const task = tasksById[data.taskId];
    if (!task) return;
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as any;
    const overData = over.data.current as any;
    if (!activeData || activeData.type !== 'task') return;

    const activeTaskId = activeData.taskId as string;
    const fromColumnId = activeData.columnId as ColumnId;

    if (overData?.type === 'task') {
      const overTaskId = overData.taskId as string;
      const toColumnId = overData.columnId as ColumnId;
      if (toColumnId === fromColumnId) {
        dispatch(
          kanbanActions.reorderTaskWithinColumn({
            columnId: toColumnId,
            activeTaskId,
            overTaskId,
          })
        );
        return;
      }
      dispatch(
        kanbanActions.moveTask({
          taskId: activeTaskId,
          toColumnId,
          overTaskId,
        })
      );
      return;
    }

    if (overData?.type === 'column') {
      const toColumnId = overData.columnId as ColumnId;
      dispatch(
        kanbanActions.moveTask({
          taskId: activeTaskId,
          toColumnId,
        })
      );
    }
  };

  return (
    <div className="min-h-screen">
      <FiltersBar tasks={allTasks} />

      <div className="w-full max-w-[100rem] mx-auto">
        <div className="w-full overflow-x-auto">
          <div className="flex items-start justify-center gap-4 min-w-max w-fit mx-auto px-4 py-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={filteredTasksByColumn[column.id]}
                  onCreate={openCreate}
                  onEdit={openEdit}
                />
              ))}

              <DragOverlay>
                {activeTask && (
                  <div className="w-80">
                    <TaskCard
                      task={activeTask}
                      isDragging={true}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      <TaskModal mode={modalMode} onClose={() => setModalMode(null)} />
    </div>
  );
}

export default KanbanBoard;
