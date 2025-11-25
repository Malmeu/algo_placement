export type AvailabilityType =
  | 'DISPONIBLE'
  | 'PAS DISPONIBLE'
  | 'DISPONIBLE A PARTIR DE'
  | 'PAS DISPONIBLE DE'
  | 'DISPONIBLE PARFOIS APRES MIDI'
  | 'DISPONIBLE MATIN'
  | 'DISPONIBLE APRES MIDI';

export type DayOfWeek = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI';

export interface TimeRange {
  start: string; // Format HH:MM
  end: string;   // Format HH:MM
}

export interface Availability {
  type: AvailabilityType;
  timeRange?: TimeRange;
  startTime?: string; // Pour "DISPONIBLE A PARTIR DE"
}

export interface Agent {
  id: string;
  nom: string;
  disponibilites: Record<DayOfWeek, Availability>;
}

export type Pole = 'Secure Academy' | 'Mutuelle' | 'Stafy' | 'Timeone';

export interface Assignment {
  agentId: string;
  agentNom: string;
  pole: Pole;
  jour: DayOfWeek;
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE';
}

export interface Planning {
  id: string;
  date: string;
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacementResult {
  success: boolean;
  planning: Planning;
  warnings: string[];
  stats: {
    totalAgents: number;
    assignedAgents: number;
    unassignedAgents: number;
    polesCoverage: Record<Pole, number>;
  };
}

export interface CSVRow {
  NOM: string;
  LUNDI: string;
  MARDI: string;
  MERCREDI: string;
  JEUDI: string;
  VENDREDI: string;
}

// Gestion des congés
export interface Leave {
  id: string;
  agent_id: string; // Correspond à la colonne SQL
  agent_nom: string; // Correspond à la colonne SQL
  type_conge: 'CONGE' | 'MALADIE' | 'FORMATION' | 'AUTRE'; // Correspond à la colonne SQL
  date_debut: string; // Format YYYY-MM-DD (DATE SQL)
  date_fin: string;   // Format YYYY-MM-DD (DATE SQL)
  motif?: string; // Correspond à la colonne SQL
  statut: 'VALIDE' | 'EN_ATTENTE' | 'REFUSE'; // Correspond à la colonne SQL
  created_at: string;
  updated_at: string;
}

// Analytics
export interface AgentStats {
  agentId: string;
  agentNom: string;
  totalAssignments: number;
  totalHours: number;
  poleDistribution: Record<Pole, number>;
  morningShifts: number;
  afternoonShifts: number;
  utilizationRate: number; // Pourcentage d'utilisation
}

export interface PlanningAnalytics {
  planningId: string;
  totalAssignments: number;
  coverageRate: number; // Pourcentage de couverture
  agentStats: AgentStats[];
  poleStats: Record<Pole, {
    totalAssignments: number;
    coverageRate: number;
    uniqueAgents: number;
  }>;
  warnings: string[];
}

// Assignations fixes
export interface FixedAssignment {
  id: string;
  agent_id: string;
  agent_nom: string;
  pole: Pole;
  jour: DayOfWeek;
  created_at: string;
  updated_at: string;
}
