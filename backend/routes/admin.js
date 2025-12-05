// routes/admin.js
const express = require("express");
const Form = require("../models/Form");
const Assignment = require("../models/Assignment");
const Employee = require("../models/Employee");
const Response = require("../models/Response");
const { auth, isAdmin, isAdminOrAbove } = require("../middleware/auth");

const router = express.Router();

// Create a new feedback form (ADMIN OR ADMINISTRATOR)
router.post("/forms", auth, isAdminOrAbove, async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Title and questions are required" });
    }

    const form = await Form.create({
      title,
      description,
      questions,
      createdBy: req.user.id
    });

    res.status(201).json(form);
  } catch (err) {
    console.error("Error creating form:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Assign a form to multiple employees by their employeeId or name (ADMIN OR ADMINISTRATOR)
router.post("/forms/:formId/assign", auth, isAdminOrAbove, async (req, res) => {
  try {
    const { formId } = req.params;
    let { employeeIds = [], employeeNames = [] } = req.body;

    // 🔹 Normalize employeeIds: allow array OR comma-separated string
    if (!Array.isArray(employeeIds)) {
      employeeIds =
        typeof employeeIds === "string" && employeeIds.trim().length > 0
          ? employeeIds.split(",").map((id) => id.trim())
          : [];
    }

    // 🔹 Normalize employeeNames: allow array OR comma-separated string
    if (!Array.isArray(employeeNames)) {
      employeeNames =
        typeof employeeNames === "string" && employeeNames.trim().length > 0
          ? employeeNames.split(",").map((name) => name.trim())
          : [];
    }

    // At least one identifier must be provided
    if (employeeIds.length === 0 && employeeNames.length === 0) {
      return res
        .status(400)
        .json({ message: "employeeIds or employeeNames are required" });
    }

    // Build query to match either employeeId or name
    const orConditions = [];
    if (employeeIds.length > 0) {
      orConditions.push({ employeeId: { $in: employeeIds } });
    }
    if (employeeNames.length > 0) {
      orConditions.push({ name: { $in: employeeNames } });
    }

    const query = { $or: orConditions };

    // Find matching employees
    const employees = await Employee.find(query);

    if (employees.length === 0) {
      return res.status(400).json({ message: "No matching employees found" });
    }

    // create or update assignments (upsert)
    const assignments = await Promise.all(
      employees.map((emp) =>
        Assignment.findOneAndUpdate(
          { form: formId, employee: emp._id },
          { form: formId, employee: emp._id },
          { new: true, upsert: true }
        )
      )
    );

    // ============================================
    // SEND EMAIL NOTIFICATIONS (NEW - Feature 4)
    // ============================================
    const { sendEmail } = require("../config/email");
    const { formAssignmentEmail } = require("../utils/emailTemplates");

    // Get form details for email
    const form = await Form.findById(formId);

    // Get Admin details for Reply-To
    const admin = await Employee.findById(req.user.id);

    // Send emails asynchronously (don't block response)
    if (form) {
      const formLink = `${process.env.FRONTEND_URL}/user`; // User dashboard where they can see assigned forms

      // Send emails to all assigned employees
      Promise.all(
        employees.map(async (employee) => {
          if (employee.email) {
            try {
              const emailTemplate = formAssignmentEmail(
                employee.name,
                form.title,
                form.description || "",
                formLink
              );

              await sendEmail({
                to: employee.email,
                replyTo: admin ? admin.email : undefined, // 👈 Allow employee to reply to Admin
                subject: emailTemplate.subject,
                html: emailTemplate.html
              });

              console.log(`✅ Email sent to ${employee.name} (${employee.email})`);
            } catch (emailError) {
              console.error(`❌ Failed to send email to ${employee.email}:`, emailError.message);
              // Don't fail the assignment if email fails
            }
          }
        })
      ).catch(err => console.error("Email sending error:", err));
    }

    res.json({
      message: "Form assigned successfully",
      matchedEmployees: employees.map((e) => ({
        employeeId: e.employeeId,
        name: e.name,
      })),
      count: assignments.length,
      assignments,
    });
  } catch (err) {
    console.error("Error assigning form:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all forms (for admin list / dashboard)
router.get("/forms", auth, isAdminOrAbove, async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error("Error fetching forms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a form (ADMIN OR ADMINISTRATOR)
router.put("/forms/:formId", auth, isAdminOrAbove, async (req, res) => {
  try {
    const { formId } = req.params;
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Title and questions are required" });
    }

    const updatedForm = await Form.findByIdAndUpdate(
      formId,
      { title, description, questions },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(updatedForm);
  } catch (err) {
    console.error("Error updating form:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all responses for a specific form (ADMIN OR ADMINISTRATOR)
router.get("/forms/:formId/responses", auth, isAdminOrAbove, async (req, res) => {
  try {
    const { formId } = req.params;

    const responses = await Response.find({ form: formId })
      .populate("employee", "employeeId name email")
      .sort({ submittedAt: -1 });

    res.json(responses);
  } catch (err) {
    console.error("Error fetching responses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// PER-ADMIN DATA ISOLATION ENDPOINTS (NEW)
// ============================================

// Get only MY forms (forms created by logged-in admin)
router.get("/my-forms", auth, isAdminOrAbove, async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error("Error fetching my forms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get analytics for only MY forms
router.get("/my-analytics", auth, isAdminOrAbove, async (req, res) => {
  try {
    // Get only forms created by this admin
    const myForms = await Form.find({ createdBy: req.user.id });
    const myFormIds = myForms.map(f => f._id);

    // Count total forms
    const totalForms = myForms.length;

    // Count responses only for my forms
    const totalResponses = await Response.countDocuments({
      form: { $in: myFormIds }
    });

    // Get employee stats for my forms only
    const assignments = await Assignment.find({
      form: { $in: myFormIds }
    }).populate("employee", "employeeId name");

    const employeeStats = await Promise.all(
      assignments.map(async (assignment) => {
        const responseCount = await Response.countDocuments({
          form: assignment.form,
          employee: assignment.employee._id
        });

        return {
          employeeId: assignment.employee.employeeId,
          name: assignment.employee.name,
          assignedForms: 1, // Each assignment is one form
          completedForms: responseCount
        };
      })
    );

    // Aggregate employee stats (in case same employee has multiple assignments)
    const aggregatedStats = {};
    employeeStats.forEach(stat => {
      if (aggregatedStats[stat.employeeId]) {
        aggregatedStats[stat.employeeId].assignedForms += stat.assignedForms;
        aggregatedStats[stat.employeeId].completedForms += stat.completedForms;
      } else {
        aggregatedStats[stat.employeeId] = stat;
      }
    });

    res.json({
      totalForms,
      totalResponses,
      employeeStats: Object.values(aggregatedStats)
    });
  } catch (err) {
    console.error("Error fetching my analytics:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// NEW ENDPOINTS FOR ENHANCED ASSIGNMENT
// ============================================

// Search employees by name or ID (for autocomplete)
router.get("/employees/search", auth, isAdminOrAbove, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ employees: [] });
    }

    const searchTerm = q.trim();

    // Search by name (case-insensitive) or employeeId (partial match)
    const employees = await Employee.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { employeeId: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .select('employeeId name email role')
      .limit(10)
      .lean();

    res.json({ employees });
  } catch (err) {
    console.error("Error searching employees:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all employees (for "Select All" functionality)
router.get("/employees/all", auth, isAdminOrAbove, async (req, res) => {
  try {
    const employees = await Employee.find({})
      .select('employeeId name email role')
      .sort({ employeeId: 1 })
      .lean();

    res.json({ employees });
  } catch (err) {
    console.error("Error fetching all employees:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get forms assigned TO the logged-in admin
router.get("/assigned-forms", auth, isAdminOrAbove, async (req, res) => {
  try {
    // Find assignments where this admin is the assigned employee
    const assignments = await Assignment.find({
      employee: req.user.id,
      submitted: false
    })
      .populate({
        path: 'form',
        populate: {
          path: 'createdBy',
          select: 'name employeeId'
        }
      })
      .lean();

    // Extract forms from assignments
    const forms = assignments
      .filter(a => a.form) // Filter out null forms
      .map(a => ({
        ...a.form,
        assignedAt: a.createdAt
      }));

    res.json({ forms });
  } catch (err) {
    console.error("Error fetching assigned forms:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
