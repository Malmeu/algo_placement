# Implémentation des Assignations Fixes et Continuité de Poste

## 📋 Résumé des changements

### 1. **Nouvelle règle de continuité de poste**
Un agent assigné à un poste doit y rester **toute la journée** (matin ET soir), sauf si sa disponibilité ne le permet pas.

- ✅ Si disponible matin ET après-midi → Assignation `JOURNEE`
- ✅ Si disponible uniquement matin → Assignation `MATIN`
- ✅ Si disponible uniquement après-midi → Assignation `APRES_MIDI`

### 2. **Système d'assignations fixes**
Possibilité de forcer un agent sur un projet spécifique un jour donné.

**Exemple :** Inas Sahel doit impérativement travailler dans le projet Secure Academy le lundi.

## 🗄️ Base de données

### Migration SQL
Fichier : `supabase_migration_fixed_assignments.sql`

```sql
CREATE TABLE IF NOT EXISTS fixed_assignments (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_nom TEXT NOT NULL,
  pole TEXT NOT NULL CHECK (pole IN ('Secure Academy', 'Mutuelle', 'Stafy', 'Timeone')),
  jour TEXT NOT NULL CHECK (jour IN ('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_agent_day UNIQUE (agent_id, jour)
);
```

**⚠️ Important :** Exécutez cette migration dans l'éditeur SQL de Supabase avant d'utiliser les assignations fixes.

## 📁 Fichiers modifiés

### 1. Types (`frontend/src/types/index.ts`)
```typescript
export interface FixedAssignment {
  id: string;
  agent_id: string;
  agent_nom: string;
  pole: Pole;
  jour: DayOfWeek;
  created_at: string;
  updated_at: string;
}
```

### 2. Service Supabase (`frontend/src/services/supabaseService.ts`)
Nouvelles fonctions :
- `saveFixedAssignment()` - Créer une assignation fixe
- `loadFixedAssignments()` - Charger toutes les assignations fixes
- `deleteFixedAssignment()` - Supprimer une assignation fixe
- `getFixedAssignmentsByDay()` - Récupérer les assignations d'un jour spécifique

### 3. Composant UI (`frontend/src/components/FixedAssignmentsManager.tsx`)
Interface complète pour gérer les assignations fixes :
- ✅ Formulaire d'ajout avec sélection agent/projet/jour
- ✅ Liste des assignations groupées par jour
- ✅ Suppression d'assignations
- ✅ Messages de succès/erreur
- ✅ Design moderne avec Tailwind CSS

### 4. Algorithme de placement (`frontend/src/services/placementAlgorithm.ts`)
**Modifications majeures :**

#### Étape 1 : Chargement des assignations fixes
```typescript
const fixedAssignmentsResult = await loadFixedAssignments();
const fixedAssignments = fixedAssignmentsResult.success && fixedAssignmentsResult.fixedAssignments 
  ? fixedAssignmentsResult.fixedAssignments 
  : [];
```

#### Étape 2 : Application des assignations fixes
Les assignations fixes sont appliquées en **priorité** avant l'assignation automatique.

#### Étape 3 : Assignation automatique avec continuité
1. **Priorité 1** : Chercher un agent disponible toute la journée
2. **Priorité 2** : Si aucun agent disponible toute la journée, assigner séparément matin et après-midi

```typescript
// Priorité aux agents disponibles toute la journée
const availableFullDay = agents.filter(agent => {
  if (assignedToday.has(agent.id)) return false;
  
  const availability = agent.disponibilites[day];
  const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
  const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');
  
  return availableMorning && availableAfternoon;
});
```

### 5. Application principale (`frontend/src/App.tsx`)
- ✅ Nouvel onglet "Assignations fixes" avec icône Pin
- ✅ Intégration du composant `FixedAssignmentsManager`
- ✅ Mise à jour pour gérer l'asynchronicité de `generatePlanning()`

## 🎯 Fonctionnalités

### Interface d'assignations fixes
1. **Accès** : Onglet "Assignations fixes" dans la navigation
2. **Ajout** :
   - Sélectionner un agent
   - Sélectionner un projet (Secure Academy, Mutuelle, Stafy, Timeone)
   - Sélectionner un jour (Lundi - Vendredi)
   - Cliquer sur "Ajouter"
3. **Visualisation** : Les assignations sont groupées par jour
4. **Suppression** : Bouton de suppression pour chaque assignation

### Génération de planning
1. Les assignations fixes sont appliquées en premier
2. L'algorithme respecte la disponibilité de l'agent pour l'assignation fixe
3. Les agents restants sont assignés automatiquement
4. Priorité donnée aux assignations journée complète

## ⚠️ Contraintes et validations

### Base de données
- ✅ Un agent ne peut avoir qu'**une seule** assignation fixe par jour
- ✅ Les assignations fixes sont supprimées automatiquement si l'agent est supprimé (CASCADE)
- ✅ Les pôles et jours sont validés par des contraintes CHECK

### Algorithme
- ✅ Vérification de la disponibilité de l'agent avant d'appliquer une assignation fixe
- ✅ Warnings si un agent a une assignation fixe mais n'est pas disponible
- ✅ Un agent ne peut être assigné qu'une seule fois par jour (sauf si matin ET après-midi)

## 🚀 Prochaines étapes suggérées

### Paramètres de projets (à implémenter)
Vous avez mentionné vouloir ajouter :

1. **Secure Academy** :
   - Jeudi : 2 agents requis
   - Autres jours : ? agents

2. **Mutuelle** :
   - Toujours 3 agents (tous les jours ?)

3. **TimeOne** :
   - Lundi : 4 agents
   - Mardi, Mercredi, Vendredi : 5 agents
   - Jeudi : 3 agents

**Recommandation :** Créer une nouvelle table `project_requirements` :
```sql
CREATE TABLE project_requirements (
  id TEXT PRIMARY KEY,
  pole TEXT NOT NULL,
  jour TEXT NOT NULL,
  agents_required INTEGER NOT NULL,
  UNIQUE(pole, jour)
);
```

### Améliorations futures
- [ ] Interface pour configurer les besoins en agents par projet/jour
- [ ] Validation que le nombre d'agents assignés correspond aux besoins
- [ ] Alertes si un projet manque d'agents
- [ ] Export des assignations fixes en CSV
- [ ] Import d'assignations fixes en masse
- [ ] Historique des modifications d'assignations fixes

## 📝 Notes importantes

1. **Migration SQL** : N'oubliez pas d'exécuter la migration dans Supabase
2. **Fonction async** : `generatePlanning()` est maintenant asynchrone
3. **Compatibilité** : L'algorithme génétique ne prend pas encore en compte les assignations fixes
4. **Performance** : Les assignations fixes sont chargées à chaque génération de planning

## 🧪 Tests recommandés

1. ✅ Créer une assignation fixe
2. ✅ Générer un planning et vérifier que l'assignation fixe est respectée
3. ✅ Tester avec un agent non disponible
4. ✅ Tester avec plusieurs assignations fixes le même jour
5. ✅ Supprimer une assignation fixe
6. ✅ Vérifier la contrainte unique (un agent par jour)
