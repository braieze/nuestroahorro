import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Plus, CreditCard, Target } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  // Función para saber qué botón "pintar" de activo
  const isActive = (path) => location.pathname === path;

  // REGLA TÁCTICA: Si estamos en el Lobby (ruta "/"), la barra desaparece.
  if (location.pathname === '/') {
    return null; 
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-center z-50">
      
      <nav className="bg-white dark:bg-[#1a1a1a] p-2 rounded-full flex items-center gap-2 shadow-2xl border border-gray-100 dark:border-gray-800">
        
        {/* 1. Dashboard / Home */}
        <Link 
          to="/dashboard" 
          className={`p-3 rounded-full transition-all duration-300 ${isActive('/dashboard') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
        >
          <Home className="w-6 h-6" />
        </Link>

        {/* 2. Ingresos / Armada Dinámica */}
        <Link 
          to="/ingresos" 
          className={`p-3 rounded-full transition-all duration-300 ${isActive('/ingresos') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
        >
          <Wallet className="w-6 h-6" />
        </Link>
        
        {/* 3. Botón Central Flotante (+) */}
        <Link 
          to="/registro" 
          className="p-3 mx-2 bg-black dark:bg-[var(--color-neon-green)] text-white dark:text-black rounded-full transform -translate-y-2 shadow-lg hover:scale-105 transition-transform duration-300"
        >
          <Plus className="w-6 h-6" />
        </Link>
        
        {/* 4. Gastos / Trincheras */}
        <Link 
          to="/gastos" 
          className={`p-3 rounded-full transition-all duration-300 ${isActive('/gastos') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
        >
          <CreditCard className="w-6 h-6" />
        </Link>

        {/* 5. La Bóveda / Metas */}
        <Link 
          to="/boveda" 
          className={`p-3 rounded-full transition-all duration-300 ${isActive('/boveda') ? 'bg-gray-100 dark:bg-white/10 text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
        >
          <Target className="w-6 h-6" />
        </Link>
        
      </nav>
    </div>
  );
};

export default BottomNav;