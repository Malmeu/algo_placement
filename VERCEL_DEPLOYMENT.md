# 🚀 Déploiement sur Vercel - Algo Placement

## 📋 Vue d'ensemble

Ce guide explique comment déployer l'application Algo Placement sur Vercel. Le déploiement se fait en deux parties :
- **Frontend** : Déployé sur Vercel (automatique)
- **Backend** : Déployé sur Vercel Serverless Functions

---

## 🏗️ Architecture de Déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Supabase      │
│   (Vercel)      │◄──►│   (Vercel)      │◄──►│   (Cloud)       │
│   React SPA     │    │   Serverless    │    │   PostgreSQL    │
│   WebSocket     │    │   Functions     │    │   Auth          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 Prérequis

### 1. Compte Vercel
- Créez un compte sur [vercel.com](https://vercel.com)
- Connectez-vous avec GitHub/GitLab/Bitbucket

### 2. Projet Git
- Code poussé sur GitHub/Bitbucket/GitLab
- Repository public ou privé

### 3. Supabase configuré
- Projet Supabase créé
- Tables créées avec `supabase_schema.sql`
- Clés API récupérées

---

## 📁 Structure du Projet

```
algo_placement/
├── frontend/                 # Application React
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # API Serverless
│   ├── src/
│   ├── package.json
│   └── api/                  # Functions Vercel
├── vercel.json              # Configuration Vercel
├── package.json             # Root package.json
└── README.md
```

---

## 🛠️ Configuration du Backend pour Vercel

### 1. Créer les dossiers API
```bash
cd backend
mkdir -p api
```

### 2. Créer les fonctions Serverless
Créez `backend/api/index.ts` :
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-session', (data) => {
    socket.join(data.sessionId);
    socket.to(data.sessionId).emit('user-joined', data);
  });

  socket.on('planning-update', (data) => {
    socket.to(data.sessionId).emit('planning-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export pour Vercel
export default app;
```

### 3. Mettre à jour package.json backend
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "socket.io": "^4.8.1",
    "@vercel/node": "^3.0.0"
  }
}
```

---

## ⚙️ Configuration Vercel

### 1. Créer vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "functions": {
    "backend/api/index.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 2. Créer .vercelignore
```
node_modules
.git
dist
.env
*.log
.DS_Store
```

---

## 🔧 Configuration du Frontend

### 1. Mettre à jour vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
          utils: ['date-fns', 'papaparse']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
```

### 2. Mettre à jour les URLs WebSocket
Dans `frontend/src/services/realtimeService.ts` :
```typescript
class RealtimeService {
  private socket: any;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin.replace('https://', 'wss://').replace('http://', 'ws://')
      : 'ws://localhost:3001';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling']
    });
  }
}
```

---

## 🚀 Déploiement Étape par Étape

### 1. Préparer le projet
```bash
# Commiter tous les changements
git add .
git commit -m "feat: Préparation déploiement Vercel"

# Pousser sur GitHub
git push origin main
```

### 2. Déployer sur Vercel

#### Méthode A : Via le site Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre repository GitHub
4. Configurez les settings :
   - **Framework Preset** : Vite
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`
5. Cliquez sur **"Deploy"**

#### Méthode B : Via Vercel CLI
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### 3. Configurer les variables d'environnement
Dans le dashboard Vercel → Settings → Environment Variables :

```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_clé_anon
FRONTEND_URL = https://votre-app.vercel.app
```

---

## 🔄 WebSocket sur Vercel

### 1. Limitations Vercel
Vercel Serverless Functions a des limitations pour WebSocket. Solutions :

#### Option A : Utiliser Socket.io avec polling
```typescript
// Dans backend/api/index.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Server } from 'socket.io';

const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  },
  transports: ['polling', 'websocket'] // Fallback sur polling
});

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    res.socket.server.io = io;
  }
  
  res.end();
};
```

