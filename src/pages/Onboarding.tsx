import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    phone: "",
    emergency_contact: "",
    emergency_phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) return;
      console.log("Creating/updating profile for user:", user.id);
      console.log("Profile data:", formData);

      // Use upsert to handle both new profiles and updates to auto-created profiles
      const { data, error } = await supabase
        .from("patient_profiles")
        .upsert({
          id: user.id,
          ...formData,
        }, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error("Database error:", error);
        throw new Error(error.message || "Failed to create profile");
      }

      console.log("Profile saved successfully:", data);

      toast({
        title: "Profile created!",
        description: "Welcome to VitalWise",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error creating profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-elevated animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary rounded-xl shadow-glow">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Complete Your Profile</h1>
            <p className="text-muted-foreground">Help us personalize your experience</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-lg mb-4">Emergency Contact (Optional)</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact"
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating Profile..." : "Continue to Dashboard"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
