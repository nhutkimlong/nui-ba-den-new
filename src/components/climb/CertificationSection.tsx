import React, { useState } from 'react';
import { GpsSettings, MemberData } from '../../types/climb';

interface CertificationSectionProps {
  onVerifyPhone: (phoneNumber: string) => Promise<MemberData[]>;
  onGenerateCertificates: (phoneNumber: string, selectedMembers: MemberData[]) => Promise<any>;
  gpsSettings: GpsSettings;
  onShowCropModal: (show: boolean, memberName?: string) => void;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({
  onVerifyPhone,
  onGenerateCertificates,
  gpsSettings,
  onShowCropModal
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [members, setMembers] = useState<MemberData[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string>>({});

  const handleVerifyPhone = async () => {
    if (!phoneNumber.trim()) {
      return;
    }

    setLoading(true);
    try {
      const memberList = await onVerifyPhone(phoneNumber);
      setMembers(memberList);
      setShowMemberSelection(true);
      // Reset uploaded photos when verifying new phone
      setUploadedPhotos({});
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificates = async () => {
    if (selectedMembers.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const selectedMemberData = members.filter(member => 
        selectedMembers.includes(member.name)
      ).map(member => ({
        ...member,
        photoData: uploadedPhotos[member.name] || null
      }));
      
      await onGenerateCertificates(phoneNumber, selectedMemberData);
    } catch (error) {
      console.error('Certificate generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelection = (memberName: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberName]);
    } else {
      setSelectedMembers(prev => prev.filter(name => name !== memberName));
    }
  };

  const handleShowCropModal = (memberName: string) => {
    onShowCropModal(true, memberName);
  };

  const handleCropConfirm = (croppedImageData: string, memberName: string) => {
    setUploadedPhotos(prev => ({
      ...prev,
      [memberName]: croppedImageData
    }));
  };

  const handleRemovePhoto = (memberName: string) => {
    setUploadedPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[memberName];
      return newPhotos;
    });
  };

  return (
    <section className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-700 border-b border-blue-200 pb-4 flex items-center">
        <i className="fa-solid fa-award text-3xl text-blue-600 mr-4"></i>
        Nhận Chứng nhận
      </h2>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <div className="flex items-start">
          <i className="fas fa-clock text-blue-600 mt-1 mr-3"></i>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">⏱️ Thông tin thời gian leo núi:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Thời gian leo:</strong> Được tính từ lúc bắt đầu leo đến lúc xác nhận vị trí trên đỉnh</li>
              <li><strong>Ghi nhận tự động:</strong> Hệ thống sẽ ghi nhận thời gian thực khi bạn ấn "Xác thực"</li>
              <li><strong>Hiển thị trên chứng nhận:</strong> Thời gian leo sẽ được in trên chứng nhận</li>
              <li><strong>Yêu cầu:</strong> Phải xác thực vị trí tại đỉnh núi (986m) để nhận chứng nhận</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-4 relative">
        <label htmlFor="verifyPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Nhập Số điện thoại đã đăng ký <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
          <span className="pl-3 pr-2 text-gray-400"><i className="fa-solid fa-mobile-screen-button"></i></span>
          <input
            type="tel"
            id="verifyPhoneNumber"
            required
            pattern="[0-9]{10,11}"
            className="w-full py-2 border-0 rounded-r-md focus:ring-0 focus:outline-none text-sm"
            placeholder="Nhập lại SĐT đã đăng ký"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleVerifyPhone}
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out flex items-center justify-center text-lg shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-location-crosshairs mr-2"></i>
          <span>Xác thực</span>
          {loading && <div className="spinner ml-2"></div>}
        </button>
      </div>

      {showMemberSelection && members.length > 0 && (
        <div className="mt-8 border border-gray-200 rounded-lg p-4 md:p-6 bg-gray-50/50">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
            Chọn thành viên nhận chứng nhận
          </h3>
          <p className="text-sm text-gray-600 mb-5">
            Đánh dấu chọn thành viên muốn nhận chứng nhận. Bạn có thể tải ảnh cho từng thành viên (tùy chọn).
          </p>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto border-t border-b border-gray-200 py-4">
            {members.map((member, index) => (
              <div key={index} className="member-item flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 flex-1">
                  <input
                    type="checkbox"
                    id={`member-${index}`}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedMembers.includes(member.name)}
                    onChange={(e) => handleMemberSelection(member.name, e.target.checked)}
                  />
                  <label htmlFor={`member-${index}`} className="text-sm font-medium text-gray-700 flex-1">
                    {member.name}
                  </label>
                </div>
                
                {/* Photo upload section */}
                <div className="flex items-center space-x-2">
                  {uploadedPhotos[member.name] ? (
                    <div className="flex items-center space-x-2">
                      <img
                        src={uploadedPhotos[member.name]}
                        alt={`Ảnh ${member.name}`}
                        className="w-12 h-12 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(member.name)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Xóa ảnh"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleShowCropModal(member.name)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      title="Tải ảnh"
                    >
                      <i className="fas fa-camera mr-1"></i>
                      <span className="hidden sm:inline">Tải ảnh</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleGenerateCertificates}
              disabled={loading || selectedMembers.length === 0}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out flex items-center justify-center text-base shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <i className="fa-solid fa-file-pdf mr-2"></i>
              <span>Tạo Chứng nhận</span>
              {loading && <div className="spinner ml-2"></div>}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CertificationSection;
