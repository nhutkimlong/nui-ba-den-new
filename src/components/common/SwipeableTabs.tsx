import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Tab {
  id: string
  label: string
  content: ReactNode
  icon?: ReactNode
}

interface SwipeableTabsProps {
  tabs: Tab[]
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

const SwipeableTabs = ({ 
  tabs, 
  defaultTab, 
  onTabChange, 
  className 
}: SwipeableTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    const activeIndex = tabs.findIndex(tab => tab.id === activeTab)

    if (isLeftSwipe && activeIndex < tabs.length - 1) {
      handleTabChange(tabs[activeIndex + 1].id)
    } else if (isRightSwipe && activeIndex > 0) {
      handleTabChange(tabs[activeIndex - 1].id)
    }
  }

  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const activeContent = tabs[activeIndex]?.content

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Headers */}
      <div className="flex bg-white border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center justify-center px-3 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 min-w-0",
              "hover:bg-gray-50 active:scale-95",
              activeTab === tab.id
                ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                : "text-gray-600 hover:text-primary-600"
            )}
          >
            {tab.icon && (
              <span className="mr-1.5 flex-shrink-0">
                {tab.icon}
              </span>
            )}
            <span className="truncate text-xs sm:text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content (only render active) */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full" key={activeTab}>
          {activeContent}
        </div>
      </div>

      {/* Swipe Indicator */}
      <div className="flex justify-center mt-3 space-x-1">
        {tabs.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              index === activeIndex
                ? "bg-primary-500 w-6"
                : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default SwipeableTabs
