import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCamera, faDownload, faCheck, faTimes, faImage, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { MemberData, GpsSettings } from '../../types/climb';
import Button from '../common/Button';
import Input from '../common/Input';
import { CropModal } from './CropModal';

interface CompleteCertificationSectionProps {
  onVerifyPhone: (phoneNumber: string) => Promise<MemberData[]>;
  onGenerateCertificates: (phoneNumber: string, selectedMembers: MemberData[]) => Promise<any>;
  gpsSettings: GpsSettings;
  isLoading?: boolean;
}

const CompleteCertificationSection: React.FC<CompleteCertificationSectionProps> = ({
  onVerifyPhone,
  onGenerateCertificates,
  gpsSettings
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [members, setMembers] = useState<MemberData[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [memberPhotos, setMemberPhotos] = useState<Record<string, File | null>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showMemberSelection, setShowMemberSelection] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentCropMember, setCurrentCropMember] = useState<string>('');
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [certificateResult, setCertificateResult] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Select all toggle helper
  const allSelected = members.length > 0 && members.every(m => selectedMembers.has(m.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map(m => m.id)));
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneNumber.trim()) {
      setVerificationError('Vui lòng nhập số điện thoại');
      return;
    }

    setLoading(true);
    setVerificationError('');
    try {
      const memberList = await onVerifyPhone(phoneNumber);
      setMembers(memberList);
      setShowMemberSelection(true);
      setSelectedMembers(new Set());
      setMemberPhotos({});
      setPhotoPreviews({});
    } catch (error) {
      setVerificationError('Không tìm thấy thông tin đăng ký với số điện thoại này');
      setShowMemberSelection(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
      // Xóa ảnh khi bỏ chọn
      const newPhotos = { ...memberPhotos };
      delete newPhotos[memberId];
      setMemberPhotos(newPhotos);
      
      const newPreviews = { ...photoPreviews };
      delete newPreviews[memberId];
      setPhotoPreviews(newPreviews);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handlePhotoUpload = (memberId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ');
        return;
      }

      // Kiểm tra kích thước file (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 8MB');
        return;
      }

      // Mở crop modal thay vì tạo preview trực tiếp
      setCurrentCropMember(memberId);
      setCurrentImageFile(file);
      setShowCropModal(true);
      
      // Reset file input
      if (fileInputRefs.current[memberId]) {
        fileInputRefs.current[memberId]!.value = '';
      }
    }
  };

  const removePhoto = (memberId: string) => {
    setMemberPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[memberId];
      return newPhotos;
    });
    setPhotoPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[memberId];
      return newPreviews;
    });
    // Reset file input
    if (fileInputRefs.current[memberId]) {
      fileInputRefs.current[memberId]!.value = '';
    }
  };

  const handleGenerateCertificates = async () => {
    if (selectedMembers.size === 0) {
      alert('Vui lòng chọn ít nhất một thành viên');
      return;
    }

    setLoading(true);
    try {
      const selectedMembersData = members.filter(member => selectedMembers.has(member.id))
        .map(member => ({
          ...member,
          photoData: photoPreviews[member.id] || null
        }));
      const result = await onGenerateCertificates(phoneNumber, selectedMembersData);
      
      // Hiển thị kết quả thành công
      if (result && result.success) {
        setCertificateResult(result);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Có lỗi xảy ra khi tạo chứng nhận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = (memberId: string) => {
    fileInputRefs.current[memberId]?.click();
  };

  // Handle crop confirmation
  const handleCropConfirm = (croppedImageData: string) => {
    setPhotoPreviews(prev => ({ ...prev, [currentCropMember]: croppedImageData }));
    setShowCropModal(false);
    setCurrentCropMember('');
  };

  // Handle crop modal close
  const handleCropClose = () => {
    setShowCropModal(false);
    setCurrentCropMember('');
    setCurrentImageFile(null);
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCertificateResult(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header: responsive design matching 'Bắt đầu đăng ký leo núi' */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 md:p-6 text-white">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-white/20 p-1.5 md:p-2 rounded-lg">
            <FontAwesomeIcon icon={faUsers} className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-2xl font-bold">Nhận Chứng nhận Leo núi</h2>
            <p className="text-primary-100 text-xs md:text-sm mt-0.5 md:mt-1 hidden md:block">Xác thực số điện thoại để nhận chứng nhận hoàn thành leo núi</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Phone Verification Section */}
        <div className="mb-6">

          <div className="max-w-xl mx-auto w-full flex flex-col sm:flex-row items-stretch justify-center gap-2 md:gap-3">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại..."
              className="flex-1 min-w-0 h-10 text-sm md:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyPhone()}
            />
            <Button
              onClick={handleVerifyPhone}
              disabled={loading || !phoneNumber.trim()}
              leftIcon={<FontAwesomeIcon icon={faCheck} className="w-4 h-4" />}
              size="sm"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 h-10 px-3 md:px-4"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>
          </div>

          {verificationError && (
            <p className="text-red-600 text-sm mt-2">{verificationError}</p>
          )}
        </div>

        {/* GPS Location Check */}
        {gpsSettings.requireGpsCertificate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faMapPin} className="text-yellow-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-yellow-800">
                  <strong>Yêu cầu GPS:</strong> Bạn phải ở trong bán kính {gpsSettings.certificateRadius}m từ đỉnh núi để nhận chứng nhận
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Member Selection Section */}
        {showMemberSelection && (
          <div className="border-t pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="bg-green-100 p-1.5 md:p-2 rounded-lg">
                <FontAwesomeIcon icon={faUsers} className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                                 <h3 className="text-base md:text-lg font-semibold text-gray-800">Chọn thành viên nhận chứng nhận</h3>
                 <p className="text-xs md:text-sm text-gray-600">
                   Đánh dấu chọn thành viên muốn nhận chứng nhận. Bạn có thể tải và cắt ảnh theo tỉ lệ chuẩn cho từng thành viên (tùy chọn).
                 </p>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600">Không tìm thấy thành viên nào</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {/* Select All */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Chọn tất cả</span>
                </div>

                {members.map((member) => (
                  <div
                    key={member.id}
                    className={`border-2 rounded-xl p-3 md:p-4 transition-all duration-200 ${
                      selectedMembers.has(member.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(member.id)}
                          onChange={() => handleMemberToggle(member.id)}
                          className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                      </div>

                      {/* Thông tin thành viên */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                              {member.name || 'Thành viên không tên'}
                            </h3>
                          </div>

                          {/* Phần tải ảnh */}
                          <div className="flex-shrink-0 ml-0 md:ml-4">
                            {selectedMembers.has(member.id) && (
                              <div className="flex items-center gap-2 md:justify-end">
                                {/* Preview ảnh */}
                                {photoPreviews[member.id] ? (
                                  <div className="relative">
                                    <img
                                      src={photoPreviews[member.id]}
                                      alt={`Ảnh ${member.name}`}
                                      className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                    <FontAwesomeIcon icon={faImage} className="text-gray-400 w-5 h-5 md:w-6 md:h-6" />
                                  </div>
                                )}

                                                                 {/* Nút tải ảnh */}
                                 <button
                                   onClick={() => triggerFileInput(member.id)}
                                   className={`px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                                     photoPreviews[member.id]
                                       ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                       : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                   }`}
                                 >
                                   <FontAwesomeIcon icon={faCamera} className="mr-1" />
                                   {photoPreviews[member.id] ? 'Đổi ảnh' : 'Tải & Cắt ảnh'}
                                 </button>
                                 {photoPreviews[member.id] && (
                                   <button
                                     onClick={() => removePhoto(member.id)}
                                     className="px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                                   >
                                     Xóa ảnh
                                   </button>
                                 )}

                                {/* Hidden file input */}
                                <input
                                  ref={(el) => (fileInputRefs.current[member.id] = el)}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(member.id, e)}
                                  className="hidden"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nút tạo chứng nhận */}
            {members.length > 0 && (
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                <button
                  onClick={handleGenerateCertificates}
                  disabled={selectedMembers.size === 0 || loading}
                  className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2 md:gap-3 ${
                    selectedMembers.size === 0 || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang tạo chứng nhận...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faDownload} className="w-5 h-5" />
                      Tạo Chứng nhận ({selectedMembers.size} người)
                    </>
                  )}
                </button>

                {selectedMembers.size > 0 && (
                  <p className="text-center text-xs md:text-sm text-gray-600 mt-2 md:mt-3">
                    Đã chọn {selectedMembers.size} thành viên để tạo chứng nhận
                  </p>
                )}
              </div>
            )}
          </div>
                 )}
       </div>

                       {/* Crop Modal */}
        <CropModal
          isOpen={showCropModal}
          onClose={handleCropClose}
          onConfirm={handleCropConfirm}
          memberName={members.find(m => m.id === currentCropMember)?.name || ''}
          imageFile={currentImageFile}
        />

        {/* Success Modal */}
        {showSuccessModal && certificateResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faDownload} className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">🎉 Tạo chứng nhận thành công!</h2>
                      <p className="text-green-100 text-sm">
                        Chứng nhận đã được tạo và sẵn sàng tải xuống
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSuccessModalClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Thông báo thành công */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FontAwesomeIcon icon={faCheck} className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Thành công!</p>
                      <p className="text-sm text-green-700">{certificateResult.message}</p>
                    </div>
                  </div>
                </div>

                {/* Thống kê */}
                {certificateResult.stats && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">📊 Thống kê</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{certificateResult.stats.total}</div>
                        <div className="text-blue-700">Tổng cộng</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{certificateResult.stats.success}</div>
                        <div className="text-green-700">Thành công</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{certificateResult.stats.timeSeconds}s</div>
                        <div className="text-orange-700">Thời gian</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danh sách link tải */}
                {certificateResult.pdfLinks && certificateResult.pdfLinks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">📄 Link tải chứng nhận</h3>
                    <div className="space-y-3">
                      {certificateResult.pdfLinks.map((link: any, index: number) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {link.name || `Thành viên ${index + 1}`}
                              </h4>
                              <p className="text-sm text-gray-600">Chứng nhận điện tử</p>
                            </div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                              Tải xuống
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thông báo email */}
                {certificateResult.message && certificateResult.message.includes('📧') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <FontAwesomeIcon icon={faCheck} className="text-yellow-600 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-800">📧 Email đã được gửi</p>
                        <p className="text-sm text-yellow-700">
                          Link tải chứng nhận cũng đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nút đóng */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSuccessModalClose}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default CompleteCertificationSection;
