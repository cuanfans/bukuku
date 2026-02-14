// File: src/pages/SetorAdmin.jsx

import React, { useState, useEffect } from 'react';
import { Save, ArrowUpRight, CheckCircle, Edit2, Clock, Check, X } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const SetorAdmin = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State Input (Untuk Kasir)
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // State Edit (Untuk Admin)
  const [editingItem, setEditingItem] = useState(null);
  const [editNominal, setEditNominal] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/setor');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // KASIR: Submit Setoran
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nominal) return;
    setLoading(true);
    try {
      await api.post('/setor', {
        nominal: parseFloat(nominal),
        keterangan
      });
      alert('Setoran berhasil diajukan! Menunggu konfirmasi Admin.');
      setNominal('');
      setKeterangan('');
      loadData();
    } catch (e) {
      alert('Gagal: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: Approve (Langsung Lunas)
  const handleApprove = async (id) => {
    if(!window.confirm("Terima setoran ini? Saldo kasir akan berkurang.")) return;
    try {
      await api.put('/setor', { id, status: 'lunas' });
      loadData();
    } catch (e) {
      alert('Gagal update: ' + e.message);
    }
  };

  // ADMIN: Simpan Edit Nominal
  const handleSaveEdit = async () => {
    try {
      await api.put('/setor', { 
        id: editingItem.id, 
        status: editingItem.status, 
        nominal: parseFloat(editNominal)
      });
      setEditingItem(null);
      loadData();
    } catch (e) {
      alert('Gagal edit: ' + e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       {/* Header */}
       <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <ArrowUpRight className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {user.role === 'owner' ? 'Konfirmasi Setoran Kasir' : 'Setor Tunai ke Admin'}
            </h2>
            <p className="text-gray-600">
              {user.role === 'owner' 
                ? 'Validasi uang fisik yang diterima dari kasir.' 
                : 'Catat penyerahan uang tunai ke owner.'}
            </p>
          </div>
       </div>

        {/* AREA KASIR: Form Input (Hanya muncul jika BUKAN owner) */}
        {user.role !== 'owner' && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-lg mb-4">Input Setoran Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Disetor (Rp)</label>
                <input 
                  type="number" 
                  value={nominal} 
                  onChange={e => setNominal(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-lg font-bold"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea 
                  value={keterangan} 
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Catatan..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Mengirim...' : 'Ajukan Setoran'}
              </button>
            </form>
          </div>
        )}

        {/* LIST DATA (Admin & Kasir) */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">
            {user.role === 'owner' ? 'Daftar Antrian Setoran' : 'Riwayat Setoran Saya'}
          </div>
          
          <div className="divide-y">
            {data.map(item => (
              <div key={item.id} className={`p-4 flex flex-col md:flex-row justify-between items-center gap-4 ${item.status === 'pending' ? 'bg-yellow-50' : 'bg-white'}`}>
                
                {/* Info Transaksi */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{item.tanggal}</span>
                    {user.role === 'owner' && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-bold">
                        {item.nama_kasir || 'Kasir'}
                      </span>
                    )}
                  </div>
                  
                  {/* Mode Edit (Hanya Admin) */}
                  {editingItem?.id === item.id ? (
                    <div className="flex gap-2 items-center">
                      <input 
                        type="number" 
                        value={editNominal} 
                        onChange={e => setEditNominal(e.target.value)}
                        className="border p-1 rounded w-32 font-bold"
                      />
                      <button onClick={handleSaveEdit} className="bg-green-600 text-white p-1 rounded"><Check size={16}/></button>
                      <button onClick={() => setEditingItem(null)} className="bg-gray-400 text-white p-1 rounded"><X size={16}/></button>
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-gray-800">
                      {handleFormatRupiah(item.nominal)}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">{item.keterangan || '-'}</div>
                </div>

                {/* Status & Aksi */}
                <div className="flex items-center gap-3">
                  {item.status === 'pending' ? (
                    <>
                      <div className="flex items-center text-yellow-600 font-bold text-sm px-3 py-1 bg-yellow-100 rounded-full">
                        <Clock className="w-4 h-4 mr-1" /> Menunggu
                      </div>
                      
                      {/* Tombol Aksi Admin - INI YANG ANDA CARI */}
                      {user.role === 'owner' && (
                        <div className="flex gap-2">
                           <button 
                            onClick={() => handleApprove(item.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center"
                            title="Terima Uang"
                           >
                             <CheckCircle className="w-4 h-4 mr-1" /> Terima
                           </button>
                           <button 
                            onClick={() => { setEditingItem(item); setEditNominal(item.nominal); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center"
                            title="Edit Nominal"
                           >
                             <Edit2 className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center text-green-700 font-bold text-sm px-3 py-1 bg-green-100 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" /> Diterima / Lunas
                    </div>
                  )}
                </div>

              </div>
            ))}

            {data.length === 0 && (
              <div className="p-8 text-center text-gray-500">Belum ada data setoran.</div>
            )}
          </div>
        </div>
    </div>
  );
};

export default SetorAdmin;
