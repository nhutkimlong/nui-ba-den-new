import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [birthday, setBirthday] = useState(user?.birthday || '')
  const [cccd, setCccd] = useState(user?.cccd || '')
  const [address, setAddress] = useState(user?.address || '')
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // Sync climb count from Google Sheet if phone available
  React.useEffect(() => {
    const run = async () => {
      try {
        if (!user?.phone) return
        const url = 'https://script.google.com/macros/s/AKfycbyWYJtTjYvSFT--TPpV6bk4-o6jKtqXBhe5di-h6ozC2sKscM_i8_PCJxzPpL_bEDNT/exec?action=searchPhone&phone=' + encodeURIComponent(user.phone)
        const res = await fetch(url)
        const data = await res.json()
        if (data && data.success && Array.isArray(data.data)) {
          const count = data.data.length
          let last = 0
          const parseSheetDate = (input: string): number => {
            if (!input) return NaN as unknown as number
            // Normalize formats like dd/MM/yyyy HH:mm:ss or dd/MM/yyyy
            // Detect pattern by splitting
            const [datePart, timePart] = String(input).trim().split(/\s+/)
            const dateMatch = datePart?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
            if (dateMatch) {
              const d = parseInt(dateMatch[1], 10)
              const m = parseInt(dateMatch[2], 10) - 1
              const y = parseInt(dateMatch[3], 10)
              let h = 0, mi = 0, s = 0
              if (timePart) {
                const tm = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
                if (tm) {
                  h = parseInt(tm[1], 10)
                  mi = parseInt(tm[2], 10)
                  s = tm[3] ? parseInt(tm[3], 10) : 0
                }
              }
              return new Date(y, m, d, h, mi, s).getTime()
            }
            // Fallback to native parser (ISO, etc.)
            const t = Date.parse(input)
            return Number.isNaN(t) ? (NaN as unknown as number) : t
          }
          for (const item of data.data) {
            const raw = item.timestamp || item.registrationDate || ''
            const t = parseSheetDate(raw)
            if (!Number.isNaN(t)) last = Math.max(last, t)
          }
          if ((user.climbCount || 0) !== count || (user.lastClimbAt || 0) !== last) {
            await updateProfile({ climbCount: count, lastClimbAt: last || user.lastClimbAt })
          }
        }
      } catch {}
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phone])

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    const ok = await updateProfile({ name, phone, birthday, cccd, address, avatar })
    setMsg(ok ? 'Cập nhật hồ sơ thành công' : 'Không thể cập nhật hồ sơ')
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    try {
      const { authApi } = await import('@/services/api')
      const res = await authApi.changePassword({ currentPassword, newPassword, email })
      if (!res.success) {
        setErr(res.error || 'Đổi mật khẩu thất bại')
      } else {
        setMsg('Đổi mật khẩu thành công')
        setCurrentPassword('')
        setNewPassword('')
      }
    } catch (e) {
      setErr('Đổi mật khẩu thất bại')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Hồ sơ cá nhân</h1>
        <p className="text-gray-600 mb-6">Quản lý thông tin cá nhân và bảo mật.</p>

        {msg && <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{msg}</div>}
        {err && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</div>}

        <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Thông tin cơ bản</h2>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xl">🙂</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setAvatar(reader.result as string)
                reader.readAsDataURL(file)
              }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={email} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              onBlur={(e) => { /* native picker closes automatically */ }}
              autoComplete="off"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CCCD</label>
            <input value={cccd} onChange={(e) => setCccd(e.target.value)} maxLength={12} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="md:col-span-2">
            <button disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg px-4 py-2 font-semibold transition-colors">Lưu thay đổi</button>
          </div>
        </form>

        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-700">Số lần đăng ký leo núi thành công</p>
              <p className="text-2xl font-bold text-primary-800">{user.climbCount || 0}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Lần gần nhất</p>
              <p className="text-lg font-semibold text-gray-800">{user.lastClimbAt ? new Date(user.lastClimbAt).toLocaleString('vi-VN') : '-'}</p>
            </div>
          </div>
        )}

        <form onSubmit={onChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Đổi mật khẩu</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
          </div>
          <div className="md:col-span-2">
            <button className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-4 py-2 font-semibold transition-colors">Cập nhật mật khẩu</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage



