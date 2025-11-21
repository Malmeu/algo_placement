import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ewudpdkppclxwuuujtir.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dWRwZGtwcGNseHd1dXVqdGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjY4MDksImV4cCI6MjA3OTMwMjgwOX0.d0ygmi2Vrhj5B7Mx-R56K_7vuop3baLZ7PCXK2qOl20';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface DbAgent {
  id: string;
  nom: string;
  disponibilites: any; // JSONB
  created_at?: string;
  updated_at?: string;
}

export interface DbPlanning {
  id: string;
  date: string;
  assignments: any; // JSONB
  created_at: string;
  updated_at: string;
  stats?: any; // JSONB
  warnings?: string[];
}
