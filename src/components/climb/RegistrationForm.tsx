import React, { useState } from 'react';
import { RegistrationData, GpsSettings, RepresentativeType } from '../../types/climb';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  gpsSettings: GpsSettings;
  currentDateTime: { date: string; time: string };
  representativeType: RepresentativeType | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  gpsSettings,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-green-700 border-b border-green-200 pb-4 flex items-center">
        <i className="fa-solid fa-clipboard-list text-3xl text-green-600 mr-4"></i>
        Đăng ký thông tin leo núi
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-5">
            <div className="relative">
              <label htmlFor="leaderName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên Trưởng đoàn/Người đăng ký <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-user"></i></span>
                <input
                  type="text"
                  id="leaderName"
                  required
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="Nguyễn Văn An"
                  value={formData.leaderName}
                  onChange={(e) => handleInputChange('leaderName', e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-phone"></i></span>
                <input
                  type="tel"
                  id="phoneNumber"
                  required
                  pattern="[0-9]{10,11}"
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="09XXXXXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Dùng để xác thực nhận chứng nhận.</p>
            </div>

            <div className="relative">
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-cake-candles"></i></span>
                <input
                  type="date"
                  id="birthday"
                  required
                  max="2009-12-31"
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Chọn ngày sinh (phải từ 15 tuổi trở lên).
              </p>
            </div>

            <div className="relative">
              <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-1">
                Căn cước công dân <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-id-card"></i></span>
                <input
                  type="text"
                  id="cccd"
                  required
                  pattern="[0-9]{12}"
                  maxLength={12}
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="123456789012"
                  value={formData.cccd}
                  onChange={(e) => handleInputChange('cccd', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Nhập đầy đủ 12 số CCCD.</p>
            </div>

            <div className="relative">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ (Tỉnh/Thành phố) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-location-dot"></i></span>
                <input
                  type="text"
                  id="address"
                  required
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="TP. Hồ Chí Minh"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-envelope"></i></span>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="nguyenvana@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Để nhận email xác nhận đăng ký.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="relative">
              <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng thành viên (cả trưởng đoàn) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-users"></i></span>
                <input
                  type="number"
                  id="groupSize"
                  required
                  min="1"
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="Nhập số người"
                  value={formData.groupSize}
                  onChange={(e) => handleInputChange('groupSize', e.target.value)}
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                <p className="text-xs text-yellow-800">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mr-1"></i>
                  <strong>Lưu ý:</strong> Vui lòng cung cấp chính xác.
                </p>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="climbDate" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày leo núi
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-calendar-days"></i></span>
                <input
                  type="date"
                  id="climbDate"
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  value={formData.climbDate}
                  onChange={(e) => handleInputChange('climbDate', e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="climbTime" className="block text-sm font-medium text-gray-700 mb-1">
                Giờ leo núi
              </label>
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-clock"></i></span>
                <input
                  type="time"
                  id="climbTime"
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  value={formData.climbTime}
                  onChange={(e) => handleInputChange('climbTime', e.target.value)}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                <p className="text-xs text-blue-800">
                  <i className="fas fa-info-circle text-blue-600 mr-1"></i>
                  <strong>Thời gian leo:</strong> Sẽ được tính từ giờ này đến lúc xác nhận trên đỉnh núi.
                </p>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="memberList" className="block text-sm font-medium text-gray-700 mb-1">
                Danh sách thành viên nhận chứng nhận
              </label>
              <div className="flex items-start border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                <span className="pl-3 pr-2 pt-2 text-gray-400"><i className="fa-solid fa-list-ul"></i></span>
                <textarea
                  id="memberList"
                  rows={3}
                  className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-base"
                  placeholder="Nhập mỗi tên trên một dòng (tùy chọn)"
                  value={formData.memberList}
                  onChange={(e) => handleInputChange('memberList', e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Nhập đầy đủ họ tên để in chứng nhận.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="safetyCommit"
                type="checkbox"
                required
                className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                checked={formData.safetyCommit}
                onChange={(e) => handleInputChange('safetyCommit', e.target.checked)}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="safetyCommit" className="font-medium text-gray-700">
                Tôi đã đọc, hiểu rõ và cam kết tuân thủ các quy định An toàn & Bảo vệ Môi trường khi tham gia leo núi <span className="text-red-500">*</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out flex items-center justify-center text-lg shadow hover:shadow-md"
          >
            <i className="fa-solid fa-paper-plane mr-2"></i>
            <span>Đăng ký</span>
          </button>
        </div>
      </form>
    </section>
  );
};

export default RegistrationForm;
