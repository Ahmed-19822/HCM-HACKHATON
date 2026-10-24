# HCM Lite – Frontend

Professional React frontend for the HCM Lite Human Capital Management system.

---

## Tech Stack

| Package | Purpose |
|---------|---------|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS v3 | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router v6 | Client-side routing |
| Axios | API calls with JWT interceptors |
| @tanstack/react-query | Data fetching & caching |
| Recharts | Dashboard charts |
| React Hot Toast | Toast notifications |
| React Icons | Icon library |

---

## Quick Start

```bash
# 1. Copy and fill .env
copy .env.example .env

# 2. Start development server
npm run dev        # http://localhost:3000

# 3. Build for production
npm run build
npm run preview
```

---

## Environment Variables (.env)

Copy `.env.example` → `.env` and fill in:

### `VITE_API_BASE_URL` ⭐ Required
```env
# Local development (backend on port 5000)
VITE_API_BASE_URL=http://localhost:5000/api

# Production – after deploying backend to cloud:
# Render:  VITE_API_BASE_URL=https://your-app.onrender.com/api
# Railway: VITE_API_BASE_URL=https://your-app.up.railway.app/api
```
**How to get it:**
- Run your backend server (`npm run dev` in the `server/` folder)
- Default is `http://localhost:5000/api` — no change needed for local dev
- For deployment: copy the URL from your hosting provider dashboard

### `VITE_APP_NAME`
```env
VITE_APP_NAME=HCM Lite
```
> Shown in the browser tab, sidebar header, and login screen.
> Change to your company name if needed.

### `VITE_STATIC_URL`
```env
# Local development
VITE_STATIC_URL=http://localhost:5000

# Production – same as your backend URL (without /api)
# VITE_STATIC_URL=https://your-backend.onrender.com
```
> Used to display employee avatar images uploaded to the backend.
> Must point to your backend server (not the frontend URL).

---

## Project Structure

```
client/src/
├── api/                   ← Axios instance + all API functions
│   ├── axios.js           ← Base config + JWT interceptor + 401 auto-logout
│   ├── auth.api.js
│   ├── employees.api.js
│   ├── departments.api.js
│   ├── attendance.api.js
│   ├── leaves.api.js
│   ├── payroll.api.js
│   └── dashboard.api.js
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx    ← Animated collapsible sidebar with role-based nav
│   │   ├── Topbar.jsx     ← Sticky header with search + user info
│   │   ├── Layout.jsx     ← Main layout wrapper (sidebar + topbar + outlet)
│   │   └── ProtectedRoute.jsx ← Auth guard with role checking
│   │
│   ├── ui/
│   │   ├── Button.jsx     ← Animated button with variants (primary/secondary/danger...)
│   │   ├── Input.jsx      ← Styled input with label + error
│   │   ├── Select.jsx     ← Styled select dropdown
│   │   ├── Card.jsx       ← Animated card container
│   │   ├── Badge.jsx      ← Status badge (active/pending/approved...)
│   │   ├── Modal.jsx      ← Animated overlay modal
│   │   ├── Avatar.jsx     ← Initials-based avatar with color coding
│   │   ├── Skeleton.jsx   ← Loading skeleton placeholders
│   │   ├── EmptyState.jsx ← Empty list placeholder with icon
│   │   └── ConfirmDialog.jsx ← Delete/action confirmation modal
│   │
│   └── charts/
│       └── StatsCard.jsx  ← Animated counter stat card
│
├── context/
│   └── AuthContext.jsx    ← Auth state: user, token, login(), logout()
│
├── pages/
│   ├── Login.jsx          ← Glassmorphism login with animated blobs
│   ├── Dashboard.jsx      ← Stats + BarChart + PieChart + recent hires
│   ├── Departments.jsx    ← Card grid with create/edit/delete modals
│   ├── Profile.jsx        ← User info + leave balance + change password
│   ├── employees/
│   │   ├── Employees.jsx  ← Table with search + department/status filters
│   │   └── EmployeeForm.jsx ← Create/edit form with avatar upload
│   ├── attendance/
│   │   └── Attendance.jsx ← Check-in/out + log table + HR summary stats
│   ├── leaves/
│   │   └── Leaves.jsx     ← Apply/approve/reject/cancel leaves
│   └── payroll/
│       └── Payroll.jsx    ← Generate payroll + mark as paid
│
└── utils/
    └── index.js           ← formatDate, formatCurrency, getInitials, statusColor
```

---

## Features & Animations

| Feature | Details |
|---------|---------|
| **Login Page** | Glassmorphism card, animated background blobs, eye toggle password |
| **Sidebar** | Spring-animated collapse, active link highlight, role-based nav |
| **Page Transitions** | Fade + slide-up on every route change |
| **Stats Cards** | Animated number counter counting up from 0 on load |
| **Dashboard Charts** | Bar chart (department headcount) + Pie chart (distribution) |
| **Tables** | Staggered row entrance animations, hover highlight |
| **Cards** | Hover lift effect with shadow |
| **Modals** | Spring-animated scale + fade in/out |
| **Skeleton Loaders** | Pulse animation while data loads |
| **Toasts** | Dark-themed success/error notifications |

---

## Role-Based UI

| Feature | Admin | HR | Employee |
|---------|-------|-----|---------|
| Dashboard | ✅ | ✅ | ❌ |
| View Employees | ✅ | ✅ | ✅ (limited) |
| Create/Edit Employee | ✅ | ✅ | ❌ |
| Departments | ✅ | ✅ | ❌ |
| Check In/Out | ❌ | ❌ | ✅ |
| Mark Attendance | ✅ | ✅ | ❌ |
| Apply Leave | ❌ | ❌ | ✅ |
| Approve/Reject Leave | ✅ | ✅ | ❌ |
| Generate Payroll | ✅ | ✅ | ❌ |
| View Own Payslips | ✅ | ✅ | ✅ |

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| CORS error in browser | Make sure `VITE_API_BASE_URL` matches exactly what your backend is serving on |
| "Not authorized" on every request | Check that `VITE_API_BASE_URL` ends with `/api` (not just the port) |
| Images not loading | Set `VITE_STATIC_URL` to your backend URL (without `/api`) |
| Blank page after login | Open browser console, check for routing errors |
| Dashboard shows 0s | Make sure you are logged in as `admin` or `hr` role |

---

## Running Both Backend + Frontend

```bash
# Terminal 1 – Backend
cd server
npm run dev         # runs on http://localhost:5000

# Terminal 2 – Frontend
cd client
npm run dev         # runs on http://localhost:3000
```

Open → http://localhost:3000