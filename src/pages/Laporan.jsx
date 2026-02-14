import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download } from 'lucide-react'; // Ikon tambahan
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Laporan = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState(''); // Untuk filter owner
  const [userList, setUserList] = useState([]); // List user untuk dropdown owner

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Jika Owner, ambil daftar user dulu untuk dropdown
        if (user.role === 'owner' && userList.length === 0) {
          const uRes = await api.get('/user');
          if (Array.isArray(uRes.data)) setUserList(uRes.data);
          else if (uRes.data.results) setUserList(uRes.data.results);
        }

        // 2. Ambil Data Laporan Real
        let url = '/laporan';
        // Jika kasir, otomatis difilter di backend. 
        // Jika owner memilih user tertentu, tambahkan query param.
        if (user.role === 'owner' && filterUser) {
          url += `?user_id=${filterUser}`;
        }

        const response = await api.get(url);
        setData(response.data);

      } catch (error) {
        console.error("Gagal mengambil data laporan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role, filterUser]); // Reload jika filter berubah

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val || 0);
  };

  if (loading) return <div className="p-8 text-center">Memuat Data Laporan...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="mr-2" /> 
            {user.role === 'owner' ? 'Laporan Pusat (Admin)' : 'Laporan Keuangan Kasir'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Rekapitulasi total transaksi dan saldo real-time.
          </p>
        </div>

        {/* Dropdown Filter User (Hanya Owner) */}
        {user.role === 'owner' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold">Pilih Kasir:</label>
            <select 
              className="border p-2 rounded"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">-- Semua Kasir --</option>
              {userList.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabel Rincian (Sesuai Revisi Poin J) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-700">Rincian Keuangan</h3>
          {/* Tombol Dummy Print/Export (Sesuai mockup revisi) */}
          <div className="flex gap-2">
            <button className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
              <Printer className="w-4 h-4 mr-1" /> Print
            </button>
            <button className="flex items-center text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">
              <Download className="w-4 h-4 mr-1" /> Export XLS
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {/* 1. Modal / Saldo Aplikasi */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Saldo Aplikasi Terpakai (1-13)</td>
              <td className="p-4 font-bold text-right text-gray-800">{formatRupiah(data?.saldo_aplikasi_terpakai)}</td>
            </tr>

            {/* 2. Transfer */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Transfer</td>
              <td className="p-4 font-bold text-right text-blue-600">{formatRupiah(data?.total_transfer)}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Biaya Transfer</td>
              <td className="p-4 font-bold text-right text-green-600">{formatRupiah(data?.total_biaya_transfer)}</td>
            </tr>

            {/* 3. Transfer Debit */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Biaya Transfer (Debit)</td>
              <td className="p-4 font-bold text-right text-green-600">{formatRupiah(data?.total_biaya_transfer_debit)}</td>
            </tr>

            {/* 4. Tarik Tunai */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Tarik Tunai</td>
              <td className="p-4 font-bold text-right text-red-600">{formatRupiah(data?.total_tarik_tunai)}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Biaya Tarik Tunai</td>
              <td className="p-4 font-bold text-right text-green-600">{formatRupiah(data?.total_biaya_tarik_tunai)}</td>
            </tr>

            {/* 5. Setor Admin */}
            <tr className="hover:bg-gray-50 bg-yellow-50">
              <td className="p-4 text-gray-800 font-medium">Total Setor User ke Admin</td>
              <td className="p-4 font-bold text-right text-yellow-700">{formatRupiah(data?.total_setor_ke_admin)}</td>
            </tr>
          </tbody>
          
          {/* TOTAL KESELURUHAN */}
          <tfoot className="bg-blue-900 text-white">
            <tr>
              <td className="p-5 text-lg font-bold">TOTAL SALDO KESELURUHAN</td>
              <td className="p-5 text-2xl font-bold text-right">
                {formatRupiah(data?.total_saldo_keseluruhan)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Laporan;
