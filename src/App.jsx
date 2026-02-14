import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ModalInput from './pages/ModalInput';
import Transfer from './pages/Transfer';
import TransferDebit from './pages/TransferDebit';
import TarikTunai from './pages/TarikTunai';
import Laporan from './pages/Laporan';
import UserManagement from './pages/UserManagement';
import Logs from './pages/Logs';
import SetorAdmin from './pages/SetorAdmin'; // <--- JANGAN LUPA IMPORT INI
import Layout from './layouts/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import TarikKredit from './pages/TarikKredit'; // <-- Tambahkan import ini

// Komponen untuk memproteksi halaman (Redirect ke login jika belum login)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Halaman Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Halaman Dashboard (Root) */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          {/* PERBAIKAN 1: Ganti "/modal" menjadi "/input-modal" agar sesuai sidebar */}
          <Route path="/input-modal" element={
            <ProtectedRoute>
              <Layout><ModalInput /></Layout>
            </ProtectedRoute>
          } />

          {/* PERBAIKAN 2: Tambahkan Rute "/setor" */}
          <Route path="/setor" element={
            <ProtectedRoute>
              <Layout><SetorAdmin /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/transfer" element={
            <ProtectedRoute>
              <Layout><Transfer /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/transfer-debit" element={
            <ProtectedRoute>
              <Layout><TransferDebit /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/tarik-tunai" element={
            <ProtectedRoute>
              <Layout><TarikTunai /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/tarik-kredit" element={
            <ProtectedRoute>
              <Layout><TarikKredit /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/laporan" element={
            <ProtectedRoute>
              <Layout><Laporan /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <Layout><UserManagement /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/logs" element={
            <ProtectedRoute>
              <Layout><Logs /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch all - Redirect ke dashboard jika halaman tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
