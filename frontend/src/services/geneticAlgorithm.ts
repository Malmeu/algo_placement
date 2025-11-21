import { Agent, Assignment, Planning, PlacementResult, Pole, DayOfWeek } from '@/types';
import { isAvailableForTimeSlot } from '@/utils/availabilityParser';

const POLES: Pole[] = ['Secure Academy', 'Mutuelle', 'Stafy', 'Timeone'];
const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
const TIME_SLOTS: ('MATIN' | 'APRES_MIDI')[] = ['MATIN', 'APRES_MIDI'];

interface Chromosome {
  assignments: Assignment[];
  fitness: number;
}

/**
 * Algorithme génétique pour optimiser le placement des agents
 * Objectifs:
 * - Maximiser la couverture des pôles
 * - Équilibrer la charge de travail entre agents
 * - Minimiser les affectations répétitives
 * - Respecter les disponibilités
 */
export function generatePlanningWithGeneticAlgorithm(
  agents: Agent[],
  options: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
    eliteSize?: number;
  } = {}
): PlacementResult {
  const {
    populationSize = 50,
    generations = 100,
    mutationRate = 0.1,
    eliteSize = 5,
  } = options;

  console.log('🧬 Démarrage de l\'algorithme génétique...');
  console.log(`Population: ${populationSize}, Générations: ${generations}`);

  // Initialiser la population
  let population: Chromosome[] = initializePopulation(agents, populationSize);

  // Évolution sur N générations
  for (let gen = 0; gen < generations; gen++) {
    // Évaluer la fitness de chaque chromosome
    population.forEach(chromosome => {
      chromosome.fitness = calculateFitness(chromosome, agents);
    });

    // Trier par fitness (meilleur en premier)
    population.sort((a, b) => b.fitness - a.fitness);

    if (gen % 20 === 0) {
      console.log(`Génération ${gen}: Meilleure fitness = ${population[0].fitness.toFixed(2)}`);
    }

    // Sélection des élites
    const newPopulation: Chromosome[] = population.slice(0, eliteSize);

    // Créer la nouvelle génération
    while (newPopulation.length < populationSize) {
      // Sélection des parents (tournoi)
      const parent1 = tournamentSelection(population, 3);
      const parent2 = tournamentSelection(population, 3);

      // Croisement
      const child = crossover(parent1, parent2, agents);

      // Mutation
      if (Math.random() < mutationRate) {
        mutate(child, agents);
      }

      newPopulation.push(child);
    }

    population = newPopulation;
  }

  // Retourner le meilleur chromosome
  const best = population[0];
  console.log(`✅ Algorithme terminé. Fitness finale: ${best.fitness.toFixed(2)}`);

  const warnings: string[] = [];
  const assignedAgentIds = new Set(best.assignments.map(a => a.agentId));

  // Vérifier la couverture
  DAYS.forEach(day => {
    POLES.forEach(pole => {
      TIME_SLOTS.forEach(timeSlot => {
        const hasAssignment = best.assignments.some(
          a => a.jour === day && a.pole === pole && a.timeSlot === timeSlot
        );
        if (!hasAssignment) {
          warnings.push(`Aucun agent assigné pour ${pole} le ${day} (${timeSlot === 'MATIN' ? 'matin' : 'après-midi'})`);
        }
      });
    });
  });

  const polesCoverage: Record<Pole, number> = {
    'Secure Academy': 0,
    'Mutuelle': 0,
    'Stafy': 0,
    'Timeone': 0,
  };

  best.assignments.forEach(assignment => {
    polesCoverage[assignment.pole]++;
  });

  const planning: Planning = {
    id: `planning-genetic-${Date.now()}`,
    date: new Date().toISOString(),
    assignments: best.assignments,
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
 * Initialiser une population aléatoire
 */
function initializePopulation(agents: Agent[], size: number): Chromosome[] {
  const population: Chromosome[] = [];

  for (let i = 0; i < size; i++) {
    const assignments: Assignment[] = [];

    DAYS.forEach(day => {
      POLES.forEach(pole => {
        TIME_SLOTS.forEach(timeSlot => {
          // Trouver les agents disponibles
          const availableAgents = agents.filter(agent =>
            isAvailableForTimeSlot(agent.disponibilites[day], timeSlot)
          );

          if (availableAgents.length > 0) {
            // Sélectionner un agent aléatoire
            const agent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
            assignments.push({
              agentId: agent.id,
              agentNom: agent.nom,
              pole,
              jour: day,
              timeSlot,
            });
          }
        });
      });
    });

    population.push({ assignments, fitness: 0 });
  }

  return population;
}

/**
 * Calculer la fitness d'un chromosome
 * Plus la fitness est élevée, meilleur est le planning
 */
function calculateFitness(chromosome: Chromosome, agents: Agent[]): number {
  let fitness = 0;

  // 1. Couverture des créneaux (poids: 100)
  const totalSlots = DAYS.length * POLES.length * TIME_SLOTS.length;
  const coverage = chromosome.assignments.length / totalSlots;
  fitness += coverage * 100;

  // 2. Équilibre de la charge de travail (poids: 50)
  const agentWorkload = new Map<string, number>();
  chromosome.assignments.forEach(a => {
    agentWorkload.set(a.agentId, (agentWorkload.get(a.agentId) || 0) + 1);
  });

  const workloads = Array.from(agentWorkload.values());
  if (workloads.length > 0) {
    const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - avgWorkload, 2), 0) / workloads.length;
    const stdDev = Math.sqrt(variance);
    fitness += Math.max(0, 50 - stdDev * 5); // Pénaliser la variance
  }

  // 3. Diversité des pôles par agent (poids: 30)
  agentWorkload.forEach((count, agentId) => {
    const agentAssignments = chromosome.assignments.filter(a => a.agentId === agentId);
    const uniquePoles = new Set(agentAssignments.map(a => a.pole)).size;
    fitness += (uniquePoles / POLES.length) * 30;
  });

  // 4. Pénalités pour violations
  // Pénaliser si un agent est assigné plusieurs fois au même créneau
  const slotAssignments = new Map<string, Set<string>>();
  chromosome.assignments.forEach(a => {
    const key = `${a.jour}-${a.timeSlot}`;
    if (!slotAssignments.has(key)) {
      slotAssignments.set(key, new Set());
    }
    if (slotAssignments.get(key)!.has(a.agentId)) {
      fitness -= 20; // Pénalité forte
    }
    slotAssignments.get(key)!.add(a.agentId);
  });

  return fitness;
}

