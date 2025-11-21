import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Agent, Planning, DayOfWeek, Pole, Assignment } from '@/types';
import { Download, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import EditableAssignment from './EditableAssignment';

interface PlanningCalendarProps {
  planning: Planning;
  agents: Agent[];
  onPlanningUpdate?: (updatedPlanning: Planning) => void;
}

const DAYS: DayOfWeek[] = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];
const POLES: Pole[] = ['Secure Academy', 'Mutuelle', 'Stafy', 'Timeone'];

const POLE_COLORS: Record<Pole, string> = {
  'Secure Academy': 'bg-blue-100 text-blue-800 border-blue-300',
  'Mutuelle': 'bg-green-100 text-green-800 border-green-300',
  'Stafy': 'bg-purple-100 text-purple-800 border-purple-300',
  'Timeone': 'bg-orange-100 text-orange-800 border-orange-300',
};

export default function PlanningCalendar({ planning, agents, onPlanningUpdate }: PlanningCalendarProps) {
  const planningRef = useRef<HTMLDivElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localPlanning, setLocalPlanning] = useState(planning);

  const getAssignmentsForDayAndPole = (day: DayOfWeek, pole: Pole) => {
    return localPlanning.assignments.filter(
      (assignment) => assignment.jour === day && assignment.pole === pole
    );
  };

  const handleUpdateAssignment = (newAssignment: Assignment) => {
    const updatedAssignments = localPlanning.assignments.filter(
      a => !(a.pole === newAssignment.pole && a.jour === newAssignment.jour && a.timeSlot === newAssignment.timeSlot)
    );
    updatedAssignments.push(newAssignment);

    const updatedPlanning: Planning = {
      ...localPlanning,
      assignments: updatedAssignments,
      updatedAt: new Date().toISOString(),
    };

    setLocalPlanning(updatedPlanning);
    if (onPlanningUpdate) {
      onPlanningUpdate(updatedPlanning);
    }
  };

  const exportToPDF = async () => {
    if (!planningRef.current) return;

    try {
      // Capturer le planning en image
      const canvas = await html2canvas(planningRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Créer le PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Télécharger le PDF
      const fileName = `planning_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Planning de la semaine</h2>
          <p className="text-sm text-gray-500">
            Généré le {new Date(planning.createdAt).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
              isEditMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Edit size={20} />
            {isEditMode ? 'Mode lecture' : 'Mode édition'}
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          >
            <Download size={20} />
            Exporter en PDF
          </button>
        </div>
      </div>

      {/* Grille du planning */}
      <div ref={planningRef} className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-6 gap-2">
            {/* En-tête vide */}
            <div className="font-bold text-gray-700 p-3 bg-gray-50 rounded-lg">
              Pôle / Jour
            </div>

            {/* En-têtes des jours */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="font-bold text-gray-700 p-3 bg-gray-50 rounded-lg text-center"
              >
                {day}
              </div>
            ))}

            {/* Lignes pour chaque pôle */}
            {POLES.map((pole) => (
              <React.Fragment key={`pole-row-${pole}`}>
                {/* Nom du pôle */}
                <div
                  className={`font-semibold p-3 rounded-lg border ${POLE_COLORS[pole]}`}
                >
                  {pole}
                </div>

                {/* Cellules pour chaque jour */}
                {DAYS.map((day) => {
                  const assignments = getAssignmentsForDayAndPole(day, pole);
                  const morningAssignment = assignments.find(a => a.timeSlot === 'MATIN');
                  const afternoonAssignment = assignments.find(a => a.timeSlot === 'APRES_MIDI');

                  return (
                    <motion.div
                      key={`${pole}-${day}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: Math.random() * 0.5 }}
                      className="p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors min-h-[100px] flex flex-col gap-1"
                    >
                      {/* Matin */}
                      {isEditMode ? (
                        <EditableAssignment
                          assignment={morningAssignment || null}
                          pole={pole}
                          day={day}
                          timeSlot="MATIN"
                          agents={agents}
                          onUpdate={handleUpdateAssignment}
                          poleColor={POLE_COLORS[pole]}
                        />
                      ) : morningAssignment ? (
                        <div className={`w-full p-1.5 rounded border ${POLE_COLORS[pole]} text-center`}>
                          <div className="font-medium text-xs">{morningAssignment.agentNom}</div>
                          <div className="text-[10px] mt-0.5 opacity-75">🌅 Matin (8h-12h)</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-[10px] text-center py-1">Matin non assigné</div>
                      )}
                      
                      {/* Après-midi */}
                      {isEditMode ? (
                        <EditableAssignment
                          assignment={afternoonAssignment || null}
                          pole={pole}
                          day={day}
                          timeSlot="APRES_MIDI"
                          agents={agents}
                          onUpdate={handleUpdateAssignment}
                          poleColor={POLE_COLORS[pole]}
                        />
                      ) : afternoonAssignment ? (
                        <div className={`w-full p-1.5 rounded border ${POLE_COLORS[pole]} text-center`}>
                          <div className="font-medium text-xs">{afternoonAssignment.agentNom}</div>
                          <div className="text-[10px] mt-0.5 opacity-75">☀️ Après-midi (13h-17h)</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-[10px] text-center py-1">Après-midi non assigné</div>
                      )}
                    </motion.div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Légende des pôles</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POLES.map((pole) => (
            <div key={pole} className={`px-4 py-2 rounded-lg border ${POLE_COLORS[pole]}`}>
              <div className="font-medium text-sm">{pole}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Statistiques</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{agents.length}</div>
            <div className="text-sm text-gray-600">Agents total</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{planning.assignments.length}</div>
            <div className="text-sm text-gray-600">Affectations</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{POLES.length}</div>
            <div className="text-sm text-gray-600">Pôles</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{DAYS.length}</div>
            <div className="text-sm text-gray-600">Jours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
