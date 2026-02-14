import React, { useState, useEffect } from 'react';
import { CreditCard, Save, FileText, Download, Printer, Search, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const TarikKredit = () => {
  const { user } = useAuth();
  
  // State Form
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nama_user: '',
    nominal: '',
    admin_fee: 0,
    sisa: 0,
    foto_struk: '',
    keterangan: ''
  });

  // State Data
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState({ start: '', end: '' });

  // Load Data
  const fetchHistory = async () => {
    try {
      let url = '/tarik-kredit';
      if (filterDate.start && filterDate.end) {
        url += `?startDate=${filterDate.start}&endDate=${filterDate.end}`;
      }
      const res = await api.get(url);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterDate]);

  // Handle Input Nominal (Auto Hitung 3%)
  const handleNominalChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const nominal = parseFloat(val) || 0;
    const admin = nominal * 0.03; // 3%
    const sisa = nominal - admin;

    setFormData(prev => ({
      ...prev,
      nominal: val,
      admin_fee: admin,
      sisa: sisa
    }));
  };

  // Handle Upload Foto (Convert ke Base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 500) { // Limit 500KB agar DB tidak berat
        alert("Ukuran foto maksimal 500KB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto_struk: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tarik-kredit', {
        ...formData,
        nominal: parseFloat(formData.nominal),
      });
      alert('Transaksi Berhasil!');
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        nama_user: '',
        nominal: '',
        admin_fee: 0,
        sisa: 0,
        foto_struk: '',
        keterangan: ''
      });
      fetchHistory();
    } catch (e) {
      alert('Gagal: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Helper Format Rupiah
  const rp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Tarik Kartu Kredit - ${user.username}`, 14, 15);
    doc.autoTable({
      head: [['Tgl', 'Nama User', 'Nominal', 'Admin (3%)', 'Sisa (Diterima)', 'Ket']],
      body: history.map(item => [
        item.tanggal,
        item.nama_user,
        rp(item.nominal),
        rp(item.admin_fee),
        rp(item.sisa),
        item.keterangan
      ]),
      startY: 20
    });
    doc.save('laporan_tarik_kredit.pdf');
  };

  // Export Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(history.map(item => ({
      Tanggal: item.tanggal,
      Nama_User: item.nama_user,
      Nominal: item.nominal,
      Admin_3_Persen: item.admin_fee,
      Sisa_Diterima: item.sisa,
      Keterangan: item.keterangan
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TarikKredit");
    XLSX.writeFile(wb, "laporan_tarik_kredit.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
        <CreditCard className="w-10 h-10 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tarik Kartu Kredit</h2>
          <p className="text-gray-500">Input transaksi gesek tunai (Admin 3%)</p>
        </div>
      </div>

      {/* Form Input */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">Input Transaksi Baru</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal</label>
            <input 
              type="date" 
              className="w-full border p-2 rounded" 
              value={formData.tanggal}
              onChange={e => setFormData({...formData, tanggal: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama User / Pelanggan</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              placeholder="Nama pemilik kartu"
              value={formData.nama_user}
              onChange={e => setFormData({...formData, nama_user: e.target.value})}
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nominal Gesek (Rp)</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded text-lg font-bold" 
              placeholder="0"
              value={formData.nominal}
              onChange={handleNominalChange}
              required 
            />
          </div>

          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex justify-between text-sm mb-1">
              <span>Admin Fee (3%):</span>
              <span className="font-bold text-red-600">{rp(formData.admin_fee)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Sisa (Diterima):</span>
              <span className="text-green-600">{rp(formData.sisa)}</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo Struk</label>
            <div className="flex items-center gap-4">
               <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="border p-2 rounded w-full"
              />
              {formData.foto_struk && (
                <img src={formData.foto_struk} alt="Preview" className="h-12 w-12 object-cover rounded border" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">*Maksimal 500KB</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Keterangan</label>
            <textarea 
              className="w-full border p-2 rounded h-20"
              placeholder="Catatan tambahan..."
              value={formData.keterangan}
              onChange={e => setFormData({...formData, keterangan: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-purple-600 text-white py-3 rounded font-bold hover:bg-purple-700 flex justify-center items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-bold">Riwayat Transaksi</h3>
          
          <div className="flex gap-2">
            <input 
              type="date" 
              className="border p-2 rounded text-sm"
              onChange={e => setFilterDate({...filterDate, start: e.target.value})}
            />
            <span className="self-center">-</span>
            <input 
              type="date" 
              className="border p-2 rounded text-sm"
              onChange={e => setFilterDate({...filterDate, end: e.target.value})}
            />
            <button onClick={exportPDF} className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200" title="PDF">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={exportExcel} className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200" title="Excel">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 uppercase text-gray-600">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">User</th>
                <th className="p-3 text-right">Nominal</th>
                <th className="p-3 text-right">Admin (3%)</th>
                <th className="p-3 text-right">Sisa</th>
                <th className="p-3 text-center">Struk</th>
                <th className="p-3">Ket</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3">{item.tanggal}</td>
                  <td className="p-3 font-medium">{item.nama_user}</td>
                  <td className="p-3 text-right">{rp(item.nominal)}</td>
                  <td className="p-3 text-right text-red-500">{rp(item.admin_fee)}</td>
                  <td className="p-3 text-right font-bold text-green-600">{rp(item.sisa)}</td>
                  <td className="p-3 text-center">
                    {item.foto_struk ? (
                      <a href={item.foto_struk} download={`struk-${item.id}.png`} className="text-blue-600 underline text-xs">
                        Lihat
                      </a>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-gray-500 truncate max-w-xs">{item.keterangan}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Belum ada data transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TarikKredit;
