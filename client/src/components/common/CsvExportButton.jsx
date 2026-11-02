import React from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const CsvExportButton = ({ data = [], filename = 'kachra-bazar-export', label = 'Export CSV' }) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('No data available to export.');
      return;
    }

    try {
      // Flatten simple nested objects
      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of data) {
        const values = headers.map((header) => {
          let val = row[header];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') {
            if (val.name) val = val.name;
            else if (val.code) val = val.code;
            else val = JSON.stringify(val);
          }
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  return (
    <button
      onClick={handleExport}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs font-semibold text-ink dark:text-gray-200 transition-colors shadow-sm"
    >
      <Download className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
      {label}
    </button>
  );
};

export default CsvExportButton;
