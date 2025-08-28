import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/utils/cn"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClipboardList } from "@fortawesome/free-solid-svg-icons"

export type CategoryItem = {
  key: string
  name: string
  icon: React.ReactNode
}

interface Props {
  categories: CategoryItem[]
  activeKey: string | null
  onChange: (key: string | null) => void
  className?: string
}

const CategoryChips: React.FC<Props> = ({ categories, activeKey, onChange, className }) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollerRef.current
    if (!el) return
    const handler = () => updateScrollState()
    el.addEventListener("scroll", handler, { passive: true })
    const obs = new ResizeObserver(() => updateScrollState())
    obs.observe(el)
    return () => {
      el.removeEventListener("scroll", handler)
      obs.disconnect()
    }
  }, [])

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.8)
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <div className={cn("relative h-10", className)}>
      {/* Fading edges */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent rounded-l-2xl" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent rounded-r-2xl" />
      )}

      {/* Arrow controls (desktop) */}
      <button
        type="button"
        aria-label="Cuộn trái"
        onClick={() => scrollByAmount("left")}
        className={cn(
          "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow",
          !canScrollLeft && "opacity-0 pointer-events-none"
        )}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Cuộn phải"
        onClick={() => scrollByAmount("right")}
        className={cn(
          "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 border border-gray-200 shadow",
          !canScrollRight && "opacity-0 pointer-events-none"
        )}
      >
        ›
      </button>

      <div
        ref={scrollerRef}
        className="filter-categories flex items-center gap-1.5 sm:gap-2 overflow-x-auto md:overflow-x-auto md:flex-nowrap md:justify-start w-full px-1 scrollbar-hide scroll-smooth snap-x snap-mandatory"
      >
        <button
          onClick={() => onChange(null)}
          className={cn(
            "flex items-center px-2.5 py-1.5 text-xs sm:text-sm rounded-full transition-colors duration-200 whitespace-nowrap snap-start",
            !activeKey ? "bg-primary-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          )}
        >
          <FontAwesomeIcon icon={faClipboardList} className="mr-1.5" />
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => onChange(c.key)}
            className={cn(
              "flex items-center px-2.5 py-1.5 text-xs sm:text-sm rounded-full transition-colors duration-200 whitespace-nowrap snap-start",
              activeKey === c.key ? "bg-primary-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            )}
          >
            <span className="mr-1.5">{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryChips


