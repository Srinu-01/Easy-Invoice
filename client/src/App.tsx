import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Navigation } from "@/components/navigation";
import { Landing } from "@/pages/landing";
import { InvoiceCreator } from "@/pages/invoice-creator";
import { RecentInvoices } from "@/pages/recent-invoices";
import type { FirebaseInvoice } from "@/lib/firebase";

type Section = "landing" | "invoice-creator" | "recent-invoices";

function App() {
  const [currentSection, setCurrentSection] = useState<Section>("landing");
  const [editingInvoice, setEditingInvoice] = useState<FirebaseInvoice | null>(null);

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setCurrentSection("invoice-creator");
  };

  const handleEditInvoice = (invoice: FirebaseInvoice) => {
    setEditingInvoice(invoice);
    setCurrentSection("invoice-creator");
  };

  const handleShowRecent = () => {
    setCurrentSection("recent-invoices");
  };

  const handleBackToHome = () => {
    setEditingInvoice(null);
    setCurrentSection("landing");
  };

  const handleNavigateHome = () => {
    setEditingInvoice(null);
    setCurrentSection("landing");
  };

  const renderSection = () => {
    switch (currentSection) {
      case "landing":
        return <Landing onCreateInvoice={handleCreateInvoice} />;
      case "invoice-creator":
        return <InvoiceCreator editingInvoice={editingInvoice} onBack={handleBackToHome} />;
      case "recent-invoices":
        return <RecentInvoices onBackToHome={handleBackToHome} onEditInvoice={handleEditInvoice} />;
      default:
        return <Landing onCreateInvoice={handleCreateInvoice} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
            <Navigation 
              onCreateInvoice={handleCreateInvoice}
              onShowRecent={handleShowRecent}
              onNavigateHome={handleNavigateHome}
            />
            <main className="pt-16 sm:pt-18 lg:pt-20">
              {renderSection()}
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
