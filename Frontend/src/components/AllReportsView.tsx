import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Building2, Download, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type SavedReport = {
  id: string;
  name: string;
  text: Record<string, string>;
  templateId: string;
  createdAt: string;
  updatedAt: string;
};

export default function AllReportsView() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<SavedReport | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/api/reports');
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Error while fetching reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // const formatDate = (iso: string) => new Date(iso).toLocaleString();
  const formatDateOnly = (iso: string) => new Date(iso).toISOString().split('T')[0];

  const guessCompany = (text: Record<string, string>) => {
    const keys = Object.keys(text || {});
    const candidates = [
      'company', 'company name', 'insurer', 'organization', 'firm', 'provider', 'hospital', 'client'
    ];
    const foundKey = keys.find(k => candidates.includes(k.toLowerCase()));
    return foundKey ? text[foundKey] : '';
  };

  const handleDownload = async (report: SavedReport) => {
    try {
      const res = await fetch(`http://localhost:8000/api/templates/${report.templateId}/fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: report.text })
      });
      if (!res.ok) throw new Error('Failed to generate filled template');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}_${formatDateOnly(report.createdAt)}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed');
    }
  };

  const handleDelete = async (report: SavedReport) => {
    if (!confirm('Delete this report?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${report.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete report');
      setReports(prev => prev.filter(r => r.id !== report.id));
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-12"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Reports</h2>
        <p className="text-gray-600">Saved reports from database</p>
      </div>

      {loading && (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">Loading…</div>
      )}
      {error && (
        <div className="text-center py-4 mb-6 text-red-600">{error}</div>
      )}

      {!loading && reports.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports saved</h3>
          <p className="mt-1 text-sm text-gray-500">Create a report from the Report tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gray-600 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">REPORT</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {report.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">Report generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{guessCompany(report.text) || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateOnly(report.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => setPreviewReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(report)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewReport?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-auto text-sm">
            {previewReport && (
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(previewReport.text || {}).map(([k, v]) => (
                    <tr key={k} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium align-top">{k}</td>
                      <td className="py-2 text-gray-700">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}