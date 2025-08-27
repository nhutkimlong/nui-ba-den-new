import React, { useState, useRef, useEffect } from 'react';
import { RegistrationData } from '../../types/climb';
import { formatDateToDDMMYYYY } from '../../utils/climbUtils';

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
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        contextRef.current = ctx;
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
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
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (contextRef.current) {
      contextRef.current.beginPath();
    }
  };

  const clearSignature = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const isSignatureValid = () => {
    if (!contextRef.current || !canvasRef.current) return false;
    
    const imageData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const data = imageData.data;
    
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true;
    }
    return false;
  };

  const handleConfirm = () => {
    if (!isSignatureValid()) {
      alert('Vui lòng ký tay để xác nhận cam kết.');
      return;
    }

    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL('image/png');
      onConfirm(signatureData);
    }
  };

  if (!isOpen || !registrationData) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200] p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-2 md:p-6 w-full max-w-2xl mx-auto max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-2xl font-bold text-gray-800">Cam kết đăng ký leo núi</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="bg-blue-50 p-2 md:p-4 rounded-lg mb-4">
          <div className="text-center mb-4">
            <div className="font-bold text-base md:text-lg uppercase mb-1">BẢN CAM KẾT TỰ NGUYỆN THAM GIA LEO NÚI</div>
            <div className="italic text-sm md:text-base">(Tại Khu du lịch Quốc gia Núi Bà Đen)</div>
            <div className="font-semibold mt-2">
              <span className="font-bold">Kính gửi:</span> Ban quản lý Khu du lịch Quốc gia Núi Bà Đen
            </div>
          </div>
          
          <div className="mb-2 text-sm md:text-base">
            <div><strong>Họ tên:</strong> {registrationData.leaderName}</div>
            <div><strong>Ngày sinh:</strong> {formatDateToDDMMYYYY(registrationData.birthday)}</div>
            <div><strong>CMND/CCCD số:</strong> {registrationData.cccd}</div>
            <div><strong>Địa chỉ thường trú:</strong> {registrationData.address}</div>
            <div><strong>Số điện thoại liên hệ:</strong> {registrationData.phoneNumber}</div>
            <div><strong>Email:</strong> {registrationData.email}</div>
            <div><strong>Số lượng thành viên:</strong> {registrationData.groupSize}</div>
            <div><strong>Ngày leo:</strong> {formatDateToDDMMYYYY(registrationData.climbDate) || 'Chưa chọn'}</div>
            <div><strong>Giờ leo:</strong> {registrationData.climbTime || 'Chưa chọn'}</div>
          </div>

          <div className="text-justify text-xs md:text-sm text-blue-700 space-y-2 leading-relaxed mt-2">
            <p>
              Vào ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}, 
              nay tôi làm bản cam kết này để xác nhận việc tham gia hoạt động leo núi tại Núi Bà Đen, với các nội dung sau:
            </p>
            <p><strong>1. Tự nguyện tham gia:</strong> Tôi tự nguyện tham gia hoạt động leo núi, đã được lực lượng của Ban Quản lý phổ biến đầy đủ thông tin, hướng dẫn và nhận thức rõ về các nguy cơ, rủi ro có thể xảy ra trong quá trình tham gia hoạt động.</p>
            <p><strong>2. Đảm bảo sức khỏe cá nhân:</strong> Tôi cam kết có đủ điều kiện sức khỏe để tham gia hoạt động leo núi, không mắc các bệnh lý nguy hiểm hoặc ảnh hưởng đến việc vận động. Tôi hoàn toàn chịu trách nhiệm về tình trạng sức khỏe của bản thân.</p>
            <p><strong>3. Tuân thủ quy định và hướng dẫn:</strong> Cam kết chấp hành nghiêm túc mọi nội quy, quy định, hướng dẫn của Ban Quản lý Khu du lịch quốc gia Núi Bà Đen, lực lượng chức năng và người hướng dẫn trong suốt quá trình tham gia hoạt động.</p>
            <p><strong>4. Cam kết bảo vệ môi trường và phòng cháy chữa cháy rừng:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Không xả rác, không hủy hoại tài nguyên rừng, hệ sinh thái rừng, công trình bảo vệ và phát triển rừng;</li>
              <li>Không sử dụng lửa trong rừng, không mang theo hóa chất độc, chất nổ, chất cháy, chất dễ cháy vào rừng;</li>
              <li>Không săn, bắt, nhốt, giết, tàng trữ, vận chuyển, buôn bán động vật rừng, thu thập mẫu vật các loài thực vật rừng, động vật rừng trái quy định của pháp luật.</li>
            </ul>
            <p><strong>5. Cam kết giữ gìn an ninh trật tự và an toàn cá nhân:</strong></p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Không tổ chức, sử dụng, mua bán trái phép chất ma túy; Không tổ chức đánh bạc, cá độ dưới mọi hình thức trong quá trình leo núi trên lâm phần của Ban Quản lý;</li>
              <li>Không tự ý tách đoàn, không đi vào các khu vực cấm hoặc địa hình nguy hiểm. Nếu vi phạm, tôi hoàn toàn chịu trách nhiệm trước pháp luật và các cơ quan có thẩm quyền.</li>
            </ul>
            <p><strong>6. Chấp nhận rủi ro và miễn trừ trách nhiệm:</strong> Trong trường hợp xảy ra tai nạn, thương tích hoặc sự cố ngoài ý muốn trong quá trình tham gia hoạt động, tôi cam kết tự chịu trách nhiệm và không khiếu nại, khiếu kiện Ban Tổ chức hoặc Ban Quản lý Khu du lịch dưới bất kỳ hình thức nào.</p>
            <p className="mt-4 font-semibold">
              Tôi làm cam kết này với tinh thần tự nguyện, trung thực và hoàn toàn chịu trách nhiệm trước pháp luật về các thông tin đã khai và nội dung cam kết trên./.
            </p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 md:p-4 mb-4">
          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Chữ ký xác nhận:</h4>
          <p className="text-xs md:text-sm text-gray-600 mb-2">Vui lòng ký tay vào ô bên dưới để xác nhận cam kết:</p>
          <canvas
            ref={canvasRef}
            className="w-full h-32 md:h-48 border border-gray-300 rounded bg-white cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={clearSignature}
              className="text-xs md:text-sm text-red-600 hover:text-red-800"
            >
              <i className="fas fa-eraser mr-1"></i> Xóa chữ ký
            </button>
            <span className="text-xs text-gray-500">Ký bằng tay hoặc bút cảm ứng</span>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium text-xs md:text-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md text-xs md:text-sm"
          >
            <i className="fas fa-check mr-2"></i> Xác nhận cam kết
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommitmentModal;
