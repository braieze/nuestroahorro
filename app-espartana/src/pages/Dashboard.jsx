import React, { useState, useEffect } from 'react';
import { Menu, Bell, Plus, ArrowRightLeft, Send, MoreHorizontal, Home, Wallet, CreditCard, Hexagon, TrendingDown, TrendingUp, PieChart as PieChartIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, PieChart, Pie, Cell } from 'recharts';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [municionTotal, setMunicionTotal] = useState(0);
  const [totalIngresosReal, setTotalIngresosReal] = useState(0);
  const [gastosPorCategoria, setGastosPorCategoria] = useState({
    'Fondo de Vida': 0, 'Quinta San Jose': 0, 'Deuda UAI': 0, 'Impuestos': 0, 'Otros': 0
  });

  // ESTADO PARA LAS PESTAÑAS DEL GRÁFICO DE LÍNEAS
  const [activeTrend, setActiveTrend] = useState('uai');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const ingresosSnap = await getDocs(collection(db, "ingresos"));
      let totalIngresos = 0;
      ingresosSnap.forEach(doc => totalIngresos += doc.data().monto);
      setTotalIngresosReal(totalIngresos);

      const gastosSnap = await getDocs(collection(db, "gastos"));
      let totalGastos = 0;
      let distribucion = {
        'Fondo de Vida': 0, 'Quinta San Jose': 0, 'Deuda UAI': 0, 'Impuestos': 0, 'Otros': 0
      };

      gastosSnap.forEach(doc => {
        const g = doc.data();
        totalGastos += g.monto;
        if (distribucion[g.categoria] !== undefined) {
          distribucion[g.categoria] += g.monto;
        } else {
          distribucion['Otros'] += g.monto;
        }
      });

      setMunicionTotal(totalIngresos - totalGastos);
      setGastosPorCategoria(distribucion);

    } catch (error) {
      console.error("Error cargando la base de datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- DATOS SECCIÓN 1: TENDENCIAS (LÍNEAS) ---
  const trendGraphs = {
    uai: {
      id: 'uai',
      title: 'Exterminio UAI',
      color: 'var(--color-alert-red)',
      icon: TrendingDown,
      goal: 'Objetivo: $0',
      data: [
        { mes: 'Mar', valor: 1424442 }, { mes: 'Abr', valor: 82492 }, { mes: 'May', valor: 0 }, { mes: 'Jun', valor: 0 }
      ]
    },
    sueldo: {
      id: 'sueldo',
      title: 'Evolución Ingresos',
      color: 'var(--color-neon-green)',
      icon: TrendingUp,
      goal: 'Crecimiento',
      data: [
        { mes: 'Ene', valor: 550000 }, { mes: 'Feb', valor: 620000 }, { mes: 'Mar', valor: totalIngresosReal > 0 ? totalIngresosReal : 0 } // Simulamos meses anteriores + el real actual
      ]
    },
    boveda: {
      id: 'boveda',
      title: 'Acumulación Bóveda',
      color: 'var(--color-neon-green)',
      icon: TrendingUp,
      goal: 'Objetivo: 6.649 USD',
      data: [
        { mes: 'Mar', valor: 0 }, { mes: 'Abr', valor: 0 }, { mes: 'May', valor: 135 }, { mes: 'Jun', valor: 1103 }
      ]
    }
  };

  const currentTrend = trendGraphs[activeTrend];

  const TrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isUsd = activeTrend === 'boveda';
      const isDebt = activeTrend === 'uai';
      return (
        <div className="bg-[#111] border border-gray-800 p-3 rounded-xl shadow-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">{label}</p>
          <p className="font-mono font-black text-lg" style={{ color: currentTrend.color }}>
            {isUsd ? 'USD ' : (isDebt ? '-$' : '$')}
            {payload[0].value.toLocaleString('es-AR')}
          </p>
        </div>
      );
    }
    return null;
  };

  // --- DATOS SECCIÓN 2: DISTRIBUCIÓN (TORTA) ---
  const pieData = [
    { name: 'Vida', value: gastosPorCategoria['Fondo de Vida'], color: '#a855f7' },
    { name: 'Quinta', value: gastosPorCategoria['Quinta San Jose'], color: '#3b82f6' },
    { name: 'UAI', value: gastosPorCategoria['Deuda UAI'], color: '#ef4444' },
    { name: 'Impuestos', value: gastosPorCategoria['Impuestos'], color: '#f59e0b' },
    { name: 'Otros', value: gastosPorCategoria['Otros'], color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="pt-6 px-6 animate-in fade-in duration-500 overflow-x-hidden pb-40">
      
      {/* CABECERA */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex gap-3">
          <button className="p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button className="p-3 bg-white dark:bg-[var(--color-dark-card)] rounded-full shadow-sm border border-gray-100 dark:border-gray-800 relative hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[var(--color-alert-red)] rounded-full border-2 border-white dark:border-[var(--color-dark-card)]"></span>
          </button>
        </div>
      </header>

      {/* SALDO PRINCIPAL (ESTÉTICA RECUPERADA) */}
      <section className="mb-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Munición Total</p>
        {loading ? (
          <div className="h-12 flex items-center">
            <Loader2 className="w-8 h-8 text-[var(--color-neon-green)] animate-spin" />
          </div>
        ) : (
          <div className="flex justify-start items-baseline">
            <span className="text-3xl text-gray-400 dark:text-[var(--color-neon-green)]/70 font-mono mr-1">$</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-[var(--color-neon-green)] font-mono truncate">
              {municionTotal.toLocaleString('es-AR')}
            </h1>
          </div>
        )}
      </section>

      {/* BOTONES DE ACCIÓN RÁPIDA */}
      <section className="flex justify-between gap-2 sm:gap-4 mb-10">
        <div className="flex flex-col items-center gap-2 w-full">
          <button onClick={() => navigate('/ingresos')} className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[var(--color-dark-card)] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] hover:-translate-y-1 transition-all duration-300">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-neon-green)]" />
          </button>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">Ingreso</span>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <button className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[var(--color-dark-card)] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] hover:-translate-y-1 transition-all duration-300">
            <ArrowRightLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-white" />
          </button>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">Mover</span>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <button onClick={() => navigate('/gastos')} className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[var(--color-dark-card)] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] hover:-translate-y-1 transition-all duration-300">
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-alert-red)]" />
          </button>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">Pagar</span>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <button onClick={() => navigate('/')} className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[var(--color-dark-card)] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] hover:-translate-y-1 transition-all duration-300">
            <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-white" />
          </button>
          <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">Bases</span>
        </div>
      </section>

      {/* FRENTES DE BATALLA */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Frentes de Batalla</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bajas Mensuales</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 rounded-3xl bg-purple-500 text-white shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 mb-1 truncate">Fondo de Vida</p>
              <p className="text-xl sm:text-2xl font-black font-mono truncate">${gastosPorCategoria['Fondo de Vida'].toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-blue-500 text-white shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 mb-1 truncate">Boda (Quinta)</p>
              <p className="text-xl sm:text-2xl font-black font-mono truncate">${gastosPorCategoria['Quinta San Jose'].toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-[#111] dark:bg-[var(--color-dark-card)] text-white shadow-lg border border-gray-800 dark:border-[var(--color-alert-red)]/30 flex flex-col justify-between" onClick={() => setActiveTrend('uai')}>
            <div className="w-8 h-8 bg-[var(--color-alert-red)]/10 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="w-4 h-4 text-[var(--color-alert-red)]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 truncate">Deuda UAI (Pagado)</p>
              <p className="text-xl sm:text-2xl font-black font-mono text-[var(--color-alert-red)] truncate">${gastosPorCategoria['Deuda UAI'].toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-[#111] dark:bg-[var(--color-dark-card)] text-white shadow-lg border border-gray-800 dark:border-[var(--color-neon-green)]/30 flex flex-col justify-between" onClick={() => setActiveTrend('boveda')}>
            <div className="w-8 h-8 bg-[var(--color-neon-green)]/10 rounded-xl flex items-center justify-center mb-6">
              <Wallet className="w-4 h-4 text-[var(--color-neon-green)]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 truncate">Bóveda (USD)</p>
              <p className="text-xl sm:text-2xl font-black font-mono text-[var(--color-neon-green)] truncate">USD 0,00</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: GRÁFICOS DE TENDENCIA (LÍNEAS) */}
      <section className="mb-8 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        
        {/* PESTAÑAS RECUPERADAS (Diseño original) */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-black p-1 rounded-xl w-fit overflow-x-auto">
          <button 
            onClick={() => setActiveTrend('sueldo')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${activeTrend === 'sueldo' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Ingresos
          </button>
          <button 
            onClick={() => setActiveTrend('uai')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${activeTrend === 'uai' ? 'bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Caída UAI
          </button>
          <button 
            onClick={() => setActiveTrend('boveda')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap ${activeTrend === 'boveda' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Bóveda
          </button>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <currentTrend.icon className="w-5 h-5" style={{ color: currentTrend.color }} /> 
              {currentTrend.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Proyección 2026</p>
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

      {/* SECCIÓN 2: GRÁFICO DE DISTRIBUCIÓN (TORTA) INDEPENDIENTE */}
      <section className="bg-white dark:bg-[#111] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-500" /> 
            Distribución de Bajas
          </h3>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Análisis de Gastos Actuales</p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {pieData.length > 0 ? (
              <PieChart>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: '1px solid #333' }}
                  itemStyle={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace' }}
                  formatter={(value) => `$${value.toLocaleString('es-AR')}`}
                />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm font-bold uppercase tracking-wider">
                No hay daños registrados
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* LEYENDA DEL GRÁFICO DE TORTA */}
        {pieData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-400 font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;