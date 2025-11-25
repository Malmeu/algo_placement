import { useState } from 'react';
import { Agent, Planning, DayOfWeek, Pole } from '@/types';
import { User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentViewProps {
  agents: Agent[];
  planning: Planning | null;
}

const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

const POLE_COLORS: Record<Pole, string> = {
  'Secure Academy': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mutuelle': 'bg-green-100 text-green-800 border-green-300',
  'Stafy': 'bg-purple-100 text-purple-800 border-purple-300',
  'Timeone': 'bg-orange-100 text-orange-800 border-orange-300',
};

export default function AgentView({ agents, planning }: AgentViewProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(
    agents.length > 0 ? agents[0].id : null
  );

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const getAgentAssignments = (agentId: string) => {
    if (!planning) return [];
    return planning.assignments.filter(a => a.agentId === agentId);
  };

  const getAssignmentsForDay = (agentId: string, day: DayOfWeek) => {
    const assignments = getAgentAssignments(agentId);
    return assignments.filter(a => a.jour === day);
  };

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun agent disponible</p>
        </div>
      </div>
    );
  }

  if (!planning) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Aucun planning généré</p>
          <p className="text-sm text-gray-400 mt-2">Générez un planning pour voir les affectations par agent</p>
        </div>
      </div>
    );
  }

  const agentAssignments = selectedAgent ? getAgentAssignments(selectedAgent.id) : [];
  // Calculer les heures : JOURNEE = 8h, MATIN/APRES_MIDI = 4h
  const totalHours = agentAssignments.reduce((total, assignment) => {
    return total + (assignment.timeSlot === 'JOURNEE' ? 8 : 4);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vue par agent</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des agents */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-gray-700 mb-3">Sélectionner un agent</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {agents.map((agent) => {
              const assignments = getAgentAssignments(agent.id);
              const isSelected = agent.id === selectedAgentId;

              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                    <span className="font-medium text-sm">{agent.nom}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {assignments.length} affectation{assignments.length > 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Planning de l'agent sélectionné */}
        <div className="lg:col-span-3">
          {selectedAgent ? (
            <div>
              {/* En-tête agent */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedAgent.nom}</h3>
                    <p className="text-blue-100">ID: {selectedAgent.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">{agentAssignments.length}</div>
                    <div className="text-sm text-blue-100">Affectations</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">{totalHours}h</div>
                    <div className="text-sm text-blue-100">Heures totales</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-2xl font-bold">
                      {new Set(agentAssignments.map(a => a.pole)).size}
                    </div>
                    <div className="text-sm text-blue-100">Pôles différents</div>
                  </div>
                </div>
              </div>

              {/* Planning hebdomadaire */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-4">Planning de la semaine</h4>
                {DAYS.map((day, index) => {
                  const dayAssignments = getAssignmentsForDay(selectedAgent.id, day);
                  const fullDayAssignment = dayAssignments.find(a => a.timeSlot === 'JOURNEE');
                  const morningAssignment = dayAssignments.find(a => a.timeSlot === 'MATIN');
                  const afternoonAssignment = dayAssignments.find(a => a.timeSlot === 'APRES_MIDI');

                  return (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="font-semibold text-gray-900 mb-3">{day}</div>
                      
                      {/* Affichage journée complète */}
                      {fullDayAssignment ? (
                        <div className={`p-4 rounded-lg border-2 ${POLE_COLORS[fullDayAssignment.pole]}`}>
                          <div className="text-xs font-medium mb-1">📅 Journée complète (8h-17h)</div>
                          <div className="font-semibold text-lg">{fullDayAssignment.pole}</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {/* Matin */}
                          <div>
                            {morningAssignment ? (
                              <div className={`p-3 rounded-lg border ${POLE_COLORS[morningAssignment.pole]}`}>
                                <div className="text-xs font-medium mb-1">🌅 Matin (8h-12h)</div>
                                <div className="font-semibold">{morningAssignment.pole}</div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-center">
                                <div className="text-xs">Matin</div>
                                <div className="text-sm">Libre</div>
                              </div>
                            )}
                          </div>

                          {/* Après-midi */}
                          <div>
                            {afternoonAssignment ? (
                              <div className={`p-3 rounded-lg border ${POLE_COLORS[afternoonAssignment.pole]}`}>
                                <div className="text-xs font-medium mb-1">☀️ Après-midi (13h-17h)</div>
                                <div className="font-semibold">{afternoonAssignment.pole}</div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-center">
                                <div className="text-xs">Après-midi</div>
                                <div className="text-sm">Libre</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Statistiques détaillées */}
              {agentAssignments.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Répartition par pôle</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(agentAssignments.map(a => a.pole))).map(pole => {
                      const poleAssignments = agentAssignments.filter(a => a.pole === pole);
                      const poleHours = poleAssignments.reduce((total, a) => {
                        return total + (a.timeSlot === 'JOURNEE' ? 8 : 4);
                      }, 0);
                      return (
                        <div key={pole} className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded text-sm ${POLE_COLORS[pole]}`}>
                            {pole}
                          </span>
                          <span className="text-sm text-gray-600">
                            {poleAssignments.length} affectation{poleAssignments.length > 1 ? 's' : ''} 
                            ({poleHours}h)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Sélectionnez un agent pour voir son planning
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
