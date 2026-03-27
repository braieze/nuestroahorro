import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import BottomNav from './components/BottomNav';
import ProjectLobby from './pages/ProjectLobby';
import Dashboard from './pages/Dashboard'; // <-- IMPORTAMOS EL NUEVO DASHBOARD

// Componente temporal para las rutas que aún nos faltan armar
const PantallaEnConstruccion = ({ titulo }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
    <h1 className="text-3xl font-black uppercase tracking-widest text-gray-800 dark:text-white mb-2">{titulo}</h1>
    <p className="text-gray-500 dark:text-[var(--color-neon-green)]">Sector en desarrollo...</p>
  </div>
);

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <div className={`${isDarkMode ? 'dark' : ''} transition-colors duration-500`}>
        
        <div className="bg-gray-50 dark:bg-[var(--color-dark-base)] min-h-screen font-sans text-gray-900 dark:text-white relative pb-28">

          {/* BOTÓN DE TEMA PROFESIONAL */}
          <button
            onClick={toggleTheme}
            className="absolute top-6 right-6 z-50 p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-md border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-[var(--color-neon-green)] hover:scale-110 transition-transform duration-300"
            aria-label="Alternar Tema"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* EL ENRUTADOR DE BATALLA */}
          <Routes>
            <Route path="/" element={<ProjectLobby />} />
            
            {/* ACÁ ENCHUFAMOS EL DASHBOARD REAL */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/ingresos" element={<PantallaEnConstruccion titulo="Armada Dinámica (Ingresos)" />} />
            <Route path="/gastos" element={<PantallaEnConstruccion titulo="Trincheras (Gastos y Deuda)" />} />
            <Route path="/boveda" element={<PantallaEnConstruccion titulo="La Bóveda (Ahorro)" />} />
            <Route path="/registro" element={<PantallaEnConstruccion titulo="Nuevo Registro (+)" />} />
          </Routes>

          {/* LA BARRA FLOTANTE */}
          <BottomNav />

        </div>
      </div>
    </Router>
  );
}

export default App;