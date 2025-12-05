// routes/administrator.js
const express = require("express");
const multer = require("multer");
const Employee = require("../models/Employee");
const Assignment = require("../models/Assignment");
const Response = require("../models/Response");
const { auth, isAdministrator } = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads (memory storage for CSV parsing)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// GET all users (with pagination and filtering)
router.get("/users", auth, isAdministrator, async (req, res) => {
    try {
        const { role, page = 1, limit = 50 } = req.query;

        // Build query
        const query = {};
        if (role && ["USER", "ADMIN", "ADMINISTRATOR"].includes(role)) {
            query.role = role;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Fetch users
        const users = await Employee.find(query)
            .select("employeeId name email role createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Employee.countDocuments(query);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE user by ID
router.delete("/users/:id", auth, isAdministrator, async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user.id === id) {
            return res.status(400).json({
                message: "Cannot delete your own account"
            });
        }

        // Find and delete user
        const user = await Employee.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Cascade delete: remove related assignments and responses
        await Assignment.deleteMany({ employee: id });
        await Response.deleteMany({ employee: id });

        res.json({
            message: "User deleted successfully",
            deletedUser: {
                employeeId: user.employeeId,
                name: user.name
            }
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// PATCH user role
router.patch("/users/:id/role", auth, isAdministrator, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        if (!role || !["USER", "ADMIN", "ADMINISTRATOR"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role. Must be USER, ADMIN, or ADMINISTRATOR"
            });
        }

        // Prevent self-demotion
        if (req.user.id === id && role !== "ADMINISTRATOR") {
            return res.status(400).json({
                message: "Cannot change your own role"
            });
        }

        // Update role
        const user = await Employee.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select("employeeId name email role");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Role updated successfully",
            user
        });
    } catch (err) {
        console.error("Error updating role:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST bulk upload CSV
router.post("/users/bulk-upload", auth, isAdministrator, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Parse CSV
        const csvData = req.file.buffer.toString('utf-8');
        const lines = csvData.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            return res.status(400).json({
                message: "CSV file must contain header row and at least one data row"
            });
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredFields = ['employeeid', 'name', 'password'];
        const missingFields = requiredFields.filter(f => !header.includes(f));

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required columns: ${missingFields.join(', ')}`
            });
        }

        // Get column indices
        const employeeIdIndex = header.indexOf('employeeid');
        const nameIndex = header.indexOf('name');
        const emailIndex = header.indexOf('email');
        const passwordIndex = header.indexOf('password');

        const results = {
            created: 0,
            updated: 0,
            errors: []
        };

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());

            if (values.length < requiredFields.length) {
                results.errors.push({
                    row: i + 1,
                    error: "Insufficient columns"
                });
                continue;
            }

            const employeeId = values[employeeIdIndex];
            const name = values[nameIndex];
            const email = emailIndex >= 0 ? values[emailIndex] : "";
            const password = values[passwordIndex];

            if (!employeeId || !name || !password) {
                results.errors.push({
                    row: i + 1,
                    error: "Missing required field(s)"
                });
                continue;
            }

            try {
                // Check if employee exists
                let employee = await Employee.findOne({ employeeId });

                if (employee) {
                    // Update existing employee
                    employee.name = name;
                    employee.email = email;
                    await employee.setPassword(password);
                    await employee.save();
                    results.updated++;
                } else {
                    // Create new employee
                    employee = new Employee({
                        employeeId,
                        name,
                        email,
                        role: "USER",
                        passwordHash: "temp"
                    });
                    await employee.setPassword(password);
                    await employee.save();
                    results.created++;
                }
            } catch (err) {
                results.errors.push({
                    row: i + 1,
                    employeeId,
                    error: err.message
                });
            }
        }

        res.json({
            message: "Bulk upload completed",
            results
        });
    } catch (err) {
        console.error("Error during bulk upload:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
