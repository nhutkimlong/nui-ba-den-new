import React, { useState, useEffect } from 'react';
import { useClimbData } from '../../hooks/useClimbData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { NotificationSystem } from '../climb/NotificationSystem';
import { MessageBox, MessageType } from '../climb/MessageBox';
import { ClimbMap } from '../climb/ClimbMap';
import RegistrationForm from '../climb/RegistrationForm';
import CertificationSection from '../climb/CertificationSection';
import RepresentativeModal from '../climb/RepresentativeModal';
import CommitmentModal from '../climb/CommitmentModal';
import CropModal from '../climb/CropModal';
import { GpsSettings, RegistrationData, MemberData, RepresentativeType, CertificateResult } from '../../types/climb';
import { getCurrentDateTime, getRegistrationTimeStatus, isWithinRegistrationTime } from '../../utils/climbUtils';

const ClimbPage: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState<{ message: string; type: MessageType; duration?: number } | null>(null);
  const [selectedRepresentativeType, setSelectedRepresentativeType] = useState<RepresentativeType | null>(null);
  const [showRepresentativeModal, setShowRepresentativeModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<RegistrationData | null>(null);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentCropMember, setCurrentCropMember] = useState<string>('');
  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  const { gpsSettings, notifications, loading, error, fetchMembersList, generateCertificates, registerClimbingGroup } = useClimbData();
  const { getCurrentPosition, checkRegistrationLocation, checkSummitLocation } = useGeolocation();

  // Update current date time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const showMessage = (message: string, type: MessageType = 'info', duration: number = 6000) => {
    setCurrentMessage({ message, type, duration });
  };

  const hideMessage = () => {
    setCurrentMessage(null);
  };

  // Handler for starting registration
  const handleStartRegistration = () => {
    setShowRepresentativeModal(true);
  };

  // Handler for representative type confirmation
  const handleRepresentativeConfirm = (type: RepresentativeType) => {
    setSelectedRepresentativeType(type);
    setShowRepresentativeModal(false);
    setShowRegistrationForm(true);
  };

  // Handler for registration form submission
  const handleRegistrationSubmit = async (registrationData: RegistrationData) => {
    try {
      // Check GPS location if required
      if (gpsSettings.requireGpsRegistration) {
        showMessage('Đang kiểm tra vị trí GPS...', 'info', 0);
        const isInRegistrationArea = await checkRegistrationLocation(gpsSettings.registrationRadius);
        if (!isInRegistrationArea) {
          showMessage(`Bạn phải ở trong bán kính ${gpsSettings.registrationRadius}m từ điểm đăng ký để tiếp tục.`, 'error');
          return;
        }
      }

      // Check registration time if enabled
      if (gpsSettings.registrationTimeEnabled && !isWithinRegistrationTime(gpsSettings)) {
        showMessage(`Đăng ký chỉ được phép từ ${gpsSettings.registrationStartTime} đến ${gpsSettings.registrationEndTime}.`, 'error');
        return;
      }

      setPendingRegistrationData(registrationData);
      setShowCommitmentModal(true);
      hideMessage();
    } catch (error) {
      showMessage(`Lỗi kiểm tra vị trí: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
    }
  };

  // Handler for commitment confirmation
  const handleCommitmentConfirm = async (signatureData: string) => {
    if (!pendingRegistrationData) return;

    try {
      showMessage('Đang gửi đăng ký...', 'info', 0);
      const result = await registerClimbingGroup(pendingRegistrationData, signatureData);
      
      if (result.success) {
        showMessage('Đăng ký thành công! Bạn có thể tiến hành leo núi.', 'success');
        setShowRegistrationForm(false);
        setShowCommitmentModal(false);
        setPendingRegistrationData(null);
        setSelectedRepresentativeType(null);
      } else {
        showMessage(result.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      showMessage(`Lỗi đăng ký: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
    }
  };

  // Handler for certificate verification
  const handleCertificateVerification = async (phoneNumber: string): Promise<MemberData[]> => {
    try {
      // Check GPS location if required
      if (gpsSettings.requireGpsCertificate) {
        showMessage('Đang kiểm tra vị trí GPS...', 'info', 0);
        const isAtSummit = await checkSummitLocation(gpsSettings.certificateRadius);
        if (!isAtSummit) {
          showMessage(`Bạn phải ở trong bán kính ${gpsSettings.certificateRadius}m từ đỉnh núi để nhận chứng nhận.`, 'error');
          throw new Error('Vị trí không hợp lệ');
        }
      }

      const members = await fetchMembersList(phoneNumber);
      showMessage(`Tìm thấy ${members.length} thành viên.`, 'success');
      return members;
    } catch (error) {
      showMessage(`Lỗi xác thực: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
      throw error;
    }
  };

  // Handler for certificate generation
  const handleGenerateCertificates = async (phoneNumber: string, selectedMembers: MemberData[]) => {
    try {
      showMessage('Đang tạo chứng nhận...', 'info', 0);
      const result = await generateCertificates(phoneNumber, selectedMembers);
      
      if (result.success) {
        const message = result.pdfLinks && result.pdfLinks.length > 0 
          ? `Hoàn tất! Đã tạo ${result.pdfLinks.length} chứng nhận.`
          : result.message || 'Chứng nhận đã được tạo.';
        showMessage(message, 'success', 15000);
      } else {
        showMessage(result.message || 'Không thể tạo chứng nhận.', 'error');
      }
    } catch (error) {
      showMessage(`Lỗi tạo chứng nhận: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
    }
  };

  // Handler for showing crop modal
  const handleShowCropModal = (show: boolean, memberName?: string) => {
    setShowCropModal(show);
    if (memberName) {
      setCurrentCropMember(memberName);
    }
  };

  // Handler for crop confirmation
  const handleCropConfirm = (croppedImageData: string, memberName: string) => {
    // This will be handled by CertificationSection component
    // The cropped image data will be stored in the component's state
    setShowCropModal(false);
    setCurrentCropMember('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
          >
            <i className="fas fa-redo mr-2"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <NotificationSystem notifications={notifications} />
      
      {currentMessage && (
        <MessageBox
          message={currentMessage.message}
          type={currentMessage.type}
          duration={currentMessage.duration}
          onClose={hideMessage}
        />
      )}

      {getRegistrationTimeStatus(gpsSettings) && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-clock text-yellow-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>Thời gian đăng ký:</strong> {gpsSettings.registrationStartTime} - {gpsSettings.registrationEndTime}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            <i className="fa-solid fa-mountain text-green-600 mr-3"></i>
            Đăng ký Leo núi Núi Bà Đen
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống đăng ký và nhận chứng nhận leo núi tự động với xác thực GPS
          </p>
        </div>

        {/* Emergency Contact */}
        <section className="bg-red-50 border border-red-200 p-4 md:p-6 rounded-lg mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-phone-alt text-red-600 text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Liên hệ khẩn cấp</h3>
              <p className="text-red-700 text-sm">
                <strong>Ban Quản lý Khu du lịch:</strong> 0276.3.xxx.xxx<br />
                <strong>Cứu hộ:</strong> 0276.3.xxx.xxx<br />
                <strong>Y tế:</strong> 115
              </p>
            </div>
          </div>
        </section>

        {/* Trekking Routes */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-orange-700 border-b border-orange-200 pb-4 flex items-center">
            <i className="fa-solid fa-route text-3xl text-orange-600 mr-4"></i>
            Tuyến đường Leo núi
          </h2>
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              <strong>Tuyến đường chính thức:</strong> Đường Cột Điện (Tuyến đường được khuyến nghị)
            </p>
            <div className="bg-orange-50 border border-orange-200 p-3 rounded">
              <p className="text-sm text-orange-800">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Lưu ý:</strong> Chỉ sử dụng tuyến đường được chỉ định để đảm bảo an toàn và được ghi nhận chính thức.
              </p>
            </div>
          </div>
          <ClimbMap />
        </section>

        {/* Registration Section */}
        {!showRegistrationForm ? (
          <section className="bg-white p-6 md:p-8 rounded-lg shadow-lg mb-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-clipboard-list text-2xl text-green-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Bắt đầu đăng ký leo núi</h2>
              <p className="text-gray-600 mb-6">
                Đăng ký thông tin để được ghi nhận và nhận chứng nhận chính thức
              </p>
              <button
                onClick={handleStartRegistration}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out flex items-center justify-center text-lg shadow hover:shadow-md"
              >
                <i className="fa-solid fa-play mr-2"></i>
                <span>Bắt đầu đăng ký</span>
              </button>
            </div>
          </section>
        ) : (
          <RegistrationForm
            onSubmit={handleRegistrationSubmit}
            gpsSettings={gpsSettings}
            currentDateTime={currentDateTime}
            representativeType={selectedRepresentativeType}
          />
        )}

        {/* Certification Section */}
        <CertificationSection
          onVerifyPhone={handleCertificateVerification}
          onGenerateCertificates={handleGenerateCertificates}
          gpsSettings={gpsSettings}
          onShowCropModal={handleShowCropModal}
        />

      </div>

      {/* Modals */}
      <RepresentativeModal
        isOpen={showRepresentativeModal}
        onClose={() => setShowRepresentativeModal(false)}
        onConfirm={handleRepresentativeConfirm}
      />
      
      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onConfirm={handleCommitmentConfirm}
        registrationData={pendingRegistrationData}
      />
      
      <CropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onConfirm={handleCropConfirm}
        memberName={currentCropMember}
      />
    </div>
  );
};

export default ClimbPage;
