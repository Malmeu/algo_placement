import { Availability } from '@/types';

/**
 * Parse une chaîne de disponibilité du CSV en objet Availability
 */
export function parseAvailability(value: string): Availability {
  // Si la valeur est vide, null ou undefined, considérer comme disponible par défaut
  if (!value || value.trim() === '') {
    console.log('Valeur vide détectée, considérée comme DISPONIBLE');
    return { type: 'DISPONIBLE' };
  }

  const normalized = value.trim().toUpperCase();

  // DISPONIBLE
  if (normalized === 'DISPONIBLE') {
    return { type: 'DISPONIBLE' };
  }

  // PAS DISPONIBLE
  if (normalized === 'PAS DISPONIBLE') {
    return { type: 'PAS DISPONIBLE' };
  }

  // DISPONIBLE MATIN
  if (normalized === 'DISPONIBLE MATIN') {
    return { type: 'DISPONIBLE MATIN' };
  }

  // DISPONIBLE APRES MIDI (avec ou sans accent)
  if (normalized === 'DISPONIBLE APRES MIDI' || 
      normalized === 'DISPONIBLE APRÈS MIDI' ||
      normalized === 'DISPONIBLE APRES-MIDI' ||
      normalized === 'DISPONIBLE APRÈS-MIDI') {
    return { type: 'DISPONIBLE APRES MIDI' };
  }

  // DISPONIBLE PARFOIS APRES MIDI (insensible à la casse pour "Parfois")
  const normalizedLower = value.trim().toLowerCase();
  if (normalizedLower.includes('parfois') && 
      (normalizedLower.includes('apres midi') || normalizedLower.includes('après midi'))) {
    return { type: 'DISPONIBLE PARFOIS APRES MIDI' };
  }

  // DISPONIBLE A PARTIR DE [heure] (avec ou sans accent sur À)
  const availableFromMatch = normalized.match(/DISPONIBLE [AÀ] PARTI[RE]* DE (\d{1,2})[H:]?(\d{2})?/);
  if (availableFromMatch) {
    const hours = availableFromMatch[1].padStart(2, '0');
    const minutes = availableFromMatch[2] || '00';
    return {
      type: 'DISPONIBLE A PARTIR DE',
      startTime: `${hours}:${minutes}`,
    };
  }

  // PAS DISPONIBLE DE [heure]-[heure] (format complet et abrégé "PAS DISPO DE")
  const unavailableRangeMatch = normalized.match(
    /PAS (?:DISPONIBLE|DISPO) DE (\d{1,2})[H:]?(\d{2})?\s*-\s*(\d{1,2})[H:]?(\d{2})?/
  );
  if (unavailableRangeMatch) {
    const startHours = unavailableRangeMatch[1].padStart(2, '0');
    const startMinutes = unavailableRangeMatch[2] || '00';
    const endHours = unavailableRangeMatch[3].padStart(2, '0');
    const endMinutes = unavailableRangeMatch[4] || '00';
    return {
      type: 'PAS DISPONIBLE DE',
      timeRange: {
        start: `${startHours}:${startMinutes}`,
        end: `${endHours}:${endMinutes}`,
      },
    };
  }

  // Par défaut, si le format n'est pas reconnu, considérer comme DISPONIBLE
  // (changement : avant c'était PAS DISPONIBLE)
  console.warn(`Format de disponibilité non reconnu: "${value}" - considéré comme DISPONIBLE`);
  return { type: 'DISPONIBLE' };
}

/**
 * Vérifie si un agent est disponible pour un créneau donné
 */
export function isAvailableForTimeSlot(
  availability: Availability,
  timeSlot: 'MATIN' | 'APRES_MIDI' | 'JOURNEE'
): boolean {
  switch (availability.type) {
    case 'DISPONIBLE':
      return true;

    case 'PAS DISPONIBLE':
      return false;

    case 'DISPONIBLE MATIN':
      return timeSlot === 'MATIN' || timeSlot === 'JOURNEE';

    case 'DISPONIBLE APRES MIDI':
      return timeSlot === 'APRES_MIDI' || timeSlot === 'JOURNEE';

    case 'DISPONIBLE PARFOIS APRES MIDI':
      return timeSlot === 'APRES_MIDI';

    case 'DISPONIBLE A PARTIR DE':
      if (!availability.startTime) return false;
      const [hours, minutes] = availability.startTime.split(':').map(Number);
      const startTimeInMinutes = hours * 60 + (minutes || 0);
      
      // Matin = 8h-12h (480-720 minutes)
      if (timeSlot === 'MATIN') {
        // Doit commencer AU PLUS TARD à 10h pour avoir au moins 2h de travail le matin
        // Sinon ce n'est pas rentable de placer l'agent
        return startTimeInMinutes <= 10 * 60; // <= 600 minutes (10h)
      }
      // Après-midi = 13h-17h (780-1020 minutes)
      if (timeSlot === 'APRES_MIDI') {
        // Doit commencer AU PLUS TARD à 15h pour avoir au moins 2h de travail l'après-midi
        return startTimeInMinutes <= 15 * 60; // <= 900 minutes (15h)
      }
      return true;

    case 'PAS DISPONIBLE DE':
      if (!availability.timeRange) return true;
      // Logique simplifiée : si indisponible sur une plage, vérifier le chevauchement
      const [startHours] = availability.timeRange.start.split(':').map(Number);
      const [endHours] = availability.timeRange.end.split(':').map(Number);
      
      if (timeSlot === 'MATIN') {
        // Matin = 8h-12h
        return !(startHours < 12 && endHours > 8);
      }
      if (timeSlot === 'APRES_MIDI') {
        // Après-midi = 14h-18h
        return !(startHours < 18 && endHours > 14);
      }
      return false;

    default:
      return false;
  }
}

/**
 * Obtient une couleur pour représenter visuellement la disponibilité
 */
export function getAvailabilityColor(availability: Availability): string {
  switch (availability.type) {
    case 'DISPONIBLE':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'PAS DISPONIBLE':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'DISPONIBLE MATIN':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'DISPONIBLE APRES MIDI':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'DISPONIBLE PARFOIS APRES MIDI':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'DISPONIBLE A PARTIR DE':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'PAS DISPONIBLE DE':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Formatte une disponibilité pour l'affichage
 */
export function formatAvailability(availability: Availability): string {
  switch (availability.type) {
    case 'DISPONIBLE':
      return 'Disponible';
    case 'PAS DISPONIBLE':
      return 'Pas disponible';
    case 'DISPONIBLE MATIN':
      return 'Matin uniquement';
    case 'DISPONIBLE APRES MIDI':
      return 'Après-midi uniquement';
    case 'DISPONIBLE PARFOIS APRES MIDI':
      return 'Parfois après-midi';
    case 'DISPONIBLE A PARTIR DE':
      return `À partir de ${availability.startTime}`;
    case 'PAS DISPONIBLE DE':
      return `Indispo ${availability.timeRange?.start}-${availability.timeRange?.end}`;
    default:
      return 'Non défini';
  }
}
