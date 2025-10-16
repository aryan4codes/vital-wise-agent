/**
 * Database Service for Regimen Safety Validation
 * 
 * This service handles storing and retrieving validation results
 * from the Supabase database.
 */

import { supabase } from '@/integrations/supabase/client';
import { ValidationResult, ValidationFlag } from './regimenSafetyValidator';

export interface StoredValidation {
  id: string;
  patient_id: string;
  is_safe: boolean;
  overall_risk_level: string;
  validation_method: string;
  summary: string;
  validated_at: string;
  created_at: string;
}

export interface StoredValidationFlag {
  id: string;
  validation_id: string;
  medication_id: string | null;
  medication_name: string;
  severity: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  requires_physician_review: boolean;
  references: string[] | null;
  created_at: string;
}

/**
 * Save validation result to database
 */
export async function saveValidationResult(
  patientId: string,
  validationResult: ValidationResult
): Promise<{ validationId: string | null; error: Error | null }> {
  try {
    // Insert main validation record
    const { data: validation, error: validationError } = await supabase
      .from('medication_safety_validations')
      .insert({
        patient_id: patientId,
        is_safe: validationResult.is_safe,
        overall_risk_level: validationResult.overall_risk_level,
        validation_method: validationResult.validation_method,
        summary: validationResult.summary,
        validated_at: validationResult.validated_at
      })
      .select()
      .single();

    if (validationError) throw validationError;
    if (!validation) throw new Error('Failed to create validation record');

    // Insert validation flags if any
    if (validationResult.flags.length > 0) {
      const flagsToInsert = validationResult.flags.map(flag => ({
        validation_id: validation.id,
        medication_id: flag.medication_id || null,
        medication_name: flag.medication_name,
        severity: flag.severity,
        category: flag.category,
        title: flag.title,
        description: flag.description,
        recommendation: flag.recommendation,
        requires_physician_review: flag.requires_physician_review,
        references: flag.references || null
      }));

      const { error: flagsError } = await supabase
        .from('validation_flags')
        .insert(flagsToInsert);

      if (flagsError) throw flagsError;
    }

    return { validationId: validation.id, error: null };
  } catch (error) {
    console.error('Error saving validation result:', error);
    return { 
      validationId: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Get validation history for a patient
 */
export async function getValidationHistory(
  patientId: string,
  limit: number = 10
): Promise<{ validations: StoredValidation[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('medication_safety_validations')
      .select('*')
      .eq('patient_id', patientId)
      .order('validated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { validations: (data as StoredValidation[]) || [], error: null };
  } catch (error) {
    console.error('Error fetching validation history:', error);
    return { 
      validations: [], 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Get validation with all its flags
 */
export async function getValidationWithFlags(
  validationId: string
): Promise<{ 
  validation: StoredValidation | null; 
  flags: StoredValidationFlag[]; 
  error: Error | null 
}> {
  try {
    // Get validation
    const { data: validation, error: validationError } = await supabase
      .from('medication_safety_validations')
      .select('*')
      .eq('id', validationId)
      .single();

    if (validationError) throw validationError;

    // Get flags
    const { data: flags, error: flagsError } = await supabase
      .from('validation_flags')
      .select('*')
      .eq('validation_id', validationId)
      .order('severity', { ascending: true }); // Critical first

    if (flagsError) throw flagsError;

    return {
      validation: validation as StoredValidation,
      flags: (flags as StoredValidationFlag[]) || [],
      error: null
    };
  } catch (error) {
    console.error('Error fetching validation with flags:', error);
    return {
      validation: null,
      flags: [],
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Get most recent validation for a patient
 */
export async function getLatestValidation(
  patientId: string
): Promise<{ 
  validation: StoredValidation | null; 
  flags: StoredValidationFlag[]; 
  error: Error | null 
}> {
  try {
    const { data: validation, error: validationError } = await supabase
      .from('medication_safety_validations')
      .select('*')
      .eq('patient_id', patientId)
      .order('validated_at', { ascending: false })
      .limit(1)
      .single();

    if (validationError) {
      if (validationError.code === 'PGRST116') {
        // No rows returned
        return { validation: null, flags: [], error: null };
      }
      throw validationError;
    }

    if (!validation) {
      return { validation: null, flags: [], error: null };
    }

    // Get flags for this validation
    const { data: flags, error: flagsError } = await supabase
      .from('validation_flags')
      .select('*')
      .eq('validation_id', validation.id);

    if (flagsError) throw flagsError;

    return {
      validation: validation as StoredValidation,
      flags: (flags as StoredValidationFlag[]) || [],
      error: null
    };
  } catch (error) {
    console.error('Error fetching latest validation:', error);
    return {
      validation: null,
      flags: [],
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Get validation statistics for a patient
 */
export async function getValidationStats(
  patientId: string
): Promise<{
  total_validations: number;
  critical_count: number;
  warning_count: number;
  safe_count: number;
  last_validated: string | null;
  error: Error | null;
}> {
  try {
    const { data: validations, error } = await supabase
      .from('medication_safety_validations')
      .select('overall_risk_level, validated_at')
      .eq('patient_id', patientId);

    if (error) throw error;

    if (!validations || validations.length === 0) {
      return {
        total_validations: 0,
        critical_count: 0,
        warning_count: 0,
        safe_count: 0,
        last_validated: null,
        error: null
      };
    }

    const stats = {
      total_validations: validations.length,
      critical_count: validations.filter(v => v.overall_risk_level === 'critical').length,
      warning_count: validations.filter(v => v.overall_risk_level === 'warning').length,
      safe_count: validations.filter(v => v.overall_risk_level === 'safe').length,
      last_validated: validations[0].validated_at,
      error: null
    };

    return stats;
  } catch (error) {
    console.error('Error fetching validation stats:', error);
    return {
      total_validations: 0,
      critical_count: 0,
      warning_count: 0,
      safe_count: 0,
      last_validated: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Delete old validations (cleanup)
 * Keep only the most recent N validations per patient
 */
export async function cleanupOldValidations(
  patientId: string,
  keepCount: number = 50
): Promise<{ deleted: number; error: Error | null }> {
  try {
    // Get all validation IDs for this patient, ordered by date
    const { data: validations, error: fetchError } = await supabase
      .from('medication_safety_validations')
      .select('id, validated_at')
      .eq('patient_id', patientId)
      .order('validated_at', { ascending: false });

    if (fetchError) throw fetchError;

    if (!validations || validations.length <= keepCount) {
      return { deleted: 0, error: null };
    }

    // Get IDs to delete (everything after keepCount)
    const idsToDelete = validations.slice(keepCount).map(v => v.id);

    // Delete old validations (flags will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('medication_safety_validations')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) throw deleteError;

    return { deleted: idsToDelete.length, error: null };
  } catch (error) {
    console.error('Error cleaning up old validations:', error);
    return {
      deleted: 0,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Get all critical flags across all validations for a patient
 */
export async function getCriticalFlags(
  patientId: string
): Promise<{ flags: StoredValidationFlag[]; error: Error | null }> {
  try {
    const { data: flags, error } = await supabase
      .from('validation_flags')
      .select(`
        *,
        medication_safety_validations!inner(patient_id)
      `)
      .eq('medication_safety_validations.patient_id', patientId)
      .eq('severity', 'critical')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { flags: (flags as StoredValidationFlag[]) || [], error: null };
  } catch (error) {
    console.error('Error fetching critical flags:', error);
    return {
      flags: [],
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

/**
 * Check if a medication has any recent critical flags
 */
export async function hasCriticalFlags(
  patientId: string,
  medicationId: string,
  daysBack: number = 30
): Promise<{ hasCritical: boolean; count: number; error: Error | null }> {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    const { data: flags, error } = await supabase
      .from('validation_flags')
      .select(`
        id,
        medication_safety_validations!inner(patient_id, validated_at)
      `)
      .eq('medication_safety_validations.patient_id', patientId)
      .eq('medication_id', medicationId)
      .eq('severity', 'critical')
      .gte('medication_safety_validations.validated_at', dateThreshold.toISOString());

    if (error) throw error;

    return {
      hasCritical: (flags?.length || 0) > 0,
      count: flags?.length || 0,
      error: null
    };
  } catch (error) {
    console.error('Error checking critical flags:', error);
    return {
      hasCritical: false,
      count: 0,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
