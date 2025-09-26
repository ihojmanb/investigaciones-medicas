import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { RouteGuard, AuthRoute } from "@/components/auth/RouteGuard";
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
              <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
              <Route path="/" element={<Navigate to="/expenses/new" replace />} />
              <Route 
                path="/expenses/new" 
                element={
                  <RouteGuard>
                    <Layout><ExpenseFormPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/expenses/:id/edit" 
                element={
                  <RouteGuard>
                    <Layout><ExpenseEditPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/patients" 
                element={
                  <RouteGuard>
                    <Layout><PatientsPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/patients/:id" 
                element={
                  <RouteGuard>
                    <Layout><PatientDetailPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/trials" 
                element={
                  <RouteGuard>
                    <Layout><TrialsPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/trials/new" 
                element={
                  <RouteGuard>
                    <Layout><TrialFormPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/trials/:id/edit" 
                element={
                  <RouteGuard>
                    <Layout><TrialEditPage /></Layout>
                  </RouteGuard>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <RouteGuard>
                    <Layout><ReportsPage /></Layout>
                  </RouteGuard>
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
