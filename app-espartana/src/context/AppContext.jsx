import React, { createContext, useContext, useState, useEffect } from 'react';

// Creamos el Cerebro
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. AISLAMIENTO DE BASES (Fase 2)
  // Leemos si ya había una base seleccionada guardada en la memoria del navegador
  const [baseId, setBaseId] = useState(() => localStorage.getItem('baseActiva') || null);
  const [baseNombre, setBaseNombre] = useState(() => localStorage.getItem('baseNombre') || '');

  // Cuando cambia la base, la guardamos para no perderla al recargar la página
  useEffect(() => {
    if (baseId) {
      localStorage.setItem('baseActiva', baseId);
      localStorage.setItem('baseNombre', baseNombre);
    } else {
      localStorage.removeItem('baseActiva');
      localStorage.removeItem('baseNombre');
    }
  }, [baseId, baseNombre]);

  // 2. EL MOTOR DEL TIEMPO (Fase 3)
  // Por defecto arranca en el mes y año en el que estamos (ej: Marzo 2026)
  const fechaHoy = new Date();
  const [mesActual, setMesActual] = useState(fechaHoy.getMonth()); // 0 = Ene, 11 = Dic
  const [anioActual, setAnioActual] = useState(fechaHoy.getFullYear());

  return (
    <AppContext.Provider value={{
      baseId, setBaseId,
      baseNombre, setBaseNombre,
      mesActual, setMesActual,
      anioActual, setAnioActual
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook táctico para usar este cerebro en cualquier parte de la app
export const useApp = () => useContext(AppContext);