import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface ParsedData {
  medications?: Array<{
    name: string;
    strength?: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    instructions?: string;
    duration_days?: number;
  }>;
  doctor_name?: string;
  prescription_date?: string;
  notes?: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  doctor_name: string | null;
  prescription_date: string;
  file_url: string;
  raw_text: string | null;
  parsed_data: ParsedData | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PrescriptionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [disease, setDisease] = useState("");

  useEffect(() => {
    loadPrescription();
  }, [id, user]);

  const loadPrescription = async () => {
    try {
      if (!id || !user) return;
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("id", id)
        .eq("patient_id", user.id)
        .single();

      if (error) throw error;
      setPrescription(data);
    } catch (error: any) {
      console.error("Load error:", error);
      toast({
        title: "Error loading prescription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!disease.trim()) {
      toast({
        title: "Disease required",
        description: "Please enter the disease or condition",
        variant: "destructive",
      });
      return;
    }

    try {
      setConfirming(true);

      // Update prescription to confirmed
      const { error } = await supabase
        .from("prescriptions")
        .update({ status: "confirmed" })
        .eq("id", prescription?.id);

      if (error) throw error;

      toast({
        title: "Prescription confirmed!",
        description: "Medications have been added to your schedule",
      });

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error: any) {
      toast({
        title: "Confirmation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from("prescriptions")
        .update({ status: "rejected" })
        .eq("id", prescription?.id);

      if (error) throw error;

      toast({
        title: "Prescription rejected",
        description: "The prescription has been marked as rejected",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error rejecting prescription",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Card className="p-6">
            <p className="text-red-600">Prescription not found</p>
          </Card>
        </div>
      </div>
    );
  }

  const medications = prescription.parsed_data?.medications || [];
  const hasNoMedications = medications.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Prescription Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Prescription Details</h1>
              <p className="text-muted-foreground">
                {new Date(prescription.prescription_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Processed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-semibold">
                {prescription.doctor_name || prescription.parsed_data?.doctor_name || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{prescription.prescription_date}</p>
            </div>
          </div>
        </Card>

        {/* Disease/Condition Input */}
        <Card className="p-6 mb-6 border-blue-200 bg-blue-50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Disease/Condition (For Validation)
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Enter the disease or condition you're being treated for. This helps verify that the prescription matches your diagnosis.
          </p>
          <input
            type="text"
            placeholder="e.g., Fever, Diabetes, Hypertension, Infection..."
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-white"
          />
        </Card>

        {/* Medications */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Medications Extracted ({medications.length})
          </h2>

          {hasNoMedications ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">No Medications Found</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    The prescription image may not contain medication information, or it may need manual review.
                    Please check the prescription image and verify the medications manually.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med, idx) => (
                <div key={idx} className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-base">{med.name}</h3>
                    {med.strength && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {med.strength}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {med.dosage && (
                      <div>
                        <p className="text-muted-foreground">Dosage</p>
                        <p className="font-medium">{med.dosage}</p>
                      </div>
                    )}
                    {med.frequency && (
                      <div>
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-medium capitalize">{med.frequency.replace(/_/g, " ")}</p>
                      </div>
                    )}
                    {med.route && (
                      <div>
                        <p className="text-muted-foreground">Route</p>
                        <p className="font-medium capitalize">{med.route}</p>
                      </div>
                    )}
                    {med.duration_days && (
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{med.duration_days} days</p>
                      </div>
                    )}
                  </div>

                  {med.instructions && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-sm">
                      <p className="text-muted-foreground">Instructions</p>
                      <p className="text-blue-900">{med.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notes */}
        {prescription.parsed_data?.notes && (
          <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
            <h3 className="font-semibold mb-2">Additional Notes</h3>
            <p className="text-sm text-amber-900">{prescription.parsed_data.notes}</p>
          </Card>
        )}

        {/* Prescription Image */}
        {prescription.file_url && prescription.file_url.startsWith("data:image") && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Prescription Image</h3>
            <img
              src={prescription.file_url}
              alt="Prescription"
              className="w-full max-h-96 object-contain rounded-lg border border-border"
            />
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex gap-4">
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {confirming ? "Confirming..." : "✓ Confirm & Add to Schedule"}
            </Button>
            <Button
              onClick={handleReject}
              disabled={confirming}
              variant="outline"
              className="flex-1"
            >
              Reject Prescription
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            After confirming, medications will be added to your schedule and you'll receive reminders.
          </p>
        </Card>
      </main>
    </div>
  );
}
