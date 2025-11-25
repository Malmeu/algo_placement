import { supabase, DbAgent, DbPlanning, DbFixedAssignment } from '@/lib/supabase';
import { Agent, Planning, FixedAssignment, Pole, DayOfWeek } from '@/types';

/**
 * Service pour gérer les interactions avec Supabase
 */

// ============= AGENTS =============

export async function saveAgent(agent: Agent): Promise<{ success: boolean; error?: string }> {
  try {
    const dbAgent: DbAgent = {
      id: agent.id,
      nom: agent.nom,
      disponibilites: agent.disponibilites,
    };

    const { error } = await supabase
      .from('agents')
      .upsert(dbAgent, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de l\'agent:', error);
    return { success: false, error: error.message };
  }
}

export async function saveAgents(agents: Agent[]): Promise<{ success: boolean; error?: string }> {
  try {
    const dbAgents: DbAgent[] = agents.map(agent => ({
      id: agent.id,
      nom: agent.nom,
      disponibilites: agent.disponibilites,
    }));

    const { error } = await supabase
      .from('agents')
      .upsert(dbAgents, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde des agents:', error);
    return { success: false, error: error.message };
  }
}

export async function loadAgents(): Promise<{ success: boolean; agents?: Agent[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('nom', { ascending: true });

    if (error) throw error;

    const agents: Agent[] = (data || []).map((dbAgent: DbAgent) => ({
      id: dbAgent.id,
      nom: dbAgent.nom,
      disponibilites: dbAgent.disponibilites,
    }));

    return { success: true, agents };
  } catch (error: any) {
    console.error('Erreur lors du chargement des agents:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'agent:', error);
    return { success: false, error: error.message };
  }
}

// ============= PLANNINGS =============

export async function savePlanning(planning: Planning): Promise<{ success: boolean; error?: string }> {
  try {
    const dbPlanning: DbPlanning = {
      id: planning.id,
      date: planning.date,
      assignments: planning.assignments,
      created_at: planning.createdAt,
      updated_at: planning.updatedAt,
    };

    const { error } = await supabase
      .from('plannings')
      .upsert(dbPlanning, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du planning:', error);
    return { success: false, error: error.message };
  }
}

export async function loadPlannings(limit: number = 10): Promise<{ success: boolean; plannings?: Planning[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('plannings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const plannings: Planning[] = (data || []).map((dbPlanning: DbPlanning) => ({
      id: dbPlanning.id,
      date: dbPlanning.date,
      assignments: dbPlanning.assignments,
      createdAt: dbPlanning.created_at,
      updatedAt: dbPlanning.updated_at,
    }));

    return { success: true, plannings };
  } catch (error: any) {
    console.error('Erreur lors du chargement des plannings:', error);
    return { success: false, error: error.message };
  }
}

export async function loadPlanning(planningId: string): Promise<{ success: boolean; planning?: Planning; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('plannings')
      .select('*')
      .eq('id', planningId)
      .single();

    if (error) throw error;

    const planning: Planning = {
      id: data.id,
      date: data.date,
      assignments: data.assignments,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, planning };
  } catch (error: any) {
    console.error('Erreur lors du chargement du planning:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePlanning(planningId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('plannings')
      .delete()
      .eq('id', planningId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la suppression du planning:', error);
    return { success: false, error: error.message };
  }
}

// ============= ASSIGNATIONS FIXES =============

export async function saveFixedAssignment(
  agentId: string,
  agentNom: string,
  pole: Pole,
  jour: DayOfWeek
): Promise<{ success: boolean; error?: string }> {
  try {
    const id = `${agentId}_${jour}_${Date.now()}`;
    const dbFixedAssignment: DbFixedAssignment = {
      id,
      agent_id: agentId,
      agent_nom: agentNom,
      pole,
      jour,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('fixed_assignments')
      .upsert(dbFixedAssignment, { onConflict: 'agent_id,jour' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de l\'assignation fixe:', error);
    return { success: false, error: error.message };
  }
}

export async function loadFixedAssignments(): Promise<{ success: boolean; fixedAssignments?: FixedAssignment[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('fixed_assignments')
      .select('*')
      .order('jour', { ascending: true })
      .order('agent_nom', { ascending: true });

    if (error) throw error;

    const fixedAssignments: FixedAssignment[] = (data || []).map((db: DbFixedAssignment) => ({
      id: db.id,
      agent_id: db.agent_id,
      agent_nom: db.agent_nom,
      pole: db.pole as Pole,
      jour: db.jour as DayOfWeek,
      created_at: db.created_at,
      updated_at: db.updated_at,
    }));

    return { success: true, fixedAssignments };
  } catch (error: any) {
    console.error('Erreur lors du chargement des assignations fixes:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFixedAssignment(assignmentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('fixed_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'assignation fixe:', error);
    return { success: false, error: error.message };
  }
}

export async function getFixedAssignmentsByDay(jour: DayOfWeek): Promise<{ success: boolean; fixedAssignments?: FixedAssignment[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('fixed_assignments')
      .select('*')
      .eq('jour', jour)
      .order('agent_nom', { ascending: true });

    if (error) throw error;

    const fixedAssignments: FixedAssignment[] = (data || []).map((db: DbFixedAssignment) => ({
      id: db.id,
      agent_id: db.agent_id,
      agent_nom: db.agent_nom,
      pole: db.pole as Pole,
      jour: db.jour as DayOfWeek,
      created_at: db.created_at,
      updated_at: db.updated_at,
    }));

    return { success: true, fixedAssignments };
  } catch (error: any) {
    console.error('Erreur lors du chargement des assignations fixes par jour:', error);
    return { success: false, error: error.message };
  }
}
