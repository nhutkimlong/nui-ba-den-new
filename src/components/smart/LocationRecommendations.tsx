// Location-based recommendations component
import React, { useState, useEffect } from 'react';
import { useLocationRecommendations } from '@/hooks/useLocationRecommendations';
import { UserPreferences } from '@/services/recommendationService';
import GlassCard from '@/components/modern/GlassCard';
import ModernButton from '@/components/modern/ModernButton';

interface LocationRecommendationsProps {
  userPreferences?: UserPreferences;
  className?: string;
  showWeather?: boolean;
  showPersonalized?: boolean;
  showTimeBased?: boolean;
  autoRequest?: boolean;
  radius?: number;
  limit?: number;
}

export const LocationRecommendations: React.FC<LocationRecommendationsProps> = ({
  userPreferences,
  className = '',
  showWeather = true,
  showPersonalized = true,
  showTimeBased = true,
  autoRequest = true,
  radius = 5,
  limit = 10
}) => {
  const [activeTab, setActiveTab] = useState<'nearby' | 'weather' | 'personalized' | 'time'>('nearby');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const [state, actions] = useLocationRecommendations({
    autoFetch: autoRequest,
    radius,
    limit,
    includeWeather: showWeather,
    userPreferences
  });

  // Show location prompt if no location and not loading
  useEffect(() => {
    if (!state.userLocation && !state.locationLoading && autoRequest) {
      setShowLocationPrompt(true);
    } else {
      setShowLocationPrompt(false);
    }
  }, [state.userLocation, state.locationLoading, autoRequest]);

  const handleLocationRequest = async () => {
    setShowLocationPrompt(false);
    await actions.requestLocation();
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const formatTime = (minutes?: number): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getSuitabilityColor = (suitability?: string): string => {
    switch (suitability) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⭐';
      case 'low': return '💡';
      default: return '📍';
    }
  };

  if (showLocationPrompt) {
    return (
      <GlassCard className={`p-6 text-center ${className}`}>
        <div className="mb-4">
          <div className="text-4xl mb-2">📍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cho phép truy cập vị trí
          </h3>
          <p className="text-gray-600 mb-4">
            Để nhận được gợi ý địa điểm gần bạn và phù hợp với thời tiết hiện tại
          </p>
        </div>
        
        <div className="space-y-3">
          <ModernButton
            variant="primary"
            onClick={handleLocationRequest}
            loading={state.locationLoading}
            className="w-full"
          >
            {state.locationLoading ? 'Đang xác định vị trí...' : 'Cho phép truy cập vị trí'}
          </ModernButton>
          
          <ModernButton
            variant="ghost"
            onClick={() => setShowLocationPrompt(false)}
            className="w-full"
          >
            Bỏ qua
          </ModernButton>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with location info */}
      {state.userLocation && (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📍</div>
              <div>
                <h3 className="font-semibold text-gray-900">Vị trí của bạn</h3>
                <p className="text-sm text-gray-600">
                  {state.userLocation.latitude.toFixed(4)}, {state.userLocation.longitude.toFixed(4)}
                  {state.userLocation.accuracy && (
                    <span className="ml-2">±{Math.round(state.userLocation.accuracy)}m</span>
                  )}
                </p>
              </div>
            </div>
            
            {state.weather && (
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{state.weather.icon}</span>
                  <span className="font-semibold">{state.weather.temperature}°C</span>
                </div>
                <p className="text-sm text-gray-600">{state.weather.description}</p>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Error states */}
      {state.locationError && (
        <GlassCard className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="text-red-500">⚠️</div>
            <div>
              <h4 className="font-medium text-red-800">Lỗi vị trí</h4>
              <p className="text-sm text-red-600">{state.locationError}</p>
            </div>
          </div>
          <ModernButton
            variant="secondary"
            size="sm"
            onClick={actions.requestLocation}
            className="mt-3"
          >
            Thử lại
          </ModernButton>
        </GlassCard>
      )}

      {state.recommendationsError && (
        <GlassCard className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex items-center space-x-3">
            <div className="text-yellow-500">⚠️</div>
            <div>
              <h4 className="font-medium text-yellow-800">Lỗi tải gợi ý</h4>
              <p className="text-sm text-yellow-600">{state.recommendationsError}</p>
            </div>
          </div>
          <ModernButton
            variant="secondary"
            size="sm"
            onClick={actions.refreshRecommendations}
            className="mt-3"
          >
            Tải lại
          </ModernButton>
        </GlassCard>
      )}

      {/* Tab navigation */}
      <div className="flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('nearby')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'nearby'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Gần đây ({state.nearbyRecommendations.length})
        </button>
        
        {showWeather && (
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'weather'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Thời tiết ({state.weatherRecommendations.length})
          </button>
        )}
        
        {showPersonalized && userPreferences && (
          <button
            onClick={() => setActiveTab('personalized')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'personalized'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Cá nhân ({state.personalizedRecommendations.length})
          </button>
        )}
        
        {showTimeBased && (
          <button
            onClick={() => setActiveTab('time')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === 'time'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Thời gian
          </button>
        )}
      </div>

      {/* Loading state */}
      {state.recommendationsLoading && (
        <GlassCard className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải gợi ý...</p>
        </GlassCard>
      )}

      {/* Content based on active tab */}
      {!state.recommendationsLoading && (
        <>
          {/* Nearby recommendations */}
          {activeTab === 'nearby' && (
            <div className="space-y-4">
              {state.nearbyRecommendations.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Không có gợi ý gần đây</h3>
                  <p className="text-gray-600">
                    {state.userLocation 
                      ? 'Không tìm thấy địa điểm nào trong bán kính tìm kiếm'
                      : 'Vui lòng cho phép truy cập vị trí để nhận gợi ý'
                    }
                  </p>
                </GlassCard>
              ) : (
                state.nearbyRecommendations.map((rec) => (
                  <GlassCard key={rec.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getPriorityIcon(rec.priority)}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {'name' in rec.item ? rec.item.name : rec.item.activity}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {'description' in rec.item ? rec.item.description : (rec.item as any).reason}
                            </p>
                          </div>
                          
                          <div className="text-right text-sm">
                            {rec.distance && (
                              <div className="text-blue-600 font-medium">
                                {formatDistance(rec.distance)}
                              </div>
                            )}
                            {rec.estimatedTime && (
                              <div className="text-gray-500">
                                {formatTime(rec.estimatedTime)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {rec.reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {rec.reasons.map((reason, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {rec.weatherSuitability && (
                          <div className="mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getSuitabilityColor(rec.weatherSuitability)}`}>
                              Thời tiết: {rec.weatherSuitability}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {/* Weather recommendations */}
          {activeTab === 'weather' && showWeather && (
            <div className="space-y-6">
              {state.weatherRecommendations.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-2">🌤️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Không có gợi ý thời tiết</h3>
                  <p className="text-gray-600">Đang tải thông tin thời tiết...</p>
                </GlassCard>
              ) : (
                state.weatherRecommendations.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{group.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{group.title}</h3>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {group.recommendations.map((rec) => (
                        <GlassCard key={rec.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="text-xl">{getPriorityIcon(rec.priority)}</div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {'name' in rec.item ? rec.item.name : rec.item.activity}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {'description' in rec.item ? rec.item.description : (rec.item as any).reason}
                              </p>
                              
                              {rec.weatherSuitability && (
                                <div className="mt-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${getSuitabilityColor(rec.weatherSuitability)}`}>
                                    {rec.weatherSuitability}
                                  </span>
                                </div>
                              )}
                              
                              {rec.reasons.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {rec.reasons.map((reason, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                                    >
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Personalized recommendations */}
          {activeTab === 'personalized' && showPersonalized && userPreferences && (
            <div className="space-y-6">
              {state.personalizedRecommendations.length === 0 ? (
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Đang tải gợi ý cá nhân</h3>
                  <p className="text-gray-600">Dựa trên sở thích và preferences của bạn</p>
                </GlassCard>
              ) : (
                state.personalizedRecommendations.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{group.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{group.title}</h3>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {group.recommendations.map((rec) => (
                        <GlassCard key={rec.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="text-xl">{getPriorityIcon(rec.priority)}</div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {'name' in rec.item ? rec.item.name : rec.item.activity}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {'description' in rec.item ? rec.item.description : (rec.item as any).reason}
                              </p>
                              
                              {rec.reasons.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {rec.reasons.map((reason, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                    >
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Time-based recommendations */}
          {activeTab === 'time' && showTimeBased && (
            <div className="space-y-4">
              {!state.timeBasedRecommendations ? (
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-2">🕐</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Đang tải gợi ý theo thời gian</h3>
                  <p className="text-gray-600">Dựa trên thời gian hiện tại</p>
                </GlassCard>
              ) : (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{state.timeBasedRecommendations.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{state.timeBasedRecommendations.title}</h3>
                      <p className="text-sm text-gray-600">{state.timeBasedRecommendations.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {state.timeBasedRecommendations.recommendations.map((rec) => (
                      <GlassCard key={rec.id} className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-xl">{getPriorityIcon(rec.priority)}</div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {'name' in rec.item ? rec.item.name : rec.item.activity}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {'description' in rec.item ? rec.item.description : (rec.item as any).reason}
                            </p>
                            
                            {rec.reasons.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {rec.reasons.map((reason, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Refresh button */}
      <div className="text-center">
        <ModernButton
          variant="ghost"
          onClick={actions.refreshRecommendations}
          loading={state.recommendationsLoading}
          className="w-full"
        >
          🔄 Làm mới gợi ý
        </ModernButton>
      </div>
    </div>
  );
};