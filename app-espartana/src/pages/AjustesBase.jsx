import React, { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, ArrowLeft, Loader2, Target, Wallet, Tags, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useApp } from '../context/AppContext';

const AjustesBase = () => {
  const navigate = useNavigate();
  const { baseId, setBaseNombre } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ESTADOS DE LA CONFIGURACIÓN (ADN)
  const [nombre, setNombre] = useState('');
  const [metaUsd, setMetaUsd] = useState(6649);
  const [categorias, setCategorias] = useState([]);
  const [bancos, setBancos] = useState([]);

  // Estados para los formularios en línea (Agregar nuevos)
  const [nuevaCat, setNuevaCat] = useState({ nombre: '', emoji: '🔥', color: '#ef4444' });
  const [nuevoBanco, setNuevoBanco] = useState({ nombre: '', emoji: '🏦', color: '#3b82f6' });

  // 1. CARGAR ADN DE LA BASE
  useEffect(() => {
    if (!baseId) {
      navigate('/'); // Si no hay base seleccionada, volvemos al Lobby
      return;
    }

    const cargarAjustes = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "bases", baseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre || 'Nueva Base');
          setMetaUsd(data.metaUsd || 0);
          
          // Si es una base virgen, le cargamos unas opciones tácticas por defecto
          setCategorias(data.categorias || [
            { id: 'cat_vida', nombre: 'Fondo de Vida', emoji: '🏠', color: '#a855f7' },
            { id: 'cat_uai', nombre: 'Deuda UAI', emoji: '💳', color: '#ef4444' }
          ]);
          setBancos(data.bancos || [
            { id: 'ban_efectivo', nombre: 'Efectivo Físico', emoji: '💵', color: '#10b981' },
            { id: 'ban_mp', nombre: 'Mercado Pago', emoji: '📱', color: '#3b82f6' }
          ]);
        }
      } catch (error) {
        console.error("Error al cargar ajustes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarAjustes();
  }, [baseId, navigate]);

  // 2. GUARDAR ADN
  const handleGuardar = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "bases", baseId);
      await setDoc(docRef, {
        nombre,
        metaUsd: Number(metaUsd),
        categorias,
        bancos,
        actualizadoEn: new Date()
      }, { merge: true }); // Merge actualiza sin borrar lo que ya había (ej: el saldo)

      setBaseNombre(nombre); // Actualizamos el cerebro global
      alert("¡Sala de Guerra actualizada! Parámetros guardados."); // (Temporal hasta enchufar el modal de éxito)
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error táctico al guardar los ajustes.");
    } finally {
      setSaving(false);
    }
  };

  // 3. FUNCIONES PARA AGREGAR/BORRAR LISTAS
  const agregarCategoria = () => {
    if (!nuevaCat.nombre) return;
    setCategorias([...categorias, { id: Date.now().toString(), ...nuevaCat }]);
    setNuevaCat({ nombre: '', emoji: '🔥', color: '#ef4444' }); // Reset
  };

  const eliminarCategoria = (id) => {
    setCategorias(categorias.filter(c => c.id !== id));
  };

  const agregarBanco = () => {
    if (!nuevoBanco.nombre) return;
    setBancos([...bancos, { id: Date.now().toString(), ...nuevoBanco }]);
    setNuevoBanco({ nombre: '', emoji: '🏦', color: '#3b82f6' }); // Reset
  };

  const eliminarBanco = (id) => {
    setBancos(bancos.filter(b => b.id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark-base)]"><Loader2 className="w-10 h-10 text-[var(--color-neon-green)] animate-spin" /></div>;

  return (
    <div className="pt-6 px-6 pb-32 animate-in fade-in duration-500 min-h-screen">
      
      {/* CABECERA FIJA */}
      <header className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50/90 dark:bg-[var(--color-dark-base)]/90 backdrop-blur-md py-4 z-40 -mx-6 px-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-sm hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" /> Sala de Guerra
            </h1>
          </div>
        </div>
        <button 
          onClick={handleGuardar} disabled={saving}
          className="bg-[var(--color-neon-green)] text-black px-4 py-2 rounded-xl font-black uppercase tracking-wider text-xs flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
        </button>
      </header>

      <div className="space-y-8">
        
        {/* BLOQUE 1: ADN PRINCIPAL */}
        <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--color-neon-green)]" /> Identificación y Objetivo
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre de la Base</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-white font-black text-lg rounded-xl p-4 focus:outline-none focus:border-[var(--color-neon-green)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Objetivo Bóveda (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">USD</span>
                <input type="number" value={metaUsd} onChange={(e) => setMetaUsd(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-[var(--color-neon-green)] font-black text-xl font-mono rounded-xl p-4 pl-14 focus:outline-none focus:border-[var(--color-neon-green)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BLOQUE 2: CAJAS FUERTES (Bancos / Apps) */}
        <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-500" /> Cajas Fuertes (Tesoros)
          </h2>
          
          {/* Lista de Bancos actuales */}
          <div className="space-y-2 mb-4">
            {bancos.map(banco => (
              <div key={banco.id} className="flex justify-between items-center bg-gray-50 dark:bg-black p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{banco.emoji}</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{banco.nombre}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: banco.color }}></div>
                </div>
                <button onClick={() => eliminarBanco(banco.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Formulario rápido para agregar Banco */}
          <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
            <input type="text" placeholder="🏦" maxLength={2} value={nuevoBanco.emoji} onChange={(e) => setNuevoBanco({...nuevoBanco, emoji: e.target.value})} className="w-14 bg-white dark:bg-black rounded-xl text-center text-xl focus:outline-none" />
            <input type="text" placeholder="Nombre Banco..." value={nuevoBanco.nombre} onChange={(e) => setNuevoBanco({...nuevoBanco, nombre: e.target.value})} className="flex-1 bg-white dark:bg-black rounded-xl px-3 text-sm font-bold text-white focus:outline-none" />
            <input type="color" value={nuevoBanco.color} onChange={(e) => setNuevoBanco({...nuevoBanco, color: e.target.value})} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
            <button onClick={agregarBanco} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
        </section>

        {/* BLOQUE 3: FRENTES DE BATALLA (Categorías) */}
        <section className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Tags className="w-4 h-4 text-purple-500" /> Frentes de Batalla (Categorías)
          </h2>
          
          <div className="space-y-2 mb-4">
            {categorias.map(cat => (
              <div key={cat.id} className="flex justify-between items-center bg-gray-50 dark:bg-black p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{cat.nombre}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                </div>
                <button onClick={() => eliminarCategoria(cat.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
            <input type="text" placeholder="🔥" maxLength={2} value={nuevaCat.emoji} onChange={(e) => setNuevaCat({...nuevaCat, emoji: e.target.value})} className="w-14 bg-white dark:bg-black rounded-xl text-center text-xl focus:outline-none" />
            <input type="text" placeholder="Nueva Categoría..." value={nuevaCat.nombre} onChange={(e) => setNuevaCat({...nuevaCat, nombre: e.target.value})} className="flex-1 bg-white dark:bg-black rounded-xl px-3 text-sm font-bold text-white focus:outline-none" />
            <input type="color" value={nuevaCat.color} onChange={(e) => setNuevaCat({...nuevaCat, color: e.target.value})} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
            <button onClick={agregarCategoria} className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-500 transition-colors"><Plus className="w-4 h-4" /></button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AjustesBase;