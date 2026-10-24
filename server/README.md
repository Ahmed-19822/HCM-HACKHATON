# HCM Lite – Backend API

A lightweight Human Capital Management system built with **Node.js**, **Express**, **MongoDB**, and **JWT**.

---

## ?? Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
copy .env.example .env
# Then fill in the values (see guide below)

# 3. Start the server
npm run dev        # development (auto-restart)
npm start          # production
```

Server runs at ? `http://localhost:5000`

---

## ?? Project Structure

```
server/
+-- index.js                  ? Main entry point
+-- .env                      ? Your environment variables
+-- .env.example              ? Template (copy ? .env)
¦
+-- config/
¦   +-- db.js                 ? MongoDB connection
¦
+-- models/
¦   +-- User.model.js         ? Auth users
¦   +-- Employee.model.js     ? Employee profiles
¦   +-- Department.model.js   ? Departments
¦   +-- Attendance.model.js   ? Daily attendance
¦   +-- Leave.model.js        ? Leave requests
¦   +-- Payroll.model.js      ? Payroll & payslips
¦
+-- controllers/              ? Business logic
+-- routes/                   ? API route definitions
+-- middleware/               ? Auth, error, file upload
+-- validator/                ? Request validation
+-- utils/                    ? JWT, ApiResponse, ApiError
```

---

## ?? Environment Variables – Full Guide

Open your `.env` file and fill each value using the instructions below.

---

### `PORT`
```env
PORT=5000
```
> The port your server listens on. `5000` is fine for local development. Change if that port is in use.

---

### `NODE_ENV`
```env
NODE_ENV=development
```
> Options: `development` or `production`.  
> In `development`, full error stack traces are returned in API responses.

---

### `MONGO_URI` ? Required
```env
# Option A – Local MongoDB
MONGO_URI=mongodb://localhost:27017/hcm_lite

# Option B – MongoDB Atlas (Cloud) ? Recommended for deployment
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/hcm_lite
```

**How to get a FREE MongoDB Atlas URI:**
1. Go to ? https://www.mongodb.com/cloud/atlas/register
2. Sign up / Log in
3. Click **"Create a Free Cluster"** (M0 – Free Tier)
4. Choose a region (closest to you)
5. In left sidebar ? **"Database Access"** ? Add a new user
   - Set **username** and **password** (save these)
   - Role: **Atlas Admin** or **Read/Write to any database**
6. In left sidebar ? **"Network Access"** ? Add IP Address ? **"Allow Access from Anywhere"** (`0.0.0.0/0`)
7. In left sidebar ? **"Database"** ? click **"Connect"** on your cluster
8. Choose **"Connect your application"**
9. Select **Driver: Node.js** and copy the connection string
10. Replace `<username>`, `<password>`, and append `/hcm_lite` at the end

**Example:**
```
mongodb+srv://ahmedhayat:MyPass123@cluster0.abc123.mongodb.net/hcm_lite
```

---

### `JWT_SECRET` ? Required
```env
JWT_SECRET=your_super_secret_key_change_this
```

**How to generate a strong secret:**

Option 1 – Use Node.js in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Option 2 – Use an online generator:
? https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx  
(Pick 512-bit, Hex)

Option 3 – Just type a long random string (at least 32 characters).

> ?? **Never share this key. Never push it to GitHub.**

---

### `JWT_EXPIRES_IN`
```env
JWT_EXPIRES_IN=7d
```
> How long login tokens stay valid.  
> Examples: `1h` (1 hour), `7d` (7 days), `30d` (30 days).

---

### `BCRYPT_SALT_ROUNDS`
```env
BCRYPT_SALT_ROUNDS=10
```
> How many times passwords are hashed. `10` is the recommended standard.  
> Higher = more secure but slower. Range: `10–14`.

---

### `UPLOAD_DIR`
```env
UPLOAD_DIR=uploads
```
> Folder where employee avatar images are stored.  
> This folder is automatically created when the server starts.  
> No changes needed for local development.

---

### `MAX_FILE_SIZE_MB`
```env
MAX_FILE_SIZE_MB=5
```
> Maximum size for uploaded image files (in MB).  
> Change to `2` or `10` based on your preference.

---

### `CLIENT_URL` ? Required for CORS
```env
# Local development
CLIENT_URL=http://localhost:3000

# After deploying frontend (example)
CLIENT_URL=https://your-app.vercel.app
```
> The URL of your frontend app. This is used for CORS (Cross-Origin Resource Sharing).  
> Without this set correctly, your frontend will get CORS errors.

---

## ?? Complete `.env` Example

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://ahmedhayat:YourPass@cluster0.abc.mongodb.net/hcm_lite
JWT_SECRET=a1b2c3d4e5f6...your_long_random_secret...
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
CLIENT_URL=http://localhost:3000
```

---

## ?? API Endpoints

### Auth – `/api/auth`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/login` | Public | Login with email & password |
| POST | `/register` | Admin only | Create a new user account |
| GET | `/me` | Private | Get logged-in user profile |
| PUT | `/change-password` | Private | Change own password |

