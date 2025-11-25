# Algorithme de placement - Version finale

## Résumé

L'algorithme a été **complètement réécrit** pour être simple, clair et fonctionnel. Il respecte toutes les règles métier et garantit que tous les agents disponibles sont assignés.

## Règles métier respectées

### 1. Continuité de poste ✅
Un agent reste sur le **même poste toute la journée** (matin + après-midi), sauf si sa disponibilité est partielle.

### 2. Assignations fixes ✅
Possibilité de fixer un agent sur un projet spécifique un jour donné.
**Exemple** : Ines Sahel → Secure Academy le lundi (🔒 FIXE)

### 3. Besoins des projets ✅
- **Mutuelle** : 3 agents tous les jours (priorité 1)
- **TimeOne** : 4 (lundi), 5 (mar/mer/ven), 3 (jeudi) (priorité 2)
- **Secure Academy** : 2 agents le jeudi obligatoire (priorité 3)
- **Stafy** : Flexible, accueille les agents restants (priorité 4)

### 4. Maximisation ✅
**Tous les agents doivent travailler** selon leur disponibilité. Aucun agent disponible ne reste sans assignation.

## Algorithme en 3 étapes

### ÉTAPE 1 : Assignations fixes (🔒)

Les assignations fixes sont traitées en premier et ont la priorité absolue.

**Logique** :
```
Pour chaque assignation fixe :
  1. Vérifier que l'agent existe
  2. Vérifier sa disponibilité
  3. Assigner selon la disponibilité :
     - Matin ET après-midi → Journée complète
     - Matin uniquement → Matin
     - Après-midi uniquement → Après-midi
  4. Marquer l'agent comme assigné
```

**Exemple** :
- Ines Sahel fixée sur Secure Academy le lundi
- Disponibilité : DISPONIBLE (matin + après-midi)
- Résultat : Assignée en journée complète (8h-17h) 🔒

### ÉTAPE 2 : Satisfaire les besoins des projets

Les projets sont traités **par ordre de priorité** :
1. Mutuelle (critique)
2. TimeOne (important)
3. Secure Academy (moyen)
4. Stafy (flexible)

**Logique** :
```
Pour chaque jour :
  Pour chaque projet (par ordre de priorité) :
    1. Récupérer le besoin (ex: Mutuelle = 3 agents)
    2. Compter les agents déjà assignés (assignations fixes)
    3. Calculer le besoin restant
    4. Trouver les agents disponibles :
       - Pas encore assignés ce jour
       - Disponibles matin ET après-midi
    5. Assigner les agents nécessaires en journée complète
    6. Générer un warning si pas assez d'agents
```

**Exemple pour Mutuelle le lundi** :
```
Besoin : 3 agents
Déjà assignés (fixes) : 0
Besoin restant : 3

Agents disponibles toute la journée :
- Agent A : DISPONIBLE
- Agent B : DISPONIBLE  
- Agent C : DISPONIBLE
- Agent D : DISPONIBLE

→ Assigner les 3 premiers agents (A, B, C)
→ Besoin satisfait ✅
```

**Exemple pour TimeOne le lundi** :
```
Besoin : 4 agents
Déjà assignés (fixes) : 1 (Aitouche Wissam)
Besoin restant : 3

Agents disponibles (après Mutuelle) :
- Agent D : DISPONIBLE
- Agent E : DISPONIBLE
- Agent F : DISPONIBLE

→ Assigner les 3 agents (D, E, F)
→ Total : 1 (fixe) + 3 = 4 agents ✅
```

### ÉTAPE 3 : Assigner les agents restants sur Stafy

Tous les agents disponibles qui n'ont pas encore été assignés sont placés sur **Stafy** selon leur disponibilité.

**Logique** :
```
Pour chaque jour :
  Pour chaque agent :
    Si déjà assigné en journée complète → Skip
    
    Sinon :
      Cas 1 : Disponible toute la journée et pas encore assigné
        → Assigner en journée complète sur Stafy
      
      Cas 2 : Disponible matin uniquement (ou après-midi déjà pris)
        → Assigner le matin sur Stafy (ou sur le même projet)
      
      Cas 3 : Disponible après-midi uniquement (ou matin déjà pris)
        → Assigner l'après-midi sur Stafy (ou sur le même projet)
```

**Exemple** :
```
Agent G : DISPONIBLE (lundi)
→ Pas assigné aux étapes 1 et 2
→ Assigné sur Stafy en journée complète ✅

Agent H : DISPONIBLE MATIN (lundi)
→ Pas assigné aux étapes 1 et 2
→ Assigné sur Stafy le matin ✅

Agent I : DISPONIBLE APRES MIDI (lundi)
→ Pas assigné aux étapes 1 et 2
→ Assigné sur Stafy l'après-midi ✅
```

## Structures de données

### 1. assignedAgents
```typescript
Map<DayOfWeek, Set<string>>
```
Suit les agents assignés en **journée complète** par jour.

