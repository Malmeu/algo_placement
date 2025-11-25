-- Migration : Ajout de la table des assignations fixes
-- À exécuter dans l'éditeur SQL de Supabase
-- Date : Novembre 2024

-- Table des assignations fixes
CREATE TABLE IF NOT EXISTS fixed_assignments (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_nom TEXT NOT NULL,
  pole TEXT NOT NULL CHECK (pole IN ('Secure Academy', 'Mutuelle', 'Stafy', 'Timeone')),
  jour TEXT NOT NULL CHECK (jour IN ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte : un agent ne peut avoir qu'une seule assignation fixe par jour
  CONSTRAINT unique_agent_day UNIQUE (agent_id, jour)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_fixed_assignments_agent_id ON fixed_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assignments_jour ON fixed_assignments(jour);
CREATE INDEX IF NOT EXISTS idx_fixed_assignments_pole ON fixed_assignments(pole);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_fixed_assignments_updated_at ON fixed_assignments;
CREATE TRIGGER update_fixed_assignments_updated_at
  BEFORE UPDATE ON fixed_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS)
ALTER TABLE fixed_assignments ENABLE ROW LEVEL SECURITY;

-- Politique RLS (permettre toutes les opérations)
CREATE POLICY "Allow all operations on fixed_assignments" ON fixed_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Commentaires pour la documentation
COMMENT ON TABLE fixed_assignments IS 'Assignations fixes : permet de forcer un agent sur un projet spécifique un jour donné';
COMMENT ON COLUMN fixed_assignments.agent_id IS 'ID de l''agent (référence vers la table agents)';
COMMENT ON COLUMN fixed_assignments.agent_nom IS 'Nom de l''agent (dénormalisé pour performance)';
COMMENT ON COLUMN fixed_assignments.pole IS 'Projet/Pôle assigné : Secure Academy, Mutuelle, Stafy, ou Timeone';
COMMENT ON COLUMN fixed_assignments.jour IS 'Jour de la semaine : LUNDI, MARDI, MERCREDI, JEUDI, ou VENDREDI';
COMMENT ON CONSTRAINT unique_agent_day ON fixed_assignments IS 'Un agent ne peut avoir qu''une seule assignation fixe par jour';
