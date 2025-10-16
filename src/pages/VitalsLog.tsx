import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, TrendingUp } from "lucide-react";

type VitalType = "blood_pressure" | "heart_rate" | "temperature" | "blood_sugar" | "weight" | "oxygen_saturation";

interface VitalConfig {
  label: string;
  unit: string;
  hasSecondaryValue: boolean;
  placeholder: string;
  secondaryPlaceholder?: string;
  icon: string;
}

const VITAL_TYPES: Record<VitalType, VitalConfig> = {
  blood_pressure: {
    label: "Blood Pressure",
    unit: "mmHg",
    hasSecondaryValue: true,
    placeholder: "Systolic (e.g., 120)",
    secondaryPlaceholder: "Diastolic (e.g., 80)",
    icon: "❤️",
  },
  heart_rate: {
    label: "Heart Rate",
    unit: "bpm",
    hasSecondaryValue: false,
    placeholder: "Beats per minute (e.g., 72)",
    icon: "💓",
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    hasSecondaryValue: false,
    placeholder: "Temperature (e.g., 37.5)",
    icon: "🌡️",
  },
  blood_sugar: {
    label: "Blood Sugar",
    unit: "mg/dL",
    hasSecondaryValue: false,
    placeholder: "Glucose level (e.g., 100)",
    icon: "🩸",
  },
  weight: {
    label: "Weight",
    unit: "kg",
    hasSecondaryValue: false,
    placeholder: "Weight (e.g., 70.5)",
    icon: "⚖️",
  },
  oxygen_saturation: {
    label: "Oxygen Saturation",
    unit: "%",
    hasSecondaryValue: false,
    placeholder: "SpO2 (e.g., 98)",
    icon: "💨",
  },
};

export default function VitalsLog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vitalType, setVitalType] = useState<VitalType>("heart_rate");
  const [value, setValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [notes, setNotes] = useState("");
  const [measuredAt, setMeasuredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const config = VITAL_TYPES[vitalType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || !user) {
      toast({
        title: "Missing information",
        description: "Please enter the vital value",
        variant: "destructive",
      });
      return;
    }

    if (config.hasSecondaryValue && !secondaryValue) {
      toast({
        title: "Missing secondary value",
        description: `Please enter ${config.secondaryPlaceholder}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("health_vitals").insert({
        patient_id: user.id,
        vital_type: vitalType,
        value: parseFloat(value),
        secondary_value: config.hasSecondaryValue ? parseFloat(secondaryValue) : null,
        unit: config.unit,
        measured_at: new Date(measuredAt).toISOString(),
        notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: "Vital logged successfully!",
        description: `${config.label} recorded at ${new Date(measuredAt).toLocaleTimeString()}`,
      });

      // Reset form
      setValue("");
      setSecondaryValue("");
      setNotes("");
      setMeasuredAt(new Date().toISOString().slice(0, 16));

      // Optionally redirect after a short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Log error:", error);
      toast({
        title: "Failed to log vital",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Log Health Vital
            </h1>
            <p className="text-muted-foreground">
              Record your health measurements to track your wellness over time
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vital Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold">Select Vital Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(VITAL_TYPES) as [VitalType, VitalConfig][]).map(
                    ([type, cfg]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setVitalType(type)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          vitalType === type
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/30 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{cfg.icon}</span>
                          <span className="font-medium text-sm">{cfg.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{cfg.unit}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Date/Time */}
              <div className="space-y-2">
                <label htmlFor="measured-at" className="block text-sm font-semibold">
                  Date & Time
                </label>
                <input
                  id="measured-at"
                  type="datetime-local"
                  value={measuredAt}
                  onChange={(e) => setMeasuredAt(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>

              {/* Primary Value */}
              <div className="space-y-2">
                <label htmlFor="value" className="block text-sm font-semibold">
                  {config.placeholder}
                </label>
                <div className="flex gap-2">
                  <input
                    id="value"
                    type="number"
                    step="0.1"
                    placeholder={config.placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                    disabled={loading}
                  />
                  <span className="flex items-center px-3 py-2 bg-muted rounded-md text-sm font-medium">
                    {config.unit}
                  </span>
                </div>
              </div>

              {/* Secondary Value (for Blood Pressure) */}
              {config.hasSecondaryValue && (
                <div className="space-y-2">
                  <label htmlFor="secondary" className="block text-sm font-semibold">
                    {config.secondaryPlaceholder}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="secondary"
                      type="number"
                      step="0.1"
                      placeholder={config.secondaryPlaceholder}
                      value={secondaryValue}
                      onChange={(e) => setSecondaryValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                      disabled={loading}
                    />
                    <span className="flex items-center px-3 py-2 bg-muted rounded-md text-sm font-medium">
                      {config.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-semibold">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  placeholder="e.g., After exercise, felt dizzy, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background min-h-24 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Reference Ranges */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Normal Ranges
                </p>
                {vitalType === "blood_pressure" && (
                  <p className="text-blue-800">Normal: &lt;120/80 mmHg | Elevated: 120-129/&lt;80</p>
                )}
                {vitalType === "heart_rate" && (
                  <p className="text-blue-800">Normal resting: 60-100 bpm</p>
                )}
                {vitalType === "temperature" && (
                  <p className="text-blue-800">Normal: 36.1-37.2°C (97-99°F)</p>
                )}
                {vitalType === "blood_sugar" && (
                  <p className="text-blue-800">Fasting: 70-100 mg/dL | Random: &lt;140 mg/dL</p>
                )}
                {vitalType === "weight" && (
                  <p className="text-blue-800">Track regularly for trending</p>
                )}
                {vitalType === "oxygen_saturation" && (
                  <p className="text-blue-800">Normal: 95-100%</p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? "Logging..." : "Log Vital"}
              </Button>
            </form>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 p-6 bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-lg mb-3 text-amber-900">
              💡 Tips for Accurate Measurements
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li>• <strong>Blood Pressure:</strong> Measure sitting down after 5 min rest, use same arm</li>
              <li>• <strong>Heart Rate:</strong> Count at wrist or neck for 60 seconds</li>
              <li>• <strong>Temperature:</strong> Measure when calm, wait 30 min after eating/exercise</li>
              <li>• <strong>Blood Sugar:</strong> Test fasting or 2 hours after meals for consistency</li>
              <li>• <strong>Weight:</strong> Weigh at same time daily, preferably morning before food</li>
              <li>• <strong>Oxygen Saturation:</strong> Use pulse oximeter, ensure good placement</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
