import React from 'react';
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet, FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

// Manually apply jspdf-autotable plugin (bundler doesn't have window.jsPDF)
applyPlugin(jsPDF);

interface TransactionExportProps {
  transactions: Transaction[];
  userName?: string;
}

export default function TransactionExport({ transactions, userName }: TransactionExportProps) {
  const [loading, setLoading] = React.useState<'pdf' | 'csv' | 'xlsx' | null>(null);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  };

  const getTableData = () => transactions.map(tx => [
    formatDate(tx.createdAt || tx.date || new Date()),
    tx.type?.toUpperCase() || 'N/A',
    tx.description || tx.category || '',
    tx.status?.toUpperCase() || '',
    tx.type === 'debit' ? formatCurrency(tx.amount) : '',
    tx.type === 'credit' ? formatCurrency(tx.amount) : '',
    tx.reference || '',
  ]);

  const downloadPDF = async () => {
    setLoading('pdf');
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(6, 78, 133);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('NeoBank - Transaction Statement', pageWidth / 2, 25, { align: 'center' });

      // Subheader
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Generated: ${dateStr} | Account Holder: ${userName || 'N/A'} | Transactions: ${transactions.length}`, pageWidth / 2, 34, { align: 'center' });

      // Summary section
      const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalDebit = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
      
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 247, 250);
      doc.rect(10, 45, (pageWidth - 30) / 3, 15, 'F');
      doc.rect(10 + (pageWidth - 30) / 3 + 5, 45, (pageWidth - 30) / 3, 15, 'F');
      doc.rect(10 + 2 * (pageWidth - 30) / 3 + 10, 45, (pageWidth - 30) / 3, 15, 'F');

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Total Transactions', 10 + (pageWidth - 30) / 6, 51, { align: 'center' });
      doc.text('Total Credits', 10 + 1.5 * (pageWidth - 30) / 3 + 5, 51, { align: 'center' });
      doc.text('Total Debits', 10 + 2.5 * (pageWidth - 30) / 3 + 10, 51, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(String(transactions.length), 10 + (pageWidth - 30) / 6, 57, { align: 'center' });
      doc.text(formatCurrency(totalCredit), 10 + 1.5 * (pageWidth - 30) / 3 + 5, 57, { align: 'center' });
      doc.text(formatCurrency(totalDebit), 10 + 2.5 * (pageWidth - 30) / 3 + 10, 57, { align: 'center' });

      // Transactions Table
      doc.autoTable({
        startY: 68,
        head: [['Date', 'Type', 'Description', 'Status', 'Debit', 'Credit', 'Reference']],
        body: getTableData(),
        theme: 'striped',
        headStyles: {
          fillColor: [6, 78, 133],
          fontSize: 9,
          halign: 'center',
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 22, halign: 'center' },
          4: { cellWidth: 28, halign: 'right' },
          5: { cellWidth: 28, halign: 'right' },
          6: { cellWidth: 30 },
        },
        foot: [[
          '', '', '', 'Totals',
          formatCurrency(totalDebit),
          formatCurrency(totalCredit),
          ''
        ]],
        footStyles: {
          fillColor: [240, 240, 240],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'right',
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `NeoBank Financial Services - Page ${i} of ${pageCount} - Confidential`,
          pageWidth / 2, doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save('neobank-statement.pdf');
      toast.success('PDF statement downloaded successfully!', {
        description: `${transactions.length} transactions exported`,
      });
    } catch (err) {
      toast.error('Failed to generate PDF', { description: 'Please try again.' });
    } finally {
      setLoading(null);
    }
  };

  const downloadCSV = () => {
    setLoading('csv');
    try {
      const csvContent = [
        ['Date', 'Type', 'Description', 'Status', 'Amount', 'Currency', 'Reference'].join(','),
        ...transactions.map(tx => [
          formatDate(tx.createdAt || tx.date || new Date()),
          tx.type?.toUpperCase() || '',
          `"${(tx.description || tx.category || '').replace(/"/g, '""')}"`,
          tx.status?.toUpperCase() || '',
          tx.type === 'debit' ? -tx.amount : tx.amount,
          tx.currency || 'INR',
          tx.reference || '',
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `neobank-transactions-${Date.now()}.csv`);
      toast.success('CSV file downloaded!');
    } catch (err) {
      toast.error('Failed to generate CSV');
    } finally {
      setLoading(null);
    }
  };

  const downloadXLSX = () => {
    setLoading('xlsx');
    try {
      const wb = XLSX.utils.book_new();
      const wsData = [
        ['NeoBank Transaction Report', '', '', '', ''],
        [`Generated: ${new Date().toLocaleString()}`, '', '', '', ''],
        [`Account Holder: ${userName || 'N/A'}`, '', '', '', ''],
        [],
        ['Date', 'Type', 'Description', 'Status', 'Amount', 'Currency', 'Reference'],
        ...transactions.map(tx => [
          formatDate(tx.createdAt || tx.date || new Date()),
          tx.type?.toUpperCase() || '',
          tx.description || tx.category || '',
          tx.status?.toUpperCase() || '',
          tx.type === 'debit' ? -tx.amount : tx.amount,
          tx.currency || 'INR',
          tx.reference || '',
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `neobank-transactions-${Date.now()}.xlsx`);
      toast.success('Excel file downloaded!');
    } catch (err) {
      toast.error('Failed to generate Excel file');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={downloadCSV}
        disabled={loading !== null || transactions.length === 0}
        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        {loading === 'csv' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="hidden sm:inline ml-1">CSV</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadXLSX}
        disabled={loading !== null || transactions.length === 0}
        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        {loading === 'xlsx' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        <span className="hidden sm:inline ml-1">Excel</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={downloadPDF}
        disabled={loading !== null || transactions.length === 0}
        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        {loading === 'pdf' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline ml-1">PDF</span>
      </Button>
    </div>
  );
}
