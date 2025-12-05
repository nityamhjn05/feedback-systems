# Administrator Setup Guide

## 🔐 Existing Admin Credentials

Based on the `createAdmin.js` script, the following admin account exists in your system:

**Employee ID**: `EMP001`  
**Password**: `Admin@123`  
**Name**: Super Admin  
**Email**: admin@company.com  
**Current Role**: ADMIN  
**File**: Created by [createAdmin.js](file:///Users/amitmahajan/feedback-system/backend/scripts/createAdmin.js)

---

## 🚀 How to Promote to ADMINISTRATOR

To give this admin user the ADMINISTRATOR role (which grants access to user management):

### Step 1: Run the Promotion Script

```bash
cd backend
npm run promote-admin EMP001
```

**Expected Output**:
```
✅ Successfully promoted Super Admin (EMP001) to ADMINISTRATOR
   Email: admin@company.com
   Role: ADMINISTRATOR
```

### Step 2: Login and Access User Management

1. Open `http://localhost:3000/login`
2. Login with:
   - **Employee ID**: `EMP001`
   - **Password**: `Admin@123`
3. You should see "Work as Administrator" button in the navbar
4. Click it to access the User Management page

---

## 👥 Other Employees in System

Based on your `createMultipleUsers.js` script, you also have:

**Employee ID**: `EMP003`  
**Password**: `User@123`  
**Name**: Amit  
**Email**: amit@company.com  
**Role**: USER  

**Employee ID**: `EMP004`  
**Password**: `User@123`  
**Name**: Nitya  
**Email**: nitya@company.com  
**Role**: USER  

**File**: Created by [createMultipleUsers.js](file:///Users/amitmahajan/feedback-system/backend/scripts/createMultipleUsers.js)

---

## 📝 Creating New Employees

### Option 1: Via Signup Form (Frontend)

1. Go to login page
2. Click "New User? Sign Up" (or just enter a new Employee ID)
3. Fill in:
   - **Employee ID**: Your choice (e.g., EMP005)
   - **Full Name**: Employee name
   - **Email**: Optional
   - **Password**: Create password
   - **Confirm Password**: Repeat password
4. Click "Create Account"
5. New user will have role: USER

### Option 2: Via Bulk CSV Upload (Administrator)

1. Login as ADMINISTRATOR
2. Go to User Management page
3. Download sample CSV template
4. Fill in employee data:
   ```csv
   employeeId,name,email,password
   EMP100,John Doe,john@company.com,Password@123
   EMP101,Jane Smith,jane@company.com,Password@123
   ```
5. Upload the CSV file
6. All employees will be created with role: USER

### Option 3: Via Script (Backend)

Create a new script or modify existing ones in `backend/scripts/` directory.

---

## 🔄 Quick Reference

| Employee ID | Password | Role | Purpose |
|------------|----------|------|---------|
| EMP001 | Admin@123 | ADMIN → ADMINISTRATOR | Main admin (promote to ADMINISTRATOR) |
| EMP003 | User@123 | USER | Regular user (Amit) |
| EMP004 | User@123 | USER | Regular user (Nitya) |

---

## ✅ Next Steps

1. **Promote EMP001 to ADMINISTRATOR**:
   ```bash
   npm run promote-admin EMP001
   ```

2. **Login as ADMINISTRATOR**:
   - Use EMP001 / Admin@123
   - Access User Management via navbar button

3. **Test User Management**:
   - View all users
   - Change roles
   - Delete users (except yourself)
   - Upload CSV with new employees

4. **Test Signup Flow**:
   - Try creating a new employee via signup form
   - Verify Employee ID field is editable
   - Confirm new user can login

---

## 🐛 Troubleshooting

**Issue**: "Work as Administrator" button not showing  
**Solution**: Make sure you promoted EMP001 to ADMINISTRATOR role and logged in again

**Issue**: Cannot access User Management page  
**Solution**: Only ADMINISTRATOR role can access this page. Check your role in navbar.

**Issue**: Bulk upload fails  
**Solution**: Ensure CSV format is correct (employeeId,name,email,password) with header row

**Issue**: Employee ID already exists during signup  
**Solution**: Choose a different Employee ID or login with existing credentials
