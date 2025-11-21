-- Schema pour Algo Placement
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des agents
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  disponibilites JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des plannings
CREATE TABLE IF NOT EXISTS plannings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  assignments JSONB NOT NULL,
  stats JSONB,
  warnings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_agents_nom ON agents(nom);
CREATE INDEX IF NOT EXISTS idx_plannings_created_at ON plannings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plannings_date ON plannings(date);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plannings_updated_at ON plannings;
CREATE TRIGGER update_plannings_updated_at
  BEFORE UPDATE ON plannings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (permettre tout pour l'instant - à ajuster selon vos besoins)
CREATE POLICY "Allow all operations on agents" ON agents
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on plannings" ON plannings
  FOR ALL USING (true) WITH CHECK (true);
