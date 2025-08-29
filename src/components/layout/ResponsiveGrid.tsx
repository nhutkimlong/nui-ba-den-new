import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { useDevice } from './DeviceDetector'

interface GridItem {
  id: string
  content: ReactNode
  size: 'small' | 'medium' | 'large' | 'xl'
  priority?: number
  minWidth?: number
  minHeight?: number
  aspectRatio?: number
  className?: string
}

interface ResponsiveGridProps {
  items: GridItem[]
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  gap?: number
  variant?: 'masonry' | 'bento' | 'standard'
  autoResize?: boolean
  enableReordering?: boolean
  className?: string
  itemClassName?: string
  onItemClick?: (item: GridItem) => void
  onReorder?: (items: GridItem[]) => void
}

const ResponsiveGrid = ({
  items,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  variant = 'bento',
  autoResize = true,
  enableReordering = false,
  className,
  itemClassName,
  onItemClick,
  onReorder
}: ResponsiveGridProps) => {
  const device = useDevice()
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridItems, setGridItems] = useState(items)
  const [draggedItem, setDraggedItem] = useState<GridItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1)
  const [containerWidth, setContainerWidth] = useState(0)

  // Get current column count based on device
  const currentColumns = device.isMobile 
    ? columns.mobile 
    : device.isTablet 
    ? columns.tablet 
    : columns.desktop

  // Update container width for auto-resize
  useEffect(() => {
    if (!autoResize || !gridRef.current) return

    const updateWidth = () => {
      if (gridRef.current) {
        setContainerWidth(gridRef.current.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [autoResize])

  // Update grid items when props change
  useEffect(() => {
    setGridItems(items)
  }, [items])

  // Calculate item dimensions based on size and variant
  const getItemDimensions = useCallback((item: GridItem, columnWidth: number) => {
    const baseWidth = columnWidth
    const baseHeight = variant === 'masonry' ? 'auto' : baseWidth

    switch (item.size) {
      case 'small':
        return {
          width: baseWidth,
          height: variant === 'bento' ? baseWidth * 0.8 : baseHeight,
          gridColumn: 'span 1',
          gridRow: variant === 'bento' ? 'span 1' : 'auto'
        }
      case 'medium':
        return {
          width: Math.min(baseWidth * 1.5, baseWidth * 2),
          height: variant === 'bento' ? baseWidth * 1.2 : baseHeight,
          gridColumn: `span ${Math.min(2, currentColumns)}`,
          gridRow: variant === 'bento' ? 'span 2' : 'auto'
        }
      case 'large':
        return {
          width: Math.min(baseWidth * 2, baseWidth * currentColumns),
          height: variant === 'bento' ? baseWidth * 1.5 : baseHeight,
          gridColumn: `span ${Math.min(3, currentColumns)}`,
          gridRow: variant === 'bento' ? 'span 3' : 'auto'
        }
      case 'xl':
        return {
          width: baseWidth * currentColumns,
          height: variant === 'bento' ? baseWidth * 2 : baseHeight,
          gridColumn: `span ${currentColumns}`,
          gridRow: variant === 'bento' ? 'span 4' : 'auto'
        }
      default:
        return {
          width: baseWidth,
          height: baseHeight,
          gridColumn: 'span 1',
          gridRow: 'auto'
        }
    }
  }, [variant, currentColumns])

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, item: GridItem) => {
    if (!enableReordering) return
    
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', item.id)
    
    // Add drag styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }, [enableReordering])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!enableReordering || !draggedItem) return
    
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [enableReordering, draggedItem])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    if (!enableReordering || !draggedItem) return
    
    e.preventDefault()
    
    const dragIndex = gridItems.findIndex(item => item.id === draggedItem.id)
    if (dragIndex === dropIndex) return
    
    const newItems = [...gridItems]
    const [removed] = newItems.splice(dragIndex, 1)
    newItems.splice(dropIndex, 0, removed)
    
    setGridItems(newItems)
    setDraggedItem(null)
    setDragOverIndex(-1)
    
    onReorder?.(newItems)
  }, [enableReordering, draggedItem, gridItems, onReorder])

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedItem(null)
    setDragOverIndex(-1)
    
    // Reset drag styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }, [])

  // Calculate column width
  const columnWidth = containerWidth > 0 
    ? (containerWidth - (gap * (currentColumns - 1))) / currentColumns 
    : 300

  // Grid styles based on variant
  const getGridStyles = () => {
    const baseStyles = {
      gap: `${gap}px`,
      gridTemplateColumns: `repeat(${currentColumns}, 1fr)`
    }

    switch (variant) {
      case 'masonry':
        return {
          ...baseStyles,
          gridAutoRows: 'min-content'
        }
      case 'bento':
        return {
          ...baseStyles,
          gridAutoRows: `${columnWidth * 0.4}px`,
          gridAutoFlow: 'row dense'
        }
      case 'standard':
      default:
        return {
          ...baseStyles,
          gridAutoRows: `${columnWidth}px`
        }
    }
  }

  return (
    <div
      ref={gridRef}
      className={cn(
        "grid w-full transition-all duration-300 ease-in-out",
        variant === 'masonry' && "grid-flow-row-dense",
        className
      )}
      style={getGridStyles()}
    >
      {gridItems.map((item, index) => {
        const dimensions = getItemDimensions(item, columnWidth)
        const isDragOver = dragOverIndex === index
        const isDragging = draggedItem?.id === item.id

        return (
          <div
            key={item.id}
            className={cn(
              "relative overflow-hidden rounded-xl transition-all duration-300 ease-in-out",
              "hover:scale-[1.02] hover:shadow-lg cursor-pointer",
                                      "bg-white/95 border border-gray-200",
                isDragOver && "ring-2 ring-blue-500 ring-opacity-50",
              isDragging && "opacity-50 scale-95",
              enableReordering && "cursor-move",
              itemClassName,
              item.className
            )}
            style={{
              gridColumn: dimensions.gridColumn,
              gridRow: dimensions.gridRow,
              minWidth: item.minWidth,
              minHeight: item.minHeight,
              aspectRatio: item.aspectRatio
            }}
            draggable={enableReordering}
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => onItemClick?.(item)}
          >
            {/* Content */}
            <div className="h-full w-full p-4">
              {item.content}
            </div>

            {/* Drag handle for reordering */}
            {enableReordering && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Size indicator */}
            <div className="absolute bottom-2 left-2 opacity-0 hover:opacity-100 transition-opacity">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full text-white font-medium",
                item.size === 'small' && "bg-green-500",
                item.size === 'medium' && "bg-blue-500",
                item.size === 'large' && "bg-purple-500",
                item.size === 'xl' && "bg-red-500"
              )}>
                {item.size}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ResponsiveGrid