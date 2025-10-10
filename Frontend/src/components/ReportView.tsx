// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// // import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Check, ArrowLeft, Save, PartyPopper, RotateCw, FileText } from 'lucide-react';
// import { Textarea } from './ui/textarea';
// // import { Report } from './AllReportsView'; // no longer used here

// // Templates will be fetched from backend

// // --- COMPONENT PROPS INTERFACE ---
// interface ReportViewProps {}

// export default function ReportView({}: ReportViewProps) {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
//   const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
//   const [formData, setFormData] = useState<Record<string, string>>({}); // State for form inputs
//   const [availableTemplates, setAvailableTemplates] = useState<{ id: string; name: string }[]>([]);
//   type Field = { key: string; label: string };
//   const [fields, setFields] = useState<Field[]>([]);
//   const [templateLogoUrl, setTemplateLogoUrl] = useState<string | null>(null);

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

//   useEffect(() => {
//     const fetchTemplates = async () => {
//       try {
//         const res = await fetch('http://localhost:8000/api/templates');
//         if (!res.ok) throw new Error('Failed to fetch templates');
//         const data = await res.json();
//         // Expecting array of templates with at least id and name
//         const mapped = (Array.isArray(data) ? data : []).map((template: any) => ({ id: template.id, name: template.name }));
//         setAvailableTemplates(mapped);
//       } catch (e) {
//         console.error(e);
//       }
//     };
//     fetchTemplates();
//   }, []);

//   const fetchTemplateDetails = async (templateId: string) => {
//     try {
//       const res = await fetch(`http://localhost:8000/api/templates/${templateId}`);
//       if (!res.ok) throw new Error('Failed to fetch template details');
//       const data = await res.json();
//       // backend stores placeholders like "{{Name}}"; clean them to keys like "Name"
//       const cleaned = (Array.isArray(data.placeholders) ? data.placeholders : [])
//         .map((ph: string) => ph.replace(/[{}]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim())
//         .filter(Boolean);
//       const dedupedKeys: string[] = [];
//       const seen = new Set<string>();
//       for (const keyRaw of cleaned) {
//         const key = keyRaw.toLowerCase();
//         if (seen.has(key)) continue;
//         seen.add(key);
//         dedupedKeys.push(keyRaw);
//       }
//       const mapped: Field[] = dedupedKeys.map(k => ({ key: k, label: formatLabel(k) }));
//       setFields(mapped);

//       // compute logo url from backend response
//       let computedLogo: string | null = null;
//       if (data && data.logo) {
//         const raw: string = String(data.logo);
//         if (/^https?:\/\//i.test(raw)) {
//           computedLogo = raw;
//         } else {
//           const trimmed = raw.replace(/^\/*/, '');
//           computedLogo = `http://localhost:8000/${trimmed}`;
//         }
//       }
//       setTemplateLogoUrl(computedLogo);
//     } catch (e) {
//       console.error(e);
//       setFields([]);
//     }
//   };

//   const steps = [
//     { number: 1, title: 'Choose Template', subtitle: 'Select a template' },
//     { number: 2, title: 'Fill Data', subtitle: 'Enter required details' },
//     { number: 3, title: 'Finish', subtitle: 'Report submitted' },
//   ];

