// routes/user.js
const express = require("express");
const { auth } = require("../middleware/auth");
const Assignment = require("../models/Assignment");

const router = express.Router();

// Get all forms assigned to the logged-in user
router.get("/forms", auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ employee: req.user.id })
      .populate("form"); // get full form data

    res.json(assignments);
  } catch (err) {
    console.error("Error fetching user forms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
