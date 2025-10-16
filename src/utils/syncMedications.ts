/**
 * Utility to sync mock medications from localStorage to Supabase database
 * This ensures the Safety Validator can access real database medications
 */

import { supabase } from '@/integrations/supabase/client';

interface LocalMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  durationDays: number;
  currentCount: number;
  pillsPerBottle: number;
  refillsRemaining: number;
  refillNotes?: string;
  lastRefillDate: string;
}

/**
 * Convert localStorage medication to database format
 */
function convertToDbFormat(med: LocalMedication, patientId: string) {
  const frequency: 'once_daily' | 'twice_daily' | 'as_needed' | 'thrice_daily' | 'four_times_daily' = 
    med.frequency === 1 ? 'once_daily' : 
    med.frequency === 2 ? 'twice_daily' : 
    med.frequency === 3 ? 'thrice_daily' : 
    med.frequency === 4 ? 'four_times_daily' : 'as_needed';
  
  return {
    patient_id: patientId,
    name: med.name,
    strength: med.dosage,
    dosage: `${med.dosage} ${med.frequency === 1 ? 'once daily' : `${med.frequency}x daily`}`,
    frequency: frequency,
    route: 'oral',
    duration_days: med.durationDays,
    start_date: med.lastRefillDate,
    end_date: null as string | null,
    instructions: med.refillNotes || null,
    is_active: true
  };
}

/**
 * Sync medications from localStorage to database
 */
export async function syncMedicationsToDatabase(userId?: string) {
  try {
    // Get user ID from parameter or localStorage
    let currentUserId = userId;
    
    if (!currentUserId) {
      // Try to get from localStorage (custom auth)
      const authSession = localStorage.getItem('app-auth-session');
      if (authSession) {
        try {
          const parsed = JSON.parse(authSession);
          currentUserId = parsed.id;
        } catch (e) {
          console.error('Failed to parse auth session:', e);
        }
      }
    }
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Get medications from localStorage
    const savedMeds = localStorage.getItem('vital-wise-medications');
    if (!savedMeds) {
      console.log('No medications found in localStorage');
      return { success: false, message: 'No medications to sync' };
    }

    const medications: LocalMedication[] = JSON.parse(savedMeds);
    
    // Check what's already in the database
    const { data: existingMeds, error: fetchError } = await supabase
      .from('medications')
      .select('name')
      .eq('patient_id', currentUserId);

    if (fetchError) throw fetchError;

    const existingNames = new Set(existingMeds?.map(m => m.name) || []);
    
    // Filter out medications that already exist
    const medsToAdd = medications.filter(m => !existingNames.has(m.name));
    
    if (medsToAdd.length === 0) {
      console.log('All medications already in database');
      return { success: true, message: 'All medications already synced', added: 0 };
    }

    // Convert and insert new medications
    const dbMedications = medsToAdd.map(med => convertToDbFormat(med, currentUserId));
    
    const { data, error: insertError } = await supabase
      .from('medications')
      .insert(dbMedications)
      .select();

    if (insertError) throw insertError;

    console.log(`Successfully synced ${medsToAdd.length} medications to database`);
    return { 
      success: true, 
      message: `Synced ${medsToAdd.length} medication(s)`, 
      added: medsToAdd.length,
      medications: data
    };
    
  } catch (error) {
    console.error('Error syncing medications:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      added: 0
    };
  }
}

/**
 * Clear all medications from localStorage and database (for testing)
 */
export async function clearAllMedications(userId?: string) {
  try {
    // Get user ID from parameter or localStorage
    let currentUserId = userId;
    
    if (!currentUserId) {
      const authSession = localStorage.getItem('app-auth-session');
      if (authSession) {
        try {
          const parsed = JSON.parse(authSession);
          currentUserId = parsed.id;
        } catch (e) {
          console.error('Failed to parse auth session:', e);
        }
      }
    }
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    // Clear from database
    const { error: deleteError } = await supabase
      .from('medications')
      .delete()
      .eq('patient_id', currentUserId);

    if (deleteError) throw deleteError;

    // Clear from localStorage
    localStorage.removeItem('vital-wise-medications');

    console.log('All medications cleared');
    return { success: true, message: 'All medications cleared' };
    
  } catch (error) {
    console.error('Error clearing medications:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
