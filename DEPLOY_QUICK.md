# 🚀 Déploiement Rapide sur Vercel

## ⚡ Déploiement en 10 minutes

### 1️⃣ Préparer le projet (2 min)

```bash
# Installer les dépendances backend
cd backend
npm install

# Commiter les changements
git add .
git commit -m "feat: Préparation déploiement Vercel"
git push origin main
```

### 2️⃣ Déployer sur Vercel (5 min)

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre repository GitHub
4. Configurez :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. Cliquez sur **"Deploy"**

### 3️⃣ Configurer les variables (3 min)

Dans le dashboard Vercel → Settings → Environment Variables :

```
VITE_SUPABASE_URL = https://ewudpdkppclxwuuujtir.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRONTEND_URL = https://votre-app.vercel.app
```

---

## 🔧 Configuration WebSocket

### Option A : Socket.io avec polling (simple)
Le backend est déjà configuré pour utiliser polling comme fallback.

### Option B : Supabase Realtime (recommandé)
```typescript
// Remplacer realtimeService.ts par Supabase Realtime
import { RealtimeChannel } from '@supabase/supabase-js';

export const subscribeToPlanning = (callback: Function) => {
  return supabase
    .channel('planning-updates')
    .on('postgres_changes', callback)
    .subscribe();
};
```

---

## 📱 Tester le déploiement

### 1. Vérifier le frontend
Ouvrez : `https://votre-app.vercel.app`

### 2. Vérifier l'API
```bash
curl https://votre-app.vercel.app/api/health
```

### 3. Tester les fonctionnalités
- ✅ Page de login
- ✅ Import CSV
- ✅ Génération planning
- ✅ Analytics
- ✅ Gestion congés

---

## 🚨 Problèmes courants

### Build failed
```bash
# Nettoyer et réinstaller
rm -rf frontend/node_modules frontend/dist
cd frontend && npm install && npm run build
```

### Variables d'environnement
```bash
# Vérifier avec Vercel CLI
vercel env ls
```

### WebSocket ne fonctionne pas
- Activer polling dans les options
- Utiliser Supabase Realtime

---

## 🎉 C'est déployé !

URLs :
- **App** : `https://votre-app.vercel.app`
- **API** : `https://votre-app.vercel.app/api`

Prochaines étapes :
1. Configurer un domaine personnalisé
2. Activer les analytics
3. Mettre en place le monitoring

**🚀 Votre application est en ligne !**
