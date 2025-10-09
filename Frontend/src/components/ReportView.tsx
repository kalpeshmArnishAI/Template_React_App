import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowLeft, Save, PartyPopper, RotateCw } from 'lucide-react';
import { Report } from './AllReportsView'; // Import the Report type

// Templates will be fetched from backend

const templateFields: Record<string, string[]> = {
  'Bajaj health insurance': ['Policy Holder Name', 'Policy Number', 'Date of Birth', 'Contact Number'],
  'life health insurance': ['Applicant Name', 'Sum Assured', 'Nominee Name', 'Annual Income'],
  'HDFC ergo': ['Vehicle Registration No.', 'Chassis Number', 'Engine Number', 'Year of Manufacture'],
  'Manipal': ["Patient ID", "Admission Date", "Doctor's Name", "Diagnosis Details"],
};

// --- COMPONENT PROPS INTERFACE ---
interface ReportViewProps {
  onReportCreate: (newReport: Report) => void;
}

export default function ReportView({ onReportCreate }: ReportViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({}); // State for form inputs
  const [availableTemplates, setAvailableTemplates] = useState<{ id: string; name: string }[]>([]);
  type Field = { key: string; label: string };
  const [fields, setFields] = useState<Field[]>([]);

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

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/templates');
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        // Expecting array of templates with at least id and name
        const mapped = (Array.isArray(data) ? data : []).map((template: any) => ({ id: template.id, name: template.name }));
        setAvailableTemplates(mapped);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTemplates();
  }, []);

  const fetchTemplateDetails = async (templateId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/templates/${templateId}`);
      if (!res.ok) throw new Error('Failed to fetch template details');
      const data = await res.json();
      // backend stores placeholders like "{{Name}}"; clean them to keys like "Name"
      const cleaned = (Array.isArray(data.placeholders) ? data.placeholders : [])
        .map((ph: string) => ph.replace(/[{}]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      const dedupedKeys: string[] = [];
      const seen = new Set<string>();
      for (const keyRaw of cleaned) {
        const key = keyRaw.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        dedupedKeys.push(keyRaw);
      }
      const mapped: Field[] = dedupedKeys.map(k => ({ key: k, label: formatLabel(k) }));
      setFields(mapped);
    } catch (e) {
      console.error(e);
      setFields([]);
    }
  };

  const steps = [
    { number: 1, title: 'Choose Template', subtitle: 'Select a template' },
    { number: 2, title: 'Fill Data', subtitle: 'Enter required details' },
    { number: 3, title: 'Finish', subtitle: 'Report submitted' },
  ];

  const handleNext = async () => {
    if (selectedTemplateId && currentStep < steps.length) {
      await fetchTemplateDetails(selectedTemplateId);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndSubmit = async () => {
    if (!selectedTemplateId || !selectedTemplateName) return;

    // Create a new report object from the collected state (for local tracking/UI)
    const newReport: Report = {
      id: Date.now(),
      title: `${selectedTemplateName} Report`,
      company: selectedTemplateName,
      description: `Report generated on ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      fileType: 'REPORT',
      data: formData,
    };

    // Trigger backend fill to generate a filled DOCX
    try {
      const res = await fetch(`http://localhost:8000/api/templates/${selectedTemplateId}/fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      if (!res.ok) throw new Error('Failed to generate filled template');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplateName}_filled_${Date.now()}.docx`.replace(/\s/g, '_');
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }

    onReportCreate(newReport);
    setCurrentStep(3);
  };

  const handleReset = () => {
    setSelectedTemplateId(null);
    setSelectedTemplateName(null);
    setFormData({}); // Clear form data
    setFields([]);
    setCurrentStep(1);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // --- JSX REMAINS UNCHANGED, ONLY LOGIC IS UPDATED ---
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-6 py-12">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 flex max-h-[calc(100vh-6rem)]">
        <aside className="w-1/3 md:w-1/4 p-8 border-r border-gray-200 sticky top-8 self-start h-fit">{/* Stepper UI */}<h2 className="text-xl font-bold text-gray-800 mb-8">Create Report</h2><div className="relative"><div className="absolute left-4 top-4 w-px bg-gray-200" style={{ height: `calc(100% - 2rem)` }}><motion.div className="h-full w-full bg-blue-600" style={{ originY: 0 }} initial={{ scaleY: 0 }} animate={{ scaleY: (currentStep - 1) / (steps.length - 1) }} transition={{ duration: 0.4, ease: 'easeInOut' }} /></div>{steps.map((step) => (<div key={step.number} className="flex items-start mb-8 last:mb-0 relative"><div className="relative z-10 flex items-center justify-center">{currentStep > step.number || (currentStep === steps.length && step.number === steps.length) ? (<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white"><Check className="w-5 h-5" /></div>) : currentStep === step.number ? (<div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-blue-200 flex items-center justify-center font-semibold text-white">{step.number}</div>) : (<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-400 border border-gray-200">{step.number}</div>)}</div><div className="ml-4 pt-1"><h3 className={`font-semibold ${currentStep >= step.number ? 'text-gray-800' : 'text-gray-400'}`}>{step.title}</h3><p className="text-sm text-gray-400">{step.subtitle}</p></div></div>))}</div></aside>
        <main className="w-2/3 md:w-3/4 p-8 overflow-y-auto max-h-[calc(100vh-6rem)]">
          {currentStep === 1 && (<StepContent title="Choose Template" description="Please select a template from the list to begin generating your report."><div className="space-y-2"><Label htmlFor="template-select" className="text-sm font-medium text-gray-700">Available Templates</Label><Select onValueChange={(value) => { setSelectedTemplateId(value); const t = availableTemplates.find(x => x.id === value); setSelectedTemplateName(t?.name ?? null); }} defaultValue={selectedTemplateId ?? undefined}><SelectTrigger id="template-select" className="w-full bg-gray-50"><SelectValue placeholder="Choose a template..." /></SelectTrigger><SelectContent>{availableTemplates.map((template) => (<SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>))}</SelectContent></Select></div><div className="flex justify-end pt-8"><Button onClick={handleNext} disabled={!selectedTemplateId}>Next</Button></div></StepContent>)}
          {currentStep === 2 && (<StepContent title="Fill Data" description={`You are filling out the "${selectedTemplateName ?? ''}" template.`}><form className="space-y-4" onSubmit={(e) => e.preventDefault()}>{fields.map((f) => (<div key={f.key} className="space-y-2"><Label htmlFor={f.key} className="text-sm font-medium text-gray-700">{f.label}</Label><Input id={f.key} placeholder={`Enter ${f.label}...`} className="bg-gray-50 border-gray-300" value={formData[f.key] || ''} onChange={(e) => handleInputChange(f.key, e.target.value)} /></div>))}</form><div className="flex justify-between items-center pt-8"><Button variant="outline" onClick={handlePrevious}><ArrowLeft className="w-4 h-4 mr-2" /> Previous</Button><Button onClick={handleSaveAndSubmit}><Save className="w-4 h-4 mr-2" /> Save</Button></div></StepContent>)}
          {currentStep === 3 && (<StepContent title="" description=""><div className="text-center flex flex-col items-center justify-center h-full py-16"><PartyPopper className="w-20 h-20 text-green-500 mb-6" /><h2 className="text-3xl font-bold text-gray-800">Report Submitted!</h2><p className="text-gray-500 mt-2">Your report has been successfully generated and saved.</p><Button variant="outline" onClick={handleReset} className="mt-8"><RotateCw className="w-4 h-4 mr-2" /> Create Another Report</Button></div></StepContent>)}
        </main>
      </div>
    </motion.div>
  );
}

function StepContent({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>{title && (<div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-1">{description}</p></div>)}<div>{children}</div></motion.div>);
}