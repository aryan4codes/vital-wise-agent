import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Activity, 
  Bell, 
  Calendar, 
  FileText, 
  Heart, 
  Pill,
  TrendingUp,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  activeMedications: number;
  todaysDoses: number;
  missedDoses: number;
  pendingAlerts: number;
  vitalsLogged: number;
}

interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  is_active: boolean;
}

interface Prescription {
  id: string;
  doctor_name?: string;
  prescription_date: string;
  status: string;
  created_at: string;
}

interface Vital {
  id: string;
  vital_type: string;
  value: number;
  secondary_value?: number;
  unit: string;
  measured_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeMedications: 0,
    todaysDoses: 0,
    missedDoses: 0,
    pendingAlerts: 0,
    vitalsLogged: 0,
  });
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!user) {
        return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError && !profileError.message.includes("Row not found")) {
        console.warn("Profile access warning:", profileError);
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from("patient_profiles")
          .insert({
            id: user.id,
            full_name: user.full_name || user.email || "",
          });
        
        if (insertError) {
          console.warn("Could not create profile (may already exist):", insertError);
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        medicationsRes,
        schedulesRes,
        alertsRes,
        vitalsRes,
        prescriptionsRes
      ] = await Promise.all([
        supabase
          .from("medications")
          .select("*")
          .eq("patient_id", user.id)
          .eq("is_active", true),
        supabase
          .from("medication_schedules")
          .select("*")
          .eq("patient_id", user.id)
          .gte("scheduled_time", today.toISOString()),
        supabase
          .from("health_alerts")
          .select("*")
          .eq("patient_id", user.id)
          .eq("status", "pending"),
        supabase
          .from("health_vitals")
          .select("*")
          .eq("patient_id", user.id)
          .order("measured_at", { ascending: false })
          .limit(5),
        supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setMedications(medicationsRes.data || []);
      setPrescriptions(prescriptionsRes.data || []);
      setVitals(vitalsRes.data || []);

      const missedSchedules = schedulesRes.data?.filter(
        (s: any) => s.status === "missed"
      ).length || 0;

      setStats({
        activeMedications: medicationsRes.data?.length || 0,
        todaysDoses: schedulesRes.data?.length || 0,
        missedDoses: missedSchedules,
        pendingAlerts: alertsRes.data?.length || 0,
        vitalsLogged: vitalsRes.data?.length || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Dashboard loading error:", errorMessage);
      
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

  const getVitalDisplay = (vital: Vital) => {
    const vitalNames: Record<string, string> = {
      blood_pressure: "BP",
      heart_rate: "HR",
      temperature: "Temp",
      blood_sugar: "Blood Sugar",
      weight: "Weight",
      oxygen_saturation: "SpO2",
    };
    
    const displayValue = vital.secondary_value 
      ? `${vital.value}/${vital.secondary_value}` 
      : vital.value;
    
    return `${vitalNames[vital.vital_type] || vital.vital_type}: ${displayValue} ${vital.unit}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Background Design */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-100"></div>
        
        {/* Soft geometric color elements */}
        {/* Blue accent - top right */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 via-blue-100/20 to-transparent rounded-full opacity-25 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
        
        {/* Green accent - bottom left */}
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-green-50 via-green-100/20 to-transparent rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        ></motion.div>

        {/* Purple accent - center */}
        <motion.div
          className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-50 via-purple-100/15 to-transparent rounded-full opacity-18 blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        ></motion.div>

        {/* Amber accent - top left */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-50 via-amber-100/15 to-transparent rounded-full opacity-15 blur-3xl"
          animate={{
            x: [0, -25, 10, 0],
            y: [0, 25, -15, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        ></motion.div>

        {/* Cyan accent - bottom right */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-to-tl from-cyan-50 via-cyan-100/10 to-transparent rounded-full opacity-12 blur-3xl"
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -20, 15, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        ></motion.div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0,0,0,.05) 25%, rgba(0,0,0,.05) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.05) 75%, rgba(0,0,0,.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '60px 60px'
        }}></div>

        {/* Radial gradient vignette for depth */}
        <div className="absolute inset-0 bg-radial-gradient opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.1) 100%)'
        }}></div>
      </div>
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Heart className="h-5 w-5 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">VitalWise</h1>
                <p className="text-sm text-gray-500">Patient Health Management</p>
              </div>
            </div>
            
            <motion.button
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/alerts")}
            >
              <Bell className="h-5 w-5" />
              {stats.pendingAlerts > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                  {stats.pendingAlerts}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500">Here's your health overview for today</p>
        </div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12"
        >
          {[
            { label: "Active Medications", value: stats.activeMedications, icon: Pill, color: "blue", bgColor: "bg-blue-50/50", borderColor: "border-l-4 border-blue-400" },
            { label: "Today's Doses", value: stats.todaysDoses, icon: Calendar, color: "green", bgColor: "bg-green-50/50", borderColor: "border-l-4 border-green-400" },
            { label: "Missed Doses", value: stats.missedDoses, icon: AlertCircle, color: "red", bgColor: "bg-red-50/50", borderColor: "border-l-4 border-red-400" },
            { label: "Pending Alerts", value: stats.pendingAlerts, icon: Bell, color: "amber", bgColor: "bg-amber-50/50", borderColor: "border-l-4 border-amber-400" },
            { label: "Vitals Logged", value: stats.vitalsLogged, icon: Activity, color: "purple", bgColor: "bg-purple-50/50", borderColor: "border-l-4 border-purple-400" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            const colorMap: Record<string, string> = {
              blue: "text-blue-600",
              green: "text-green-600",
              red: "text-red-600",
              amber: "text-amber-600",
              purple: "text-purple-600",
            };
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className={`${stat.bgColor} ${stat.borderColor} rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`h-5 w-5 ${colorMap[stat.color]}`} />
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${colorMap[stat.color]}`}>{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Upload Prescription", desc: "Add prescription document", icon: Upload, path: "/prescriptions/upload", bgGradient: "from-blue-600 to-blue-700", iconBg: "bg-blue-500/20" },
              { label: "Log Vitals", desc: "Record health measurements", icon: Heart, path: "/vitals/log", bgGradient: "from-red-600 to-red-700", iconBg: "bg-red-500/20" },
              { label: "View Schedule", desc: "Check medication timeline", icon: Calendar, path: "/schedule", bgGradient: "from-green-600 to-green-700", iconBg: "bg-green-500/20" },
            ].map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <motion.button
                  key={idx}
                  onClick={() => navigate(action.path)}
                  whileHover={{ y: -2 }}
                  className={`bg-gradient-to-br ${action.bgGradient} text-white rounded-lg p-6 text-left hover:shadow-lg transition-all group`}
                >
                  <div className={`${action.iconBg} w-fit p-3 rounded-lg mb-3`}>
                    <ActionIcon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="font-medium mb-1">{action.label}</p>
                  <p className="text-sm text-white/80">{action.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Data Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
        >
          {/* Recent Prescriptions */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 border-l-4 border-l-blue-400 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Recent Prescriptions</h3>
            </div>
            
            {prescriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No prescriptions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <motion.button
                    key={rx.id}
                    onClick={() => navigate(`/prescriptions/${rx.id}`)}
                    whileHover={{ x: 4 }}
                    className="w-full text-left p-3 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{rx.doctor_name || "General Practitioner"}</p>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {rx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(rx.prescription_date).toLocaleDateString()}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Active Medications */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 border-l-4 border-l-green-400 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-6">
              <Pill className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Medications</h3>
            </div>
            
            {medications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No active medications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {medications.slice(0, 5).map((med) => (
                  <motion.div
                    key={med.id}
                    whileHover={{ x: 4 }}
                    className="p-3 rounded border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">{med.name}</p>
                      {med.is_active && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {med.dosage || "N/A"} • {med.frequency || "As needed"}
                    </p>
                  </motion.div>
                ))}
                {medications.length > 5 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => navigate("/medications")}
                  >
                    View All ({medications.length})
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Recent Vitals */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 border-l-4 border-l-purple-400 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Recent Vitals</h3>
            </div>
            
            {vitals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No vitals logged yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {vitals.map((vital) => (
                  <motion.div
                    key={vital.id}
                    whileHover={{ x: 4 }}
                    className="p-3 rounded border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                  >
                    <p className="text-sm font-medium text-gray-900">{getVitalDisplay(vital)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(vital.measured_at).toLocaleTimeString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Alerts */}
        {stats.pendingAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 rounded-lg p-6 border border-amber-200 border-l-4 border-l-amber-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Pending Alerts</h3>
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">{stats.pendingAlerts}</Badge>
            </div>
            <p className="text-sm text-amber-900 mb-4">
              You have {stats.pendingAlerts} notification{stats.pendingAlerts !== 1 ? 's' : ''} requiring attention
            </p>
            <Button 
              onClick={() => navigate("/alerts")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              View All Alerts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
