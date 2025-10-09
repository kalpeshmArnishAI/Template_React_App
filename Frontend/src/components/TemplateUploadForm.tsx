import { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const companies = ['Bajaj health insurance', 'life health insurance', 'HDFC ergo', 'Manipal'];

export default function TemplateUploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB',{position: 'top-center',style: {backgroundColor: 'red',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a DOC or DOCX file',{position: 'top-center',style: {backgroundColor: 'red',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Template file size must be less than 10MB',{position: 'top-center',style: {backgroundColor: 'red',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
        return;
      }
      setTemplateFile(file);
      toast.success('Template file selected',{position: 'top-center', duration: 1000,style: {backgroundColor: '#198754',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !templateFile) {
      toast.error('Please fill in all required fields',{position: 'top-center',style: {backgroundColor: 'red',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('name', formData.title);
      form.append('company', formData.company);
      form.append('description', formData.description || '');
      form.append('document', templateFile as Blob, templateFile.name);
      if (logoFile) {
        form.append('logo', logoFile as Blob, logoFile.name);
      }

      const response = await fetch('http://localhost:8000/api/templates', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = (errorData && (errorData.error || errorData.message)) || 'Upload failed';
        throw new Error(message);
      }

      await response.json();

      toast.success('Template uploaded successfully!',{position: 'top-center',style: {backgroundColor: '#198754',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
      setFormData({ title: '', company: '', description: '' });
      setLogoPreview(null);
      setLogoFile(null);
      setTemplateFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message,{position: 'top-center',style: {backgroundColor: 'red',color: 'white',height: '50px',borderRadius: '10px',padding: '10px',fontSize: '16px',textAlign: 'center'}});
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  const removeTemplateFile = () => {
    setTemplateFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-12"
    >
      <div className="max-w-3xl mx-auto">
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-500" />
              Upload New Template
            </CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details below to upload a new document template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700">
                  Template Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Sales Proposal Template"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-700">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {companies.map((company) => (
                      <SelectItem key={company} value={company} className="text-gray-900 focus:bg-gray-100">
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-gray-700">
                  Company Logo
                </Label>
                {logoPreview ? (
                  <div className="relative">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain rounded-lg bg-white" />
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{logoFile?.name}</p>
                        <p className="text-gray-600 text-sm">{(logoFile!.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeLogo}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="logo"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or SVG (MAX. 5MB)</p>
                    </div>
                    <input id="logo" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">
                  Template Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose and usage of this template..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-file" className="text-gray-700">
                  Template File <span className="text-red-500">*</span>
                </Label>
                {templateFile ? (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{templateFile.name}</p>
                      <p className="text-gray-600 text-sm">{(templateFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeTemplateFile}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="template-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">DOC or DOCX (MAX. 10MB)</p>
                    </div>
                    <input
                      id="template-file"
                      type="file"
                      className="hidden"
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleTemplateFileChange}
                    />
                  </label>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 rounded-lg shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Upload className="w-5 h-5" />
                      </motion.div>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Save Template
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
