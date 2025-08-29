import React, { useState } from 'react';
import { ContextMenu, ContextMenuItem } from '../gestures/ContextMenu';
import { usePOIContextMenu } from '../../hooks/useContextMenu';

interface DemoPOI {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
}

const samplePOIs: DemoPOI[] = [
  {
    id: 1,
    name: 'Đỉnh Núi Bà Đen',
    description: 'Đỉnh cao nhất của Núi Bà Đen với tầm nhìn tuyệt đẹp',
    category: 'Viewpoint',
    image: '🏔️'
  },
  {
    id: 2,
    name: 'Chùa Linh Sơn',
    description: 'Ngôi chùa linh thiêng trên núi',
    category: 'Temple',
    image: '🏯'
  },
  {
    id: 3,
    name: 'Cáp Treo',
    description: 'Hệ thống cáp treo hiện đại',
    category: 'Transportation',
    image: '🚠'
  },
  {
    id: 4,
    name: 'Khu Vui Chơi',
    description: 'Khu vui chơi giải trí cho gia đình',
    category: 'Entertainment',
    image: '🎡'
  }
];

export const ContextMenuDemo: React.FC = () => {
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<DemoPOI | null>(null);

  const logAction = (action: string, poi?: DemoPOI) => {
    const timestamp = new Date().toLocaleTimeString();
    const message = poi 
      ? `${timestamp}: ${action} - ${poi.name}`
      : `${timestamp}: ${action}`;
    
    setActionLog(prev => [message, ...prev.slice(0, 9)]);
  };

  const createMenuItems = (poi: DemoPOI): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Details',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      action: () => {
        setSelectedPOI(poi);
        logAction('View Details', poi);
      }
    },
    {
      id: 'directions',
      label: 'Get Directions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      action: () => logAction('Get Directions', poi)
    },
    {
      id: 'favorite',
      label: 'Add to Favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      action: () => logAction('Add to Favorites', poi)
    },
    {
      id: 'share',
      label: 'Share',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      ),
      action: () => logAction('Share', poi)
    },
    {
      id: 'separator',
      label: '---',
      icon: null,
      action: () => {},
      disabled: true
    },
    {
      id: 'report',
      label: 'Report Issue',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      action: () => logAction('Report Issue', poi),
      destructive: true
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Context Menu Demo</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POI Cards */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">POI Cards (Long press or right-click)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {samplePOIs.map((poi) => (
              <ContextMenu
                key={poi.id}
                items={createMenuItems(poi)}
                onOpen={() => logAction('Context menu opened', poi)}
                onClose={() => logAction('Context menu closed')}
              >
                <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">{poi.image}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{poi.name}</h4>
                      <span className="text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {poi.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{poi.description}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    Long press or right-click for options
                  </div>
                </div>
              </ContextMenu>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">How to use Context Menus:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Desktop:</strong> Right-click on any POI card</li>
              <li>• <strong>Mobile:</strong> Long press (hold for 500ms) on any POI card</li>
              <li>• <strong>Keyboard:</strong> Use arrow keys to navigate, Enter to select</li>
              <li>• <strong>Close:</strong> Click outside menu or press Escape</li>
              <li>• Feel haptic feedback on mobile devices</li>
            </ul>
          </div>
        </div>

        {/* Action Log & Details */}
        <div className="space-y-6">
          {/* Selected POI Details */}
          {selectedPOI && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Selected POI</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{selectedPOI.image}</span>
                  <div>
                    <div className="font-medium">{selectedPOI.name}</div>
                    <div className="text-sm text-gray-600">{selectedPOI.category}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{selectedPOI.description}</p>
                <button
                  onClick={() => setSelectedPOI(null)}
                  className="text-xs text-primary-600 hover:text-primary-800"
                >
                  Clear selection
                </button>
              </div>
            </div>
          )}

          {/* Action Log */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">Action Log</h4>
              <button
                onClick={() => setActionLog([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {actionLog.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No actions yet</p>
              ) : (
                actionLog.map((action, index) => (
                  <div
                    key={index}
                    className="text-xs p-2 bg-gray-50 rounded border-l-2 border-primary-200"
                  >
                    {action}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Context Menu Features */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Features</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Long press detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Right-click support</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Keyboard navigation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Haptic feedback</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Smart positioning</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Smooth animations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};