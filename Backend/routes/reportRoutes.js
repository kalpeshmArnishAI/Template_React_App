const express = require("express");
const { createReport, getReports, deleteReport } = require("../controllers/reportController");

const router = express.Router();

// POST /api/reports
router.post("/", createReport);
// GET /api/reports
router.get("/", getReports);
// DELETE /api/reports/:id
router.delete("/:id", deleteReport);

module.exports = router;


