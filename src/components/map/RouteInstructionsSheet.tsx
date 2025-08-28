import React, { useRef } from "react"
import { X, Route } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPersonWalking, faCableCar, faCheck } from "@fortawesome/free-solid-svg-icons"
import { cn } from "@/utils/cn"

type Instruction = {
  type: "walk" | "cable" | "coaster"
  text: string
  distance?: number
  duration?: number
  routeName?: string
}

interface Props {
  visible: boolean
  onClose: () => void
  route: {
    path?: string[]
    startName?: string
    endName?: string
  } | null
  instructions: Instruction[]
  currentLang: string
  expanded: boolean
  setExpanded: (v: boolean) => void
  onZoomToRoute?: () => void
}

const RouteInstructionsSheet: React.FC<Props> = ({
  visible,
  onClose,
  route,
  instructions,
  expanded,
  setExpanded,
  onZoomToRoute
}) => {
  if (!route || !visible) return null

  const totalTime = instructions.reduce((s, i) => s + (i.duration || 0), 0)
  const totalCost = instructions.reduce((s, i) => s + (i.type === "cable" ? 150000 : i.type === "coaster" ? 200000 : 0), 0)

  const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px)").matches
  const touchRef = useRef<{ startY: number; wasExpanded: boolean } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { startY: e.touches[0].clientY, wasExpanded: expanded }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const deltaY = e.changedTouches[0].clientY - touchRef.current.startY
    if (Math.abs(deltaY) < 20) setExpanded(!expanded)
    else if (deltaY > 30) setExpanded(false)
    else if (deltaY < -30) setExpanded(true)
    touchRef.current = null
  }

  const chip = (label: string) => (
    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium">{label}</span>
  )

  return (
    <div
      className={cn("route-instructions-panel", visible && "visible")}
      style={
        isMobile
          ? { transform: visible ? "translateY(0)" : "translateY(100%)", bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }
          : undefined
      }
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
      role="dialog"
      aria-label="Chỉ dẫn lộ trình"
      aria-live="polite"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full grid place-items-center">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {route.startName && route.endName ? `${route.startName} → ${route.endName}` : "Lộ trình"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {chip(`${route.path?.length || 0} điểm dừng`)}
                {chip(`${Math.round(totalTime)}’`)}
                {totalCost > 0 && chip(`${(totalCost / 1000).toLocaleString()}k đ`)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onZoomToRoute && (
              <button
                onClick={onZoomToRoute}
                className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-lg grid place-items-center transition-all shadow text-white"
                aria-label="Zoom về đường đi"
                title="Zoom về đường đi"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg grid place-items-center transition-all shadow text-white"
              aria-label="Đóng bảng chỉ dẫn"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {instructions.length > 0 ? (
          instructions.map((inst, idx) => {
            const color =
              inst.type === "walk" ? "bg-green-500" : inst.type === "cable" ? "bg-blue-500" : inst.type === "coaster" ? "bg-orange-500" : "bg-gray-500"
            const icon =
              inst.type === "walk" ? faPersonWalking : inst.type === "cable" ? faCableCar : inst.type === "coaster" ? faPersonWalking : faCheck
            return (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={cn("flex-shrink-0 w-8 h-8 rounded-full grid place-items-center text-white", color)}>
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium text-sm leading-relaxed">{inst.text}</p>
                    <div className="mt-1 flex gap-2 flex-wrap">
                      {inst.routeName && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{inst.routeName}</span>}
                      {typeof inst.distance === "number" && inst.distance > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{Math.round(inst.distance)} m</span>
                      )}
                      {typeof inst.duration === "number" && inst.duration > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{Math.round(inst.duration)}’</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full grid place-items-center">
                <FontAwesomeIcon icon={faCheck} className="text-blue-600" />
              </div>
              <div>
                <p className="text-blue-900 font-medium text-sm">Lộ trình đã được tìm thấy</p>
                <p className="text-blue-700 text-xs mt-1">{route.path?.length || 0} điểm dừng</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cable routes summary (nếu cần) */}
      {instructions.some(i => i.type === "cable") && (
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FontAwesomeIcon icon={faCableCar} className="text-blue-600" />
            <span>
              Tuyến: {Array.from(new Set(instructions.filter(i => i.type === "cable" && i.routeName).map(i => i.routeName))).join(", ")}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteInstructionsSheet
