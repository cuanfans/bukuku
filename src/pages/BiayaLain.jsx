import React, { useState, useEffect } from 'react';
import { DollarSign, Save } from 'lucide-react';
import api from '../utils/api';

const BiayaLain = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ tanggal: '', biaya: '', keterangan: '' });

  const fetchData = async () => {
    const res = await api.get('/biaya-lain');
    setData(res.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/biaya-lain', form);
    alert('Disimpan!');
    setForm({ tanggal: '', biaya: '', keterangan: '' });
    fetchData();
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 flex items-center"><DollarSign className="mr-2"/> Biaya Lain-lain</h2>
      <form onSubmit={handleSubmit} className="mb-8 grid gap-4">
        <input type="date" className="border p-2 rounded" value={form.tanggal} onChange={e=>setForm({...form, tanggal:e.target.value})} required />
        <input type="number" placeholder="Nominal Biaya" className="border p-2 rounded" value={form.biaya} onChange={e=>setForm({...form, biaya:e.target.value})} required />
        <input type="text" placeholder="Keterangan" className="border p-2 rounded" value={form.keterangan} onChange={e=>setForm({...form, keterangan:e.target.value})} required />
        <button className="bg-blue-600 text-white p-2 rounded">Simpan</button>
      </form>
      <table className="w-full text-left border">
        <thead><tr className="bg-gray-100"><th className="p-2">Tanggal</th><th className="p-2">Biaya</th><th className="p-2">Ket</th></tr></thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-t"><td className="p-2">{d.tanggal}</td><td className="p-2">Rp {parseInt(d.biaya).toLocaleString()}</td><td className="p-2">{d.keterangan}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default BiayaLain;
