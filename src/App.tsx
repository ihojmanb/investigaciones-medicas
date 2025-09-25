import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
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
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/expenses/new" replace />} />
            <Route path="/expenses/new" element={<Layout><ExpenseFormPage /></Layout>} />
            <Route path="/expenses/:id/edit" element={<Layout><ExpenseEditPage /></Layout>} />
            <Route path="/patients" element={<Layout><PatientsPage /></Layout>} />
            <Route path="/patients/:id" element={<Layout><PatientDetailPage /></Layout>} />
            <Route path="/trials" element={<Layout><TrialsPage /></Layout>} />
            <Route path="/trials/new" element={<Layout><TrialFormPage /></Layout>} />
            <Route path="/trials/:id/edit" element={<Layout><TrialEditPage /></Layout>} />
            <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
