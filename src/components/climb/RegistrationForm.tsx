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
  const [showSafetyRules, setShowSafetyRules] = useState(false);

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

  return (
    <div className="md:max-w-6xl max-w-none w-full md:mx-auto mx-0 px-0 sm:px-2 md:px-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl md:rounded-t-2xl p-3 md:p-5 text-white overflow-hidden">
        <div className="flex items-center gap-2.5 md:gap-4">
          <div className="bg-white/20 p-1.5 md:p-3 rounded-xl">
            <Mountain className="w-5 h-5 md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-2xl font-bold truncate">Đăng ký leo núi</h1>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-b-xl md:rounded-b-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4 md:space-y-5">
            <div className="flex items-center gap-2 md:gap-2.5 pb-1 border-b border-gray-200">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg md:text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  rows={4}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-sm"
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
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
              <button
                type="button"
                onClick={() => setShowSafetyRules((v) => !v)}
                aria-expanded={showSafetyRules}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-start gap-3 text-left">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Quy định An toàn & Bảo vệ Môi trường
                    </p>
                    <p className="text-xs text-yellow-700">Chạm để {showSafetyRules ? 'thu gọn' : 'xem chi tiết'}</p>
                  </div>
                </div>
                <svg className={`w-4 h-4 text-yellow-700 transition-transform ${showSafetyRules ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
              </button>
              {showSafetyRules && (
                <div className="px-4 pb-4">
                  <ul className="text-xs text-yellow-800 space-y-1.5 list-disc pl-5">
                    <li>Đi đúng đường mòn: Luôn đi theo chỉ dẫn, không đi đường tắt.</li>
                    <li>Chuẩn bị kỹ lưỡng: Mang đủ nước (1.5-2L+), thức ăn nhẹ, y tế cơ bản.</li>
                    <li>Trang phục & Trang bị: Quần áo thoải mái, giày chuyên dụng, đèn pin, sạc dự phòng.</li>
                    <li>Kiểm tra thời tiết: Xem dự báo, chuẩn bị áo mưa/áo khoác nếu cần.</li>
                    <li>Thông báo lộ trình: Cho người thân biết kế hoạch và thời gian dự kiến.</li>
                    <li>Giữ gìn vệ sinh: Mang toàn bộ rác xuống núi, không xả rác bừa bãi.</li>
                    <li>Bảo vệ thiên nhiên: Không bẻ cành, hái hoa, khắc tên, săn bắt.</li>
                    <li>Phòng chống cháy rừng: Tuyệt đối không đốt lửa, hút thuốc sai quy định.</li>
                    <li>Giữ liên lạc: Đi theo đoàn, không tách nhóm ở mọi tình huống.</li>
                    <li>Báo cáo sự cố: Gọi ngay Hotline cứu hộ nếu gặp sự cố hoặc nguy cơ.</li>
                  </ul>
                </div>
              )}
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
          <div className="pt-6 border-t border-gray-200">
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
