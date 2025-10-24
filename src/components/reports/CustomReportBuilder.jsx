import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Settings } from 'lucide-react';
import { formatCurrency } from '../utils/CurrencyFormatter';

const AVAILABLE_COLUMNS = [
  { id: 'date', label: 'Date', default: true },
  { id: 'payee', label: 'Payee', default: true },
  { id: 'category', label: 'Category', default: true },
  { id: 'subcategory', label: 'Subcategory', default: false },
  { id: 'amount', label: 'Amount', default: true },
  { id: 'account', label: 'Account', default: false },
  { id: 'memo', label: 'Memo', default: false },
  { id: 'type', label: 'Type', default: false }
];

export default function CustomReportBuilder({ data, accounts, categories, onExport }) {
  const [selectedColumns, setSelectedColumns] = useState(
    AVAILABLE_COLUMNS.filter(col => col.default).map(col => col.id)
  );
  const [exportFormat, setExportFormat] = useState('csv');

  const handleColumnToggle = (columnId) => {
    setSelectedColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const getCellValue = (transaction, columnId) => {
    switch (columnId) {
      case 'date':
        return new Date(transaction.date).toLocaleDateString();
      case 'payee':
        return transaction.payee || '-';
      case 'category':
        const category = categories.find(c => c.id === transaction.category_id);
        return category?.name || 'Uncategorized';
      case 'subcategory':
        const subcategory = categories.find(c => c.id === transaction.subcategory_id);
        return subcategory?.name || '-';
      case 'amount':
        return formatCurrency(transaction.amount_eur || 0, 'EUR');
      case 'account':
        const account = accounts.find(a => a.id === transaction.account_id);
        return account?.name || '-';
      case 'memo':
        return transaction.memo || '-';
      case 'type':
        return transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || '-';
      default:
        return '-';
    }
  };

  const handleExport = () => {
    const headers = selectedColumns.map(colId => 
      AVAILABLE_COLUMNS.find(col => col.id === colId)?.label
    );
    
    const rows = data.map(transaction => 
      selectedColumns.map(colId => getCellValue(transaction, colId))
    );

    if (exportFormat === 'csv') {
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else if (exportFormat === 'pdf') {
      // For PDF export, we'd typically use a library like jsPDF
      // For now, we'll create a simple table that can be printed
      const printWindow = window.open('', '_blank');
      const tableHTML = `
        <html>
        <head><title>Financial Report</title></head>
        <body>
          <h2>Financial Report - ${new Date().toLocaleDateString()}</h2>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>${headers.map(h => `<th style="padding: 8px;">${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => 
                `<tr>${row.map(cell => `<td style="padding: 8px;">${cell}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
        </html>
      `;
      printWindow.document.write(tableHTML);
    }
    
    if (onExport) onExport(exportFormat);
  };

  return (
    <Card className="shadow-sm border-slate-200 bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Custom Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium text-slate-800 mb-3">Select Columns to Include</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_COLUMNS.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => handleColumnToggle(column.id)}
                />
                <label
                  htmlFor={column.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Export Format:</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-slate-800 mb-3">Preview ({data.length} transactions)</h4>
          <div className="overflow-x-auto max-h-64 border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {selectedColumns.map(colId => {
                    const column = AVAILABLE_COLUMNS.find(col => col.id === colId);
                    return (
                      <th key={colId} className="text-left p-3 font-medium">
                        {column?.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((transaction, index) => (
                  <tr key={index} className="border-t">
                    {selectedColumns.map(colId => (
                      <td key={colId} className="p-3">
                        {getCellValue(transaction, colId)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
