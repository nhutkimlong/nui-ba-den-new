import React from 'react';
import { Link } from 'react-router-dom';

const AdminPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trang Quản trị</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/climb" className="p-4 bg-blue-500 text-white rounded-lg text-center">
          Quản lý Leo núi
        </Link>
        <Link to="/admin/guide" className="p-4 bg-green-500 text-white rounded-lg text-center">
          Quản lý Cẩm nang
        </Link>
        <Link to="/admin/poi" className="p-4 bg-yellow-500 text-white rounded-lg text-center">
          Quản lý POI
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;