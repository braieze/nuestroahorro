import React, { useState, useEffect } from 'react';
import { CreditCard, Minus, ArrowUpRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const Gastos = () => {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del Formulario
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Fondo de Vida');
  const [descripcion, setDescripcion] = useState('');

  // 1. LEER DE FIREBASE: Traer los últimos 5 gastos
  const fetchGastos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "gastos"), orderBy("fecha", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      
      const gastosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaFormateada: doc.data().fecha?.toDate().toLocaleDateString('es-AR') || 'Reciente'
      }));
      setGastos(gastosData);
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  // 2. ESCRIBIR EN FIREBASE: Registrar un nuevo gasto
  const handleRegistrarGasto = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto)) return alert("El monto debe ser un número válido.");

    try {
      setLoading(true);
      const nuevoGasto = {
        monto: Number(monto),
        categoria: categoria,
        descripcion: descripcion,
        fecha: new Date(),
        tipo: 'gasto'
      };

      await addDoc(collection(db, "gastos"), nuevoGasto);
      
      setMonto('');
      setDescripcion('');
      fetchGastos();
    } catch (error) {
      console.error("Error al registrar el gasto:", error);
      alert("Hubo un error al registrar el gasto. Revisá la conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 px-6 pb-32 animate-in slide-in-from-right-4 duration-500 min-h-screen">
      
      {/* CABECERA */}
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[var(--color-alert-red)]" />
            Trincheras
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Registro de Bajas</p>
        </div>
      </header>

      {/* FORMULARIO DE CARGA */}
      <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">Ejecutar Pago</h2>
        
        <form onSubmit={handleRegistrarGasto} className="space-y-5">
          
          {/* Campo: Monto */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Daño Recibido ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-alert-red)] font-mono text-xl">-$</span>
              <input 
                required
                type="number" 
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-red-50 dark:bg-[var(--color-alert-red)]/10 border border-red-100 dark:border-red-900/30 text-[var(--color-alert-red)] font-mono text-2xl font-black rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-alert-red)] transition-colors"
              />
            </div>
          </div>

          {/* Campo: Categoría (Selector) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Frente Afectado</label>
            <select 
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl p-4 font-bold focus:outline-none focus:border-[var(--color-alert-red)] transition-colors appearance-none"
            >
              <option value="Fondo de Vida">🏠 Fondo de Vida (Comida, salidas...)</option>
              <option value="Deuda UAI">💳 Deuda UAI (Cuota / Adelanto)</option>
              <option value="Quinta San Jose">🏖️ Quinta San José (Reserva)</option>
              <option value="Impuestos">📄 Impuestos / Servicios</option>
              <option value="Otros">🔥 Otros Daños</option>
            </select>
          </div>

          {/* Campo: Descripción */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nota Táctica (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ej: Supermercado Coto..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl p-4 focus:outline-none focus:border-[var(--color-alert-red)] transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-[var(--color-alert-red)] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Minus className="w-5 h-5" /> Confirmar Baja</>}
          </button>
        </form>
      </section>

      {/* HISTORIAL RECIENTE */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Últimos Daños</h3>
          <button className="text-xs text-[var(--color-alert-red)] font-bold uppercase tracking-wider hover:opacity-80">Ver Todo</button>
        </div>

        {loading && gastos.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[var(--color-alert-red)] animate-spin" />
          </div>
        ) : gastos.length === 0 ? (
           <div className="text-center py-8 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
             <p className="text-gray-500 text-sm">No hay bajas registradas aún.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {gastos.map((gasto) => (
              <div key={gasto.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-alert-red)]/10 flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-[var(--color-alert-red)]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{gasto.categoria}</p>
                    <p className="text-xs text-gray-500">{gasto.fechaFormateada} {gasto.descripcion && `• ${gasto.descripcion}`}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-[var(--color-alert-red)]">-${gasto.monto.toLocaleString('es-AR')}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-[var(--color-alert-red)]/50" />
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Ejecutado</span>
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

export default Gastos;