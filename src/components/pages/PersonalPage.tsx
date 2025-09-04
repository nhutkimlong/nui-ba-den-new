import { Link } from 'react-router-dom'

const PersonalPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Khu vực cá nhân</h1>
        <p className="text-gray-600 mb-6">Đăng nhập hoặc đăng ký để quản lý hồ sơ và tuỳ chọn.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/login" className="block text-center border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-lg py-3 font-semibold">Đăng nhập</Link>
          <Link to="/register" className="block text-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-3 font-semibold">Đăng ký</Link>
        </div>
      </div>
    </div>
  )
}

export default PersonalPage