#### Option B : Service externe (recommandé)
Utilisez un service spécialisé pour WebSocket :
- **Pusher** : [pusher.com](https://pusher.com)
- **Ably** : [ably.com](https://ably.com)
- **Supabase Realtime** : Inclus dans Supabase

### 2. Implémentation avec Supabase Realtime
```typescript
// frontend/src/services/supabaseRealtime.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export class SupabaseRealtime {
  subscribeToPlanning(callback: (planning: any) => void) {
    const channel = supabase
      .channel('planning-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'plannings' },
        callback
      )
      .subscribe();
    
    return channel;
  }

  sendPlanningUpdate(planning: any) {
    return supabase
      .from('plannings')
      .update({ data: planning })
      .eq('id', planning.id);
  }
}
```

---

## 📊 Monitoring et Logs

### 1. Logs Vercel
```bash
# Voir les logs en temps réel
vercel logs

# Logs d'une fonction spécifique
vercel logs --filter function=api/index
```

### 2. Analytics Vercel
- Allez sur votre dashboard Vercel
- Section **Analytics**
- Voir les performances, erreurs, usage

### 3. Performance monitoring
```typescript
// Ajouter dans frontend/src/main.tsx
if (process.env.NODE_ENV === 'production') {
  // Vercel Analytics
  import('@vercel/analytics').then(({ inject }) => inject());
}
```

---

## 🔒 Sécurité

### 1. Variables d'environnement
- Jamais de clés dans le code
- Utiliser les secrets Vercel
- Rotation régulière des clés

### 2. CORS
```typescript
// backend/api/index.ts
app.use(cors({
  origin: [
    'https://votre-app.vercel.app',
    'https://votre-app-git-branch.vercel.app'
  ],
  credentials: true
}));
```

### 3. Rate limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limite par IP
});

app.use('/api/', limiter);
```

---

## 🧪 Tests avant déploiement

### 1. Build local
```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
npm run build
```

### 2. Tests E2E
```bash
# Installer Playwright
npm install -D @playwright/test

# Tests de déploiement
npx playwright test --project=chromium
```

### 3. Performance
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

---

## 🚨 Dépannage

### Problèmes courants

#### 1. Build failed
```bash
# Vérifier les dépendances
npm ci

# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install
```

#### 2. WebSocket ne se connecte pas
- Vérifier que le backend est déployé
- Configurer CORS correctement
- Utiliser polling comme fallback

#### 3. Variables d'environnement
```bash
# Vérifier les variables
vercel env ls

# Ajouter une variable
vercel env add VITE_SUPABASE_URL
```

#### 4. Performance
- Activer le caching
- Optimiser les images
- Utiliser CDN Vercel

### Debug mode
```typescript
// Ajouter dans frontend/src/App.tsx
if (process.env.NODE_ENV === 'development') {
  console.log('Debug mode activé');
  console.log('Variables:', {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV
  });
}
```

---

## 📈 Optimisations

### 1. Performance
```typescript
// Code splitting
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'));

// Image optimization
import Image from 'next/image'; // si Next.js
```

### 2. SEO
```typescript
// Ajouter meta tags
import { Helmet } from 'react-helmet';

<Helmet>
  <title>Algo Placement - Planification intelligente</title>
  <meta name="description" content="Application de planification d'agents" />
</Helmet>
```

### 3. Caching
```typescript
// Cache stratégie
app.use('/api/plannings', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
});
```

---

## 🔄 CI/CD avec GitHub Actions

### 1. Créer .github/workflows/deploy.yml
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
          
      - name: Run tests
        run: |
          cd frontend && npm test
          cd ../backend && npm test
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📋 Checklist de déploiement

### Avant le déploiement
- [ ] Code commité et poussé
- [ ] Tests passants
- [ ] Variables d'environnement configurées
- [ ] Build local réussi
- [ ] Documentation à jour

### Après le déploiement
- [ ] Vérifier l'URL de production
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier les logs
- [ ] Configurer le monitoring
- [ ] Mettre à jour la documentation

### Maintenance
- [ ] Monitoring régulier
- [ ] Mises à jour de sécurité
- [ ] Backup des données
- [ ] Performance audits

---

## 🎉 Conclusion

Votre application Algo Placement est maintenant déployée sur Vercel !

### URL finale
- **Frontend** : `https://votre-app.vercel.app`
- **Backend API** : `https://votre-app.vercel.app/api`

### Prochaines étapes
1. Configurer un domaine personnalisé
2. Activer le monitoring avancé
3. Mettre en place les alertes
4. Optimiser pour le SEO

### Support
- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Support** : [vercel.com/support](https://vercel.com/support)
- **Community** : [vercel.com/community](https://vercel.com/community)

---

**🚀 Bon déploiement !**
