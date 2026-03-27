import React, { useState, useEffect } from 'react';
import { CreditCard, Minus, ArrowUpRight, CheckCircle2, Loader2, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, getDoc, where } from 'firebase/firestore';
import ModalPremium from '../components/ModalPremium';
import { useApp } from '../context/AppContext'; // 🧠 CEREBRO GLOBAL
import SelectorTactico from '../components/SelectorTactico'; // 🚀 COMPONENTE PREMIUM

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const Gastos = () => {
  const navigate = useNavigate();
  // 🧠 CONEXIÓN AL CEREBRO
  const { baseId, baseNombre, mesActual, setMesActual, anioActual, setAnioActual } = useApp();

  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Listas que vienen de Ajustes
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]); // Frentes de batalla
  const [bancosDisponibles, setBancosDisponibles] = useState([]); // Cajas fuertes
  
  // ESTADOS DEL MODAL
  const [modalOpen, setModalOpen] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState(null);

  // ESTADOS DEL FORMULARIO
  const [monto, setMonto] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(''); // ID Categoría (Destino del gasto)
  const [bancoSeleccionado, setBancoSeleccionado] = useState(''); // ID Banco (Origen de la plata)
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

  // 1. CARGA INICIAL: ADN DE LA BASE + HISTORIAL
  useEffect(() => {
    if (!baseId) {
      navigate('/');
      return;
    }

    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        // A. Cargar Categorías y Bancos desde Ajustes
        const baseRef = await getDoc(doc(db, "bases", baseId));
        if (baseRef.exists()) {
          const data = baseRef.data();
          
          // Categorías (Frentes)
          const categoriasGuardadas = data.categorias || [];
          setCategoriasDisponibles(categoriasGuardadas);
          if (categoriasGuardadas.length > 0) setCategoriaSeleccionada(categoriasGuardadas[0].id);

          // Bancos (Origen de la plata)
          const bancosGuardados = data.bancos || [];
          setBancosDisponibles(bancosGuardados);
          if (bancosGuardados.length > 0) setBancoSeleccionado(bancosGuardados[0].id);
        }

        fetchGastos(); // B. Cargar historial
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    cargarDatosIniciales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseId, navigate, mesActual, anioActual]); // 🔄 Recarga si se cambia el mes

  // 2. FUNCIÓN PARA CARGAR HISTORIAL (Filtrado absoluto)
  const fetchGastos = async () => {
    try {
      setLoading(true);
      // Solo de ESTA base
      const q = query(collection(db, "gastos"), where("baseId", "==", baseId), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      
      const gastosData = [];
      querySnapshot.forEach(documento => {
        const data = documento.data();
        const fecha = data.fecha?.toDate();
        
        // 🚀 FILTRO ABSOLUTO: Solo el mes y año en pantalla
        if (fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
          gastosData.push({
            id: documento.id,
            ...data,
            fechaFormateada: fecha.toLocaleDateString('es-AR')
          });
        }
      });
      setGastos(gastosData);
    } catch (error) {
      console.error("Error al cargar gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. REGISTRAR UN NUEVO GASTO (BAJA)
  const handleRegistrarGasto = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto)) return alert("El monto debe ser un número válido.");
    if (!categoriaSeleccionada) return alert("Debes seleccionar un Frente Afectado (Categoría).");
    if (!bancoSeleccionado) return alert("Debes indicar de qué Caja Fuerte salió el dinero.");

    try {
      setLoading(true);
      
      // Rescatamos los nombres y emojis para guardarlos y mostrarlos fácil
      const catInfo = categoriasDisponibles.find(c => c.id === categoriaSeleccionada);
      const bancoInfo = bancosDisponibles.find(b => b.id === bancoSeleccionado);

      const nuevoGasto = {
        baseId: baseId, // 🧠 ADN Base
        monto: Number(monto),
        
        categoriaId: categoriaSeleccionada,
        categoriaNombre: catInfo?.nombre || 'Desconocido',
        categoriaEmoji: catInfo?.emoji || '🔥',
        categoriaColor: catInfo?.color || '#ef4444',
        
        bancoId: bancoSeleccionado,
        bancoNombre: bancoInfo?.nombre || 'Desconocido',
        
        descripcion: descripcion,
        // 🚀 FORZAMOS LA FECHA al mes actual en pantalla
        fecha: new Date(anioActual, mesActual, new Date().getDate()), 
        tipo: 'gasto'
      };

      await addDoc(collection(db, "gastos"), nuevoGasto);
      
      setMonto('');
      setDescripcion('');
      fetchGastos();
    } catch (error) {
      console.error("Error al registrar el gasto:", error);
      alert("Hubo un error al registrar la baja.");
    } finally {
      setLoading(false);
    }
  };

  // 4. LÓGICA DE ELIMINACIÓN
  const pedirConfirmacion = (id) => {
    setRegistroAEliminar(id);
    setModalOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!registroAEliminar) return;
    try {
      await deleteDoc(doc(db, "gastos", registroAEliminar));
      fetchGastos(); 
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setRegistroAEliminar(null); 
    }
  };

  return (
    <div className="pt-6 px-6 pb-32 animate-in slide-in-from-right-4 duration-500 min-h-screen relative">
      
      {/* 🚀 MODAL PREMIUM */}
      <ModalPremium 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={ejecutarEliminacion}
        title="¿Cancelar Baja?"
        message="Estás a punto de borrar este gasto. El capital volverá a tu munición total y los frentes de batalla se recalcularán."
        confirmText="Cancelar Baja"
        cancelText="Volver"
        variant="danger"
      />

      <header className="flex items-center gap-4 mb-6 relative z-10">
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

      {/* 🚀 SELECTOR DE MESES Y AÑOS */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-[#111] p-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
        <button onClick={mesAnterior} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase">
            {MESES[mesActual]} {anioActual}
          </h2>
          <p className="text-[10px] text-[var(--color-alert-red)] font-bold uppercase">{baseNombre}</p>
        </div>
        <button onClick={mesSiguiente} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8 relative z-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">Ejecutar Pago</h2>
        
        <form onSubmit={handleRegistrarGasto} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Daño Recibido ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-alert-red)] font-mono text-xl">-$</span>
              <input 
                required type="number" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-red-50 dark:bg-[var(--color-alert-red)]/10 border border-red-100 dark:border-red-900/30 text-[var(--color-alert-red)] font-mono text-2xl font-black rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-alert-red)] transition-colors"
              />
            </div>
          </div>

          {/* 🚀 SELECTOR TÁCTICO: ¿De qué banco salió la plata? */}
          <SelectorTactico 
            label="Origen (Salió de...)"
            opciones={bancosDisponibles}
            valorSeleccionado={bancoSeleccionado}
            onChange={setBancoSeleccionado}
            onAgregarNuevo={() => navigate('/ajustes')}
            textoAgregar="Crear"
          />

          {/* 🚀 SELECTOR TÁCTICO: ¿A qué categoría fue el gasto? */}
          <SelectorTactico 
            label="Destino (Frente Afectado)"
            opciones={categoriasDisponibles}
            valorSeleccionado={categoriaSeleccionada}
            onChange={setCategoriaSeleccionada}
            onAgregarNuevo={() => navigate('/ajustes')}
            textoAgregar="Crear"
          />

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nota Táctica (Opcional)</label>
            <input 
              type="text" placeholder="Ej: Supermercado, Luz..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl p-4 focus:outline-none focus:border-[var(--color-alert-red)] transition-colors"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-2 bg-[var(--color-alert-red)] text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Minus className="w-5 h-5" /> Confirmar Baja</>}
          </button>
        </form>
      </section>

      {/* HISTORIAL */}
      <section className="relative z-10">
        <div className="flex justify-between items-center mb-4 px-2">
          {/* 🚀 MES DINÁMICO */}
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Bajas de {MESES[mesActual]}</h3>
        </div>

        {loading && gastos.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[var(--color-alert-red)] animate-spin" />
          </div>
        ) : gastos.length === 0 ? (
           <div className="text-center py-8 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
             <p className="text-gray-500 text-sm">No hay bajas registradas en este mes.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {gastos.map((gasto) => (
              <div key={gasto.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                
                <div className="flex items-center gap-3 relative z-10">
                  {/* 🚀 EMOJI Y COLOR DE LA CATEGORÍA */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-opacity-10" style={{ backgroundColor: `${gasto.categoriaColor}20`, color: gasto.categoriaColor }}>
                    {gasto.categoriaEmoji || '🔥'}
                  </div>
                  <div>
                    {/* 🚀 ORIGEN Y DESTINO CLAROS */}
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">
                      {gasto.categoriaNombre} <span className="text-gray-500 font-normal text-xs ml-1">(de {gasto.bancoNombre})</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{gasto.fechaFormateada} {gasto.descripcion && `• ${gasto.descripcion}`}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="text-right">
                    <p className="font-mono font-black text-[var(--color-alert-red)]">-${gasto.monto.toLocaleString('es-AR')}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 text-[var(--color-alert-red)]/50" />
                      <span className="text-[10px] text-gray-500 uppercase font-bold">Ejecutado</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => pedirConfirmacion(gasto.id)}
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

export default Gastos;