import React, { useEffect, useRef, useState } from 'react'
import { usersApi } from '@/services/api'
import { ResponsiveContainer } from '../../layout'
import { Link } from 'react-router-dom'

type UserRow = {
  id: string
  name: string
  email: string
  role?: string
  phone?: string
  birthday?: string
  cccd?: string
  address?: string
  climbCount?: number
  lastClimbAt?: number
}

const UserAdminPage: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const birthdayRef = useRef<HTMLInputElement>(null)
  const blurBirthday = () => birthdayRef.current && birthdayRef.current.blur()

  // Áp dụng giống ProfilePage: chỉ blur ngày sinh khi focus sang ô khác

  const load = async () => {
    setLoading(true)
    const res = await usersApi.list()
    if (res.success && (res.data as any)?.users) setUsers((res.data as any).users)
    else setError(res.error || 'Không tải được danh sách người dùng')
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onSave = async () => {
    if (!editing) return
    setLoading(true)
    const res = await usersApi.save(editing)
    setLoading(false)
    if (res.success) {
      setEditing(null)
      load()
    } else {
      setError(res.error || 'Lưu thất bại')
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Xóa người dùng này?')) return
    setLoading(true)
    const res = await usersApi.delete(id)
    setLoading(false)
    if (res.success) load()
    else setError(res.error || 'Xóa thất bại')
  }

  return (
    <ResponsiveContainer maxWidth="7xl" padding="lg">
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50" title="Trở về">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </Link>
              <div className="p-3 rounded-xl bg-emerald-100">
                <svg className="w-6 h-6 text-emerald-700" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2H8c-1.1 0-2 .9-2 2v3H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-1h1c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 14h-1V9c0-1.1-.9-2-2-2H8V4h11v12ZM5 9h11v11H5V9Z"/></svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h1>
                <p className="text-slate-600">Quản lý và cập nhật thông tin tài khoản trên hệ thống</p>
              </div>
            </div>
            <button className="px-3 py-2 bg-primary-600 text-white rounded" onClick={() => setEditing({ id: '', name: '', email: '', role: 'user' })}>Thêm người dùng</button>
          </div>
        </div>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Tên</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2">Vai trò</th>
                <th className="px-3 py-2">SĐT</th>
                <th className="px-3 py-2">Lần đăng ký</th>
                <th className="px-3 py-2">Lần gần nhất</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2 text-center">{u.role || 'user'}</td>
                  <td className="px-3 py-2 text-center">{u.phone || '-'}</td>
                  <td className="px-3 py-2 text-center">{u.climbCount || 0}</td>
                  <td className="px-3 py-2 text-center">{u.lastClimbAt ? new Date(u.lastClimbAt).toLocaleString('vi-VN') : '-'}</td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button className="px-2 py-1 border rounded" onClick={() => setEditing(u)}>Sửa</button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => onDelete(u.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-3 text-center text-slate-500">Đang tải...</div>}
        </div>

        {editing && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center" onMouseDown={(e) => {
            const target = e.target as HTMLElement
            if (target.closest('#user-modal')) return
            const active = document.activeElement as HTMLInputElement | null
            if (active && active.type === 'date') active.blur()
          }} onTouchStart={(e) => {
            const target = e.target as HTMLElement
            if (target.closest('#user-modal')) return
            const active = document.activeElement as HTMLInputElement | null
            if (active && active.type === 'date') active.blur()
          }}>
            <div id="user-modal" className="bg-white rounded-xl p-4 w-full max-w-lg">
              <h2 className="text-lg font-semibold mb-3">{editing.id ? 'Chỉnh sửa' : 'Thêm'} người dùng</h2>
              <div className="grid grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Tên" value={editing.name} onFocus={blurBirthday} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="Email" value={editing.email} onFocus={blurBirthday} onChange={e => setEditing({ ...editing, email: e.target.value })} />
                <select className="border rounded px-3 py-2" value={editing.role || 'user'} onFocus={blurBirthday} onChange={e => setEditing({ ...editing, role: e.target.value })}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <input className="border rounded px-3 py-2" placeholder="SĐT" value={editing.phone || ''} onFocus={blurBirthday} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
                <input
                  ref={birthdayRef}
                  className="border rounded px-3 py-2"
                  placeholder="Ngày sinh"
                  type="date"
                  autoComplete="off"
                  value={editing.birthday || ''}
                  onChange={e => setEditing({ ...editing, birthday: e.target.value })}
                  onBlur={() => { /* native picker closes automatically */ }}
                />
                <input className="border rounded px-3 py-2" placeholder="CCCD" value={editing.cccd || ''} onFocus={blurBirthday} onChange={e => setEditing({ ...editing, cccd: e.target.value })} />
                <input className="border rounded px-3 py-2 col-span-2" placeholder="Địa chỉ" value={editing.address || ''} onFocus={blurBirthday} onChange={e => setEditing({ ...editing, address: e.target.value })} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="px-3 py-2 border rounded" onClick={() => setEditing(null)}>Hủy</button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded" onClick={onSave}>Lưu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveContainer>
  )
}

export default UserAdminPage


