// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { FileText, Calendar, Building2, Download, Eye, Trash2 } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';

// type SavedReport = {
//   id: string;
//   name: string;
//   text: Record<string, string>;
//   templateId: string;
//   createdAt: string;
//   updatedAt: string;
// };

// type DownloadFormat = 'docx' | 'pdf';

// export default function AllReportsView() {
//   const [reports, setReports] = useState<SavedReport[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [previewReport, setPreviewReport] = useState<SavedReport | null>(null);
//   const [selectedFormat, setSelectedFormat] = useState<Record<string, DownloadFormat>>({});

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch('http://localhost:8000/api/reports');
//         if (!res.ok) throw new Error('Failed to fetch reports');
//         const data = await res.json();
//         setReports(Array.isArray(data) ? data : []);
//       } catch (e: any) {
//         setError(e?.message || 'Error while fetching reports');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const formatDateOnly = (iso: string) => new Date(iso).toISOString().split('T')[0];

//   const guessCompany = (text: Record<string, string>) => {
//     const keys = Object.keys(text || {});
//     const candidates = [
//       'company', 'company name', 'insurer', 'organization', 'firm', 'provider', 'hospital', 'client'
//     ];
//     const foundKey = keys.find(k => candidates.includes(k.toLowerCase()));
//     return foundKey ? text[foundKey] : '';
//   };

//   const handleDownload = async (report: SavedReport) => {
//     const format = selectedFormat[report.id] || 'docx';
//     try {
//       const res = await fetch(`http://localhost:8000/api/templates/${report.templateId}/fill`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ data: report.text, format })
//       });
//       if (!res.ok) throw new Error('Failed to generate filled template');
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${report.name.replace(/\s+/g, '_')}_${formatDateOnly(report.createdAt)}.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error(e);
//       alert('Download failed');
//     }
//   };

//   const handleDelete = async (report: SavedReport) => {
//     if (!confirm('Delete this report?')) return;
//     try {
//       const res = await fetch(`http://localhost:8000/api/reports/${report.id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete report');
//       setReports(prev => prev.filter(r => r.id !== report.id));
//     } catch (e) {
//       console.error(e);
//       alert('Delete failed');
//     }
//   };

//   const handleFormatChange = (reportId: string, format: DownloadFormat) => {
//     setSelectedFormat(prev => ({ ...prev, [reportId]: format }));
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="container mx-auto px-6 py-12"
//     >
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">All Reports</h2>
//         <p className="text-gray-600">Saved reports from database</p>
//       </div>

//       {loading && (
//         <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">Loading…</div>
//       )}
//       {error && (
//         <div className="text-center py-4 mb-6 text-red-600">{error}</div>
//       )}

//       {!loading && reports.length === 0 ? (
//         <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">
//           <FileText className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports saved</h3>
//           <p className="mt-1 text-sm text-gray-500">Create a report from the Report tab.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {reports.map((report, index) => (
//             <motion.div
//               key={report.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: index * 0.05 }}
//             >
//               <Card className="border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="bg-gray-600 p-3 rounded-lg">
//                       <FileText className="w-6 h-6 text-white" />
//                     </div>
//                     <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">REPORT</Badge>
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                     {report.name}
//                   </h3>
//                   <p className="text-gray-600 text-sm mb-4">Report generated on {new Date(report.createdAt).toLocaleDateString()}</p>
//                   <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-1">
//                       <Building2 className="w-3 h-3" />
//                       <span>{guessCompany(report.text) || '—'}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Calendar className="w-3 h-3" />
//                       <span>{formatDateOnly(report.createdAt)}</span>
//                     </div>
//                   </div>
//                   <div className="mb-4">
//                     <RadioGroup
//                       defaultValue="docx"
//                       onValueChange={(value: DownloadFormat) => handleFormatChange(report.id, value)}
//                       className="flex gap-4"
//                     >
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="docx" id={`docx-${report.id}`} />
//                         <Label htmlFor={`docx-${report.id}`}>DOCX</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="pdf" id={`pdf-${report.id}`} />
//                         <Label htmlFor={`pdf-${report.id}`}>PDF</Label>
//                       </div>
//                     </RadioGroup>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
//                       onClick={() => setPreviewReport(report)}
//                     >
//                       <Eye className="w-4 h-4 mr-1" />
//                       View
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
//                       onClick={() => handleDownload(report)}
//                     >
//                       <Download className="w-4 h-4 mr-1" />
//                       Download
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-white border-red-300 text-red-600 hover:bg-red-50"
//                       onClick={() => handleDelete(report)}
//                     >
//                       <Trash2 className="w-4 h-4 mr-1" />
//                       Delete
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       )}
//       <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>{previewReport?.name}</DialogTitle>
//           </DialogHeader>
//           <div className="max-h-80 overflow-auto text-sm">
//             {previewReport && (
//               <table className="w-full text-left">
//                 <tbody>
//                   {Object.entries(previewReport.text || {}).map(([k, v]) => (
//                     <tr key={k} className="border-b last:border-0">
//                       <td className="py-2 pr-4 font-medium align-top">{k}</td>
//                       <td className="py-2 text-gray-700">{v}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </motion.div>
//   );
// }


// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { FileText, Calendar, Building2, Download, Eye, Trash2 } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';

// type SavedReport = {
//   id: string;
//   name: string;
//   text: Record<string, string>;
//   templateId: string;
//   createdAt: string;
//   updatedAt: string;
// };

// type DownloadFormat = 'docx' | 'pdf';

// export default function AllReportsView() {
//   const [reports, setReports] = useState<SavedReport[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [previewReport, setPreviewReport] = useState<SavedReport | null>(null);
//   const [selectedFormat, setSelectedFormat] = useState<Record<string, DownloadFormat>>({});

//   // State for preview-specific template data
//   const [previewTemplateLogo, setPreviewTemplateLogo] = useState<string | null>(null);
//   const [previewTemplateDescription, setPreviewTemplateDescription] = useState<string | null>(null);
//   const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);


//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch('http://localhost:8000/api/reports');
//         if (!res.ok) throw new Error('Failed to fetch reports');
//         const data = await res.json();
//         setReports(Array.isArray(data) ? data : []);
//       } catch (e: any) {
//         setError(e?.message || 'Error while fetching reports');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const formatDateOnly = (iso: string) => new Date(iso).toISOString().split('T')[0];

//   const guessCompany = (text: Record<string, string>) => {
//     const keys = Object.keys(text || {});
//     const candidates = [
//       'company', 'company name', 'insurer', 'organization', 'firm', 'provider', 'hospital', 'client'
//     ];
//     const foundKey = keys.find(k => candidates.includes(k.toLowerCase()));
//     return foundKey ? text[foundKey] : '';
//   };

//   const handleDownload = async (report: SavedReport) => {
//     const format = selectedFormat[report.id] || 'docx';
//     try {
//       const res = await fetch(`http://localhost:8000/api/templates/${report.templateId}/fill`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ data: report.text, format })
//       });
//       if (!res.ok) throw new Error('Failed to generate filled template');
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${report.name.replace(/\s+/g, '_')}_${formatDateOnly(report.createdAt)}.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error(e);
//       alert('Download failed');
//     }
//   };

//   const handleDelete = async (report: SavedReport) => {
//     if (!confirm('Delete this report?')) return;
//     try {
//       const res = await fetch(`http://localhost:8000/api/reports/${report.id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete report');
//       setReports(prev => prev.filter(r => r.id !== report.id));
//     } catch (e) {
//       console.error(e);
//       alert('Delete failed');
//     }
//   };

//   const handleFormatChange = (reportId: string, format: DownloadFormat) => {
//     setSelectedFormat(prev => ({ ...prev, [reportId]: format }));
//   };

//   const formatLabel = (key: string): string => {
//     const spaced = key
//       .replace(/[_-]+/g, ' ')
//       .replace(/([a-z])([A-Z])/g, '$1 $2')
//       .replace(/\s+/g, ' ')
//       .trim();
//     return spaced
//       .split(' ')
//       .map(w => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(' ');
//   };
 
//   const handlePreview = async (report: SavedReport) => {
//     setPreviewReport(report);
//     setIsPreviewLoading(true);
//     setPreviewTemplateLogo(null);
//     setPreviewTemplateDescription(null);

//     try {
//       const res = await fetch(`http://localhost:8000/api/templates/${report.templateId}`);
//       if (!res.ok) throw new Error('Failed to fetch template details for preview');
//       const data = await res.json();

//       let computedLogo: string | null = null;
//       if (data && data.logo) {
//         const raw: string = String(data.logo);
//         computedLogo = /^https?:\/\//i.test(raw) ? raw : `http://localhost:8000/${raw.replace(/^\/*/, '')}`;
//       }
//       setPreviewTemplateLogo(computedLogo);

//       if (data && typeof data.description === 'string' && data.description.trim().length > 0) {
//         setPreviewTemplateDescription(data.description.trim());
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setIsPreviewLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="container mx-auto px-6 py-12"
//     >
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">All Reports</h2>
//         <p className="text-gray-600">Saved reports from database</p>
//       </div>

