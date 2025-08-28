import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface GridLayoutProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  autoFit?: boolean
  autoFill?: boolean
  minWidth?: string
}

const GridLayout = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  autoFit = false,
  autoFill = false,
  minWidth = '250px'
}: GridLayoutProps) => {
  const getGridCols = () => {
    if (autoFit) {
      return `grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))]`
    }
    if (autoFill) {
      return `grid-cols-[repeat(auto-fill,minmax(${minWidth},1fr))]`
    }
    
    const mobileCols = cols.mobile || 1
    const tabletCols = cols.tablet || mobileCols
    const desktopCols = cols.desktop || tabletCols
    
    return `grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols}`
  }

  const getGap = () => {
    const mobileGap = gap.mobile || 4
    const tabletGap = gap.tablet || mobileGap
    const desktopGap = gap.desktop || tabletGap
    
    return `gap-${mobileGap} sm:gap-${tabletGap} lg:gap-${desktopGap}`
  }

  return (
    <div
      className={cn(
        'grid',
        getGridCols(),
        getGap(),
        className
      )}
    >
      {children}
    </div>
  )
}

// Utility components for common grid patterns
export const TwoColumnLayout = ({ 
  children, 
  className,
  reverse = false 
}: { 
  children: [ReactNode, ReactNode]
  className?: string
  reverse?: boolean
}) => (
  <div className={cn(
    'grid grid-cols-1 lg:grid-cols-2 gap-8',
    reverse && 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1',
    className
  )}>
    {children}
  </div>
)

export const ThreeColumnLayout = ({ 
  children, 
  className 
}: { 
  children: [ReactNode, ReactNode, ReactNode]
  className?: string
}) => (
  <div className={cn(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
    className
  )}>
    {children}
  </div>
)

export const SidebarLayout = ({ 
  sidebar, 
  main, 
  className,
  sidebarWidth = '280px'
}: { 
  sidebar: ReactNode
  main: ReactNode
  className?: string
  sidebarWidth?: string
}) => (
  <div className={cn(
    'grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8',
    className
  )}>
    <aside className="lg:w-[280px] lg:sticky lg:top-8 lg:self-start">
      {sidebar}
    </aside>
    <main>
      {main}
    </main>
  </div>
)

export default GridLayout
