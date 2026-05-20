import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ColumnId, Task, kanbanActions } from '../store/kanbanSlice';
import { useAppDispatch } from '../util/reduxHooks';
import TaskCard from './TaskCard';

type Props = {
  task: Task;
  columnId: ColumnId;
  onEdit: (taskId: string) => void;
};

function KanbanTaskItem({ task, columnId, onEdit }: Props) {
  const dispatch = useAppDispatch();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      taskId: task.id,
      columnId,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        isDragging={isDragging}
        onEdit={onEdit}
        onDelete={(taskId) => dispatch(kanbanActions.deleteTask({ taskId }))}
      />
    </div>
  );
}

export default KanbanTaskItem;
