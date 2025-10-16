/**
 * Regimen Safety Validator Service
 * 
 * This service validates medication regimens against clinical standards using AI models
 * to ensure patient safety by detecting:
 * - Inappropriate dosages for age/weight
 * - Drug interactions
 * - Dosage exceeding therapeutic limits
 * - Contraindications based on patient profile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface PatientProfile {
  id: string;
  full_name: string;
  date_of_birth: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  known_conditions?: string[];
  allergies?: string[];
  chronic_conditions?: string[];
}

export interface MedicationData {
  id: string;
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  route?: string;
  duration_days?: number;
  start_date: string;
  end_date?: string;
  instructions?: string;
}

export interface ValidationFlag {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'dosage' | 'age' | 'interaction' | 'contraindication' | 'duration' | 'frequency';
  title: string;
  description: string;
  recommendation: string;
  medication_id: string;
  medication_name: string;
  references?: string[];
  requires_physician_review: boolean;
}

export interface ValidationResult {
  is_safe: boolean;
  overall_risk_level: 'safe' | 'caution' | 'warning' | 'critical';
  flags: ValidationFlag[];
  validated_at: string;
  validation_method: 'ai_clinical_nlp' | 'rule_based' | 'hybrid';
  summary: string;
}

/**
 * Calculate patient age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Determine patient age category for dosing considerations
 */
function getAgeCategory(age: number): string {
  if (age < 2) return 'infant';
  if (age < 12) return 'child';
  if (age < 18) return 'adolescent';
  if (age < 65) return 'adult';
  return 'elderly';
}

/**
 * Build comprehensive clinical prompt for AI validation
 */
function buildClinicalValidationPrompt(
  medications: MedicationData[],
  patient: PatientProfile
): string {
  const age = patient.age || calculateAge(patient.date_of_birth);
  const ageCategory = getAgeCategory(age);

  return `You are a clinical pharmacology AI assistant specializing in medication safety validation. Analyze the following medication regimen for potential safety concerns.

## PATIENT PROFILE
- Age: ${age} years (${ageCategory})
- Date of Birth: ${patient.date_of_birth}
${patient.weight_kg ? `- Weight: ${patient.weight_kg} kg` : ''}
${patient.height_cm ? `- Height: ${patient.height_cm} cm` : ''}
${patient.known_conditions && patient.known_conditions.length > 0 ? `- Known Conditions: ${patient.known_conditions.join(', ')}` : ''}
${patient.allergies && patient.allergies.length > 0 ? `- Allergies: ${patient.allergies.join(', ')}` : ''}
${patient.chronic_conditions && patient.chronic_conditions.length > 0 ? `- Chronic Conditions: ${patient.chronic_conditions.join(', ')}` : ''}

## MEDICATION REGIMEN TO VALIDATE
${medications.map((med, idx) => `
${idx + 1}. ${med.name}
   - Strength: ${med.strength}
   - Dosage: ${med.dosage}
   - Frequency: ${med.frequency}
   - Route: ${med.route || 'oral'}
   - Duration: ${med.duration_days || 'not specified'} days
   - Instructions: ${med.instructions || 'none'}
`).join('\n')}

## VALIDATION REQUIREMENTS
Analyze this regimen and identify ALL potential safety concerns in the following categories:

1. **DOSAGE VALIDATION**
   - Is the dosage appropriate for the patient's age category (${ageCategory})?
   - Does it fall within the therapeutic range for this medication?
   - Are there any age-specific dosing considerations?
   - Is the dose potentially toxic or sub-therapeutic?

2. **AGE-SPECIFIC CONCERNS**
   - Are these medications appropriate for a ${age}-year-old ${ageCategory}?
   - Are there pediatric or geriatric dosing adjustments needed?
   - Are there contraindications based on age?

3. **DRUG INTERACTIONS**
   - Identify potential interactions between the prescribed medications
   - Specify the severity (critical, high, medium, low)
   - Explain the mechanism and clinical significance

4. **CONTRAINDICATIONS**
   - Check for contraindications with known conditions
   - Identify allergy concerns
   - Note any disease-state contraindications

5. **FREQUENCY & DURATION**
   - Is the dosing frequency appropriate?
   - Is the duration appropriate for the condition?
   - Are there maximum duration limits being exceeded?

## RESPONSE FORMAT
Return a JSON object with this exact structure:
{
  "is_safe": boolean,
  "overall_risk_level": "safe" | "caution" | "warning" | "critical",
  "flags": [
    {
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "category": "dosage" | "age" | "interaction" | "contraindication" | "duration" | "frequency",
      "title": "Brief title of the concern",
      "description": "Detailed explanation of the safety concern",
      "recommendation": "Specific actionable recommendation",
      "medication_id": "id from the list",
      "medication_name": "name of the medication",
      "requires_physician_review": boolean
    }
  ],
  "summary": "Overall summary of the safety validation"
}

IMPORTANT: 
- Be thorough but clinically accurate
- Flag only legitimate concerns based on established clinical guidelines
- Use evidence-based reasoning
- When in doubt, err on the side of caution
- Return ONLY valid JSON, no additional text`;
}

