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
