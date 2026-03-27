import React from 'react';
import { AlertTriangle, X, Trash2, CheckCircle } from 'lucide-react';

const ModalPremium = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  variant = "danger" // Puede ser: 'danger', 'success', 'warning'
}) => {
  if (!isOpen) return null;

  // Configuraciones visuales de élite según la variante
  const config = {
    danger: {
      icon: <Trash2 className="w-7 h-7 text-red-500" />,
      bgIcon: "bg-red-500/10",
      btnConfirm: "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]",
      border: "border-red-900/50"
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7 text-yellow-500" />,
      bgIcon: "bg-yellow-500/10",
      btnConfirm: "bg-yellow-600 hover:bg-yellow-700 text-white shadow-[0_0_15px_rgba(202,138,4,0.5)]",
      border: "border-yellow-900/50"
    },
    success: {
      icon: <CheckCircle className="w-7 h-7 text-[var(--color-neon-green)]" />,
      bgIcon: "bg-[var(--color-neon-green)]/10",
      btnConfirm: "bg-[var(--color-neon-green)] hover:brightness-110 text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]",
      border: "border-[var(--color-neon-green)]/30"
    }
  };

  const current = config[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
      
      {/* Overlay oscuro con desenfoque militar */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Caja del Modal Premium */}
      <div className={`relative bg-[#111] border ${current.border} w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-300`}>
        
        {/* Botón cerrar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white bg-gray-800/30 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          
          {/* Ícono dinámico */}
          <div className={`w-16 h-16 rounded-full ${current.bgIcon} flex items-center justify-center mb-5`}>
            {current.icon}
          </div>
          
          {/* Textos */}
          <h3 className="text-xl font-black text-white mb-2 tracking-tight">{title}</h3>
          <p className="text-sm text-gray-400 font-medium mb-8 leading-relaxed">
            {message}
          </p>

          {/* Botones de acción */}
          <div className="flex w-full gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors uppercase tracking-wider text-xs"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 rounded-2xl font-black transition-all uppercase tracking-wider text-xs ${current.btnConfirm}`}
            >
              {confirmText}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalPremium;