/**
 * Parse and validate AI response
 */
function parseAIValidationResponse(responseText: string): Partial<ValidationResult> {
  try {
    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleanedText);
    
    // Validate required fields
    if (typeof parsed.is_safe !== 'boolean') {
      throw new Error('Missing or invalid is_safe field');
    }
    
    if (!['safe', 'caution', 'warning', 'critical'].includes(parsed.overall_risk_level)) {
      throw new Error('Invalid overall_risk_level');
    }
    
    if (!Array.isArray(parsed.flags)) {
      throw new Error('Flags must be an array');
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response text:', responseText);
    throw new Error('Failed to parse AI validation response');
  }
}

/**
 * Main validation function using AI Clinical NLP
 */
export async function validateMedicationRegimen(
  medications: MedicationData[],
  patient: PatientProfile
): Promise<ValidationResult> {
  // Validate inputs
  if (!medications || medications.length === 0) {
    throw new Error('No medications provided for validation');
  }
  
  if (!patient || !patient.date_of_birth) {
    throw new Error('Patient profile with date of birth is required');
  }
  
  // Ensure patient age is calculated
  const enrichedPatient = {
    ...patient,
    age: patient.age || calculateAge(patient.date_of_birth)
  };
  
  // If no API key, return rule-based validation
  if (!genAI || !API_KEY) {
    console.warn('Gemini API key not found. Using rule-based validation fallback.');
    return performRuleBasedValidation(medications, enrichedPatient);
  }
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent, factual responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    });
    
    const prompt = buildClinicalValidationPrompt(medications, enrichedPatient);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the AI response
    const validationData = parseAIValidationResponse(text);
    
    // Build complete validation result
    const validationResult: ValidationResult = {
      is_safe: validationData.is_safe ?? true,
      overall_risk_level: validationData.overall_risk_level ?? 'safe',
      flags: validationData.flags ?? [],
      validated_at: new Date().toISOString(),
      validation_method: 'ai_clinical_nlp',
      summary: validationData.summary ?? 'Validation completed successfully'
    };
    
    return validationResult;
    
  } catch (error) {
    console.error('AI validation error:', error);
    
    // Fallback to rule-based validation
    console.warn('Falling back to rule-based validation');
    return performRuleBasedValidation(medications, enrichedPatient);
  }
}

/**
 * Rule-based validation fallback (when AI is unavailable)
 */
