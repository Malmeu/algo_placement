import { useState, useEffect } from 'react';
import { Upload, Calendar, Users, BarChart3, Plus, History, Eye, Briefcase, LogOut, Zap } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import CSVUploader from './components/CSVUploader';
import AgentsList from './components/AgentsList';
import PlanningCalendar from './components/PlanningCalendar';
import AgentForm from './components/AgentForm';
import PlanningHistory from './components/PlanningHistory';
import AgentView from './components/AgentView';
import LeaveManagement from './components/LeaveManagement';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NotificationBanner, { useNotifications } from './components/NotificationBanner';
import { Agent, Planning } from './types';
import { generatePlanning } from './services/placementAlgorithm';
import { generatePlanningWithGeneticAlgorithm } from './services/geneticAlgorithm';
import { saveAgents, loadAgents, savePlanning, deleteAgent as deleteAgentFromDb } from './services/supabaseService';
import { realtimeService } from './services/realtimeService';

function App() {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'agents' | 'planning' | 'history' | 'agentView' | 'leaves' | 'stats'>('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);
  const [useGeneticAlgorithm, setUseGeneticAlgorithm] = useState(false);
  const notifications = useNotifications();

  // ⚠️ TOUS LES HOOKS DOIVENT ÊTRE AVANT LES RETURN CONDITIONNELS

  // Connexion WebSocket au démarrage
  useEffect(() => {
    if (user) {
      realtimeService.connect();
      realtimeService.joinSession(user.id, user.email || 'Utilisateur');

      // Écouter les mises à jour en temps réel
      realtimeService.on('planning:updated', (data: any) => {
        if (data.userId !== user.id) {
          setPlanning(data.planning);
          notifications.info('Planning mis à jour par un autre utilisateur');
        }
      });

      realtimeService.on('agent:added', (data: any) => {
        if (data.userId !== user.id) {
          setAgents(prev => [...prev, data.agent]);
          notifications.info(`Agent ${data.agent.nom} ajouté par un autre utilisateur`);
        }
      });

      realtimeService.on('user:joined', (data: any) => {
        notifications.info(`${data.userEmail} a rejoint la session`);
      });

      return () => {
        realtimeService.disconnect();
      };
    }
  }, [user]);

  // Charger les agents depuis Supabase au démarrage
  useEffect(() => {
    const fetchAgents = async () => {
      const result = await loadAgents();
      if (result.success && result.agents) {
        setAgents(result.agents);
        notifications.success(`${result.agents.length} agent(s) chargé(s) depuis la base de données`);
      } else if (result.error) {
        notifications.error('Erreur lors du chargement des agents : ' + result.error);
        // Fallback sur localStorage
        const savedAgents = localStorage.getItem('agents');
        if (savedAgents) {
          setAgents(JSON.parse(savedAgents));
          notifications.info('Agents chargés depuis le cache local');
        }
      }
    };
    fetchAgents();
  }, []);

  // Sauvegarder les agents dans Supabase et localStorage
  useEffect(() => {
    if (agents.length > 0) {
      localStorage.setItem('agents', JSON.stringify(agents));
      saveAgents(agents).then(result => {
        if (!result.success) {
          console.error('Erreur sauvegarde Supabase:', result.error);
        }
      });
    }
  }, [agents]);

  // Sauvegarder le planning dans Supabase et localStorage
  useEffect(() => {
    if (planning) {
      localStorage.setItem('currentPlanning', JSON.stringify(planning));
      savePlanning(planning).then(result => {
        if (!result.success) {
          console.error('Erreur sauvegarde planning:', result.error);
        }
      });
    }
  }, [planning]);

  // Afficher le loader pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher la page de login si pas connecté
  if (!user) {
    return <LoginPage />;
  }

  const handleCSVUploaded = (uploadedAgents: Agent[]) => {
    // Vérifier les doublons par nom
    const existingNames = new Set(agents.map(a => a.nom.toLowerCase().trim()));
    const newAgents: Agent[] = [];
    const duplicates: string[] = [];

    uploadedAgents.forEach(agent => {
      const normalizedName = agent.nom.toLowerCase().trim();
      if (existingNames.has(normalizedName)) {
        duplicates.push(agent.nom);
      } else {
        newAgents.push(agent);
        existingNames.add(normalizedName);
      }
    });

    if (newAgents.length > 0) {
      setAgents([...agents, ...newAgents]);
      notifications.success(`${newAgents.length} agent(s) importé(s) avec succès`);
    }

    if (duplicates.length > 0) {
      notifications.warning(
        `${duplicates.length} doublon(s) ignoré(s) : ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`,
        10000
      );
    }

    if (newAgents.length > 0) {
      setActiveTab('agents');
    }
  };

  const handleAddAgent = () => {
    setEditingAgent(undefined);
    setShowAgentForm(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  const handleSaveAgent = (agent: Agent) => {
    if (editingAgent) {
      // Modifier un agent existant
      setAgents(agents.map(a => a.id === agent.id ? agent : a));
      notifications.success('Agent modifié avec succès');
    } else {
      // Vérifier si un agent avec le même nom existe déjà
      const normalizedName = agent.nom.toLowerCase().trim();
      const duplicate = agents.find(a => a.nom.toLowerCase().trim() === normalizedName);

      if (duplicate) {
        notifications.error(`Un agent nommé "${agent.nom}" existe déjà !`);
        return;
      }

      // Ajouter un nouvel agent
      setAgents([...agents, agent]);
      notifications.success('Agent ajouté avec succès');
      
      // Envoyer via WebSocket
      if (user) {
        realtimeService.sendAgentAdded(agent, user.id);
      }
    }
    setShowAgentForm(false);
    setEditingAgent(undefined);
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      setAgents(agents.filter(a => a.id !== agentId));
      const result = await deleteAgentFromDb(agentId);
      if (result.success) {
        notifications.success('Agent supprimé avec succès');
      } else {
        notifications.error('Erreur lors de la suppression : ' + result.error);
      }
    }
  };

  const handleGeneratePlanning = async () => {
    if (agents.length === 0) {
      alert('Veuillez d\'abord importer un fichier CSV ou ajouter des agents');
      return;
    }

    setIsGenerating(true);
    try {
      notifications.info(useGeneticAlgorithm ? '🧬 Génération avec algorithme génétique...' : '⚡ Génération rapide...');
      
      // Utiliser l'algorithme sélectionné
      const result = useGeneticAlgorithm 
        ? generatePlanningWithGeneticAlgorithm(agents)
        : await (async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return generatePlanning(agents);
          })();
      
      if (result.success) {
        setPlanning(result.planning);
        setActiveTab('planning');
        
        // Envoyer la mise à jour via WebSocket
        if (user) {
          realtimeService.sendPlanningUpdate(result.planning, user.id);
        }
        
        notifications.success(
          useGeneticAlgorithm 
            ? '🧬 Planning optimisé généré avec succès !' 
            : '⚡ Planning généré avec succès !'
        );
        
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            notifications.warning(warning, 8000);
          });
        }
      } else {
        notifications.error('Erreur lors de la génération du planning');
      }
    } catch (error) {
      console.error('Erreur:', error);
      notifications.error('Une erreur est survenue lors de la génération du planning');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Algo Placement</h1>
                <p className="text-sm text-gray-500">
                  {user.email} {isAdmin && <span className="text-blue-600 font-semibold">• Admin</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Toggle algorithme génétique */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Zap size={18} className={useGeneticAlgorithm ? 'text-yellow-600' : 'text-gray-400'} />
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGeneticAlgorithm}
                    onChange={(e) => setUseGeneticAlgorithm(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${useGeneticAlgorithm ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${useGeneticAlgorithm ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {useGeneticAlgorithm ? 'Génétique' : 'Rapide'}
                  </span>
                </label>
              </div>

              <button
                onClick={handleGeneratePlanning}
                disabled={agents.length === 0 || isGenerating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    <span>Générer le planning</span>
                  </>
                )}
              </button>

              <button
                onClick={signOut}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <TabButton
            active={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
            icon={<Upload className="w-5 h-5" />}
            label="Import CSV"
          />
          <TabButton
            active={activeTab === 'agents'}
            onClick={() => setActiveTab('agents')}
            icon={<Users className="w-5 h-5" />}
            label={`Agents (${agents.length})`}
            disabled={agents.length === 0}
          />
          <TabButton
            active={activeTab === 'planning'}
            onClick={() => setActiveTab('planning')}
            icon={<Calendar className="w-5 h-5" />}
            label="Planning"
            disabled={!planning}
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<History className="w-5 h-5" />}
            label="Historique"
          />
          <TabButton
            active={activeTab === 'agentView'}
            onClick={() => setActiveTab('agentView')}
            icon={<Eye className="w-5 h-5" />}
            label="Vue agent"
            disabled={!planning}
          />
          <TabButton
            active={activeTab === 'leaves'}
            onClick={() => setActiveTab('leaves')}
            icon={<Briefcase className="w-5 h-5" />}
            label="Congés"
          />
          <TabButton
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            disabled={!planning}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === 'upload' && (
            <CSVUploader onCSVUploaded={handleCSVUploaded} />
          )}
          
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Gestion des agents</h2>
                <button
                  onClick={handleAddAgent}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <Plus size={20} />
                  Ajouter un agent
                </button>
              </div>
              <AgentsList 
                agents={agents} 
                onEdit={handleEditAgent}
                onDelete={handleDeleteAgent}
              />
            </div>
          )}
          
          {activeTab === 'planning' && planning && (
            <PlanningCalendar 
              planning={planning} 
              agents={agents}
              onPlanningUpdate={setPlanning}
            />
          )}

          {activeTab === 'history' && (
            <PlanningHistory 
              onSelectPlanning={(selectedPlanning) => {
                setPlanning(selectedPlanning);
                setActiveTab('planning');
                notifications.info('Planning chargé depuis l\'historique');
              }}
              currentPlanningId={planning?.id}
            />
          )}

          {activeTab === 'agentView' && (
            <AgentView agents={agents} planning={planning} />
          )}

          {activeTab === 'leaves' && (
            <LeaveManagement agents={agents} />
          )}
          
          {activeTab === 'stats' && planning && (
            <AnalyticsDashboard planning={planning} agents={agents} />
          )}
        </div>
      </main>

      {/* Notifications */}
      <NotificationBanner 
        notifications={notifications.notifications}
        onDismiss={notifications.dismissNotification}
      />

      {/* Modal formulaire agent */}
      {showAgentForm && (
        <AgentForm
          agent={editingAgent}
          onSave={handleSaveAgent}
          onCancel={() => {
            setShowAgentForm(false);
            setEditingAgent(undefined);
          }}
        />
      )}
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

function TabButton({ active, onClick, icon, label, disabled }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center space-x-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200
        ${active 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default App;
