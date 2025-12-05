// scripts/createUser.js
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");
const Employee = require("../models/Employee");

async function createUser() {
  await connectDB();

  const exists = await Employee.findOne({ employeeId: "EMP002" });
  if (exists) {
    console.log("User already exists:", exists.employeeId);
    process.exit(0);
  }

  const user = new Employee({
    employeeId: "EMP002",
    name: "Amit Mahajan",
    email: "user@company.com",
    role: "USER",
    passwordHash: "temp"
  });

  await user.setPassword("User@123");
  await user.save();

  console.log("✅ User created: EMP002 / User@123");
  process.exit(0);
}

createUser();
