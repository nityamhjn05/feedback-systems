// scripts/promoteToAdministrator.js
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");
const Employee = require("../models/Employee");

async function promoteToAdministrator() {
    await connectDB();

    // Get employee ID from command line argument
    const employeeId = process.argv[2];

    if (!employeeId) {
        console.log("❌ Usage: npm run promote-admin <employeeId>");
        console.log("   Example: npm run promote-admin EMP001");
        process.exit(1);
    }

    try {
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            console.log(`❌ Employee not found: ${employeeId}`);
            process.exit(1);
        }

        // Update role to ADMINISTRATOR
        employee.role = "ADMINISTRATOR";
        await employee.save();

        console.log(`✅ Successfully promoted ${employee.name} (${employeeId}) to ADMINISTRATOR`);
        console.log(`   Email: ${employee.email || 'N/A'}`);
        console.log(`   Role: ${employee.role}`);
    } catch (err) {
        console.error("❌ Error promoting employee:", err.message);
        process.exit(1);
    }

    process.exit(0);
}

promoteToAdministrator();
