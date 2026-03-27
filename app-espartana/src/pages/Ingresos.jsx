import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDownCircle, CheckCircle2, Loader2, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, getDoc, where } from 'firebase/firestore';
import ModalPremium from '../components/ModalPremium';
import { useApp } from '../context/AppContext'; // CEREBRO GLOBAL
import SelectorTactico from '../components/SelectorTactico'; // COMPONENTE PREMIUM

// Constante para los nombres de los meses
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const Ingresos = () => {
  const navigate = useNavigate();
  // 🧠 Agregamos baseNombre y los seteadores del tiempo que faltaban
  const { baseId, baseNombre, mesActual, setMesActual, anioActual, setAnioActual } = useApp(); 

  const [ingresos, setIngresos] = useState([]);
  const [bancosDisponibles, setBancosDisponibles] = useState([]);
  const [fuentesDisponibles, setFuentesDisponibles] = useState([]); // Orígenes de ingreso
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DEL MODAL DE BORRADO
  const [modalOpen, setModalOpen] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState(null);

  // ESTADOS DEL FORMULARIO
  const [monto, setMonto] = useState('');
  const [bancoSeleccionado, setBancoSeleccionado] = useState(''); // ID del banco destino
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(''); // ID del origen
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

  // 1. CARGA INICIAL: TRAEMOS LOS BANCOS, ORÍGENES Y EL HISTORIAL
  useEffect(() => {
    if (!baseId) {
      navigate('/');
      return;
    }

    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        // A. Cargar los bancos y fuentes desde Ajustes (Sala de Guerra)
        const baseRef = await getDoc(doc(db, "bases", baseId));
        if (baseRef.exists()) {
          const data = baseRef.data();
          
          // Bancos (Destino)
          const bancosGuardados = data.bancos || [];
          setBancosDisponibles(bancosGuardados);
          if (bancosGuardados.length > 0) setBancoSeleccionado(bancosGuardados[0].id);

          // Fuentes (Origen)
          const fuentesGuardadas = data.categoriasIngreso || [];
          setFuentesDisponibles(fuentesGuardadas);
          if (fuentesGuardadas.length > 0) setFuenteSeleccionada(fuentesGuardadas[0].id);
        }

        fetchIngresos(); // Llamamos a la carga del historial
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    cargarDatosIniciales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseId, navigate, mesActual, anioActual]); // 🔄 Recarga automática si cambiás de mes

  // 2. FUNCIÓN PARA CARGAR HISTORIAL (Filtrado por mes)
  const fetchIngresos = async () => {
    try {
      setLoading(true);
      // Filtramos solo los ingresos de ESTA base
      const q = query(collection(db, "ingresos"), where("baseId", "==", baseId), orderBy("fecha", "desc"));
      const querySnapshot = await getDocs(q);
      
      const ingresosData = [];
      querySnapshot.forEach(documento => {
        const data = documento.data();
        const fecha = data.fecha?.toDate();
        
        // 🚀 FILTRO ABSOLUTO: Solo cargamos la plata de este mes y este año
        if (fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
          ingresosData.push({
            id: documento.id,
            ...data,
            fechaFormateada: fecha.toLocaleDateString('es-AR')
          });
        }
      });
      setIngresos(ingresosData);
    } catch (error) {
      console.error("Error al cargar ingresos:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. REGISTRAR UN NUEVO INGRESO
  const handleRegistrarIngreso = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto)) return alert("El monto debe ser un número válido.");
    if (!bancoSeleccionado) return alert("Debes seleccionar una Caja Fuerte (Destino).");
    if (!fuenteSeleccionada) return alert("Debes seleccionar un Origen de ingreso.");

    try {
      setLoading(true);
      
      // Buscamos los datos completos para guardarlos en el historial
      const bancoInfo = bancosDisponibles.find(b => b.id === bancoSeleccionado);
      const fuenteInfo = fuentesDisponibles.find(f => f.id === fuenteSeleccionada);

      const nuevoIngreso = {
        baseId: baseId, // 🧠 GUARDAMOS EL ADN DE LA BASE
        monto: Number(monto),
        bancoId: bancoSeleccionado,
        bancoNombre: bancoInfo?.nombre || 'Desconocido',
        fuenteId: fuenteSeleccionada,
        fuenteNombre: fuenteInfo?.nombre || 'Desconocido',
        fuenteEmoji: fuenteInfo?.emoji || '💰',
        descripcion: descripcion,
        // 🚀 FORZAMOS LA FECHA para que se guarde en el mes que estás viendo en pantalla
        fecha: new Date(anioActual, mesActual, new Date().getDate()), 
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

  // 4. LÓGICA DE ELIMINACIÓN
  const pedirConfirmacion = (id) => {
    setRegistroAEliminar(id);
    setModalOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!registroAEliminar) return;
    try {
      await deleteDoc(doc(db, "ingresos", registroAEliminar));
      fetchIngresos(); 
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setRegistroAEliminar(null); 
    }
  };

  return (
    <div className="pt-6 px-6 pb-32 animate-in slide-in-from-right-4 duration-500 min-h-screen relative">
      
      <ModalPremium 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={ejecutarEliminacion}
        title="¿Eliminar Munición?"
        message="Estás a punto de borrar este ingreso del registro. Esta acción recalculará tu munición total y no se puede deshacer."
        confirmText="Eliminar Registro"
        cancelText="Cancelar"
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
            <Wallet className="w-6 h-6 text-[var(--color-neon-green)]" />
            Armada Dinámica
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Carga de Munición</p>
        </div>
      </header>

      {/* 🚀 SELECTOR DE MESES Y AÑOS EN INGRESOS */}
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

      <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg mb-8 relative z-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">Registrar Ingreso</h2>
        
        <form onSubmit={handleRegistrarIngreso} className="space-y-6">
          
          {/* CAMPO DE MONTO */}
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

          {/* 🚀 SELECTOR TÁCTICO DE ORIGEN (Sueldo, Aguinaldo, etc) */}
          <SelectorTactico 
            label="Origen (Fuente de Ingreso)"
            opciones={fuentesDisponibles}
            valorSeleccionado={fuenteSeleccionada}
            onChange={setFuenteSeleccionada}
            onAgregarNuevo={() => navigate('/ajustes')} 
            textoAgregar="Crear"
          />

          {/* 🚀 SELECTOR TÁCTICO DE DESTINO (Bancos) */}
          <SelectorTactico 
            label="Destino (Caja Fuerte)"
            opciones={bancosDisponibles}
            valorSeleccionado={bancoSeleccionado}
            onChange={setBancoSeleccionado}
            onAgregarNuevo={() => navigate('/ajustes')} 
            textoAgregar="Crear"
          />

          {/* CAMPO DE NOTA */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nota Táctica (Opcional)</label>
            <input 
              type="text" placeholder="Ej: Adelanto, Quincena..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
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

      <section className="relative z-10">
        <div className="flex justify-between items-center mb-4 px-2">
          {/* 🚀 TEXTO DINÁMICO CON EL MES ACTUAL */}
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Cargas de {MESES[mesActual]}</h3>
        </div>

        {loading && ingresos.length === 0 ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[var(--color-neon-green)] animate-spin" />
          </div>
        ) : ingresos.length === 0 ? (
           <div className="text-center py-8 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
             <p className="text-gray-500 text-sm">No hay ingresos registrados en este mes.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {ingresos.map((ingreso) => (
              <div key={ingreso.id} className="flex justify-between items-center p-4 bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-neon-green)]/10 flex items-center justify-center text-xl">
                    {/* 🚀 MUESTRA EL EMOJI QUE DEFINISTE EN AJUSTES */}
                    {ingreso.fuenteEmoji || '💰'}
                  </div>
                  <div>
                    {/* 🚀 MUESTRA "SUELDO -> MERCADO PAGO" */}
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">
                      {ingreso.fuenteNombre} → <span className="text-gray-500 font-normal">{ingreso.bancoNombre}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{ingreso.fechaFormateada} {ingreso.descripcion && `• ${ingreso.descripcion}`}</p>
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
                  
                  <button 
                    onClick={() => pedirConfirmacion(ingreso.id)}
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