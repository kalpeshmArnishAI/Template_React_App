// import { useState } from 'react';
// import { Toaster } from '@/components/ui/sonner';
// import Header from '@/components/Header';
// import TemplateUploadForm from '@/components/TemplateUploadForm';
// import ReportView from '@/components/ReportView';
// import AllReportsView from '@/components/AllReportsView';

// function App() {
//   const [currentView, setCurrentView] = useState<'upload' | 'report' | 'all-reports'>('upload');

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Header currentView={currentView} onNavigate={setCurrentView} />

//       {currentView === 'upload' && <TemplateUploadForm />}
//       {currentView === 'report' && <ReportView />}
//       {currentView === 'all-reports' && <AllReportsView />}

//       <Toaster theme="light" richColors />
//     </div>
//   );
// }

// export default App;


import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/Header';
import TemplateUploadForm from '@/components/TemplateUploadForm';
import ReportView from '@/components/ReportView';
import AllReportsView, { Report } from '@/components/AllReportsView';

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'report' | 'all-reports'>('upload');
  const [reports, setReports] = useState<Report[]>([]);

  // Load saved reports from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('reports');
      if (raw) {
        const parsed = JSON.parse(raw) as Report[];
        if (Array.isArray(parsed)) setReports(parsed);
      }
    } catch {}
  }, []);

  // Persist reports to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('reports', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  const handleCreateReport = (newReport: Report) => {
    // Add the new report to the existing list.
    setReports(prevReports => [newReport, ...prevReports]);
    // Navigate to All Reports to view the saved report
    setCurrentView('all-reports');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {currentView === 'upload' && <TemplateUploadForm />}
      {currentView === 'report' && <ReportView onReportCreate={handleCreateReport} />}
      {currentView === 'all-reports' && <AllReportsView reports={reports} />}

      <Toaster theme="light" richColors />
    </div>
  );
}

export default App;