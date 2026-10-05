import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnimatedBackground } from './components/AnimatedBackground';

import { LandingPage } from './pages/LandingPage';
import ServiceSelection from './pages/ServiceSelection';
import FailureInput from './pages/FailureInput';
import { AnalysisExperiencePage } from './pages/AnalysisExperiencePage';
import { ResultsPage } from './pages/ResultsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServiceFailureIntelligencePage } from './pages/ServiceFailureIntelligencePage';
import { HowItWorksPage } from './pages/HowItWorksPage';

import SchemeDiscovery from './pages/SchemeDiscovery';
import SchemeApplication from './pages/SchemeApplication';
import CitizenProfile from './pages/CitizenProfile';
import AuthPage from './pages/AuthPage';
import ApplicationDetails from './pages/ApplicationDetails';
import AdminPanelPage from './pages/AdminPanelPage';
import AuditorDashboardPage from './pages/AuditorDashboardPage';

import { analyzeServiceFailure, AnalysisInput, hydrateStoredAnalysis } from './services/api-client';
import { FailureAnalysis } from './types';

export const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applications } = useAuth();

  const [selectedDomain, setSelectedDomain] = useState<'farmer' | 'scholarship' | 'certificate'>('scholarship');
  const [currentAnalysis, setCurrentAnalysis] = useState<FailureAnalysis | null>(null);

  React.useEffect(() => {
    if (currentAnalysis) return;
    const storedAnalysis = applications.find((application) => application.analysis)?.analysis;
    if (storedAnalysis) setCurrentAnalysis(hydrateStoredAnalysis(storedAnalysis));
  }, [applications, currentAnalysis]);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'landing';
    if (path.startsWith('/select-service') || path.startsWith('/analyze')) return 'service-selection';
    if (path.startsWith('/dashboard') || path.startsWith('/my-analyses')) return 'dashboard';
    if (path.startsWith('/schemes')) return 'schemes';
    if (path.startsWith('/intelligence')) return 'intelligence';
    if (path.startsWith('/how-it-works')) return 'how-it-works';
    if (path.startsWith('/admin')) return 'admin-panel';
    if (path.startsWith('/audit')) return 'auditor-logs';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/auth') || path.startsWith('/signup') || path.startsWith('/login')) return 'auth';
    return 'landing';
  };

  const handleSetActiveTab = (tab: string) => {
    switch (tab) {
      case 'landing':
        navigate('/');
        break;
      case 'service-selection':
        navigate('/select-service');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'schemes':
        navigate('/schemes');
        break;
      case 'intelligence':
        navigate('/intelligence');
        break;
      case 'how-it-works':
        navigate('/how-it-works');
        break;
      case 'admin-panel':
        navigate('/admin');
        break;
      case 'auditor-logs':
        navigate('/audit');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'auth':
        navigate('/auth');
        break;
      default:
        navigate('/');
    }
  };

  const handleStartAnalysis = () => {
    navigate('/select-service');
  };

  const handleExploreHowItWorks = () => {
    navigate('/how-it-works');
  };

  const handleSelectDomain = (domain: 'farmer' | 'scholarship' | 'certificate') => {
    setSelectedDomain(domain);
    navigate(`/analyze/${domain}/describe`);
  };

  const handleSubmitInput = async (input: AnalysisInput) => {
    const result = await analyzeServiceFailure(input);
    setCurrentAnalysis(result);
    navigate('/analysis-experience', { state: { analysis: result } });
  };

  const handleAnalysisAnimationComplete = () => {
    navigate('/results');
  };

  const handleSelectPastAnalysis = (analysis: FailureAnalysis) => {
    setCurrentAnalysis(analysis);
    navigate('/results');
  };

  const handleNewAnalysis = () => {
    navigate('/select-service');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-[#F2F1EC] font-body relative">
      {/* Site-wide Cursor-Responsive Background Animation */}
      <AnimatedBackground />

      {/* Header Bar */}
      <Header activeTab={getActiveTab()} setActiveTab={handleSetActiveTab} />

      {/* Shared Content Container (Constrained Width) */}
      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Content Router View */}
        <main className="flex-1 flex flex-col relative w-full">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <LandingPage
                  onStartAnalysis={handleStartAnalysis}
                  onExploreHowItWorks={handleExploreHowItWorks}
                />
              }
            />

            <Route
              path="/select-service"
              element={<ServiceSelection onSelectDomain={handleSelectDomain} />}
            />

            <Route
              path="/analyze"
              element={
                <FailureInput
                  service={selectedDomain}
                  onSubmitInput={handleSubmitInput}
                />
              }
            />

            <Route
              path="/analyze/:id/describe"
              element={
                <FailureInput
                  service={selectedDomain}
                  onSubmitInput={handleSubmitInput}
                />
              }
            />

            <Route
              path="/analysis-experience"
              element={
                <ProtectedRoute message="Sign in to analyze your application">
                  <AnalysisExperiencePage onComplete={handleAnalysisAnimationComplete} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={currentAnalysis ? (
                <ProtectedRoute message="Sign in to view analysis results">
                  <ResultsPage
                    analysis={currentAnalysis}
                    onNewAnalysis={handleNewAnalysis}
                  />
                </ProtectedRoute>
              ) : <Navigate to="/dashboard" replace />}
            />

            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  onSelectAnalysis={handleSelectPastAnalysis}
                  onNewAnalysis={handleNewAnalysis}
                  currentAnalysis={currentAnalysis}
                />
              }
            />

            <Route
              path="/my-analyses"
              element={
                <DashboardPage
                  onSelectAnalysis={handleSelectPastAnalysis}
                  onNewAnalysis={handleNewAnalysis}
                  currentAnalysis={currentAnalysis}
                />
              }
            />

            <Route
              path="/schemes"
              element={<SchemeDiscovery />}
            />

            <Route
              path="/schemes/:id/apply"
              element={
                <ProtectedRoute message="Sign in to apply to this scheme">
                  <SchemeApplication />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute message="Sign in to view your profile">
                  <CitizenProfile />
                </ProtectedRoute>
              }
            />

            <Route path="/auth" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage initialStep="REGISTER" />} />
            <Route path="/login" element={<AuthPage initialStep="LOGIN" />} />

            <Route
              path="/applications/:id"
              element={
                <ProtectedRoute message="Sign in to view application details">
                  <ApplicationDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/intelligence"
              element={<ServiceFailureIntelligencePage />}
            />

            <Route
              path="/how-it-works"
              element={<HowItWorksPage />}
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute message="Sign in to access the Admin Panel">
                  <AdminPanelPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit"
              element={
                <ProtectedRoute message="Sign in to access the Auditor Dashboard">
                  <AuditorDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer Bar */}
        <Footer />
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
