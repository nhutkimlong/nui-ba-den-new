import React, { useState, useRef, useEffect } from 'react';
import { RegistrationData } from '../../types/climb';
import { formatDateToDDMMYYYY } from '../../utils/climbUtils';
import Button from '../common/Button';
import { 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Clock, 
  PenTool, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
  registrationData: RegistrationData | null;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  registrationData
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureSize, setSignatureSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * ratio;
        canvas.height = rect.height * ratio;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3; // Tăng độ dày của nét ký
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        contextRef.current = ctx;
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasSignature(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    
    // Cập nhật kích thước chữ ký
    updateSignatureSize();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (contextRef.current) {
      contextRef.current.beginPath();
    }
    updateSignatureSize();
  };

  const updateSignatureSize = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const imageData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const data = imageData.data;
    let pixelCount = 0;
    
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) pixelCount++;
    }
    
    setSignatureSize(pixelCount);
  };

  const clearSignature = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasSignature(false);
      setSignatureSize(0);
    }
  };

  const isSignatureValid = () => {
    return hasSignature && signatureSize > 100; // Tối thiểu 100 pixel
  };

  const handleConfirm = () => {
    if (!isSignatureValid()) {
      alert('Vui lòng ký tay đủ để xác nhận cam kết.');
      return;
    }

    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onConfirm(signatureData);
    }
  };

  if (!isOpen || !registrationData) return null;

  const infoItems = [
    { icon: <User className="w-4 h-4" />, label: 'Họ tên', value: registrationData.leaderName },
    { icon: <Calendar className="w-4 h-4" />, label: 'Ngày sinh', value: formatDateToDDMMYYYY(registrationData.birthday) },
    { icon: <CreditCard className="w-4 h-4" />, label: 'CMND/CCCD', value: registrationData.cccd },
    { icon: <MapPin className="w-4 h-4" />, label: 'Địa chỉ', value: registrationData.address },
    { icon: <Phone className="w-4 h-4" />, label: 'Số điện thoại', value: registrationData.phoneNumber },
    { icon: <Mail className="w-4 h-4" />, label: 'Email', value: registrationData.email },
    { icon: <Users className="w-4 h-4" />, label: 'Số lượng thành viên', value: registrationData.groupSize },
    { icon: <Calendar className="w-4 h-4" />, label: 'Ngày leo', value: formatDateToDDMMYYYY(registrationData.climbDate) || 'Chưa chọn' },
    { icon: <Clock className="w-4 h-4" />, label: 'Giờ leo', value: registrationData.climbTime || 'Chưa chọn' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Cam kết đăng ký leo núi</h3>
                <p className="text-primary-100 text-sm">Xác nhận thông tin và ký cam kết</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Registration Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">Thông tin đăng ký</h4>
                <p className="text-blue-600 text-sm">Chi tiết người đăng ký</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                  <div className="text-blue-500">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 font-medium">{item.label}</p>
                    <p className="text-sm text-blue-800 font-semibold truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commitment Text */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800">BẢN CAM KẾT TỰ NGUYỆN THAM GIA LEO NÚI</h4>
                <p className="text-yellow-600 text-sm">Khu du lịch Quốc gia Núi Bà Đen</p>
              </div>
            </div>
            
            <div className="text-sm text-yellow-800 space-y-3 leading-relaxed">
              <p className="text-center font-semibold">
                <span className="font-bold">Kính gửi:</span> Ban quản lý Khu du lịch Quốc gia Núi Bà Đen
              </p>
              
              <p>
                Vào ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}, 
                nay tôi làm bản cam kết này để xác nhận việc tham gia hoạt động leo núi tại Núi Bà Đen, với các nội dung sau:
              </p>
              
              <div className="space-y-2">
                <p><strong>1. Tự nguyện tham gia:</strong> Tôi tự nguyện tham gia hoạt động leo núi, đã được lực lượng của Ban Quản lý phổ biến đầy đủ thông tin, hướng dẫn và nhận thức rõ về các nguy cơ, rủi ro có thể xảy ra trong quá trình tham gia hoạt động.</p>
                <p><strong>2. Đảm bảo sức khỏe cá nhân:</strong> Tôi cam kết có đủ điều kiện sức khỏe để tham gia hoạt động leo núi, không mắc các bệnh lý nguy hiểm hoặc ảnh hưởng đến việc vận động.</p>
                <p><strong>3. Tuân thủ quy định và hướng dẫn:</strong> Cam kết chấp hành nghiêm túc mọi nội quy, quy định, hướng dẫn của Ban Quản lý Khu du lịch quốc gia Núi Bà Đen.</p>
                <p><strong>4. Cam kết bảo vệ môi trường:</strong> Không xả rác, không hủy hoại tài nguyên rừng, không sử dụng lửa trong rừng, không săn bắt động vật rừng.</p>
                <p><strong>5. Cam kết giữ gìn an ninh trật tự:</strong> Không tổ chức đánh bạc, không tự ý tách đoàn, không đi vào các khu vực cấm hoặc địa hình nguy hiểm.</p>
                <p><strong>6. Chấp nhận rủi ro:</strong> Trong trường hợp xảy ra tai nạn, thương tích hoặc sự cố ngoài ý muốn, tôi cam kết tự chịu trách nhiệm và không khiếu nại, khiếu kiện Ban Tổ chức.</p>
              </div>
              
              <p className="font-semibold text-center mt-4">
                Tôi làm cam kết này với tinh thần tự nguyện, trung thực và hoàn toàn chịu trách nhiệm trước pháp luật về các thông tin đã khai và nội dung cam kết trên./.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <PenTool className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Chữ ký xác nhận</h4>
                  <p className="text-primary-100 text-sm">Vui lòng ký tay để xác nhận cam kết</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Signature Instructions */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <PenTool className="w-10 h-10 text-blue-600" />
                </div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">
                  Ký bằng tay hoặc bút cảm ứng
                </h5>
                <p className="text-gray-600">
                  Vẽ chữ ký của bạn vào ô bên dưới để xác nhận cam kết
                </p>
              </div>
              
              {/* Signature Canvas */}
              <div className="relative mb-6">
                <canvas
                  ref={canvasRef}
                  className="w-full h-72 md:h-80 border-2 border-gray-200 rounded-xl bg-white cursor-crosshair shadow-lg hover:shadow-xl transition-all duration-300"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {/* Signature Guide Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-40 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3"></div>
                      <p className="text-sm text-gray-400 font-medium">Ký tại đây</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Signature Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                    className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa chữ ký
                  </Button>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2",
                    isSignatureValid() 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : hasSignature 
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                  )}>
                    {isSignatureValid() ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Chữ ký hợp lệ
                      </>
                    ) : hasSignature ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Chữ ký quá nhỏ
                      </>
                    ) : (
                      <>
                        <PenTool className="w-4 h-4" />
                        Chưa ký
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium mb-1">Hướng dẫn ký</p>
                    <p className="text-xs text-blue-600">• Ký bằng tay hoặc bút cảm ứng</p>
                    <p className="text-xs text-blue-600">• Kích thước tối thiểu: 100 pixel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-600"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!isSignatureValid()}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              Xác nhận cam kết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentModal;
