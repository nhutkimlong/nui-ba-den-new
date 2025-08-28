import React from 'react'
import { 
  ResponsiveContainer, 
  GridLayout, 
  TwoColumnLayout, 
  ThreeColumnLayout,
  useDevice,
  MobileOnly,
  TabletOnly,
  DesktopOnly,
  SafeAreaTop,
  SafeAreaBottom
} from './index'

const LayoutDemo = () => {
  const { isMobile, isTablet, isDesktop, isTouchDevice } = useDevice()

  return (
    <ResponsiveContainer maxWidth="6xl" padding="lg">
      <div className="space-y-12">
        {/* Device Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Device Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-600">Mobile</div>
              <div className="text-2xl">{isMobile ? '✅' : '❌'}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-600">Tablet</div>
              <div className="text-2xl">{isTablet ? '✅' : '❌'}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-purple-600">Desktop</div>
              <div className="text-2xl">{isDesktop ? '✅' : '❌'}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="font-semibold text-orange-600">Touch</div>
              <div className="text-2xl">{isTouchDevice ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Responsive Components */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Responsive Components</h2>
          
          <MobileOnly>
            <div className="p-4 bg-blue-100 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-800">Mobile Only Content</h3>
              <p className="text-blue-600">This content only shows on mobile devices</p>
            </div>
          </MobileOnly>

          <TabletOnly>
            <div className="p-4 bg-green-100 rounded-lg mb-4">
              <h3 className="font-semibold text-green-800">Tablet Only Content</h3>
              <p className="text-green-600">This content only shows on tablet devices</p>
            </div>
          </TabletOnly>

          <DesktopOnly>
            <div className="p-4 bg-purple-100 rounded-lg mb-4">
              <h3 className="font-semibold text-purple-800">Desktop Only Content</h3>
              <p className="text-purple-600">This content only shows on desktop devices</p>
            </div>
          </DesktopOnly>
        </div>

        {/* Grid Layout Demo */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Grid Layout Demo</h2>
          
          <GridLayout 
            cols={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap={{ mobile: 4, tablet: 6, desktop: 8 }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Card {item}</h3>
                <p className="text-blue-600">This is a responsive grid card that adapts to different screen sizes.</p>
              </div>
            ))}
          </GridLayout>
        </div>

        {/* Two Column Layout */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Two Column Layout</h2>
          
          <TwoColumnLayout>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Left Column</h3>
              <p className="text-green-600">This is the left column content. On mobile it will stack above the right column.</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">Right Column</h3>
              <p className="text-orange-600">This is the right column content. On mobile it will stack below the left column.</p>
            </div>
          </TwoColumnLayout>
        </div>

        {/* Three Column Layout */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Three Column Layout</h2>
          
          <ThreeColumnLayout>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Column 1</h3>
              <p className="text-purple-600">First column content</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">Column 2</h3>
              <p className="text-indigo-600">Second column content</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-lg border border-teal-200">
              <h3 className="font-semibold text-teal-800 mb-2">Column 3</h3>
              <p className="text-teal-600">Third column content</p>
            </div>
          </ThreeColumnLayout>
        </div>

        {/* Auto-fit Grid */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Auto-fit Grid</h2>
          
          <GridLayout 
            autoFit={true}
            minWidth="250px"
            gap={{ mobile: 4, tablet: 6, desktop: 8 }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Auto-fit Card {item}</h3>
                <p className="text-yellow-600">This card automatically fits based on available space.</p>
              </div>
            ))}
          </GridLayout>
        </div>

        {/* Safe Area Demo */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Safe Area Demo</h2>
          
          <SafeAreaTop>
            <div className="bg-blue-100 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-800">Safe Area Top</h3>
              <p className="text-blue-600">This content respects the top safe area on mobile devices.</p>
            </div>
          </SafeAreaTop>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-800">Regular Content</h3>
            <p className="text-gray-600">This is regular content without safe area considerations.</p>
          </div>

          <SafeAreaBottom>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Safe Area Bottom</h3>
              <p className="text-green-600">This content respects the bottom safe area on mobile devices.</p>
            </div>
          </SafeAreaBottom>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

export default LayoutDemo