//       {loading && (
//         <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">Loading…</div>
//       )}
//       {error && (
//         <div className="text-center py-4 mb-6 text-red-600">{error}</div>
//       )}

//       {!loading && reports.length === 0 ? (
//         <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">
//           <FileText className="mx-auto h-12 w-12 text-gray-400" />
//           <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports saved</h3>
//           <p className="mt-1 text-sm text-gray-500">Create a report from the Report tab.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {reports.map((report, index) => (
//             <motion.div
//               key={report.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.4, delay: index * 0.05 }}
//             >
//               <Card className="border-gray-200 bg-white shadow-md hover:shadow-lg transition-all duration-300 group">
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className="bg-gray-600 p-3 rounded-lg">
//                       <FileText className="w-6 h-6 text-white" />
//                     </div>
//                     <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">REPORT</Badge>
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                     {report.name}
//                   </h3>
//                   <p className="text-gray-600 text-sm mb-4">Report generated on {new Date(report.createdAt).toLocaleDateString()}</p>
//                   <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
//                     <div className="flex items-center gap-1">
//                       <Building2 className="w-3 h-3" />
//                       <span>{guessCompany(report.text) || '—'}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Calendar className="w-3 h-3" />
//                       <span>{formatDateOnly(report.createdAt)}</span>
//                     </div>
//                   </div>
//                   <div className="mb-4">
//                     <RadioGroup
//                       defaultValue="docx"
//                       onValueChange={(value: DownloadFormat) => handleFormatChange(report.id, value)}
//                       className="flex gap-4"
//                     >
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="docx" id={`docx-${report.id}`} />
//                         <Label htmlFor={`docx-${report.id}`}>DOCX</Label>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <RadioGroupItem value="pdf" id={`pdf-${report.id}`} />
//                         <Label htmlFor={`pdf-${report.id}`}>PDF</Label>
//                       </div>
//                     </RadioGroup>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
//                       onClick={() => handlePreview(report)}
//                     >
//                       <Eye className="w-4 h-4 mr-1" />
//                       View
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
//                       onClick={() => handleDownload(report)}
//                     >
//                       <Download className="w-4 h-4 mr-1" />
//                       Download
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="flex-1 bg-white border-red-300 text-red-600 hover:bg-red-50"
//                       onClick={() => handleDelete(report)}
//                     >
//                       <Trash2 className="w-4 h-4 mr-1" />
//                       Delete
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       )}
//       <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
//         <DialogContent className="max-w-5xl w-full">
//           <DialogHeader>
//             <DialogTitle>Report Preview</DialogTitle>
//           </DialogHeader>
//           <div className="max-h-[80vh] overflow-auto">
//           {isPreviewLoading && <div className="text-center p-10">Loading preview...</div>}
//             {!isPreviewLoading && previewReport && (
//                <div className="border border-gray-800">
//                 <div className="p-4 text-center border-b border-gray-800 bg-white">
//                   {previewTemplateLogo ? (
//                     <img src={previewTemplateLogo} alt="Template Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
//                   ) : (
//                     <div className="h-16 w-auto mx-auto mb-4 flex items-center justify-center">
//                         <FileText className="w-10 h-10 text-gray-400" />
//                     </div>
//                   )}
//                   <h2 className="text-xl font-bold text-gray-800">{previewReport.name}</h2>
//                   <p className="text-sm text-gray-600 mt-1">{previewTemplateDescription || 'Report Details'}</p>
//                 </div>
 
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <tbody className="divide-y divide-gray-800 bg-white">
//                       {Object.entries(previewReport.text || {}).map(([key, value], index) => (
//                         <tr key={key}>
//                           <td className="px-4 py-4 w-12 text-center border-r border-gray-800 align-top">{index + 1}</td>
//                           <td className="px-6 py-4 border-r border-gray-800 align-top whitespace-nowrap">
//                             <Label className="text-sm font-medium text-gray-700">{formatLabel(key)}</Label>
//                           </td>
//                           <td className="px-6 py-4 align-top">
//                             <p className="text-sm text-gray-800 whitespace-pre-wrap break-words w-full">{value}</p>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </motion.div>
//   );
// }



import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Building2, Download, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SavedReport = {
  id: string;
  name: string;
  text: Record<string, string>;
  templateId: string;
  createdAt: string;
  updatedAt: string;
};

type DownloadFormat = 'docx' | 'pdf';

// New type for download status
type DownloadStatus = {
  [reportId: string]: boolean;
};


