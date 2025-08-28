import React, { useState } from 'react';
import { GpsSettings, MemberData } from '../../types/climb';
import Button from '../common/Button';
import Input from '../common/Input';
import { 
  Award, 
  Clock, 
  Phone, 
  Users, 
  Camera, 
  CheckCircle,
  X,
  MapPin,
  Download
} from 'lucide-react';

interface CertificationSectionProps {
  onVerifyPhone: (phoneNumber: string) => Promise<MemberData[]>;
  onGenerateCertificates: (phoneNumber: string, selectedMembers: MemberData[]) => Promise<any>;
  gpsSettings: GpsSettings;
  onShowCropModal: (show: boolean, memberName?: string) => void;
}

export const CertificationSection: React.FC<CertificationSectionProps> = ({
  onVerifyPhone,
  onGenerateCertificates,
  gpsSettings: _gpsSettings,
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

  // Crop confirm is handled in parent via modal; no local handler needed

  const handleRemovePhoto = (memberName: string) => {
    setUploadedPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[memberName];
      return newPhotos;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-t-2xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Nhận Chứng nhận</h2>
            <p className="text-accent-100 text-sm">Xác thực và tạo chứng nhận leo núi</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-2xl shadow-xl">
        <div className="p-6 space-y-6">
          {/* Info Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-blue-800 text-sm">⏱️ Thông tin thời gian leo núi:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Thời gian leo:</strong> Được tính từ lúc bắt đầu leo đến lúc xác nhận vị trí trên đỉnh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Ghi nhận tự động:</strong> Hệ thống sẽ ghi nhận thời gian thực khi bạn ấn "Xác thực"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Hiển thị trên chứng nhận:</strong> Thời gian leo sẽ được in trên chứng nhận</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span><strong>Yêu cầu:</strong> Phải xác thực vị trí tại đỉnh núi (986m) để nhận chứng nhận</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Phone Verification */}
          <div className="space-y-4">
            {/* Removed heading to keep only the phone input */}
            
            <Input
              label="Số điện thoại đã đăng ký"
              type="tel"
              required
              pattern="[0-9]{10,11}"
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="Nhập lại SĐT đã đăng ký"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              helperText=""
            />
            
            <Button
              onClick={handleVerifyPhone}
              disabled={loading || !phoneNumber.trim()}
              loading={loading}
              leftIcon={<MapPin className="w-4 h-4" />}
              className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực vị trí'}
            </Button>
          </div>

          {/* Member Selection */}
          {showMemberSelection && members.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <Users className="w-5 h-5 text-accent-600" />
                <h3 className="text-xl font-semibold text-gray-800">Chọn thành viên nhận chứng nhận</h3>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Đánh dấu chọn thành viên muốn nhận chứng nhận. Bạn có thể tải ảnh cho từng thành viên (tùy chọn).
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto border-t border-b border-gray-200 py-4">
                  {members.map((member, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <input
                            type="checkbox"
                            id={`member-${index}`}
                            className="h-5 w-5 text-accent-600 border-gray-300 rounded focus:ring-accent-500"
                            checked={selectedMembers.includes(member.name)}
                            onChange={(e) => handleMemberSelection(member.name, e.target.checked)}
                          />
                          <label htmlFor={`member-${index}`} className="text-sm font-medium text-gray-700 flex-1 cursor-pointer">
                            {member.name}
                          </label>
                        </div>
                        
                        {/* Photo upload section */}
                        <div className="flex items-center gap-2">
                          {uploadedPhotos[member.name] ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={uploadedPhotos[member.name]}
                                alt={`Ảnh ${member.name}`}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemovePhoto(member.name)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShowCropModal(member.name)}
                              className="text-accent-600 hover:text-accent-800"
                            >
                              <Camera className="w-4 h-4 mr-1" />
                              <span className="hidden sm:inline">Tải ảnh</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleGenerateCertificates}
                    disabled={loading || selectedMembers.length === 0}
                    loading={loading}
                    leftIcon={<Download className="w-4 h-4" />}
                    fullWidth
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {loading ? 'Đang tạo chứng nhận...' : `Tạo Chứng nhận (${selectedMembers.length} người)`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationSection;
