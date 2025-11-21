import { User, Edit2, Trash2 } from 'lucide-react';
import { Agent, DayOfWeek } from '@/types';
import { getAvailabilityColor, formatAvailability } from '@/utils/availabilityParser';

interface AgentsListProps {
  agents: Agent[];
  onEdit?: (agent: Agent) => void;
  onDelete?: (agentId: string) => void;
}

const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

export default function AgentsList({ agents, onEdit, onDelete }: AgentsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Liste des agents</h2>
        <div className="flex items-center space-x-2 text-gray-600">
          <User className="w-5 h-5" />
          <span className="font-medium">{agents.length} agent{agents.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun agent importé</p>
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.nom}</h3>
                    <p className="text-sm text-gray-500">ID: {agent.id}</p>
                  </div>
                </div>
                
                {/* Boutons d'action */}
                {(onEdit || onDelete) && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(agent)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(agent.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Disponibilités */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {DAYS.map((day) => {
                  const availability = agent.disponibilites[day];
                  const colorClass = getAvailabilityColor(availability);
                  const label = formatAvailability(availability);

                  return (
                    <div
                      key={day}
                      className={`px-3 py-2 rounded-md border text-sm ${colorClass}`}
                    >
                      <div className="font-medium mb-1">{day}</div>
                      <div className="text-xs">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
