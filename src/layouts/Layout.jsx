import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Send,
  CreditCard, 
  Banknote, 
  FileText, 
  Users, 
  Activity, 
  LogOut, 
  Menu, 
  X, 
  ArrowUpRight,
  DollarSign,    // <--- INI YANG SEBELUMNYA HILANG
  Printer,       // <--- Untuk menu Cetak Struk
  MessageSquare  // <--- Untuk menu Chat
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Definisi Menu Lengkap Sesuai Revisi
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Input Modal / Pemakaian', href: '/input-modal', icon: PlusCircle },
    { name: 'Transfer Bank', href: '/transfer', icon: Send },
    { name: 'Transfer Debit', href: '/transfer-debit', icon: CreditCard },
    { name: 'Tarik Tunai', href: '/tarik-tunai', icon: Banknote },
    { name: 'Tarik Kartu Kredit', href: '/tarik-kredit', icon: CreditCard }, // Fitur Baru
    { name: 'Setor Tunai ke Admin', href: '/setor', icon: ArrowUpRight },
    { name: 'Biaya Lain-lain', href: '/biaya-lain', icon: DollarSign }, // Fitur Baru
    { name: 'Cetak Struk', href: '/cetak-struk', icon: Printer },       // Fitur Baru
    { name: 'Chat Group', href: '/chat', icon: MessageSquare },         // Fitur Baru
    { name: user?.role === 'owner' ? 'Laporan Lengkap' : 'Laporan Saya', href: '/laporan', icon: FileText },
  ];

  // Menu Khusus Owner
  const ownerNavigation = [
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Logs Aktivitas', href: '/logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto`}>
        
        {/* Logo Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b bg-blue-800 text-white">
          <div className="flex items-center font-bold text-lg">
            <CreditCard className="h-6 w-6 mr-2" />
            <span>BUKUKU</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info Profile */}
        <div className="px-6 py-6 border-b bg-blue-50">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-gray-900">{user?.username || 'Guest'}</p>
              <p className="text-xs text-gray-500 uppercase">{user?.role || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {/* Menu Umum */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Menu Khusus Owner */}
          {user?.role === 'owner' && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administrator
              </div>
              {ownerNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 flex items-center justify-between bg-white shadow-sm px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-gray-700">BUKUKU</span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
