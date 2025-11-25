import { Agent, Assignment, Planning, Pole, DayOfWeek, FixedAssignment } from '@/types';
import { isAvailableForTimeSlot } from '@/utils/availabilityParser';
import { loadFixedAssignments } from './supabaseService';

const POLES: Pole[] = ['Secure Academy', 'Mutuelle', 'Stafy', 'Timeone'];
const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

/**
 * Algorithme de placement des agents sur les pôles
 * Respecte les assignations fixes et la continuité de poste (journée complète)
 */
export async function generatePlanning(agents: Agent[]): Promise<{ success: boolean; planning: Planning | null; warnings: string[] }> {
  // Charger les assignations fixes
  const fixedAssignmentsResult = await loadFixedAssignments();
  const fixedAssignments = fixedAssignmentsResult.success && fixedAssignmentsResult.fixedAssignments 
    ? fixedAssignmentsResult.fixedAssignments 
    : [];
  const warnings: string[] = [];
  const assignments: Assignment[] = [];
  const assignedAgentIds = new Set<string>();
  
  // Compteur de rotations par agent et par pôle
  const agentPoleHistory: Map<string, Map<Pole, number>> = new Map();
  
  // Initialiser l'historique
  agents.forEach(agent => {
    const poleMap = new Map<Pole, number>();
    POLES.forEach(pole => poleMap.set(pole, 0));
    agentPoleHistory.set(agent.id, poleMap);
  });

  // Créer un index des assignations fixes par jour
  const fixedAssignmentsByDay = new Map<DayOfWeek, FixedAssignment[]>();
  DAYS.forEach(day => {
    fixedAssignmentsByDay.set(
      day,
      fixedAssignments.filter(fa => fa.jour === day)
    );
  });

  // Pour chaque jour de la semaine
  DAYS.forEach(day => {
    // Suivre les agents déjà assignés ce jour-là (pour toute la journée maintenant)
    const assignedToday = new Set<string>();
    // Suivre les pôles déjà assignés pour éviter les doublons
    const poleAssignments = new Map<Pole, string[]>(); // pole -> [agentIds]
    
    POLES.forEach(pole => poleAssignments.set(pole, []));
    
    // ÉTAPE 1 : Appliquer les assignations fixes pour ce jour
    const dayFixedAssignments = fixedAssignmentsByDay.get(day) || [];
    dayFixedAssignments.forEach(fixedAssignment => {
      const agent = agents.find(a => a.id === fixedAssignment.agent_id);
      if (!agent) {
        warnings.push(`Agent ${fixedAssignment.agent_nom} non trouvé pour l'assignation fixe`);
        return;
      }

      const availability = agent.disponibilites[day];
      const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
      const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');

      // Si disponible toute la journée, assigner toute la journée
      if (availableMorning && availableAfternoon) {
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole: fixedAssignment.pole,
          jour: day,
          timeSlot: 'JOURNEE',
        });
        assignedToday.add(agent.id);
        poleAssignments.get(fixedAssignment.pole)?.push(agent.id);
        assignedAgentIds.add(agent.id);
        
        // Mettre à jour l'historique (compte pour 2 car matin + après-midi)
        const poleMap = agentPoleHistory.get(agent.id)!;
        poleMap.set(fixedAssignment.pole, (poleMap.get(fixedAssignment.pole) || 0) + 2);
      } else if (availableMorning) {
        // Disponible uniquement le matin
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole: fixedAssignment.pole,
          jour: day,
          timeSlot: 'MATIN',
        });
        assignedToday.add(agent.id);
        poleAssignments.get(fixedAssignment.pole)?.push(agent.id);
        assignedAgentIds.add(agent.id);
        
        const poleMap = agentPoleHistory.get(agent.id)!;
        poleMap.set(fixedAssignment.pole, (poleMap.get(fixedAssignment.pole) || 0) + 1);
      } else if (availableAfternoon) {
        // Disponible uniquement l'après-midi
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole: fixedAssignment.pole,
          jour: day,
          timeSlot: 'APRES_MIDI',
        });
        assignedToday.add(agent.id);
        poleAssignments.get(fixedAssignment.pole)?.push(agent.id);
        assignedAgentIds.add(agent.id);
        
        const poleMap = agentPoleHistory.get(agent.id)!;
        poleMap.set(fixedAssignment.pole, (poleMap.get(fixedAssignment.pole) || 0) + 1);
      } else {
        warnings.push(`Agent ${agent.nom} a une assignation fixe sur ${fixedAssignment.pole} le ${day} mais n'est pas disponible`);
      }
    });

    // ÉTAPE 2 : Assigner TOUS les agents restants disponibles
    // Objectif : Tous les agents doivent travailler avec répartition équitable
    // Stratégie : Round-robin pour équilibrer les pôles
    
    // Récupérer tous les agents non encore assignés ce jour
    const unassignedAgents = agents.filter(agent => !assignedToday.has(agent.id));
    
    // Compter le nombre d'agents par pôle pour ce jour (pour équilibrage)
    const poleAgentCount = new Map<Pole, number>();
    POLES.forEach(pole => {
      const count = poleAssignments.get(pole)?.length || 0;
      poleAgentCount.set(pole, count);
    });
    
    // Trier les agents par ordre alphabétique pour avoir un ordre déterministe
    const sortedUnassignedAgents = [...unassignedAgents].sort((a, b) => 
      a.nom.localeCompare(b.nom)
    );
    
    // Pour chaque agent non assigné, trouver le meilleur pôle
    sortedUnassignedAgents.forEach(agent => {
      const availability = agent.disponibilites[day];
      const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
      const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');
      
      // Si l'agent n'est pas disponible du tout ce jour, passer au suivant
      if (!availableMorning && !availableAfternoon) {
        return;
      }
      
      // Trouver le pôle avec le MOINS d'agents aujourd'hui (équilibrage jour par jour)
      // En cas d'égalité, prendre celui où l'agent a le moins travaillé dans la semaine
      const sortedPoles = [...POLES].sort((poleA, poleB) => {
        const countTodayA = poleAgentCount.get(poleA) || 0;
        const countTodayB = poleAgentCount.get(poleB) || 0;
        
        // Priorité 1 : Équilibrer aujourd'hui
        if (countTodayA !== countTodayB) {
          return countTodayA - countTodayB;
        }
        
        // Priorité 2 : Rotation sur la semaine
        const countWeekA = agentPoleHistory.get(agent.id)?.get(poleA) || 0;
        const countWeekB = agentPoleHistory.get(agent.id)?.get(poleB) || 0;
        return countWeekA - countWeekB;
      });
      
      const selectedPole = sortedPoles[0];
      
      // Assigner selon la disponibilité
      if (availableMorning && availableAfternoon) {
        // Disponible toute la journée
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole: selectedPole,
          jour: day,
          timeSlot: 'JOURNEE',
        });
        
        const poleMap = agentPoleHistory.get(agent.id)!;
        poleMap.set(selectedPole, (poleMap.get(selectedPole) || 0) + 2);
        assignedAgentIds.add(agent.id);
        assignedToday.add(agent.id);
        
        // Mettre à jour le compteur du jour
        poleAgentCount.set(selectedPole, (poleAgentCount.get(selectedPole) || 0) + 1);
      } else if (availableMorning) {
        // Disponible uniquement le matin
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole: selectedPole,
          jour: day,
          timeSlot: 'MATIN',
        });
        
        const poleMap = agentPoleHistory.get(agent.id)!;
        poleMap.set(selectedPole, (poleMap.get(selectedPole) || 0) + 1);
        assignedAgentIds.add(agent.id);
        assignedToday.add(agent.id);
        
        // Mettre à jour le compteur du jour
        poleAgentCount.set(selectedPole, (poleAgentCount.get(selectedPole) || 0) + 1);
      } else if (availableAfternoon) {
        // Disponible uniquement l'après-midi
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole: selectedPole,
          jour: day,
          timeSlot: 'APRES_MIDI',
        });
        
        const poleMap = agentPoleHistory.get(agent.id)!;
        poleMap.set(selectedPole, (poleMap.get(selectedPole) || 0) + 1);
        assignedAgentIds.add(agent.id);
        assignedToday.add(agent.id);
        
        // Mettre à jour le compteur du jour
        poleAgentCount.set(selectedPole, (poleAgentCount.get(selectedPole) || 0) + 1);
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

  assignments.forEach((assignment: Assignment) => {
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
  };
}

/**
 * Optimise le planning en essayant de mieux répartir les agents
 */
export function optimizePlanning(planning: Planning): Planning {
  // TODO: Implémenter l'optimisation
  // - Équilibrer la charge de travail
  // - Minimiser les conflits
  // - Maximiser la couverture
  return planning;
}
