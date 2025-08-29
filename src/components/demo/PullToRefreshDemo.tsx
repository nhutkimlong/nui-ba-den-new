import React, { useState } from 'react';
import { PullToRefresh } from '../gestures/PullToRefresh';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

interface DemoItem {
  id: number;
  title: string;
  description: string;
  timestamp: string;
}

export const PullToRefreshDemo: React.FC = () => {
  const [items, setItems] = useState<DemoItem[]>([
    {
      id: 1,
      title: 'Welcome to Núi Bà Đen',
      description: 'Discover the beauty of Black Lady Mountain',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      title: 'Cable Car Experience',
      description: 'Enjoy breathtaking views from above',
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 3,
      title: 'Hiking Trails',
      description: 'Explore various difficulty levels',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [refreshStats, setRefreshStats] = useState({
    totalRefreshes: 0,
    lastRefreshTime: null as string | null
  });

  const handleDataRefresh = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add new item to the top
    const newItem: DemoItem = {
      id: Date.now(),
      title: `New Update #${refreshStats.totalRefreshes + 1}`,
      description: 'Fresh content loaded via pull-to-refresh',
      timestamp: new Date().toLocaleTimeString()
    };

    setItems(prev => [newItem, ...prev]);
    setRefreshStats({
      totalRefreshes: refreshStats.totalRefreshes + 1,
      lastRefreshTime: new Date().toLocaleString()
    });
  };

  const { isRefreshing, refreshCount, handleRefresh } = usePullToRefresh({
    onRefresh: handleDataRefresh,
    cooldownMs: 2000
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-primary-600 text-white p-4">
        <h2 className="text-xl font-bold">Pull to Refresh Demo</h2>
        <p className="text-primary-100 text-sm mt-1">
          Pull down to refresh the content
        </p>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 p-3 border-b">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Refreshes:</span>
          <span className="font-medium">{refreshStats.totalRefreshes}</span>
        </div>
        {refreshStats.lastRefreshTime && (
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Last Refresh:</span>
            <span className="font-medium text-xs">{refreshStats.lastRefreshTime}</span>
          </div>
        )}
      </div>

      <PullToRefresh
        onRefresh={handleDataRefresh}
        threshold={80}
        maxPullDistance={120}
        className="h-96"
      >
        <div className="p-4 space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                index === 0 && refreshStats.totalRefreshes > 0
                  ? 'bg-green-50 border-green-200 animate-pulse'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="font-semibold text-gray-800">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{item.timestamp}</span>
                {index === 0 && refreshStats.totalRefreshes > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Loading placeholder */}
          {isRefreshing && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Manual refresh button */}
      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
        >
          {isRefreshing ? 'Refreshing...' : 'Manual Refresh'}
        </button>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border-t">
        <h4 className="font-medium text-blue-800 mb-2">How to use:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pull down from the top to refresh</li>
          <li>• Release when you see "Release to refresh"</li>
          <li>• Feel the haptic feedback on mobile devices</li>
          <li>• New content will appear at the top</li>
        </ul>
      </div>
    </div>
  );
};