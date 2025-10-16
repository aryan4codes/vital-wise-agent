import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Heart,
  MessageSquare,
  Package,
  Pill,
  RefreshCw,
  Send,
  TrendingDown,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage, initializeGemini, getGeminiClient, MedicationAction } from "@/lib/gemini-client";
import { GEMINI_API_KEY } from "@/lib/constants";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: number; // times per day
  durationDays: number;
  currentCount: number;
  pillsPerBottle: number;
  refillsRemaining: number;
  refillNotes?: string; // NLP-parsed from prescription image
  lastRefillDate: string;
}

// Mock data for demonstration
const initialMockMedications: Medication[] = [
  {
    id: "1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: 1, // once daily
    durationDays: 90,
    currentCount: 15,
    pillsPerBottle: 90,
    refillsRemaining: 3,
    refillNotes: "Refill 3 times", // NLP-parsed
    lastRefillDate: "2025-07-20",
  },
  {
    id: "2",
    name: "Metformin",
    dosage: "500mg",
    frequency: 2, // twice daily
    durationDays: 30,
    currentCount: 45,
    pillsPerBottle: 60,
    refillsRemaining: 5,
    refillNotes: "Refill up to 5 times before expiration", // NLP-parsed
    lastRefillDate: "2025-09-20",
  },
  {
    id: "3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: 1, // once daily
    durationDays: 30,
    currentCount: 5,
    pillsPerBottle: 30,
    refillsRemaining: 2,
    refillNotes: "Maximum 2 refills",
    lastRefillDate: "2025-09-15",
  },
  {
    id: "4",
    name: "Omeprazole",
    dosage: "40mg",
    frequency: 1,
    durationDays: 90,
    currentCount: 60,
    pillsPerBottle: 90,
    refillsRemaining: 0,
    refillNotes: "No refills - contact doctor",
    lastRefillDate: "2025-08-01",
  },
  {
    id: "5",
    name: "Aspirin",
    dosage: "81mg",
    frequency: 1,
    durationDays: 365,
    currentCount: 300,
    pillsPerBottle: 365,
    refillsRemaining: 12,
    refillNotes: "Refill as needed",
    lastRefillDate: "2025-01-15",
  },
];

const STORAGE_KEYS = {
  MEDICATIONS: "vital-wise-medications",
  CHAT_HISTORY: "vital-wise-chat-history",
};

