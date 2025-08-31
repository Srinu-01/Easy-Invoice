export interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  companyName: string;
  companyGST?: string;
  companyAddress?: string;
  logoUrl?: string;
  clientName: string;
  clientEmail?: string;
  clientGST?: string;
  clientAddress?: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  sgstPercent: number;
  cgstPercent: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  currency: 'INR' | 'USD';
  notes?: string;
  termsAndConditions?: string;
  theme: 'classic' | 'modern' | 'bold';
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;
}

export interface InvoiceData extends InvoiceFormData {
  id?: string;
  subtotal: number;
  discountAmount: number;
  sgstAmount: number;
  cgstAmount: number;
  total: number;
  qrCodeUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type InvoiceTheme = 'classic' | 'modern' | 'bold';

export interface ThemeStyles {
  background: string;
  primary: string;
  secondary: string;
  text: string;
  tableHeader: string;
  tableRow: string;
  border: string;
}
