import { useState } from 'react';
import { Agent, Assignment, Pole, DayOfWeek } from '@/types';
import { Edit2, Check, X } from 'lucide-react';

interface EditableAssignmentProps {
  assignment: Assignment | null;
  pole: Pole;
  day: DayOfWeek;
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE';
  agents: Agent[];
  onUpdate: (assignment: Assignment) => void;
  poleColor: string;
}

export default function EditableAssignment({
  assignment,
  pole,
  day,
  timeSlot,
  agents,
  onUpdate,
  poleColor,
}: EditableAssignmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(assignment?.agentId || '');

  const handleSave = () => {
    if (!selectedAgentId) {
      alert('Veuillez sélectionner un agent');
      return;
    }

    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    if (!selectedAgent) return;

    const newAssignment: Assignment = {
      agentId: selectedAgent.id,
      agentNom: selectedAgent.nom,
      pole,
      jour: day,
      timeSlot,
    };

    onUpdate(newAssignment);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedAgentId(assignment?.agentId || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full p-2 bg-gray-50 rounded border-2 border-blue-400">
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded mb-2"
        >
          <option value="">-- Sélectionner --</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.nom}
            </option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center justify-center gap-1"
          >
            <Check size={12} />
            OK
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 flex items-center justify-center gap-1"
          >
            <X size={12} />
            Annuler
          </button>
        </div>
      </div>
    );
  }

  const getTimeSlotLabel = () => {
    if (timeSlot === 'MATIN') return '🌅 Matin (8h-12h)';
    if (timeSlot === 'APRES_MIDI') return '☀️ Après-midi (13h-17h)';
    return '📅 Journée complète (8h-17h)';
  };

  const getEmptyLabel = () => {
    if (timeSlot === 'MATIN') return 'Matin non assigné';
    if (timeSlot === 'APRES_MIDI') return 'Après-midi non assigné';
    return 'Journée non assignée';
  };

  if (assignment) {
    return (
      <div className={`w-full p-1.5 rounded border ${poleColor} text-center group relative`}>
        <div className="font-medium text-xs">{assignment.agentNom}</div>
        <div className="text-[10px] mt-0.5 opacity-75">
          {getTimeSlotLabel()}
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-1 right-1 p-1 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
          title="Modifier"
        >
          <Edit2 size={12} className="text-blue-600" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full text-gray-400 text-[10px] text-center py-1 hover:bg-gray-50 rounded transition-colors"
    >
      {getEmptyLabel()}
      <div className="text-blue-500 text-xs mt-1">+ Assigner</div>
    </button>
  );
}
