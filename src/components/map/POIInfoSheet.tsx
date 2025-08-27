import React, { useRef, useState, useEffect } from "react"
import { X, Route, Map as MapIcon, Info, Mail, Facebook, ExternalLink, Phone } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStickyNote, faCableCar, faPersonWalking, faPlay, faPause } from "@fortawesome/free-solid-svg-icons"
import { cn } from "@/utils/cn"

type POI = any

interface Props {
  poi: POI | null
  visible: boolean
  expanded: boolean
  setExpanded: (v: boolean) => void
  onClose: () => void
  onGetDirections: (poi: POI, dir: "from" | "to") => void
  t: (key: string, ...args: any[]) => string
  getPoiName: (poi: POI) => string
  getPoiDesc: (poi: POI) => string
  operatingStatus?: { operational: boolean; message: string } | null
  isDescentRoute?: boolean
  currentLang?: string
}

const POIInfoSheet: React.FC<Props> = ({
  poi,
  visible,
  expanded,
  setExpanded,
  onClose,
  onGetDirections,
  t,
  getPoiName,
  getPoiDesc,
  operatingStatus,
  isDescentRoute,
  currentLang
}) => {
  if (!poi) return null
  const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px)").matches
  const touchDataRef = useRef<{ startY: number; wasExpanded: boolean } | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const name = getPoiName(poi)
  const description = getPoiDesc(poi)
  const area = poi.area || "N/A"
  const audioUrl = (currentLang === 'en' ? (poi.audio_url_en || poi.audio_url) : (poi.audio_url || poi.audio_url_en)) as string | null

  const onTouchStart = (e: React.TouchEvent) => {
    touchDataRef.current = { startY: e.touches[0].clientY, wasExpanded: expanded }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchDataRef.current) return
    const deltaY = e.changedTouches[0].clientY - touchDataRef.current.startY
    if (Math.abs(deltaY) < 20) setExpanded(!expanded)
    else if (deltaY > 30) setExpanded(false)
    else if (deltaY < -30) setExpanded(true)
    touchDataRef.current = null
  }

  useEffect(() => {
    if (!audioRef.current) return
    const onEnded = () => setIsPlaying(false)
    audioRef.current.addEventListener('ended', onEnded)
    return () => audioRef.current?.removeEventListener('ended', onEnded)
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  return (
    <div
      className={cn("poi-panel", visible && "visible")}
      style={
        isMobile
          ? { transform: visible ? "translateY(0)" : "translateY(100%)", bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }
          : undefined
      }
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
      aria-live="polite"
      role="dialog"
      aria-label="Thông tin địa điểm"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white z-10 rounded-lg shadow-lg transition-all grid place-items-center"
        aria-label={t("close")}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Cover image */}
      {poi.imageurl && (
        <div className="w-full h-[200px] sm:h-[280px] bg-gray-100 rounded-t-lg overflow-hidden">
          <img src={poi.imageurl} alt={name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="relative max-h-[inherit] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 p-3 sm:p-4">
        <h3 className="text-lg sm:text-xl font-bold mb-1 text-primary-600">{name}</h3>
        <p className="text-xs text-gray-600 mb-2">{t("poiInfoArea")}: {area}</p>

        {/* Audio guide */}
        {audioUrl && (
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-md text-white text-xs font-semibold shadow",
                isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-primary-500 hover:bg-primary-600"
              )}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              <span>{isPlaying ? "Tạm dừng thuyết minh" : "Nghe thuyết minh"}</span>
            </button>
            <audio ref={audioRef} src={audioUrl || undefined} preload="none" />
          </div>
        )}

        {/* Status */}
        {operatingStatus?.message && (
          <div
            className={cn(
              "poi-status text-xs sm:text-sm font-semibold mb-3 p-2 rounded-lg border",
              operatingStatus.operational
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", operatingStatus.operational ? "bg-green-500" : "bg-red-500")} />
              <span>{operatingStatus.message}</span>
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{description}</p>
          </div>
        )}

        {/* Contact */}
        {(poi.phone || poi.email || poi.website || poi.facebook) && (
          <div className="mb-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-800">Thông tin liên hệ</span>
              </div>
              <div className="space-y-1 text-xs">
                {poi.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-500" /><span>{poi.phone}</span></div>}
                {poi.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-gray-500" /><span>{poi.email}</span></div>}
                {poi.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                    <a href={poi.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website</a>
                  </div>
                )}
                {poi.facebook && (
                  <div className="flex items-center gap-2">
                    <Facebook className="w-3 h-3 text-gray-500" />
                    <a href={poi.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {poi.notes && (
          <div className="mb-3">
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faStickyNote} className="text-yellow-600 text-lg" />
                <span className="text-sm font-semibold text-yellow-800">Lưu ý</span>
              </div>
              <p className="text-xs text-yellow-700 leading-relaxed">{poi.notes}</p>
            </div>
          </div>
        )}

        {/* Descent choice special CTA */}
        {isDescentRoute ? (
          <div className="mb-3">
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faCableCar} className="text-orange-600 text-lg" />
                <span className="text-sm font-semibold text-orange-800">Chọn phương tiện xuống núi</span>
              </div>
              <p className="text-xs text-orange-700">Máng trượt hoạt động theo lịch; cáp treo hoạt động thường xuyên.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onGetDirections({ ...poi, descentChoice: "cable_car" }, "to")}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-xs shadow-sm"
              >
                <FontAwesomeIcon icon={faCableCar} className="text-lg" />
                <span>Cáp treo</span>
              </button>
              <button
                onClick={() => onGetDirections({ ...poi, descentChoice: "alpine_coaster" }, "to")}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 text-xs shadow-sm"
              >
                <FontAwesomeIcon icon={faPersonWalking} className="text-lg" />
                <span>Máng trượt</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 text-xs sm:text-sm">
            <button
              onClick={() => onGetDirections(poi, "from")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <MapIcon className="w-4 h-4" />
              {t("routeFromHere")}
            </button>
            <button
              onClick={() => onGetDirections(poi, "to")}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <Route className="w-4 h-4" />
              {t("routeToHere")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default POIInfoSheet
