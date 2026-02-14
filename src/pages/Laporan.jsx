import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Import tanpa kurung kurawal
import { useAuth } from '../hooks/useAuth';

const Laporan = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Jika Owner: Lihat semua. Jika Kasir: Filter by User ID sendiri.
  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        // Asumsi backend endpoint /laporan sudah ada dan menghandle filter ini
        // Jika belum, kita filter di frontend dulu:
        const endpoint = user.role === 'owner' ? '/laporan' : `/laporan?user_id=${user.id}`;
        
        // Note: Untuk sementara, karena backend laporan kompleks belum kita buat, 
        // kita tampilkan placeholder atau data dummy/dashboard dulu
        const res = await api.get('/dashboard'); // Sementara ambil data dashboard sebagai basis
        setData(res.data);
      } catch (e) {
        console.error("Gagal load laporan", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLaporan();
  }, [user]);

  if (loading) return <div>Memuat Laporan...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {user.role === 'owner' ? 'Laporan Lengkap (Admin)' : `Laporan Kasir: ${user.username}`}
      </h2>
      
      <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-6">
        <p className="font-bold text-yellow-800">Status Revisi:</p>
        <p className="text-sm text-yellow-700">
          Sesuai dokumen "KASIR REVISI", halaman ini menampilkan rekapitulasi:
        </p>
        <ul className="list-disc ml-5 text-sm text-yellow-700">
          <li>Total Saldo Aplikasi Terpakai (1-13)</li>
          <li>Total Transfer & Biaya</li>
          <li>Total Tarik Tunai & Biaya</li>
          <li>Total Setor ke Admin</li>
          <li><strong>Total Saldo Keseluruhan</strong></li>
        </ul>
      </div>

      {/* Disini nanti tabel/grid laporan detailnya */}
      <div className="text-center py-10 text-gray-500">
        (Fitur Laporan Detail sedang disiapkan Backend-nya. <br/>
        Data saldo saat ini: Rp {parseInt(data?.users?.find(u => u.id === user.id)?.current_saldo || 0).toLocaleString('id-ID')})
      </div>
    </div>
  );
};

export default Laporan;
