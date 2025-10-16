import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Loader2, Database, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { syncMedicationsToDatabase } from '@/utils/syncMedications';
import RegimenSafetyValidator from '@/components/RegimenSafetyValidator';
import {
  MedicationData,
  PatientProfile,
  ValidationResult
} from '@/services/regimenSafetyValidator';

interface DatabaseMedication {
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
  is_active: boolean;
}

interface DatabasePatientProfile {
  id: string;
  full_name: string;
  date_of_birth: string;
  phone?: string;
}

export default function SafetyValidation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState<MedicationData[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [savingToDatabase, setSavingToDatabase] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSyncMedications = async () => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please sign in to sync medications.",
        variant: "destructive"
      });
      return;
    }

    setSyncing(true);
    try {
      const result = await syncMedicationsToDatabase(user.id);
      if (result.success) {
        toast({
          title: "✓ Medications Synced",
          description: result.message,
          variant: "default"
        });
        // Reload data after sync
        await loadData();
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load patient profile
      const { data: profileData, error: profileError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load active medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (medicationsError) throw medicationsError;

      // Transform database data to service format
      const transformedMedications: MedicationData[] = (medicationsData as DatabaseMedication[]).map(med => ({
        id: med.id,
        name: med.name,
        strength: med.strength || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        route: med.route,
        duration_days: med.duration_days,
        start_date: med.start_date,
        end_date: med.end_date,
        instructions: med.instructions
      }));

      const transformedProfile: PatientProfile = {
        id: profileData.id,
        full_name: profileData.full_name,
        date_of_birth: profileData.date_of_birth,
      };

      setMedications(transformedMedications);
      setPatientProfile(transformedProfile);

      // Check if DOB is missing
      if (!profileData.date_of_birth) {
        toast({
          title: "Patient Profile Incomplete",
          description: "Please complete your profile with date of birth to enable safety validation.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/onboarding'}
            >
              Complete Profile
            </Button>
          )
        });
      }

      if (transformedMedications.length === 0) {
        toast({
          title: "No Active Medications",
          description: "You don't have any active medications to validate.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Failed to Load Data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidationComplete = async (result: ValidationResult) => {
    setValidationResult(result);

    // Automatically save critical and high severity flags as health alerts
    if (result.flags.length > 0) {
      await saveValidationAlerts(result);
    }
  };

  const saveValidationAlerts = async (result: ValidationResult) => {
    if (!user) return;

    setSavingToDatabase(true);
    try {
      // Filter critical and high severity flags
      const criticalFlags = result.flags.filter(
        flag => flag.severity === 'critical' || flag.severity === 'high'
      );

      if (criticalFlags.length === 0) {
        setSavingToDatabase(false);
        return;
      }

      // Create health alerts for each critical flag
      const alertPromises = criticalFlags.map(flag => {
        // Map 'high' to 'warning' to match the database enum (info | warning | critical)
        const severity: 'info' | 'warning' | 'critical' = 
          flag.severity === 'critical' ? 'critical' : 'warning';
        const status: 'pending' | 'acknowledged' | 'resolved' = 'pending';
        
        return supabase.from('health_alerts').insert({
          patient_id: user.id,
          title: `Safety Validation: ${flag.title}`,
          message: `${flag.description}\n\nRecommendation: ${flag.recommendation}`,
          severity: severity,
          status: status,
          alert_type: 'medication_safety',
          related_id: flag.medication_id,
          metadata: {
            category: flag.category,
            medication_name: flag.medication_name,
            requires_physician_review: flag.requires_physician_review,
            validation_method: result.validation_method,
            validated_at: result.validated_at
          }
        });
      });

      await Promise.all(alertPromises);

      toast({
        title: "Alerts Created",
        description: `${criticalFlags.length} safety alert(s) saved to your health alerts.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving alerts:', error);
      toast({
        title: "Failed to Save Alerts",
        description: "Validation completed but alerts could not be saved.",
        variant: "destructive"
      });
    } finally {
      setSavingToDatabase(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading patient data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Safety Validation</h1>
              <p className="text-gray-600">AI-powered medication regimen safety check</p>
            </div>
          </div>
        </div>

        {/* Patient Summary Card */}
        {patientProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{patientProfile.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{new Date(patientProfile.date_of_birth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Medications</p>
                <p className="font-medium">{medications.length}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Medications List */}
        {medications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Medications Being Validated</CardTitle>
              <CardDescription>
                {medications.length} active medication(s) in your current regimen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medications.map((med) => (
                  <Card key={med.id} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{med.name}</h3>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <span className="font-medium">Strength:</span> {med.strength}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Dosage:</span> {med.dosage}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Frequency:</span> {med.frequency}
                        </p>
                        {med.route && (
                          <p className="text-gray-600">
                            <span className="font-medium">Route:</span> {med.route}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Medications Alert */}
        {medications.length === 0 && !loading && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">No Active Medications Found</h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    Your medications from the Medication Inventory haven't been synced to the database yet. 
                    Click the button below to sync them, or upload a prescription to add new medications.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleSyncMedications}
                      disabled={syncing}
                      variant="default"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {syncing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Database className="mr-2 h-4 w-4" />
                          Sync Medications from Inventory
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => navigate('/prescriptions/upload')}
                      variant="outline"
                    >
                      Upload Prescription
                    </Button>
                    <Button
                      onClick={() => navigate('/inventory')}
                      variant="outline"
                    >
                      View Inventory
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Validator Component */}
        {patientProfile && medications.length > 0 && (
          <RegimenSafetyValidator
            medications={medications}
            patient={patientProfile}
            autoValidate={false}
            onValidationComplete={handleValidationComplete}
          />
        )}

        {/* Saving Indicator */}
        {savingToDatabase && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Saving Alerts</AlertTitle>
            <AlertDescription>
              Creating health alerts for critical safety concerns...
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/prescriptions/upload')}
            >
              Upload New Prescription
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/alerts')}
            >
              View Health Alerts
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/inventory')}
            >
              Manage Medications
            </Button>
            <Button
              variant="outline"
              onClick={handleSyncMedications}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Sync from Inventory
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={loadData}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <CardTitle className="text-blue-900">About Safety Validation</CardTitle>
                <CardDescription className="text-blue-700 mt-2">
                  Our AI-powered Regimen Safety Validator uses clinical language models to cross-check your medications against established medical guidelines. It evaluates:
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Age-appropriate dosing for your patient profile</li>
              <li>Potential drug-drug interactions</li>
              <li>Dosages within therapeutic ranges</li>
              <li>Contraindications based on age and conditions</li>
              <li>Appropriate treatment durations</li>
            </ul>
            <Alert className="mt-4 bg-white border-blue-300">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Important Notice</AlertTitle>
              <AlertDescription className="text-blue-700">
                This tool is a clinical decision support system and should not replace professional medical advice. 
                Always consult with your healthcare provider before making any changes to your medication regimen.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
