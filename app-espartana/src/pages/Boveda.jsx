import React, { useState, useEffect } from 'react';
import { Target, Plus, ArrowUpRight, CheckCircle2, Loader2, ArrowLeft, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

const Boveda = () => {
  const navigate = useNavigate();
  const [ahorros, setAhorros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsd, setTotalUsd] = useState(0);
  
  // Objetivo Táctico
  const META_USD = 6649;

  // Estado del Formulario
  const [montoUsd, setMontoUsd] = useState('');
  const [cotizacion, setCotizacion] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // 1. LEER DE FIREBASE
  const fetchBoveda = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "boveda"), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      
      let sumaTotal = 0;
      const ahorrosData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        sumaTotal += data.montoUsd;
        return {
          id: doc.id,
          ...data,
          fechaFormateada: data.fecha?.toDate().toLocaleDateString('es-AR') || 'Reciente'
        };
      });
      
      setAhorros(ahorrosData);
      setTotalUsd(sumaTotal);
    } catch (error) {
      console.error("Error al cargar la bóveda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoveda();
  }, []);

  // 2. ESCRIBIR EN FIREBASE
  const handleRegistrarAhorro = async (e) => {
    e.preventDefault();
    if (!montoUsd || isNaN(montoUsd)) return alert("El monto en USD debe ser válido.");

    try {
      setLoading(true);
      const nuevoAhorro = {
        montoUsd: Number(montoUsd),
        cotizacion: Number(cotizacion) || 0, // Opcional, por si querés saber a cuánto lo pagaste
        descripcion: descripcion || 'Compra de USD',
        fecha: new Date(),
        tipo: 'ahorro'
      };

      await addDoc(collection(db, "boveda"), nuevoAhorro);
      
      setMontoUsd('');
      setCotizacion('');
      setDescripcion('');
      fetchBoveda();
    } catch (error) {
      console.error("Error al guardar en la bóveda:", error);
      alert("Hubo un error de conexión con la Bóveda.");
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de la barra de progreso
  const porcentajeAvance = Math.min((totalUsd / META_USD) * 100, 100).toFixed(1);

  return (
    <div className="pt-6 px-6 pb-32 animate-in slide-in-from-right-4 duration-500 min-h-screen">
      
      {/* CABECERA */}
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-[var(--color-neon-green)]" />
            La Bóveda
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Acumulación Dólar</p>
        </div>
      </header>

      {/* ESTADO DE LA MISIÓN (PROGRESO) */}
      <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-neon-green)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Capital Asegurado</p>
        <div className="flex items-baseline gap-2 mb-6 relative z-10">
          <span className="text-2xl text-[var(--color-neon-green)] font-mono font-bold">USD</span>
          <h2 className="text-5xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
            {totalUsd.toLocaleString('es-AR')}
          </h2>
        </div>

        {/* Barra de Progreso */}
        <div className="relative z-10">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className="text-gray-500">Progreso: {porcentajeAvance}%</span>
            <span className="text-gray-400">Meta: {META_USD}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-neon-green)] rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${porcentajeAvance}%` }}
            >
              {/* Brillo de la barra */}
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE COMPRA */}
      <section className="bg-white dark:bg-[var(--color-dark-card)] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Registrar Compra / Ingreso</h2>
        
        <form onSubmit={handleRegistrarAhorro} className="space-y-4">
          
          <div className="flex gap-4">
            {/* Monto USD */}
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cantidad (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neon-green)] font-mono">$</span>
                <input 
                  required type="number" step="0.01" placeholder="0.00"
                  value={montoUsd} onChange={(e) => setMontoUsd(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-[var(--color-neon-green)] font-mono text-xl font-black rounded-xl py-3 pl-8 pr-3 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
                />
              </div>
            </div>

            {/* Cotización (Opcional) */}
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cotización (ARS)</label>
              <input 
                type="number" placeholder="Ej: 1050"
                value={cotizacion} onChange={(e) => setCotizacion(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-mono rounded-xl p-3 focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Origen / Nota</label>
            <input 
              type="text" placeholder="Ej: Compra MEP / Aguinaldo..."
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 bg-black dark:bg-[var(--color-neon-green)] text-white dark:text-black font-black uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Blindar Capital</>}
          </button>
        </form>
      </section>

      {/* HISTORIAL DE LA BÓVEDA */}
      <section>
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 px-2">Movimientos</h3>

        {loading && ahorros.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[var(--color-neon-green)] animate-spin" />
          </div>
        ) : ahorros.length === 0 ? (
           <div className="text-center py-8 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
             <p className="text-gray-500 text-sm">La bóveda está vacía. ¡Iniciá la acumulación!</p>
           </div>
        ) : (
          <div className="space-y-3">
            {ahorros.map((ahorro) => (
              <div key={ahorro.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[var(--color-neon-green)]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{ahorro.descripcion}</p>
                    <p className="text-xs text-gray-500">
                      {ahorro.fechaFormateada} 
                      {ahorro.cotizacion > 0 && ` • TC: $${ahorro.cotizacion}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-[var(--color-neon-green)]">+ USD {ahorro.montoUsd}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--color-neon-green)]" />
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Asegurado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Boveda;