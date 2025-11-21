# Système de Planification de Placement d'Agents

Application web pour la planification dynamique du placement des agents sur 4 pôles (Secure Academy, Mutuelle, Stafy, Timeone) selon leur disponibilité.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Installer toutes les dépendances
npm install

# Démarrer le projet en mode développement
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend : http://localhost:3001

## 📁 Structure du projet

```
algo_placement/
├── frontend/          # Application React + TypeScript
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Utilitaires
│   └── public/
├── backend/           # API Node.js + Express
│   └── src/
│       ├── routes/        # Routes API
│       ├── services/      # Logique métier
│       └── types/         # Types TypeScript
└── cahier_des_charge.md
```

## 🎯 Fonctionnalités

- ✅ Import de fichiers CSV de disponibilités
- ✅ Algorithme de placement automatique des agents
- ✅ Interface visuelle animée avec calendrier interactif
- ✅ Gestion en temps réel des modifications
- ✅ Rotation intelligente des agents entre pôles
- ✅ Historique et simulation de planning
- ✅ Interface responsive (desktop & mobile)

## 📊 Format CSV

Le fichier CSV doit contenir les colonnes suivantes :
- NOM
- LUNDI
- MARDI
- MERCREDI
- JEUDI
- VENDREDI

Types de disponibilité supportés :
- DISPONIBLE
- PAS DISPONIBLE
- DISPONIBLE A PARTIR DE [heure]
- PAS DISPONIBLE DE [heure]-[heure]
- DISPONIBLE PARFOIS APRES MIDI
- DISPONIBLE MATIN
- DISPONIBLE APRES MIDI

## 🛠️ Technologies utilisées

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Framer Motion (animations)
- React Router
- Lucide React (icônes)

### Backend
- Node.js
- Express
- TypeScript
- PapaCSV (parsing CSV)

## 📝 Utilisation

1. **Importer un CSV** : Cliquez sur "Importer CSV" et sélectionnez votre fichier
2. **Lancer l'algorithme** : Cliquez sur "Générer le planning" pour placer automatiquement les agents
3. **Modifier manuellement** : Glissez-déposez les agents pour ajuster le planning
4. **Exporter** : Sauvegardez le planning généré

## 🔧 Développement

```bash
# Frontend uniquement
npm run dev:frontend

# Backend uniquement
npm run dev:backend

# Build production
npm run build
```

## 📄 License

Propriétaire - Tous droits réservés
