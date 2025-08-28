import React from "react"
import { Search, Route, Navigation, Info, Globe } from "lucide-react"

type Suggestion = {
  id: string | number
  displayName: string
  category?: string
  area?: string
  icon?: React.ReactNode
}

interface Props {
  searchTerm: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  suggestions: Suggestion[]
  showSuggestions: boolean
  onSuggestionClick: (s: Suggestion) => void

  onDirections: () => void
  onLocate: () => void
  onTutorial: () => void
  onToggleTiles: () => void

  inputRef?: React.RefObject<HTMLInputElement>
  onClear?: () => void
}

const SearchBarWithActions: React.FC<Props> = ({
  searchTerm,
  onChange,
  onFocus,
  onBlur,
  suggestions,
  showSuggestions,
  onSuggestionClick,
  onDirections,
  onLocate,
  onTutorial,
  onToggleTiles,
  inputRef,
  onClear
}) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-300">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm địa điểm..."
          value={searchTerm}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="flex-grow min-w-0 border-none outline-none bg-transparent text-base text-gray-700 placeholder-gray-500"
        />

        {/* Clear text */}
        {searchTerm && (
          <button
            aria-label="Xóa tìm kiếm"
            onClick={onClear}
            className="ml-1 mr-1 rounded-full w-6 h-6 grid place-items-center text-gray-500 hover:text-gray-700 hover:bg-gray-200"
          >
            <span className="sr-only">Xóa</span>
            {/* simple times icon using svg to avoid extra import */}
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Action buttons (desktop) */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          <button
            title="Tìm đường"
            onClick={onDirections}
            className="icon-btn"
          >
            <Route className="w-5 h-5 text-gray-600" />
          </button>
          <button
            title="Vị trí hiện tại"
            onClick={onLocate}
            className="icon-btn"
          >
            <Navigation className="w-5 h-5 text-gray-600" />
          </button>
          <button
            title="Hướng dẫn"
            onClick={onTutorial}
            className="icon-btn"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <button
            title="Đổi nền bản đồ (Google/OSM)"
            onClick={onToggleTiles}
            className="icon-btn"
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>

        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-[1100]">
          {suggestions.map((poi) => (
            <button
              key={poi.id}
              onClick={() => onSuggestionClick(poi)}
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full grid place-items-center text-primary-600">
                  {poi.icon ?? <Search className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {poi.displayName}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {poi.area ? `${poi.area} • ` : ""}{poi.category ?? "Địa điểm"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {showSuggestions && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-[1100]">
          <div className="p-3 text-sm text-gray-500">
            {searchTerm.trim().length < 2
              ? 'Gõ ít nhất 2 ký tự'
              : 'Không tìm thấy. Thử từ khóa khác hoặc chọn theo danh mục.'}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBarWithActions
