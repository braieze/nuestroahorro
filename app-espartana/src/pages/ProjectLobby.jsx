import React, { useState, useEffect } from 'react';
import { Plus, FolderKanban, ArrowRight, Shield, Zap, Loader2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const ProjectLobby = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal de Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    color: 'bg-[var(--color-neon-green)]', // Color por defecto
    textColor: 'text-black',
    iconName: 'Shield'
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "projects"));
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
    fetchProjects();
  }, []);

  // Función conectada al Formulario del Modal
  const handleCreateProject = async (e) => {
    e.preventDefault(); // Evita que recargue la página
    try {
      const newProject = {
        ...newProjectForm,
        balance: '$0' // Inicia en 0
      };
      
      await addDoc(collection(db, "projects"), newProject);
      
      // Limpiamos form, cerramos modal y recargamos
      setNewProjectForm({ name: '', description: '', color: 'bg-[var(--color-neon-green)]', textColor: 'text-black', iconName: 'Shield' });
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error al crear la base:", error);
    }
  };

  // NUEVA FUNCIÓN: Eliminar clones/proyectos
  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation(); // Evita que al tocar el tacho de basura se active el "Entrar al proyecto"
    const confirmDelete = window.confirm("¿Estás seguro de destruir esta base operativa? Es irreversible.");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
        fetchProjects(); // Recargamos la lista
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const handleEnterProject = (projectId) => {
    navigate('/dashboard'); 
  };

  const renderIcon = (iconName, className) => {
    if (iconName === 'Zap') return <Zap className={className} />;
    return <Shield className={className} />;
  };

  return (
    <div className="min-h-screen pt-12 px-6 flex flex-col relative">
      <header className="mb-10">
        <div className="w-12 h-12 bg-gray-200 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <FolderKanban className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          Tus Bases<br/>de Operación
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Seleccioná un proyecto para iniciar la gestión táctica.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--color-neon-green)] animate-spin mb-4" />
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-[#111] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 mb-8">
          <p className="text-gray-500">No hay bases activas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleEnterProject(project.id)}
              className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-[var(--color-dark-card)] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 text-left"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${project.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 rounded-full ${project.color} flex items-center justify-center shadow-inner`}>
                  {renderIcon(project.iconName, `w-5 h-5 ${project.textColor}`)}
                </div>
                
                {/* Botón de eliminar escondido, aparece al pasar el mouse o en móvil al lado de la flecha */}
                <div className="flex gap-2">
                  <div 
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-[#222] transition-colors">
                     <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-1">{project.description}</p>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Poder Operativo</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{project.balance}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* BOTÓN PARA ABRIR MODAL */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="mt-auto mb-32 w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:border-[var(--color-neon-green)] hover:text-[var(--color-neon-green)] transition-all duration-300"
      >
        <Plus className="w-5 h-5" />
        Fundar Nueva Base
      </button>

      {/* MODAL DE CREACIÓN (OVERLAY) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Nueva Operación</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Clave</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Proyecto Estética"
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Objetivo (Breve)</label>
                <input 
                  required
                  type="text" 
                  placeholder="Ej: Inversión inicial para el local"
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-[var(--color-neon-green)] transition-colors"
                />
              </div>

              {/* Selector Rápido de Tema */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tono Visual</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setNewProjectForm({...newProjectForm, color: 'bg-[var(--color-neon-green)]', textColor: 'text-black', iconName: 'Shield'})} className={`w-10 h-10 rounded-full bg-[var(--color-neon-green)] border-2 ${newProjectForm.color.includes('neon') ? 'border-white' : 'border-transparent'}`}></button>
                  <button type="button" onClick={() => setNewProjectForm({...newProjectForm, color: 'bg-purple-500', textColor: 'text-white', iconName: 'Zap'})} className={`w-10 h-10 rounded-full bg-purple-500 border-2 ${newProjectForm.color.includes('purple') ? 'border-white' : 'border-transparent'}`}></button>
                  <button type="button" onClick={() => setNewProjectForm({...newProjectForm, color: 'bg-blue-500', textColor: 'text-white', iconName: 'Zap'})} className={`w-10 h-10 rounded-full bg-blue-500 border-2 ${newProjectForm.color.includes('blue') ? 'border-white' : 'border-transparent'}`}></button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full mt-6 bg-black dark:bg-[var(--color-neon-green)] text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
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