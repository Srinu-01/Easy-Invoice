import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Download, Printer, Eye, Edit, Trash2, Copy } from "lucide-react";
import { getRecentInvoices, deleteInvoice, duplicateInvoice, type FirebaseInvoice } from "@/lib/firebase";
import { exportToPDF, printInvoice } from "@/utils/pdf-export";
import { InvoicePreview } from "@/components/invoice-preview";
import { useToast } from "@/hooks/use-toast";
import type { InvoiceData } from "@/types/invoice";

interface RecentInvoicesProps {
  onBackToHome: () => void;
  onEditInvoice: (invoice: FirebaseInvoice) => void;
  onDuplicateInvoice: (invoice: FirebaseInvoice) => void;
}

export function RecentInvoices({ onBackToHome, onEditInvoice, onDuplicateInvoice }: RecentInvoicesProps) {
  const [invoices, setInvoices] = useState<FirebaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await getRecentInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load invoices. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: FirebaseInvoice) => {
    const invoiceData: InvoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      companyName: invoice.companyName,
      companyGST: invoice.companyGST,
      companyAddress: invoice.companyAddress,
      logoUrl: invoice.logoUrl,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientGST: invoice.clientGST,
      clientAddress: invoice.clientAddress,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      items: invoice.items,
      sgstPercent: invoice.sgstPercent,
      cgstPercent: invoice.cgstPercent,
      notes: invoice.notes,
      termsAndConditions: invoice.termsAndConditions,
      theme: invoice.theme,
      subtotal: invoice.subtotal,
      sgstAmount: invoice.sgstAmount,
      cgstAmount: invoice.cgstAmount,
      total: invoice.total,
      bankName: invoice.bankName,
      accountNumber: invoice.accountNumber,
      ifscCode: invoice.ifscCode,
      branchName: invoice.branchName,
      upiId: invoice.upiId,
      qrCodeUrl: invoice.qrCodeUrl,
      createdAt: invoice.createdAt.toDate(),
      updatedAt: invoice.updatedAt.toDate()
    };
    setSelectedInvoice(invoiceData);
    setShowDialog(true);
  };

  const handleExportPDF = async (invoice: FirebaseInvoice) => {
    try {
      const invoiceData: InvoiceData = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.companyName,
        companyGST: invoice.companyGST,
        companyAddress: invoice.companyAddress,
        logoUrl: invoice.logoUrl,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientGST: invoice.clientGST,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        items: invoice.items,
        sgstPercent: invoice.sgstPercent,
        cgstPercent: invoice.cgstPercent,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        theme: invoice.theme,
        subtotal: invoice.subtotal,
        sgstAmount: invoice.sgstAmount,
        cgstAmount: invoice.cgstAmount,
        total: invoice.total,
        bankName: invoice.bankName,
        accountNumber: invoice.accountNumber,
        ifscCode: invoice.ifscCode,
        branchName: invoice.branchName,
        upiId: invoice.upiId,
        qrCodeUrl: invoice.qrCodeUrl
      };
      await exportToPDF(invoiceData);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export PDF. Please try again.",
      });
    }
  };

  const handlePrint = (invoice: FirebaseInvoice) => {
    try {
      // Show loading toast
      toast({
        title: "Preparing Invoice",
        description: "Loading images and preparing invoice for printing...",
      });

      const invoiceData: InvoiceData = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.companyName,
        companyGST: invoice.companyGST,
        companyAddress: invoice.companyAddress,
        logoUrl: invoice.logoUrl,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientGST: invoice.clientGST,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        items: invoice.items,
        sgstPercent: invoice.sgstPercent,
        cgstPercent: invoice.cgstPercent,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        theme: invoice.theme,
        subtotal: invoice.subtotal,
        sgstAmount: invoice.sgstAmount,
        cgstAmount: invoice.cgstAmount,
        total: invoice.total,
        bankName: invoice.bankName,
        accountNumber: invoice.accountNumber,
        ifscCode: invoice.ifscCode,
        branchName: invoice.branchName,
        upiId: invoice.upiId,
        qrCodeUrl: invoice.qrCodeUrl
      };
      printInvoice(invoiceData);
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print invoice. Please try again.",
      });
    }
  };

  const handleDeleteInvoice = async (invoice: FirebaseInvoice) => {
    try {
      await deleteInvoice(invoice.id!);
      toast({
        title: "Success",
        description: "Invoice deleted successfully!",
      });
      // Reload invoices after deletion
      loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
      });
    }
  };

  const handleDuplicateInvoice = async (invoice: FirebaseInvoice) => {
    try {
      toast({
        title: "Duplicating Invoice",
        description: "Creating a copy of the invoice...",
      });
      
      const newInvoiceId = await duplicateInvoice(invoice.id!);
      
      toast({
        title: "Success",
        description: "Invoice duplicated successfully! Redirecting to edit the new invoice.",
      });
      
      // Reload invoices to show the new duplicate
      await loadInvoices();
      
      // Find the newly created invoice and navigate to edit it
      const updatedInvoices = await getRecentInvoices();
      const newInvoice = updatedInvoices.find(inv => inv.id === newInvoiceId);
      if (newInvoice) {
        onDuplicateInvoice(newInvoice);
      }
    } catch (error) {
      console.error("Error duplicating invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate invoice. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Loading invoices...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">Recent Invoices</h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 px-4">View and manage your previously created invoices</p>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">No invoices found</h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 px-4">Create your first invoice to see it here.</p>
            <Button onClick={onBackToHome} className="text-sm sm:text-base">Create First Invoice</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">{invoice.invoiceNumber}</h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 truncate">{invoice.clientName}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs sm:text-sm shrink-0">
                      Saved
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{invoice.invoiceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">₹{invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 space-y-2">
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => onEditInvoice(invoice)}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm h-8 sm:h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => handleDuplicateInvoice(invoice)}
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Copy</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs sm:text-sm h-8 sm:h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[90vw] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base">
                              This action cannot be undone. This will permanently delete the invoice "{invoice.invoiceNumber}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                            <AlertDialogCancel className="text-sm sm:text-base">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteInvoice(invoice)}
                              className="bg-red-600 hover:bg-red-700 text-sm sm:text-base"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="grid grid-cols-2 gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => handleExportPDF(invoice)}
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">PDF</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                        onClick={() => handlePrint(invoice)}
                      >
                        <Printer className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Print</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button onClick={onBackToHome} variant="outline" size="lg" className="text-sm sm:text-base">
            ← Back to Home
          </Button>
        </div>

        {/* Invoice View Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="w-[95vw] sm:w-[90vw] max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="py-2 sm:py-4">
                <div className="transform scale-75 sm:scale-90 lg:scale-100 origin-top">
                  <InvoicePreview data={selectedInvoice} />
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                onClick={() => selectedInvoice && exportToPDF(selectedInvoice)}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base"
                onClick={() => {
                  if (selectedInvoice) {
                    toast({
                      title: "Preparing Invoice",
                      description: "Loading images and preparing invoice for printing...",
                    });
                    printInvoice(selectedInvoice);
                  }
                }}
              >
                <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Print
              </Button>
              {selectedInvoice && (
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto text-sm sm:text-base"
                  onClick={() => {
                    // Find the corresponding FirebaseInvoice for this InvoiceData
                    const correspondingInvoice = invoices.find(inv => inv.id === selectedInvoice.id);
                    if (correspondingInvoice) {
                      setShowDialog(false);
                      handleDuplicateInvoice(correspondingInvoice);
                    }
                  }}
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Duplicate
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
