import React, { useState, useRef, useEffect } from 'react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (croppedImageData: string, memberName: string) => void;
  memberName: string;
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
  memberName 
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [cropperInstance, setCropperInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (error) {
      console.error('Error initializing cropper:', error);
      alert('Lỗi tải thư viện cắt ảnh. Vui lòng thử lại.');
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp ảnh.');
      return;
    }

    const maxSizeMB = 8;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ảnh quá lớn (tối đa ${maxSizeMB}MB).`);
      return;
    }

    setImageFile(file);
    
    // Read file and set image source
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle crop confirmation
  const handleConfirmCrop = () => {
    if (!cropperInstance) {
      alert('Lỗi: Không tìm thấy dữ liệu cắt.');
      return;
    }

    try {
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
      alert(`Lỗi cắt ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (cropperInstance) {
      cropperInstance.destroy();
      setCropperInstance(null);
    }
    setImageFile(null);
    setImageSrc('');
    setLoading(false);
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-auto max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Cắt ảnh cho: {memberName}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {!imageSrc ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <i className="fa-solid fa-image text-6xl text-gray-300"></i>
            </div>
            <p className="text-gray-600 mb-4">
              Chọn ảnh để cắt theo tỷ lệ yêu cầu
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
            >
              <i className="fa-solid fa-upload mr-2"></i>
              Chọn ảnh
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <div className="max-h-96 overflow-hidden">
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Ảnh để cắt"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImageSrc('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                <i className="fas fa-eraser mr-1"></i> Chọn ảnh khác
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition duration-150 ease-in-out text-sm font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  disabled={!cropperInstance}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-crop-simple mr-1"></i> Xác nhận cắt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropModal;
