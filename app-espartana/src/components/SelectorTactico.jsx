import React from 'react';
import { Plus } from 'lucide-react';

const SelectorTactico = ({ 
  opciones = [], 
  valorSeleccionado, 
  onChange, 
  label, 
  onAgregarNuevo,
  textoAgregar = "Nuevo"
}) => {
  return (
    <div className="w-full">
      {/* Etiqueta del campo */}
      {label && (
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
          {label}
        </label>
      )}
      
      {/* Carrusel horizontal ocultando la barra de scroll (estilo app nativa) */}
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* Mapeo de las opciones dinámicas */}
        {opciones.map((opt) => {
          const estaSeleccionado = valorSeleccionado === opt.id;
          
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`
                snap-start flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 border-2
                ${estaSeleccionado 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black scale-105 shadow-md' 
                  : 'bg-white dark:bg-[#111] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}
              `}
              style={{
                // Si está seleccionado, el borde se pinta del color de esa categoría
                borderColor: estaSeleccionado ? opt.color || 'var(--color-neon-green)' : '',
              }}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="font-bold text-sm tracking-wide">{opt.nombre}</span>
            </button>
          );
        })}

        {/* Botón para agregar una nueva opción al instante */}
        {onAgregarNuevo && (
          <button
            type="button"
            onClick={onAgregarNuevo}
            className="snap-start flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-transparent"
          >
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide">{textoAgregar}</span>
          </button>
        )}
        
      </div>
    </div>
  );
};

export default SelectorTactico;