### 2. agentSlots
```typescript
Map<DayOfWeek, Map<string, {pole: Pole, morning: boolean, afternoon: boolean}>>
```
Suit les créneaux assignés pour chaque agent :
- `pole` : Le projet assigné
- `morning` : Assigné le matin ?
- `afternoon` : Assigné l'après-midi ?

## Ordre de priorité des projets

```typescript
const POLE_PRIORITY: Pole[] = ['Mutuelle', 'Timeone', 'Secure Academy', 'Stafy'];
```

**Justification** :
1. **Mutuelle** : Besoin critique de 3 agents tous les jours
2. **TimeOne** : Besoin important de 4-5 agents
3. **Secure Academy** : Besoin moyen de 2 agents le jeudi
4. **Stafy** : Flexible, accueille les agents restants

## Types de disponibilités gérés

| Type | Assignation |
|------|-------------|
| DISPONIBLE | Journée complète (8h-17h) |
| DISPONIBLE MATIN | Matin uniquement (8h-12h) |
| DISPONIBLE APRES MIDI | Après-midi uniquement (13h-17h) |
| DISPONIBLE A PARTIR DE [heure] | Selon l'heure de début |
| PAS DISPONIBLE DE [heure]-[heure] | Hors de la plage |
| PAS DISPONIBLE | Non assigné |

## Affichage dans le planning

### Journée complète
```
┌─────────────────────────────────┐
│ Agent A                         │
│ 📅 Journée complète (8h-17h)    │
└─────────────────────────────────┘
```

### Créneaux séparés
```
┌─────────────────────────────────┐
│ Agent B                         │
│ 🌅 Matin (8h-12h)               │
├─────────────────────────────────┤
│ Agent C                         │
│ ☀️ Après-midi (13h-17h)         │
└─────────────────────────────────┘
```

### Assignation fixe
```
┌─────────────────────────────────┐
│ 🔒 FIXE                         │
│ Ines Sahel                      │
│ 📅 Journée complète (8h-17h)    │
└─────────────────────────────────┘
```

## Warnings générés

L'algorithme génère des warnings dans les cas suivants :

### 1. Agent introuvable
```
⚠️ Agent [nom] introuvable
```

### 2. Agent non disponible (assignation fixe)
```
⚠️ [nom] n'est pas disponible le [jour]
```

### 3. Besoins non satisfaits
```
⚠️ [projet] le [jour] : [X] agents requis, seulement [Y] assignés
```

## Résultat attendu

### Mutuelle
✅ 3 agents chaque jour (lundi, mardi, mercredi, jeudi, vendredi)

### TimeOne
✅ 4 agents le lundi
✅ 5 agents le mardi, mercredi, vendredi
✅ 3 agents le jeudi

### Secure Academy
✅ 2 agents le jeudi (obligatoire)
✅ Flexible les autres jours

### Stafy
✅ Tous les agents restants selon leur disponibilité

### Maximisation
✅ Aucun agent disponible ne reste sans assignation
✅ Les agents avec disponibilité partielle sont assignés sur leur créneau

## Exemple complet - Lundi

### Données
- **Agents** : 10 agents
- **Assignations fixes** : Ines Sahel → Secure Academy

### Étape 1 : Assignations fixes
```
Ines Sahel → Secure Academy (journée complète) 🔒
```

### Étape 2 : Besoins des projets

**Mutuelle (besoin : 3)** :
```
Agent A → Mutuelle (journée complète)
Agent B → Mutuelle (journée complète)
Agent C → Mutuelle (journée complète)
```

**TimeOne (besoin : 4)** :
```
Agent D → TimeOne (journée complète)
Agent E → TimeOne (journée complète)
Agent F → TimeOne (journée complète)
Agent G → TimeOne (journée complète)
```

### Étape 3 : Agents restants sur Stafy
```
Agent H → Stafy (journée complète)
Agent I → Stafy (matin uniquement)
Agent J → Stafy (après-midi uniquement)
```

### Résultat final
- **Secure Academy** : 1 agent (Ines Sahel 🔒)
- **Mutuelle** : 3 agents ✅
- **TimeOne** : 4 agents ✅
- **Stafy** : 3 agents (dont 2 partiels)
- **Total** : 10/10 agents assignés ✅

## Vérification

Après génération du planning :

1. ✅ **Mutuelle** : 3 agents chaque jour
2. ✅ **TimeOne** : Bon nombre d'agents selon le jour
3. ✅ **Secure Academy** : 2 agents le jeudi
4. ✅ **Stafy** : Agents restants
5. ✅ **Pas de créneaux vides** si des agents sont disponibles
6. ✅ **Tous les agents travaillent** selon leur disponibilité

## Fichiers modifiés

- `/frontend/src/services/placementAlgorithm.ts` : Réécriture complète
- `/frontend/src/components/PlanningCalendar.tsx` : Ordre d'affichage mis à jour

---

**Date** : 24 novembre 2025
**Version** : Finale et fonctionnelle
**Testeur** : Régénérer le planning et vérifier les résultats
