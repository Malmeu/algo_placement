import { useMemo } from 'react';
import { Agent, Planning, Pole, AgentStats, PlanningAnalytics } from '@/types';
import { BarChart3, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsDashboardProps {
  planning: Planning;
  agents: Agent[];
}

const POLES: Pole[] = ['Secure Academy', 'Mutuelle', 'Stafy', 'Timeone'];

const POLE_COLORS: Record<Pole, string> = {
  'Secure Academy': 'bg-blue-500',
  'Mutuelle': 'bg-green-500',
  'Stafy': 'bg-purple-500',
  'Timeone': 'bg-orange-500',
};

export default function AnalyticsDashboard({ planning, agents }: AnalyticsDashboardProps) {
  const analytics: PlanningAnalytics = useMemo(() => {
    // Calculer les stats par agent
    const agentStatsMap = new Map<string, AgentStats>();
    
    agents.forEach(agent => {
      agentStatsMap.set(agent.id, {
        agentId: agent.id,
        agentNom: agent.nom,
        totalAssignments: 0,
        totalHours: 0,
        poleDistribution: {
          'Secure Academy': 0,
          'Mutuelle': 0,
          'Stafy': 0,
          'Timeone': 0,
        },
        morningShifts: 0,
        afternoonShifts: 0,
        utilizationRate: 0,
      });
    });

    // Analyser les affectations
    planning.assignments.forEach(assignment => {
      const stats = agentStatsMap.get(assignment.agentId);
      if (stats) {
        stats.totalAssignments++;
        stats.totalHours += 4; // 4h par créneau
        stats.poleDistribution[assignment.pole]++;
        if (assignment.timeSlot === 'MATIN') {
          stats.morningShifts++;
        } else {
          stats.afternoonShifts++;
        }
      }
    });

    // Calculer le taux d'utilisation (max 10 créneaux par semaine = 40h)
    agentStatsMap.forEach(stats => {
      stats.utilizationRate = (stats.totalAssignments / 10) * 100;
    });

    // Stats par pôle
    const poleStats: Record<Pole, any> = {
      'Secure Academy': { totalAssignments: 0, coverageRate: 0, uniqueAgents: new Set() },
      'Mutuelle': { totalAssignments: 0, coverageRate: 0, uniqueAgents: new Set() },
      'Stafy': { totalAssignments: 0, coverageRate: 0, uniqueAgents: new Set() },
      'Timeone': { totalAssignments: 0, coverageRate: 0, uniqueAgents: new Set() },
    };

    planning.assignments.forEach(assignment => {
      poleStats[assignment.pole].totalAssignments++;
      poleStats[assignment.pole].uniqueAgents.add(assignment.agentId);
    });

    // Calculer le taux de couverture (10 créneaux max par pôle)
    POLES.forEach(pole => {
      poleStats[pole].coverageRate = (poleStats[pole].totalAssignments / 10) * 100;
      poleStats[pole].uniqueAgents = poleStats[pole].uniqueAgents.size;
    });

    const totalPossibleAssignments = POLES.length * 10; // 4 pôles * 10 créneaux
    const coverageRate = (planning.assignments.length / totalPossibleAssignments) * 100;

    return {
      planningId: planning.id,
      totalAssignments: planning.assignments.length,
      coverageRate,
      agentStats: Array.from(agentStatsMap.values()).sort((a, b) => b.totalAssignments - a.totalAssignments),
      poleStats,
      warnings: [],
    };
  }, [planning, agents]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="text-blue-600" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Rapports</h2>
            <p className="text-sm text-gray-500">
              Analyse détaillée du planning du {new Date(planning.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users size={24} />
              <TrendingUp size={20} className="opacity-75" />
            </div>
            <div className="text-3xl font-bold">{analytics.agentStats.filter(s => s.totalAssignments > 0).length}</div>
            <div className="text-sm opacity-90">Agents actifs</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 size={24} />
              <TrendingUp size={20} className="opacity-75" />
            </div>
            <div className="text-3xl font-bold">{analytics.totalAssignments}</div>
            <div className="text-sm opacity-90">Affectations totales</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={24} />
              <TrendingUp size={20} className="opacity-75" />
            </div>
            <div className="text-3xl font-bold">{analytics.totalAssignments * 4}h</div>
            <div className="text-sm opacity-90">Heures totales</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle size={24} />
              <TrendingUp size={20} className="opacity-75" />
            </div>
            <div className="text-3xl font-bold">{analytics.coverageRate.toFixed(0)}%</div>
            <div className="text-sm opacity-90">Taux de couverture</div>
          </div>
        </div>
      </div>

      {/* Stats par pôle */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Répartition par pôle</h3>
        <div className="space-y-4">
          {POLES.map((pole, index) => {
            const stats = analytics.poleStats[pole];
            return (
              <motion.div
                key={pole}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${POLE_COLORS[pole]}`} />
                    <span className="font-semibold text-gray-900">{pole}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.totalAssignments} affectations • {stats.uniqueAgents} agents • {stats.coverageRate.toFixed(0)}% couverture
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${POLE_COLORS[pole]} transition-all duration-500`}
                    style={{ width: `${stats.coverageRate}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Top agents */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance des agents</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Agent</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Affectations</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Heures</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Matin</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Après-midi</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Utilisation</th>
              </tr>
            </thead>
            <tbody>
              {analytics.agentStats.filter(s => s.totalAssignments > 0).map((stats, index) => (
                <motion.tr
                  key={stats.agentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{stats.agentNom}</td>
                  <td className="py-3 px-4 text-center">{stats.totalAssignments}</td>
                  <td className="py-3 px-4 text-center">{stats.totalHours}h</td>
                  <td className="py-3 px-4 text-center">{stats.morningShifts}</td>
                  <td className="py-3 px-4 text-center">{stats.afternoonShifts}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(stats.utilizationRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.utilizationRate.toFixed(0)}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution par pôle pour chaque agent */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Distribution des pôles par agent</h3>
        <div className="space-y-4">
          {analytics.agentStats.filter(s => s.totalAssignments > 0).slice(0, 10).map((stats, index) => (
            <motion.div
              key={stats.agentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="font-semibold text-gray-900 mb-3">{stats.agentNom}</div>
              <div className="flex gap-2">
                {POLES.map(pole => {
                  const count = stats.poleDistribution[pole];
                  const percentage = stats.totalAssignments > 0 ? (count / stats.totalAssignments) * 100 : 0;
                  return count > 0 ? (
                    <div
                      key={pole}
                      className={`${POLE_COLORS[pole]} text-white px-3 py-1 rounded text-sm flex items-center gap-2`}
                      style={{ width: `${percentage}%`, minWidth: '60px' }}
                    >
                      <span className="font-medium">{count}</span>
                      <span className="text-xs opacity-90">{pole.split(' ')[0]}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
