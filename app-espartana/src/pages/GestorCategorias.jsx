import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function GestorCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('egreso');
  const [estado, setEstado] = useState('');

  // 1. LEER: Función para traer las categorías desde Firebase
  const cargarCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias"));
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategorias(lista);
    } catch (error) {
      console.error("Error al cargar:", error);
    }
  };

  // Ejecutar al abrir la pantalla
  useEffect(() => {
    cargarCategorias();
  }, []);

  // 2. CREAR (ALTA): Guardar nueva categoría en Firebase
  const agregarCategoria = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setEstado('Creando...');

    try {
      await addDoc(collection(db, "categorias"), { nombre, tipo });
      setNombre('');
      setEstado('¡Categoría agregada!');
      cargarCategorias(); // Recargamos la lista
      setTimeout(() => setEstado(''), 3000);
    } catch (error) {
      console.error(error);
      setEstado('Error al crear.');
    }
  };

  // 3. BORRAR (BAJA): Eliminar de Firebase
  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que querés eliminar esta categoría?")) return;
    
    try {
      await deleteDoc(doc(db, "categorias", id));
      cargarCategorias(); // Recargamos la lista
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mt-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Gestor de Categorías (ABM)</h2>
        
        {/* Formulario de ALTA */}
        <form onSubmit={agregarCategoria} className="flex gap-4 mb-8 bg-slate-100 p-4 rounded-xl items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-600 mb-1">Nueva Categoría</label>
            <input 
              type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Cuota Quinta San José"
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-bold text-slate-600 mb-1">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg p-3 outline-none">
              <option value="ingreso">Ingreso (+)</option>
              <option value="egreso">Egreso (-)</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 px-6 rounded-lg transition-all">
            Agregar
          </button>
        </form>

        {estado && <p className="text-emerald-600 font-bold mb-4">{estado}</p>}

        {/* Lista de Categorías (LEER y BAJA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Ingresos */}
          <div>
            <h3 className="font-bold text-emerald-600 mb-3 text-lg">Tus Ingresos</h3>
            <ul className="space-y-2">
              {categorias.filter(c => c.tipo === 'ingreso').map(cat => (
                <li key={cat.id} className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                  <span className="font-medium text-slate-700">{cat.nombre}</span>
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna Egresos */}
          <div>
            <h3 className="font-bold text-rose-600 mb-3 text-lg">Tus Egresos</h3>
            <ul className="space-y-2">
              {categorias.filter(c => c.tipo === 'egreso').map(cat => (
                <li key={cat.id} className="flex justify-between items-center bg-rose-50 border border-rose-100 p-3 rounded-lg">
                  <span className="font-medium text-slate-700">{cat.nombre}</span>
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-red-500 hover:text-red-700 font-bold px-2">X</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}