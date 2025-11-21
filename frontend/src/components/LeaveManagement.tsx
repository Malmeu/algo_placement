import { useState, useEffect } from 'react';
import { Agent, Leave } from '@/types';
import { Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaveManagementProps {
  agents: Agent[];
  leaves: Leave[];
  setLeaves: (leaves: Leave[]) => void;
}

const LEAVE_TYPES = [
  { value: 'CONGE', label: 'Congé', color: 'bg-blue-100 text-blue-800' },
  { value: 'MALADIE', label: 'Maladie', color: 'bg-red-100 text-red-800' },
  { value: 'FORMATION', label: 'Formation', color: 'bg-green-100 text-green-800' },
  { value: 'AUTRE', label: 'Autre', color: 'bg-gray-100 text-gray-800' },
];

export default function LeaveManagement({ agents, leaves, setLeaves }: LeaveManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    agent_id: '',
    date_debut: '',
    date_fin: '',
    type_conge: 'CONGE' as Leave['type_conge'],
    motif: '',
  });

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const agent = agents.find(a => a.id === formData.agent_id);
    if (!agent) return;

    const newLeave: Leave = {
      id: `leave-${Date.now()}`,
      agent_id: formData.agent_id,
      agent_nom: agent.nom,
      type_conge: formData.type_conge,
      date_debut: formData.date_debut,
      date_fin: formData.date_fin,
      motif: formData.motif,
      statut: 'VALIDE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLeaves([...leaves, newLeave]);
    setShowForm(false);
    setFormData({
      agent_id: '',
      date_debut: '',
      date_fin: '',
      type_conge: 'CONGE',
      motif: '',
    });
  };

  const handleDelete = (leaveId: string) => {
    if (confirm('Supprimer ce congé ?')) {
      setLeaves(leaves.filter(l => l.id !== leaveId));
    }
  };

  const getLeaveTypeInfo = (type: Leave['type_conge']) => {
    return LEAVE_TYPES.find(t => t.value === type) || LEAVE_TYPES[0];
  };

  const isLeaveActive = (leave: Leave) => {
    const now = new Date();
    const start = new Date(leave.date_debut);
    const end = new Date(leave.date_fin);
    return now >= start && now <= end;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des congés</h2>
          <p className="text-sm text-gray-500 mt-1">
            {leaves.length} congé{leaves.length > 1 ? 's' : ''} enregistré{leaves.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Ajouter un congé
        </button>
      </div>

      {/* Alerte congés actifs */}
      {leaves.filter(isLeaveActive).length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Congés en cours</h3>
            <p className="text-sm text-yellow-800">
              {leaves.filter(isLeaveActive).length} agent(s) en congé actuellement
            </p>
          </div>
        </div>
      )}

      {/* Liste des congés */}
      <div className="space-y-3">
        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun congé enregistré</p>
          </div>
        ) : (
          leaves.map((leave, index) => {
            const typeInfo = getLeaveTypeInfo(leave.type_conge);
            const active = isLeaveActive(leave);

            return (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg p-4 ${active ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{leave.agent_nom}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {active && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500 text-white">
                          En cours
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Du</span>{' '}
                      {new Date(leave.date_debut).toLocaleDateString('fr-FR')} - {new Date(leave.date_fin).toLocaleDateString('fr-FR')}
                    </div>
                    {leave.motif && (
                      <p className="text-sm text-gray-500 mt-2">{leave.motif}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(leave.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Formulaire modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter un congé</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent *
                </label>
                <select
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Sélectionner un agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date début *
                  </label>
                  <input
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type_conge}
                  onChange={(e) => setFormData({ ...formData, type_conge: e.target.value as Leave['type_conge'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {LEAVE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif (optionnel)
                </label>
                <textarea
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Raison du congé..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
