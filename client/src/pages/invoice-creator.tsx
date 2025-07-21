import { useState } from "react";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreview } from "@/components/invoice-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { printInvoice } from "@/utils/pdf-export";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceData } from "@/types/invoice";
import type { FirebaseInvoice } from "@/lib/firebase";

interface InvoiceCreatorProps {
  editingInvoice?: FirebaseInvoice | null;
  onBack?: () => void;
}

export function InvoiceCreator({ editingInvoice, onBack }: InvoiceCreatorProps) {
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: editingInvoice?.invoiceNumber || "",
    companyName: editingInvoice?.companyName || "",
    companyGST: editingInvoice?.companyGST || "",
    companyAddress: editingInvoice?.companyAddress || "",
    logoUrl: editingInvoice?.logoUrl || "",
    clientName: editingInvoice?.clientName || "",
    clientEmail: editingInvoice?.clientEmail || "",
    clientAddress: editingInvoice?.clientAddress || "",
    invoiceDate: editingInvoice?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: editingInvoice?.dueDate || new Date().toISOString().split('T')[0],
    items: editingInvoice?.items || [],
    sgstPercent: editingInvoice?.sgstPercent || 9,
    cgstPercent: editingInvoice?.cgstPercent || 9,
    notes: editingInvoice?.notes || "",
    termsAndConditions: editingInvoice?.termsAndConditions || "",
    theme: editingInvoice?.theme || "classic",
    subtotal: editingInvoice?.subtotal || 0,
    sgstAmount: editingInvoice?.sgstAmount || 0,
    cgstAmount: editingInvoice?.cgstAmount || 0,
    total: editingInvoice?.total || 0,
    bankName: editingInvoice?.bankName || "",
    accountNumber: editingInvoice?.accountNumber || "",
    ifscCode: editingInvoice?.ifscCode || "",
    branchName: editingInvoice?.branchName || "",
    upiId: editingInvoice?.upiId || "",
    qrCodeUrl: editingInvoice?.qrCodeUrl || "",
    id: editingInvoice?.id
  });

  const handlePrintInvoice = () => {
    try {
      // Show loading toast
      toast({
        title: "Preparing Invoice",
        description: "Loading images and preparing invoice for printing...",
      });

      printInvoice(invoiceData);
    } catch (error) {
      console.error('Error printing invoice:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print invoice. Please try again.",
      });
    }
  };

  return (
    <section className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          {onBack && (
            <div className="mb-4 text-left">
              <Button variant="outline" onClick={onBack} className="text-sm sm:text-base">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Invoices</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 px-4">
            {editingInvoice ? 'Update the invoice details below' : 'Fill in the details below to generate your professional invoice'}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12">
          {/* Form Section */}
          <div className="order-2 xl:order-1">
            <InvoiceForm onDataChange={setInvoiceData} editingInvoice={editingInvoice} />
          </div>

          {/* Preview Section */}
          <div className="order-1 xl:order-2 xl:sticky xl:top-24 xl:h-fit xl:max-h-[calc(100vh-6rem)]">
            <Card className="xl:overflow-hidden">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl text-center sm:text-left flex-1">Live Preview</CardTitle>
                  <Button 
                    onClick={handlePrintInvoice}
                    size="sm"
                    className="w-full sm:w-auto text-sm"
                  >
                    <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Print Invoice</span>
                    <span className="sm:hidden">Print</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="xl:overflow-y-auto xl:max-h-[calc(100vh-12rem)] p-2 sm:p-6">
                <div className="transform scale-75 sm:scale-90 lg:scale-100 origin-top">
                  <InvoicePreview data={invoiceData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
