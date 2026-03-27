import React, { useState } from 'react';
import { Menu, Bell, Plus, ArrowRightLeft, Send, MoreHorizontal, Home, Wallet, CreditCard, Hexagon, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const Dashboard = () => {
  // 1. ESTADO PARA EL GRÁFICO DINÁMICO
  const [activeGraph, setActiveGraph] = useState('uai');

  // 2. BASE DE DATOS SIMULADA PARA LOS GRÁFICOS
  const graphData = {
    uai: {
      id: 'uai',
      title: 'Exterminio UAI',
      color: 'var(--color-alert-red)',
      icon: TrendingDown,
      goal: 'Objetivo: $0',
      data: [
        { mes: 'Mar', valor: 1424442 },
        { mes: 'Abr', valor: 82492 },
        { mes: 'May', valor: 0 },
        { mes: 'Jun', valor: 0 },
      ]
    },
    boveda: {
      id: 'boveda',
      title: 'Acumulación Bóveda',
      color: 'var(--color-neon-green)',
      icon: TrendingUp,
      goal: 'Objetivo: 6.649 USD',
      data: [
        { mes: 'Mar', valor: 0 },
        { mes: 'Abr', valor: 0 },
        { mes: 'May', valor: 135 },
        { mes: 'Jun', valor: 1103 },
      ]
    }
  };

  const currentGraph = graphData[activeGraph];

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isUsd = activeGraph === 'boveda';
      return (
        <div className="bg-[#111] border border-gray-800 p-3 rounded-xl shadow-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">{label}</p>
          <p className="font-mono font-black text-lg" style={{ color: currentGraph.color }}>
            {isUsd ? 'USD ' : '-$'}
            {payload[0].value.toLocaleString('es-AR')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pt-6 px-6 animate-in fade-in duration-500 overflow-x-hidden">
      
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

      {/* SALDO PRINCIPAL */}
      <section className="mb-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Munición Total</p>
        <div className="flex justify-start items-baseline">
          <span className="text-3xl text-gray-400 dark:text-[var(--color-neon-green)]/70 font-mono mr-1">$</span>
          {/* ARREGLO RESPONSIVE: text-4xl en móviles, text-5xl en pantallas grandes */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-[var(--color-neon-green)] font-mono truncate">
            1.341.950
          </h1>
        </div>
      </section>

      {/* BOTONES DE ACCIÓN RÁPIDA */}
      <section className="flex justify-between gap-2 sm:gap-4 mb-10">
        {[
          { icon: Plus, label: 'Ingreso' },
          { icon: ArrowRightLeft, label: 'Mover' },
          { icon: Send, label: 'Pagar' },
          { icon: MoreHorizontal, label: 'Más' }
        ].map((Action, index) => (
          <div key={index} className="flex flex-col items-center gap-2 w-full">
            <button className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-[var(--color-dark-card)] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] hover:-translate-y-1 transition-all duration-300">
              <Action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-white" />
            </button>
            <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">{Action.label}</span>
          </div>
        ))}
      </section>

      {/* FRENTES DE BATALLA */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Frentes de Batalla</h3>
          <button className="text-sm text-[var(--color-neon-green)] font-bold uppercase tracking-wider hover:opacity-80">Editar</button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* ARREGLO RESPONSIVE: Ajusté paddings (p-4) y el texto de los números a text-xl o text-lg con truncate para que no rompa la caja */}
          <div className="p-4 rounded-3xl bg-purple-500 text-white shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 mb-1 truncate">Fondo de Vida</p>
              <p className="text-xl sm:text-2xl font-black font-mono truncate">$700.000</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-blue-500 text-white shadow-lg flex flex-col justify-between">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90 mb-1 truncate">Boda (Quinta)</p>
              <p className="text-xl sm:text-2xl font-black font-mono truncate">$820.000</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#111] dark:bg-[var(--color-dark-card)] text-white shadow-lg border border-gray-800 dark:border-[var(--color-neon-green)]/30 flex flex-col justify-between cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => setActiveGraph('boveda')}>
            <div className="w-8 h-8 bg-[var(--color-neon-green)]/10 rounded-xl flex items-center justify-center mb-6">
              <Wallet className="w-4 h-4 text-[var(--color-neon-green)]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 truncate">Bóveda (USD)</p>
              <p className="text-xl sm:text-2xl font-black font-mono text-[var(--color-neon-green)] truncate">$135,00</p>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-[#111] dark:bg-[var(--color-dark-card)] text-white shadow-lg border border-gray-800 dark:border-[var(--color-alert-red)]/30 flex flex-col justify-between cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => setActiveGraph('uai')}>
            <div className="w-8 h-8 bg-[var(--color-alert-red)]/10 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="w-4 h-4 text-[var(--color-alert-red)]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 truncate">Deuda UAI</p>
              <p className="text-xl sm:text-2xl font-black font-mono text-[var(--color-alert-red)] truncate">-$1.341k</p>
            </div>
          </div>
        </div>
      </section>

      {/* GRÁFICO DINÁMICO */}
      <section className="mb-10 bg-white dark:bg-[#111] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        
        {/* Pestañas para cambiar el gráfico */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-black p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveGraph('uai')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeGraph === 'uai' ? 'bg-[var(--color-alert-red)]/20 text-[var(--color-alert-red)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            UAI
          </button>
          <button 
            onClick={() => setActiveGraph('boveda')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeGraph === 'boveda' ? 'bg-[var(--color-neon-green)]/20 text-[var(--color-neon-green)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Bóveda
          </button>
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <currentGraph.icon className="w-5 h-5" style={{ color: currentGraph.color }} /> 
              {currentGraph.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Proyección 2026</p>
          </div>
          <div 
            className="px-3 py-1 rounded-full text-xs font-bold font-mono"
            style={{ backgroundColor: `${currentGraph.color}20`, color: currentGraph.color }}
          >
            {currentGraph.goal}
          </div>
        </div>
        
        {/* ARREGLO RESPONSIVE: Agregué márgenes al gráfico para que el punto derecho no se corte */}
        <div className="h-48 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentGraph.data} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <XAxis 
                dataKey="mes" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                dy={10}
              />
              <Line 
                key={activeGraph} // Fuerza la animación al cambiar de pestaña
                type="monotone" 
                dataKey="valor" 
                stroke={currentGraph.color} 
                strokeWidth={4} 
                dot={{ r: 5, fill: '#111', stroke: currentGraph.color, strokeWidth: 3 }} 
                activeDot={{ r: 7, fill: currentGraph.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;