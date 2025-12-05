// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db"); // ⬅️ THIS LINE IS IMPORTANT
dotenv.config();

connectDB(); // ⬅️ call it once at startup

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/user", require("./routes/user"));
app.use("/response", require("./routes/response"));
app.use("/administrator", require("./routes/administrator"));

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, "public")));

  // Handle React routing - use middleware instead of route for Express 5.x compatibility
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
} else {
  // Development mode - API test route
  app.get("/", (req, res) => {
    res.send("Feedback backend running ✅");
  });
}

// choose port from .env or default 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV === "production") {
    console.log(`📦 Serving frontend from /public`);
  }
});
