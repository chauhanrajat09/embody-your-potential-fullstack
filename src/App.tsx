import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Exercises from "./pages/Exercises";
import Progress from "./pages/Progress";
import WeightLogger from "./pages/WeightLogger";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage";
import WorkoutHistory from "./pages/WorkoutHistory";
import AuthSuccess from "./pages/auth/success";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Create a client
const queryClient = new QueryClient();

// Protected route component needs to be inside BrowserRouter for useNavigate to work
const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

// Separate component for routes to use useAuth hook
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
    return user ? element : <Navigate to="/auth" replace />;
  };
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/workouts" element={<ProtectedRoute element={<Workouts />} />} />
      <Route path="/exercises" element={<ProtectedRoute element={<Exercises />} />} />
      <Route path="/progress" element={<ProtectedRoute element={<Progress />} />} />
      <Route path="/weight" element={<ProtectedRoute element={<WeightLogger />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
      <Route path="/workout-history" element={<ProtectedRoute element={<WorkoutHistory />} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
