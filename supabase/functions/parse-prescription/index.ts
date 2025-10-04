import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Multi-Agent Architecture for Prescription Processing
// Each "agent" is a specialized function that handles a specific task

/**
 * AGENT 1: Prescription Parser Agent
 * Extracts medication information from prescription images/PDFs using GPT-4 Vision
 */
async function parsePrescriptionAgent(fileUrl: string, openAIKey: string) {
  console.log("🤖 Parser Agent: Starting prescription analysis...");
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical prescription parser AI agent. Extract ALL medications with their details from the prescription.
          
Return a JSON object with this structure:
{
  "medications": [
    {
      "name": "medication name",
      "strength": "dosage strength with unit",
      "dosage": "amount per dose",
      "frequency": "once_daily|twice_daily|thrice_daily|four_times_daily|as_needed|custom",
      "route": "oral|injection|topical|etc",
      "duration_days": number or null,
      "instructions": "specific instructions",
      "morning": boolean (for timing),
      "afternoon": boolean,
      "evening": boolean,
      "night": boolean
    }
  ],
  "doctor_name": "extracted doctor name or null",
  "prescription_date": "YYYY-MM-DD or null",
  "notes": "any additional notes"
}

Be thorough and accurate. Extract ALL medications mentioned.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this prescription and extract all medication details:'
            },
            {
              type: 'image_url',
              image_url: {
                url: fileUrl
              }
            }
          ]
        }
      ],
      max_completion_tokens: 2000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
  const jsonStr = jsonMatch ? jsonMatch[1] : content;
  
  const result = JSON.parse(jsonStr);
  console.log("✅ Parser Agent: Extracted", result.medications?.length || 0, "medications");
  return result;
}

/**
 * AGENT 2: Schedule Optimizer Agent
 * Creates personalized medication schedules based on extracted data and user preferences
 */
function scheduleOptimizerAgent(medications: any[], patientId: string, startDate: Date) {
  console.log("🤖 Schedule Optimizer Agent: Creating medication schedules...");
  
  const schedules: any[] = [];
  
  medications.forEach(med => {
    const timings = [];
    
    // Determine timing based on frequency and specified times
    if (med.morning) timings.push(9); // 9 AM
    if (med.afternoon) timings.push(14); // 2 PM
    if (med.evening) timings.push(18); // 6 PM
    if (med.night) timings.push(21); // 9 PM
    
    // Fallback if no specific times specified
    if (timings.length === 0) {
      switch (med.frequency) {
        case 'once_daily':
          timings.push(9);
          break;
        case 'twice_daily':
          timings.push(9, 21);
          break;
        case 'thrice_daily':
          timings.push(9, 14, 21);
          break;
        case 'four_times_daily':
          timings.push(9, 14, 18, 21);
          break;
      }
    }
    
    // Generate schedules for next 30 days (or duration_days if specified)
    const days = med.duration_days || 30;
    
    for (let day = 0; day < days; day++) {
      timings.forEach(hour => {
        const scheduledTime = new Date(startDate);
        scheduledTime.setDate(scheduledTime.getDate() + day);
        scheduledTime.setHours(hour, 0, 0, 0);
        
        schedules.push({
          medication_id: null, // Will be set after medication is inserted
          patient_id: patientId,
          scheduled_time: scheduledTime.toISOString(),
          status: 'pending',
        });
      });
    }
  });
  
  console.log("✅ Schedule Optimizer Agent: Created", schedules.length, "scheduled doses");
  return schedules;
}

/**
 * AGENT 3: Drug Interaction Checker Agent
 * Checks for potential drug interactions and generates warnings
 */
async function interactionCheckerAgent(medications: any[], patientId: string, supabaseClient: any) {
  console.log("🤖 Interaction Checker Agent: Analyzing drug interactions...");
  
  const warnings: any[] = [];
  
  // Check against existing medications
  const { data: existingMeds } = await supabaseClient
    .from('medications')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true);
  
  if (existingMeds && existingMeds.length > 0) {
    // In a real implementation, this would call a drug interaction API
    // For now, we'll create a basic check for common interactions
    const allMedNames = [
      ...medications.map(m => m.name.toLowerCase()),
      ...existingMeds.map((m: any) => m.name.toLowerCase())
    ];
    
    // Example: Check for known problematic combinations
    const knownInteractions = [
      { drugs: ['warfarin', 'aspirin'], severity: 'severe', description: 'Increased bleeding risk' },
      { drugs: ['metformin', 'alcohol'], severity: 'moderate', description: 'Risk of lactic acidosis' },
    ];
    
    knownInteractions.forEach(interaction => {
      const foundDrugs = interaction.drugs.filter(drug => 
        allMedNames.some(med => med.includes(drug))
      );
      
      if (foundDrugs.length >= 2) {
        warnings.push({
          severity: interaction.severity,
          description: `Potential interaction: ${interaction.description}`,
          recommendation: 'Please consult your doctor about this medication combination.',
          drugs: foundDrugs
        });
      }
    });
  }
  
  console.log("✅ Interaction Checker Agent: Found", warnings.length, "potential interactions");
  return warnings;
}

