import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import ExpenseFormPage from "@/pages/ExpenseFormPage";
import ExpenseEditPage from "@/pages/ExpenseEditPage";
import PatientsPage from "@/pages/PatientsPage";
import PatientDetailPage from "@/pages/PatientDetailPage";
import TrialsPage from "@/pages/TrialsPage";
import TrialFormPage from "@/pages/TrialFormPage";
import TrialEditPage from "@/pages/TrialEditPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/expenses/new" replace />} />
              <Route 
                path="/expenses/new" 
                element={
                  <ProtectedRoute>
                    <Layout><ExpenseFormPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/expenses/:id/edit" 
                element={
                  <ProtectedRoute>
                    <Layout><ExpenseEditPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patients" 
                element={
                  <ProtectedRoute>
                    <Layout><PatientsPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patients/:id" 
                element={
                  <ProtectedRoute>
                    <Layout><PatientDetailPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trials" 
                element={
                  <ProtectedRoute>
                    <Layout><TrialsPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trials/new" 
                element={
                  <ProtectedRoute>
                    <Layout><TrialFormPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trials/:id/edit" 
                element={
                  <ProtectedRoute>
                    <Layout><TrialEditPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <Layout><ReportsPage /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
