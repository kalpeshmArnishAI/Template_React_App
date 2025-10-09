import { motion } from 'framer-motion';
import { FileText, Building2, Calendar, Download, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define and export the shape of a Report object
export interface Report {
  id: number;
  title: string;
  company: string;
  description: string;
  date: string;
  fileType: string;
  data?: Record<string, string>; // Optional field for the filled data
}

// --- COMPONENT PROPS INTERFACE ---
interface AllReportsViewProps {
  reports: Report[];
}

const companyColors: Record<string, string> = {
  TechCorp: 'bg-blue-600',
  InnovaSoft: 'bg-green-600',
  DataWave: 'bg-purple-600',
  NextGen: 'bg-orange-600',
  'Bajaj health insurance': 'bg-red-500',
  'life health insurance': 'bg-indigo-500',
  'HDFC ergo': 'bg-yellow-500',
  Manipal: 'bg-pink-500',
};

export default function AllReportsView({ reports }: AllReportsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-12"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Reports</h2>
        <p className="text-gray-600">Browse and manage all uploaded document templates</p>
      </div>

      {/* Conditional rendering: show message if no reports exist */}
      {reports.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports created</h3>
          <p className="mt-1 text-sm text-gray-500">Go to the "Report" tab to generate your first report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Now mapping over the 'reports' prop passed from App.tsx */}
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
                    <div className={`${companyColors[report.company] || 'bg-gray-600'} p-3 rounded-lg`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                      {report.fileType}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{report.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>{report.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}