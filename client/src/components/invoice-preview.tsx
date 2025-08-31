import { memo } from "react";
import type { InvoiceData } from "@/types/invoice";
import { getThemeStyles, getCurrencySymbol } from "@/utils/pdf-export";

interface InvoicePreviewProps {
  data: InvoiceData;
  className?: string;
}

export const InvoicePreview = memo(function InvoicePreview({ data, className = "" }: InvoicePreviewProps) {
  const themeStyles = getThemeStyles(data.theme);
  const currencySymbol = getCurrencySymbol(data.currency);

  return (
    <div className={`bg-white rounded-lg shadow-xl transform transition-all duration-300 hover:rotate-1 ${className}`} style={{ minHeight: '600px' }}>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
          <div>
            {data.logoUrl && (
              <img src={data.logoUrl} alt="Logo" className="h-12 sm:h-16 mb-3 sm:mb-4 object-contain" />
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-sm sm:text-base text-gray-600">{data.invoiceNumber || 'INV-XXX'}</p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Invoice Date:</div>
            <div className="font-semibold text-sm sm:text-base text-gray-800 mb-2 sm:mb-0">{data.invoiceDate || new Date().toISOString().split('T')[0]}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-2 mb-1">Due Date:</div>
            <div className="font-semibold text-sm sm:text-base text-gray-800">{data.dueDate || new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Company & Client Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2">From:</h3>
            <div className="text-gray-700">
              <div className="font-semibold text-sm sm:text-base">{data.companyName || 'Your Company'}</div>
              {data.companyGST && <div className="text-xs sm:text-sm">GST: {data.companyGST}</div>}
              <div className="text-xs sm:text-sm whitespace-pre-line">{data.companyAddress || 'Company Address'}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-2">To:</h3>
            <div className="text-gray-700">
              <div className="font-semibold text-sm sm:text-base">{data.clientName || 'Client Name'}</div>
              {data.clientEmail && <div className="text-xs sm:text-sm">{data.clientEmail}</div>}
              {data.clientGST && <div className="text-xs sm:text-sm">GST: {data.clientGST}</div>}
              <div className="text-xs sm:text-sm whitespace-pre-line">{data.clientAddress || 'Client Address'}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <table className="w-full min-w-[500px] sm:min-w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Description</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Qty</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Rate</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div className="font-semibold text-xs sm:text-sm text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-600 whitespace-pre-line">{item.description}</div>
                  </td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-800">{item.quantity}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-800">{currencySymbol}{item.rate.toFixed(2)}</td>
                  <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-800">{currencySymbol}{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6 sm:mb-8">
          <div className="w-full sm:w-64 max-w-sm">
            <div className="flex justify-between py-1 sm:py-2">
              <span className="text-xs sm:text-sm text-gray-700">Subtotal:</span>
              <span className="text-xs sm:text-sm text-gray-700">{currencySymbol}{data.subtotal.toFixed(2)}</span>
            </div>
            {data.discountAmount > 0 && (
              <>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-red-600">
                    Discount {data.discountType === 'percentage' ? `(${data.discountValue}%)` : ''}:
                  </span>
                  <span className="text-xs sm:text-sm text-red-600">-{currencySymbol}{data.discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 sm:py-2">
                  <span className="text-xs sm:text-sm text-green-600 font-semibold">You Save:</span>
                  <span className="text-xs sm:text-sm text-green-600 font-semibold">{currencySymbol}{data.discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            {data.sgstPercent > 0 && (
              <div className="flex justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-700">SGST ({data.sgstPercent}%):</span>
                <span className="text-xs sm:text-sm text-gray-700">{currencySymbol}{data.sgstAmount.toFixed(2)}</span>
              </div>
            )}
            {data.cgstPercent > 0 && (
              <div className="flex justify-between py-1 sm:py-2">
                <span className="text-xs sm:text-sm text-gray-700">CGST ({data.cgstPercent}%):</span>
                <span className="text-xs sm:text-sm text-gray-700">{currencySymbol}{data.cgstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 sm:py-3 border-t-2 border-gray-800 font-bold text-sm sm:text-lg text-gray-800">
              <span>Total:</span>
              <span>{currencySymbol}{data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {data.termsAndConditions && (
          <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
            <div className="text-center">
              <h4 className="font-semibold text-sm sm:text-lg text-gray-800 mb-3 sm:mb-4">Terms and Conditions</h4>
              <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed max-w-4xl mx-auto border border-gray-200 p-3 sm:p-4 rounded-lg bg-gray-50">
                {data.termsAndConditions}
              </div>
            </div>
          </div>
        )}

        {/* Bank Details */}
        {(data.bankName || data.accountNumber || data.ifscCode || data.branchName || data.upiId) && (
          <div className="mt-6 sm:mt-8 border border-gray-200 p-3 sm:p-4 rounded-lg">
            <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-3">Bank Details:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
              <div>
                {data.bankName && <div><strong className="text-gray-800">Bank Name:</strong> {data.bankName}</div>}
                {data.accountNumber && <div><strong className="text-gray-800">Account Number:</strong> {data.accountNumber}</div>}
                {data.ifscCode && <div><strong className="text-gray-800">IFSC Code:</strong> {data.ifscCode}</div>}
              </div>
              <div>
                {data.branchName && <div><strong className="text-gray-800">Branch:</strong> {data.branchName}</div>}
                {data.upiId && <div><strong className="text-gray-800">UPI ID:</strong> {data.upiId}</div>}
                {data.qrCodeUrl && (
                  <div className="mt-2">
                    <strong className="text-gray-800">UPI QR Code:</strong><br />
                    <img 
                      src={data.qrCodeUrl} 
                      alt="UPI QR Code" 
                      className="w-16 h-16 sm:w-24 sm:h-24 mt-1 border border-gray-300 rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-16 h-16 sm:w-24 sm:h-24 mt-1 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500';
                        placeholder.innerHTML = 'QR Code<br>Loading...';
                        target.parentElement?.appendChild(placeholder);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="mt-6 sm:mt-8">
            <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-2">Notes:</h4>
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
});
