import { useState, useEffect } from 'react';
import { Upload, Calendar, Users, BarChart3, Plus, History, Eye } from 'lucide-react';
import CSVUploader from './components/CSVUploader';
import AgentsList from './components/AgentsList';
import PlanningCalendar from './components/PlanningCalendar';
import AgentForm from './components/AgentForm';
import PlanningHistory from './components/PlanningHistory';
import AgentView from './components/AgentView';
import NotificationBanner, { useNotifications } from './components/NotificationBanner';
import { Agent, Planning } from './types';
import { generatePlanning } from './services/placementAlgorithm';
import { saveAgents, loadAgents, savePlanning, deleteAgent as deleteAgentFromDb } from './services/supabaseService';

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'agents' | 'planning' | 'history' | 'agentView' | 'stats'>('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);
  const notifications = useNotifications();

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

  const handleCSVUploaded = (uploadedAgents: Agent[]) => {
    setAgents(uploadedAgents);
    setActiveTab('agents');
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
    } else {
      // Ajouter un nouvel agent
      setAgents([...agents, agent]);
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
      alert('Veuillez d\'abord importer un fichier CSV');
      return;
    }

    setIsGenerating(true);
    try {
      // Simuler un délai pour l'animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = generatePlanning(agents);
      
      if (result.success) {
        setPlanning(result.planning);
        setActiveTab('planning');
        notifications.success('Planning généré avec succès !');
        
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
      alert('Une erreur est survenue lors de la génération du planning');
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
                <p className="text-sm text-gray-500">Planification intelligente d'agents</p>
              </div>
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
            active={activeTab === 'stats'}
            onClick={() => setActiveTab('stats')}
            icon={<BarChart3 className="w-5 h-5" />}
            label="Statistiques"
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
          
          {activeTab === 'stats' && planning && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Statistiques du planning</h2>
              <p className="text-gray-600">Statistiques à venir...</p>
            </div>
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
