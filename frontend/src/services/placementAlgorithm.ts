import { Agent, Assignment, Planning, PlacementResult, Pole, DayOfWeek } from '@/types';
import { isAvailableForTimeSlot } from '@/utils/availabilityParser';

const POLES: Pole[] = ['Secure Academy', 'Mutuelle', 'Stafy', 'Timeone'];
const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

/**
 * Algorithme de placement des agents sur les pôles
 */
export function generatePlanning(agents: Agent[]): PlacementResult {
  const assignments: Assignment[] = [];
  const warnings: string[] = [];
  const assignedAgentIds = new Set<string>();
  
  // Compteur de rotations par agent et par pôle
  const agentPoleHistory: Map<string, Map<Pole, number>> = new Map();
  
  // Initialiser l'historique
  agents.forEach(agent => {
    const poleMap = new Map<Pole, number>();
    POLES.forEach(pole => poleMap.set(pole, 0));
    agentPoleHistory.set(agent.id, poleMap);
  });

  // Pour chaque jour de la semaine
  DAYS.forEach(day => {
    // Suivre les agents déjà assignés ce jour-là par créneau
    // Un agent peut travailler matin ET après-midi (mais pas sur 2 pôles différents le même créneau)
    const assignedMorning = new Set<string>();
    const assignedAfternoon = new Set<string>();
    
    // Pour chaque pôle, on assigne 2 agents : 1 matin + 1 après-midi
    POLES.forEach(pole => {
      // === MATIN (8h-12h) ===
      const availableAgentsMorning = agents.filter(agent => {
        const availability = agent.disponibilites[day];
        const isAvailable = isAvailableForTimeSlot(availability, 'MATIN');
        const notAssignedMorning = !assignedMorning.has(agent.id);
        
        // Un agent peut travailler le matin même s'il a déjà travaillé l'après-midi
        return isAvailable && notAssignedMorning;
      });

      if (availableAgentsMorning.length === 0) {
        warnings.push(`Aucun agent disponible pour ${pole} le ${day} (matin)`);
      } else {
        // Trier par rotation équitable
        const sortedAgentsMorning = availableAgentsMorning.sort((a, b) => {
          const aCount = agentPoleHistory.get(a.id)?.get(pole) || 0;
          const bCount = agentPoleHistory.get(b.id)?.get(pole) || 0;
          return aCount - bCount;
        });

        const selectedAgentMorning = sortedAgentsMorning[0];

        // Créer l'affectation matin
        assignments.push({
          agentId: selectedAgentMorning.id,
          agentNom: selectedAgentMorning.nom,
          pole,
          jour: day,
          timeSlot: 'MATIN',
        });

        // Mettre à jour l'historique
        const poleMap = agentPoleHistory.get(selectedAgentMorning.id)!;
        poleMap.set(pole, (poleMap.get(pole) || 0) + 1);
        assignedAgentIds.add(selectedAgentMorning.id);
        assignedMorning.add(selectedAgentMorning.id);
      }

      // === APRÈS-MIDI (13h-17h) ===
      const availableAgentsAfternoon = agents.filter(agent => {
        const availability = agent.disponibilites[day];
        const isAvailable = isAvailableForTimeSlot(availability, 'APRES_MIDI');
        const notAssignedAfternoon = !assignedAfternoon.has(agent.id);
        
        return isAvailable && notAssignedAfternoon;
      });

      if (availableAgentsAfternoon.length === 0) {
        warnings.push(`Aucun agent disponible pour ${pole} le ${day} (après-midi)`);
      } else {
        // Trier par rotation équitable
        const sortedAgentsAfternoon = availableAgentsAfternoon.sort((a, b) => {
          const aCount = agentPoleHistory.get(a.id)?.get(pole) || 0;
          const bCount = agentPoleHistory.get(b.id)?.get(pole) || 0;
          return aCount - bCount;
        });

        const selectedAgentAfternoon = sortedAgentsAfternoon[0];

        // Créer l'affectation après-midi
        assignments.push({
          agentId: selectedAgentAfternoon.id,
          agentNom: selectedAgentAfternoon.nom,
          pole,
          jour: day,
          timeSlot: 'APRES_MIDI',
        });

        // Mettre à jour l'historique
        const poleMap = agentPoleHistory.get(selectedAgentAfternoon.id)!;
        poleMap.set(pole, (poleMap.get(pole) || 0) + 1);
        assignedAgentIds.add(selectedAgentAfternoon.id);
        assignedAfternoon.add(selectedAgentAfternoon.id);
      }
    });
  });

  // Calculer les statistiques
  const polesCoverage: Record<Pole, number> = {
    'Secure Academy': 0,
    'Mutuelle': 0,
    'Stafy': 0,
    'Timeone': 0,
  };

  assignments.forEach(assignment => {
    polesCoverage[assignment.pole]++;
  });

  const planning: Planning = {
    id: `planning-${Date.now()}`,
    date: new Date().toISOString(),
    assignments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    planning,
    warnings,
    stats: {
      totalAgents: agents.length,
      assignedAgents: assignedAgentIds.size,
      unassignedAgents: agents.length - assignedAgentIds.size,
      polesCoverage,
    },
  };
}

/**
 * Optimise le planning en essayant de mieux répartir les agents
 */
export function optimizePlanning(planning: Planning, agents: Agent[]): Planning {
  // TODO: Implémenter l'optimisation
  // - Équilibrer la charge de travail
  // - Minimiser les conflits
  // - Maximiser la couverture
  return planning;
}
