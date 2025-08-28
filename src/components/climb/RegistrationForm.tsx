import React, { useState } from 'react';
import { RegistrationData, GpsSettings, RepresentativeType } from '../../types/climb';
import Button from '../common/Button';
import Input from '../common/Input';
import { 
  User, 
  Phone, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Mail, 
  Users, 
  Clock, 
  List, 
  Shield, 
  Mountain,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  gpsSettings: GpsSettings;
  currentDateTime: { date: string; time: string };
  representativeType: RepresentativeType | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  gpsSettings: _gpsSettings,
  currentDateTime,
  representativeType
}) => {
  const [formData, setFormData] = useState<RegistrationData>({
    leaderName: '',
    birthday: '',
    phoneNumber: '',
    cccd: '',
    address: '',
    groupSize: representativeType === 'individual' ? '1' : '',
    email: '',
    climbDate: currentDateTime.date,
    climbTime: currentDateTime.time,
    safetyCommit: false,
    memberList: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progressSteps = [
    { id: 1, title: 'Thông tin cá nhân', completed: !!formData.leaderName && !!formData.phoneNumber && !!formData.birthday },
    { id: 2, title: 'Thông tin liên hệ', completed: !!formData.cccd && !!formData.address && !!formData.email },
    { id: 3, title: 'Thông tin leo núi', completed: !!formData.groupSize && !!formData.climbDate },
    { id: 4, title: 'Cam kết an toàn', completed: formData.safetyCommit }
  ];

  const completedSteps = progressSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / progressSteps.length) * 100;

  return (
    <div className="max-w-4xl w-full mx-auto px-3 md:px-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl p-4 md:p-5 text-white">
        <div className="flex items-center gap-3 md:gap-4 mb-2.5 md:mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Mountain className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">Đăng ký leo núi</h1>
            <p className="text-primary-100 text-xs md:text-sm">Hoàn thành thông tin để nhận chứng nhận leo núi</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between text-xs md:text-sm">
            <span>Tiến độ hoàn thành</span>
            <span>{completedSteps}/{progressSteps.length}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5 md:h-2">
            <div 
              className="bg-white h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] md:text-xs text-primary-100">
            {progressSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  step.completed 
                    ? "bg-white text-primary-600" 
                    : "bg-white/20 text-white"
                )}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{step.id}</span>
                  )}
                </div>
                <span className="text-center max-w-16 truncate">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-b-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-5 md:space-y-5">
          {/* Personal Information Section */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-2 md:gap-2.5 pb-1 border-b border-gray-200">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg md:text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
              <Input
                label="Họ tên Trưởng đoàn"
                required
                leftIcon={<User className="w-4 h-4" />}
                placeholder="Nguyễn Văn An"
                value={formData.leaderName}
                onChange={(e) => handleInputChange('leaderName', e.target.value)}
                helperText="Tên người đại diện cho đoàn leo núi"
              />
              
              <Input
                label="Số điện thoại"
                type="tel"
                required
                pattern="[0-9]{10,11}"
                leftIcon={<Phone className="w-4 h-4" />}
                placeholder="09XXXXXXXX"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                helperText="Dùng để xác thực nhận chứng nhận"
              />
              
              <Input
                label="Ngày sinh"
                type="date"
                required
                max="2009-12-31"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                helperText="Phải từ 15 tuổi trở lên"
              />
              
              <Input
                label="Căn cước công dân"
                required
                pattern="[0-9]{12}"
                maxLength={12}
                leftIcon={<CreditCard className="w-4 h-4" />}
                placeholder="123456789012"
                value={formData.cccd}
                onChange={(e) => handleInputChange('cccd', e.target.value)}
                helperText="Nhập đầy đủ 12 số CCCD"
              />
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Mail className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg md:text-lg font-semibold text-gray-800">Thông tin liên hệ</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
              <Input
                label="Địa chỉ"
                required
                leftIcon={<MapPin className="w-4 h-4" />}
                placeholder="TP. Hồ Chí Minh"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                helperText="Tỉnh/Thành phố nơi cư trú"
              />
              
              <Input
                label="Email"
                type="email"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="nguyenvana@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                helperText="Để nhận email xác nhận đăng ký"
              />
            </div>
          </div>

          {/* Climbing Information Section */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Mountain className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg md:text-lg font-semibold text-gray-800">Thông tin leo núi</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
              <Input
                label="Số lượng thành viên"
                type="number"
                required
                min="1"
                leftIcon={<Users className="w-4 h-4" />}
                placeholder="Nhập số người"
                value={formData.groupSize}
                onChange={(e) => handleInputChange('groupSize', e.target.value)}
                helperText="Cả trưởng đoàn"
              />
              
              <Input
                label="Ngày leo núi"
                type="date"
                leftIcon={<Calendar className="w-4 h-4" />}
                value={formData.climbDate}
                onChange={(e) => handleInputChange('climbDate', e.target.value)}
                helperText="Ngày dự kiến leo núi"
              />
              
              <Input
                label="Giờ leo núi"
                type="time"
                leftIcon={<Clock className="w-4 h-4" />}
                value={formData.climbTime}
                onChange={(e) => handleInputChange('climbTime', e.target.value)}
                helperText="Sẽ được tính từ giờ này đến lúc xác nhận trên đỉnh núi"
              />
            </div>

            {/* Member List */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Danh sách thành viên nhận chứng nhận
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <List className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-sm"
                  placeholder="Nhập mỗi tên trên một dòng (tùy chọn)"
                  value={formData.memberList}
                  onChange={(e) => handleInputChange('memberList', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">Nhập đầy đủ họ tên để in chứng nhận</p>
            </div>
          </div>

          {/* Safety Commitment Section */}
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2.5 pb-1.5 border-b border-gray-200">
              <Shield className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-800">Cam kết an toàn</h2>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    Quy định An toàn & Bảo vệ Môi trường
                  </p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Tuân thủ các quy định an toàn khi leo núi</li>
                    <li>• Không vứt rác, bảo vệ môi trường tự nhiên</li>
                    <li>• Không leo núi khi thời tiết xấu</li>
                    <li>• Mang đầy đủ trang thiết bị an toàn</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <input
                id="safetyCommit"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={formData.safetyCommit}
                onChange={(e) => handleInputChange('safetyCommit', e.target.checked)}
              />
              <label htmlFor="safetyCommit" className="text-sm text-gray-700">
                Tôi đã đọc, hiểu rõ và cam kết tuân thủ các quy định An toàn & Bảo vệ Môi trường khi tham gia leo núi
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              leftIcon={<Mountain className="w-5 h-5" />}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              {isSubmitting ? 'Đang gửi đăng ký...' : 'Đăng ký leo núi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
