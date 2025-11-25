# Explication complète de l'algorithme de placement

## Objectif principal

**Maximiser l'utilisation des agents** en respectant :
1. Les besoins des projets (TimeOne, Mutuelle, Secure Academy)
2. Les disponibilités des agents
3. Les assignations fixes (🔒)

## Configuration des besoins

### TimeOne
- **Lundi** : 4 agents
- **Mardi** : 5 agents
- **Mercredi** : 5 agents
- **Jeudi** : 3 agents
- **Vendredi** : 5 agents

### Mutuelle
- **Tous les jours** : 3 agents

### Secure Academy
- **Jeudi** : 2 agents (obligatoire)
- Autres jours : flexible

### Stafy
- Flexible (accueille les agents restants)

## Algorithme en 4 étapes

### ÉTAPE 1 : Assignations fixes (🔒)

Les assignations fixes sont traitées en premier et ont la priorité absolue.

**Exemple :**
- Ines Sahel fixée sur Secure Academy le lundi → Assignée en journée complète

### ÉTAPE 2 : Satisfaire les besoins des projets

C'est l'étape la plus importante qui remplit les besoins de TimeOne, Mutuelle et Secure Academy.

#### Priorité 1 : Agents disponibles toute la journée

L'algorithme cherche d'abord les agents disponibles **matin ET après-midi** pour remplir les besoins.

**Exemple pour Mutuelle le lundi (besoin : 3 agents) :**
```
Agents disponibles toute la journée :
- Agent A : DISPONIBLE
- Agent B : DISPONIBLE
- Agent C : DISPONIBLE

→ Les 3 agents sont assignés en journée complète sur Mutuelle
→ Besoin satisfait ✅
```

#### Priorité 2 : Combiner agents avec disponibilités partielles

Si le besoin n'est pas satisfait avec les agents disponibles toute la journée, l'algorithme **combine** des agents avec disponibilités partielles.

**Concept clé :** 1 agent matin + 1 agent après-midi = 1 besoin satisfait

**Exemple pour TimeOne le lundi (besoin : 4 agents) :**
```
Après priorité 1 : 1 agent assigné en journée complète
Besoin restant : 3 agents

Agents disponibles matin uniquement :
- Agent D : DISPONIBLE MATIN
- Agent E : DISPONIBLE MATIN
- Agent F : DISPONIBLE MATIN

Agents disponibles après-midi uniquement :
- Agent G : DISPONIBLE APRES MIDI
- Agent H : DISPONIBLE APRES MIDI
- Agent I : DISPONIBLE APRES MIDI

→ Paire 1 : Agent D (matin) + Agent G (après-midi) = 1 besoin
→ Paire 2 : Agent E (matin) + Agent H (après-midi) = 1 besoin
→ Paire 3 : Agent F (matin) + Agent I (après-midi) = 1 besoin

Total : 1 (journée complète) + 3 (paires) = 4 agents ✅
```

**Affichage dans le planning :**
```
TimeOne - Lundi :
┌─────────────────────────────────┐
│ Agent X                         │
│ 📅 Journée complète (8h-17h)    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Agent D                         │
│ 🌅 Matin (8h-12h)               │
├─────────────────────────────────┤
│ Agent G                         │
│ ☀️ Après-midi (13h-17h)         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Agent E                         │
│ 🌅 Matin (8h-12h)               │
├─────────────────────────────────┤
│ Agent H                         │
│ ☀️ Après-midi (13h-17h)         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Agent F                         │
│ 🌅 Matin (8h-12h)               │
├─────────────────────────────────┤
│ Agent I                         │
│ ☀️ Après-midi (13h-17h)         │
└─────────────────────────────────┘
```

### ÉTAPE 3 : Assigner les agents restants (journée complète) sur Stafy

Les agents avec disponibilité complète qui n'ont pas été assignés aux étapes 1 et 2 sont placés sur **Stafy**.

**Exemple :**
```
Agent J : DISPONIBLE (lundi)
→ Pas assigné aux étapes 1 et 2
→ Assigné sur Stafy en journée complète
```

