-- Schema pour la gestion des congés
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des congés
CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_nom TEXT NOT NULL,
  type_conge TEXT NOT NULL CHECK (type_conge IN ('CONGE', 'MALADIE', 'FORMATION', 'AUTRE')),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  motif TEXT,
  statut TEXT NOT NULL DEFAULT 'VALIDE' CHECK (statut IN ('VALIDE', 'EN_ATTENTE', 'REFUSE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte : date_fin doit être après date_debut
  CONSTRAINT leaves_date_check CHECK (date_fin >= date_debut)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_leaves_agent_id ON leaves(agent_id);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_leaves_statut ON leaves(statut);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_leaves_updated_at ON leaves;
CREATE TRIGGER update_leaves_updated_at
  BEFORE UPDATE ON leaves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS)
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (permettre tout pour l'instant - à ajuster selon vos besoins)
CREATE POLICY "Allow all operations on leaves" ON leaves
  FOR ALL USING (true) WITH CHECK (true);

-- Exemples de données (optionnel)
-- INSERT INTO leaves (id, agent_id, agent_nom, type_conge, date_debut, date_fin, motif) VALUES
-- ('leave-1', 'agent-1', 'Jean Dupont', 'CONGE', '2024-01-15', '2024-01-19', 'Vacances d''été'),
-- ('leave-2', 'agent-2', 'Marie Martin', 'MALADIE', '2024-02-05', '2024-02-07', 'Grippe');