export default function MedicationInventory() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCount, setTempCount] = useState<string>("");
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount and initialize Gemini
  useEffect(() => {
    const savedMedications = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    const savedChatHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);

    if (savedMedications) {
      setMedications(JSON.parse(savedMedications));
    } else {
      setMedications(initialMockMedications);
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(initialMockMedications));
    }

    if (savedChatHistory) {
      setChatMessages(JSON.parse(savedChatHistory));
    } else {
      const welcomeMessage: ChatMessage = {
        role: "assistant",
        content: "Hi! I'm your medication assistant. You can tell me things like:\n• 'I took my Lisinopril'\n• 'I missed my Metformin dose'\n• 'I have 50 Aspirin pills left'\n\nI'll help you track your medications!",
        timestamp: new Date().toISOString(),
      };
      setChatMessages([welcomeMessage]);
    }

    // Initialize Gemini with API key from constants
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
      initializeGemini(GEMINI_API_KEY);
    }
  }, []);

  // Save medications to localStorage whenever they change
  useEffect(() => {
    if (medications.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
    }
  }, [medications]);

  // Save chat history to localStorage
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Calculate Days of Supply (DOS)
  const calculateDaysOfSupply = (med: Medication): number => {
    const dailyConsumption = med.frequency; // pills per day
    const daysRemaining = Math.floor(med.currentCount / dailyConsumption);
    return daysRemaining;
  };

  // Check if medication needs refill alert (7 days before running out)
  const needsRefillAlert = (med: Medication): boolean => {
    const dos = calculateDaysOfSupply(med);
    return dos <= 7 && dos > 0;
  };

  // Check if medication is critically low (0-3 days)
  const isCriticallyLow = (med: Medication): boolean => {
    const dos = calculateDaysOfSupply(med);
    return dos <= 3;
  };

  // Check if medication is out of stock
  const isOutOfStock = (med: Medication): boolean => {
    return med.currentCount <= 0;
  };

  // Get alert level for a medication
  const getAlertLevel = (med: Medication): "critical" | "warning" | "good" => {
    if (isOutOfStock(med) || isCriticallyLow(med)) return "critical";
    if (needsRefillAlert(med)) return "warning";
    return "good";
  };

  // Calculate progress percentage for inventory
  const calculateInventoryProgress = (med: Medication): number => {
    return Math.min((med.currentCount / med.pillsPerBottle) * 100, 100);
  };

  // Update medication count
  const updateMedicationCount = (medId: string, newCount: number) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === medId ? { ...med, currentCount: Math.max(0, newCount) } : med
      )
    );
    setEditingId(null);
    setTempCount("");
    toast({
      title: "Inventory Updated",
      description: "Medication count has been updated successfully.",
    });
  };

  // Handle medication action from chat
  const handleMedicationAction = (action: MedicationAction) => {
    const medication = medications.find(
      med => med.name.toLowerCase() === action.medicationName.toLowerCase()
    );

    if (!medication) {
      toast({
        title: "Medication Not Found",
        description: `Couldn't find ${action.medicationName} in your inventory.`,
        variant: "destructive",
      });
      return;
    }

    switch (action.action) {
      case "took": {
        const tookAmount = action.amount || medication.frequency;
        updateMedicationCount(medication.id, medication.currentCount - tookAmount);
        toast({
          title: "Medication Taken",
          description: `Removed ${tookAmount} pill(s) of ${medication.name} from inventory.`,
        });
        break;
      }

      case "missed":
        // Just log it, don't change inventory
        toast({
          title: "Dose Missed",
          description: `Noted that you missed ${medication.name}. No inventory change.`,
        });
        break;

      case "update":
        if (action.amount !== undefined) {
          updateMedicationCount(medication.id, action.amount);
        }
        break;

      case "refill": {
        const refillAmount = action.amount || medication.pillsPerBottle;
        setMedications(prev =>
          prev.map(med =>
            med.id === medication.id
              ? {
                  ...med,
                  currentCount: med.currentCount + refillAmount,
                  refillsRemaining: Math.max(0, med.refillsRemaining - 1),
                  lastRefillDate: new Date().toISOString().split("T")[0],
                }
              : med
          )
        );
        toast({
          title: "Refill Processed",
          description: `Added ${refillAmount} pills of ${medication.name}.`,
        });
        break;
      }
    }
  };

  // Send chat message
  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsSending(true);

    try {
      const client = getGeminiClient();
      const { action } = await client.chat(
        chatInput,
        medications.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          currentCount: m.currentCount,
        }))
      );

      // Generate response based on action
      let responseContent = "";
      
      if (action) {
        const medication = medications.find(
          med => med.name.toLowerCase() === action.medicationName.toLowerCase()
        );

        if (medication) {
          switch (action.action) {
            case "took": {
              const amount = action.amount || medication.frequency;
              responseContent = `✅ Recorded! You took ${amount} pill(s) of ${medication.name}. I've updated your inventory.`;
              break;
            }
            case "missed":
              responseContent = `📝 Noted that you missed your ${medication.name} dose. Try to take it if it's not too close to your next dose.`;
              break;
            case "update":
              responseContent = `✅ Updated! Your ${medication.name} inventory is now ${action.amount} pills. That's about ${Math.floor(action.amount / medication.frequency)} days of supply.`;
              break;
            case "refill":
              responseContent = `✅ Refill processed! Added ${medication.pillsPerBottle} pills of ${medication.name} to your inventory.`;
              break;
          }
          
          // Handle the medication action
          handleMedicationAction(action);
        } else {
          responseContent = `I couldn't find "${action.medicationName}" in your medication list. Please check the spelling or add it first.`;
        }
      } else {
        responseContent = "I'm not sure what you want me to do. Try saying something like 'I took my Lisinopril' or 'I have 50 Aspirin pills left'.";
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please check your API key and try again.",
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Chat Error",
        description: "Failed to send message. Check your API key.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Simulate refill (button click)
  const handleRefill = (med: Medication) => {
    if (med.refillsRemaining <= 0) {
      toast({
        title: "No Refills Available",
        description: "Please contact your doctor for a new prescription.",
        variant: "destructive",
      });
      return;
    }

    setMedications(prev =>
      prev.map(m =>
        m.id === med.id
          ? {
              ...m,
              currentCount: m.currentCount + m.pillsPerBottle,
              refillsRemaining: m.refillsRemaining - 1,
              lastRefillDate: new Date().toISOString().split("T")[0],
            }
          : m
      )
    );

    toast({
      title: "Refill Processed",
      description: `Added ${med.pillsPerBottle} pills of ${med.name}. ${med.refillsRemaining - 1} refills remaining.`,
    });
  };

  // Count medications by alert level
  const alertCounts = {
    critical: medications.filter(m => getAlertLevel(m) === "critical").length,
    warning: medications.filter(m => getAlertLevel(m) === "warning").length,
    good: medications.filter(m => getAlertLevel(m) === "good").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <Heart className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Medication Inventory
              </h1>
              <p className="text-sm text-muted-foreground">
                Track and manage your medication supply
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Chat Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            {/* Alerts */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {(alertCounts.critical + alertCounts.warning) > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {alertCounts.critical + alertCounts.warning}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Chat Sidebar */}
      <div className="flex">
        {/* Main Content */}
        <main className={`flex-1 container mx-auto px-4 py-8 transition-all ${chatOpen ? "mr-96" : ""}`}>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 shadow-card border-destructive/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <Badge variant="destructive">{alertCounts.critical}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Critical</h3>
              <p className="text-sm text-muted-foreground">
                Need immediate attention
              </p>
            </Card>

            <Card className="p-6 shadow-card border-warning/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-warning" />
                </div>
                <Badge className="bg-warning text-warning-foreground">
                  {alertCounts.warning}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Low Stock</h3>
              <p className="text-sm text-muted-foreground">Refill needed soon</p>
            </Card>

            <Card className="p-6 shadow-card border-success/30">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <Badge className="bg-success text-success-foreground">
                  {alertCounts.good}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">Well Stocked</h3>
              <p className="text-sm text-muted-foreground">Adequate supply</p>
            </Card>
          </div>

          {/* AI Chat Feature Callout */}
          <Alert className="mb-8 border-primary/50 bg-primary/5">
            <MessageSquare className="h-4 w-4 text-primary" />
            <AlertTitle>AI Chat Assistant Available</AlertTitle>
            <AlertDescription>
              Click the chat icon to talk to your medication assistant! Just say
              "I took my Lisinopril" or "I missed my dose" and I'll update your
              inventory automatically using Crew AI.
            </AlertDescription>
          </Alert>

          {/* Medications List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Medications</h2>

            {medications.map((med) => {
              const dos = calculateDaysOfSupply(med);
              const alertLevel = getAlertLevel(med);
              const progress = calculateInventoryProgress(med);
              const isEditing = editingId === med.id;

              return (
                <Card
                  key={med.id}
                  className={`p-6 shadow-card transition-all ${
                    alertLevel === "critical"
                      ? "border-destructive/50 bg-destructive/5"
                      : alertLevel === "warning"
                      ? "border-warning/50 bg-warning/5"
                      : "border-success/30"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Medication Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{med.name}</h3>
                            <Badge
                              variant={
                                alertLevel === "critical"
                                  ? "destructive"
                                  : alertLevel === "warning"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                alertLevel === "warning"
                                  ? "bg-warning text-warning-foreground"
                                  : ""
                              }
                            >
                              {alertLevel === "critical"
                                ? isOutOfStock(med)
                                  ? "OUT OF STOCK"
                                  : "CRITICAL"
                                : alertLevel === "warning"
                                ? "LOW STOCK"
                                : "GOOD"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <span className="font-semibold">{med.dosage}</span> •{" "}
                            {med.frequency}x per day • {med.durationDays} day
                            supply per bottle
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefill(med)}
                            disabled={med.refillsRemaining <= 0}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refill
                          </Button>
                        </div>
                      </div>

                      {/* Inventory Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Current Inventory
                          </span>
                          <span className="font-semibold">
                            {med.currentCount} / {med.pillsPerBottle} pills
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className={
                            alertLevel === "critical"
                              ? "[&>div]:bg-destructive"
                              : alertLevel === "warning"
                              ? "[&>div]:bg-warning"
                              : "[&>div]:bg-success"
                          }
                        />
                      </div>

                      {/* Days of Supply Alert */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div
                          className={`p-4 rounded-lg ${
                            alertLevel === "critical"
                              ? "bg-destructive/10"
                              : alertLevel === "warning"
                              ? "bg-warning/10"
                              : "bg-success/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              Days of Supply
                            </span>
                          </div>
                          <p className="text-2xl font-bold">
                            {dos} {dos === 1 ? "day" : "days"}
                          </p>
                          {dos <= 7 && dos > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {dos <= 3
                                ? "⚠️ Refill immediately!"
                                : "Order refill within 7 days"}
                            </p>
                          )}
                          {dos <= 0 && (
                            <p className="text-xs text-destructive font-semibold mt-1">
                              ⛔ Out of medication!
                            </p>
                          )}
                        </div>

                        <div className="p-4 rounded-lg bg-muted">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              Refills Available
                            </span>
                          </div>
                          <p className="text-2xl font-bold">
                            {med.refillsRemaining}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last refill: {new Date(med.lastRefillDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* NLP-Parsed Refill Notes */}
                      {med.refillNotes && (
                        <Alert className="bg-primary/5 border-primary/30">
                          <Pill className="h-4 w-4" />
                          <AlertTitle className="text-sm">
                            Prescription Instructions (AI-Parsed)
                          </AlertTitle>
                          <AlertDescription className="text-xs">
                            {med.refillNotes}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Update Inventory Section */}
                    <div className="lg:w-64 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Update Count
                      </h4>

                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`count-${med.id}`}>
                              New Count (pills)
                            </Label>
                            <Input
                              id={`count-${med.id}`}
                              type="number"
                              min="0"
                              value={tempCount}
                              onChange={(e) => setTempCount(e.target.value)}
                              placeholder={med.currentCount.toString()}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateMedicationCount(
                                  med.id,
                                  parseInt(tempCount) || 0
                                )
                              }
                              className="flex-1"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(null);
                                setTempCount("");
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              Current Count
                            </p>
                            <p className="text-2xl font-bold">
                              {med.currentCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              pills remaining
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(med.id);
                              setTempCount(med.currentCount.toString());
                            }}
                            className="w-full"
                          >
                            Edit Count
                          </Button>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>• Daily usage: {med.frequency} pills</p>
                            <p>• Per bottle: {med.pillsPerBottle} pills</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <Card className="mt-8 p-6 bg-muted/50">
            <h3 className="font-semibold text-lg mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">Days of Supply (DOS)</span>
                </div>
                <p className="text-muted-foreground">
                  Calculated based on your current pill count divided by daily
                  consumption (frequency). Helps predict when you'll run out.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-warning">
                  <Bell className="h-5 w-5" />
                  <span className="font-semibold">Smart Alerts</span>
                </div>
                <p className="text-muted-foreground">
                  Automatic notifications 7 days before running out, with critical
                  alerts when supply drops below 3 days.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-success">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-semibold">AI Chat Assistant</span>
                </div>
                <p className="text-muted-foreground">
                  Just chat naturally about your medications! The AI understands
                  and updates your inventory automatically.
                </p>
              </div>
            </div>
          </Card>
        </main>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border shadow-xl flex flex-col z-50">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Medication Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message... (e.g., 'I took my Lisinopril')"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="resize-none"
                  rows={2}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isSending || !chatInput.trim()}
                  size="icon"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
