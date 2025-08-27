import React from 'react';
import { RepresentativeType } from '../../types/climb';

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

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200] p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-3 md:p-6 w-full max-w-lg mx-auto max-h-[95vh] overflow-y-auto">
        <div className="text-center mb-4 md:mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <i className="fas fa-user-check text-xl md:text-2xl text-blue-600"></i>
          </div>
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-2">Xác nhận Đại diện</h3>
          <p className="text-gray-600 text-xs md:text-sm lg:text-base">
            Vui lòng xác nhận vai trò của bạn trước khi đăng ký leo núi
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-start">
            <i className="fas fa-exclamation-triangle text-yellow-600 mt-1 mr-2 md:mr-3 text-sm md:text-base"></i>
            <div className="text-xs md:text-sm text-yellow-800">
              <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Chỉ <strong>đại diện nhóm</strong> hoặc <strong>cá nhân</strong> mới được phép đăng ký</li>
                <li>Mỗi nhóm chỉ đăng ký <strong>một lần duy nhất</strong></li>
                <li>Tránh đăng ký trùng lặp để không tạo nhiều chứng nhận</li>
                <li>Nếu bạn là thành viên nhóm, vui lòng liên hệ trưởng đoàn</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          <div 
            className="flex items-start p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleConfirm('leader')}
          >
            <input type="radio" name="representativeType" value="leader" className="mr-2 md:mr-3 mt-1" />
            <div className="flex-1">
              <label className="font-semibold text-gray-800 cursor-pointer text-sm md:text-base">
                Tôi là Trưởng đoàn/Đại diện nhóm
              </label>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Tôi sẽ đăng ký cho cả nhóm và chịu trách nhiệm về thông tin
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-start p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleConfirm('individual')}
          >
            <input type="radio" name="representativeType" value="individual" className="mr-2 md:mr-3 mt-1" />
            <div className="flex-1">
              <label className="font-semibold text-gray-800 cursor-pointer text-sm md:text-base">
                Tôi là Cá nhân leo núi
              </label>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Tôi sẽ đăng ký cho bản thân mình
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-start p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleConfirm('member')}
          >
            <input type="radio" name="representativeType" value="member" className="mr-2 md:mr-3 mt-1" />
            <div className="flex-1">
              <label className="font-semibold text-gray-800 cursor-pointer text-sm md:text-base">
                Tôi là Thành viên nhóm
              </label>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Tôi không phải đại diện, vui lòng liên hệ trưởng đoàn
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium text-sm"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeModal;
