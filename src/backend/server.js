const express = require('express');
const cors = require('cors');
const templatesRouter = require('./routes/templates');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/templates', templatesRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));