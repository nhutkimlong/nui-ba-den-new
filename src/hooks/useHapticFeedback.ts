import { useCallback } from 'react'

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

interface HapticFeedback {
  light: () => void
  medium: () => void
  heavy: () => void
  success: () => void
  warning: () => void
  error: () => void
  custom: (pattern: number[]) => void
}

export const useHapticFeedback = (): HapticFeedback => {
  const isSupported = 'vibrate' in navigator

  const triggerHaptic = useCallback((type: HapticType) => {
    if (!isSupported) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [50, 100, 50],
      warning: [100, 50, 100],
      error: [200, 100, 200, 100, 200]
    }

    const pattern = patterns[type]
    if (pattern) {
      navigator.vibrate(pattern)
    }
  }, [isSupported])

  const customHaptic = useCallback((pattern: number[]) => {
    if (!isSupported) return
    navigator.vibrate(pattern)
  }, [isSupported])

  return {
    light: () => triggerHaptic('light'),
    medium: () => triggerHaptic('medium'),
    heavy: () => triggerHaptic('heavy'),
    success: () => triggerHaptic('success'),
    warning: () => triggerHaptic('warning'),
    error: () => triggerHaptic('error'),
    custom: customHaptic
  }
}

// Enhanced button with haptic feedback
export const useHapticButton = () => {
  const haptic = useHapticFeedback()

  const handlePress = useCallback((type: HapticType = 'light') => {
    haptic[type]()
  }, [haptic])

  return {
    onPress: handlePress,
    onSuccess: () => haptic.success(),
    onWarning: () => haptic.warning(),
    onError: () => haptic.error()
  }
}
