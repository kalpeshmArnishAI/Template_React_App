// const express = require("express");
// const sequelize = require("./utilities/db");
// const templateRoutes = require("./routes/templateRoutes");
// const logger = require("./middleware/logger");

// const app = express();
// const PORT = 8000;

// app.use(express.json());
// app.use(logger); // custom middleware
// app.use(express.static("public"));


// // test route
// app.get("/", (req, res) => {
  
//   res.send("Welcome to Template API 🚀");
// });

// app.use("/api/templates", templateRoutes);

// // DB connection
// sequelize.sync()
//   .then(() => { console.log("Table is Created");})
// .catch(err => console.error("error:", err));

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



const express = require("express");
const cors = require("cors");
const sequelize = require("./utilities/db");
const templateRoutes = require("./routes/templateRoutes");
const reportRoutes = require("./routes/reportRoutes");
const logger = require("./middleware/logger");

const app = express();
const PORT = 8000;

// Enable CORS for your React app
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(logger);

// Remove this old line 👇
// app.use(express.static("public"));

// Serve uploaded files (documents, logos)
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to Template API 🚀");
});

// API routes
app.use("/api/templates", templateRoutes);
app.use("/api/reports", reportRoutes);

// DB connection
sequelize.sync({alter: true})
  .then(() => console.log("Table is Created"))
  .catch(err => console.error("error:", err));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
