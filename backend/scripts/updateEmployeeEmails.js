// scripts/updateEmployeeEmails.js
// Quick script to update all employee emails for testing

const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");
const Employee = require("../models/Employee");

async function updateEmails() {
    await connectDB();

    const testEmail = "nityamhjn05@gmail.com";

    try {
        const result = await Employee.updateMany(
            {},
            { $set: { email: testEmail } }
        );

        console.log(`✅ Updated ${result.modifiedCount} employees`);
        console.log(`📧 All employee emails set to: ${testEmail}`);

        // Show updated employees
        const employees = await Employee.find({}, "employeeId name email");
        console.log("\n📋 Updated Employees:");
        employees.forEach(emp => {
            console.log(`   ${emp.employeeId} - ${emp.name} - ${emp.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating emails:", error);
        process.exit(1);
    }
}

updateEmails();
