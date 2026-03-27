import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDownCircle, CheckCircle2, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

const Ingresos = () => {
  const navigate = useNavigate();
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [monto, setMonto] = useState('');
  const [fuente, setFuente] = useState('Montpellier');
  const [descripcion, setDescripcion] = useState('');

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "ingresos"), orderBy("fecha", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      
      const ingresosData = querySnapshot.docs.map(documento => ({
        id: documento.id,
        ...documento.data(),
        fechaFormateada: documento.data().fecha?.toDate().toLocaleDateString('es-AR') || 'Reciente'
      }));
      setIngresos(ingresosData);
    } catch (error) {
      console.error("Error al cargar ingresos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngresos();
  }, []);

  const handleRegistrarIngreso = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto)) return alert("El monto debe ser un número válido.");

    try {
      setLoading(true);
      const nuevoIngreso = {
        monto: Number(monto),
        fuente: fuente,
        descripcion: descripcion,
        fecha: new Date(),
        tipo: 'ingreso'
      };

      await addDoc(collection(db, "ingresos"), nuevoIngreso);
      
      setMonto('');
      setDescripcion('');
      fetchIngresos();
    } catch (error) {
      console.error("Error al registrar el ingreso:", error);
      alert("Hubo un error al registrar el ingreso.");
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIÓN TÁCTICA: Eliminar un registro
  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de eliminar este registro? Esto afectará tu munición total.");
    if (confirmar) {
      try {
        await deleteDoc(doc(db, "ingresos", id));
        fetchIngresos(); // Recargamos la lista después de borrar
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="pt-6 px-6 pb-32 animate-in slide-in-from-right-4 duration-500 min-h-screen">
      
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[var(--color-neon-green)]" />
            Armada Dinámica
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Carga de Munición</p>
        </div>
      </header>

      <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">Registrar Ingreso</h2>
        
        <form onSubmit={handleRegistrarIngreso} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Poder de Fuego ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xl">$</span>
              <input 
                required type="number" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-[var(--color-neon-green)] font-mono text-2xl font-black rounded-2xl py-4 pl-10 pr-4 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Origen (Armada)</label>
            <select 
              value={fuente} onChange={(e) => setFuente(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl p-4 font-bold focus:outline-none focus:border-[var(--color-neon-green)] transition-colors appearance-none"
            >
              <option value="Montpellier">🏥 Montpellier (Sueldo)</option>
              <option value="El Circulo">🛡️ El Círculo (Sueldo)</option>
              <option value="Horas Extras">⏱️ Horas Extras</option>
              <option value="Aguinaldo">🚀 Aguinaldo (Misil)</option>
              <option value="Otro">💰 Otro Ingreso</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nota Táctica (Opcional)</label>
            <input 
              type="text" placeholder="Ej: Cobro adelantado..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl p-4 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 bg-black dark:bg-[var(--color-neon-green)] text-white dark:text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Cargar Munición</>}
          </button>
        </form>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Últimas Cargas</h3>
        </div>

        {loading && ingresos.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[var(--color-neon-green)] animate-spin" />
          </div>
        ) : ingresos.length === 0 ? (
           <div className="text-center py-8 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
             <p className="text-gray-500 text-sm">No hay ingresos registrados aún.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {ingresos.map((ingreso) => (
              <div key={ingreso.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 text-[var(--color-neon-green)]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{ingreso.fuente}</p>
                    <p className="text-xs text-gray-500">{ingreso.fechaFormateada} {ingreso.descripcion && `• ${ingreso.descripcion}`}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-right">
                    <p className="font-mono font-black text-[var(--color-neon-green)]">+${ingreso.monto.toLocaleString('es-AR')}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-neon-green)]" />
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Acreditado</span>
                    </div>
                  </div>
                  
                  {/* BOTÓN ELIMINAR */}
                  <button 
                    onClick={() => handleEliminar(ingreso.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Ingresos;