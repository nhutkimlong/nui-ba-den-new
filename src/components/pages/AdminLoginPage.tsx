import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from '../layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faShieldAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './admin/AdminStyles.css';

const AdminLoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Load remembered username on first render
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem('admin.rememberedUsername');
      if (savedUsername) {
        setFormData(prev => ({ ...prev, username: savedUsername }));
        setRememberMe(true);
      }
    } catch (e) {
      // ignore storage access errors
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const success = await login(formData.username, formData.password);
      if (!success) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      // Save or clear remembered username
      try {
        if (rememberMe && formData.username) {
          localStorage.setItem('admin.rememberedUsername', formData.username);
        } else {
          localStorage.removeItem('admin.rememberedUsername');
        }
      } catch (e) {}
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <ResponsiveContainer maxWidth="6xl" padding="lg">
      <div className="admin-layout min-h-screen flex items-center justify-center py-8 lg:py-12 px-4">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <FontAwesomeIcon icon={faShieldAlt} className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Đăng nhập quản trị
            </h1>
            <p className="text-slate-600 text-sm lg:text-base">
              Vui lòng đăng nhập để truy cập hệ thống quản trị
            </p>
          </div>

          {/* Login Form */}
          <div className="admin-card">
            <div className="admin-card-body">
              <form onSubmit={handleSubmit} className="form-modern" noValidate>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group-modern">
                  <label htmlFor="username" className="form-label-modern">
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faUser} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input-modern pl-10"
                      placeholder="Nhập tên đăng nhập"
                      autoComplete="username"
                      aria-label="Tên đăng nhập"
                      required
                    />
                  </div>
                </div>

                <div className="form-group-modern">
                  <label htmlFor="password" className="form-label-modern">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyUp={(e) => (e as any).getModifierState && setIsCapsLockOn((e as any).getModifierState('CapsLock'))}
                      className="form-input-modern pl-10 pr-12"
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      aria-label="Mật khẩu"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon 
                        icon={showPassword ? faEyeSlash : faEye} 
                        className="text-slate-400 hover:text-slate-600 transition-colors" 
                      />
                    </button>
                  </div>
                  {isCapsLockOn && (
                    <p className="mt-2 text-xs text-amber-600">Lưu ý: Caps Lock đang bật</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="rememberMe" className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || isLoading}
                  className="btn-modern btn-modern-primary w-full mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      Đang đăng nhập...
                    </span>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Thông tin demo:</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Tên đăng nhập:</strong> admin</p>
                  <p><strong>Mật khẩu:</strong> admin123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-500">
              © 2024 Baden App. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default AdminLoginPage;
