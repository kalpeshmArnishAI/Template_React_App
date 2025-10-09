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
