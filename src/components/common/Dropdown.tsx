import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown, Check } from 'lucide-react'

interface DropdownItem {
  id: string | number
  label: string
  value?: string | number
  icon?: React.ReactNode
  disabled?: boolean
  divider?: boolean
}

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  onSelect?: (item: DropdownItem) => void
  selectedValue?: string | number
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  menuClassName?: string
  position?: 'bottom' | 'top' | 'left' | 'right'
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  selectedValue,
  placeholder = 'Select option',
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled || item.divider) return
    
    onSelect?.(item)
    setIsOpen(false)
  }

  const selectedItem = items.find(item => item.value === selectedValue)

  const positionClasses = {
    bottom: 'top-full left-0 mt-1',
    top: 'bottom-full left-0 mb-1',
    left: 'top-0 right-full mr-1',
    right: 'top-0 left-full ml-1'
  }

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      {/* Trigger */}
      <div
        className={cn(
          'flex items-center justify-between cursor-pointer select-none',
          'px-3 py-2 border border-gray-300 rounded-lg',
          'hover:border-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
          'transition-colors duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
          triggerClassName
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="text-sm text-gray-700">
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg',
            'py-1 max-h-60 overflow-auto',
            positionClasses[position],
            menuClassName
          )}
        >
          {items.map((item, index) => (
            <div key={item.id || index}>
              {item.divider ? (
                <div className="border-t border-gray-200 my-1" />
              ) : (
                <div
                  className={cn(
                    'flex items-center px-3 py-2 text-sm cursor-pointer',
                    'hover:bg-gray-50 transition-colors duration-150',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    selectedValue === item.value && 'bg-primary-50 text-primary-700'
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && (
                    <span className="mr-2 text-gray-400">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {selectedValue === item.value && (
                    <Check className="w-4 h-4 text-primary-600 ml-2" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
