import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const res = await login(email, password)
    setSubmitting(false)
    if (!res.success) {
      setError('Email hoặc mật khẩu không đúng')
      return
    }
    // Route by role
    if (res.role === 'admin') navigate('/admin')
    else navigate('/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h1>
        <p className="text-gray-600 mb-6">Đăng nhập để quản lý hồ sơ cá nhân.</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="••••••••" required />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={submitting} type="submit" className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg py-2.5 font-semibold transition-colors">{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Chưa có tài khoản? <Link to="/register" className="text-primary-600 hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage


