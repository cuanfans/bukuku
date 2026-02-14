import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, User, Key, Shield } from 'lucide-react';
import api from '../utils/api'; // Pastikan import tanpa kurung kurawal
import { useAuth } from '../hooks/useAuth';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'kasir' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const { user: currentUser } = useAuth();

  // Load Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // PERBAIKAN: Gunakan endpoint tunggal '/user' sesuai backend functions
      const response = await api.get('/user'); 
      
      // PERBAIKAN: Backend Cloudflare mengembalikan array langsung, bukan object {data: [...]}
      // Jadi kita cek apakah response.data itu array
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Fallback jika nanti backend berubah format
        setUsers(response.data.results);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Gagal memuat data user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        // Mode Edit
        const dataToSend = { ...formData, id: editingId };
        if (!dataToSend.password) delete dataToSend.password; // Jangan kirim password kosong saat edit
        
        await api.put('/user', dataToSend);
      } else {
        // Mode Tambah Baru
        await api.post('/user', formData);
      }
      
      setShowModal(false);
      setFormData({ username: '', password: '', role: 'kasir' });
      setEditingId(null);
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan user.');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ username: user.username, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      // Backend DELETE support via query param ?id=...
      await api.delete(`/user?id=${id}`);
      fetchUsers();
    } catch (err) {
      alert('Gagal menghapus user: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="mr-2" /> Manajemen User
        </h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ username: '', password: '', role: 'kasir' });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.status || 'Aktif'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  {u.username !== 'admin' && u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit User' : 'Tambah User Baru'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Password {editingId && '(Kosongkan jika tidak diubah)'}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="password" 
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingId}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="kasir">Kasir</option>
                    <option value="owner">Owner / Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
