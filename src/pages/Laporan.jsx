import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  DollarSign, 
  Banknote 
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Laporan = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Load User List untuk Owner (Dropdown Filter)
        if (user.role === 'owner' && userList.length === 0) {
          const uRes = await api.get('/user');
          if (Array.isArray(uRes.data)) setUserList(uRes.data);
          else if (uRes.data.results) setUserList(uRes.data.results);
        }

        // Load Data Laporan
        let url = '/laporan';
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
  }, [user.role, filterUser]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Keuangan - ${user.username}`, 14, 20);
    doc.autoTable({
      head: [['Keterangan', 'Jumlah']],
      body: [
        ['Total Saldo Aplikasi Terpakai', formatRupiah(data?.saldo_aplikasi_terpakai)],
        ['Total Transfer', formatRupiah(data?.total_transfer)],
        ['Total Biaya Transfer', formatRupiah(data?.total_biaya_transfer)],
        ['Total Biaya Transfer Debit', formatRupiah(data?.total_biaya_transfer_debit)],
        ['Total Tarik Tunai', formatRupiah(data?.total_tarik_tunai)],
        ['Total Biaya Tarik Tunai', formatRupiah(data?.total_biaya_tarik_tunai)],
        ['Total Tarik Kartu Kredit', formatRupiah(data?.total_tarik_kredit)],
        ['Total Biaya Tarik Kartu Kredit', formatRupiah(data?.total_biaya_tarik_kredit)],
        ['Total Biaya Lain-lain', formatRupiah(data?.total_biaya_lain)],
        ['Total Setor ke Admin', formatRupiah(data?.total_setor_ke_admin)],
        ['TOTAL SALDO KESELURUHAN', formatRupiah(data?.total_saldo_keseluruhan)],
      ],
      startY: 30
    });
    doc.save('laporan_lengkap.pdf');
  };

  if (loading) return <div className="p-8 text-center">Memuat Data Laporan...</div>;

  // Komponen Card Kecil
  const SummaryCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{formatRupiah(value)}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass.replace('border-', 'bg-').replace('500', '100')}`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
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

      {/* SECTION 1: CARDS RINGKASAN (YANG HILANG KEMARIN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Saldo Keseluruhan" 
          value={data?.total_saldo_keseluruhan} 
          icon={Wallet} 
          colorClass="border-blue-500" 
        />
        <SummaryCard 
          title="Saldo Aplikasi Terpakai" 
          value={data?.saldo_aplikasi_terpakai} 
          icon={CreditCard} 
          colorClass="border-indigo-500" 
        />
        <SummaryCard 
          title="Total Transfer" 
          value={data?.total_transfer} 
          icon={ArrowUpRight} 
          colorClass="border-green-500" 
        />
        <SummaryCard 
          title="Total Tarik Tunai" 
          value={data?.total_tarik_tunai} 
          icon={ArrowDownLeft} 
          colorClass="border-red-500" 
        />
        <SummaryCard 
          title="Total Biaya Transfer" 
          value={data?.total_biaya_transfer} 
          icon={DollarSign} 
          colorClass="border-purple-500" 
        />
        <SummaryCard 
          title="Total Biaya Tarik" 
          value={data?.total_biaya_tarik_tunai} 
          icon={DollarSign} 
          colorClass="border-orange-500" 
        />
        <SummaryCard 
          title="Tarik Kartu Kredit" 
          value={data?.total_tarik_kredit} 
          icon={CreditCard} 
          colorClass="border-pink-500" 
        />
        <SummaryCard 
          title="Total Setor Admin" 
          value={data?.total_setor_ke_admin} 
          icon={Banknote} 
          colorClass="border-yellow-500" 
        />
      </div>

      {/* SECTION 2: TABEL RINCIAN KEUANGAN */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-700">Tabel Rincian Lengkap</h3>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
              <Printer className="w-4 h-4 mr-1" /> Export PDF
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            {/* 1. Modal */}
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

            {/* 5. Tarik Kredit (BARU) */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Tarik Kartu Kredit</td>
              <td className="p-4 font-bold text-right text-red-600">{formatRupiah(data?.total_tarik_kredit)}</td>
            </tr>
             <tr className="hover:bg-gray-50">
              <td className="p-4 text-gray-600">Total Biaya Tarik Kredit (Admin 3%)</td>
              <td className="p-4 font-bold text-right text-green-600">{formatRupiah(data?.total_biaya_tarik_kredit)}</td>
            </tr>

            {/* 6. Biaya Lain (BARU) */}
            <tr className="hover:bg-gray-50 bg-blue-50">
              <td className="p-4 text-gray-800 font-medium">Total Biaya Lain-lain</td>
              <td className="p-4 font-bold text-right text-green-700">{formatRupiah(data?.total_biaya_lain)}</td>
            </tr>

            {/* 7. Setor Admin */}
            <tr className="hover:bg-gray-50 bg-yellow-50">
              <td className="p-4 text-gray-800 font-medium">Total Setor User ke Admin</td>
              <td className="p-4 font-bold text-right text-yellow-700">{formatRupiah(data?.total_setor_ke_admin)}</td>
            </tr>
          </tbody>
          
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
