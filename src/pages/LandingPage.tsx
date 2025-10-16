import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Pill, 
  MessageSquare, 
  Bell, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  Heart,
  Brain,
  Target,
  TrendingUp,
  Package,
  Sparkles,
  Shield,
  Activity,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'Medical Agentic AI System',
      description: 'Multi-agent architecture with specialized agents: Vision Parser, Schedule Optimizer, Interaction Checker, and Alert Generator working autonomously.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Activity,
      title: 'Comprehensive Health Tracking',
      description: 'Unified platform for medications, vitals, symptoms, and wellness. AI connects the dots across your entire health profile with autonomous monitoring.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      icon: Target,
      title: 'Intelligent Drug Interaction Alerts',
      description: 'AI agents automatically check for drug-drug interactions, contraindications, and safety issues. Proactive warnings before potential problems.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Users,
      title: 'Autonomous Care Coordination',
      description: 'AI generates caregiver digests, manages schedules, tracks adherence, and sends intelligent alerts. Reduces cognitive load on patients and families.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const stats = [
    { number: '24/7', label: 'AI Health Agents', icon: Brain, color: 'text-blue-600' },
    { number: 'Proactive', label: 'Health Monitoring', icon: Target, color: 'text-emerald-600' },
    { number: 'Autonomous', label: 'Care Management', icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">VitalWise</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="text-slate-700 hover:text-slate-900"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/40 min-h-screen flex items-center pt-20">
        {/* Animated Background - Flowing Waves */}
        <div className="absolute inset-0">
          {/* Large flowing waves */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
              {/* Background waves */}
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
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              className="mb-8 bg-white/80 text-blue-700 hover:bg-blue-50/80 border-blue-200/60 px-4 py-2 text-sm font-medium backdrop-blur-sm shadow-sm cursor-pointer"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started - It's Free!
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-sans tracking-tight text-slate-900 mb-8">
              Your personal
              <span className="italic bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent"> medical agentic AI </span>
              for complete health management
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-900 mb-12 max-w-3xl mx-auto leading-relaxed font-thin">
              Multi-agent AI system that autonomously manages medications, monitors vitals, checks drug interactions, 
              and coordinates care. From prescription parsing to caregiver communication—your 24/7 medical companion.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                onClick={() => navigate('/auth')}
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-blue-300/60 text-blue-700 hover:bg-blue-50/60 px-8 py-4 text-lg font-medium rounded-lg backdrop-blur-sm bg-white/60"
                onClick={() => navigate('/inventory')}
              >
                <Brain className="w-5 h-5 mr-2" />
                <span>Try Demo</span>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600 text-sm">
              <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/70 px-4 py-2 rounded-full shadow-sm border border-blue-100/60">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Multi-Agent AI</span>
              </div>
              <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/70 px-4 py-2 rounded-full shadow-sm border border-blue-100/60">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span>Privacy First</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-6 group-hover:scale-110 transition-transform duration-200">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-4xl font-serif text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
              <Brain className="w-4 h-4 mr-2" />
              Medical Agentic AI Platform
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-serif italic text-slate-900 mb-6">
              the future of autonomous healthcare
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              An intelligent multi-agent system that doesn't just respond—it thinks, learns, and acts on your behalf. 
              Proactive health management that anticipates your needs before you ask.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-6">
                  <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl font-sans text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-serif italic text-slate-900 mb-6">
              How your AI agents work
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Autonomous intelligence that evolves with your health journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {[
              {
                step: '01',
                title: 'Upload Prescription',
                description: ' Vision Agent extracts medication details from images/PDFs. Schedule Optimizer automatically generates 30-day reminders.',
                icon: Pill,
                color: 'bg-blue-500'
              },
              {
                step: '02',
                title: 'Autonomous Monitoring',
                description: 'Interaction Checker validates drug safety. Alert Generator creates warnings. Refill Manager tracks inventory. All agents work 24/7.',
                icon: Brain,
                color: 'bg-emerald-500'
              },
              {
                step: '03',
                title: 'Proactive Care',
                description: 'Chat with AI, log vitals, track adherence. Caregiver Communication Agent sends automated health digests to your family.',
                icon: Target,
                color: 'bg-purple-500'
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <Badge className="absolute -top-2 -right-2 bg-slate-900 text-white border-0 text-sm font-bold px-3 py-1">
                    {step.step}
                  </Badge>
                </div>
                <h3 className="text-2xl font-medium text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Chat Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Brain className="w-4 h-4 mr-2" />
              Agentic Intelligence
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-serif italic text-slate-900 mb-6">
              AI agents that think, learn, and act
            </h2>
            <p className="text-xl text-slate-600">
              Beyond conversation—autonomous health management with context and memory
            </p>
          </div>

          <Card className="bg-white shadow-2xl rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl rounded-tr-sm max-w-xs">
                    <p className="text-sm">I took my Lisinopril</p>
                  </div>
                </div>
                
                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl rounded-tl-sm max-w-xs">
                    <p className="text-sm">✅ Recorded! You took 1 pill(s) of Lisinopril. I've updated your inventory.</p>
                  </div>
                </div>

                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl rounded-tr-sm max-w-xs">
                    <p className="text-sm">I have 250 Aspirin pills</p>
                  </div>
                </div>
                
                {/* AI response */}
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl rounded-tl-sm max-w-xs">
                    <p className="text-sm">✅ Updated! Your Aspirin inventory is now 250 pills. That's about 250 days of supply.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-600 text-sm">
                  Powered by <span className="font-semibold">Agentic</span> intelligence and autonomous reasoning
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Alert System Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-serif italic text-slate-900 mb-6">
              Autonomous AI agent capabilities
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Specialized agents working together for comprehensive health management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue/30 bg-blue/5 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">🧠 Vision Parser & Scheduler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Crew AI Vision Agent extracts medication details from prescriptions. Schedule Optimizer generates 30-day reminders automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange/30 bg-orange/5 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-600">🛡️ Interaction Checker</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Validates drug-drug interactions and safety contraindications. Proactively alerts before potential problems arise.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple/30 bg-purple/5 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-600">👥 Caregiver Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Synthesizes daily health digests for caregivers. Converts technical data into plain-language summaries automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 mx-auto md:gap-x-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-slate-900">VitalWise</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                AI-powered medication inventory management helping patients worldwide 
                stay on track with their health.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Platform</h3>
              <ul className="space-y-3 text-slate-600">
                <li>
                  <button onClick={() => navigate('/inventory')} className="hover:text-slate-900 transition-colors">
                    Medication Inventory
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/dashboard')} className="hover:text-slate-900 transition-colors">
                    Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/prescriptions/upload')} className="hover:text-slate-900 transition-colors">
                    Upload Prescription
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-4">Features</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="hover:text-slate-900 transition-colors cursor-pointer">AI Chat Assistant</li>
                <li className="hover:text-slate-900 transition-colors cursor-pointer">Smart Alerts</li>
                <li className="hover:text-slate-900 transition-colors cursor-pointer">DOS Calculation</li>
                <li className="hover:text-slate-900 transition-colors cursor-pointer">Refill Tracking</li>
              </ul>
            </div>
            
          </div>
          
          <Separator className="mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-600">
            <p>&copy; 2025 VitalWise Agent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

