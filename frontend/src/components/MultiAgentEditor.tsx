import { useState } from 'react';
import { Agent, Assignment, Pole, DayOfWeek } from '@/types';
import { Plus, Trash2, Check, X } from 'lucide-react';

interface MultiAgentEditorProps {
  assignments: Assignment[];
  pole: Pole;
  day: DayOfWeek;
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE';
  agents: Agent[];
  onUpdate: (assignments: Assignment[]) => void;
  onCancel: () => void;
  poleColor: string;
}

export default function MultiAgentEditor({
  assignments,
  pole,
  day,
  timeSlot,
  agents,
  onUpdate,
  onCancel,
  poleColor,
}: MultiAgentEditorProps) {
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>(assignments);
  const [newAgentId, setNewAgentId] = useState('');

  const handleAddAgent = () => {
    if (!newAgentId) return;

    const agent = agents.find(a => a.id === newAgentId);
    if (!agent) return;

    // Vérifier que l'agent n'est pas déjà assigné
    if (localAssignments.some(a => a.agentId === agent.id)) {
      alert('Cet agent est déjà assigné à ce créneau');
      return;
    }

    const newAssignment: Assignment = {
      agentId: agent.id,
      agentNom: agent.nom,
      pole,
      jour: day,
      timeSlot,
    };

    setLocalAssignments([...localAssignments, newAssignment]);
    setNewAgentId('');
  };

  const handleRemoveAgent = (agentId: string) => {
    setLocalAssignments(localAssignments.filter(a => a.agentId !== agentId));
  };

  const handleSave = () => {
    onUpdate(localAssignments);
  };

  const getTimeSlotLabel = () => {
    if (timeSlot === 'MATIN') return '🌅 Matin (8h-12h)';
    if (timeSlot === 'APRES_MIDI') return '☀️ Après-midi (13h-17h)';
    return '📅 Journée complète (8h-17h)';
  };

  // Filtrer les agents disponibles (pas déjà assignés)
  const availableAgents = agents.filter(
    agent => !localAssignments.some(a => a.agentId === agent.id)
  );

  return (
    <div className="w-full p-3 bg-gray-50 rounded border-2 border-blue-400">
      <div className="text-xs font-semibold text-gray-700 mb-2">
        {getTimeSlotLabel()}
      </div>

      {/* Liste des agents assignés */}
      <div className="space-y-1 mb-3">
        {localAssignments.length === 0 ? (
          <div className="text-xs text-gray-400 italic">Aucun agent assigné</div>
        ) : (
          localAssignments.map((assignment) => (
            <div
              key={assignment.agentId}
              className={`flex items-center justify-between p-2 rounded border ${poleColor}`}
            >
              <span className="text-xs font-medium">{assignment.agentNom}</span>
              <button
                onClick={() => handleRemoveAgent(assignment.agentId)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Retirer"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Ajouter un agent */}
      <div className="flex gap-1 mb-3">
        <select
          value={newAgentId}
          onChange={(e) => setNewAgentId(e.target.value)}
          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="">-- Ajouter un agent --</option>
          {availableAgents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.nom}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddAgent}
          disabled={!newAgentId}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Plus size={12} />
          Ajouter
        </button>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center justify-center gap-1"
        >
          <Check size={14} />
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 flex items-center justify-center gap-1"
        >
          <X size={14} />
          Annuler
        </button>
      </div>
    </div>
  );
}
