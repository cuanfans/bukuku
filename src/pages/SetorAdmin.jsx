import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SetorAdmin = () => {
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState('');

  // Fetch riwayat setor
  const fetchHistory = async () => {
    try {
      // Kita perlu membuat endpoint GET khusus atau filter transfer by bank_tujuan='SETOR_ADMIN'
      // Untuk efisiensi, anggap kita pakai endpoint report transfer dengan filter di frontend sementara
      const { data } = await api.get('/laporan?type=setor_admin'); 
      // Note: Anda perlu sesuaikan endpoint ini di backend nanti jika ingin list spesifik
      // Untuk sekarang kita fokus ke INPUT dulu sesuai instruksi
    } catch (e) { console.error(e) }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/setor', {
        nominal: parseFloat(nominal),
        keterangan: keterangan
      });
      setMsg('Setoran berhasil diajukan. Menunggu konfirmasi Admin.');
      setNominal('');
      setKeterangan('');
    } catch (error) {
      setMsg('Gagal melakukan setoran: ' + (error.response?.data?.error || 'Error'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Setor Tunai ke Admin</h2>
      
      {msg && <div className="p-3 bg-blue-100 text-blue-800 mb-4 rounded">{msg}</div>}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Nominal Setor</label>
            <input 
              type="number" 
              value={nominal} 
              onChange={e => setNominal(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Jumlah uang cash yang disetor"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Keterangan</label>
            <textarea 
              value={keterangan} 
              onChange={e => setKeterangan(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Catatan tambahan..."
            ></textarea>
          </div>
          <button type="submit" className="bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700">
            Kirim Setoran
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetorAdmin;
