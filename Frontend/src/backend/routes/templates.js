const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// GET all templates
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM templates');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST a new template
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'templateFile', maxCount: 1 }]), async (req, res) => {
  const { title, company, description } = req.body;
  const logo = req.files['logo'][0].path;
  const templateFile = req.files['templateFile'][0].path;

  try {
    await db.query('INSERT INTO templates (title, company, description, logo, templateFile) VALUES (?, ?, ?, ?, ?)', [title, company, description, logo, templateFile]);
    res.status(201).send('Template created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;