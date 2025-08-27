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
  rightExtra?: React.ReactNode // optional: nhúng thêm gì đó ở mép phải
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
  onClear,
  rightExtra
}) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm địa điểm..."
          value={searchTerm}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="flex-grow border-none outline-none bg-transparent text-base text-gray-700 placeholder-gray-500"
        />
        {searchTerm && (
          <button
            aria-label="Xóa ô tìm kiếm"
            onClick={onClear}
            className="p-1 rounded-full hover:bg-gray-200 ml-1"
          >
            {/* using lucide-react X from parent import context */}
            {/* Fallback to text if icon not available here */}
            <span className="w-4 h-4 text-gray-500 leading-none">×</span>
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
          {rightExtra}
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
