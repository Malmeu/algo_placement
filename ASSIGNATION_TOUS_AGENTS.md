# Assignation de tous les agents - Mise à jour

## 🎯 Objectif

**Tous les agents doivent travailler** avec possibilité d'avoir **plusieurs agents sur le même pôle au même moment**.

## ✅ Modifications apportées

### 1. **Algorithme de placement** (`placementAlgorithm.ts`)

#### Ancienne logique ❌
- Assignait **1 seul agent par pôle**
- S'arrêtait après avoir rempli chaque pôle
- Beaucoup d'agents restaient non assignés

#### Nouvelle logique ✅
```typescript
// ÉTAPE 1 : Appliquer les assignations fixes
// ÉTAPE 2 : Assigner TOUS les agents restants disponibles

unassignedAgents.forEach(agent => {
  // Pour chaque agent, trouver le pôle où il a le moins travaillé
  // Assigner selon sa disponibilité (JOURNEE, MATIN ou APRES_MIDI)
});
```

**Avantages :**
- ✅ **Tous les agents disponibles sont assignés**
- ✅ **Plusieurs agents peuvent être sur le même pôle**
- ✅ **Rotation équitable** : chaque agent est assigné au pôle où il a le moins travaillé
- ✅ **Respect des disponibilités** : journée complète, matin seul, ou après-midi seul

### 2. **Affichage du planning** (`PlanningCalendar.tsx`)

#### Ancienne logique ❌
- Affichait **1 seul agent par créneau**
- Utilisait `.find()` qui ne retourne qu'un seul résultat

#### Nouvelle logique ✅
```typescript
const fullDayAssignments = assignments.filter(a => a.timeSlot === 'JOURNEE');
const morningAssignments = assignments.filter(a => a.timeSlot === 'MATIN');
const afternoonAssignments = assignments.filter(a => a.timeSlot === 'APRES_MIDI');

// Afficher tous les agents avec .map()
fullDayAssignments.map((assignment, idx) => ...)
```

**Avantages :**
- ✅ **Affiche tous les agents** assignés à un pôle/créneau
- ✅ **Liste claire** avec séparation Journée / Matin / Après-midi
- ✅ **Design compact** pour gérer plusieurs agents

## 📊 Exemple de résultat

### Avant (1 agent par pôle)
```
Secure Academy - Lundi Matin : Jean Dupont
Secure Academy - Lundi Après-midi : Marie Martin
Mutuelle - Lundi Matin : Pierre Durand
...
Agents non assignés : 5 agents
```

### Après (tous les agents assignés)
```
Secure Academy - Lundi Journée :
  - Jean Dupont
  - Marie Martin
  - Sophie Leblanc

Mutuelle - Lundi Journée :
  - Pierre Durand
  - Luc Bernard

Stafy - Lundi Matin :
  - Alice Petit
  
Stafy - Lundi Après-midi :
  - Thomas Roux

Timeone - Lundi Journée :
  - Emma Moreau
  - Lucas Girard

Agents non assignés : 0 agents ✅
```

## 🔄 Logique de répartition

### Priorités de l'algorithme

1. **Assignations fixes** (si définies)
2. **Agents disponibles toute la journée** → Assignation JOURNEE
3. **Agents disponibles matin uniquement** → Assignation MATIN
4. **Agents disponibles après-midi uniquement** → Assignation APRES_MIDI

### Rotation équitable

Chaque agent est assigné au pôle où il a **le moins travaillé** dans la semaine :

```typescript
// Exemple : historique de Jean
Secure Academy : 2 jours
Mutuelle : 1 jour
Stafy : 0 jour
Timeone : 1 jour

// Jean sera assigné à Stafy (0 jour = minimum)
```

## 🎨 Affichage visuel

### Structure d'une cellule du planning

```
┌─────────────────────────────┐
│ 📅 Journée (8h-17h)        │
│ ┌─────────────────────────┐ │
│ │ Jean Dupont             │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Marie Martin            │ │
│ └─────────────────────────┘ │
│                             │
│ 🌅 Matin (8h-12h)          │
│ ┌─────────────────────────┐ │
│ │ Pierre Durand           │ │
│ └─────────────────────────┘ │
│                             │
│ ☀️ Après-midi (13h-17h)    │
│ ┌─────────────────────────┐ │
│ │ Sophie Leblanc          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## 📝 Cas particuliers

### Agent avec disponibilité partielle

**Exemple :** Thomas est disponible uniquement le matin

```typescript
// Thomas sera assigné MATIN uniquement
assignments.push({
  agentId: thomas.id,
  agentNom: 'Thomas Roux',
  pole: 'Stafy',
  jour: 'LUNDI',
  timeSlot: 'MATIN'  // ✅ Pas JOURNEE
});
```

### Agent non disponible un jour

**Exemple :** Emma est en congé le mardi

```typescript
// Emma ne sera pas assignée le mardi
if (!availableMorning && !availableAfternoon) {
  return; // Passer au suivant
}
```

### Plusieurs agents sur le même pôle

**Exemple :** 3 agents sur Secure Academy le lundi

```typescript
// Tous les 3 seront affichés dans la même cellule
Secure Academy - Lundi Journée :
  - Jean Dupont
  - Marie Martin
  - Sophie Leblanc
```

## 🚀 Avantages de cette approche

1. **✅ Tous les agents travaillent** : Aucun agent disponible ne reste inactif
2. **✅ Flexibilité** : Plusieurs agents par pôle selon les besoins
3. **✅ Équité** : Rotation automatique pour équilibrer la charge
4. **✅ Respect des contraintes** : Disponibilités et assignations fixes respectées
5. **✅ Visibilité** : Affichage clair de tous les agents assignés

## 🧪 Test recommandé

1. Avoir au moins **10 agents** avec des disponibilités variées
2. Générer le planning
3. Vérifier que **tous les agents disponibles** sont assignés
4. Vérifier que **plusieurs agents** apparaissent sur certains pôles
5. Vérifier la **rotation équitable** sur plusieurs générations

## 📌 Notes importantes

- Les agents avec assignations fixes sont traités en priorité
- Un agent ne peut être assigné qu'**une seule fois par jour** (soit JOURNEE, soit MATIN, soit APRES_MIDI)
- La rotation équitable se fait sur la **semaine entière** (pas jour par jour)
- Les pôles peuvent avoir un **nombre variable d'agents** selon les disponibilités