function performRuleBasedValidation(
  medications: MedicationData[],
  patient: PatientProfile
): ValidationResult {
  const flags: ValidationFlag[] = [];
  const age = patient.age || calculateAge(patient.date_of_birth);
  const ageCategory = getAgeCategory(age);
  
  // Rule 1: Check for pediatric medications in elderly patients
  if (ageCategory === 'elderly') {
    medications.forEach(med => {
      // Check for medications that require dose adjustment in elderly
      const elderlyAdjustmentDrugs = [
        'metformin', 'digoxin', 'warfarin', 'lithium', 
        'benzodiazepine', 'opioid', 'nsaid'
      ];
      
      if (elderlyAdjustmentDrugs.some(drug => 
        med.name.toLowerCase().includes(drug)
      )) {
        flags.push({
          severity: 'medium',
          category: 'age',
          title: `Geriatric Dosing Consideration for ${med.name}`,
          description: `${med.name} may require dose adjustment in patients over 65 years old due to reduced renal clearance and increased sensitivity.`,
          recommendation: 'Verify dosing is appropriate for elderly patient. Consider renal function assessment.',
          medication_id: med.id,
          medication_name: med.name,
          requires_physician_review: true
        });
      }
    });
  }
  
  // Rule 2: Check for pediatric dosing
  if (ageCategory === 'child' || ageCategory === 'infant') {
    medications.forEach(med => {
      flags.push({
        severity: 'high',
        category: 'age',
        title: `Pediatric Dosing Verification Required for ${med.name}`,
        description: `This medication is prescribed for a ${age}-year-old ${ageCategory}. Pediatric dosing must be weight-based and verified against pediatric guidelines.`,
        recommendation: 'Verify dosing is weight-appropriate and follows pediatric guidelines. Consult pediatric dosing references.',
        medication_id: med.id,
        medication_name: med.name,
        requires_physician_review: true
      });
    });
  }
  
  // Rule 3: Check for common drug interactions
  if (medications.length > 1) {
    const medNames = medications.map(m => m.name.toLowerCase());
    
    // Warfarin + NSAIDs
    if (medNames.some(n => n.includes('warfarin')) && 
        medNames.some(n => n.includes('ibuprofen') || n.includes('naproxen') || n.includes('diclofenac'))) {
      flags.push({
        severity: 'critical',
        category: 'interaction',
        title: 'Critical Drug Interaction: Warfarin + NSAID',
        description: 'Concurrent use of warfarin and NSAIDs significantly increases bleeding risk.',
        recommendation: 'Consider alternative pain management. If combination necessary, increase INR monitoring frequency.',
        medication_id: medications.find(m => m.name.toLowerCase().includes('warfarin'))?.id || '',
        medication_name: 'Warfarin + NSAID',
        requires_physician_review: true
      });
    }
    
    // ACE inhibitors + Potassium supplements
    if (medNames.some(n => n.includes('lisinopril') || n.includes('enalapril') || n.includes('ramipril')) && 
        medNames.some(n => n.includes('potassium'))) {
      flags.push({
        severity: 'high',
        category: 'interaction',
        title: 'Drug Interaction: ACE Inhibitor + Potassium',
        description: 'ACE inhibitors can increase potassium levels. Concurrent potassium supplementation may cause hyperkalemia.',
        recommendation: 'Monitor serum potassium levels regularly. Consider discontinuing potassium supplement if not essential.',
        medication_id: medications.find(m => 
          m.name.toLowerCase().includes('lisinopril') || 
          m.name.toLowerCase().includes('enalapril')
        )?.id || '',
        medication_name: 'ACE Inhibitor + Potassium',
        requires_physician_review: true
      });
    }
  }
  
  // Rule 4: Check medication duration
  medications.forEach(med => {
    if (med.duration_days) {
      // Antibiotics shouldn't exceed typical courses
      if (med.name.toLowerCase().includes('antibiotic') || 
          med.name.toLowerCase().includes('cillin') ||
          med.name.toLowerCase().includes('mycin')) {
        if (med.duration_days > 14) {
          flags.push({
            severity: 'medium',
            category: 'duration',
            title: `Extended Antibiotic Duration for ${med.name}`,
            description: `Antibiotic prescribed for ${med.duration_days} days, which exceeds typical treatment duration.`,
            recommendation: 'Verify extended duration is clinically indicated. Consider resistance risk with prolonged therapy.',
            medication_id: med.id,
            medication_name: med.name,
            requires_physician_review: true
          });
        }
      }
    }
  });
  
  // Determine overall risk level
  let overall_risk_level: ValidationResult['overall_risk_level'] = 'safe';
  const hasCritical = flags.some(f => f.severity === 'critical');
  const hasHigh = flags.some(f => f.severity === 'high');
  const hasMedium = flags.some(f => f.severity === 'medium');
  
  if (hasCritical) {
    overall_risk_level = 'critical';
  } else if (hasHigh) {
    overall_risk_level = 'warning';
  } else if (hasMedium) {
    overall_risk_level = 'caution';
  }
  
  return {
    is_safe: !hasCritical,
    overall_risk_level,
    flags,
    validated_at: new Date().toISOString(),
    validation_method: 'rule_based',
    summary: flags.length === 0 
      ? `No safety concerns identified for ${medications.length} medication(s) in rule-based validation.`
      : `Identified ${flags.length} potential safety concern(s) that require review.`
  };
}

/**
 * Validate a single medication (convenience function)
 */
export async function validateSingleMedication(
  medication: MedicationData,
  patient: PatientProfile
): Promise<ValidationResult> {
  return validateMedicationRegimen([medication], patient);
}

/**
 * Quick safety check - returns true if validation passes without critical flags
 */
export async function quickSafetyCheck(
  medications: MedicationData[],
  patient: PatientProfile
): Promise<boolean> {
  try {
    const result = await validateMedicationRegimen(medications, patient);
    return result.is_safe && result.overall_risk_level !== 'critical';
  } catch (error) {
    console.error('Quick safety check failed:', error);
    return false;
  }
}
