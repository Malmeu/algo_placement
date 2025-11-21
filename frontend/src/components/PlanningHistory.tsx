import { useState, useEffect } from 'react';
import { Planning } from '@/types';
import { loadPlannings, deletePlanning } from '@/services/supabaseService';
import { Calendar, Trash2, Eye, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlanningHistoryProps {
  onSelectPlanning: (planning: Planning) => void;
  currentPlanningId?: string;
}

export default function PlanningHistory({ onSelectPlanning, currentPlanningId }: PlanningHistoryProps) {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlannings = async () => {
    setLoading(true);
    setError(null);
    const result = await loadPlannings(20);
    
    if (result.success && result.plannings) {
      setPlannings(result.plannings);
    } else {
      setError(result.error || 'Erreur lors du chargement');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlannings();
  }, []);

  const handleDelete = async (planningId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) return;

    const result = await deletePlanning(planningId);
    if (result.success) {
      setPlannings(plannings.filter(p => p.id !== planningId));
    } else {
      alert('Erreur lors de la suppression : ' + result.error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button
            onClick={fetchPlannings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Historique des plannings</h2>
        <button
          onClick={fetchPlannings}
          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {plannings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun planning dans l'historique</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plannings.map((planning, index) => {
            const isActive = planning.id === currentPlanningId;
            const assignmentCount = planning.assignments.length;
            
            return (
              <motion.div
                key={planning.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg p-4 hover:shadow-md transition-all ${
                  isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} className="text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        Planning du {new Date(planning.createdAt).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          Actuel
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {assignmentCount} affectation{assignmentCount > 1 ? 's' : ''} • 
                      Créé à {new Date(planning.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectPlanning(planning)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir ce planning"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(planning.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
