// scripts/createAdmin.js
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");
const Employee = require("../models/Employee");

async function createAdmin() {
  await connectDB();

  const exists = await Employee.findOne({ employeeId: "EMP001" });
  if (exists) {
    console.log("Admin already exists:", exists.employeeId);
    process.exit(0);
  }

  const admin = new Employee({
    employeeId: "EMP001",
    name: "Super Admin",
    email: "admin@company.com",
    role: "ADMIN",
    passwordHash: "temp"
  });

  await admin.setPassword("Admin@123"); // <--- actual password 
  await admin.save();

  console.log("Admin created successfully!");
  console.log("Login with ID: EMP001 and password: Admin@123");

  process.exit(0);
}

createAdmin();
