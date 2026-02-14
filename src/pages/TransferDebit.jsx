import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, BarChart3, X, Image as ImageIcon } from 'lucide-react';
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
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    keterangan: '',
    foto_struk: ''
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
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      
      // PERBAIKAN: Selalu akses response.data karena menggunakan Axios
      // Dan akses properti .data karena API mengembalikan objek { data: results, pagination }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024) return alert("Ukuran foto maksimal 500KB");
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, foto_struk: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/transfer-debit', {
        ...formData,
        biaya: parseFloat(formData.biaya)
      });
      
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        biaya: '',
        keterangan: '',
        foto_struk: ''
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
    }).format(amount);
  };

  const getKasirName = (transfer) => {
    if (transfer.nama_kasir) return transfer.nama_kasir;
    if (transfer.user_id && cashiers.length > 0) {
      const cashier = cashiers.find(c => c.id === transfer.user_id);
      return cashier ? cashier.username : 'N/A';
    }
    return 'N/A';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Laporan Transfer Debit', 14, 15);
    doc.autoTable({
      head: [['No', 'Tanggal', 'Kasir', 'Biaya', 'Keterangan', 'Status']],
      body: transfers.map((t, i) => [
        i + 1,
        new Date(t.tanggal).toLocaleDateString('id-ID'),
        getKasirName(t),
        formatCurrency(t.biaya),
        t.keterangan,
        t.status || 'lunas'
      ]),
      startY: 20
    });
    doc.save(`laporan-debit-${new Date().getTime()}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transfers.map((t, i) => ({
      No: i + 1,
      Tanggal: t.tanggal,
      Kasir: getKasirName(t),
      Biaya: t.biaya,
      Keterangan: t.keterangan,
      Status: t.status || 'lunas'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfer Debit');
    XLSX.writeFile(wb, `laporan-debit-${new Date().getTime()}.xlsx`);
  };

  const chartData = {
    labels: grafikData[periode]?.map(item => item.tanggal) || [],
    datasets: [
      {
        label: 'Total Transaksi',
        data: grafikData[periode]?.map(item => item.total) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Total Biaya',
        data: grafikData[periode]?.map(item => item.total_biaya) || [],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: { type: 'linear', display: true, position: 'left' },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Transfer Pakai Kartu Debit</h2>
            <p className="text-gray-600">Kelola transfer menggunakan kartu debit</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportToPDF} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"><Download className="h-5 w-5 mr-2" /> PDF</button>
          <button onClick={exportToExcel} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"><Download className="h-5 w-5 mr-2" /> Excel</button>
          {user?.role !== 'owner' && (
            <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"><Plus className="h-5 w-5 mr-2" /> Debit Baru</button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="border p-2 rounded" required />
              <input type="number" value={formData.biaya} onChange={(e) => setFormData({...formData, biaya: e.target.value})} className="border p-2 rounded" placeholder="Biaya Admin" required />
            </div>
            <textarea value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} className="w-full border p-2 rounded" placeholder="Keterangan" required />
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 rounded w-full" />
              {formData.foto_struk && <img src={formData.foto_struk} alt="preview" className="h-12 w-12 object-cover rounded" />}
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="bg-purple-600 text-white px-6 py-2 rounded-lg">{loading ? 'Menyimpan...' : 'Simpan'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-bold">Riwayat Transaksi</h3>
          <div className="flex gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-1 rounded text-sm" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-1 rounded text-sm" />
            {user?.role === 'owner' && (
              <select value={selectedCashier} onChange={e => setSelectedCashier(e.target.value)} className="border p-1 rounded text-sm">
                <option value="all">Semua Kasir</option>
                {cashiers.map(c => <option key={c.id} value={c.id}>{c.username}</option>)}
              </select>
            )}
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs uppercase">
            <tr>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Kasir</th>
              <th className="p-4">Biaya</th>
              <th className="p-4">Keterangan</th>
              <th className="p-4">Bukti</th>
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
                  {t.foto_struk ? <a href={t.foto_struk} download={`struk-${t.id}.png`}><ImageIcon className="w-5 h-5 text-blue-500" /></a> : '-'}
                </td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">LUNAS</span>
                </td>
              </tr>
            ))}
            {transfers.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">Tidak ada data ditemukan</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Grafik */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4 flex items-center"><BarChart3 className="mr-2" /> Monitoring Grafik</h3>
        <div className="h-64"><Line data={chartData} options={chartOptions} /></div>
      </div>
    </div>
  );
};

export default TransferDebit;
