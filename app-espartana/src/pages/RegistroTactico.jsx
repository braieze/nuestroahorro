import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function RegistroTactico() {
  const [tipo, setTipo] = useState('egreso');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [estado, setEstado] = useState('');
  
  // NUEVO: Estado para guardar las categorías que vienen de Firebase
  const [categoriasDB, setCategoriasDB] = useState({ ingresos: [], egresos: [] });

  // NUEVO: Cargar categorías desde Firebase al abrir la pantalla
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        const ingresos = [];
        const egresos = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.tipo === 'ingreso') ingresos.push(data.nombre);
          if (data.tipo === 'egreso') egresos.push(data.nombre);
        });
        
        // Ordenamos alfabéticamente para que sea más fácil buscar
        setCategoriasDB({ 
          ingresos: ingresos.sort(), 
          egresos: egresos.sort() 
        });
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    
    cargarCategorias();
  }, []);

  const guardarMovimiento = async (e) => {
    e.preventDefault();
    setEstado('Cargando munición...');

    try {
      await addDoc(collection(db, "movimientos"), {
        fecha: new Date().toISOString(),
        tipo,
        categoria,
        monto: Number(monto),
        detalle
      });
      
      setEstado('¡Disparo ejecutado! Movimiento guardado.');
      setMonto('');
      setDetalle('');
      setCategoria('');
      
      setTimeout(() => setEstado(''), 3000);
    } catch (error) {
      console.error(error);
      setEstado('Error en el sistema.');
    }
  };

  const opcionesCategoria = tipo === 'ingreso' ? categoriasDB.ingresos : categoriasDB.egresos;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 mt-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Registro Táctico</h2>
        
        <form onSubmit={guardarMovimiento} className="space-y-4">
          
          {/* Selector de Tipo */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => { setTipo('ingreso'); setCategoria(''); }}
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${tipo === 'ingreso' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500'}`}
            >
              Ingreso (+)
            </button>
            <button
              type="button"
              onClick={() => { setTipo('egreso'); setCategoria(''); }}
              className={`flex-1 py-2 rounded-md font-semibold text-sm transition-all ${tipo === 'egreso' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500'}`}
            >
              Egreso (-)
            </button>
          </div>

          {/* Selector Dinámico de Categoría (AHORA LEE DE FIREBASE) */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Categoría Oficial</label>
            <select 
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="" disabled>Seleccioná el objetivo</option>
              {opcionesCategoria.length === 0 ? (
                <option value="" disabled>Cargando categorías...</option>
              ) : (
                opcionesCategoria.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))
              )}
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Monto (ARS / USD)</label>
            <input 
              type="number"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 1200000"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            />
          </div>

          {/* Detalle */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Detalle / Concepto</label>
            <input 
              type="text"
              required
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Ej: Cuota 4 - Julio"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Botón Guardar */}
          <button 
            type="submit" 
            className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded-lg mt-4 transition-all shadow-lg uppercase tracking-wide"
          >
            Confirmar Operación
          </button>

          {estado && <p className="text-center text-sm font-medium text-emerald-600 mt-2">{estado}</p>}
        </form>
      </div>
    </div>
  );
}