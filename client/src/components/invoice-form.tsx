import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload, Save, FileText, Printer, Copy } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { saveInvoice, updateInvoice, duplicateInvoice, type FirebaseInvoice, generateUPIQRCode } from "@/lib/firebase";
import { exportToPDF, printInvoice, getCurrencySymbol } from "@/utils/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { invoiceFormSchema, type InvoiceFormData } from "@shared/schema";
import type { InvoiceData } from "@/types/invoice";

interface InvoiceFormProps {
  onDataChange: (data: InvoiceData) => void;
  editingInvoice?: FirebaseInvoice | null;
  onDuplicateSuccess?: (newInvoice: FirebaseInvoice) => void;
}

export function InvoiceForm({ onDataChange, editingInvoice, onDuplicateSuccess }: InvoiceFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFileName, setLogoFileName] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: editingInvoice?.invoiceNumber || generateInvoiceNumber(),
      companyName: editingInvoice?.companyName || "",
      companyGST: editingInvoice?.companyGST || "",
      companyAddress: editingInvoice?.companyAddress || "",
      logoUrl: editingInvoice?.logoUrl || "",
      clientName: editingInvoice?.clientName || "",
      clientEmail: editingInvoice?.clientEmail || "",
      clientGST: editingInvoice?.clientGST || "",
      clientAddress: editingInvoice?.clientAddress || "",
      invoiceDate: editingInvoice?.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: editingInvoice?.dueDate || (() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
      })(),
      items: editingInvoice?.items || [{ name: "", description: "", quantity: 1, rate: "" as unknown as number, amount: 0 }],
      sgstPercent: editingInvoice?.sgstPercent ?? 9,
      cgstPercent: editingInvoice?.cgstPercent ?? 9,
      discountType: editingInvoice?.discountType || "percentage",
      discountValue: editingInvoice?.discountValue ?? 0,
      currency: editingInvoice?.currency || "INR",
      notes: editingInvoice?.notes || "",
      termsAndConditions: editingInvoice?.termsAndConditions || "",
      thankYouNote: editingInvoice?.thankYouNote || "Thank you for choosing DREAM TEAM SERVICES. We are committed to delivering high-quality services. Please feel free to reach out for any clarifications during the Project.",
      theme: editingInvoice?.theme || "classic",
      bankName: editingInvoice?.bankName || "",
      accountNumber: editingInvoice?.accountNumber || "",
      ifscCode: editingInvoice?.ifscCode || "",
      swiftCode: editingInvoice?.swiftCode || "BARBINBBKKD",
      branchName: editingInvoice?.branchName || "",
      upiId: editingInvoice?.upiId || ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchedValues = form.watch();

  // Calculate totals and update parent component
  useEffect(() => {
    const items = watchedValues.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item?.amount || 0), 0);
    
    // Calculate discount
    let discountAmount = 0;
    const discountValue = watchedValues.discountValue ?? 0;
    const discountType = watchedValues.discountType || "percentage";
    
    if (discountValue > 0) {
      if (discountType === "percentage") {
        discountAmount = subtotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }
    
    const discountedSubtotal = subtotal - discountAmount;
    const sgstAmount = discountedSubtotal * ((watchedValues.sgstPercent || 0) / 100);
    const cgstAmount = discountedSubtotal * ((watchedValues.cgstPercent || 0) / 100);
    const total = discountedSubtotal + sgstAmount + cgstAmount;

    // Generate QR code URL only for INR currency with UPI ID
    const qrCodeUrl = (watchedValues.currency === 'INR' && watchedValues.upiId) ? generateUPIQRCode(
      watchedValues.upiId,
      total,
      watchedValues.companyName || 'Company',
      watchedValues.invoiceNumber || 'INV-001'
    ) : '';

    const invoiceData: InvoiceData = {
      ...watchedValues,
      discountType: discountType as 'percentage' | 'fixed',
      discountValue: discountValue,
      currency: (watchedValues.currency || 'INR') as InvoiceData['currency'],
      items: items.filter(item => item?.name || item?.description),
      subtotal,
      discountAmount,
      sgstAmount,
      cgstAmount,
      total,
      qrCodeUrl
    };

    onDataChange(invoiceData);
  }, [watchedValues, onDataChange]);

  function generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-4);
    return `INV-${year}${month}${day}-${time}`;
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLogoFileName("Uploading...");

    try {
      const result = await uploadToCloudinary(file);
      form.setValue("logoUrl", result.secure_url);
      setLogoFileName(file.name);
      toast({
        title: "Success",
        description: "Logo uploaded successfully!",
      });
    } catch (error) {
      console.error("Logo upload failed:", error);
      setLogoFileName("Upload failed");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload logo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const addItem = () => {
    append({ name: "", description: "", quantity: 1, rate: "" as unknown as number, amount: 0 });
  };

  const calculateItemAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`) || 0;
    const rate = form.getValues(`items.${index}.rate`) || 0;
    const amount = quantity * rate;
    form.setValue(`items.${index}.amount`, amount);
  };

  const handleSaveInvoice = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSaving(true);
    try {
      const formData = form.getValues();
      if (editingInvoice?.id) {
        await updateInvoice(editingInvoice.id, formData);
        toast({
          title: "Success",
          description: "Invoice updated successfully!",
        });
      } else {
        const invoiceId = await saveInvoice(formData);
        toast({
          title: "Success",
          description: "Invoice saved successfully!",
        });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingInvoice?.id ? 'update' : 'save'} invoice. Please try again.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      const formData = form.getValues();
      const items = formData.items.filter(item => item.name || item.description);
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      
      // Calculate discount
      let discountAmount = 0;
      const discountValue = formData.discountValue ?? 0;
      const discountType = formData.discountType || "percentage";
      
      if (discountValue > 0) {
        if (discountType === "percentage") {
          discountAmount = subtotal * (discountValue / 100);
        } else {
          discountAmount = discountValue;
        }
      }
      
      const discountedSubtotal = subtotal - discountAmount;
      const sgstAmount = discountedSubtotal * ((formData.sgstPercent ?? 9) / 100);
      const cgstAmount = discountedSubtotal * ((formData.cgstPercent ?? 9) / 100);
      const total = discountedSubtotal + sgstAmount + cgstAmount;

      // Generate QR code URL only for INR currency with UPI ID
      const qrCodeUrl = (formData.currency === 'INR' && formData.upiId) ? generateUPIQRCode(
        formData.upiId,
        total,
        formData.companyName,
        formData.invoiceNumber
      ) : '';

      const invoiceData: InvoiceData = {
        ...formData,
        discountType: discountType as 'percentage' | 'fixed',
        discountValue: discountValue,
        currency: (formData.currency || 'INR') as InvoiceData['currency'],
        items,
        subtotal,
        discountAmount,
        sgstAmount,
        cgstAmount,
        total,
        qrCodeUrl
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

  const handlePrint = () => {
    const isValid = form.formState.isValid;
    if (!isValid) return;

    try {
      const formData = form.getValues();
      const items = formData.items.filter(item => item.name || item.description);
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      
      // Calculate discount
      let discountAmount = 0;
      const discountValue = formData.discountValue ?? 0;
      const discountType = formData.discountType || "percentage";
      
      if (discountValue > 0) {
        if (discountType === "percentage") {
          discountAmount = subtotal * (discountValue / 100);
        } else {
          discountAmount = discountValue;
        }
      }
      
      const discountedSubtotal = subtotal - discountAmount;
      const sgstAmount = discountedSubtotal * ((formData.sgstPercent ?? 9) / 100);
      const cgstAmount = discountedSubtotal * ((formData.cgstPercent ?? 9) / 100);
      const total = discountedSubtotal + sgstAmount + cgstAmount;

      // Generate QR code URL only for INR currency with UPI ID
      const qrCodeUrl = (formData.currency === 'INR' && formData.upiId) ? generateUPIQRCode(
        formData.upiId,
        total,
        formData.companyName,
        formData.invoiceNumber
      ) : '';

      const invoiceData: InvoiceData = {
        ...formData,
        discountType: discountType as 'percentage' | 'fixed',
        discountValue: discountValue,
        currency: (formData.currency || 'INR') as InvoiceData['currency'],
        items,
        subtotal,
        discountAmount,
        sgstAmount,
        cgstAmount,
        total,
        qrCodeUrl
      };

      // Show loading toast
      toast({
        title: "Preparing Invoice",
        description: "Loading images and preparing invoice for printing...",
      });

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

  const handleDuplicateInvoice = async () => {
    if (!editingInvoice?.id) return;

    try {
      toast({
        title: "Duplicating Invoice",
        description: "Creating a copy of the invoice...",
      });
      
      const newInvoiceId = await duplicateInvoice(editingInvoice.id);
      
      toast({
        title: "Success",
        description: "Invoice duplicated successfully! The form has been updated with the new invoice data.",
      });
      
      // If there's a callback, fetch the new invoice and call it
      if (onDuplicateSuccess) {
        // We would need to fetch the new invoice, but for now let's just create a mock one
        // In a real scenario, you might want to fetch it from the database
        const newInvoice: FirebaseInvoice = {
          ...editingInvoice,
          id: newInvoiceId
        };
        onDuplicateSuccess(newInvoice);
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

  return (
    <div className="space-y-8">
      <Form {...form}>
        {/* Step 1: Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Ltd." {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyGST"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">GST Number</FormLabel>
                    <FormControl>
                      <Input placeholder="22AAAAA0000A1Z5" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Company Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="123 Business Street, City, State, 12345" {...field} className="text-sm sm:text-base min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel className="text-sm sm:text-base">Company Logo</FormLabel>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logoUpload')?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto text-sm"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Choose Logo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue("logoUrl", "/logo.png");
                    setLogoFileName("easy-invoice-logo.png");
                  }}
                  disabled={isUploading}
                  className="w-full sm:w-auto text-sm"
                >
                  Use Easy Invoice Logo
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                  {logoFileName || "No file chosen"}
                </span>
                <input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Company Inc." {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Client Email</FormLabel>
                    <FormControl>
                      <Input placeholder="client@company.com" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="clientGST"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Client GST Number</FormLabel>
                    <FormControl>
                      <Input placeholder="27ABCDE1234F1Z5" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="clientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Client Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="456 Client Street, City, State, 67890" {...field} className="text-sm sm:text-base min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Step 3: Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Invoice Number</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-001" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="invoiceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Items Section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                <h4 className="text-base sm:text-lg font-semibold">Invoice Items</h4>
                <Button type="button" onClick={addItem} className="w-full sm:w-auto text-sm">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 sm:p-4 bg-muted rounded-lg space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Digital Ads" {...field} className="text-sm sm:text-base" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Social Media campaign for 30 days" {...field} className="text-sm sm:text-base min-h-[60px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  calculateItemAmount(index);
                                }}
                                className="text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Rate ({getCurrencySymbol(watchedValues.currency || 'INR')})</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                value={field.value === 0 && !document.activeElement?.isSameNode(document.querySelector(`[name="items.${index}.rate"]`)) ? '' : field.value}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  field.onChange(val);
                                  calculateItemAmount(index);
                                }}
                                className="text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Amount ({getCurrencySymbol(watchedValues.currency || 'INR')})</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                readOnly
                                {...field}
                                className="bg-muted text-sm sm:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="w-full h-9 sm:h-10 text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sm:hidden ml-1">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax, Discount and Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="sgstPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">SGST (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="9"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cgstPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">CGST (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="9"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">
                      Discount {(watchedValues.discountType || 'percentage') === 'percentage' ? '(%)' : `(${getCurrencySymbol(watchedValues.currency || 'INR')})`}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Currency</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.trigger();
                      }} 
                      value={field.value || 'INR'}
                    >
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                        <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">€ EUR (Euro)</SelectItem>
                        <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                        <SelectItem value="AED">د.إ AED (UAE Dirham)</SelectItem>
                        <SelectItem value="SAR">﷼ SAR (Saudi Riyal)</SelectItem>
                        <SelectItem value="JPY">¥ JPY (Japanese Yen)</SelectItem>
                        <SelectItem value="CAD">$ CAD (Canadian Dollar)</SelectItem>
                        <SelectItem value="AUD">$ AUD (Australian Dollar)</SelectItem>
                        <SelectItem value="SGD">$ SGD (Singapore Dollar)</SelectItem>
                        <SelectItem value="CHF">CHF (Swiss Franc)</SelectItem>
                        <SelectItem value="CNY">¥ CNY (Chinese Yuan)</SelectItem>
                        <SelectItem value="ZAR">R ZAR (South African Rand)</SelectItem>
                        <SelectItem value="BRL">R$ BRL (Brazilian Real)</SelectItem>
                        <SelectItem value="MXN">$ MXN (Mexican Peso)</SelectItem>
                        <SelectItem value="KRW">₩ KRW (South Korean Won)</SelectItem>
                        <SelectItem value="THB">฿ THB (Thai Baht)</SelectItem>
                        <SelectItem value="MYR">RM MYR (Malaysian Ringgit)</SelectItem>
                        <SelectItem value="NZD">$ NZD (New Zealand Dollar)</SelectItem>
                        <SelectItem value="SEK">kr SEK (Swedish Krona)</SelectItem>
                        <SelectItem value="NOK">kr NOK (Norwegian Krone)</SelectItem>
                        <SelectItem value="DKK">kr DKK (Danish Krone)</SelectItem>
                        <SelectItem value="HKD">$ HKD (Hong Kong Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-sm sm:text-base">
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Thank you for your business!" {...field} className="text-sm sm:text-base min-h-[80px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Terms and Conditions</FormLabel>
                  <div className="mb-2">
                    <Select
                      onValueChange={(value) => {
                        if (value === "template1") {
                          field.onChange("Full payment must be completed before any work begins for Dream Team Services. Meta Ad spend is separate and not included in this service fee.");
                        } else if (value === "template2") {
                          field.onChange("50% of the payment is required upfront before work begins. Once the work is completed, please make the complete remaining payment to finalize the project.");
                        } else if (value === "template3") {
                          field.onChange("1. Payment is due within 30 days of invoice date.\n2. Late payments may incur additional charges.\n3. All disputes must be reported within 7 days.\n4. Meta Ad spend is separate and not included in this service fee.");
                        }
                      }}
                    >
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue placeholder="Choose a predefined template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="template1">Full Payment Required Before Work</SelectItem>
                        <SelectItem value="template2">50% Advance Payment Required</SelectItem>
                        <SelectItem value="template3">Standard Net 30 Terms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="1. Payment is due within 30 days of invoice date.&#10;2. Late payments may incur additional charges.&#10;3. All disputes must be reported within 7 days." 
                      rows={4}
                      {...field} 
                      className="text-sm sm:text-base min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thankYouNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Thank You Note</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Thank you for choosing our services..." 
                      rows={3}
                      {...field} 
                      className="text-sm sm:text-base min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Step 4: Bank Details & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              Bank Details & Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="State Bank of India" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">{watchedValues.currency === 'INR' ? 'IFSC Code' : 'IFSC Code (if applicable)'}</FormLabel>
                    <FormControl>
                      <Input placeholder="SBIN0001234" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">SWIFT Code</FormLabel>
                    <FormControl>
                      <Input placeholder="BARBINBBKKD" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="branchName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Branch" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {watchedValues.currency === 'INR' && (
              <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base">UPI ID (for QR Code)</FormLabel>
                    <FormControl>
                      <Input placeholder="yourname@paytm" {...field} className="text-sm sm:text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            type="button"
            onClick={handleSaveInvoice}
            disabled={isSaving}
            className="flex-1 text-sm sm:text-base"
          >
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            {isSaving ? 
              (editingInvoice?.id ? "Updating..." : "Saving...") : 
              (editingInvoice?.id ? "Update Invoice" : "Save Invoice")
            }
          </Button>
          {editingInvoice?.id && (
            <Button
              type="button"
              onClick={handleDuplicateInvoice}
              variant="secondary"
              className="flex-1 text-sm sm:text-base"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Duplicate Invoice
            </Button>
          )}
          <Button
            type="button"
            onClick={handleExportPDF}
            variant="secondary"
            className="flex-1 text-sm sm:text-base"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            variant="outline"
            className="flex-1 text-sm sm:text-base"
          >
            <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Print
          </Button>
        </div>
      </Form>
    </div>
  );
}
