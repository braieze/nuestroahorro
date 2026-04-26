import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { useApp } from '../context/AppContext';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Paleta de colores pastel para los gráficos
const COLORES_PASTEL = ['#d8b4fe', '#fbcfe8', '#bfdbfe', '#a7f3d0', '#fde047', '#c4b5fd'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { baseId, baseNombre, mesActual, setMesActual, anioActual, setAnioActual } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [baseConfig, setBaseConfig] = useState(null); 

  const [municionTotal, setMunicionTotal] = useState(0);
  const [totalBoveda, setTotalBoveda] = useState(0);
  const [totalIngresosReal, setTotalIngresosReal] = useState(0);
  const [totalGastosReal, setTotalGastosReal] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});

  const mesAnterior = () => {
    if (mesActual === 0) { setMesActual(11); setAnioActual(anioActual - 1); } 
    else { setMesActual(mesActual - 1); }
  };
  const mesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAnioActual(anioActual + 1); } 
    else { setMesActual(mesActual + 1); }
  };

  useEffect(() => {
    if (!baseId) { navigate('/'); return; }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 1. ADN de la base
        const docSnap = await getDoc(doc(db, "bases", baseId));
        let config = { categorias: [], metaUsd: 0 };
        if (docSnap.exists()) {
          config = docSnap.data();
          setBaseConfig(config);
        }

        // 2. Ingresos del mes
        const qIngresos = query(collection(db, "ingresos"), where("baseId", "==", baseId));
        const ingresosSnap = await getDocs(qIngresos);
        let sumaIngresos = 0;
        ingresosSnap.forEach(doc => {
          const fecha = doc.data().fecha?.toDate();
          if (fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) sumaIngresos += doc.data().monto;
        });
        setTotalIngresosReal(sumaIngresos);

        // 3. Gastos del mes y Distribución
        const qGastos = query(collection(db, "gastos"), where("baseId", "==", baseId));
        const gastosSnap = await getDocs(qGastos);
        let sumaGastos = 0;
        let distribucion = {};
        
        config.categorias?.forEach(c => distribucion[c.id] = 0);
        distribucion['Otros'] = 0;

        gastosSnap.forEach(doc => {
          const data = doc.data();
          const fecha = data.fecha?.toDate();
          if (fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
            sumaGastos += data.monto;
            if (distribucion[data.categoriaId] !== undefined) distribucion[data.categoriaId] += data.monto;
            else distribucion['Otros'] += data.monto;
          }
        });
        setTotalGastosReal(sumaGastos);
        setGastosPorCategoria(distribucion);

        // 4. Bóveda (Acumulado Total Histórico)
        const qBoveda = query(collection(db, "boveda"), where("baseId", "==", baseId));
        const bovedaSnap = await getDocs(qBoveda);
        let sumaUsd = 0;
        bovedaSnap.forEach(doc => sumaUsd += doc.data().montoUsd);
        setTotalBoveda(sumaUsd);

        // 5. Saldo Mensual (Queda por gastar)
        setMunicionTotal(sumaIngresos - sumaGastos);

      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };

    fetchDashboardData();
  }, [baseId, mesActual, anioActual, navigate]);

  // Datos para Pie Chart con colores pastel
  const pieData = baseConfig?.categorias?.map((cat, index) => ({
    name: cat.nombre, 
    value: gastosPorCategoria[cat.id] || 0, 
    color: COLORES_PASTEL[index % COLORES_PASTEL.length] 
  })).filter(item => item.value > 0) || [];
  
  if (gastosPorCategoria['Otros'] > 0) pieData.push({ name: 'Otros', value: gastosPorCategoria['Otros'], color: '#e2e8f0' });

  if (loading) {
    return <div className="min-h-screen bg-[#fcfaff] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-400 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fcfaff] p-4 sm:p-8 font-sans text-slate-700 animate-fade-in pb-32">
      
      {/* HEADER TIPO PLANNER */}
      <header className="flex justify-between items-center mb-8 bg-purple-200/50 p-4 rounded-2xl shadow-sm border border-purple-100">
        <button onClick={mesAnterior} className="p-2 bg-white rounded-full hover:bg-purple-50 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5 text-purple-700" /></button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-900 tracking-wide">{MESES[mesActual]}</h1>
          <p className="text-xs text-purple-600 font-medium uppercase tracking-widest">{anioActual} | {baseNombre}</p>
        </div>
        <button onClick={mesSiguiente} className="p-2 bg-white rounded-full hover:bg-purple-50 transition-colors shadow-sm"><ChevronRight className="w-5 h-5 text-purple-700" /></button>
      </header>

      {/* BLOQUE SUPERIOR: RESUMEN (ESTILO EXCEL/PLANNER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Ingresos</p>
          <p className="text-2xl font-bold text-slate-800">${totalIngresosReal.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white border border-purple-100 rounded-xl p-4 shadow-sm text-center">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Gastos</p>
          <p className="text-2xl font-bold text-slate-800">${totalGastosReal.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-purple-100 border border-purple-200 rounded-xl p-4 shadow-sm text-center">
          <p className="text-sm font-bold text-purple-800 mb-1">Queda por gastar</p>
          <p className="text-3xl font-extrabold text-purple-900">${municionTotal.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* SECCIÓN MEDIA: GRÁFICO Y RESUMEN GENERAL */}
      <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 h-64">
          <h3 className="text-center font-bold text-slate-600 mb-2">Resumen de Gastos</h3>
          <ResponsiveContainer width="100%" height="100%">
            {pieData.length > 0 ? (
              <PieChart>
                <RechartsTooltip formatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Sin datos este mes</div>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda del gráfico */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 mt-4 md:mt-0 px-4">
          {pieData.map((entry, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-slate-800">${entry.value.toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: COLUMNAS ESTILO TABLA (PLANNER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Columna: Gastos Fijos/Variables */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="bg-purple-200/70 py-3 text-center">
            <h3 className="font-bold text-purple-900">Control de Gastos</h3>
          </div>
          <div className="p-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-2 mb-2 uppercase">
              <span>Categoría</span>
              <span>Actual</span>
            </div>
            <div className="space-y-3">
              {baseConfig?.categorias?.map(cat => (
                <div key={cat.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-slate-600">{cat.nombre}</span>
                  </div>
                  <span className="font-medium text-slate-800">${(gastosPorCategoria[cat.id] || 0).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between font-bold text-purple-900">
              <span>Total Gastos</span>
              <span>${totalGastosReal.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>

        {/* Columna: Bóveda / Ahorros */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="bg-blue-100/70 py-3 text-center">
            <h3 className="font-bold text-blue-900">Bóveda & Ahorros</h3>
          </div>
          <div className="p-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-2 mb-2 uppercase">
              <span>Fondo</span>
              <span>Acumulado</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏦</span>
                <span className="text-slate-600">Caja Fuerte USD</span>
              </div>
              <span className="font-bold text-emerald-600">US$ {totalBoveda.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-slate-600">Meta Actual</span>
              </div>
              <span className="font-medium text-slate-800">US$ {baseConfig?.metaUsd || 0}</span>
            </div>
          </div>
        </div>

        {/* Columna: Atajos Rápidos */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="bg-pink-100/70 py-3 text-center">
            <h3 className="font-bold text-pink-900">Acciones</h3>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <button onClick={() => navigate('/gastos')} className="w-full py-3 bg-white border border-pink-200 text-pink-600 font-bold rounded-xl shadow-sm hover:bg-pink-50 transition-colors">
              + Registrar Gasto
            </button>
            <button onClick={() => navigate('/ingresos')} className="w-full py-3 bg-white border border-emerald-200 text-emerald-600 font-bold rounded-xl shadow-sm hover:bg-emerald-50 transition-colors">
              + Registrar Ingreso
            </button>
            <button onClick={() => navigate('/ajustes')} className="w-full py-3 mt-auto flex justify-center items-center gap-2 text-slate-500 font-medium hover:text-slate-700">
              <Settings size={16} /> Ajustes de Plantilla
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;