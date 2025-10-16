import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  validateMedicationRegimen,
  ValidationResult,
  ValidationFlag,
  MedicationData,
  PatientProfile
} from '@/services/regimenSafetyValidator';
import { toast } from '@/hooks/use-toast';

interface RegimenSafetyValidatorProps {
  medications: MedicationData[];
  patient: PatientProfile;
  autoValidate?: boolean;
  onValidationComplete?: (result: ValidationResult) => void;
}

const getSeverityIcon = (severity: ValidationFlag['severity']) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'high':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'medium':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'low':
      return <Info className="h-5 w-5 text-blue-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const getSeverityBadgeVariant = (severity: ValidationFlag['severity']) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    case 'info':
      return 'outline';
    default:
      return 'default';
  }
};

const getRiskLevelColor = (riskLevel: ValidationResult['overall_risk_level']) => {
  switch (riskLevel) {
    case 'critical':
      return 'bg-red-100 border-red-300 text-red-900';
    case 'warning':
      return 'bg-orange-100 border-orange-300 text-orange-900';
    case 'caution':
      return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    case 'safe':
      return 'bg-green-100 border-green-300 text-green-900';
  }
};

const getRiskLevelIcon = (riskLevel: ValidationResult['overall_risk_level']) => {
  switch (riskLevel) {
    case 'critical':
      return <AlertCircle className="h-8 w-8 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-8 w-8 text-orange-500" />;
    case 'caution':
      return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    case 'safe':
      return <CheckCircle className="h-8 w-8 text-green-600" />;
  }
};

export default function RegimenSafetyValidator({
  medications,
  patient,
  autoValidate = false,
  onValidationComplete
}: RegimenSafetyValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performValidation = async () => {
    if (!medications || medications.length === 0) {
      toast({
        title: "No medications to validate",
        description: "Add medications to the regimen first.",
        variant: "destructive"
      });
      return;
    }

    if (!patient || !patient.date_of_birth) {
      toast({
        title: "Patient profile incomplete",
        description: "Patient date of birth is required for safety validation.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateMedicationRegimen(medications, patient);
      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }

      // Show toast based on result
      if (result.overall_risk_level === 'critical') {
        toast({
          title: "⚠️ Critical Safety Concerns Detected",
          description: "Immediate physician review required. See details below.",
          variant: "destructive"
        });
      } else if (result.overall_risk_level === 'warning') {
        toast({
          title: "⚠️ Safety Warnings Found",
          description: `${result.flags.length} potential concern(s) identified.`,
          variant: "default"
        });
      } else if (result.overall_risk_level === 'caution') {
        toast({
          title: "Caution Advised",
          description: "Minor concerns detected. Review recommendations.",
          variant: "default"
        });
      } else {
        toast({
          title: "✓ Validation Passed",
          description: "No major safety concerns identified.",
          variant: "default"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (autoValidate && medications.length > 0) {
      performValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoValidate, medications, patient]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Regimen Safety Validator</CardTitle>
              <CardDescription>
                AI-powered clinical validation against medical standards
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={performValidation}
            disabled={isValidating || medications.length === 0}
            variant="outline"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Validate Regimen
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No medications */}
        {!isValidating && medications.length === 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Medications</AlertTitle>
            <AlertDescription>
              Add medications to the regimen to perform safety validation.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Result */}
        {validationResult && !isValidating && (
          <div className="space-y-4">
            {/* Overall Risk Level */}
            <Alert className={`border-2 ${getRiskLevelColor(validationResult.overall_risk_level)}`}>
              <div className="flex items-start gap-4">
                {getRiskLevelIcon(validationResult.overall_risk_level)}
                <div className="flex-1">
                  <AlertTitle className="text-lg font-semibold mb-2">
                    Overall Risk: {validationResult.overall_risk_level.toUpperCase()}
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {validationResult.summary}
                  </AlertDescription>
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {medications.length} medication(s) validated
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Method: {validationResult.validation_method === 'ai_clinical_nlp' ? 'AI Clinical NLP' : 'Rule-Based'}
                    </span>
                    <span className="text-gray-600">
                      {new Date(validationResult.validated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Alert>

            {/* Safety Flags */}
            {validationResult.flags.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Safety Concerns ({validationResult.flags.length})
                  </h3>
                  <Badge variant="outline">
                    {validationResult.flags.filter(f => f.requires_physician_review).length} require review
                  </Badge>
                </div>

                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-4">
                    {validationResult.flags.map((flag, index) => (
                      <Card key={index} className="border-l-4" style={{
                        borderLeftColor: flag.severity === 'critical' ? '#dc2626' :
                          flag.severity === 'high' ? '#f97316' :
                          flag.severity === 'medium' ? '#eab308' :
                          flag.severity === 'low' ? '#3b82f6' : '#6b7280'
                      }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {getSeverityIcon(flag.severity)}
                              <div className="flex-1">
                                <CardTitle className="text-base">{flag.title}</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {flag.medication_name}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge variant={getSeverityBadgeVariant(flag.severity)}>
                                {flag.severity}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {flag.category}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                            <p className="text-sm text-gray-600">{flag.description}</p>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Recommendation:</p>
                            <p className="text-sm text-blue-600">{flag.recommendation}</p>
                          </div>

                          {flag.requires_physician_review && (
                            <Alert variant="default" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle className="text-sm">Physician Review Required</AlertTitle>
                              <AlertDescription className="text-xs">
                                This concern requires verification by a healthcare provider before proceeding.
                              </AlertDescription>
                            </Alert>
                          )}

                          {flag.references && flag.references.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600">References:</p>
                              <ul className="text-xs text-gray-500 list-disc list-inside">
                                {flag.references.map((ref, idx) => (
                                  <li key={idx}>{ref}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">All Clear!</AlertTitle>
                <AlertDescription className="text-green-700">
                  No safety concerns identified in the current medication regimen.
                  The dosages, frequencies, and drug combinations appear appropriate
                  for the patient profile.
                </AlertDescription>
              </Alert>
            )}

            {/* Disclaimer */}
            <Alert variant="default" className="bg-blue-50 border-blue-300">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-sm text-blue-900">Clinical Validation Tool</AlertTitle>
              <AlertDescription className="text-xs text-blue-700">
                This validation is provided as a clinical decision support tool and should not replace
                professional medical judgment. All medication regimens should be reviewed and approved
                by a qualified healthcare provider. This tool uses AI and rule-based algorithms to
                identify potential safety concerns based on established clinical guidelines.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading State */}
        {isValidating && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="text-lg font-medium">Validating Medication Regimen...</p>
              <p className="text-sm text-gray-600 mt-1">
                Analyzing {medications.length} medication(s) against clinical guidelines
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
