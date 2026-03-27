import React, { useState, useEffect } from 'react';
import { Plus, FolderKanban, ArrowRight, Shield, Zap, Loader2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useApp } from '../context/AppContext'; // CEREBRO GLOBAL
import ModalPremium from '../components/ModalPremium'; // MODAL DE ELITE

const ProjectLobby = () => {
  const navigate = useNavigate();
  const { setBaseId, setBaseNombre } = useApp();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Modal de Borrado
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Estados para el Modal de Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    color: 'bg-[var(--color-neon-green)]',
    textColor: 'text-black',
    iconName: 'Shield'
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "projects")); // Nota: Usamos la colección 'projects' de tu código original
      const projectsData = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error("Error al cargar bases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Al entrar al lobby, desenchufamos cualquier base activa del cerebro
    setBaseId(null);
    setBaseNombre('');
    fetchProjects();
  }, [setBaseId, setBaseNombre]);

  // FUNCIÓN PARA CREAR BASE VIRGEN
  const handleCreateProject = async (e) => {
    e.preventDefault(); 
    try {
      const newProject = {
        ...newProjectForm,
        balance: '$0', // Solo visual para el lobby por ahora
        metaUsd: 0,
        // ADN Básico (Vacio) para que no explote Ajustes
        categorias: [{ id: 'cat_ini', nombre: 'General', emoji: '📦', color: '#6b7280' }],
        bancos: [{ id: 'ban_ini', nombre: 'Efectivo', emoji: '💵', color: '#10b981' }],
        fechaCreacion: new Date()
      };
      
      const docRef = await addDoc(collection(db, "projects"), newProject);
      
      // Limpiamos form y cerramos modal
      setNewProjectForm({ name: '', description: '', color: 'bg-[var(--color-neon-green)]', textColor: 'text-black', iconName: 'Shield' });
      setIsModalOpen(false);
      
      // Conectamos la nueva base al cerebro y vamos a Ajustes
      setBaseId(docRef.id);
      setBaseNombre(newProject.name);
      navigate('/ajustes');

    } catch (error) {
      console.error("Error al crear la base:", error);
    }
  };

  // FUNCIONES DE BORRADO (CON MODAL PREMIUM)
  const pedirConfirmacionBorrado = (e, projectId) => {
    e.stopPropagation(); // Evita que al tocar el tacho de basura entres a la base
    setProjectToDelete(projectId);
    setModalDeleteOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!projectToDelete) return;
    try {
      await deleteDoc(doc(db, "projects", projectToDelete));
      fetchProjects();
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleEnterProject = (projectId, projectName) => {
    setBaseId(projectId);
    setBaseNombre(projectName);
    navigate('/dashboard'); 
  };

  const renderIcon = (iconName, className) => {
    if (iconName === 'Zap') return <Zap className={className} />;
    return <Shield className={className} />;
  };

  return (
    <div className="min-h-screen pt-12 px-6 flex flex-col relative">
      
      {/* 🚀 MODAL DE DESTRUCCIÓN */}
      <ModalPremium 
        isOpen={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={ejecutarEliminacion}
        title="¿Destruir Base?"
        message="Estás a punto de borrar todo este proyecto y sus registros. Esta acción es absolutamente irreversible."
        confirmText="Destruir Base"
        cancelText="Abortar"
        variant="danger"
      />

      <header className="mb-10 animate-in fade-in duration-700">
        <div className="w-12 h-12 bg-gray-200 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <FolderKanban className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Tus Bases<br/>de Operación
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">Seleccioná un proyecto táctico.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
          <Loader2 className="w-10 h-10 text-[var(--color-neon-green)] animate-spin mb-4" />
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 mb-8 animate-in zoom-in-95">
          <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">No hay bases activas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => handleEnterProject(project.id, project.name)}
              className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left animate-in slide-in-from-bottom-4 fill-mode-forwards opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${project.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 rounded-full ${project.color} flex items-center justify-center shadow-inner`}>
                  {renderIcon(project.iconName, `w-5 h-5 ${project.textColor}`)}
                </div>
                
                <div className="flex gap-2">
                  <div 
                    onClick={(e) => pedirConfirmacionBorrado(e, project.id)}
                    className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-[#222] transition-colors">
                     <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">{project.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 line-clamp-1 font-bold tracking-wide">{project.description}</p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Poder Operativo</span>
                <span className="font-mono font-black text-gray-900 dark:text-white">{project.balance}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* BOTÓN PARA ABRIR MODAL */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="mt-auto mb-32 w-full py-5 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-[var(--color-neon-green)] hover:text-[var(--color-neon-green)] transition-all duration-300 uppercase tracking-wider text-sm"
      >
        <Plus className="w-5 h-5" />
        Fundar Nueva Base
      </button>

      {/* 🚀 MODAL DE CREACIÓN PREMIUM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-[#111] w-full max-w-sm rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Nueva Operación</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800/50 p-2 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Clave</label>
                <input 
                  required type="text" placeholder="Ej: Proyecto Estética"
                  value={newProjectForm.name} onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Objetivo (Breve)</label>
                <input 
                  required type="text" placeholder="Ej: Inversión inicial"
                  value={newProjectForm.description} onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tono Visual</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setNewProjectForm({...newProjectForm, color: 'bg-[var(--color-neon-green)]', textColor: 'text-black', iconName: 'Shield'})} className={`w-12 h-12 rounded-full bg-[var(--color-neon-green)] border-2 transition-all ${newProjectForm.color.includes('neon') ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}></button>
                  <button type="button" onClick={() => setNewProjectForm({...newProjectForm, color: 'bg-purple-500', textColor: 'text-white', iconName: 'Zap'})} className={`w-12 h-12 rounded-full bg-purple-500 border-2 transition-all ${newProjectForm.color.includes('purple') ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}></button>
                  <button type="button" onClick={() => setNewProjectForm({...newProjectForm, color: 'bg-blue-500', textColor: 'text-white', iconName: 'Zap'})} className={`w-12 h-12 rounded-full bg-blue-500 border-2 transition-all ${newProjectForm.color.includes('blue') ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}></button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-6 bg-black dark:bg-[var(--color-neon-green)] text-white dark:text-black font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:brightness-110 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]"
              >
                Desplegar Base
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectLobby;