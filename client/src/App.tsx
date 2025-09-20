import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ExpenseForm from "@/components/ExpenseForm";
import NotFound from "@/pages/not-found";

function HomePage() {
  const handleSubmit = async (data: any) => {
    console.log('Form submitted:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const handleSave = (data: any) => {
    console.log('Form saved as draft:', data)
  }
  
  // Pre-populate with some demo data for better UX demonstration
  const initialData = {
    patient: "Arce Mercado, Julia",
    study: "MK-053",
    visit: "d",
    visitDate: new Date("2025-09-25"),
    transportAmount: "45.50"
  }
  
  return (
    <ExpenseForm 
      initialData={initialData}
      onSubmit={handleSubmit}
      onSave={handleSave}
    />
  )
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage}/>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
