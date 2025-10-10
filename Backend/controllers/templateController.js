// const Template = require("../models/template");
// const { parseOfficeAsync } = require("officeparser");
// const path = require("path");
// const fs = require("fs").promises; // Required for reading the file buffer
// const PizZip = require("pizzip"); // Required for docxtemplater
// const Docxtemplater = require("docxtemplater"); // Required for docx manipulation
// const extractPlaceholders = require("../utilities/placeholderExtractor");

// // POST - Add template
// exports.createTemplate = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "Document file required" });

//     const filePath = path.join("uploads", req.file.filename);
//     const text = await parseOfficeAsync(req.file.path);

//     // auto detect placeholders
//     const placeholders = extractPlaceholders(text.toString());

//     const template = await Template.create({
//       name: req.body.name,
//       text: text.toString(),
//       placeholders: placeholders,
//       document: filePath
//     });

//     res.status(201).json(template);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to create template" });
//   }
// };

// // GET - All templates
// exports.getAllTemplates = async (req, res) => {
//   const templates = await Template.findAll();
//   res.json(templates);
// };

// // GET - Single template by ID
// exports.getTemplateById = async (req, res) => {
//   const template = await Template.findByPk(req.params.id);
//   if (!template) return res.status(404).json({ error: "Template not found" });
//   res.json(template);
// };


// // POST - Fill template placeholders
// exports.fillTemplate = async (req, res) => {
//   try {
//     const templateId = req.params.id;
//     const data = req.body.data; // { Name: "John", Date: "2025-10-01", ... }

//     if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
//       return res.status(400).json({ error: "Data for placeholders required and must be an object" });
//     }

//     // Fetch template
//     const template = await Template.findByPk(templateId);
//     if (!template) return res.status(404).json({ error: "Template not found" });

//     // --- DOCX Generation Logic ---

//     // 1. Load the original document file
//     const docPath = template.document; 
//     // Correctly join path relative to current working directory (project root)
//     const absoluteDocPath = path.join(process.cwd(), docPath); 
//     const docBuffer = await fs.readFile(absoluteDocPath); 

//     // 2. Initialize docxtemplater with the file buffer
//     const zip = new PizZip(docBuffer);
//     const doc = new Docxtemplater(zip, {
//       paragraphLoop: true,
//       linebreaks: true,
//       // Explicitly define delimiters to help the parser handle potential XML splits
//       delimiters: {
//         start: '{{',
//         end: '}}',
//       },
//     });
    
//     // 3. Set the data and render 
//     doc.setData(data); // Note: Docxtemplater suggests using .render(data) directly, but this is fine for now
//     doc.render();

//     // 4. Get the output buffer of the filled document
//     const buf = doc.getZip().generate({
//       type: "nodebuffer",
//       mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     });

//     // 5. Send the file as response for download
//     const filename = `${template.name}_filled_${Date.now()}.docx`.replace(/\s/g, '_');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//     res.send(buf);

//   } catch (error) {
//     let errorMessage = "Failed to fill template";
    
//     // Check for Docxtemplater errors 
//     if (error.properties && error.properties.errors && error.properties.errors.length > 0) {
//         console.error("Docxtemplater Error:", JSON.stringify(error.properties.errors, null, 2));
//         errorMessage = `Template filling error: ${error.properties.errors[0].message}`;
//     } else {
//         console.error(error);
//     }
//     res.status(500).json({ error: errorMessage });
//   }
// };


const Template = require("../models/template");
const { parseOfficeAsync } = require("officeparser");
const path = require("path");
const fs = require("fs").promises;
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const extractPlaceholders = require("../utilities/placeholderExtractor");

