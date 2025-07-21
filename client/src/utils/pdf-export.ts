import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { InvoiceData, ThemeStyles } from '@/types/invoice';

export function getThemeStyles(theme: string): ThemeStyles {
  switch (theme) {
    case 'modern':
      return {
        background: 'from-blue-50 to-indigo-100',
        primary: 'text-indigo-700',
        secondary: 'text-indigo-500',
        text: 'text-gray-800',
        tableHeader: 'bg-indigo-600 text-white',
        tableRow: 'border-b border-gray-200',
        border: 'border-indigo-600'
      };
    case 'bold':
      return {
        background: 'from-red-50 to-orange-100',
        primary: 'text-red-700',
        secondary: 'text-red-500',
        text: 'text-gray-800',
        tableHeader: 'bg-red-600 text-white',
        tableRow: 'border-b border-gray-200',
        border: 'border-red-600'
      };
    default: // classic
      return {
        background: 'bg-white',
        primary: 'text-gray-800',
        secondary: 'text-gray-600',
        text: 'text-gray-700',
        tableHeader: 'bg-gray-800 text-white',
        tableRow: 'border-b border-gray-200',
        border: 'border-gray-800'
      };
  }
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const themeStyles = getThemeStyles(data.theme);
  
  return `
    <div class="invoice-container p-8 bg-white" style="width: 800px; min-height: 800px; font-family: 'Inter', sans-serif; background-color: #ffffff; box-sizing: border-box; padding: 32px;">
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" style="height: 64px; margin-bottom: 16px; object-fit: contain;">` : ''}
          <h1 style="font-size: 2rem; font-weight: bold; color: #1f2937; margin: 0;">INVOICE</h1>
          <p style="color: #6b7280; margin: 4px 0 0 0;">${data.invoiceNumber}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 4px;">Invoice Date:</div>
          <div style="font-weight: 600; color: #1f2937;">${data.invoiceDate}</div>
          <div style="font-size: 0.875rem; color: #6b7280; margin-top: 8px; margin-bottom: 4px;">Due Date:</div>
          <div style="font-weight: 600; color: #1f2937;">${data.dueDate}</div>
        </div>
      </div>

      <!-- Company & Client Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
        <div>
          <h3 style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">From:</h3>
          <div style="color: #1f2937;">
            <div style="font-weight: 600;">${data.companyName}</div>
            ${data.companyGST ? `<div style="font-size: 0.875rem;">GST: ${data.companyGST}</div>` : ''}
            <div style="font-size: 0.875rem; white-space: pre-line;">${data.companyAddress || ''}</div>
          </div>
        </div>
        <div>
          <h3 style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">To:</h3>
          <div style="color: #1f2937;">
            <div style="font-weight: 600;">${data.clientName}</div>
            ${data.clientEmail ? `<div style="font-size: 0.875rem;">${data.clientEmail}</div>` : ''}
            ${data.clientGST ? `<div style="font-size: 0.875rem;">GST: ${data.clientGST}</div>` : ''}
            <div style="font-size: 0.875rem; white-space: pre-line;">${data.clientAddress || ''}</div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 2rem;">
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #1f2937;">
          <thead>
            <tr style="background-color: #1f2937 !important; color: #ffffff !important;">
              <th style="text-align: left; padding: 14px 16px; border: 1px solid #1f2937; color: #ffffff !important; font-weight: 700; font-size: 14px; background-color: #1f2937 !important;">Description</th>
              <th style="text-align: right; padding: 14px 16px; border: 1px solid #1f2937; color: #ffffff !important; font-weight: 700; font-size: 14px; background-color: #1f2937 !important;">Qty</th>
              <th style="text-align: right; padding: 14px 16px; border: 1px solid #1f2937; color: #ffffff !important; font-weight: 700; font-size: 14px; background-color: #1f2937 !important;">Rate</th>
              <th style="text-align: right; padding: 14px 16px; border: 1px solid #1f2937; color: #ffffff !important; font-weight: 700; font-size: 14px; background-color: #1f2937 !important;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr style="border-bottom: 1px solid #e5e7eb; background-color: #ffffff;">
                <td style="padding: 12px 16px; border: 1px solid #e5e7eb; color: #1f2937; vertical-align: top;">
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-size: 14px;">${item.name}</div>
                  <div style="font-size: 12px; color: #6b7280; line-height: 1.4; white-space: pre-line;">${item.description}</div>
                </td>
                <td style="text-align: right; padding: 12px 16px; border: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; vertical-align: top;">${item.quantity}</td>
                <td style="text-align: right; padding: 12px 16px; border: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; vertical-align: top;">₹${item.rate.toFixed(2)}</td>
                <td style="text-align: right; padding: 12px 16px; border: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; vertical-align: top;">₹${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 2rem;">
        <div style="width: 256px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #374151;">
            <span style="color: #374151;">Subtotal:</span>
            <span style="color: #374151;">₹${data.subtotal.toFixed(2)}</span>
          </div>
          ${data.sgstPercent > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #374151;">
              <span style="color: #374151;">SGST (${data.sgstPercent}%):</span>
              <span style="color: #374151;">₹${data.sgstAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          ${data.cgstPercent > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; color: #374151;">
              <span style="color: #374151;">CGST (${data.cgstPercent}%):</span>
              <span style="color: #374151;">₹${data.cgstAmount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #1f2937; font-weight: bold; font-size: 1.125rem; color: #1f2937;">
            <span style="color: #1f2937;">Total:</span>
            <span style="color: #1f2937;">₹${data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      ${data.termsAndConditions ? `
        <div style="margin-top: 2rem; margin-bottom: 2rem; page-break-inside: avoid;">
          <div style="text-align: center;">
            <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 16px; font-size: 18px;">Terms and Conditions</h4>
            <div style="color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-line; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; background-color: #f9fafb; max-width: 600px; margin: 0 auto; text-align: left;">${data.termsAndConditions}</div>
          </div>
        </div>
      ` : ''}

      <!-- Bank Details -->
      ${(data.bankName || data.accountNumber || data.ifscCode || data.branchName || data.upiId) ? `
        <div style="margin-top: 2rem; border: 2px solid #e5e7eb; padding: 16px; border-radius: 8px; background-color: #f9fafb; page-break-inside: avoid;">
          <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 12px; font-size: 16px;">Bank Details:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 14px; color: #374151;">
            <div>
              ${data.bankName ? `<div style="margin-bottom: 8px;"><strong style="color: #1f2937;">Bank Name:</strong> ${data.bankName}</div>` : ''}
              ${data.accountNumber ? `<div style="margin-bottom: 8px;"><strong style="color: #1f2937;">Account Number:</strong> ${data.accountNumber}</div>` : ''}
              ${data.ifscCode ? `<div style="margin-bottom: 8px;"><strong style="color: #1f2937;">IFSC Code:</strong> ${data.ifscCode}</div>` : ''}
            </div>
            <div>
              ${data.branchName ? `<div style="margin-bottom: 8px;"><strong style="color: #1f2937;">Branch:</strong> ${data.branchName}</div>` : ''}
              ${data.upiId ? `<div style="margin-bottom: 8px;"><strong style="color: #1f2937;">UPI ID:</strong> ${data.upiId}</div>` : ''}
              ${data.qrCodeUrl ? `
                <div style="margin-top: 12px;">
                  <strong style="color: #1f2937;">UPI QR Code:</strong><br>
                  <div style="width: 100px; height: 100px; margin-top: 8px; border: 1px solid #d1d5db; border-radius: 4px; position: relative; background-color: #f9fafb;">
                    <img 
                      src="${data.qrCodeUrl}" 
                      alt="UPI QR Code" 
                      loading="eager"
                      style="width: 100%; height: 100%; object-fit: contain; display: block;"
                      onload="this.style.backgroundColor='transparent';"
                      onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\"display:flex;align-items:center;justify-content:center;height:100%;font-size:10px;color:#6b7280;text-align:center;\\">QR Code<br>Unavailable</div>';"
                    />
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Notes -->
      ${data.notes ? `
        <div style="margin-top: 2rem; page-break-inside: avoid; margin-bottom: 2rem;">
          <h4 style="font-weight: 600; color: #1f2937; margin-bottom: 8px; font-size: 16px;">Notes:</h4>
          <div style="color: #374151; font-size: 14px; line-height: 1.5; white-space: pre-line; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background-color: #f9fafb; min-height: 60px;">${data.notes}</div>
        </div>
      ` : ''}
      
      <!-- Bottom Padding -->
      <div style="height: 40px; margin-bottom: 40px;"></div>
    </div>
  `;
}

export async function exportToPDF(invoiceData: InvoiceData): Promise<void> {
  // Create a temporary container
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = generateInvoiceHTML(invoiceData);
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.width = '800px';
  tempContainer.style.minHeight = '1000px';
  document.body.appendChild(tempContainer);

  try {
    // Get the actual element and ensure it's properly sized
    const element = tempContainer.firstElementChild as HTMLElement;
    element.style.width = '800px';
    element.style.minHeight = '1000px';
    element.style.backgroundColor = '#ffffff';
    
    // Wait for any images to load with better error handling
    const images = element.querySelectorAll('img');
    const imageLoadPromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve();
        } else {
          const timeout = setTimeout(() => {
            console.warn('Image load timeout:', img.src);
            resolve();
          }, 3000); // 3 second timeout for each image
          
          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            console.warn('Image load error:', img.src);
            // Hide the image if it fails to load
            img.style.display = 'none';
            resolve();
          };
          
          // Force reload if src exists
          if (img.src) {
            const currentSrc = img.src;
            img.src = '';
            img.src = currentSrc;
          }
        }
      });
    });
    
    await Promise.all(imageLoadPromises);
    
    // Add a small additional delay to ensure rendering is complete
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      removeContainer: false,
      logging: false,
      width: 800,
      height: Math.max(1000, element.scrollHeight + 100),
      windowWidth: 800,
      windowHeight: Math.max(1000, element.scrollHeight + 100),
      onclone: (clonedDoc) => {
        // Ensure all text has proper color styling
        const elements = clonedDoc.querySelectorAll('*');
        elements.forEach((el: any) => {
          if (el.style && !el.style.color && el.textContent?.trim()) {
            el.style.color = '#374151';
          }
          // Ensure table headers are properly styled
          if (el.tagName === 'TH') {
            el.style.backgroundColor = '#1f2937';
            el.style.color = '#ffffff';
            el.style.fontWeight = '700';
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let position = 0;
    
    // If content is larger than one page, split it across multiple pages
    if (imgHeight > pdfHeight) {
      const pageHeight = pdfHeight;
      const totalPages = Math.ceil(imgHeight / pageHeight);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const startY = -(pageHeight * i);
        pdf.addImage(imgData, 'PNG', 0, startY, imgWidth, imgHeight);
      }
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
    
    pdf.save(`invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`);
  } finally {
    document.body.removeChild(tempContainer);
  }
}

export function printInvoice(invoiceData: InvoiceData): void {
  const printWindow = window.open('', '', 'height=800,width=1000');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            table thead tr {
              background-color: #1f2937 !important;
              color: #ffffff !important;
            }
            table thead th {
              background-color: #1f2937 !important;
              color: #ffffff !important;
              font-weight: 700 !important;
            }
            .no-print {
              display: none !important;
            }
            .loading-indicator {
              display: none !important;
            }
            @page {
              margin: 0.5in;
              size: A4;
            }
          }
          body { 
            margin: 0; 
            font-family: 'Inter', sans-serif; 
            color: #374151;
            background-color: #ffffff;
            font-size: 14px;
            line-height: 1.4;
          }
          table {
            border-collapse: collapse !important;
          }
          table thead tr {
            background-color: #1f2937 !important;
            color: #ffffff !important;
          }
          table thead th {
            background-color: #1f2937 !important;
            color: #ffffff !important;
            font-weight: 700 !important;
            padding: 12px 16px !important;
            border: 1px solid #1f2937 !important;
          }
          table tbody td {
            padding: 10px 16px !important;
            border: 1px solid #e5e7eb !important;
          }
          .image-loading {
            border: 2px dashed #d1d5db;
            background-color: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 12px;
          }
          .loading-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            text-align: center;
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loading-indicator no-print" id="loadingIndicator">
          <div class="spinner"></div>
          <div>Preparing invoice for printing...</div>
          <div style="font-size: 12px; color: #666; margin-top: 8px;">Loading images and content...</div>
        </div>
        ${generateInvoiceHTML(invoiceData)}
        <script>
          // Function to wait for all images to load
          function waitForImages() {
            return new Promise((resolve) => {
              const images = document.querySelectorAll('img');
              let loadedImages = 0;
              const totalImages = images.length;
              
              console.log('Total images to load:', totalImages);
              
              if (totalImages === 0) {
                console.log('No images to load');
                resolve(true);
                return;
              }
              
              const handleImageLoad = (img, success = true) => {
                loadedImages++;
                console.log(\`Image \${success ? 'loaded' : 'failed'}: \${img.src} (\${loadedImages}/\${totalImages})\`);
                if (loadedImages === totalImages) {
                  console.log('All images processed');
                  resolve(true);
                }
              };
              
              images.forEach((img) => {
                if (img.complete && img.naturalWidth > 0) {
                  console.log('Image already loaded:', img.src);
                  handleImageLoad(img, true);
                } else {
                  img.onload = () => handleImageLoad(img, true);
                  img.onerror = () => {
                    console.warn('Image load failed:', img.src);
                    // Hide broken images and show fallback
                    img.style.display = 'none';
                    if (img.alt === 'UPI QR Code') {
                      img.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100px;width:100px;border:1px solid #d1d5db;border-radius:4px;font-size:10px;color:#6b7280;text-align:center;background:#f9fafb;">QR Code<br>Unavailable</div>';
                    }
                    handleImageLoad(img, false);
                  };
                  
                  // Force reload if src is already set
                  const currentSrc = img.src;
                  if (currentSrc) {
                    console.log('Triggering image load for:', currentSrc);
                    img.src = '';
                    img.src = currentSrc;
                  }
                }
              });
              
              // Fallback timeout in case some images never load
              setTimeout(() => {
                console.warn('Image loading timeout reached');
                resolve(true);
              }, 8000);
            });
          }
          
          // Function to hide loading indicator
          function hideLoadingIndicator() {
            const indicator = document.getElementById('loadingIndicator');
            if (indicator) {
              indicator.style.display = 'none';
            }
          }
          
          // Wait for DOM content and images to load
          document.addEventListener('DOMContentLoaded', async () => {
            console.log('DOM loaded, starting print preparation');
            try {
              // First wait for fonts to load
              if (document.fonts && document.fonts.ready) {
                console.log('Waiting for fonts...');
                await document.fonts.ready;
                console.log('Fonts loaded');
              }
              
              // Then wait for all images to load
              console.log('Waiting for images...');
              await waitForImages();
              console.log('Images loading complete');
              
              // Hide loading indicator
              hideLoadingIndicator();
              
              // Additional small delay to ensure everything is rendered
              setTimeout(() => {
                console.log('Starting print dialog');
                window.print();
                setTimeout(() => {
                  console.log('Closing print window');
                  window.close();
                }, 1000);
              }, 500);
            } catch (error) {
              console.error('Error in print preparation:', error);
              hideLoadingIndicator();
              // Fallback: print anyway after a delay
              setTimeout(() => {
                console.log('Fallback print triggered');
                window.print();
                setTimeout(() => {
                  window.close();
                }, 1000);
              }, 2000);
            }
          });
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
}