### ÉTAPE 4 : Assigner les agents restants (partiels) sur Stafy

Les agents avec disponibilité partielle qui n'ont pas été assignés sont placés sur **Stafy** pour leur créneau disponible.

**Exemple :**
```
Agent K : DISPONIBLE MATIN (lundi)
→ Pas assigné aux étapes précédentes
→ Assigné sur Stafy le matin

Agent L : DISPONIBLE APRES MIDI (lundi)
→ Pas assigné aux étapes précédentes
→ Assigné sur Stafy l'après-midi
```

## Cas concrets basés sur votre image

### Problème constaté

**Mutuelle le lundi :**
- Besoin : 3 agents
- Assigné : 0 agents ❌

**TimeOne le lundi :**
- Besoin : 4 agents
- Assigné : 1 agent (Aitouche Wissam) ❌

### Solution avec le nouvel algorithme

L'algorithme va maintenant :

1. **Chercher 3 agents disponibles toute la journée** pour Mutuelle
   - Si trouvés → Assignés en journée complète ✅
   - Sinon → Combine des agents matin + après-midi ✅

2. **Chercher 4 agents pour TimeOne** (après avoir enlevé Aitouche Wissam déjà assigné)
   - Besoin restant : 3 agents
   - Cherche des agents disponibles toute la journée
   - Si insuffisant → Combine des agents matin + après-midi ✅

3. **Assigner les agents restants sur Stafy**
   - Attik Tinhinane (après-midi) → Déjà assigné ✅
   - Autres agents disponibles → Assignés selon leur disponibilité ✅

## Types de disponibilités gérés

| Type | Description | Exemple d'assignation |
|------|-------------|----------------------|
| DISPONIBLE | Journée complète | Assigné 8h-17h |
| DISPONIBLE MATIN | Matin uniquement | Assigné 8h-12h |
| DISPONIBLE APRES MIDI | Après-midi uniquement | Assigné 13h-17h |
| DISPONIBLE A PARTIR DE 11H | Partiel avec heure | Assigné selon heure |
| PAS DISPONIBLE DE 10H-12H | Indispo partielle | Assigné hors plage |
| PAS DISPONIBLE | Aucune disponibilité | Non assigné |

## Rotation équitable

L'algorithme trie les agents par **nombre d'assignations** pour assurer une rotation équitable :

```typescript
.sort((a, b) => {
  const countA = agentWorkCount.get(a.id) || 0;
  const countB = agentWorkCount.get(b.id) || 0;
  return countA - countB;
});
```

Les agents avec le moins d'assignations sont prioritaires.

## Warnings générés

Si les besoins ne peuvent pas être satisfaits, des warnings sont générés :

```
⚠️ Mutuelle le LUNDI : 3 agents requis, seulement 2 assignés
⚠️ Timeone le MARDI : 5 agents requis, seulement 4 assignés
```

Ces warnings vous permettent de savoir quels projets manquent d'agents.

## Résumé de la logique

```
Pour chaque jour et chaque projet avec des besoins :
  1. Compter les agents déjà assignés (fixes)
  2. Calculer le besoin restant
  
  3. Assigner des agents disponibles toute la journée
     → Besoin restant diminue
  
  4. Si besoin restant > 0 :
     → Trouver agents disponibles matin uniquement
     → Trouver agents disponibles après-midi uniquement
     → Créer des paires (matin + après-midi)
     → Assigner les paires jusqu'à satisfaction du besoin
  
  5. Si besoin toujours pas satisfait :
     → Générer un warning
```

## Vérification du résultat

Après génération du planning, vérifiez :

✅ **Mutuelle** : 3 agents chaque jour
✅ **TimeOne** : 4 agents (lundi), 5 (mar/mer/ven), 3 (jeudi)
✅ **Secure Academy** : 2 agents le jeudi
✅ **Stafy** : Agents restants
✅ **Pas de créneaux vides** si des agents sont disponibles

---

**Date :** 24 novembre 2025
**Fichier modifié :** `/frontend/src/services/placementAlgorithm.ts`
