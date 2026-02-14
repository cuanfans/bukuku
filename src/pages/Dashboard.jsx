import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { MODAL_TYPES } from '../utils/constants';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setSummary(data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard & Info Saldo</h1>
      
      {/* Grid Saldo 1-13 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {MODAL_TYPES.map((type) => {
          // Ambil total dari data backend, jika tidak ada set 0
          const nominal = summary?.modals?.[type.value] || 0;
          return (
            <div key={type.value} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="text-sm font-semibold text-gray-500 uppercase">{type.label}</h3>
              <p className="text-xl font-bold text-gray-800 mt-2">
                Rp {parseInt(nominal).toLocaleString('id-ID')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Tabel Ringkasan User (Tetap Dipertahankan) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Ringkasan User</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo Saat Ini</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary?.users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                    Rp {parseInt(user.current_saldo).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