/**
 * Sélection par tournoi
 */
function tournamentSelection(population: Chromosome[], tournamentSize: number): Chromosome {
  const tournament: Chromosome[] = [];
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }
  return tournament.reduce((best, current) => current.fitness > best.fitness ? current : best);
}

/**
 * Croisement (crossover) entre deux parents
 */
function crossover(parent1: Chromosome, parent2: Chromosome, agents: Agent[]): Chromosome {
  const child: Assignment[] = [];
  const usedSlots = new Set<string>();

  // Prendre aléatoirement des gènes de chaque parent
  parent1.assignments.forEach(assignment => {
    const key = `${assignment.jour}-${assignment.pole}-${assignment.timeSlot}`;
    if (Math.random() < 0.5 && !usedSlots.has(key)) {
      child.push({ ...assignment });
      usedSlots.add(key);
    }
  });

  parent2.assignments.forEach(assignment => {
    const key = `${assignment.jour}-${assignment.pole}-${assignment.timeSlot}`;
    if (!usedSlots.has(key)) {
      child.push({ ...assignment });
      usedSlots.add(key);
    }
  });

  return { assignments: child, fitness: 0 };
}

/**
 * Mutation aléatoire
 */
function mutate(chromosome: Chromosome, agents: Agent[]): void {
  if (chromosome.assignments.length === 0) return;

  // Choisir une affectation aléatoire à muter
  const randomIndex = Math.floor(Math.random() * chromosome.assignments.length);
  const assignment = chromosome.assignments[randomIndex];

  // Trouver un nouvel agent disponible
  const availableAgents = agents.filter(agent =>
    isAvailableForTimeSlot(agent.disponibilites[assignment.jour], assignment.timeSlot) &&
    agent.id !== assignment.agentId
  );

  if (availableAgents.length > 0) {
    const newAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    assignment.agentId = newAgent.id;
    assignment.agentNom = newAgent.nom;
  }
}
