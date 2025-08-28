import { ResponsiveContainer, useDevice } from '../layout'

const DataEditorPage = () => {
  const { isMobile } = useDevice();
  
  return (
    <ResponsiveContainer maxWidth="6xl" padding="lg">
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Chỉnh sửa dữ liệu
        </h1>
        <p className="text-xl text-gray-600">
          Quản lý và chỉnh sửa dữ liệu hệ thống
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-500 text-center">Giao diện chỉnh sửa dữ liệu sẽ được thêm vào đây</p>
      </div>
      </div>
    </ResponsiveContainer>
  )
}

export default DataEditorPage
