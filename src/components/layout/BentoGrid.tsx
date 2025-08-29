import { ReactNode, useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import ResponsiveGrid from './ResponsiveGrid'
import { GripVertical, Maximize2, Minimize2, MoreHorizontal } from 'lucide-react'

interface BentoItem {
  id: string
  title?: string
  content: ReactNode
  size: 'small' | 'medium' | 'large' | 'xl'
  priority?: number
  category?: string
  tags?: string[]
  expandable?: boolean
  draggable?: boolean
  className?: string
  icon?: ReactNode
  description?: string
  actions?: Array<{
    label: string
    icon?: ReactNode
    onClick: () => void
  }>
}

interface BentoGridProps {
  items: BentoItem[]
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: number
  enableExpansion?: boolean
  enableReordering?: boolean
  enableDragDrop?: boolean
  adminMode?: boolean
  className?: string
  onItemExpand?: (item: BentoItem) => void
  onItemClick?: (item: BentoItem) => void
  onReorder?: (items: BentoItem[]) => void
  onItemEdit?: (item: BentoItem) => void
  onItemDelete?: (item: BentoItem) => void
}

const BentoGrid = ({
  items,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  enableExpansion = true,
  enableReordering = false,
  enableDragDrop = false,
  adminMode = false,
  className,
  onItemExpand,
  onItemClick,
  onReorder,
  onItemEdit,
  onItemDelete
}: BentoGridProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState<BentoItem[]>(items)
  const dragCounter = useRef(0)

  // Update ordered items when items prop changes
  useEffect(() => {
    setOrderedItems(items)
  }, [items])

  // Handle item expansion
  const handleItemExpand = useCallback((item: BentoItem) => {
    if (!enableExpansion || !item.expandable) return
    
    const newExpandedId = expandedItem === item.id ? null : item.id
    setExpandedItem(newExpandedId)
    
    if (newExpandedId) {
      onItemExpand?.(item)
    }
  }, [enableExpansion, expandedItem, onItemExpand])

  // Handle item click
  const handleItemClick = useCallback((gridItem: any) => {
    const bentoItem = orderedItems.find(item => item.id === gridItem.id)
    if (bentoItem) {
      onItemClick?.(bentoItem)
    }
  }, [orderedItems, onItemClick])

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: BentoItem) => {
    if (!enableDragDrop || !item.draggable) return
    
    setDraggedItem(item.id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', item.id)
    
    // Add drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(5deg)'
    dragImage.style.opacity = '0.8'
    e.dataTransfer.setDragImage(dragImage, 0, 0)
  }, [enableDragDrop])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverItem(null)
    dragCounter.current = 0
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!enableDragDrop) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [enableDragDrop])

  const handleDragEnter = useCallback((e: React.DragEvent, item: BentoItem) => {
    if (!enableDragDrop) return
    e.preventDefault()
    dragCounter.current++
    setDragOverItem(item.id)
  }, [enableDragDrop])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!enableDragDrop) return
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverItem(null)
    }
  }, [enableDragDrop])

  const handleDrop = useCallback((e: React.DragEvent, targetItem: BentoItem) => {
    if (!enableDragDrop || !draggedItem) return
    
    e.preventDefault()
    
    const draggedIndex = orderedItems.findIndex(item => item.id === draggedItem)
    const targetIndex = orderedItems.findIndex(item => item.id === targetItem.id)
    
    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
      const newItems = [...orderedItems]
      const [draggedItemData] = newItems.splice(draggedIndex, 1)
      newItems.splice(targetIndex, 0, draggedItemData)
      
      setOrderedItems(newItems)
      onReorder?.(newItems)
    }
    
    handleDragEnd()
  }, [enableDragDrop, draggedItem, orderedItems, onReorder, handleDragEnd])

  // Convert BentoItems to GridItems
  const gridItems = orderedItems.map(item => ({
    id: item.id,
    size: expandedItem === item.id ? 'xl' : item.size,
    priority: item.priority,
    className: cn(
      "group relative overflow-hidden cursor-pointer",
              "bg-white/95 border border-gray-200 shadow-lg hover:bg-white",
      "transition-all duration-300 ease-out",
      "hover:transform hover:-translate-y-1",
      expandedItem === item.id && "z-10 shadow-2xl ring-2 ring-primary-500/20 scale-105",
      draggedItem === item.id && "opacity-50 scale-95",
      dragOverItem === item.id && "ring-2 ring-accent-500/50 scale-102",
      enableDragDrop && item.draggable && "cursor-grab active:cursor-grabbing",
      item.className
    ),
    draggable: enableDragDrop && item.draggable,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, item),
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragEnter: (e: React.DragEvent) => handleDragEnter(e, item),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, item),
    content: (
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Drag handle */}
            {enableDragDrop && item.draggable && adminMode && (
              <button
                className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}
            
            {/* Icon */}
            {item.icon && (
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary-100 text-primary-600">
                {item.icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {item.category && (
                <span className="inline-block px-3 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded-full mb-2">
                  {item.category}
                </span>
              )}
              {item.title && (
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="text-sm text-neutral-600 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Admin actions */}
            {adminMode && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemEdit?.(item)
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
                  aria-label="Edit item"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Expand button */}
            {item.expandable && enableExpansion && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleItemExpand(item)
                }}
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg transition-all duration-200",
                  "hover:bg-neutral-100 active:scale-95",
                  expandedItem === item.id 
                    ? "bg-primary-100 text-primary-600" 
                    : "text-neutral-400 hover:text-neutral-600"
                )}
                aria-label={expandedItem === item.id ? "Thu gọn" : "Mở rộng"}
              >
                {expandedItem === item.id ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1 overflow-hidden",
          expandedItem === item.id ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"
        )}>
          <div className={cn(
            "transition-all duration-300",
            expandedItem === item.id ? "opacity-100" : "opacity-90 group-hover:opacity-100"
          )}>
            {item.content}
          </div>
        </div>

        {/* Actions */}
        {item.actions && item.actions.length > 0 && (
          <div className={cn(
            "flex gap-2 mt-4 pt-4 border-t border-neutral-200/50",
            expandedItem === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200"
          )}>
            {item.actions.slice(0, expandedItem === item.id ? item.actions.length : 2).map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  action.onClick()
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-200/50">
            {item.tags.slice(0, expandedItem === item.id ? item.tags.length : 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs text-neutral-600 bg-neutral-100 rounded-full"
              >
                {tag}
              </span>
            ))}
            {expandedItem !== item.id && item.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs text-neutral-500 bg-neutral-50 rounded-full">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Drag overlay */}
        {draggedItem === item.id && (
          <div className="absolute inset-0 bg-primary-500/10 border-2 border-dashed border-primary-500/30 rounded-2xl" />
        )}

        {/* Drop zone indicator */}
        {dragOverItem === item.id && draggedItem !== item.id && (
          <div className="absolute inset-0 bg-accent-500/10 border-2 border-dashed border-accent-500/50 rounded-2xl animate-pulse" />
        )}

        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0",
          "group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        )} />
      </div>
    )
  }))

  return (
    <div className={cn("relative", className)}>
      <ResponsiveGrid
        items={gridItems}
        columns={columns}
        gap={gap}
        variant="bento"
        autoResize={true}
        enableReordering={enableReordering}
        onItemClick={handleItemClick}
        onReorder={onReorder}
        className="bento-grid"
      />

      {/* Expanded item backdrop */}
      {expandedItem && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[5] transition-opacity duration-300"
          onClick={() => setExpandedItem(null)}
        />
      )}
    </div>
  )
}

export default BentoGrid