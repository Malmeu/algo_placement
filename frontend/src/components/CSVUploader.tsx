import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { Agent, CSVRow } from '@/types';
import { parseAvailability } from '@/utils/availabilityParser';

interface CSVUploaderProps {
  onCSVUploaded: (agents: Agent[]) => void;
}

export default function CSVUploader({ onCSVUploaded }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setSuccess(false);

    if (!file.name.endsWith('.csv')) {
      setError('Le fichier doit être au format CSV');
      return;
    }

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const agents = parseCSVData(results.data);
          onCSVUploaded(agents);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur lors du parsing du CSV');
        }
      },
      error: (err) => {
        setError(`Erreur de lecture du fichier: ${err.message}`);
      },
    });
  };

  const parseCSVData = (data: CSVRow[]): Agent[] => {
    const agents: Agent[] = [];

    data.forEach((row, index) => {
      if (!row.NOM) {
        throw new Error(`Ligne ${index + 1}: Le nom de l'agent est requis`);
      }

      const agent: Agent = {
        id: `agent-${Date.now()}-${index}`,
        nom: row.NOM.trim(),
        disponibilites: {
          LUNDI: parseAvailability(row.LUNDI || 'PAS DISPONIBLE'),
          MARDI: parseAvailability(row.MARDI || 'PAS DISPONIBLE'),
          MERCREDI: parseAvailability(row.MERCREDI || 'PAS DISPONIBLE'),
          JEUDI: parseAvailability(row.JEUDI || 'PAS DISPONIBLE'),
          VENDREDI: parseAvailability(row.VENDREDI || 'PAS DISPONIBLE'),
        },
      };

      agents.push(agent);
    });

    if (agents.length === 0) {
      throw new Error('Le fichier CSV ne contient aucun agent valide');
    }

    return agents;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Importer les disponibilités
          </h2>
          <p className="text-gray-600">
            Téléchargez un fichier CSV contenant les disponibilités des agents
          </p>
        </div>

        {/* Zone de drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Glissez-déposez votre fichier CSV ici
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ou cliquez pour sélectionner un fichier
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Parcourir
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-slide-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3 animate-slide-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Succès</p>
              <p className="text-sm text-green-700">Le fichier CSV a été importé avec succès</p>
            </div>
          </div>
        )}

        {/* Format attendu */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Format CSV attendu</h3>
              <p className="text-sm text-gray-600 mb-3">
                Le fichier doit contenir les colonnes suivantes :
              </p>
              <div className="bg-white rounded border border-gray-200 p-3 font-mono text-xs overflow-x-auto">
                <div className="text-gray-700">
                  NOM,LUNDI,MARDI,MERCREDI,JEUDI,VENDREDI
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p className="font-medium mb-1">Types de disponibilité supportés :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>DISPONIBLE</li>
                  <li>PAS DISPONIBLE</li>
                  <li>DISPONIBLE MATIN</li>
                  <li>DISPONIBLE APRES MIDI</li>
                  <li>DISPONIBLE PARFOIS APRES MIDI</li>
                  <li>DISPONIBLE A PARTIR DE [heure] (ex: DISPONIBLE A PARTIR DE 11H30)</li>
                  <li>PAS DISPONIBLE DE [heure]-[heure] (ex: PAS DISPONIBLE DE 10H-12H)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
