# Corrections - Gestion des disponibilités partielles

## Problème identifié

L'algorithme de placement ne gérait pas correctement les agents avec **disponibilités partielles** (matin uniquement ou après-midi uniquement), ce qui laissait des créneaux vides dans le planning.

## Solution implémentée

### Modifications dans `/frontend/src/services/placementAlgorithm.ts`

#### 1. Nouvelle structure de suivi des assignations

**Avant :**
```typescript
const assignedAgentsByDay: Map<DayOfWeek, Set<string>> = new Map();
```

**Après :**
```typescript
const assignedAgentsByDay: Map<DayOfWeek, Map<string, 'MATIN' | 'APRES_MIDI' | 'JOURNEE'>> = new Map();
```

Cette modification permet de suivre **quel créneau** chaque agent occupe, et non seulement s'il est assigné ou non.

#### 2. Nouvel algorithme en 4 étapes

**ÉTAPE 1 : Assignations fixes**
- Traite les assignations fixes (🔒)
- Enregistre le créneau exact (MATIN, APRÈS-MIDI ou JOURNÉE)

**ÉTAPE 2 : Besoins des projets**
- Assigne les agents avec **disponibilité complète** en priorité
- Respecte les besoins configurés dans `projectRequirements.ts`
- Génère des warnings si besoins non satisfaits

**ÉTAPE 3 : Agents disponibles journée complète restants**
- Assigne les agents avec disponibilité complète non encore assignés
- Les place sur **Stafy** (projet flexible)

**ÉTAPE 4 : Agents avec disponibilité partielle** ⭐ NOUVEAU
- **Matin uniquement** : Assigne les agents disponibles uniquement le matin sur Stafy
- **Après-midi uniquement** : Assigne les agents disponibles uniquement l'après-midi sur Stafy
- Gère les cas où un agent a déjà un créneau assigné (complète la journée si possible)

### Logique de l'étape 4 (disponibilités partielles)

```typescript
// Pour le matin
const morningOnlyAgents = agents.filter(agent => {
  const currentAssignment = assignedAgentsByDay.get(day)!.get(agent.id);
  
  // Skip si déjà assigné en journée complète ou le matin
  if (currentAssignment === 'JOURNEE' || currentAssignment === 'MATIN') return false;
  
  const availability = agent.disponibilites[day];
  const availableMorning = isAvailableForTimeSlot(availability, 'MATIN');
  const availableAfternoon = isAvailableForTimeSlot(availability, 'APRES_MIDI');
  
  // Disponible matin uniquement OU après-midi déjà assigné
  return availableMorning && (!availableAfternoon || currentAssignment === 'APRES_MIDI');
});
```

## Types de disponibilités gérés

L'algorithme gère maintenant tous ces types :

1. ✅ **DISPONIBLE** - Journée complète
2. ✅ **DISPONIBLE MATIN** - Matin uniquement (8h-12h)
3. ✅ **DISPONIBLE APRES MIDI** - Après-midi uniquement (13h-17h)
4. ✅ **DISPONIBLE A PARTIR DE [heure]** - Disponibilité partielle avec heure de début
5. ✅ **PAS DISPONIBLE DE [heure]-[heure]** - Indisponibilité sur une plage horaire
6. ✅ **DISPONIBLE PARFOIS APRES MIDI** - Disponibilité flexible après-midi
7. ❌ **PAS DISPONIBLE** - Aucune disponibilité

## Résultat attendu

### Avant
- Agents avec disponibilité partielle : **non assignés** ❌
- Créneaux vides dans le planning
- Warnings "pas assez d'agents"

### Après
- Agents avec disponibilité partielle : **assignés sur leur créneau disponible** ✅
- Tous les créneaux disponibles sont remplis
- Maximisation de l'utilisation des ressources

## Exemple concret

**Agent : Dihia Ouazene**
- Lundi : DISPONIBLE APRES MIDI

**Avant :**
- Non assignée → créneau vide

**Après :**
- Assignée sur **Stafy** l'après-midi (13h-17h) ✅

## Affichage dans le planning

Le composant `PlanningCalendar.tsx` gère déjà correctement l'affichage :

- **Journée complète** : Une seule carte avec "📅 Journée complète (8h-17h)"
- **Matin** : Carte avec "🌅 Matin (8h-12h)"
- **Après-midi** : Carte avec "☀️ Après-midi (13h-17h)"
- **Assignations fixes** : Badge "🔒 FIXE" avec bordure violette

## Configuration des besoins

Les besoins par projet sont configurés dans `/frontend/src/config/projectRequirements.ts` :

```typescript
export const PROJECT_REQUIREMENTS: ProjectRequirements[] = [
  {
    pole: 'Timeone',
    requirements: {
      LUNDI: 4,
      MARDI: 5,
      MERCREDI: 5,
      JEUDI: 3,
      VENDREDI: 5,
    },
  },
  {
    pole: 'Mutuelle',
    requirements: {
      LUNDI: 3,
      MARDI: 3,
      MERCREDI: 3,
      JEUDI: 3,
      VENDREDI: 3,
    },
  },
  {
    pole: 'Secure Academy',
    requirements: {
      JEUDI: 2, // Obligatoire
      // Autres jours flexibles
    },
  },
  {
    pole: 'Stafy',
    requirements: {
      // Flexible - accueille les agents restants
    },
  },
];
```

## Tests recommandés

1. ✅ Importer un CSV avec des agents ayant des disponibilités partielles
2. ✅ Générer le planning
3. ✅ Vérifier qu'aucun créneau n'est vide si des agents sont disponibles
4. ✅ Vérifier que les agents avec disponibilité partielle sont bien assignés
5. ✅ Vérifier que les besoins des projets sont respectés

## Commandes utiles

```bash
# Lancer le frontend
cd frontend
npm run dev

# Lancer le backend Supabase (si nécessaire)
cd backend
supabase start
```

---

**Date de modification :** 24 novembre 2025
**Fichiers modifiés :**
- `/frontend/src/services/placementAlgorithm.ts`
