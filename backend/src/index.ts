import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Vite dev server
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.post('/api/upload-csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: req.file.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// WebSocket - Gestion des connexions en temps réel
const connectedUsers = new Map<string, { socketId: string; userEmail: string }>();

io.on('connection', (socket) => {
  console.log(`✅ Nouvelle connexion WebSocket: ${socket.id}`);

  // Utilisateur rejoint la session
  socket.on('user:join', (data: { userId: string; userEmail: string }) => {
    connectedUsers.set(data.userId, { socketId: socket.id, userEmail: data.userEmail });
    socket.broadcast.emit('user:joined', data);
    console.log(`👋 ${data.userEmail} a rejoint la session`);
  });

  // Planning mis à jour
  socket.on('planning:update', (data: { planning: any; userId: string }) => {
    socket.broadcast.emit('planning:updated', data);
    console.log(`📅 Planning mis à jour par ${data.userId}`);
  });

  // Agent ajouté
  socket.on('agent:add', (data: { agent: any; userId: string }) => {
    socket.broadcast.emit('agent:added', data);
    console.log(`👤 Agent ajouté par ${data.userId}`);
  });

  // Agent modifié
  socket.on('agent:update', (data: { agent: any; userId: string }) => {
    socket.broadcast.emit('agent:updated', data);
    console.log(`👤 Agent modifié par ${data.userId}`);
  });

  // Agent supprimé
  socket.on('agent:delete', (data: { agentId: string; userId: string }) => {
    socket.broadcast.emit('agent:deleted', data);
    console.log(`👤 Agent supprimé par ${data.userId}`);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    // Trouver l'utilisateur par socketId
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        connectedUsers.delete(userId);
        socket.broadcast.emit('user:left', { userId });
        console.log(`👋 ${userData.userEmail} a quitté la session`);
        break;
      }
    }
  });
});

// Démarrage du serveur
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
});