//   const handleNext = async () => {
//     if (selectedTemplateId && currentStep < steps.length) {
//       await fetchTemplateDetails(selectedTemplateId);
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSaveAndSubmit = async () => {
//     if (!selectedTemplateId || !selectedTemplateName) return;

//     // Move to Finish step immediately
//     setCurrentStep(3);

//     // Create report entry in DB (no file download)
//     try {
//       const payload = {
//         name: `${selectedTemplateName} Report`,
//         text: formData, // key/value pairs for placeholders and inputs
//         templateId: selectedTemplateId,
//       };
//       const res = await fetch('http://localhost:8000/api/reports', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to save report');
//       // Optionally, we could read the created report: const saved = await res.json();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleReset = () => {
//     setSelectedTemplateId(null);
//     setSelectedTemplateName(null);
//     setFormData({}); // Clear form data
//     setFields([]);
//     setTemplateLogoUrl(null);
//     setCurrentStep(1);
//   };

//   const handleInputChange = (fieldName: string, value: string) => {
//     setFormData(prev => ({ ...prev, [fieldName]: value }));
//   };

//   // --- JSX REMAINS UNCHANGED, ONLY LOGIC IS UPDATED ---
//   return (
//     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-6 py-12">
//       <div className="bg-white rounded-lg shadow-xl border border-gray-200">
//         {/* Stepper UI at the top */}
//         <div className="p-6 md:p-8 border-b border-gray-200">
//           <h2 className="text-xl font-bold text-gray-800 mb-8 md:mb-12 text-center">Create Report</h2>
//           <div className="w-full max-w-xl mx-auto">
//             <div className="relative">
//               {/* Connector Line Track */}
//               <div className="absolute left-16 right-16 top-4 h-0.5">
//                 <div className="absolute top-0 left-0 h-full bg-gray-200 w-full"></div>
//                 <div
//                   className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 ease-in-out"
//                   style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
//                 ></div>
//               </div>

//               {/* Step Nodes */}
//               <div className="relative flex justify-between">
//                 {steps.map((step) => (
//                   <div key={step.number} className="text-center flex flex-col items-center z-10">
//                     {/* Circle */}
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all duration-300
//                         ${(currentStep > step.number || (currentStep === steps.length && step.number === steps.length)) ? 'bg-green-500 text-white' : ''}
//                         ${(currentStep === step.number && currentStep < steps.length) ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
//                         ${currentStep < step.number ? 'bg-gray-200 text-gray-500' : ''}
//                       `}
//                     >
//                       {(currentStep > step.number || (currentStep === step.number && step.number === steps.length)) ? <Check className="w-5 h-5" /> : step.number}
//                     </div>
//                     {/* Text */}
//                     <div className="mt-2 w-32">
//                       <h3 className={`font-bold text-sm ${currentStep < step.number ? 'text-gray-400' : 'text-gray-800'}`}>
//                         {step.title}
//                       </h3>
//                       <p className="text-xs text-gray-500">{step.subtitle}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//         <main className="p-8">
//           {currentStep === 1 && (<StepContent title="Choose Template" description="Please select a template from the list to begin generating your report."><div className="space-y-2"><Label htmlFor="template-select" className="text-sm font-medium text-gray-700">Available Templates</Label><Select onValueChange={(value) => { setSelectedTemplateId(value); const t = availableTemplates.find(x => x.id === value); setSelectedTemplateName(t?.name ?? null); }} defaultValue={selectedTemplateId ?? undefined}><SelectTrigger id="template-select" className="w-full bg-gray-50"><SelectValue placeholder="Choose a template..." /></SelectTrigger><SelectContent>{availableTemplates.map((template) => (<SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>))}</SelectContent></Select></div><div className="flex justify-end pt-8"><Button onClick={handleNext} disabled={!selectedTemplateId}>Next</Button></div></StepContent>)}
//           {currentStep === 2 && (
//             <StepContent title="" description="">
//               <div className="flex flex-col items-center text-center p-4 mb-1 border border-gray-800">
//                 {templateLogoUrl ? (
//                   <img src={templateLogoUrl} alt="Template logo" className="w-40 h-40 object-contain mb-3" />
//                 ) : (
//                   <FileText className="w-12 h-12 text-blue-600 mb-3" />
//                 )}
//                 <h2 className="text-xl font-bold text-gray-800">{selectedTemplateName}</h2>
//                 <p className="text-sm text-gray-500 mt-1">Please fill in the required details for this template.</p>
//               </div>
//               <form className="w-full max-w-8xl mx-auto" onSubmit={(e) => e.preventDefault()}>
//                 <div className="border border-gray-800  overflow-hidden">
//                   <table className="w-full">
//                     <tbody className=" divide-y divide-gray-800 bg-white">
//                       {fields.map((f, index) => (
//                         <tr key={f.key} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
//                           <td className="px-6 py-4 w-1/2 border-r border-gray-800">
//                             <Label htmlFor={f.key} className="text-sm font-medium text-gray-700">
//                               {f.label}
//                             </Label>
//                           </td>
//                           <td className="px-6 py-4">
//                             <Textarea
//                               id={f.key}
//                               placeholder={`Enter ${f.label}...`}
//                               className="bg-white border-gray-300 w-full"
//                               value={formData[f.key] || ''}
//                               onChange={(e) => handleInputChange(f.key, e.target.value)}
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </form>
//               <div className="flex justify-between items-center pt-8 max-w-8xl mx-auto">
//                 <Button variant="outline" onClick={handlePrevious}>
//                   <ArrowLeft className="w-4 h-4 mr-2" /> Previous
//                 </Button>
//                 <Button onClick={handleSaveAndSubmit}>
//                   <Save className="w-4 h-4 mr-2" /> Save & Submit
//                 </Button>
//               </div>
//             </StepContent>
//           )}
//           {currentStep === 3 && (<StepContent title="" description=""><div className="text-center flex flex-col items-center justify-center h-full py-16"><PartyPopper className="w-20 h-20 text-green-500 mb-6" /><h2 className="text-3xl font-bold text-gray-800">Report Submitted!</h2><p className="text-gray-500 mt-2">Your report has been successfully generated and saved.</p><Button variant="outline" onClick={handleReset} className="mt-8"><RotateCw className="w-4 h-4 mr-2" /> Create Another Report</Button></div></StepContent>)}
//         </main>
//       </div>
//     </motion.div>
//   );
// }

// function StepContent({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
//   return (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>{title && (<div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-1">{description}</p></div>)}<div>{children}</div></motion.div>);
// }



import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowLeft, Save, PartyPopper, RotateCw, FileText } from 'lucide-react';
import { Textarea } from './ui/textarea';
// import { Report } from './AllReportsView'; // no longer used here