// -------------------- CREATE TEMPLATE --------------------
exports.createTemplate = async (req, res) => {
  try {
    const documentFile = Array.isArray(req.files?.document) ? req.files.document[0] : undefined;
    const logoFile = Array.isArray(req.files?.logo) ? req.files.logo[0] : undefined;

    if (!documentFile) return res.status(400).json({ error: "Document file required" });

    const filePath = path.join("uploads", documentFile.filename);
    const text = await parseOfficeAsync(documentFile.path);

    // Auto-detect placeholders
    const placeholders = extractPlaceholders(text.toString());

    const template = await Template.create({
      name: req.body.name,
      company: req.body.company,
      description: req.body.description,
      text: text.toString(),
      placeholders: placeholders,
      document: filePath,
      logo: logoFile ? path.join("uploads", logoFile.filename) : null,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create template" });
  }
};


exports.getAllTemplates = async (req, res) => {
  const templates = await Template.findAll();
  res.json(templates);
};


exports.getTemplateById = async (req, res) => {
  const template = await Template.findByPk(req.params.id);
  if (!template) return res.status(404).json({ error: "Template not found" });
  res.json(template);
};

// -------------------- FILL TEMPLATE --------------------
exports.fillTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const data = req.body.data;
    const requestedFormat = (req.body.format || 'docx').toLowerCase();

    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Data for placeholders required and must be an object" });
    }

    const template = await Template.findByPk(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    // --- DOCX Generation ---
    const absoluteDocPath = path.join(process.cwd(), template.document);
    const docBuffer = await fs.readFile(absoluteDocPath);

    const zip = new PizZip(docBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
    });

    // use .render(data) instead of .setData() + .render()
    doc.render(data);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    if (requestedFormat === 'pdf') {
      const os = require('os');
      const pathFs = require('path');
      const { execFile } = require('child_process');
      const execFileAsync = (file, args) => new Promise((resolve, reject) => {
        execFile(file, args, { windowsHide: true }, (error, stdout, stderr) => {
          if (error) return reject(Object.assign(error, { stdout, stderr }));
          resolve({ stdout, stderr });
        });
      });

      // Prefer Microsoft Word on Windows (if installed)
      // Note: Node reports 'win32' on all Windows variants, including 64-bit
      if (process.platform === 'win32') {
        const tmpDir = pathFs.join(os.tmpdir(), 'report_convert');
        await fs.mkdir(tmpDir, { recursive: true });
        const base = `${template.name}_filled_${Date.now()}`.replace(/\s/g, '_');
        const docxPath = pathFs.join(tmpDir, `${base}.docx`);
        const pdfPath = pathFs.join(tmpDir, `${base}.pdf`);
        await fs.writeFile(docxPath, buf);

        const psScript = `
          $ErrorActionPreference = 'Stop'
          $docx = '${docxPath.replace(/\\/g, '/')}'
          $pdf  = '${pdfPath.replace(/\\/g, '/')}'
          $word = New-Object -ComObject Word.Application
          try {
            $word.Visible = $false
            $document = $word.Documents.Open($docx)
            $wdExportFormatPDF = 17
            $document.ExportAsFixedFormat($pdf, $wdExportFormatPDF)
            $document.Close([ref]$false)
          } finally {
            $word.Quit()
          }
        `;

        try {
          await execFileAsync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript]);
          const pdfBuf = await fs.readFile(pdfPath);
          const filename = `${base}.pdf`;
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Type', 'application/pdf');
          await fs.rm(docxPath, { force: true });
          await fs.rm(pdfPath, { force: true });
          return res.send(pdfBuf);
        } catch (wordErr) {
          console.error('Microsoft Word PDF conversion failed:', wordErr);
          // fall through to try LibreOffice next
          try { await fs.rm(docxPath, { force: true }); await fs.rm(pdfPath, { force: true }); } catch {}
        }
      }

      // Fallback: LibreOffice conversion (cross-platform)
      try {
        const libre = require('libreoffice-convert');
        const util = require('util');
        const convertAsync = util.promisify(libre.convert);
        const pdfBuf = await convertAsync(buf, '.pdf', undefined);
        const filename = `${template.name}_filled_${Date.now()}.pdf`.replace(/\s/g, "_");
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');
        return res.send(pdfBuf);
      } catch (convErr) {
        console.error('PDF conversion failed (LibreOffice):', convErr);
        return res.status(500).json({ error: 'PDF conversion failed. Install Microsoft Word (Windows) or LibreOffice and ensure it is on PATH.' });
      }
    }

    const filename = `${template.name}_filled_${Date.now()}.docx`.replace(/\s/g, "_");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buf);
  } catch (error) {
    let errorMessage = "Failed to fill template";

    if (error.properties && error.properties.errors && error.properties.errors.length > 0) {
      console.error("Docxtemplater Error:", JSON.stringify(error.properties.errors, null, 2));
      errorMessage = `Template filling error: ${error.properties.errors[0].message}`;
    } else {
      console.error(error);
    }

    res.status(500).json({ error: errorMessage });
  }
};
