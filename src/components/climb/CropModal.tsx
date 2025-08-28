import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { 
  Image, 
  Crop, 
  X, 
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (croppedImageData: string, memberName: string) => void;
  memberName: string;
  imageFile?: File | null;
}

declare global {
  interface Window {
    Cropper: any;
  }
}

export const CropModal: React.FC<CropModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  memberName,
  imageFile
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [cropperInstance, setCropperInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const CROP_ASPECT_RATIO = 11.89 / 16.73; // Tỷ lệ khung hình cố định

  // Load Cropper.js dynamically
  const loadCropperJS = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window.Cropper !== 'undefined') {
        resolve();
        return;
      }

      // Load CSS
      if (!document.querySelector('link[href*="cropper"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css';
        document.head.appendChild(link);
      }

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js';
      script.onload = () => {
        setTimeout(() => {
          if (typeof window.Cropper !== 'undefined') {
            resolve();
          } else {
            reject(new Error('Cropper.js failed to load'));
          }
        }, 100);
      };
      script.onerror = () => reject(new Error('Failed to load Cropper.js'));
      document.head.appendChild(script);
    });
  };

  // Initialize cropper when image is loaded
  const initializeCropper = async () => {
    if (!imageRef.current || !imageSrc) return;

    try {
      setLoading(true);
      setError(null);
      
      await loadCropperJS();
      
      if (cropperInstance) {
        cropperInstance.destroy();
      }

      const newCropper = new window.Cropper(imageRef.current, {
        aspectRatio: CROP_ASPECT_RATIO,
        viewMode: 1,
        dragMode: 'move',
        background: false,
        autoCropArea: 0.9,
        responsive: true,
        restore: false,
        checkOrientation: false,
        modal: true,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });

      setCropperInstance(newCropper);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing cropper:', error);
      setError('Lỗi tải thư viện cắt ảnh. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Handle file from props
  useEffect(() => {
    if (imageFile && isOpen) {
      // Validation
      if (!imageFile.type.startsWith('image/')) {
        setError('Vui lòng chọn tệp ảnh.');
        return;
      }

      const maxSizeMB = 8;
      if (imageFile.size > maxSizeMB * 1024 * 1024) {
        setError(`Ảnh quá lớn (tối đa ${maxSizeMB}MB).`);
        return;
      }

      setError(null);
      
      // Read file and set image source
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, isOpen]);

  // Handle crop confirmation
  const handleConfirmCrop = () => {
    if (!cropperInstance) {
      setError('Lỗi: Không tìm thấy dữ liệu cắt.');
      return;
    }

    try {
      setLoading(true);
      const MAX_PHOTO_WIDTH = 800;
      const croppedCanvas = cropperInstance.getCroppedCanvas({
        width: MAX_PHOTO_WIDTH,
        height: MAX_PHOTO_WIDTH / CROP_ASPECT_RATIO,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!croppedCanvas) {
        throw new Error("Không thể tạo ảnh đã cắt.");
      }

      const croppedBase64 = croppedCanvas.toDataURL('image/jpeg', 0.95);
      onConfirm(croppedBase64, memberName);
      handleClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      setError(`Lỗi cắt ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (cropperInstance) {
      cropperInstance.destroy();
      setCropperInstance(null);
    }
    setImageSrc('');
    setLoading(false);
    setError(null);
    onClose();
  };

  // Initialize cropper when image source changes
  useEffect(() => {
    if (imageSrc && isOpen) {
      // Small delay to ensure image is loaded
      setTimeout(() => {
        initializeCropper();
      }, 100);
    }
  }, [imageSrc, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cropperInstance) {
        cropperInstance.destroy();
      }
    };
  }, [cropperInstance]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Crop className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Cắt ảnh cho {memberName}</h2>
                <p className="text-primary-100 text-sm">
                  Cắt ảnh theo tỷ lệ chuẩn cho chứng nhận
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!imageSrc ? (
            /* Loading or No Image Section */
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Đang tải ảnh...</h4>
                <p className="text-gray-600 text-sm">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            </div>
          ) : (
            /* Image Cropping Section */
            <div className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Lỗi</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Container */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-4">
                <div className="max-h-96 overflow-hidden rounded-lg">
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Ảnh để cắt"
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  className="text-gray-600"
                >
                  Hủy bỏ
                </Button>
                
                <Button
                  onClick={handleConfirmCrop}
                  disabled={!cropperInstance || loading}
                  loading={loading}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  {loading ? 'Đang xử lý...' : 'Xác nhận cắt'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropModal;
