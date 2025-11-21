# 🚀 Guide de Démarrage Rapide - Algo Placement

## ⚡ Démarrage en 5 minutes

### 1️⃣ Configuration Supabase (2 min)

1. Ouvrez [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez-collez le contenu de `supabase_schema.sql`
5. Cliquez sur **Run** ✅

### 2️⃣ Démarrer le Backend (30 sec)

```bash
cd backend
npm install
npm run dev
```

✅ Serveur sur `http://localhost:3001`

### 3️⃣ Démarrer le Frontend (30 sec)

```bash
cd frontend
npm install
npm run dev
```

✅ Application sur `http://localhost:5173`

### 4️⃣ Créer un compte admin (1 min)

1. Ouvrez `http://localhost:5173`
2. Cliquez sur **"Créer un compte"**
3. Email : `admin@test.com` (doit contenir "admin")
4. Mot de passe : `123456` (min 6 caractères)
5. Cliquez sur **"Créer un compte"**

✅ Vous êtes connecté !

---

## 🎯 Utilisation

### Importer des agents

1. Allez dans l'onglet **"Import CSV"**
2. Cliquez sur **"Choisir un fichier"**
3. Sélectionnez `DISPONIBILITE - Feuille 1.csv`
4. Les agents sont automatiquement importés ✅

### Générer un planning

1. **Mode Rapide** (50ms) :
   - Toggle désactivé ⚡
   - Cliquez sur **"Générer le planning"**

2. **Mode Génétique** (2-5s) :
   - Activez le toggle 🧬
   - Cliquez sur **"Générer le planning"**
   - Attendez l'optimisation...

### Modifier le planning

1. Allez dans l'onglet **"Planning"**
2. Cliquez sur **"Mode édition"**
3. Cliquez sur une affectation
4. Sélectionnez un nouvel agent
5. Cliquez sur **"OK"**

### Gérer les congés

1. Allez dans l'onglet **"Congés"**
2. Cliquez sur **"Ajouter un congé"**
3. Remplissez le formulaire
4. Cliquez sur **"Ajouter"**

### Voir les analytics

1. Générez un planning
2. Allez dans l'onglet **"Analytics"**
3. Consultez les KPIs et statistiques

---

## 🔥 Fonctionnalités Disponibles

### ✅ Authentification
- Page de connexion/inscription
- Protection des routes
- Rôle admin automatique (email contenant "admin")
- Déconnexion

### ✅ Gestion des Agents
- Import CSV
- Ajout manuel
- Modification
- Suppression
- Sauvegarde automatique dans Supabase

### ✅ Génération de Planning
- **Algorithme rapide** : Rotation équitable (~50ms)
- **Algorithme génétique** : Optimisation avancée (~2-5s)
- Respect des disponibilités
- Créneaux matin (8h-12h) et après-midi (13h-17h)

### ✅ Édition Manuelle
- Mode édition/lecture
- Modification des affectations
- Assignation de créneaux vides
- Sauvegarde automatique

### ✅ Historique
- Liste de tous les plannings générés
- Chargement d'un ancien planning
- Suppression des plannings obsolètes
- Badge "Actuel"

### ✅ Vue par Agent
- Planning individuel par agent
- Statistiques (affectations, heures, pôles)
- Vue hebdomadaire détaillée
- Identification des créneaux libres

### ✅ Gestion des Congés
- Ajout de congés (Congé, Maladie, Formation, Autre)
- Période avec dates
- Motif optionnel
- Alertes pour congés en cours

### ✅ Analytics
- KPIs : Agents actifs, Affectations, Heures, Couverture
- Statistiques par pôle
- Performance des agents
- Distribution des affectations
- Graphiques et barres de progression

### ✅ Collaboration Temps Réel
- WebSocket pour synchronisation multi-utilisateurs
- Notifications des mises à jour
- Affichage des utilisateurs connectés

### ✅ Export PDF
- Export du planning en PDF
- Format A4 paysage
- Téléchargement automatique

---

## 🎨 Interface

### En-tête
- Logo et titre
- Email utilisateur + badge admin
- Toggle algorithme (Rapide ⚡ / Génétique 🧬)
- Bouton "Générer le planning"
- Bouton de déconnexion

### Onglets
1. **Import CSV** : Importer les agents
2. **Agents** : Gérer les agents (+ bouton ajouter)
3. **Planning** : Voir et éditer le planning
4. **Historique** : Plannings précédents
5. **Vue agent** : Planning par agent
6. **Congés** : Gérer les congés
7. **Analytics** : Statistiques détaillées

### Notifications
- Succès (vert) : Actions réussies
- Erreur (rouge) : Problèmes
- Avertissement (jaune) : Alertes
- Info (bleu) : Informations

---

## 🔧 Dépannage Rapide

### Backend ne démarre pas
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erreur Supabase
1. Vérifiez les clés dans `frontend/src/lib/supabase.ts`
2. Vérifiez que le schéma SQL est exécuté
3. Vérifiez les politiques RLS dans Supabase

### WebSocket ne se connecte pas
1. Vérifiez que le backend tourne sur port 3001
2. Ouvrez la console du navigateur (F12)
3. Regardez les erreurs WebSocket

### Algorithme génétique trop lent
- Utilisez le mode rapide pour les tests
- Le mode génétique est pour l'optimisation finale

---

## 📊 Comparaison des Algorithmes

| Critère | Rapide ⚡ | Génétique 🧬 |
|---------|----------|--------------|
| Temps | ~50ms | 2-5s |
| Qualité | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Couverture | ~80% | ~95% |
| Équilibre | Basique | Optimisé |
| Usage | Tests, modifications | Production |

---

## 🎯 Workflow Recommandé

1. **Import** : Importer le CSV des agents
2. **Congés** : Ajouter les congés connus
3. **Test Rapide** : Générer avec l'algorithme rapide
4. **Vérification** : Vérifier les affectations
5. **Édition** : Ajuster manuellement si nécessaire
6. **Optimisation** : Régénérer avec l'algorithme génétique
7. **Analytics** : Consulter les statistiques
8. **Export** : Exporter en PDF
9. **Historique** : Sauvegarder pour référence future

---

## 💡 Astuces

- **Raccourci** : Utilisez les onglets pour naviguer rapidement
- **Notifications** : Lisez les notifications pour comprendre les actions
- **Mode édition** : Activez-le pour modifier le planning
- **Algorithme génétique** : Utilisez-le pour les plannings finaux
- **Historique** : Gardez une trace de tous vos plannings
- **Analytics** : Identifiez les déséquilibres de charge
- **Congés** : Ajoutez-les avant de générer le planning

---

## 🆘 Support

### Documentation complète
- `README.md` : Vue d'ensemble du projet
- `ADVANCED_FEATURES.md` : Fonctionnalités avancées détaillées
- `SUPABASE_SETUP.md` : Configuration Supabase

### Logs
- **Backend** : Console du terminal backend
- **Frontend** : Console du navigateur (F12)
- **WebSocket** : Messages dans la console

### Problèmes courants
1. **Agents non disponibles** : Vérifiez le format CSV
2. **Planning incomplet** : Pas assez d'agents disponibles
3. **Erreur Supabase** : Vérifiez la connexion internet
4. **WebSocket déconnecté** : Redémarrez le backend

---

## 🎉 Vous êtes prêt !

L'application est maintenant complètement fonctionnelle avec toutes les fonctionnalités avancées :

✅ Authentification admin  
✅ Collaboration temps réel  
✅ Algorithme génétique  
✅ Gestion des congés  
✅ Analytics détaillés  

**Bon placement ! 🚀**
