import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClimbData } from '../../hooks/useClimbData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { NotificationSystem } from '../climb/NotificationSystem';
import { MessageBox, MessageType } from '../climb/MessageBox';
import { ClimbMap } from '../climb/ClimbMap';
import RegistrationForm from '../climb/RegistrationForm';
import CompleteCertificationSection from '../climb/CompleteCertificationSection';
import RepresentativeModal from '../climb/RepresentativeModal';
import CommitmentModal from '../climb/CommitmentModal';
import CropModal from '../climb/CropModal';
import MobileLoadingSpinner from '../common/MobileLoadingSpinner';
import Button from '../common/Button';
import SwipeableTabs from '../common/SwipeableTabs';
import { ResponsiveContainer } from '../layout';
import { RegistrationData, MemberData, RepresentativeType } from '../../types/climb';
import { getCurrentDateTime, getRegistrationTimeStatus, isWithinRegistrationTime } from '../../utils/climbUtils';
import {
  Mountain,
  Phone,
  Route,
  Clock,
  AlertTriangle,
  Play,
  ClipboardList,
  RefreshCw,
  Award,
  Shield
} from 'lucide-react';


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
  const [isMobile, setIsMobile] = useState(false);

  const { gpsSettings, notifications, loading, error, fetchMembersList, generateCertificates, registerClimbingGroup } = useClimbData();
  const { checkRegistrationLocation, checkSummitLocation } = useGeolocation();
  const { user, updateProfile } = useAuth();

  // Update current date time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
        // Update user's climb count
        try {
          await updateProfile({
            climbCount: (user?.climbCount || 0) + 1,
            lastClimbAt: Date.now(),
          });
        } catch {}
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
        // Return the result so child component can display success modal & links
        return result;
      } else {
        showMessage(result.message || 'Không thể tạo chứng nhận.', 'error');
        return result;
      }
    } catch (error) {
      showMessage(`Lỗi tạo chứng nhận: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`, 'error');
      // Propagate error so caller can handle failure state
      throw error;
    }
  };



  // Handler for crop confirmation (forwarded from certification section)
  const handleCropConfirm = () => {
    // This will be handled by CertificationSection component
    // The cropped image data will be stored in the component's state
    setShowCropModal(false);
    setCurrentCropMember('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <MobileLoadingSpinner type="spinner" size="lg" className="mb-4" />
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Mobile version with SwipeableTabs
  if (isMobile) {
    const tabs = [
      {
        id: 'info',
        label: 'Thông tin',
        icon: <Mountain className="w-4 h-4" />,
        content: (
          <div className="px-2">
            <div className="space-y-3">
              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">THÔNG TIN CỨU HỘ KHẨN CẤP</h3>
                    <p className="text-xs text-red-700 mb-2">Trong trường hợp khẩn cấp trên đường leo núi, vui lòng liên hệ ngay Hotline:</p>
                    <a
                      href="tel:02763875678"
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm shadow hover:bg-red-700"
                    >
                      <Phone className="w-4 h-4 text-white" />
                      0276.387.5678
                    </a>
                    <p className="text-xs text-red-700 mt-2">Luôn mang theo điện thoại, đảm bảo đủ pin và có sóng.</p>
                  </div>
                </div>
              </div>

              {/* Safety Rules */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-3">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">Quy định An toàn & Bảo vệ Môi trường</h3>
                <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
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
            </div>
          </div>
        )
      },
      {
        id: 'map',
        label: 'Bản đồ',
        icon: <Route className="w-4 h-4" />,
        content: (
          <div className="px-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Route className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold">Tuyến đường Leo núi</h3>
                </div>
              </div>
              <div className="p-3">
                <ClimbMap />
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'register',
        label: 'Đăng ký',
        icon: <ClipboardList className="w-4 h-4" />,
        content: (
          <div className="px-2">
            {!showRegistrationForm ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-3 text-white">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold">Bắt đầu đăng ký leo núi</h3>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <p className="text-gray-700 mb-4 text-sm">
                    Đăng ký thông tin để được ghi nhận và nhận chứng nhận chính thức
                  </p>
                  <Button
                    onClick={handleStartRegistration}
                    leftIcon={<Play className="w-4 h-4" />}
                    size="sm"
                    fullWidth
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    Bắt đầu đăng ký
                  </Button>
                </div>
              </div>
            ) : (
              <RegistrationForm
                onSubmit={handleRegistrationSubmit}
                gpsSettings={gpsSettings}
                currentDateTime={currentDateTime}
                representativeType={selectedRepresentativeType}
              />
            )}
          </div>
        )
      },
      {
        id: 'certificate',
        label: 'Chứng nhận',
        icon: <Award className="w-4 h-4" />,
        content: (
          <div className="px-2">
            <CompleteCertificationSection
              onVerifyPhone={handleCertificateVerification}
              onGenerateCertificates={handleGenerateCertificates}
              gpsSettings={gpsSettings}
              isLoading={false}
            />
          </div>
        )
      }
    ];

    return (
      <ResponsiveContainer maxWidth="6xl" padding="sm">
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50">
          <NotificationSystem notifications={notifications} />

          {currentMessage && (
            <MessageBox
              message={currentMessage.message}
              type={currentMessage.type}
              duration={currentMessage.duration}
              onClose={hideMessage}
            />
          )}

          {/* Header Section */}
          <div className="text-center mb-6 px-4">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                  <Mountain className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold">Đăng ký Leo núi Núi Bà Đen</h1>
              </div>
              <p className="text-primary-100 text-xs leading-relaxed">
                Hệ thống đăng ký và nhận chứng nhận leo núi tự động với xác thực GPS
              </p>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="px-4 pb-6">
            <SwipeableTabs
              tabs={tabs}
              defaultTab="info"
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
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer maxWidth="6xl" padding="lg">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50">
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
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-6 mx-4 md:mx-0">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  <strong>Thời gian đăng ký:</strong> {gpsSettings.registrationStartTime} - {gpsSettings.registrationEndTime}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Mountain className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Đăng ký Leo núi Núi Bà Đen
              </h1>
            </div>
            <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto">
              Hệ thống đăng ký và nhận chứng nhận leo núi tự động với xác thực GPS
            </p>
          </div>
        </div>

        <main className="space-y-8">
          {/* Emergency Contact */}
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-2.5 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">THÔNG TIN CỨU HỘ KHẨN CẤP</h3>
                <p className="text-sm text-red-700 mb-3">Trong trường hợp khẩn cấp trên đường leo núi, vui lòng liên hệ ngay Hotline:</p>
                <a href="tel:02763875678" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-base shadow hover:bg-red-700">
                  <Phone className="w-5 h-5 text-white" /> 0276.387.5678
                </a>
                <p className="text-sm text-red-700 mt-2">Luôn mang theo điện thoại, đảm bảo đủ pin và có sóng.</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Route className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Tuyến đường Leo núi</h2>
              </div>
            </div>
            <div className="p-6">
              <ClimbMap />
            </div>
          </div>

          {/* Safety Rules */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Quy định An toàn & Bảo vệ Môi trường</h2>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
              <ul className="text-sm text-amber-800 space-y-1.5 list-disc pl-6">
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
          </div>

          {/* Registration Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Bắt đầu đăng ký leo núi</h2>
              </div>
            </div>
            {!showRegistrationForm ? (
              <div className="p-8 text-center">
                <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
                  Đăng ký thông tin để được ghi nhận và nhận chứng nhận chính thức
                </p>
                <div className="max-w-md mx-auto">
                  <Button
                    onClick={handleStartRegistration}
                    leftIcon={<Play className="w-5 h-5" />}
                    size="lg"
                    fullWidth
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-lg"
                  >
                    Bắt đầu đăng ký
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <RegistrationForm
                    onSubmit={handleRegistrationSubmit}
                    gpsSettings={gpsSettings}
                    currentDateTime={currentDateTime}
                    representativeType={selectedRepresentativeType}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Certification Section */}
          <CompleteCertificationSection
            onVerifyPhone={handleCertificateVerification}
            onGenerateCertificates={handleGenerateCertificates}
            gpsSettings={gpsSettings}
            isLoading={false}
          />
        </main>

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
    </ResponsiveContainer>
  );
};

export default ClimbPage;
