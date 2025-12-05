// scripts/createMultipleUsers.js
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");
const Employee = require("../models/Employee");

async function createUsers() {
    await connectDB();

    const usersToCreate = [
        { employeeId: "EMP003", name: "Amit", email: "amit@company.com" },
        { employeeId: "EMP004", name: "Nitya", email: "nitya@company.com" }
    ];

    for (const userData of usersToCreate) {
        const exists = await Employee.findOne({ employeeId: userData.employeeId });

        if (exists) {
            console.log(`⚠ User already exists: ${userData.employeeId}`);
            continue;
        }

        const user = new Employee({
            employeeId: userData.employeeId,
            name: userData.name,
            email: userData.email,
            role: "USER",
            passwordHash: "temp"
        });

        await user.setPassword("User@123");
        await user.save();

        console.log(`✅ User created: ${userData.employeeId} / User@123`);
    }

    process.exit(0);
}

createUsers();