### Departments – `/api/departments`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | Get all departments |
| POST | `/` | Admin / HR | Create department |
| GET | `/:id` | Private | Get single department |
| PUT | `/:id` | Admin / HR | Update department |
| DELETE | `/:id` | Admin | Delete department |

### Employees – `/api/employees`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | List all (supports `?search=`, `?department=`, `?status=`) |
| POST | `/` | Admin / HR | Create employee + linked user account |
| GET | `/:id` | Private | Get single employee |
| PUT | `/:id` | Admin / HR | Update employee (supports avatar upload) |
| DELETE | `/:id` | Admin / HR | Deactivate employee |

### Attendance – `/api/attendance`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/checkin` | Employee | Check in for today |
| PUT | `/checkout` | Employee | Check out for today |
| POST | `/mark` | Admin / HR | Manually mark attendance |
| GET | `/today` | Admin / HR | Today's attendance summary |
| GET | `/` | Private | Attendance log (filterable) |

### Leave – `/api/leaves`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | Own leaves (employee) / All leaves (Admin/HR) |
| POST | `/` | Employee | Apply for leave |
| GET | `/:id` | Private | Get single leave |
| PUT | `/:id` | Admin / HR | Approve or reject |
| DELETE | `/:id` | Employee | Cancel pending leave |

### Payroll – `/api/payroll`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | Own payslips or all payrolls |
| POST | `/` | Admin / HR | Generate payroll for an employee |
| GET | `/:id` | Private | Get single payslip |
| PUT | `/:id/mark-paid` | Admin | Mark payroll as paid |

### Dashboard – `/api/dashboard`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Admin / HR | Stats: employees, present today, pending leaves, department breakdown |

---

## ?? Role-Based Access

| Role | Permissions |
|------|-------------|
| `admin` | Full access to everything |
| `hr` | Manage employees, attendance, leaves, payroll (cannot delete departments or mark payroll as paid) |
| `employee` | View own profile, check in/out, apply/cancel leave, view own payslips |

**How to set roles:**  
When creating a user via `POST /api/auth/register`, pass `"role": "admin"` or `"role": "hr"`.  
First admin user needs to be created directly in MongoDB (or temporarily remove the `authorize('admin')` guard on the register route).

---

## ?? Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.3.0 | Web framework |
| mongoose | ^9.11.4 | MongoDB ODM |
| bcrypt | ^6.0.0 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT auth tokens |
| multer | ^2.5.0 | File/image uploads |
| cors | ^2.8.5 | Cross-Origin requests |
| dotenv | ^16.4.5 | Load .env variables |
| nodemon | ^3.1.14 | Auto-restart in dev |

---

## ?? What is NOT Done Yet (Remaining Work)

The following features were described in the HCM Lite brief but are **not yet implemented** in this backend. These need to be added:

### 1. ?? Email Notifications (Optional but useful)
- Send email when a leave is approved/rejected
- Send payslip via email
- **How to add:** Install `nodemailer`, add SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`), create `utils/sendEmail.js`

### 2. ?? PDF Payslip Generation
- Generate downloadable PDF payslips
- **How to add:** Install `pdfkit` or `puppeteer`, add a route `GET /api/payroll/:id/download`

### 3. ?? Pagination
- All list endpoints currently return ALL records
- **How to add:** Add `?page=1&limit=10` query params and use `.skip().limit()` in controllers

### 4. ?? Admin Seed Script
- There is no first admin user yet — you need to create one manually
- **How to add:** Create `scripts/seed.js` that creates the first admin user when run

### 5. ?? Frontend (Client)
- The `client/` folder is currently empty
- **Next step:** Build the React frontend in `client/` that consumes these APIs

### 6. ?? Unit / Integration Tests
- No tests written yet
- **How to add:** Install `jest` + `supertest`, write tests in a `__tests__/` folder

### 7. ?? Rate Limiting
- No protection against brute-force login attacks
- **How to add:** Install `express-rate-limit`, apply to `/api/auth/login`

### 8. ?? Advanced Reporting
- No monthly attendance report export (CSV/Excel)
- **How to add:** Install `exceljs`, create `GET /api/reports/attendance`

---

## ?? Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `MongooseError: buffering timed out` | Check `MONGO_URI` is correct and MongoDB is running |
| `CORS error` in browser | Make sure `CLIENT_URL` matches your frontend URL exactly |
| `JsonWebTokenError: invalid token` | Token expired or wrong `JWT_SECRET` — re-login |
| `bcrypt` native build error | Run `npm rebuild bcrypt` or `npm approve-scripts bcrypt` |
| `EADDRINUSE: port 5000` | Another process is using port 5000 — change `PORT` in `.env` |
| File upload not working | Check `UPLOAD_DIR` folder exists (auto-created on start) |

---

## ?? Testing the API

Use **Postman** or **Thunder Client** (VS Code extension):

1. **Login first:**
   ```
   POST http://localhost:5000/api/auth/login
   Body: { "email": "admin@hcm.com", "password": "Admin@123" }
   ```

2. **Copy the `token` from the response**

3. **Add to all future requests:**
   ```
   Header: Authorization: Bearer <your_token>
   ```

---

*Built for Saylani Hackathon – HCM Lite Brief*
