import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column, ColumnId, Task } from '../store/kanbanSlice';
import KanbanTaskItem from './KanbanTaskItem';

type Props = {
  column: Column;
  tasks: Task[];
  onCreate: (columnId: ColumnId) => void;
  onEdit: (taskId: string) => void;
};

function KanbanColumn({ column, tasks, onCreate, onEdit }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <section
      ref={setNodeRef}
      className={`bg-slate-900 w-80 min-w-80 h-[34rem] p-2 rounded-sm flex flex-col border ${
        isOver ? 'border-red-500' : 'border-transparent'
      }`}
    >
      <header className="bg-slate-950 px-3 py-2 flex items-center justify-between min-h-10">
        <h2 className="font-bold text-md">{column.title}</h2>
        <button
          onClick={() => onCreate(column.id)}
          className="text-sm px-3 py-1 rounded-md bg-slate-900 border border-transparent hover:border-red-500 transition"
        >
          New
        </button>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="overflow-y-auto p-2 pr-3 flex flex-col gap-2 grow">
          {tasks.length === 0 && (
            <div className="text-sm text-neutral-400 py-4 text-center border border-dashed border-slate-700 rounded-md">
              Empty
            </div>
          )}
          {tasks.map((task) => (
            <KanbanTaskItem
              key={task.id}
              task={task}
              columnId={column.id}
              onEdit={onEdit}
            />
          ))}
        </div>
      </SortableContext>

      <footer className="mt-auto px-2 pb-1">
        <div className="text-[11px] text-neutral-500 text-right">
           {tasks.length === 1 ? 'task' : 'tasks'} : {tasks.length}
        </div>
      </footer>
    </section>
  );
}

export default KanbanColumn;
