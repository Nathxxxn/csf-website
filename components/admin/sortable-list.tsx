'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

interface SortableItemProps {
  id: string
  children: (handleProps: { ref: React.Ref<HTMLElement>; style: React.CSSProperties }) => React.ReactNode
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return <>{children({ ref: setNodeRef as React.Ref<HTMLElement>, style })}</>
}

export function DragHandle({ ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props} className="cursor-grab text-white/20 hover:text-white/50 active:cursor-grabbing" title="Réordonner">
      ⠿
    </span>
  )
}

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (ids: string[]) => void
  renderItem: (item: T, dragHandleProps: object) => React.ReactNode
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem }: SortableListProps<T>) {
  const [localItems, setLocalItems] = useState(items)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = localItems.findIndex(i => i.id === active.id)
    const newIndex = localItems.findIndex(i => i.id === over.id)
    const newItems = arrayMove(localItems, oldIndex, newIndex)
    setLocalItems(newItems)
    onReorder(newItems.map(i => i.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {localItems.map(item => (
          <SortableItem key={item.id} id={item.id}>
            {({ ref, style }) => (
              <div ref={ref as React.Ref<HTMLDivElement>} style={style}>
                {renderItem(item, {})}
              </div>
            )}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
