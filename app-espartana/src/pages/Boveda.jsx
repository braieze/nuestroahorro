import React, { useState, useEffect } from 'react';
import { Target, Plus, ArrowUpRight, CheckCircle2, Loader2, ArrowLeft, DollarSign, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, getDoc, where } from 'firebase/firestore';
import ModalPremium from '../components/ModalPremium'; // 🚀 MODAL DE ÉLITE
import { useApp } from '../context/AppContext'; // 🧠 CEREBRO GLOBAL

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const Boveda = () => {
  const navigate = useNavigate();
  // 🧠 CONECTAMOS AL CEREBRO GLOBAL
  const { baseId, baseNombre, mesActual, setMesActual, anioActual, setAnioActual } = useApp();

  const [ahorros, setAhorros] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Totales
  const [totalUsdAcumulado, setTotalUsdAcumulado] = useState(0); // Acumulado de siempre (para la barra)
  const [metaBoveda, setMetaBoveda] = useState(6649); // Traída de ajustes

  // Estados del Modal de Borrado
  const [modalOpen, setModalOpen] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState(null);

  // Estado del Formulario
  const [montoUsd, setMontoUsd] = useState('');
  const [cotizacion, setCotizacion] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // ⏱️ FUNCIONES DEL MOTOR DEL TIEMPO
  const mesAnterior = () => {
    if (mesActual === 0) { setMesActual(11); setAnioActual(anioActual - 1); } 
    else { setMesActual(mesActual - 1); }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAnioActual(anioActual + 1); } 
    else { setMesActual(mesActual + 1); }
  };

  // 1. CARGAR ADN DE LA BASE (La meta en USD)
  useEffect(() => {
    if (!baseId) {
      navigate('/');
      return;
    }

    const cargarMeta = async () => {
      const docSnap = await getDoc(doc(db, "bases", baseId));
      if (docSnap.exists() && docSnap.data().metaUsd) {
        setMetaBoveda(docSnap.data().metaUsd);
      }
      fetchBoveda();
    };

    cargarMeta();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseId, navigate, mesActual, anioActual]); // Recarga si cambia el mes

  // 2. LEER DE FIREBASE (Filtrado para el historial, global para el saldo)
  const fetchBoveda = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "boveda"), where("baseId", "==", baseId), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      
      let sumaTotalHistorica = 0;
      const ahorrosDelMes = [];

      querySnapshot.forEach(documento => {
        const data = documento.data();
        const fecha = data.fecha?.toDate();
        
        // Sumamos absolutamente todo para el porcentaje general de la bóveda
        sumaTotalHistorica += data.montoUsd;

        // 🚀 FILTRO ABSOLUTO: Para la lista, solo guardamos los de este mes
        if (fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
          ahorrosDelMes.push({
            id: documento.id,
            ...data,
            fechaFormateada: fecha.toLocaleDateString('es-AR')
          });
        }
      });
      
      setAhorros(ahorrosDelMes); // Lista filtrada (ej: Solo los de Marzo)
      setTotalUsdAcumulado(sumaTotalHistorica); // El verde gigante es tu plata real histórica
    } catch (error) {
      console.error("Error al cargar la bóveda:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. ESCRIBIR EN FIREBASE
  const handleRegistrarAhorro = async (e) => {
    e.preventDefault();
    if (!montoUsd || isNaN(montoUsd)) return alert("El monto en USD debe ser válido.");

    try {
      setLoading(true);
      const nuevoAhorro = {
        baseId: baseId, // 🧠 GUARDAMOS EL ADN
        montoUsd: Number(montoUsd),
        cotizacion: Number(cotizacion) || 0,
        descripcion: descripcion || 'Compra de USD',
        // 🚀 FORZAMOS AL MES ACTUAL EN PANTALLA
        fecha: new Date(anioActual, mesActual, new Date().getDate()), 
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

  // 4. LÓGICA DE BORRADO DE ÉLITE
  const pedirConfirmacion = (id) => {
    setRegistroAEliminar(id);
    setModalOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!registroAEliminar) return;
    try {
      await deleteDoc(doc(db, "boveda", registroAEliminar));
      fetchBoveda(); 
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setRegistroAEliminar(null); 
    }
  };

  // Cálculo de la barra de progreso
  const porcentajeAvance = metaBoveda > 0 ? Math.min((totalUsdAcumulado / metaBoveda) * 100, 100).toFixed(1) : 0;

  return (
    <div className="pt-6 px-6 pb-32 animate-in slide-in-from-right-4 duration-500 min-h-screen relative">
      
      {/* 🚀 MODAL DE DESTRUCCIÓN */}
      <ModalPremium 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={ejecutarEliminacion}
        title="¿Anular Compra?"
        message="Estás a punto de borrar este registro de ahorro. Los USD se descontarán de tu Bóveda."
        confirmText="Eliminar Registro"
        cancelText="Volver"
        variant="danger"
      />

      {/* CABECERA */}
      <header className="flex items-center gap-4 mb-6 relative z-10">
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

      {/* 🚀 SELECTOR DE MESES Y AÑOS */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-[#111] p-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
        <button onClick={mesAnterior} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase">
            {MESES[mesActual]} {anioActual}
          </h2>
          <p className="text-[10px] text-[var(--color-neon-green)] font-bold uppercase">{baseNombre}</p>
        </div>
        <button onClick={mesSiguiente} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* ESTADO DE LA MISIÓN (PROGRESO ACUMULADO) */}
      <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8 relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-neon-green)] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Capital Asegurado Total</p>
        <div className="flex items-baseline gap-2 mb-6 relative z-10">
          <span className="text-2xl text-[var(--color-neon-green)] font-mono font-bold">USD</span>
          <h2 className="text-5xl font-black text-gray-900 dark:text-white font-mono tracking-tight">
            {totalUsdAcumulado.toLocaleString('es-AR')}
          </h2>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className="text-gray-500">Progreso: {porcentajeAvance}%</span>
            <span className="text-gray-400">Meta: {metaBoveda}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--color-neon-green)] rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${porcentajeAvance}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE COMPRA */}
      <section className="bg-white dark:bg-[var(--color-dark-card)] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mb-8 relative z-10">
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-6">Registrar Compra</h2>
        
        <form onSubmit={handleRegistrarAhorro} className="space-y-4">
          <div className="flex gap-4">
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

            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cotización (ARS)</label>
              <input 
                type="number" placeholder="Ej: 1050"
                value={cotizacion} onChange={(e) => setCotizacion(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-mono rounded-xl p-3 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Origen / Nota</label>
            <input 
              type="text" placeholder="Ej: Compra MEP / Aguinaldo..."
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
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

      {/* HISTORIAL FILTRADO */}
      <section className="relative z-10">
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4 px-2">Movimientos de {MESES[mesActual]}</h3>

        {loading && ahorros.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[var(--color-neon-green)] animate-spin" />
          </div>
        ) : ahorros.length === 0 ? (
           <div className="text-center py-8 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
             <p className="text-gray-500 text-sm">No compraste dólares en este mes.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {ahorros.map((ahorro) => (
              <div key={ahorro.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group">
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
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-black text-[var(--color-neon-green)]">+ USD {ahorro.montoUsd}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-neon-green)]" />
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Asegurado</span>
                    </div>
                  </div>
                  
                  {/* 🚀 BOTÓN BORRAR DE ÉLITE */}
                  <button 
                    onClick={() => pedirConfirmacion(ahorro.id)}
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

export default Boveda;