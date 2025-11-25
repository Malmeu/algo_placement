# Guide d'utilisation - Assignations Fixes

## 🎯 Qu'est-ce qu'une assignation fixe ?

Une assignation fixe permet de **forcer** un agent à travailler sur un projet spécifique un jour donné.

**Exemple concret :** Inas Sahel doit impérativement travailler dans le projet Secure Academy le lundi.

## 📋 Étapes d'utilisation

### 1. Accéder à l'interface

1. Connectez-vous à l'application
2. Cliquez sur l'onglet **"Assignations fixes"** (icône épingle 📌)

### 2. Créer une assignation fixe

1. **Sélectionnez un agent** dans la liste déroulante
2. **Choisissez un projet** :
   - Secure Academy
   - Mutuelle
   - Stafy
   - Timeone
3. **Sélectionnez un jour** : Lundi, Mardi, Mercredi, Jeudi ou Vendredi
4. Cliquez sur le bouton **"Ajouter"**

✅ L'assignation fixe est créée et apparaît dans la liste ci-dessous.

### 3. Visualiser les assignations fixes

Les assignations sont affichées **groupées par jour** :

```
Lundi
  👤 Inas Sahel → 💼 Secure Academy

Mardi
  👤 Jean Dupont → 💼 Mutuelle
  👤 Marie Martin → 💼 Timeone
```

### 4. Supprimer une assignation fixe

1. Trouvez l'assignation dans la liste
2. Cliquez sur l'icône **poubelle** 🗑️ à droite
3. Confirmez la suppression

## 🔄 Génération de planning avec assignations fixes

### Comportement de l'algorithme

1. **Les assignations fixes sont appliquées EN PREMIER**
2. L'algorithme vérifie la disponibilité de l'agent :
   - ✅ Disponible toute la journée → Assignation pour la journée complète
   - ✅ Disponible uniquement le matin → Assignation matin uniquement
   - ✅ Disponible uniquement l'après-midi → Assignation après-midi uniquement
   - ⚠️ Non disponible → Warning affiché
3. Les autres agents sont assignés automatiquement sur les postes restants

### Nouvelle règle : Continuité de poste

**Important :** Un agent assigné à un poste reste sur ce poste **toute la journée**, sauf si sa disponibilité ne le permet pas.

**Avant :**
- Lundi matin : Agent A sur Secure Academy
- Lundi après-midi : Agent A sur Mutuelle ❌

**Maintenant :**
- Lundi toute la journée : Agent A sur Secure Academy ✅

## ⚠️ Règles et contraintes

### Contraintes système

1. **Un agent = Une assignation fixe par jour maximum**
   - ❌ Impossible d'assigner Inas Sahel sur Secure Academy ET Mutuelle le même lundi
   - ✅ Possible d'assigner Inas Sahel sur Secure Academy le lundi ET le mardi

2. **Respect des disponibilités**
   - Si un agent a une assignation fixe mais n'est pas disponible, un warning sera affiché
   - L'assignation ne sera pas appliquée dans le planning

3. **Suppression en cascade**
   - Si vous supprimez un agent, toutes ses assignations fixes sont supprimées automatiquement

## 💡 Cas d'usage

### Exemple 1 : Agent avec compétence spécifique

**Situation :** Inas Sahel est la seule à maîtriser un outil spécifique utilisé le lundi sur Secure Academy.

**Solution :**
1. Créer une assignation fixe : Inas Sahel → Secure Academy → Lundi
2. Générer le planning
3. ✅ Inas sera automatiquement assignée sur Secure Academy le lundi

### Exemple 2 : Formation programmée

**Situation :** Jean Dupont suit une formation sur Timeone tous les mercredis.

**Solution :**
1. Créer une assignation fixe : Jean Dupont → Timeone → Mercredi
2. ✅ Jean sera toujours sur Timeone le mercredi

### Exemple 3 : Préférence client

**Situation :** Le client Mutuelle préfère toujours travailler avec Marie Martin le vendredi.

**Solution :**
1. Créer une assignation fixe : Marie Martin → Mutuelle → Vendredi
2. ✅ Marie sera assignée sur Mutuelle chaque vendredi

## 🚨 Messages d'erreur courants

### "Agent non disponible"
**Cause :** L'agent a une assignation fixe mais n'est pas disponible ce jour-là.

**Solution :**
1. Vérifiez les disponibilités de l'agent dans l'onglet "Agents"
2. Modifiez la disponibilité OU supprimez l'assignation fixe

### "Un agent ne peut avoir qu'une seule assignation fixe par jour"
**Cause :** Vous essayez de créer une deuxième assignation fixe pour le même agent le même jour.

**Solution :**
1. Supprimez l'assignation fixe existante
2. Créez la nouvelle assignation

## 📊 Prochaines fonctionnalités

Les fonctionnalités suivantes seront ajoutées prochainement :

- [ ] Configuration du nombre d'agents requis par projet/jour
- [ ] Validation automatique des besoins en agents
- [ ] Export/Import des assignations fixes en CSV
- [ ] Historique des modifications

## ❓ Questions fréquentes

**Q : Puis-je assigner plusieurs agents sur le même projet le même jour ?**
R : Oui ! Vous pouvez créer plusieurs assignations fixes pour le même projet/jour.

**Q : Les assignations fixes sont-elles sauvegardées ?**
R : Oui, elles sont stockées dans la base de données Supabase et persistent entre les sessions.

**Q : Que se passe-t-il si je génère un planning sans assignations fixes ?**
R : L'algorithme fonctionne normalement et assigne les agents automatiquement selon leurs disponibilités.

**Q : Puis-je modifier une assignation fixe existante ?**
R : Pour l'instant, vous devez supprimer l'assignation existante et en créer une nouvelle.

## 📞 Support

Pour toute question ou problème, contactez votre administrateur système.
