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
      className="flex flex-col items-center justify-center gap-1 py-2 w-full touch-manipulation"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 grid place-items-center shadow-sm">
        {icon}
      </div>
      <span className="text-[11px] text-gray-700">{label}</span>
    </button>
  )

  return (
    <div
      className="
        md:hidden
        fixed left-0 right-0
        bg-white border-t border-gray-200
        grid grid-cols-5 gap-1
        px-2 pb-[max(env(safe-area-inset-bottom),0px)] z-[1200]
      "
      role="tablist"
      aria-label="Thanh chức năng"
      style={{ bottom: 'calc(72px + max(env(safe-area-inset-bottom, 0px), 0px))' }}
    >
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
  )
}

export default MobileActionsBar