// Templates will be fetched from backend

// --- COMPONENT PROPS INTERFACE ---
interface ReportViewProps {}

export default function ReportView({}: ReportViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({}); // State for form inputs
  const [availableTemplates, setAvailableTemplates] = useState<{ id: string; name: string }[]>([]);
  type Field = { key: string; label: string };
  const [fields, setFields] = useState<Field[]>([]);
  const [templateLogoUrl, setTemplateLogoUrl] = useState<string | null>(null);
  const [templateDescription, setTemplateDescription] = useState<string | null>(null);

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
        .map((placeholder: string) => placeholder.replace(/[{}]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);
      const dedupedKeys: string[] = [];
      const seen = new Set<string>();
      for (const keyRaw of cleaned) {
        const key = keyRaw.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        dedupedKeys.push(keyRaw);
      }
      const mapped: Field[] = dedupedKeys.map(duplicateKey => ({ key: duplicateKey, label: formatLabel(duplicateKey) }));
      setFields(mapped);

      // compute logo url from backend response
      let computedLogo: string | null = null;
      if (data && data.logo) {
        const raw: string = String(data.logo);
        if (/^https?:\/\//i.test(raw)) {
          computedLogo = raw;
        } else {
          const trimmed = raw.replace(/^\/*/, '');
          computedLogo = `http://localhost:8000/${trimmed}`;
        }
      }
      setTemplateLogoUrl(computedLogo);
      // set template description if available
      if (data && typeof data.description === 'string' && data.description.trim().length > 0) {
        setTemplateDescription(data.description.trim());
      } else {
        setTemplateDescription(null);
      }
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

    // Move to Finish step immediately
    setCurrentStep(3);

    // Create report entry in DB (no file download)
    try {
      const payload = {
        name: `${selectedTemplateName} Report`,
        text: formData, // key/value pairs for placeholders and inputs
        templateId: selectedTemplateId,
      };
      const res = await fetch('http://localhost:8000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save report');
      // Optionally, we could read the created report: const saved = await res.json();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setSelectedTemplateId(null);
    setSelectedTemplateName(null);
    setFormData({}); // Clear form data
    setFields([]);
    setTemplateLogoUrl(null);
    setTemplateDescription(null);
    setCurrentStep(1);
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // --- JSX REMAINS UNCHANGED, ONLY LOGIC IS UPDATED ---
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-6 py-12">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        {/* Stepper UI at the top */}
        <div className="p-6 md:p-8 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-8 md:mb-12 text-center">Create Report</h2>
          <div className="w-full max-w-xl mx-auto">
            <div className="relative">
              {/* Connector Line Track */}
              <div className="absolute left-16 right-16 top-4 h-0.5">
                <div className="absolute top-0 left-0 h-full bg-gray-200 w-full"></div>
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-700 ease-in-out"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Step Nodes */}
              <div className="relative flex justify-between">
                {steps.map((step) => (
                  <div key={step.number} className="text-center flex flex-col items-center z-10">
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                        ${(currentStep > step.number || (currentStep === steps.length && step.number === steps.length)) ? 'bg-green-500 text-white' : ''}
                        ${(currentStep === step.number && currentStep < steps.length) ? 'bg-blue-600 text-white ring-4 ring-blue-200' : ''}
                        ${currentStep < step.number ? 'bg-gray-200 text-gray-500' : ''}
                      `}
                    >
                      {(currentStep > step.number || (currentStep === step.number && step.number === steps.length)) ? <Check className="w-5 h-5" /> : step.number}
                    </div>
                    {/* Text */}
                    <div className="mt-2 w-32">
                      <h3 className={`font-bold text-sm ${currentStep < step.number ? 'text-gray-400' : 'text-gray-800'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <main className="p-8">
          {currentStep === 1 && (<StepContent title="Choose Template" description="Please select a template from the list to begin generating your report."><div className="space-y-2"><Label htmlFor="template-select" className="text-sm font-medium text-gray-700">Available Templates</Label><Select onValueChange={(value) => { setSelectedTemplateId(value); const t = availableTemplates.find(x => x.id === value); setSelectedTemplateName(t?.name ?? null); }} defaultValue={selectedTemplateId ?? undefined}><SelectTrigger id="template-select" className="w-full bg-gray-50"><SelectValue placeholder="Choose a template..." /></SelectTrigger><SelectContent>{availableTemplates.map((template) => (<SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>))}</SelectContent></Select></div><div className="flex justify-end pt-8"><Button onClick={handleNext} disabled={!selectedTemplateId}>Next</Button></div></StepContent>)}
          {currentStep === 2 && (
            <StepContent title="" description="">
              <div className="flex flex-col items-center text-center p-4 mb-1 border border-gray-800">
                {templateLogoUrl ? (
                  <img src={templateLogoUrl} alt="Template logo" className="w-40 h-40 object-contain mb-3" />
                ) : (
                  <FileText className="w-12 h-12 text-blue-600 mb-3" />
                )}
                <h2 className="text-xl font-bold text-gray-800">{selectedTemplateName}</h2>
                {templateDescription ? (
                  <p className="text-sm text-gray-600 mt-1 max-w-3xl">{templateDescription}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Please fill in the required details for this template.</p>
                )}
              </div>
              <form className="w-full max-w-8xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                <div className="border border-gray-800  overflow-hidden">
                  <table className="w-full">
                    <tbody className=" divide-y divide-gray-800 bg-white">
                      {fields.map((f, index) => (
                        <tr key={f.key} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-4 w-12 text-center border-r border-gray-800">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 w-1/4 border-r border-gray-800">
                            <Label htmlFor={f.key} className="text-sm font-medium text-gray-700">
                              {f.label}
                            </Label>
                          </td>
                          <td className="px-6 py-4">
                            <Textarea
                              id={f.key}
                              // placeholder={`Enter ${f.label}...`}
                              className="bg-white border-gray-100 w-full "
                              value={formData[f.key] || ''}
                              onChange={(e) => handleInputChange(f.key, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </form>
              <div className="flex justify-between items-center pt-8 max-w-8xl mx-auto">
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
                <Button onClick={handleSaveAndSubmit}>
                  <Save className="w-4 h-4 mr-2" /> Save & Submit
                </Button>
              </div>
            </StepContent>
          )}
          {currentStep === 3 && (<StepContent title="" description=""><div className="text-center flex flex-col items-center justify-center h-full py-16"><PartyPopper className="w-20 h-20 text-green-500 mb-6" /><h2 className="text-3xl font-bold text-gray-800">Report Submitted!</h2><p className="text-gray-500 mt-2">Your report has been successfully generated and saved.</p><Button variant="outline" onClick={handleReset} className="mt-8"><RotateCw className="w-4 h-4 mr-2" /> Create Another Report</Button></div></StepContent>)}
        </main>
      </div>
    </motion.div>
  );
}

function StepContent({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>{title && (<div className="mb-6"><h2 className="text-2xl font-bold text-gray-800">{title}</h2><p className="text-gray-500 mt-1">{description}</p></div>)}<div>{children}</div></motion.div>);
}

