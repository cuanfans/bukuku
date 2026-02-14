import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Printer } from 'lucide-react';

const CetakStruk = () => {
  const [tab, setTab] = useState('air'); // 'air' or 'bpjs'
  const [form, setForm] = useState({});

  const handlePrint = () => {
    const doc = new jsPDF({ format: 'a4' });
    doc.setFontSize(16);
    doc.text(`STRUK PEMBAYARAN ${tab.toUpperCase()}`, 105, 20, null, null, 'center');
    
    let y = 40;
    doc.setFontSize(12);
    Object.keys(form).forEach(key => {
      doc.text(`${key.toUpperCase()}:`, 20, y);
      doc.text(`${form[key]}`, 80, y);
      y += 10;
    });
    
    doc.text(`STATUS: LUNAS`, 20, y + 10);
    doc.save(`struk_${tab}.pdf`);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Cetak Struk Pembayaran</h2>
      <div className="flex gap-4 mb-4 border-b">
        <button onClick={() => setTab('air')} className={`p-2 ${tab==='air'?'border-b-2 border-blue-600 font-bold':''}`}>AIR</button>
        <button onClick={() => setTab('bpjs')} className={`p-2 ${tab==='bpjs'?'border-b-2 border-blue-600 font-bold':''}`}>BPJS</button>
      </div>

      <div className="grid gap-4">
        <input type="date" className="border p-2 rounded" onChange={e => setForm({...form, tgl_bayar: e.target.value})} />
        {tab === 'air' ? (
          <>
            <input placeholder="ID Pelanggan" className="border p-2 rounded" onChange={e => setForm({...form, id_pel: e.target.value})} />
            <input placeholder="Nama" className="border p-2 rounded" onChange={e => setForm({...form, nama: e.target.value})} />
            <input placeholder="Jumlah Tagihan" className="border p-2 rounded" onChange={e => setForm({...form, tagihan: e.target.value})} />
          </>
        ) : (
          <>
            <input placeholder="Nomor VA" className="border p-2 rounded" onChange={e => setForm({...form, no_va: e.target.value})} />
            <input placeholder="Nama" className="border p-2 rounded" onChange={e => setForm({...form, nama: e.target.value})} />
            <input placeholder="Jumlah Peserta" className="border p-2 rounded" onChange={e => setForm({...form, jml_peserta: e.target.value})} />
          </>
        )}
        <input placeholder="Biaya Admin" className="border p-2 rounded" onChange={e => setForm({...form, admin: e.target.value})} />
        <input placeholder="Total Bayar" className="border p-2 rounded font-bold" onChange={e => setForm({...form, total: e.target.value})} />
        
        <button onClick={handlePrint} className="bg-green-600 text-white py-3 rounded font-bold flex justify-center items-center mt-4">
          <Printer className="mr-2" /> Cetak / Download PDF
        </button>
      </div>
    </div>
  );
};
export default CetakStruk;
