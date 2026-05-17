"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SetlistItem } from "@/types/setlist";
import type { Song } from "@/types/song";

interface DragSongListProps {
  items: SetlistItem[];
  songs: Song[];
  onReorder: (items: SetlistItem[]) => void;
  onRemove: (songId: string) => void;
}

function SortableItem({
  item,
  song,
  onRemove,
}: {
  item: SetlistItem;
  song?: Song;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.songId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
          <p className="font-medium">{song?.title ?? "Unknown song"}</p>
          <p className="text-sm text-muted-foreground">{song?.artist}</p>
          {item.performanceNotes && (
            <p className="mt-1 text-xs text-amber-500">{item.performanceNotes}</p>
          )}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function DragSongList({
  items,
  songs,
  onReorder,
  onRemove,
}: DragSongListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.songId === active.id);
    const newIndex = items.findIndex((i) => i.songId === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, order) => ({
      ...item,
      order,
    }));
    onReorder(reordered);
  };

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sorted.map((i) => i.songId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sorted.map((item) => (
            <SortableItem
              key={item.songId}
              item={item}
              song={songs.find((s) => s.id === item.songId)}
              onRemove={() => onRemove(item.songId)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
