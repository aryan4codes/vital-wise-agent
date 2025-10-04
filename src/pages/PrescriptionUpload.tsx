import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Camera, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PrescriptionUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPG, PNG) or PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const uploadPrescription = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a prescription file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!prescriptionDate) {
      toast({
        title: "Date required",
        description: "Please enter the prescription date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("prescriptions")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("prescriptions")
        .getPublicUrl(fileName);

      // Create prescription record
      const { data: prescription, error: dbError } = await supabase
        .from("prescriptions")
        .insert({
          patient_id: user.id,
          doctor_name: doctorName || null,
          prescription_date: prescriptionDate,
          file_url: publicUrl,
          status: "pending",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Prescription uploaded!",
        description: "Our AI agents are now processing your prescription...",
      });

      // Call AI agent to parse prescription
      await processPrescriptionWithAI(prescription.id, publicUrl);

    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const processPrescriptionWithAI = async (prescriptionId: string, fileUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("parse-prescription", {
        body: { 
          prescriptionId,
          fileUrl 
        },
      });

      if (error) throw error;

      toast({
        title: "Processing complete!",
        description: "Your medications have been added to your schedule",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("AI processing error:", error);
      toast({
        title: "Processing incomplete",
        description: "Prescription saved but needs manual review",
        variant: "destructive",
      });
      navigate("/dashboard");
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Upload Prescription</h1>
          <p className="text-muted-foreground mb-8">
            Our AI agents will automatically extract medications, dosages, and schedules
          </p>

          <Card className="p-8 shadow-elevated">
            {!file ? (
              <div>
                <Label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/50"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="mb-2 text-sm font-semibold">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, or PDF (MAX. 10MB)
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                  />
                </Label>

                <div className="mt-6 p-4 bg-accent rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <Camera className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Tips for best results:</p>
                      <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Ensure good lighting and avoid shadows</li>
                        <li>Capture the entire prescription clearly</li>
                        <li>Keep the camera steady to avoid blur</li>
                        <li>Include doctor's signature and date if visible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div className="flex-1">
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  {preview && (
                    <img
                      src={preview}
                      alt="Prescription preview"
                      className="w-full max-h-96 object-contain rounded-lg border border-border"
                    />
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Doctor's Name (Optional)</Label>
                    <Input
                      id="doctor"
                      type="text"
                      placeholder="Dr. Smith"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Prescription Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={prescriptionDate}
                      onChange={(e) => setPrescriptionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={uploadPrescription}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing with AI Agents...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          {/* AI Agent Info */}
          <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-3">
              🤖 Multi-Agent AI Processing
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Parser Agent:</strong> Extracts medication details using OCR + GPT-4</p>
              <p>• <strong>Schedule Optimizer:</strong> Creates personalized medication schedules</p>
              <p>• <strong>Interaction Checker:</strong> Validates drug combinations for safety</p>
              <p>• <strong>Alert Generator:</strong> Sets up intelligent reminders</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
