import { io, Socket } from 'socket.io-client';
import { Planning, Agent } from '@/types';

class RealtimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(url: string = 'http://localhost:3001') {
    if (this.socket?.connected) {
      console.log('✅ Déjà connecté au serveur WebSocket');
      return;
    }

    console.log('🔌 Connexion au serveur WebSocket...');
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur WebSocket');
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur WebSocket');
      this.emit('connection-status', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      this.emit('connection-error', error);
    });

    // Écouter les événements du serveur
    this.socket.on('planning:updated', (data: { planning: Planning; userId: string }) => {
      console.log('📅 Planning mis à jour par un autre utilisateur');
      this.emit('planning:updated', data);
    });

    this.socket.on('agent:added', (data: { agent: Agent; userId: string }) => {
      console.log('👤 Nouvel agent ajouté par un autre utilisateur');
      this.emit('agent:added', data);
    });

    this.socket.on('agent:updated', (data: { agent: Agent; userId: string }) => {
      console.log('👤 Agent modifié par un autre utilisateur');
      this.emit('agent:updated', data);
    });

    this.socket.on('agent:deleted', (data: { agentId: string; userId: string }) => {
      console.log('👤 Agent supprimé par un autre utilisateur');
      this.emit('agent:deleted', data);
    });

    this.socket.on('user:joined', (data: { userId: string; userEmail: string }) => {
      console.log(`👋 ${data.userEmail} a rejoint la session`);
      this.emit('user:joined', data);
    });

    this.socket.on('user:left', (data: { userId: string }) => {
      console.log(`👋 Un utilisateur a quitté la session`);
      this.emit('user:left', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Déconnecté du serveur WebSocket');
    }
  }

  // Émettre un événement vers le serveur
  sendPlanningUpdate(planning: Planning, userId: string) {
    this.socket?.emit('planning:update', { planning, userId });
  }

  sendAgentAdded(agent: Agent, userId: string) {
    this.socket?.emit('agent:add', { agent, userId });
  }

  sendAgentUpdated(agent: Agent, userId: string) {
    this.socket?.emit('agent:update', { agent, userId });
  }

  sendAgentDeleted(agentId: string, userId: string) {
    this.socket?.emit('agent:delete', { agentId, userId });
  }

  joinSession(userId: string, userEmail: string) {
    this.socket?.emit('user:join', { userId, userEmail });
  }

  // Système d'événements
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const realtimeService = new RealtimeService();
