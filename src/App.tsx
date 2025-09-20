import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
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
  
  // Clean slate for testing progress calculation
  const initialData = {}
  
  return (
    <ExpenseForm 
      initialData={initialData}
      onSubmit={handleSubmit}
      onSave={handleSave}
    />
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
