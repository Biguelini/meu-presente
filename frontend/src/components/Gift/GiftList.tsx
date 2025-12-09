import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Gift } from '../../types';
import { GiftCard } from './GiftCard';

interface GiftListProps {
  gifts: Gift[];
  onReorder: (newOrder: string[]) => void;
  onEdit: (gift: Gift) => void;
  onDelete: (id: string) => void;
  isDraggable: boolean;
}

export function GiftList({ gifts, onReorder, onEdit, onDelete, isDraggable }: GiftListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = gifts.findIndex((g) => g._id === active.id);
      const newIndex = gifts.findIndex((g) => g._id === over.id);

      const newGifts = [...gifts];
      const [removed] = newGifts.splice(oldIndex, 1);
      newGifts.splice(newIndex, 0, removed);

      onReorder(newGifts.map((g) => g._id));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={gifts.map((g) => g._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {gifts.map((gift) => (
            <GiftCard
              key={gift._id}
              gift={gift}
              onEdit={onEdit}
              onDelete={onDelete}
              isDraggable={isDraggable}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
