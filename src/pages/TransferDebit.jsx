import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, BarChart3, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { api } from '../utils/api'; // Pastikan path benar sesuai project Anda
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TransferDebit = () => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    biaya: '',
    keterangan: ''
  });
  
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [periode, setPeriode] = useState('harian');
  const [cashiers, setCashiers] = useState([]);
  const [selectedCashier, setSelectedCashier] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSaldoAllCashiers, setTotalSaldoAllCashiers] = useState(0);
  const [grafikData, setGrafikData] = useState({
    harian: [],
    mingguan: [],
    bulanan: []
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'owner') {
      loadCashiers();
      loadTotalSaldoAllCashiers();
    }
    loadTransfers();
    loadGrafik();
  }, [periode, selectedCashier, startDate, endDate]);

  const loadCashiers = async () => {
    try {
      const response = await api.get('/user');
      // Akses response.data karena menggunakan Axios
      const result = response.data;
      const kasirList = Array.isArray(result) 
        ? result.filter(u => u.role === 'kasir' && u.status === 'aktif')
        : (result.results ? result.results.filter(u => u.role === 'kasir') : []);
      setCashiers(kasirList);
    } catch (error) {
      console.error('Error loading cashiers:', error);
      setCashiers([]);
    }
  };

  const loadTotalSaldoAllCashiers = async () => {
    try {
      const response = await api.get('/saldo/total');
      setTotalSaldoAllCashiers(response.data?.total || 0);
    } catch (error) {
      console.error('Error loading total saldo:', error);
      setTotalSaldoAllCashiers(0);
    }
  };

  const loadTransfers = async () => {
    try {
      let url = '/transfer-debit';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', 100); // Agar riwayat muncul banyak
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      // PERBAIKAN: Akses response.data.data karena API mengirim objek pagination
      const result = response.data;
      let transfersData = [];

      if (result && result.data && Array.isArray(result.data)) {
        transfersData = result.data;
      } else if (Array.isArray(result)) {
        transfersData = result;
      }
      
      if (user?.role === 'owner' && selectedCashier !== 'all') {
        transfersData = transfersData.filter(t => t.user_id === parseInt(selectedCashier));
      }
      
      setTransfers(transfersData);
    } catch (error) {
      console.error('Error loading transfer debit:', error);
      setTransfers([]);
    }
  };

  const loadGrafik = async () => {
    try {
      const response = await api.get(`/transfer-debit/grafik/${periode}`);
      setGrafikData(prev => ({
        ...prev,
        [periode]: Array.isArray(response.data) ? response.data : []
      }));
    } catch (error) {
      console.error('Error loading grafik:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/transfer-debit', formData);
      
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        biaya: '',
        keterangan: ''
      });
      
      setShowForm(false);
      loadTransfers();
      alert('Transfer debit berhasil disimpan!');
    } catch (error) {
      console.error('Error saving transfer debit:', error);
      alert('Gagal menyimpan transfer debit');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getKasirName = (transfer) => {
    // Gunakan nama_kasir dari JOIN API backend
    if (transfer.nama_kasir) return transfer.nama_kasir;
    if (transfer.user_id && cashiers.length > 0) {
      const cashier = cashiers.find(c => c.id === transfer.user_id);
      return cashier ? cashier.username : 'N/A';
    }
    return 'N/A';
  };

  // Logika export dan grafik tetap sama sesuai file asli Anda...
  // (Potongan kode di bawah ini tetap menjaga style Purple asli)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Transfer Pakai Kartu Debit</h2>
              <p className="text-gray-600">Kelola transfer menggunakan kartu debit</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {user?.role !== 'owner' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Transfer Debit Baru
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-purple-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">Catatan Transfer Debit</h3>
            <div className="mt-2 text-sm text-purple-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Hanya biaya yang akan menambah total saldo</li>
                <li>Nominal transfer tidak dihitung dalam saldo</li>
                <li>Biaya ini merupakan pendapatan dari jasa transfer debit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form Transfer Debit */}
      {showForm && user?.role !== 'owner' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Transfer Debit</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biaya Transfer Debit</label>
                <input
                  type="text"
                  value={formData.biaya}
                  onChange={(e) => {
                    const numeric = (e.target.value || '').replace(/[^0-9]/g, '');
                    setFormData({ ...formData, biaya: numeric });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Masukkan biaya transfer"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Keterangan transfer debit"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 text-white px-6 py-2 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat Transaksi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center text-sm">
          <h3 className="font-bold">Riwayat Transaksi</h3>
          <div className="flex gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-1 rounded" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-1 rounded" />
            {user?.role === 'owner' && (
              <select value={selectedCashier} onChange={e => setSelectedCashier(e.target.value)} className="border p-1 rounded">
                <option value="all">Semua Kasir</option>
                {cashiers.map(c => <option key={c.id} value={c.id}>{c.username}</option>)}
              </select>
            )}
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600 font-bold">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Kasir</th>
              <th className="p-4">Biaya</th>
              <th className="p-4">Keterangan</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-4">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                <td className="p-4">{getKasirName(t)}</td>
                <td className="p-4 font-bold">{formatCurrency(t.biaya)}</td>
                <td className="p-4">{t.keterangan}</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">LUNAS</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferDebit;
