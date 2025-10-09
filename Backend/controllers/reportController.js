const Report = require("../models/report");

exports.createReport = async (req, res) => {
  try {
    const { name, text, templateId } = req.body;
    if (!name || typeof name !== "string" || !text || typeof text !== "object" || !templateId) {
      return res.status(400).json({ error: "Invalid payload. Expect { name: string, text: object, templateId: uuid }" });
    }

    const report = await Report.create({ name, text, templateId });
    return res.status(201).json(report);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create report" });
  }
};

exports.getReports = async (_req, res) => {
  try {
    const reports = await Report.findAll({ order: [["createdAt", "DESC"]] });
    return res.json(reports);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const count = await Report.destroy({ where: { id } });
    if (count === 0) return res.status(404).json({ error: "Report not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete report" });
  }
};


