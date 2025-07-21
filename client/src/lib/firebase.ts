import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import type { InvoiceFormData } from "@/types/invoice";

const firebaseConfig = {
  apiKey: "AIzaSyCgGiHjudm9bSvnFG7MnsC4TwshIA385Q8",
  authDomain: "invoicegenerator-21b78.firebaseapp.com",
  projectId: "invoicegenerator-21b78",
  storageBucket: "invoicegenerator-21b78.firebasestorage.app",
  messagingSenderId: "727100141092",
  appId: "1:727100141092:web:9e0bce8cfb8914b86832b1",
  measurementId: "G-NBVQL5NKJ8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface FirebaseInvoice extends Omit<InvoiceFormData, 'items'> {
  id?: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  sgstAmount: number;
  cgstAmount: number;
  total: number;
  qrCodeUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper function to generate UPI QR code URL with retry mechanism
function generateUPIQRCode(upiId: string, amount: number, name: string, invoiceNumber: string): string {
  if (!upiId) return '';
  
  const upiPaymentString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(`Payment for ${invoiceNumber}`)}`;
  
  // Use a more reliable QR code service with better parameters
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&margin=10&color=000000&bgcolor=FFFFFF&data=${encodeURIComponent(upiPaymentString)}`;
  
  return qrCodeUrl;
}

export async function saveInvoice(invoiceData: InvoiceFormData): Promise<string> {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  const sgstAmount = subtotal * (invoiceData.sgstPercent / 100);
  const cgstAmount = subtotal * (invoiceData.cgstPercent / 100);
  const total = subtotal + sgstAmount + cgstAmount;
  
  // Generate QR code URL if UPI ID is provided
  const qrCodeUrl = invoiceData.upiId ? generateUPIQRCode(
    invoiceData.upiId, 
    total, 
    invoiceData.companyName, 
    invoiceData.invoiceNumber
  ) : '';

  const firebaseData: Omit<FirebaseInvoice, 'id'> = {
    ...invoiceData,
    subtotal,
    sgstAmount,
    cgstAmount,
    total,
    qrCodeUrl,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, "invoices"), firebaseData);
  return docRef.id;
}

export async function getRecentInvoices(limitCount: number = 5): Promise<FirebaseInvoice[]> {
  const q = query(
    collection(db, "invoices"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirebaseInvoice));
}

export async function getInvoiceById(id: string): Promise<FirebaseInvoice | null> {
  const docRef = doc(db, "invoices", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as FirebaseInvoice;
  }
  
  return null;
}

export async function updateInvoice(id: string, invoiceData: InvoiceFormData): Promise<void> {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  const sgstAmount = subtotal * (invoiceData.sgstPercent / 100);
  const cgstAmount = subtotal * (invoiceData.cgstPercent / 100);
  const total = subtotal + sgstAmount + cgstAmount;
  
  // Generate QR code URL if UPI ID is provided
  const qrCodeUrl = invoiceData.upiId ? generateUPIQRCode(
    invoiceData.upiId, 
    total, 
    invoiceData.companyName, 
    invoiceData.invoiceNumber
  ) : '';

  const firebaseData: Omit<FirebaseInvoice, 'id' | 'createdAt'> = {
    ...invoiceData,
    subtotal,
    sgstAmount,
    cgstAmount,
    total,
    qrCodeUrl,
    updatedAt: Timestamp.now(),
  };

  const docRef = doc(db, "invoices", id);
  await updateDoc(docRef, firebaseData);
}

export async function deleteInvoice(id: string): Promise<void> {
  const docRef = doc(db, "invoices", id);
  await deleteDoc(docRef);
}

// Export the helper function for use in other components
export { generateUPIQRCode };
