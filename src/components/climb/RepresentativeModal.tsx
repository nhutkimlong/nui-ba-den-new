import React from 'react';
import { RepresentativeType } from '../../types/climb';
import Button from '../common/Button';
import { 
  UserCheck, 
  Users, 
  User, 
  AlertTriangle, 
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface RepresentativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: RepresentativeType) => void;
}

export const RepresentativeModal: React.FC<RepresentativeModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  const handleConfirm = (type: RepresentativeType) => {
    onConfirm(type);
  };

  const representativeOptions = [
    {
      type: 'leader' as RepresentativeType,
      title: 'Trưởng đoàn/Đại diện nhóm',
      description: 'Tôi sẽ đăng ký cho cả nhóm và chịu trách nhiệm về thông tin',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      type: 'individual' as RepresentativeType,
      title: 'Cá nhân leo núi',
      description: 'Tôi sẽ đăng ký cho bản thân mình',
      icon: <User className="w-6 h-6" />,
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      type: 'member' as RepresentativeType,
      title: 'Thành viên nhóm',
      description: 'Tôi không phải đại diện, vui lòng liên hệ trưởng đoàn',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Xác nhận Đại diện</h3>
                <p className="text-primary-100 text-sm">Chọn vai trò của bạn</p>
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
          {/* Warning Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-yellow-800 text-sm">Lưu ý quan trọng:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Chỉ <strong>đại diện nhóm</strong> hoặc <strong>cá nhân</strong> mới được phép đăng ký</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Mỗi nhóm chỉ đăng ký <strong>một lần duy nhất</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Tránh đăng ký trùng lặp để không tạo nhiều chứng nhận</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>Nếu bạn là thành viên nhóm, vui lòng liên hệ trưởng đoàn</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {representativeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleConfirm(option.type)}
                className={cn(
                  "w-full p-4 border-2 rounded-xl transition-all duration-200 text-left",
                  "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                  option.color
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg bg-white/50", option.iconColor)}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{option.title}</h4>
                    <p className="text-xs opacity-80">{option.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              className="text-gray-600"
            >
              Hủy bỏ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeModal;
