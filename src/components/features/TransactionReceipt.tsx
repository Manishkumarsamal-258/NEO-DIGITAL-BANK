import React from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Receipt, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

interface TransactionReceiptProps {
  transaction: Transaction;
}

export default function TransactionReceipt({ transaction }: TransactionReceiptProps) {
  const [loading, setLoading] = React.useState(false);

  const downloadReceipt = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF('portrait', 'mm', 'a5');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(6, 78, 133);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('NeoBank', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Transaction Receipt', pageWidth / 2, 23, { align: 'center' });
      doc.text('Secure & Encrypted', pageWidth / 2, 30, { align: 'center' });

      // Receipt Details
      const startY = 45;
      const lineHeight = 8;

      const details: [string, string][] = [
        ['Transaction ID', transaction.id || transaction.reference || 'N/A'],
        ['Type', (transaction.type || 'N/A').toUpperCase()],
        ['Status', (transaction.status || 'N/A').toUpperCase()],
        ['Amount', `₹${(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Description', transaction.description || transaction.category || 'N/A'],
        ['From Account', transaction.fromAccountId || 'N/A'],
        ['To Account', transaction.toAccountId || 'N/A'],
        ['Date', new Date(transaction.createdAt || transaction.date || new Date()).toLocaleString()],
      ];

      doc.setDrawColor(200, 200, 200);
      details.forEach(([label, value], i) => {
        const y = startY + i * lineHeight;
        if (i % 2 === 0) {
          doc.setFillColor(245, 247, 250);
          doc.rect(10, y - 2, pageWidth - 20, lineHeight, 'F');
        }
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(label, 12, y + 3);
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', label === 'Amount' ? 'bold' : 'normal');
        doc.text(String(value), pageWidth - 12, y + 3, { align: 'right' });
      });

      // Footer
      doc.setDrawColor(200, 200, 200);
      doc.line(10, startY + details.length * lineHeight + 5, pageWidth - 10, startY + details.length * lineHeight + 5);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, startY + details.length * lineHeight + 12, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, startY + details.length * lineHeight + 18, { align: 'center' });

      const txnId = (transaction.id || transaction.reference || 'txn').substring(0, 8);
      doc.save(`receipt-${txnId}.pdf`);
      toast.success('Receipt downloaded!');
    } catch (err) {
      toast.error('Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={downloadReceipt}
      disabled={loading}
      className="text-gray-400 hover:text-white"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Receipt className="w-4 h-4" />
      )}
    </Button>
  );
}
