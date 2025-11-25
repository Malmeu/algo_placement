import { Agent, Assignment, Planning, Pole, DayOfWeek, FixedAssignment } from '@/types';
import { isAvailableForTimeSlot } from '@/utils/availabilityParser';
import { PROJECT_REQUIREMENTS } from '@/config/projectRequirements';

const POLES: Pole[] = ['Timeone', 'Mutuelle', 'Secure Academy', 'Stafy']; // Ordre de priorité
const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

/**
 * Algorithme de placement des agents sur les pôles avec les nouvelles règles :
 * 1. Un agent reste sur le même poste toute la journée (sauf si disponibilité partielle)
 * 2. Respect des assignations fixes
 * 3. Respect des besoins par projet
 * 4. Maximisation de l'utilisation des agents
 */
export function generatePlanning(
  agents: Agent[],
  fixedAssignments: FixedAssignment[] = []
): { success: boolean; planning: Planning | null; warnings: string[] } {
  const warnings: string[] = [];
  const assignments: Assignment[] = [];
  
  // Suivre quels agents sont assignés quel jour
  const agentDayAssignments: Map<string, Set<DayOfWeek>> = new Map();
  agents.forEach(agent => agentDayAssignments.set(agent.id, new Set()));
  
  // Compteur d'assignations par agent pour rotation équitable
  const agentAssignmentCount: Map<string, number> = new Map();
  agents.forEach(agent => agentAssignmentCount.set(agent.id, 0));

  // ÉTAPE 1 : Traiter les assignations fixes en priorité
  fixedAssignments.forEach(fixed => {
    const agent = agents.find(a => a.id === fixed.agentId);
    if (!agent) return;

    const availability = agent.disponibilites[fixed.jour];
    const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
    const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');

    // Créer les assignations selon la disponibilité
    if (availableMorning && availableAfternoon) {
      // Disponible toute la journée → assigné toute la journée
      assignments.push({
        agentId: fixed.agentId,
        agentNom: fixed.agentNom,
        pole: fixed.pole,
        jour: fixed.jour,
        timeSlot: 'JOURNEE',
        isFixed: true,
      });
      
      dailyAssignments.get(fixed.jour)!.set(fixed.agentId, {
        pole: fixed.pole,
        morning: true,
        afternoon: true,
      });
    } else if (availableMorning) {
      // Disponible uniquement le matin
      assignments.push({
        agentId: fixed.agentId,
        agentNom: fixed.agentNom,
        pole: fixed.pole,
        jour: fixed.jour,
        timeSlot: 'MATIN',
        isFixed: true,
      });
      
      dailyAssignments.get(fixed.jour)!.set(fixed.agentId, {
        pole: fixed.pole,
        morning: true,
        afternoon: false,
      });
    } else if (availableAfternoon) {
      // Disponible uniquement l'après-midi
      assignments.push({
        agentId: fixed.agentId,
        agentNom: fixed.agentNom,
        pole: fixed.pole,
        jour: fixed.jour,
        timeSlot: 'APRES_MIDI',
        isFixed: true,
      });
      
      dailyAssignments.get(fixed.jour)!.set(fixed.agentId, {
        pole: fixed.pole,
        morning: false,
        afternoon: true,
      });
    } else {
      warnings.push(`⚠️ ${fixed.agentNom} n'est pas disponible le ${fixed.jour} (assignation fixe ignorée)`);
    }
  });

  // ÉTAPE 2 : Assigner les agents selon les besoins des projets
  DAYS.forEach(day => {
    const dayAssignments = dailyAssignments.get(day)!;

    // Pour chaque projet, selon l'ordre de priorité
    POLES.forEach(pole => {
      const projectReq = PROJECT_REQUIREMENTS.find(p => p.pole === pole);
      const requiredCount = projectReq?.requirements[day] || 0;

      if (requiredCount === 0) return; // Pas de besoin pour ce projet ce jour-là

      // Compter combien d'agents sont déjà assignés (via assignations fixes)
      const alreadyAssigned = Array.from(dayAssignments.values()).filter(
        a => a.pole === pole && a.morning && a.afternoon
      ).length;

      const needed = requiredCount - alreadyAssigned;
      if (needed <= 0) return; // Besoin déjà satisfait

      // Trouver les agents disponibles pour toute la journée
      const availableAgents = agents.filter(agent => {
        // Déjà assigné ce jour ?
        if (dayAssignments.has(agent.id)) {
          const existing = dayAssignments.get(agent.id)!;
          // Si assigné toute la journée, pas disponible
          if (existing.morning && existing.afternoon) return false;
        }

        const availability = agent.disponibilites[day];
        const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
        const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');

        // On cherche des agents disponibles toute la journée
        return availableMorning && availableAfternoon;
      });

      // Trier par nombre d'assignations (rotation équitable)
      const sortedAgents = availableAgents.sort((a, b) => {
        const countA = agentAssignmentCount.get(a.id) || 0;
        const countB = agentAssignmentCount.get(b.id) || 0;
        return countA - countB; // Moins d'assignations en premier
      });

      // Assigner les agents nécessaires
      const toAssign = sortedAgents.slice(0, needed);
      toAssign.forEach(agent => {
        assignments.push({
          agentId: agent.id,
          agentNom: agent.nom,
          pole,
          jour: day,
          timeSlot: 'JOURNEE',
        });

        dayAssignments.set(agent.id, {
          pole,
          morning: true,
          afternoon: true,
        });
        
        // Incrémenter le compteur
        agentAssignmentCount.set(agent.id, (agentAssignmentCount.get(agent.id) || 0) + 1);
      });

      if (toAssign.length < needed) {
        warnings.push(
          `⚠️ ${pole} le ${day} : ${needed} agents requis, seulement ${toAssign.length} assignés`
        );
      }
    });

    // ÉTAPE 3 : Assigner les agents avec disponibilité partielle
    agents.forEach(agent => {
      const existing = dayAssignments.get(agent.id);
      const availability = agent.disponibilites[day];
      const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
      const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');

      // Si disponible uniquement le matin et pas encore assigné le matin
      if (availableMorning && !availableAfternoon && (!existing || !existing.morning)) {
        // Chercher un projet qui a encore besoin d'agents
        for (const pole of POLES) {
          const projectReq = PROJECT_REQUIREMENTS.find(p => p.pole === pole);
          const requiredCount = projectReq?.requirements[day];
          
          if (!requiredCount) continue;

          // Compter les assignations actuelles pour ce projet (matin)
          const currentMorning = assignments.filter(
            a => a.jour === day && a.pole === pole && (a.timeSlot === 'MATIN' || a.timeSlot === 'JOURNEE')
          ).length;

          if (currentMorning < requiredCount) {
            assignments.push({
              agentId: agent.id,
              agentNom: agent.nom,
              pole,
              jour: day,
              timeSlot: 'MATIN',
            });

            if (!existing) {
              dayAssignments.set(agent.id, { pole, morning: true, afternoon: false });
            } else {
              existing.morning = true;
            }
            break;
          }
        }
      }

      // Si disponible uniquement l'après-midi et pas encore assigné l'après-midi
      if (availableAfternoon && !availableMorning && (!existing || !existing.afternoon)) {
        // Chercher un projet qui a encore besoin d'agents
        for (const pole of POLES) {
          const projectReq = PROJECT_REQUIREMENTS.find(p => p.pole === pole);
          const requiredCount = projectReq?.requirements[day];
          
          if (!requiredCount) continue;

          // Compter les assignations actuelles pour ce projet (après-midi)
          const currentAfternoon = assignments.filter(
            a => a.jour === day && a.pole === pole && (a.timeSlot === 'APRES_MIDI' || a.timeSlot === 'JOURNEE')
          ).length;

          if (currentAfternoon < requiredCount) {
            assignments.push({
              agentId: agent.id,
              agentNom: agent.nom,
              pole,
              jour: day,
              timeSlot: 'APRES_MIDI',
            });

            if (!existing) {
              dayAssignments.set(agent.id, { pole, morning: false, afternoon: true });
            } else {
              existing.afternoon = true;
            }
            break;
          }
        }
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
