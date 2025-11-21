import { useState } from 'react';
import { Upload, Calendar, Users, BarChart3 } from 'lucide-react';
import CSVUploader from './components/CSVUploader';
import AgentsList from './components/AgentsList';
import PlanningCalendar from './components/PlanningCalendar';
import { Agent, Planning } from './types';
import { generatePlanning } from './services/placementAlgorithm';

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'agents' | 'planning' | 'stats'>('upload');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCSVUploaded = (uploadedAgents: Agent[]) => {
    setAgents(uploadedAgents);
    setActiveTab('agents');
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
        
        if (result.warnings.length > 0) {
          console.warn('Avertissements:', result.warnings);
        }
      } else {
        alert('Erreur lors de la génération du planning');
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
            <AgentsList agents={agents} />
          )}
          
          {activeTab === 'planning' && planning && (
            <PlanningCalendar planning={planning} agents={agents} />
          )}
          
          {activeTab === 'stats' && planning && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Statistiques du planning</h2>
              <p className="text-gray-600">Statistiques à venir...</p>
            </div>
          )}
        </div>
      </main>
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
