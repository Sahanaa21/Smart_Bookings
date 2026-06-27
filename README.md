# SMART RESOURCE BOOKING SYSTEM

Enterprise-ready full-stack application for centralized Auditorium and Meeting Room management with secure access control, approval workflows, priority override, auditing, availability search, calendar, and timeline views.

## 1) System Architecture

- **Frontend (`/frontend`)**: React (Vite), Tailwind CSS, React Router, Axios, FullCalendar
- **Backend (`/backend`)**: Node.js, Express, JWT, bcrypt, RBAC, rate-limit, helmet
- **Database**: MongoDB (Mongoose)
- **Architecture**: modular services + routes + models + middlewares
- **Future-ready placeholders**: IoT occupancy fields + AI-ready analytics collections

## 2) ER Model (Collections)

- Users
- Resources
- Bookings
- BookingHistory
- Notifications
- AuditLogs
- Departments
- SystemSettings
- Analytics
- OccupancyDevices

Relations:
- `Bookings.userId -> Users`
- `Bookings.resourceId -> Resources`
- `BookingHistory.bookingId -> Bookings`
- `Notifications.userId -> Users`
- `OccupancyDevices.resourceId -> Resources`

## 3) MongoDB Schemas Implemented

Located in `/backend/src/models/*`:
- `User.js`, `Resource.js`, `Booking.js`, `BookingHistory.js`, `Notification.js`
- `AuditLog.js`, `Department.js`, `SystemSetting.js`, `Analytics.js`, `OccupancyDevice.js`

Includes:
- Role hierarchy support
- Resource status controls (Active / Under Maintenance / Disabled)
- Booking lifecycle (Pending / Approved / Rejected / Cancelled / Completed / Overridden)
- IoT placeholders: `sensorId`, `occupancyStatus`, `occupancyCount`, `lastSensorUpdate`

## 4) Folder Structure

```text
backend/
  src/
    config/ models/ routes/ middlewares/ services/ jobs/ utils/
  tests/
frontend/
  src/
    api/ components/ context/ pages/
```

## 5) Backend APIs

- **Auth**: `/api/auth/*`
  - login, logout, change-password, request-password-reset, reset-password
- **Users**: `/api/users/*`
  - admin-only account creation and activation/deactivation
- **Resources**: `/api/resources/*`
  - create/read/update/delete + filtering
- **Bookings**: `/api/bookings/*`
  - create/list/status update/check-in/availability search
- **Settings**: `/api/settings/*`
  - configurable priorities and system policies
- **Notifications**: `/api/notifications/*`
- **Audit Logs**: `/api/audit-logs/*`
- **Analytics**: `/api/analytics/summary`

## 6) Authentication Module

- Employee ID + Password login
- JWT token issuing and verification
- bcrypt password hashing
- force password change on first login (`mustChangePassword`)
- password reset token flow
- account activation/deactivation by admin

## 7) Role Middleware

- `auth` middleware validates JWT and active account
- `rbac` middleware restricts routes by role
- roles: Super Admin, Chairman, Principal, Dean, HOD, Faculty, Staff

## 8) Booking Engine

Implemented in booking routes/services:
- capacity validation
- overlap detection
- auto-approval rules (meeting rooms configurable)
- auditorium approval (configurable)
- booking history recording

## 9) Conflict Resolution Engine

- detects slot conflict on same resource/date/time
- train/flight style availability endpoint gives:
  - available resources
  - unavailable resources
  - best alternatives

## 10) Approval Workflow

- Auditorium defaults to approval required
- Meeting rooms default to auto-approval
- configurable through system settings

## 11) Calendar Module

Frontend `/bookings` page:
- month, week, day views via FullCalendar
- color-coded status rendering

## 12) Timeline Module

Frontend `/timeline` page:
- grouped enterprise timeline by resource with time slots and status

## 13) Availability Search Module

Frontend `/availability` + backend `/api/bookings/availability`:
- input date/time/attendees
- returns available/unavailable resources + alternatives

## 14) Notification System

- in-app notification collection + API
- override and approval state updates generate notifications
- architecture ready for email/SMS/WhatsApp extension

## 15) Audit Logging

`AuditLog` captures:
- user, employeeId, timestamp, IP, action, old/new values
- actions include login/logout, booking events, resource/user/settings changes

## 16) Reports & Analytics

`/api/analytics/summary` provides core dashboard metrics:
- total resources
- active bookings
- pending requests
- no-shows
- overrides

## 17) Admin Dashboard

Professional institutional UI:
- left sidebar + top navigation
- white/light gray/navy palette
- KPI cards and management pages

## 18) Frontend Components

- Protected routes
- Auth context
- Dashboard
- Resource list
- Booking calendar
- Availability search
- Timeline view

## 19) Deployment Guide

### Backend

```bash
cd backend
npm install
cp .env.example .env   # create manually if absent
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 20) Testing Strategy

Backend integration tests in `backend/tests/app.test.js` validate:
- auto-approval for meeting room booking
- priority-based override by principal/chairman/super admin

Run tests:

```bash
cd backend
npm test
```

---

## Default Seeded Data

On backend startup:
- Main Auditorium (500)
- Meeting Room A (15)
- Meeting Room B (20)
- Super Admin user: `SUPER001` with temporary password `Admin@123` (must change on first login)

> Change seed credentials and `JWT_SECRET` in production.
