import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Pill,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface MedicationSchedule {
  id: string;
  medication_id: string;
  scheduled_time: string;
  actual_time?: string;
  status: "pending" | "completed" | "missed";
  notes?: string;
  medication?: {
    name: string;
    dosage?: string;
    frequency?: string;
  };
}

export default function Schedule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "missed">("all");

  useEffect(() => {
    loadSchedules();
  }, [selectedDate, filterStatus]);

  const loadSchedules = async () => {
    try {
      if (!user) return;

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      let query = supabase
        .from("medication_schedules")
        .select("*, medications(name, dosage, frequency)")
        .eq("patient_id", user.id)
        .gte("scheduled_time", startOfDay.toISOString())
        .lte("scheduled_time", endOfDay.toISOString())
        .order("scheduled_time", { ascending: true });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedules((data as MedicationSchedule[]) || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load schedules";
      console.error("Schedule loading error:", errorMessage);
      toast({
        title: "Error loading schedules",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleStatus = async (scheduleId: string, status: "completed" | "missed") => {
    try {
      const { error } = await supabase
        .from("medication_schedules")
        .update({
          status,
          actual_time: new Date().toISOString(),
        })
        .eq("id", scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Dose marked as ${status}`,
      });

      loadSchedules();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200 border-l-4 border-l-green-400";
      case "missed":
        return "bg-red-50 border-red-200 border-l-4 border-l-red-400";
      default:
        return "bg-amber-50 border-amber-200 border-l-4 border-l-amber-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "missed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      case "missed":
        return <Badge className="bg-red-100 text-red-700 border-red-300">Missed</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Pending</Badge>;
    }
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
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-100"></div>
        
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 via-blue-100/20 to-transparent rounded-full opacity-25 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/dashboard")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Medication Schedule</h1>
                  <p className="text-sm text-gray-500">Track and manage your doses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Date and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                  setLoading(true);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Filter by Status</label>
              <div className="flex gap-2">
                {(["all", "pending", "completed", "missed"] as const).map((status) => (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setFilterStatus(status);
                      setLoading(true);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterStatus === status
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="capitalize">{status}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Schedule List */}
        {schedules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">No schedules found</p>
            <p className="text-gray-500">No medication schedules for {selectedDate.toLocaleDateString()}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {schedules.map((schedule, idx) => (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-lg p-6 border ${getStatusColor(schedule.status)} hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(schedule.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {schedule.medication?.name || "Unknown Medication"}
                        </h3>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Dosage</p>
                          <p className="text-gray-900">{schedule.medication?.dosage || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Frequency</p>
                          <p className="text-gray-900">{schedule.medication?.frequency || "As needed"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Scheduled Time</p>
                          <p className="text-gray-900">
                            {new Date(schedule.scheduled_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      {schedule.notes && (
                        <p className="text-sm text-gray-600 italic">Notes: {schedule.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {schedule.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateScheduleStatus(schedule.id, "completed")}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Mark Done
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateScheduleStatus(schedule.id, "missed")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Mark Missed
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
