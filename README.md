# Nyanza SDA Church Management System

Sisitemu yoroshye ya `Next.js` ifasha itorero rimwe rya Seventh-day Adventist mu Rwanda kubika abanyamuryango, uko bitabira, amatsinda, amatangazo n’imisanzu.

## Tech stack

- Frontend + Backend: `Next.js` App Router
- Database: `MongoDB` na `Mongoose`
- Authentication: `JWT`
- App type: `PWA`
- Charts: `Chart.js` na `react-chartjs-2`

## Uko connection ikora

Iyi app ikora muri ubu buryo:

```text
Telefone cyangwa browser -> Next.js app -> MongoDB Atlas
```

Ibi bivuze ko browser y’umuntu udakoresha system atajya ivugana na MongoDB Atlas directly.
Database ikoreshwa gusa ku ruhande rwa server binyuze muri:

- `app/api/*`
- `server components`
- `lib/db.ts`
- `models/*`

Twashyizemo `server-only` guards kuri izi files kugira ngo zidakoreshwa ku ruhande rwa client.

## Icyitonderwa kuri localhost

Iyo ukoresha `localhost`, `Next.js` server iba iri kuri machine yawe.
Ni yo mpamvu MongoDB Atlas ibona IP yawe kandi ikagusaba kuyishyira muri whitelist.

Iyo app imaze kujya online:

```text
Church Member Phone -> Next.js app hosted online -> MongoDB Atlas
```

Ni bwo ukoresha IP ya hosting environment, si iya machine yawe ya buri munsi.

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

## Pages ziri muri UI

- `/login` `Injira`
- `/register` `Iyandikishe`
- `/dashboard` `Ahabanza`
- `/members` `Abanyamuryango`
- `/attendance` `Uko bitabira`
- `/departments` `Amatsinda`
- `/announcements` `Amatangazo`
- `/finance` `Imisanzu`

## Charts

Mu `components/charts/AttendanceCharts.tsx` harimo:

- Abaje kuri buri Sabato
- Uko ukwezi kugenda
- Ijanisha ry’umuntu

Mu `components/charts/FinanceChart.tsx` harimo chart yerekana uko imisanzu igabanyijemo.

## Offline support

- `public/sw.js` ibika pages z’ingenzi muri cache
- `AttendanceForm.tsx` ibika attendance muri `localStorage` iyo internet yabuze
- Iyo internet igarutse, attendance irahita yoherezwa kuri `/api/attendance/sync`

## PWA setup

- `public/manifest.json`
- `public/sw.js`
- `components/PwaRegister.tsx`
- `app/layout.tsx` ishyiramo `manifest` na service worker registration

## Uko wabitangira

1. Shyiramo dependencies:

```bash
npm install
```

2. Kora `.env.local` ugendeye kuri `.env.example`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/nyanza-sda-church
JWT_SECRET=hindura-iri-banga
NEXT_PUBLIC_APP_NAME=Nyanza SDA Church
```

3. Tangiza MongoDB yawe.
4. Fungura development server:

```bash
npm run dev
```

5. Jya kuri `http://localhost:3000`

## Ibyo mwakwongeramo nyuma

- Page yo guhindura no gusiba ukoresheje modal cyangwa drawer
- Real report iva muri database aho gukoresha sample chart data
- User management irushijeho kugenzurwa
- Seed data yo gutangiza system vuba
