import React, { useState } from 'react';
import { Agent, DayOfWeek } from '@/types';
import { X, Save } from 'lucide-react';

interface AgentFormProps {
  agent?: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

const AVAILABILITY_OPTIONS = [
  'DISPONIBLE',
  'PAS DISPONIBLE',
  'DISPONIBLE MATIN',
  'DISPONIBLE APRES MIDI',
  'DISPONIBLE PARFOIS APRES MIDI',
  'DISPONIBLE A PARTIR DE',
  'PAS DISPONIBLE DE',
];

export default function AgentForm({ agent, onSave, onCancel }: AgentFormProps) {
  const [nom, setNom] = useState(agent?.nom || '');
  const [disponibilites, setDisponibilites] = useState<Record<DayOfWeek, string>>(
    agent?.disponibilites
      ? (Object.fromEntries(
          Object.entries(agent.disponibilites).map(([day, avail]) => [
            day,
            avail.type +
              (avail.startTime ? ` ${avail.startTime}` : '') +
              (avail.timeRange ? ` ${avail.timeRange.start}-${avail.timeRange.end}` : ''),
          ])
        ) as Record<DayOfWeek, string>)
      : {
          LUNDI: 'DISPONIBLE',
          MARDI: 'DISPONIBLE',
          MERCREDI: 'DISPONIBLE',
          JEUDI: 'DISPONIBLE',
          VENDREDI: 'DISPONIBLE',
        }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim()) {
      alert('Le nom est requis');
      return;
    }

    // Convertir les disponibilités en format Agent
    const newAgent: Agent = {
      id: agent?.id || `agent-${Date.now()}`,
      nom: nom.trim(),
      disponibilites: Object.fromEntries(
        Object.entries(disponibilites).map(([day, value]) => {
          // Parser la valeur pour créer l'objet Availability
          const parts = value.split(' ');
          const type = parts.slice(0, parts.length > 2 ? -1 : parts.length).join(' ');
          
          if (type.includes('A PARTIR DE')) {
            return [
              day,
              {
                type: 'DISPONIBLE A PARTIR DE',
                startTime: parts[parts.length - 1],
              },
            ];
          } else if (type.includes('PAS DISPONIBLE DE')) {
            const timeRange = parts[parts.length - 1].split('-');
            return [
              day,
              {
                type: 'PAS DISPONIBLE DE',
                timeRange: {
                  start: timeRange[0],
                  end: timeRange[1],
                },
              },
            ];
          } else {
            return [day, { type: value as any }];
          }
        })
      ) as any,
    };

    onSave(newAgent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {agent ? 'Modifier l\'agent' : 'Ajouter un agent'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'agent *
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Marie Dupont"
              required
            />
          </div>

          {/* Disponibilités */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Disponibilités par jour
            </h3>
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-gray-700">
                    {day}
                  </label>
                  <select
                    value={disponibilites[day]}
                    onChange={(e) =>
                      setDisponibilites({ ...disponibilites, [day]: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                  {/* Champ pour l'heure si "A PARTIR DE" */}
                  {disponibilites[day].includes('A PARTIR DE') && (
                    <input
                      type="time"
                      value={disponibilites[day].split(' ').pop() || ''}
                      onChange={(e) =>
                        setDisponibilites({
                          ...disponibilites,
                          [day]: `DISPONIBLE A PARTIR DE ${e.target.value}`,
                        })
                      }
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {agent ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
