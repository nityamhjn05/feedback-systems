# MongoDB Data Storage Guide

## 🗄️ Where Your Data is Stored

Based on your `.env` file, your MongoDB data is stored in:

### MongoDB Atlas (Cloud Database)

**Connection String**:
```
mongodb+srv://nitya:Ritu%40100@feedback-system.jwtl302.mongodb.net/feedbackDB?retryWrites=true&w=majority
```

**Details**:
- **Service**: MongoDB Atlas (Cloud-hosted)
- **Cluster**: `feedback-system.jwtl302.mongodb.net`
- **Database Name**: `feedbackDB`
- **Username**: `nitya`
- **Password**: `Ritu@100` (URL-encoded as `Ritu%40100`)

---

## 📊 Database Collections

Your `feedbackDB` database contains the following collections:

### 1. **employees** Collection
Stores all user/employee data.

**Sample Document**:
```javascript
{
  _id: ObjectId("..."),
  employeeId: "EMP001",
  name: "Super Admin",
  email: "admin@company.com",
  passwordHash: "$2a$10$...", // Hashed password
  role: "ADMINISTRATOR", // or "ADMIN" or "USER"
  createdAt: ISODate("2025-11-26T..."),
  updatedAt: ISODate("2025-11-26T...")
}
```

**Current Employees**:
- EMP001 - Super Admin (ADMINISTRATOR)
- EMP003 - Amit (USER)
- EMP004 - Nitya (USER)

---

### 2. **forms** Collection
Stores feedback forms created by admins.

**Sample Document**:
```javascript
{
  _id: ObjectId("..."),
  title: "Employee Performance Review",
  description: "Quarterly performance feedback",
  questions: [
    {
      text: "How would you rate your performance?",
      type: "MCQ",
      options: ["Excellent", "Good", "Average", "Poor"]
    },
    {
      text: "What are your goals for next quarter?",
      type: "TEXT"
    }
  ],
  createdBy: ObjectId("..."), // Reference to employees collection
  createdAt: ISODate("2025-11-26T..."),
  updatedAt: ISODate("2025-11-26T...")
}
```

---

### 3. **assignments** Collection
Tracks which forms are assigned to which employees.

**Sample Document**:
```javascript
{
  _id: ObjectId("..."),
  form: ObjectId("..."), // Reference to forms collection
  employee: ObjectId("..."), // Reference to employees collection
  createdAt: ISODate("2025-11-26T..."),
  updatedAt: ISODate("2025-11-26T...")
}
```

---

### 4. **responses** Collection
Stores employee responses to assigned forms.

**Sample Document**:
```javascript
{
  _id: ObjectId("..."),
  form: ObjectId("..."), // Reference to forms collection
  employee: ObjectId("..."), // Reference to employees collection
  answers: [
    {
      question: "How would you rate your performance?",
      answer: "Excellent"
    },
    {
      question: "What are your goals for next quarter?",
      answer: "Improve coding skills and lead a project"
    }
  ],
  submittedAt: ISODate("2025-11-26T..."),
  createdAt: ISODate("2025-11-26T..."),
  updatedAt: ISODate("2025-11-26T...")
}
```

---

## 🔍 How to Access Your MongoDB Data

### Option 1: MongoDB Atlas Web Interface

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Login with your MongoDB Atlas credentials
3. Select your cluster: `feedback-system`
4. Click "Browse Collections"
5. Select database: `feedbackDB`
6. View/edit collections: `employees`, `forms`, `assignments`, `responses`

### Option 2: MongoDB Compass (Desktop App)

1. Download MongoDB Compass: [https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass)
2. Open Compass
3. Paste connection string:
   ```
   mongodb+srv://nitya:Ritu@100@feedback-system.jwtl302.mongodb.net/feedbackDB
   ```
4. Click "Connect"
5. Browse collections visually

### Option 3: Command Line (mongosh)

```bash
# Install mongosh
brew install mongosh  # macOS
# or download from https://www.mongodb.com/try/download/shell

# Connect to your database
mongosh "mongodb+srv://nitya:Ritu@100@feedback-system.jwtl302.mongodb.net/feedbackDB"

# View collections
show collections

# Query employees
db.employees.find()

# Count documents
db.employees.countDocuments()

# Find specific employee
db.employees.findOne({ employeeId: "EMP001" })
```

---

## 📁 Test CSV File Created

I've created a test CSV file for you to upload:

**File**: `backend/scripts/test-employees.csv`

**Contents**:
```csv
employeeId,name,email,password
EMP005,Rahul Kumar,rahul@company.com,Welcome@123
EMP006,Priya Sharma,priya@company.com,Welcome@123
EMP007,Arjun Patel,arjun@company.com,Welcome@123
EMP008,Sneha Reddy,sneha@company.com,Welcome@123
EMP009,Vikram Singh,vikram@company.com,Welcome@123
EMP010,Ananya Gupta,ananya@company.com,Welcome@123
```

**How to Use**:
1. Login as ADMINISTRATOR (EMP001 / Admin@123)
2. Click "Work as Administrator"
3. Go to User Management page
4. Upload `test-employees.csv`
5. Verify 6 new employees are created

**After Upload**:
- All 6 employees will be added to `employees` collection
- Default role: USER
- Passwords will be hashed
- They can login immediately

---

## 🔐 Security Notes

**Important**:
- Your MongoDB password is stored in `.env` file
- Never commit `.env` to Git (should be in `.gitignore`)
- Consider rotating credentials periodically
- Use strong passwords for production

**Current Credentials**:
- MongoDB User: `nitya`
- MongoDB Password: `Ritu@100`
- JWT Secret: `supersecret_jwt_key_change_this`

---

## 📈 Data Growth Estimates

| Collection | Current | After CSV Upload | After 100 Users |
|-----------|---------|------------------|-----------------|
| employees | 3 | 9 | 103 |
| forms | Varies | Varies | Varies |
| assignments | Varies | Varies | Varies |
| responses | Varies | Varies | Varies |

**Storage**: MongoDB Atlas Free Tier provides 512MB storage, which is sufficient for thousands of employees and forms.

---

## 🛠️ Backup & Export

### Export Collection to JSON
```bash
mongoexport --uri="mongodb+srv://nitya:Ritu@100@feedback-system.jwtl302.mongodb.net/feedbackDB" \
  --collection=employees \
  --out=employees_backup.json
```

### Import Collection from JSON
```bash
mongoimport --uri="mongodb+srv://nitya:Ritu@100@feedback-system.jwtl302.mongodb.net/feedbackDB" \
  --collection=employees \
  --file=employees_backup.json
```

---

## ✅ Summary

- **Database Location**: MongoDB Atlas Cloud (not local)
- **Database Name**: `feedbackDB`
- **Collections**: employees, forms, assignments, responses
- **Access**: Via Atlas web interface, Compass, or mongosh
- **Test CSV**: `backend/scripts/test-employees.csv` (6 employees)
- **Credentials**: Stored in `backend/.env`
