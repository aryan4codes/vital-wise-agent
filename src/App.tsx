import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import PrescriptionDetails from "./pages/PrescriptionDetails";
import VitalsLog from "./pages/VitalsLog";
import Alerts from "./pages/Alerts";
import Schedule from "./pages/Schedule";
import MedicationInventory from "./pages/MedicationInventory";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return children; // optionally render a spinner component here
  return user ? children : <Navigate to="/" replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Index />} />
            <Route path="/inventory" element={<PrivateRoute><MedicationInventory /></PrivateRoute>} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/prescriptions/upload" element={<PrivateRoute><PrescriptionUpload /></PrivateRoute>} />
            <Route path="/prescriptions/:id" element={<PrivateRoute><PrescriptionDetails /></PrivateRoute>} />
            <Route path="/vitals/log" element={<PrivateRoute><VitalsLog /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
            <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
