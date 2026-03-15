import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import CarListWithStatus from './components/CarListWithStatus'; // ← PROMIJENI OVO!
import Contact from './components/Contact';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';

function App() {
  const [view, setView] = useState('user');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminUser');
    
    if (token && savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
      setView('admin-panel');
    }
  }, []);

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    setView('admin-panel');
  };

  const handleLogout = () => {
    setAdmin(null);
    setView('admin-login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigacija - ISTO KAO RANIJE */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        view === 'user' ? 'bg-transparent' : 'bg-white shadow-lg'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className={`text-xl font-bold ${
              view === 'user' ? 'text-white' : 'text-gray-800'
            }`}>
              🚗 Rent-a-Car
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setView('user')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  view === 'user' 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🏠 Početna
              </button>
              
              {view === 'admin-panel' ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  🚪 Odjavi se
                </button>
              ) : (
                <button
                  onClick={() => setView('admin-login')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    view === 'admin-login' 
                      ? 'bg-blue-600 text-white' 
                      : view === 'user' 
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  👤 Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Glavni sadržaj */}
      <main className="flex-grow">
        {view === 'user' && (
          <>
            <HeroSection />
            <CarListWithStatus /> {/* ← OVDJE KORISTIMO NOVU KOMPONENTU */}
            <Contact />
          </>
        )}
        {view === 'admin-login' && <AdminLogin onLogin={handleLogin} />}
        {view === 'admin-panel' && admin && (
          <AdminPanel admin={admin} onLogout={handleLogout} />
        )}
      </main>

      {/* Footer */}
      {view === 'user' && <Footer />}
    </div>
  );
}

export default App;