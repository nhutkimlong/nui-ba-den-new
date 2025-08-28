// Core layout components
export { default as Layout } from './Layout'
export { default as Header } from './Header'
export { default as Footer } from './Footer'
export { default as MobileBottomNav } from './MobileBottomNav'
export { default as InstallPrompt } from './InstallPrompt'

// New responsive layout components
export { default as ResponsiveContainer } from './ResponsiveContainer'
export { default as TabletSidebar } from './TabletSidebar'
export { default as AdaptiveLayout } from './AdaptiveLayout'
export { default as SafeAreaProvider, SafeAreaTop, SafeAreaBottom, SafeAreaLeft, SafeAreaRight } from './SafeAreaProvider'
export { default as GridLayout, TwoColumnLayout, ThreeColumnLayout, SidebarLayout } from './GridLayout'

// Device detection
export { default as DeviceProvider, useDevice, MobileOnly, TabletOnly, DesktopOnly, MobileAndTablet, TabletAndDesktop } from './DeviceDetector'

// Demo component
export { default as LayoutDemo } from './LayoutDemo'
