# Nyanza SDA Church Management System

A `Next.js` web app that helps a Seventh-day Adventist in Rwanda in enlisting members, their attendance, their group, announcemments and finance. It's entirely in Kinyarwanda to help members understand well

## Tech stack

- Frontend + Backend: `Next.js` App Router
- Database: `MongoDB` na `Mongoose`
- Authentication: `JWT`
- App type: `PWA`
- Charts: `Chart.js` na `react-chartjs-2`

## Folder structure

```text
app/
  api/
    auth/login
    auth/register
    members
    departments
    announcements
    finance
    attendance
    attendance/sync
  login
  register
  dashboard
  members
  attendance
  departments
  announcements
  finance
components/
  charts/
  forms/
  layout/
lib/
  auth.ts
  db.ts
  jwt.ts
  sample-data.ts
  utils.ts
  validators/
models/
  User.ts
  Member.ts
  Department.ts
  Attendance.ts
  Announcement.ts
  Finance.ts
public/
  manifest.json
  sw.js
```

## MongoDB schemas

- `User`: amazina, telefoni, password, role
- `Member`: amazina, itariki y’amavuko, telefoni, aho atuye, umuryango, amatsinda, yabatijwe cyangwa oya
- `Department`: izina, ibisobanuro, umuyobozi
- `Attendance`: ubwoko bw’umunsi, itariki, uwanditse, records z’abaje n’abataje
- `Announcement`: umutwe, ubutumwa, uwanditse
- `Finance`: amafaranga, ubwoko, itariki, uwabyanditse

## API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET, POST /api/members`
- `PUT, DELETE /api/members/:id`
- `GET, POST /api/departments`
- `PUT, DELETE /api/departments/:id`
- `GET, POST /api/announcements`
- `PUT, DELETE /api/announcements/:id`
- `GET, POST /api/finance`
- `GET, POST /api/attendance`
- `POST /api/attendance/sync`

## Frontend Pages

- `/login` `Injira`
- `/register` `Iyandikishe`
- `/dashboard` `Ahabanza`
- `/members` `Abanyamuryango`
- `/attendance` `Uko bitabira`
- `/departments` `Amatsinda`
- `/announcements` `Amatangazo`
- `/finance` `Imisanzu`

## Charts

In `components/charts/AttendanceCharts.tsx` there's:

- Abaje kuri buri Sabato
- Uko ukwezi kugenda
- Ijanisha ry’umuntu

In `components/charts/FinanceChart.tsx` there is a chart that shows financce.

## Offline support

- `public/sw.js` storees important pages in cach
- `AttendanceForm.tsx` keeps attendance in `localStorage` when there is no internet
- When internet goes back on, attendance gets sent to `/api/attendance/sync`

## PWA setup

- `public/manifest.json`
- `public/sw.js`
- `components/PwaRegister.tsx`
- `app/layout.tsx` adds in `manifest` and service worker registration

