import React, { useState, useEffect } from 'react';
import { Agent, FixedAssignment, Pole, DayOfWeek } from '@/types';
import {
  saveFixedAssignment,
  loadFixedAssignments,
  deleteFixedAssignment,
} from '@/services/supabaseService';
import { Trash2, Plus, Calendar, User, Briefcase } from 'lucide-react';

interface FixedAssignmentsManagerProps {
  agents: Agent[];
}

const POLES: Pole[] = ['Secure Academy', 'Mutuelle', 'Stafy', 'Timeone'];
const JOURS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

const FixedAssignmentsManager: React.FC<FixedAssignmentsManagerProps> = ({ agents }) => {
  const [fixedAssignments, setFixedAssignments] = useState<FixedAssignment[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedPole, setSelectedPole] = useState<Pole>('Secure Academy');
  const [selectedJour, setSelectedJour] = useState<DayOfWeek>('LUNDI');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    const result = await loadFixedAssignments();
    if (result.success && result.fixedAssignments) {
      setFixedAssignments(result.fixedAssignments);
    } else {
      setError(result.error || 'Erreur lors du chargement');
    }
    setLoading(false);
  };

  const handleAddAssignment = async () => {
    if (!selectedAgent) {
      setError('Veuillez sélectionner un agent');
      return;
    }

    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) {
      setError('Agent non trouvé');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await saveFixedAssignment(
      agent.id,
      agent.nom,
      selectedPole,
      selectedJour
    );

    if (result.success) {
      setSuccess('✅ Assignation fixe ajoutée avec succès !');
      await loadAssignments();
      setSelectedAgent('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Erreur lors de l\'ajout');
    }

    setLoading(false);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette assignation fixe ?')) {
      return;
    }

    setLoading(true);
    const result = await deleteFixedAssignment(assignmentId);

    if (result.success) {
      setSuccess('✅ Assignation fixe supprimée');
      await loadAssignments();
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Erreur lors de la suppression');
    }

    setLoading(false);
  };

  // Grouper les assignations par jour
  const assignmentsByDay = JOURS.reduce((acc, jour) => {
    acc[jour] = fixedAssignments.filter(a => a.jour === jour);
    return acc;
  }, {} as Record<DayOfWeek, FixedAssignment[]>);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-7 h-7" />
          Assignations Fixes
        </h2>
        <p className="mt-2 text-indigo-100">
          Définissez des assignations obligatoires pour certains agents sur des projets spécifiques
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          Ajouter une assignation fixe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sélection de l'agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Sélectionner un agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Projet
            </label>
            <select
              value={selectedPole}
              onChange={(e) => setSelectedPole(e.target.value as Pole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            >
              {POLES.map(pole => (
                <option key={pole} value={pole}>
                  {pole}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du jour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Jour
            </label>
            <select
              value={selectedJour}
              onChange={(e) => setSelectedJour(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            >
              {JOURS.map(jour => (
                <option key={jour} value={jour}>
                  {jour.charAt(0) + jour.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton d'ajout */}
          <div className="flex items-end">
            <button
              onClick={handleAddAssignment}
              disabled={loading || !selectedAgent}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* Liste des assignations par jour */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Assignations définies</h3>

        {fixedAssignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune assignation fixe définie</p>
          </div>
        ) : (
          <div className="space-y-6">
            {JOURS.map(jour => {
              const assignments = assignmentsByDay[jour];
              if (assignments.length === 0) return null;

              return (
                <div key={jour} className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {jour.charAt(0) + jour.slice(1).toLowerCase()}
                  </h4>
                  <div className="space-y-2">
                    {assignments.map(assignment => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{assignment.agent_nom}</span>
                          <span className="text-gray-400">→</span>
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          <span className="text-indigo-600 font-medium">
                            {assignment.pole}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedAssignmentsManager;
