import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, Brain, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [navigate, loading, user]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">VitalWise</span>
          </button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content with Animated Background */}
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center pt-20 pb-16">
        {/* Animated Background - Same as Landing Page */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100/40">
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
              <path 
                d="M0,400 C300,300 600,500 1200,400 L1200,800 L0,800 Z" 
                fill="url(#wave1)" 
                className="animate-pulse" 
                style={{ animationDuration: '8s' }}
              />
              <path 
                d="M0,500 C400,400 800,600 1200,500 L1200,800 L0,800 Z" 
                fill="url(#wave2)" 
                className="animate-pulse" 
                style={{ animationDuration: '10s', animationDelay: '2s' }}
              />
              <path 
                d="M0,600 C200,550 900,650 1200,600 L1200,800 L0,800 Z" 
                fill="url(#wave3)" 
                className="animate-pulse" 
                style={{ animationDuration: '12s', animationDelay: '4s' }}
              />
              
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="wave3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#eff6ff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Cloud-like blobs */}
          <div className="absolute top-16 right-20 w-32 h-20 bg-blue-50/60 rounded-full blur-xl animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-20 left-16 w-40 h-24 bg-blue-100/40 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-10 w-24 h-16 bg-white/80 rounded-full blur-xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
          
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#bfdbfe_1px,_transparent_0)] bg-[size:40px_40px] opacity-20"></div>
        </div>

        {/* Auth Card */}
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="text-center mb-8">
            <Badge className="mb-6 bg-white/80 text-blue-700 border-blue-200/60 px-4 py-2 text-sm font-medium backdrop-blur-sm shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Crew AI
            </Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {mode === "signin" ? "Welcome back" : "Get Started"}
            </h1>
            <p className="text-slate-600">
              {mode === "signin" 
                ? "Sign in to access your medical AI assistant" 
                : "Create your account and start managing your health"}
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {mode === "signin" 
                  ? "Enter your credentials to access your dashboard" 
                  : "Fill in your details to create a new account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || submitting}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || submitting}
                  className="h-11"
                />
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name (Optional)</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading || submitting}
                    className="h-11"
                  />
                </div>
              )}

              <Button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    if (mode === "signin") {
                      await signIn(email, password);
                    } else {
                      await signUp(email, password, fullName);
                    }
                    navigate("/dashboard");
                  } catch (err: any) {
                    alert(err?.message || "Authentication failed.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={loading || submitting || !email || !password}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {submitting 
                  ? (mode === "signin" ? "Signing in..." : "Creating account...") 
                  : (mode === "signin" ? "Sign In" : "Create Account")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Features Below Card */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="backdrop-blur-sm bg-white/70 rounded-lg p-3 shadow-sm border border-blue-100/60">
              <Brain className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">AI Agents</p>
            </div>
            <div className="backdrop-blur-sm bg-white/70 rounded-lg p-3 shadow-sm border border-blue-100/60">
              <Heart className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">Health Tracking</p>
            </div>
            <div className="backdrop-blur-sm bg-white/70 rounded-lg p-3 shadow-sm border border-blue-100/60">
              <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">Smart Alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
