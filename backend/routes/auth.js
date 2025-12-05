// routes/auth.js
const express = require("express");
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { employeeId, password } = req.body;
  console.log("Login attempt:", employeeId, password);  // 👈 add this


  try {
    const user = await Employee.findOne({ employeeId });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      employeeId: user.employeeId,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Check if employee exists (for dynamic signup flow)
router.post("/check-employee", async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const employee = await Employee.findOne({ employeeId });

    res.json({
      exists: !!employee,
      employeeId
    });
  } catch (err) {
    console.error("Error checking employee:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Signup new employee
router.post("/signup", async (req, res) => {
  try {
    const { employeeId, name, email, password } = req.body;

    // Validation
    if (!employeeId || !name || !password) {
      return res.status(400).json({
        message: "Employee ID, name, and password are required"
      });
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({
        message: "Employee ID already exists"
      });
    }

    // Create new employee
    const employee = new Employee({
      employeeId,
      name,
      email: email || "",
      role: "USER", // Default role
      passwordHash: "temp" // Temporary, will be replaced by setPassword
    });

    // Hash password
    await employee.setPassword(password);
    await employee.save();

    // Create JWT token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      role: employee.role,
      employeeId: employee.employeeId,
      name: employee.name
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// PASSWORD RESET ENDPOINTS (NEW)
// ============================================

const PasswordReset = require("../models/PasswordReset");
const { sendEmail } = require("../config/email");
const { passwordResetEmail, passwordResetSuccessEmail } = require("../utils/emailTemplates");

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { employeeId, email } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Find employee
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      // Don't reveal if employee exists or not (security)
      return res.json({
        message: "If this employee ID exists, a password reset email has been sent"
      });
    }

    // Verify email matches if provided
    if (email && employee.email && employee.email !== email) {
      return res.status(400).json({ message: "Email does not match our records" });
    }

    // Check if employee has an email
    if (!employee.email) {
      return res.status(400).json({
        message: "No email associated with this account. Please contact your administrator."
      });
    }

    // Generate reset token
    const { token, tokenHash, expiresAt } = PasswordReset.createResetToken(employeeId);

    // Save reset request
    await PasswordReset.create({
      employeeId,
      tokenHash,
      expiresAt
    });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send email
    const emailTemplate = passwordResetEmail(employee.name, resetLink);
    await sendEmail({
      to: employee.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({
      message: "Password reset email sent successfully"
    });
  } catch (err) {
    console.error("Error in forgot-password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify reset token
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const resetRequest = await PasswordReset.verifyToken(token);

    if (!resetRequest) {
      return res.json({ valid: false, message: "Invalid or expired token" });
    }

    res.json({ valid: true, employeeId: resetRequest.employeeId });
  } catch (err) {
    console.error("Error verifying token:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Verify token
    const resetRequest = await PasswordReset.verifyToken(token);
    if (!resetRequest) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find employee
    const employee = await Employee.findOne({ employeeId: resetRequest.employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update password
    await employee.setPassword(newPassword);
    await employee.save();

    // Mark token as used
    resetRequest.used = true;
    resetRequest.usedAt = new Date();
    await resetRequest.save();

    // Send confirmation email
    if (employee.email) {
      const emailTemplate = passwordResetSuccessEmail(employee.name);
      await sendEmail({
        to: employee.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });
    }

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
