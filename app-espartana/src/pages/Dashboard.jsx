import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, ArrowRightLeft, Send, Settings, Target, TrendingDown, TrendingUp, PieChart as PieChartIcon, Loader2, Wallet, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, PieChart, Pie, Cell } from 'recharts';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { useApp } from '../context/AppContext';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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

  const [activeTrend, setActiveTrend] = useState('ingresos');

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

        // 5. Saldo Mensual
        setMunicionTotal(sumaIngresos - sumaGastos);

      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };

    fetchDashboardData();
  }, [baseId, mesActual, anioActual, navigate]);

  // --- DATOS PARA GRÁFICOS ---
  const trendGraphs = {
    ingresos: {
      id: 'ingresos', title: 'Evolución Ingresos', color: 'var(--color-neon-green)', icon: TrendingUp, goal: 'Acumulado Mes',
      data: [{ mes: 'Mes Pasado', valor: 0 }, { mes: MESES[mesActual], valor: totalIngresosReal }]
    },
    gastos: {
      id: 'gastos', title: 'Tendencia Bajas', color: 'var(--color-alert-red)', icon: TrendingDown, goal: 'Bajas Mes',
      data: [{ mes: 'Mes Pasado', valor: 0 }, { mes: MESES[mesActual], valor: totalGastosReal }]
    },
    boveda: {
      id: 'boveda', title: 'Acumulación Bóveda', color: '#10b981', icon: Wallet, goal: `Meta: ${baseConfig?.metaUsd || 0} USD`,
      data: [{ mes: 'Acumulado Total', valor: totalBoveda }]
    }
  };

  const currentTrend = trendGraphs[activeTrend];

  const TrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isUsd = activeTrend === 'boveda';
      return (
        <div className="bg-[#111] border border-gray-800 p-3 rounded-xl shadow-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">{label}</p>
          <p className="font-mono font-black text-lg" style={{ color: currentTrend.color }}>
            {isUsd ? 'USD ' : '$'}{payload[0].value.toLocaleString('es-AR')}
          </p>
        </div>
      );
    }
    return null;
  };

  // Pie Chart dinámico (Solo muestra las categorías que tuvieron gastos en el mes)
  const pieData = baseConfig?.categorias?.map(cat => ({
    name: cat.nombre, value: gastosPorCategoria[cat.id] || 0, color: cat.color
  })).filter(item => item.value > 0) || [];
  
  if (gastosPorCategoria['Otros'] > 0) pieData.push({ name: 'Otros', value: gastosPorCategoria['Otros'], color: '#6b7280' });

  return (
    <div className="pt-6 px-6 animate-in fade-in duration-500 overflow-x-hidden pb-40">
      
      {/* MOTOR DEL TIEMPO */}
      <header className="flex justify-between items-center mb-8 bg-white dark:bg-[#111] p-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
        <button onClick={mesAnterior} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
        <div className="text-center">
          <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase">{MESES[mesActual]} {anioActual}</h2>
          <p className="text-[10px] text-[var(--color-neon-green)] font-bold uppercase">{baseNombre}</p>
        </div>
        <button onClick={mesSiguiente} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
      </header>

      {/* MUNICIÓN MENSUAL */}
      <section className="mb-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Munición Mensual</span>
          <button onClick={() => navigate('/ajustes')} className="flex items-center gap-1 text-[10px] bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-3 h-3" /> Ajustes
          </button>
        </p>
        {loading ? (
          <div className="h-12 flex items-center"><Loader2 className="w-8 h-8 text-[var(--color-neon-green)] animate-spin" /></div>
        ) : (
          <div className="flex justify-start items-baseline">
            <span className="text-3xl text-gray-400 dark:text-[var(--color-neon-green)]/70 font-mono mr-1">$</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-[var(--color-neon-green)] font-mono truncate">
              {municionTotal.toLocaleString('es-AR')}
            </h1>
          </div>
        )}
      </section>

      {/* BOTONES ACCIÓN RÁPIDA */}
      <section className="flex justify-between gap-2 sm:gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex flex-col items-center gap-2 min-w-[70px]">
          <button onClick={() => navigate('/ingresos')} className="w-14 h-14 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:border-[var(--color-neon-green)] transition-all"><TrendingUp className="w-6 h-6 text-[var(--color-neon-green)]" /></button>
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Ingreso</span>
        </div>
        <div className="flex flex-col items-center gap-2 min-w-[70px]">
          <button onClick={() => navigate('/gastos')} className="w-14 h-14 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:border-[var(--color-alert-red)] transition-all"><TrendingDown className="w-6 h-6 text-[var(--color-alert-red)]" /></button>
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Gasto</span>
        </div>
        <div className="flex flex-col items-center gap-2 min-w-[70px]">
          <button onClick={() => navigate('/boveda')} className="w-14 h-14 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:border-blue-500 transition-all"><Wallet className="w-6 h-6 text-blue-500" /></button>
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Bóveda</span>
        </div>
        <div className="flex flex-col items-center gap-2 min-w-[70px]">
          <button onClick={() => navigate('/')} className="w-14 h-14 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:border-gray-500 transition-all"><MoreHorizontal className="w-6 h-6 text-gray-500" /></button>
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase">Bases</span>
        </div>
      </section>

      {/* FRENTES DE BATALLA DINÁMICOS + BÓVEDA FIJA */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Frentes de Batalla</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bajas este mes</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center"><Loader2 className="w-6 h-6 text-gray-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            
            {/* TARJETAS DE GASTOS CREADAS EN AJUSTES */}
            {baseConfig?.categorias?.map(cat => (
              <div key={cat.id} className="p-4 rounded-3xl text-white shadow-lg flex flex-col justify-between" style={{ backgroundColor: cat.color }}>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-6 text-xl">{cat.emoji}</div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 mb-1 truncate">{cat.nombre}</p>
                  <p className="text-xl sm:text-2xl font-black font-mono truncate">${(gastosPorCategoria[cat.id] || 0).toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))}
            
            {/* TARJETA FIJA DE LA BÓVEDA */}
            <div className="p-4 rounded-3xl bg-[#111] border border-gray-800 shadow-lg flex flex-col justify-between">
              <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 text-xl">🏦</div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 truncate">Bóveda (Ahorro)</p>
                <p className="text-xl sm:text-2xl font-black font-mono text-[var(--color-neon-green)] truncate">USD {totalBoveda.toLocaleString('es-AR')}</p>
              </div>
            </div>

            {/* Mensaje de apoyo si no hay categorías */}
            {(!baseConfig?.categorias || baseConfig.categorias.length === 0) && (
              <div className="col-span-1 p-6 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-black/50">
                <Target className="w-8 h-8 text-gray-400 mb-2" />
                <button onClick={() => navigate('/ajustes')} className="mt-2 text-xs font-black text-[var(--color-neon-green)] uppercase">Crear Frentes</button>
              </div>
            )}

          </div>
        )}
      </section>

      {/* SECCIÓN 1: GRÁFICOS DE LÍNEAS (CON PESTAÑAS) */}
      <section className="mb-8 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-black p-1 rounded-xl w-fit overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTrend('ingresos')} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${activeTrend === 'ingresos' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]' : 'text-gray-500 hover:text-gray-300'}`}>Ingresos</button>
          <button onClick={() => setActiveTrend('gastos')} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${activeTrend === 'gastos' ? 'bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)]' : 'text-gray-500 hover:text-gray-300'}`}>Gastos</button>
          <button onClick={() => setActiveTrend('boveda')} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${activeTrend === 'boveda' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Bóveda</button>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <currentTrend.icon className="w-5 h-5" style={{ color: currentTrend.color }} /> {currentTrend.title}
            </h3>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-bold font-mono" style={{ backgroundColor: `${currentTrend.color}20`, color: currentTrend.color }}>
            {currentTrend.goal}
          </div>
        </div>
        
        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentTrend.data} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <RechartsTooltip content={<TrendTooltip />} cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }} dy={10} />
              <Line key={activeTrend} type="monotone" dataKey="valor" stroke={currentTrend.color} strokeWidth={4} dot={{ r: 5, fill: '#111', stroke: currentTrend.color, strokeWidth: 3 }} activeDot={{ r: 7, fill: currentTrend.color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SECCIÓN 2: GRÁFICO DE TORTA DINÁMICO */}
      <section className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" /> Distribución de Bajas
          </h3>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Mes: {MESES[mesActual]}</p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {pieData.length > 0 ? (
              <PieChart>
                <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #333' }} itemStyle={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }} formatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm font-bold uppercase tracking-wider text-center px-4">
                No hay bajas registradas en este mes.
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {pieData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 bg-gray-50 dark:bg-black px-2 py-1 rounded-lg">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;