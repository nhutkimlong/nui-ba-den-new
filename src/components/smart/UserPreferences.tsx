// User preferences component for managing user preferences and personalization
import React, { useState, useEffect } from 'react';
import { preferencesService, PreferenceCategory, PreferenceProfile } from '@/services/preferencesService';
import { UserPreferences as UserPreferencesType } from '@/services/recommendationService';
import GlassCard from '@/components/modern/GlassCard';
import ModernButton from '@/components/modern/ModernButton';

interface UserPreferencesProps {
  onPreferencesChange?: (preferences: UserPreferencesType) => void;
  onComplete?: (preferences: UserPreferencesType) => void;
  showProfiles?: boolean;
  showAnalytics?: boolean;
  className?: string;
}

export const UserPreferences: React.FC<UserPreferencesProps> = ({
  onPreferencesChange,
  onComplete,
  showProfiles = true,
  showAnalytics = true,
  className = ''
}) => {
  const [preferences, setPreferences] = useState<UserPreferencesType>(() => {
    const saved = preferencesService.getUserPreferences();
    return saved || {
      interests: [],
      activityLevel: 'moderate',
      budgetRange: 'mid-range',
      groupType: 'solo',
      accessibility: false,
      preferredLanguage: 'vi'
    };
  });

  const [activeStep, setActiveStep] = useState(0);
  const [categories] = useState<PreferenceCategory[]>(preferencesService.getCategories());
  const [profiles] = useState<PreferenceProfile[]>(preferencesService.getProfiles());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [completeness, setCompleteness] = useState(0);

  const steps = [
    { id: 'interests', title: 'Sở thích', icon: '❤️' },
    { id: 'activity', title: 'Mức độ hoạt động', icon: '🏃' },
    { id: 'budget', title: 'Ngân sách', icon: '💰' },
    { id: 'group', title: 'Loại hình du lịch', icon: '👥' },
    { id: 'accessibility', title: 'Khả năng tiếp cận', icon: '♿' }
  ];

  // Update completeness when preferences change
  useEffect(() => {
    const newCompleteness = preferencesService.getPreferenceCompleteness();
    setCompleteness(newCompleteness);
  }, [preferences]);

  // Handle preference change
  const handlePreferenceChange = <K extends keyof UserPreferencesType>(
    key: K,
    value: UserPreferencesType[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    if (onPreferencesChange) {
      onPreferencesChange(newPreferences);
    }
  };

  // Handle interest toggle
  const handleInterestToggle = (interest: string) => {
    const newInterests = preferences.interests.includes(interest)
      ? preferences.interests.filter(i => i !== interest)
      : [...preferences.interests, interest];
    
    handlePreferenceChange('interests', newInterests);
  };

  // Apply profile
  const handleApplyProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile && profile.preferences) {
      const newPreferences: UserPreferencesType = {
        ...preferences,
        ...profile.preferences
      };
      setPreferences(newPreferences);
      preferencesService.applyProfile(profileId);
      
      if (onPreferencesChange) {
        onPreferencesChange(newPreferences);
      }
    }
  };

  // Save preferences
  const handleSave = () => {
    preferencesService.saveUserPreferences(preferences);
    if (onComplete) {
      onComplete(preferences);
    }
  };

  // Reset preferences
  const handleReset = () => {
    preferencesService.resetPreferences();
    const defaultPrefs: UserPreferencesType = {
      interests: [],
      activityLevel: 'moderate',
      budgetRange: 'mid-range',
      groupType: 'solo',
      accessibility: false,
      preferredLanguage: 'vi'
    };
    setPreferences(defaultPrefs);
    setActiveStep(0);
  };

  // Get smart defaults
  const handleSmartDefaults = () => {
    const smartDefaults = preferencesService.getSmartDefaults();
    const newPreferences = { ...preferences, ...smartDefaults };
    setPreferences(newPreferences);
    
    if (onPreferencesChange) {
      onPreferencesChange(newPreferences);
    }
  };

  // Navigation
  const goToStep = (step: number) => {
    setActiveStep(Math.max(0, Math.min(steps.length - 1, step)));
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderInterestsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Bạn quan tâm đến những gì?
        </h3>
        <p className="text-gray-600">
          Chọn các sở thích để nhận gợi ý phù hợp (có thể chọn nhiều)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleInterestToggle(category.id)}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              preferences.interests.includes(category.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <div className="font-medium text-sm">{category.name}</div>
            <div className="text-xs text-gray-500 mt-1">{category.description}</div>
          </button>
        ))}
      </div>

      {preferences.interests.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Đã chọn:</strong> {preferences.interests.map(id => 
              categories.find(c => c.id === id)?.name
            ).join(', ')}
          </p>
        </div>
      )}
    </div>
  );

  const renderActivityStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Mức độ hoạt động của bạn?
        </h3>
        <p className="text-gray-600">
          Điều này giúp chúng tôi gợi ý các hoạt động phù hợp với thể lực
        </p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'low', label: 'Thấp', description: 'Thích nghỉ ngơi, ít vận động', icon: '🚶' },
          { value: 'moderate', label: 'Trung bình', description: 'Cân bằng giữa nghỉ ngơi và hoạt động', icon: '🚶‍♂️' },
          { value: 'high', label: 'Cao', description: 'Thích thử thách, hoạt động mạnh', icon: '🏃' }
        ].map((level) => (
          <button
            key={level.value}
            onClick={() => handlePreferenceChange('activityLevel', level.value as any)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              preferences.activityLevel === level.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{level.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBudgetStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ngân sách dự kiến?
        </h3>
        <p className="text-gray-600">
          Giúp chúng tôi gợi ý các dịch vụ phù hợp với túi tiền
        </p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'budget', label: 'Tiết kiệm', description: 'Dưới 500.000 VNĐ/người', icon: '💵' },
          { value: 'mid-range', label: 'Trung bình', description: '500.000 - 1.500.000 VNĐ/người', icon: '💰' },
          { value: 'luxury', label: 'Cao cấp', description: 'Trên 1.500.000 VNĐ/người', icon: '💎' }
        ].map((budget) => (
          <button
            key={budget.value}
            onClick={() => handlePreferenceChange('budgetRange', budget.value as any)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              preferences.budgetRange === budget.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{budget.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{budget.label}</div>
                <div className="text-sm text-gray-600">{budget.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderGroupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Bạn đi du lịch với ai?
        </h3>
        <p className="text-gray-600">
          Điều này giúp gợi ý các hoạt động và dịch vụ phù hợp
        </p>
      </div>

      <div className="space-y-3">
        {[
          { value: 'solo', label: 'Một mình', description: 'Du lịch cá nhân, tự do khám phá', icon: '🧳' },
          { value: 'couple', label: 'Cặp đôi', description: 'Du lịch lãng mạn cho hai người', icon: '💑' },
          { value: 'family', label: 'Gia đình', description: 'Du lịch cùng gia đình, có trẻ em', icon: '👨‍👩‍👧‍👦' },
          { value: 'group', label: 'Nhóm bạn', description: 'Du lịch cùng bạn bè, nhóm đông người', icon: '👥' }
        ].map((group) => (
          <button
            key={group.value}
            onClick={() => handlePreferenceChange('groupType', group.value as any)}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              preferences.groupType === group.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{group.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{group.label}</div>
                <div className="text-sm text-gray-600">{group.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAccessibilityStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Yêu cầu về khả năng tiếp cận
        </h3>
        <p className="text-gray-600">
          Giúp chúng tôi gợi ý các địa điểm dễ tiếp cận
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.accessibility}
            onChange={(e) => handlePreferenceChange('accessibility', e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex items-center space-x-3">
            <span className="text-2xl">♿</span>
            <div>
              <div className="font-medium text-gray-900">Cần hỗ trợ khả năng tiếp cận</div>
              <div className="text-sm text-gray-600">
                Ưu tiên các địa điểm có thang máy, đường dốc, và dễ di chuyển
              </div>
            </div>
          </div>
        </label>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Ngôn ngữ ưa thích</h4>
          <div className="flex space-x-3">
            {[
              { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
              { value: 'en', label: 'English', flag: '🇺🇸' }
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => handlePreferenceChange('preferredLanguage', lang.value as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                  preferences.preferredLanguage === lang.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cá nhân hóa trải nghiệm của bạn
        </h2>
        <p className="text-gray-600">
          Thiết lập preferences để nhận gợi ý phù hợp nhất
        </p>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Hoàn thành</span>
            <span>{completeness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Profiles */}
      {showProfiles && (
        <GlassCard className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Chọn nhanh theo hồ sơ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleApplyProfile(profile.id)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <h4 className="font-medium text-gray-900 mb-1">{profile.name}</h4>
                <p className="text-sm text-gray-600">{profile.description}</p>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex space-x-3">
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={handleSmartDefaults}
            >
              🤖 Gợi ý thông minh
            </ModernButton>
            <ModernButton
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              🔄 Đặt lại
            </ModernButton>
          </div>
        </GlassCard>
      )}

      {/* Step Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeStep === index
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{step.icon}</span>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <GlassCard className="p-8 mb-8">
        {activeStep === 0 && renderInterestsStep()}
        {activeStep === 1 && renderActivityStep()}
        {activeStep === 2 && renderBudgetStep()}
        {activeStep === 3 && renderGroupStep()}
        {activeStep === 4 && renderAccessibilityStep()}
      </GlassCard>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <ModernButton
          variant="ghost"
          onClick={prevStep}
          disabled={activeStep === 0}
        >
          ← Quay lại
        </ModernButton>

        <div className="flex space-x-3">
          {activeStep < steps.length - 1 ? (
            <ModernButton
              variant="primary"
              onClick={nextStep}
            >
              Tiếp theo →
            </ModernButton>
          ) : (
            <ModernButton
              variant="primary"
              onClick={handleSave}
            >
              ✅ Hoàn thành
            </ModernButton>
          )}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <GlassCard className="p-6 mt-8">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <span>⚙️</span>
            <span className="text-sm font-medium">Cài đặt nâng cao</span>
          </button>

          {showAdvanced && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Xuất/Nhập dữ liệu</h4>
                <div className="flex space-x-3">
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const data = preferencesService.exportUserData();
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'ba-den-preferences.json';
                      a.click();
                    }}
                  >
                    📤 Xuất dữ liệu
                  </ModernButton>
                  <ModernButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const data = JSON.parse(e.target?.result as string);
                              preferencesService.importUserData(data);
                              window.location.reload();
                            } catch (error) {
                              alert('Lỗi đọc file dữ liệu');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    📥 Nhập dữ liệu
                  </ModernButton>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};