export default function AllReportsView() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<SavedReport | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Record<string, DownloadFormat>>({});
  
  // State for tracking download status of each report
  const [isDownloading, setIsDownloading] = useState<DownloadStatus>({});

  // State for preview-specific template data
  const [previewTemplateLogo, setPreviewTemplateLogo] = useState<string | null>(null);
  const [previewTemplateDescription, setPreviewTemplateDescription] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);


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
    const format = selectedFormat[report.id] || 'docx';
    
    // Set downloading state to true for this specific report
    setIsDownloading(prev => ({ ...prev, [report.id]: true }));

    try {
      const res = await fetch(`http://localhost:8000/api/templates/${report.templateId}/fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: report.text, format })
      });
      if (!res.ok) throw new Error('Failed to generate filled template');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '_')}_${formatDateOnly(report.createdAt)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Download failed');
    } finally {
      // Set downloading state to false after download is complete or on error
      setIsDownloading(prev => ({ ...prev, [report.id]: false }));
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

  const handleFormatChange = (reportId: string, format: DownloadFormat) => {
    setSelectedFormat(prev => ({ ...prev, [reportId]: format }));
  };

  const formatLabel = (key: string): string => {
    const spaced = key
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    return spaced
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };
 
  const handlePreview = async (report: SavedReport) => {
    setPreviewReport(report);
    setIsPreviewLoading(true);
    setPreviewTemplateLogo(null);
    setPreviewTemplateDescription(null);

    try {
      const res = await fetch(`http://localhost:8000/api/templates/${report.templateId}`);
      if (!res.ok) throw new Error('Failed to fetch template details for preview');
      const data = await res.json();

      let computedLogo: string | null = null;
      if (data && data.logo) {
        const raw: string = String(data.logo);
        computedLogo = /^https?:\/\//i.test(raw) ? raw : `http://localhost:8000/${raw.replace(/^\/*/, '')}`;
      }
      setPreviewTemplateLogo(computedLogo);

      if (data && typeof data.description === 'string' && data.description.trim().length > 0) {
        setPreviewTemplateDescription(data.description.trim());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPreviewLoading(false);
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
                  <div className="mb-4">
                    <RadioGroup
                      defaultValue="docx"
                      onValueChange={(value: DownloadFormat) => handleFormatChange(report.id, value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="docx" id={`docx-${report.id}`} />
                        <Label htmlFor={`docx-${report.id}`}>DOCX</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id={`pdf-${report.id}`} />
                        <Label htmlFor={`pdf-${report.id}`}>PDF</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => handlePreview(report)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700"
                      onClick={() => handleDownload(report)}
                      // Disable the button when this report is downloading
                      disabled={isDownloading[report.id]}
                    >
                      {isDownloading[report.id] ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 mr-1"
                          >
                            <Download className="w-4 h-4" />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </>
                      )}
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
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-auto">
          {isPreviewLoading && <div className="text-center p-10">Loading preview...</div>}
            {!isPreviewLoading && previewReport && (
               <div className="border border-gray-800">
                <div className="p-4 text-center border-b border-gray-800 bg-white">
                  {previewTemplateLogo ? (
                    <img src={previewTemplateLogo} alt="Template Logo" className="h-16 w-auto mx-auto mb-4 object-contain" />
                  ) : (
                    <div className="h-16 w-auto mx-auto mb-4 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-800">{previewReport.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{previewTemplateDescription || 'Report Details'}</p>
                </div>
 
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-800 bg-white">
                      {Object.entries(previewReport.text || {}).map(([key, value], index) => (
                        <tr key={key}>
                          <td className="px-4 py-4 w-12 text-center border-r border-gray-800 align-top">{index + 1}</td>
                          <td className="px-6 py-4 w-1/4 border-r border-gray-800 align-top whitespace-nowrap">
                            <Label className="text-sm font-medium text-gray-700">{formatLabel(key)}</Label>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words w-full">{value}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
        {/* A global dialog for download in progress */}
        <Dialog open={Object.values(isDownloading).some(status => status)}>
            <DialogContent className="max-w-sm w-full">
                <DialogHeader>
                    <DialogTitle>Generating PDF</DialogTitle>
                </DialogHeader>
                <div className="p-6 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 mx-auto mb-4 text-blue-600"
                    >
                        <Download className="w-16 h-16" />
                    </motion.div>
                    <p className="text-gray-600">Your PDF is being generated. This may take a moment. Please wait...</p>
                </div>
            </DialogContent>
        </Dialog>
    </motion.div>
  );
}