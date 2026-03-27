import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, Plus, CreditCard, Target, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estado para controlar el Menú Rápido central
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para saber qué botón "pintar" de activo
  const isActive = (path) => location.pathname === path;

  // Si estamos en el Lobby (ruta "/"), la barra no se muestra
  if (location.pathname === '/') {
    return null; 
  }

  // Función para navegar y cerrar el menú al mismo tiempo
  const handleAction = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* 🟢 OVERLAY: MENÚ DE ACCIÓN RÁPIDA (Solo aparece si isMenuOpen es true) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end justify-center pb-32 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] w-[90%] max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-10 duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider">Acción Rápida</h3>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Botón 1: Ingreso */}
              <button onClick={() => handleAction('/ingresos')} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-[var(--color-neon-green)] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-[var(--color-neon-green)]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">Cargar Munición</p>
                  <p className="text-xs text-gray-500">Registrar un nuevo ingreso</p>
                </div>
              </button>

              {/* Botón 2: Gasto */}
              <button onClick={() => handleAction('/gastos')} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-[var(--color-alert-red)] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-alert-red)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6 text-[var(--color-alert-red)]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">Ejecutar Pago</p>
                  <p className="text-xs text-gray-500">Registrar baja o gasto</p>
                </div>
              </button>

              {/* Botón 3: Bóveda */}
              <button onClick={() => handleAction('/boveda')} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-[var(--color-neon-green)] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-[var(--color-neon-green)]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">Comprar Dólares</p>
                  <p className="text-xs text-gray-500">Enviar capital a La Bóveda</p>
                </div>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🟢 BARRA DE NAVEGACIÓN FLOTANTE */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-50 pointer-events-none">
        <nav className="bg-white dark:bg-[#1a1a1a] p-2 rounded-full flex items-center gap-2 shadow-2xl border border-gray-100 dark:border-gray-800 pointer-events-auto">
          
          {/* 1. Dashboard */}
          <Link to="/dashboard" className={`p-3 rounded-full transition-all duration-300 ${isActive('/dashboard') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}>
            <Home className="w-6 h-6" />
          </Link>

          {/* 2. Ingresos */}
          <Link to="/ingresos" className={`p-3 rounded-full transition-all duration-300 ${isActive('/ingresos') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}>
            <Wallet className="w-6 h-6" />
          </Link>
          
          {/* 3. BOTÓN CENTRAL (ABRE EL MENÚ) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={`p-3 mx-2 text-white dark:text-black rounded-full transform -translate-y-2 shadow-lg hover:scale-105 transition-all duration-300 ${isMenuOpen ? 'bg-gray-800 dark:bg-white rotate-45' : 'bg-black dark:bg-[var(--color-neon-green)]'}`}
          >
            <Plus className="w-6 h-6" />
          </button>
          
          {/* 4. Gastos */}
          <Link to="/gastos" className={`p-3 rounded-full transition-all duration-300 ${isActive('/gastos') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}>
            <CreditCard className="w-6 h-6" />
          </Link>

          {/* 5. La Bóveda */}
          <Link to="/boveda" className={`p-3 rounded-full transition-all duration-300 ${isActive('/boveda') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}>
            <Target className="w-6 h-6" />
          </Link>
          
        </nav>
      </div>
    </>
  );
};

export default BottomNav;