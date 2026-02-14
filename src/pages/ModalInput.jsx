import React, { useState } from 'react';
import api from '../utils/api';
import { MODAL_TYPES } from '../utils/constants';

const ModalInput = () => {
  const [formData, setFormData] = useState({
    modal_type: MODAL_TYPES[0].value, // Default ke item pertama
    nominal: '',
    keterangan: '' // Opsional jika diperlukan
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Memproses...' });

    try {
      await api.post('/modal', {
        modal_type: formData.modal_type,
        nominal: parseFloat(formData.nominal) // Pastikan dikirim sebagai angka
      });
      setStatus({ type: 'success', message: 'Data berhasil disimpan!' });
      setFormData({ ...formData, nominal: '' }); // Reset nominal saja
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Terjadi kesalahan' });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Input Modal / Pemakaian</h2>
      
      {status.message && (
        <div className={`p-3 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Tipe Aplikasi (Sumber Dana)</label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.modal_type}
            onChange={(e) => setFormData({...formData, modal_type: e.target.value})}
          >
            {MODAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Nominal (Rp)</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.nominal}
            onChange={(e) => setFormData({...formData, nominal: e.target.value})}
            placeholder="Contoh: 50000"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          disabled={status.type === 'loading'}
        >
          {status.type === 'loading' ? 'Menyimpan...' : 'Simpan Data'}
        </button>
      </form>
    </div>
  );
};

export default ModalInput;
