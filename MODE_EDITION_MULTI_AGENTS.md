# Mode Édition Multi-Agents - Documentation

## 🎯 Objectif

Permettre l'édition du planning avec **plusieurs agents par créneau** (Journée, Matin, Après-midi).

## ✅ Fonctionnalités

### Mode Affichage (par défaut)
- Affiche tous les agents assignés à chaque créneau
- Plusieurs agents peuvent être affichés dans la même cellule
- Vue claire avec séparation Journée / Matin / Après-midi

### Mode Édition
- Cliquer sur le bouton "Mode édition" pour activer
- Chaque cellule affiche 3 boutons :
  - **📅 Journée** : Éditer les agents en journée complète
  - **🌅 Matin** : Éditer les agents du matin
  - **☀️ Après-midi** : Éditer les agents de l'après-midi

## 🔧 Composants créés

### 1. **MultiAgentEditor.tsx**

Nouveau composant pour éditer plusieurs agents sur un même créneau.

**Fonctionnalités :**
- ✅ Afficher la liste des agents assignés
- ✅ Ajouter un agent (sélection dans une liste déroulante)
- ✅ Retirer un agent (bouton poubelle)
- ✅ Enregistrer les modifications
- ✅ Annuler les modifications

**Interface :**
```typescript
interface MultiAgentEditorProps {
  assignments: Assignment[];        // Assignations actuelles
  pole: Pole;                       // Pôle concerné
  day: DayOfWeek;                   // Jour concerné
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE';
  agents: Agent[];                  // Liste de tous les agents
  onUpdate: (assignments: Assignment[]) => void;
  onCancel: () => void;
  poleColor: string;                // Couleur du pôle
}
```

### 2. **Mise à jour de PlanningCalendar.tsx**

**Changements :**
- Import de `MultiAgentEditor` au lieu de `EditableAssignment`
- Ajout de l'état `editingCell` pour suivre la cellule en cours d'édition
- Nouvelle fonction `handleUpdateAssignments` pour gérer plusieurs assignations
- Interface d'édition avec 3 boutons par cellule (Journée, Matin, Après-midi)

## 📖 Utilisation

### Activer le mode édition

1. Cliquer sur le bouton **"Mode édition"** en haut du planning
2. Les cellules affichent maintenant 3 boutons par créneau

### Éditer un créneau

1. Cliquer sur le bouton du créneau à modifier (ex: "📅 Journée (2 agents)")
2. L'éditeur s'ouvre avec :
   - La liste des agents actuellement assignés
   - Un sélecteur pour ajouter un agent
   - Des boutons pour retirer des agents

### Ajouter un agent

1. Sélectionner un agent dans la liste déroulante
2. Cliquer sur **"+ Ajouter"**
3. L'agent apparaît dans la liste

### Retirer un agent

1. Cliquer sur l'icône **poubelle** à côté du nom de l'agent
2. L'agent est retiré de la liste

### Enregistrer

1. Cliquer sur **"Enregistrer"** (bouton vert avec ✓)
2. Les modifications sont appliquées au planning

### Annuler

1. Cliquer sur **"Annuler"** (bouton gris avec ✗)
2. Les modifications sont annulées

## 🎨 Interface visuelle

### Mode Édition - Vue d'une cellule

```
┌─────────────────────────────────────┐
│ 📅 Journée (2 agents)              │ ← Bouton cliquable
├─────────────────────────────────────┤
│ 🌅 Matin (1 agent)                 │ ← Bouton cliquable
├─────────────────────────────────────┤
│ ☀️ Après-midi (0 agent)            │ ← Bouton cliquable
└─────────────────────────────────────┘
```

### Éditeur ouvert

```
┌─────────────────────────────────────┐
│ 📅 Journée complète (8h-17h)       │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Jean Dupont              [🗑️]  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Marie Martin             [🗑️]  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [-- Ajouter un agent --] [+ Ajouter]│
├─────────────────────────────────────┤
│ [✓ Enregistrer] [✗ Annuler]        │
└─────────────────────────────────────┘
```

## 🔄 Flux de données

### Ajout d'un agent

```
1. Utilisateur sélectionne un agent
2. Clic sur "Ajouter"
3. Vérification : agent pas déjà assigné
4. Ajout à la liste locale
5. Clic sur "Enregistrer"
6. Mise à jour du planning global
7. Fermeture de l'éditeur
```

### Retrait d'un agent

```
1. Clic sur l'icône poubelle
2. Retrait de la liste locale
3. Clic sur "Enregistrer"
4. Mise à jour du planning global
5. Fermeture de l'éditeur
```

## 🚀 Avantages

1. **✅ Édition précise** : Modifier chaque créneau indépendamment
2. **✅ Multi-agents** : Ajouter/retirer plusieurs agents par créneau
3. **✅ Validation** : Empêche d'assigner le même agent deux fois
4. **✅ Annulation** : Possibilité d'annuler les modifications
5. **✅ Visibilité** : Voir le nombre d'agents par créneau
6. **✅ Intuitive** : Interface claire avec icônes et couleurs

## ⚠️ Limitations actuelles

- Un agent ne peut être assigné qu'une seule fois par jour (soit JOURNEE, soit MATIN, soit APRES_MIDI)
- L'éditeur ne vérifie pas automatiquement les disponibilités de l'agent
- Les modifications ne sont pas sauvegardées automatiquement dans Supabase (nécessite de cliquer sur "Sauvegarder le planning")

## 🔮 Améliorations futures possibles

1. **Validation des disponibilités** : Afficher uniquement les agents disponibles pour le créneau
2. **Drag & Drop** : Déplacer les agents par glisser-déposer
3. **Historique** : Annuler/Refaire les modifications
4. **Sauvegarde auto** : Sauvegarder automatiquement dans Supabase
5. **Conflits** : Détecter si un agent est déjà assigné ailleurs le même jour

## 📝 Notes techniques

### Gestion de l'état

```typescript
// État pour suivre la cellule en cours d'édition
const [editingCell, setEditingCell] = useState<{
  pole: Pole;
  day: DayOfWeek;
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE'
} | null>(null);
```

### Mise à jour des assignations

```typescript
const handleUpdateAssignments = (
  pole: Pole,
  day: DayOfWeek,
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE',
  newAssignments: Assignment[]
) => {
  // 1. Supprimer les anciennes assignations pour ce créneau
  const filteredAssignments = localPlanning.assignments.filter(
    a => !(a.pole === pole && a.jour === day && a.timeSlot === timeSlot)
  );
  
  // 2. Ajouter les nouvelles assignations
  const updatedAssignments = [...filteredAssignments, ...newAssignments];
  
  // 3. Mettre à jour le planning
  const updatedPlanning = {
    ...localPlanning,
    assignments: updatedAssignments,
    updatedAt: new Date().toISOString(),
  };
  
  // 4. Appliquer les changements
  setLocalPlanning(updatedPlanning);
  if (onPlanningUpdate) {
    onPlanningUpdate(updatedPlanning);
  }
  
  // 5. Fermer l'éditeur
  setEditingCell(null);
};
```

## ✅ Tests recommandés

1. **Ajouter plusieurs agents** sur le même créneau
2. **Retirer un agent** et vérifier qu'il disparaît
3. **Annuler** et vérifier que les modifications ne sont pas appliquées
4. **Enregistrer** et vérifier que les modifications persistent
5. **Changer de créneau** sans enregistrer et vérifier l'annulation automatique
6. **Mode affichage** : vérifier que tous les agents s'affichent correctement
