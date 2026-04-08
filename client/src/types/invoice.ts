export interface InvoiceItem {
  name: string;
  description: string;
  hsnSacCode?: string;
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
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'JPY' | 'CAD' | 'AUD' | 'SGD' | 'CHF' | 'CNY' | 'ZAR' | 'BRL' | 'MXN' | 'KRW' | 'THB' | 'MYR' | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'HKD';
  notes?: string;
  termsAndConditions?: string;
  thankYouNote?: string;
  theme: 'classic' | 'modern' | 'bold';
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
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
