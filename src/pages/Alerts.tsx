import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Filter,
} from "lucide-react";

type AlertStatus = "pending" | "acknowledged" | "resolved";
type AlertSeverity = "info" | "warning" | "critical";

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  alert_type?: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; icon: string; label: string }> = {
  info: { color: "bg-blue-100 border-blue-300", icon: "ℹ️", label: "Info" },
  warning: { color: "bg-yellow-100 border-yellow-300", icon: "⚠️", label: "Warning" },
  critical: { color: "bg-red-100 border-red-300", icon: "🚨", label: "Critical" },
};

const STATUS_CONFIG: Record<AlertStatus, { color: string; label: string }> = {
  pending: { color: "bg-orange-50 border-orange-200", label: "Pending" },
  acknowledged: { color: "bg-blue-50 border-blue-200", label: "Acknowledged" },
  resolved: { color: "bg-green-50 border-green-200", label: "Resolved" },
};

export default function Alerts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlertStatus | "all">("pending");
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("health_alerts")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts((data || []) as Alert[]);
    } catch (error: any) {
      console.error("Load error:", error);
      toast({
        title: "Error loading alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alert: Alert) => {
    try {
      setActioning(alert.id);
      const { error } = await supabase
        .from("health_alerts")
        .update({
          status: "acknowledged",
          acknowledged_at: new Date().toISOString(),
        })
        .eq("id", alert.id);

      if (error) throw error;

      setAlerts(
        alerts.map((a) =>
          a.id === alert.id
            ? {
                ...a,
                status: "acknowledged",
                acknowledged_at: new Date().toISOString(),
              }
            : a
        )
      );

      toast({
        title: "Alert acknowledged",
        description: "You've marked this alert as acknowledged",
      });
    } catch (error: any) {
      toast({
        title: "Failed to acknowledge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const handleResolve = async (alert: Alert) => {
    try {
      setActioning(alert.id);
      const { error } = await supabase
        .from("health_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alert.id);

      if (error) throw error;

      setAlerts(
        alerts.map((a) =>
          a.id === alert.id
            ? {
                ...a,
                status: "resolved",
                resolved_at: new Date().toISOString(),
              }
            : a
        )
      );

      toast({
        title: "Alert resolved",
        description: "You've marked this alert as resolved",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resolve",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      setActioning(alertId);
      const { error } = await supabase.from("health_alerts").delete().eq("id", alertId);

      if (error) throw error;

      setAlerts(alerts.filter((a) => a.id !== alertId));

      toast({
        title: "Alert deleted",
        description: "The alert has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActioning(null);
    }
  };

  const filteredAlerts = alerts.filter((alert) =>
    filter === "all" ? true : alert.status === filter
  );

  const stats = {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === "pending").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    critical: alerts.filter((a) => a.severity === "critical").length,
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-fade-in">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-primary" />
              Health Alerts
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage your health notifications
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </Card>

            <Card className="p-4 border-orange-200 bg-orange-50">
              <p className="text-sm text-orange-700 font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
            </Card>

            <Card className="p-4 border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-700 font-medium mb-1">Acknowledged</p>
              <p className="text-2xl font-bold text-blue-900">{stats.acknowledged}</p>
            </Card>

            <Card className="p-4 border-green-200 bg-green-50">
              <p className="text-sm text-green-700 font-medium mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-900">{stats.resolved}</p>
            </Card>

            <Card className="p-4 border-red-200 bg-red-50">
              <p className="text-sm text-red-700 font-medium mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="mb-8 flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 mr-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            {(["all", "pending", "acknowledged", "resolved"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No alerts</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "You don't have any alerts yet. Great job staying healthy!"
                  : `No ${filter} alerts at the moment`}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const severityConfig = SEVERITY_CONFIG[alert.severity];
                const statusConfig = STATUS_CONFIG[alert.status];

                return (
                  <Card
                    key={alert.id}
                    className={`p-6 border-l-4 transition-all ${statusConfig.color}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Title and Badges */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{severityConfig.icon}</span>
                          <h3 className="text-lg font-semibold">{alert.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {severityConfig.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {statusConfig.label}
                            </Badge>
                            {alert.alert_type && (
                              <Badge variant="secondary" className="text-xs">
                                {alert.alert_type}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-sm mb-3">{alert.message}</p>

                        {/* Timestamps */}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                          </div>

                          {alert.acknowledged_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                Acknowledged: {new Date(alert.acknowledged_at).toLocaleString()}
                              </span>
                            </div>
                          )}

                          {alert.resolved_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Resolved: {new Date(alert.resolved_at).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                          <div className="mt-3 p-2 bg-muted/30 rounded text-xs">
                            <p className="font-medium mb-1">Details:</p>
                            <pre className="overflow-auto">
                              {JSON.stringify(alert.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {alert.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleAcknowledge(alert)}
                              disabled={actioning === alert.id}
                              size="sm"
                              variant="outline"
                            >
                              {actioning === alert.id ? "..." : "Acknowledge"}
                            </Button>
                            <Button
                              onClick={() => handleResolve(alert)}
                              disabled={actioning === alert.id}
                              size="sm"
                              variant="default"
                            >
                              {actioning === alert.id ? "..." : "Resolve"}
                            </Button>
                          </>
                        )}

                        {alert.status === "acknowledged" && (
                          <Button
                            onClick={() => handleResolve(alert)}
                            disabled={actioning === alert.id}
                            size="sm"
                            variant="default"
                          >
                            {actioning === alert.id ? "..." : "Resolve"}
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDelete(alert.id)}
                          disabled={actioning === alert.id}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                        >
                          {actioning === alert.id ? "..." : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
