import React from "react"
import { Navigation, Route, Info, Globe, Search } from "lucide-react"

interface Props {
  onLocate: () => void
  onDirections: () => void
  onFocusSearch: () => void
  onTutorial: () => void
  onToggleTiles: () => void
}

const MobileActionsBar: React.FC<Props> = ({
  onLocate,
  onDirections,
  onFocusSearch,
  onTutorial,
  onToggleTiles
}) => {
  const Item = ({
    icon,
    label,
    onClick
  }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 py-1.5 w-full touch-manipulation active:scale-[0.98] transition-transform"
    >
      <div className="w-11 h-11 rounded-full bg-white/90 border border-gray-200 backdrop-blur grid place-items-center shadow-sm">
        {icon}
      </div>
      <span className="text-[11px] text-gray-700">{label}</span>
    </button>
  )

  return (
    <div
      className="
        md:hidden fixed left-0 right-0 z-[1200]
        px-3 pb-[max(env(safe-area-inset-bottom),0px)]
      "
      role="tablist"
      aria-label="Thanh chức năng"
      style={{ bottom: 'calc(72px + max(env(safe-area-inset-bottom, 0px), 0px))' }}
    >
      <div className="bg-white/90 backdrop-blur border border-gray-200 shadow-lg rounded-2xl px-2 py-1">
        <div className="grid grid-cols-5 gap-1">
          <Item
            icon={<Search className="w-5 h-5 text-gray-700" />}
            label="Tìm kiếm"
            onClick={onFocusSearch}
          />
          <Item
            icon={<Navigation className="w-5 h-5 text-gray-700" />}
            label="Vị trí"
            onClick={onLocate}
          />
          <Item
            icon={<Route className="w-5 h-5 text-gray-700" />}
            label="Lộ trình"
            onClick={onDirections}
          />
          <Item
            icon={<Info className="w-5 h-5 text-gray-700" />}
            label="Hướng dẫn"
            onClick={onTutorial}
          />
          <Item
            icon={<Globe className="w-5 h-5 text-gray-700" />}
            label="Nền"
            onClick={onToggleTiles}
          />
        </div>
      </div>
    </div>
  )
}

export default MobileActionsBar
