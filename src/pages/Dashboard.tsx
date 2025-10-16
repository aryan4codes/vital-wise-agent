import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  Bell, 
  Calendar, 
  FileText, 
  Heart, 
  Pill,
  TrendingUp,
  Upload,
  Users
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { STATIC_ADMIN_USER_ID, STATIC_ADMIN_USER } from "@/lib/constants";

interface DashboardStats {
  activeMedications: number;
  todaysDoses: number;
  missedDoses: number;
  pendingAlerts: number;
  vitalsLogged: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeMedications: 0,
    todaysDoses: 0,
    missedDoses: 0,
    pendingAlerts: 0,
    vitalsLogged: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check if profile exists, if not create it
      const { data: profile, error: profileError } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("id", STATIC_ADMIN_USER_ID)
        .maybeSingle();

      // If there's a permission error, log it but continue
      if (profileError && !profileError.message.includes("Row not found")) {
        console.warn("Profile access warning:", profileError);
      }

      if (!profile) {
        // Try to create admin profile, but don't fail if it errors
        const { error: insertError } = await supabase
          .from("patient_profiles")
          .insert({
            id: STATIC_ADMIN_USER_ID,
            full_name: STATIC_ADMIN_USER.full_name,
          });
        
        if (insertError) {
          console.warn("Could not create profile (may already exist):", insertError);
        }
      }

      // Load stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [medications, schedules, alerts, vitals] = await Promise.all([
        supabase
          .from("medications")
          .select("*")
          .eq("patient_id", STATIC_ADMIN_USER_ID)
          .eq("is_active", true),
        supabase
          .from("medication_schedules")
          .select("*")
          .eq("patient_id", STATIC_ADMIN_USER_ID)
          .gte("scheduled_time", today.toISOString()),
          supabase
          .from("health_alerts")
          .select("*")
          .eq("patient_id", STATIC_ADMIN_USER_ID)
          .eq("status", "pending"),
        supabase
          .from("health_vitals")
          .select("*")
          .eq("patient_id", STATIC_ADMIN_USER_ID)
          .gte("measured_at", today.toISOString()),
      ]);

      const missedSchedules = schedules.data?.filter(
        s => s.status === "missed"
      ).length || 0;

      setStats({
        activeMedications: medications.data?.length || 0,
        todaysDoses: schedules.data?.length || 0,
        missedDoses: missedSchedules,
        pendingAlerts: alerts.data?.length || 0,
        vitalsLogged: vitals.data?.length || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Dashboard loading error:", errorMessage);
      
      // Show toast but continue - RLS errors are non-fatal
      if (errorMessage.includes("row-level security") || errorMessage.includes("permission")) {
        toast({
          title: "Limited access",
          description: "Some features may not be available. Check database permissions.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading dashboard",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">HealthGuard</h1>
              <p className="text-sm text-muted-foreground">Your Personal Health Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {stats.pendingAlerts > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {stats.pendingAlerts}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground mb-8">Here's your health overview for today</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary">{stats.activeMedications}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Active Medications</h3>
              <p className="text-sm text-muted-foreground">Currently prescribed</p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-success" />
                </div>
                <Badge variant="secondary">{stats.todaysDoses}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Today's Doses</h3>
              <p className="text-sm text-muted-foreground">Scheduled for today</p>
            </Card>

            {stats.missedDoses > 0 ? (
              <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow border-destructive/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <Bell className="h-6 w-6 text-destructive" />
                  </div>
                  <Badge variant="destructive">{stats.missedDoses}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">Missed Doses</h3>
                <p className="text-sm text-muted-foreground">Needs attention</p>
              </Card>
            ) : (
              <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow border-success/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <Badge className="bg-success text-success-foreground">Perfect!</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">No Missed Doses</h3>
                <p className="text-sm text-muted-foreground">Keep it up!</p>
              </Card>
            )}

            <Card className="p-6 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary">{stats.vitalsLogged}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Vitals Logged</h3>
              <p className="text-sm text-muted-foreground">Recorded today</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-8 mb-8 shadow-card">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate("/prescriptions/upload")}
                className="h-auto py-6 flex-col gap-3 bg-primary hover:bg-primary-light transition-colors"
              >
                <Upload className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Upload Prescription</div>
                  <div className="text-xs opacity-90">AI-powered parsing</div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/inventory")}
                variant="outline"
                className="h-auto py-6 flex-col gap-3 border-2 hover:border-primary hover:bg-accent transition-colors"
              >
                <Pill className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Medication Inventory</div>
                  <div className="text-xs opacity-70">Track refills & supply</div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/vitals/log")}
                variant="outline"
                className="h-auto py-6 flex-col gap-3 border-2 hover:border-primary hover:bg-accent transition-colors"
              >
                <Heart className="h-8 w-8" />
                <div>
                  <div className="font-semibold">Log Vitals</div>
                  <div className="text-xs opacity-70">Track your health</div>
                </div>
              </Button>

              <Button 
                onClick={() => navigate("/schedule")}
                variant="outline"
                className="h-auto py-6 flex-col gap-3 border-2 hover:border-primary hover:bg-accent transition-colors"
              >
                <Calendar className="h-8 w-8" />
                <div>
                  <div className="font-semibold">View Schedule</div>
                  <div className="text-xs opacity-70">Medication timeline</div>
                </div>
              </Button>
            </div>
          </Card>

          {/* Recent Alerts */}
          {stats.pendingAlerts > 0 && (
            <Card className="p-6 shadow-card border-warning/30">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-semibold">Pending Alerts</h3>
                <Badge variant="secondary">{stats.pendingAlerts}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You have {stats.pendingAlerts} notification{stats.pendingAlerts !== 1 ? 's' : ''} that need your attention
              </p>
              <Button 
                onClick={() => navigate("/alerts")}
                variant="outline"
                className="w-full md:w-auto"
              >
                View All Alerts
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