/**
 * AGENT 4: Alert Generator Agent
 * Creates intelligent alerts based on processed data
 */
async function alertGeneratorAgent(
  patientId: string, 
  medicationCount: number, 
  warnings: any[], 
  supabaseClient: any
) {
  console.log("🤖 Alert Generator Agent: Creating alerts...");
  
  const alerts: any[] = [];
  
  // Welcome alert
  alerts.push({
    patient_id: patientId,
    title: '✅ Prescription Processed',
    message: `Successfully added ${medicationCount} medication${medicationCount !== 1 ? 's' : ''} to your schedule. Your personalized reminders are now active.`,
    severity: 'info',
    status: 'pending',
    alert_type: 'prescription_processed',
  });
  
  // Interaction warnings
  warnings.forEach(warning => {
    alerts.push({
      patient_id: patientId,
      title: '⚠️ Drug Interaction Alert',
      message: `${warning.description} ${warning.recommendation}`,
      severity: warning.severity === 'severe' ? 'critical' : 'warning',
      status: 'pending',
      alert_type: 'drug_interaction',
      metadata: warning,
    });
  });
  
  // Insert alerts
  if (alerts.length > 0) {
    await supabaseClient.from('health_alerts').insert(alerts);
  }
  
  console.log("✅ Alert Generator Agent: Created", alerts.length, "alerts");
  return alerts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { prescriptionId, fileUrl } = await req.json();
    console.log("🚀 Starting multi-agent prescription processing...");
    console.log("Prescription ID:", prescriptionId);

    // AGENT 1: Parse prescription
    const parsedData = await parsePrescriptionAgent(fileUrl, openAIKey);
    
    // Update prescription with parsed data
    await supabaseClient
      .from('prescriptions')
      .update({
        raw_text: JSON.stringify(parsedData),
        parsed_data: parsedData,
        status: 'processed',
        doctor_name: parsedData.doctor_name || null,
      })
      .eq('id', prescriptionId);

    // Get patient ID from prescription
    const { data: prescription } = await supabaseClient
      .from('prescriptions')
      .select('patient_id, prescription_date')
      .eq('id', prescriptionId)
      .single();

    if (!prescription) throw new Error('Prescription not found');
    
    const patientId = prescription.patient_id;
    const startDate = new Date(prescription.prescription_date);

    // Insert medications
    const medicationsToInsert = parsedData.medications.map((med: any) => ({
      prescription_id: prescriptionId,
      patient_id: patientId,
      name: med.name,
      strength: med.strength,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route,
      duration_days: med.duration_days,
      start_date: startDate.toISOString().split('T')[0],
      end_date: med.duration_days 
        ? new Date(startDate.getTime() + med.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
      instructions: med.instructions,
      is_active: true,
    }));

    const { data: insertedMeds } = await supabaseClient
      .from('medications')
      .insert(medicationsToInsert)
      .select();

    if (!insertedMeds) throw new Error('Failed to insert medications');

    // AGENT 2: Create schedules
    const schedules = scheduleOptimizerAgent(parsedData.medications, patientId, startDate);
    
    // Map schedules to inserted medications
    const schedulesWithMedIds = schedules.map((schedule, idx) => ({
      ...schedule,
      medication_id: insertedMeds[Math.floor(idx / (schedules.length / insertedMeds.length))].id,
    }));

    await supabaseClient
      .from('medication_schedules')
      .insert(schedulesWithMedIds);

    // AGENT 3: Check interactions
    const warnings = await interactionCheckerAgent(parsedData.medications, patientId, supabaseClient);

    // AGENT 4: Generate alerts
    await alertGeneratorAgent(patientId, parsedData.medications.length, warnings, supabaseClient);

    console.log("✅ All agents completed successfully!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        medications: insertedMeds.length,
        schedules: schedulesWithMedIds.length,
        warnings: warnings.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in prescription processing:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
