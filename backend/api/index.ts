import type { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

// Créer l'application Express
const app = express();

// Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parser JSON
app.use(express.json());

// Routes de base
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Algo Placement API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/upload',
      'GET /api/agents',
      'WebSocket /socket.io'
    ]
  });
});

// Créer le serveur HTTP pour Socket.io
const server = createServer(app);

// Configuration Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  transports: ['polling', 'websocket']
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-session', (data) => {
    console.log('User joining session:', data);
    socket.join(data.sessionId);
    socket.to(data.sessionId).emit('user-joined', {
      ...data,
      socketId: socket.id
    });
  });

  socket.on('planning-update', (data) => {
    console.log('Planning update received:', data);
    socket.to(data.sessionId).emit('planning-updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('agent-added', (data) => {
    console.log('Agent added:', data);
    socket.to(data.sessionId).emit('agent-updated', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export pour Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  // Initialiser Socket.io si pas déjà fait
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    res.socket.server.io = io;
  }
  
  // Laisser Express gérer la requête
  return app(req, res);
};
