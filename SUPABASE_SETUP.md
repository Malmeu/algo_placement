# Configuration Supabase pour Algo Placement

## 📋 Prérequis

Vous avez déjà un projet Supabase configuré avec :
- **Project URL** : `https://ewudpdkppclxwuuujtir.supabase.co`
- **API Key (anon)** : Déjà configurée dans le code

## 🚀 Étapes de configuration

### 1. Créer les tables dans Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet `ewudpdkppclxwuuujtir`
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Créez une nouvelle requête
5. Copiez-collez le contenu du fichier `supabase_schema.sql`
6. Cliquez sur **Run** pour exécuter le script

### 2. Vérifier les tables

Dans l'onglet **Table Editor**, vous devriez voir :
- ✅ Table `agents` avec les colonnes :
  - `id` (text, primary key)
  - `nom` (text)
  - `disponibilites` (jsonb)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- ✅ Table `plannings` avec les colonnes :
  - `id` (text, primary key)
  - `date` (text)
  - `assignments` (jsonb)
  - `stats` (jsonb)
  - `warnings` (text[])
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### 3. Vérifier les politiques RLS (Row Level Security)

Dans l'onglet **Authentication** > **Policies** :
- Les tables `agents` et `plannings` doivent avoir RLS activé
- Les politiques "Allow all operations" doivent être présentes

⚠️ **Note** : Ces politiques permettent tout accès pour simplifier le développement. 
Pour la production, vous devriez restreindre l'accès selon vos besoins de sécurité.

## 🔧 Fonctionnalités activées

### ✅ Sauvegarde automatique
- Les agents sont automatiquement sauvegardés dans Supabase à chaque modification
- Les plannings sont sauvegardés automatiquement lors de la génération ou modification
- Fallback sur localStorage en cas d'erreur de connexion

### ✅ Historique des plannings
- Tous les plannings générés sont conservés dans la base de données
- Accessible via l'onglet **Historique**
- Possibilité de charger un ancien planning
- Suppression possible des plannings obsolètes

### ✅ Notifications visuelles
- Notifications en temps réel pour toutes les actions
- Types : succès (vert), erreur (rouge), avertissement (jaune), info (bleu)
- Fermeture automatique après 5 secondes (configurable)

### ✅ Vue par agent
- Voir le planning d'un agent spécifique
- Statistiques individuelles (heures, affectations, pôles)
- Vue hebdomadaire détaillée par créneau

## 🧪 Test de la connexion

Pour tester que Supabase fonctionne correctement :

1. Lancez l'application : `npm run dev`
2. Ouvrez la console du navigateur (F12)
3. Importez un CSV ou ajoutez un agent
4. Vous devriez voir dans la console :
   - ✅ Pas d'erreur Supabase
   - ✅ Notification de succès "X agent(s) chargé(s) depuis la base de données"
5. Vérifiez dans Supabase Table Editor que les données apparaissent

## 🔍 Dépannage

### Erreur : "Your account does not have the necessary privileges"
- Vérifiez que vous utilisez la bonne API key (anon key)
- Vérifiez que les politiques RLS sont bien configurées

### Erreur : "relation 'agents' does not exist"
- Exécutez le script SQL `supabase_schema.sql` dans l'éditeur SQL

### Les données ne se sauvegardent pas
- Ouvrez la console du navigateur pour voir les erreurs
- Vérifiez que les politiques RLS permettent les opérations INSERT/UPDATE
- Vérifiez votre connexion internet

### Fallback sur localStorage
- Si Supabase ne fonctionne pas, l'application utilise automatiquement localStorage
- Vous verrez une notification "Agents chargés depuis le cache local"
- Les données restent locales jusqu'à ce que Supabase soit accessible

## 📊 Structure des données

### Table `agents`
```json
{
  "id": "agent-1234567890",
  "nom": "Marie Dupont",
  "disponibilites": {
    "LUNDI": { "type": "DISPONIBLE" },
    "MARDI": { "type": "DISPONIBLE MATIN" },
    "MERCREDI": { "type": "DISPONIBLE A PARTIR DE", "startTime": "10:00" },
    "JEUDI": { "type": "DISPONIBLE" },
    "VENDREDI": { "type": "PAS DISPONIBLE" }
  }
}
```

### Table `plannings`
```json
{
  "id": "planning-1234567890",
  "date": "2024-01-15",
  "assignments": [
    {
      "agentId": "agent-1234567890",
      "agentNom": "Marie Dupont",
      "pole": "Secure Academy",
      "jour": "LUNDI",
      "timeSlot": "MATIN"
    }
  ],
  "stats": {},
  "warnings": ["Aucun agent disponible pour Mutuelle le VENDREDI (après-midi)"]
}
```

## 🎯 Prochaines étapes

- [ ] Ajouter l'authentification utilisateur
- [ ] Implémenter des politiques RLS plus strictes
- [ ] Ajouter la gestion des rôles (admin, manager, agent)
- [ ] Créer des vues SQL pour les statistiques avancées
- [ ] Ajouter des triggers pour la validation des données
