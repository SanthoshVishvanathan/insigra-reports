# Insigra Reports — Multi-Tenant Marketing Analytics Portal

A production-ready prototype demonstrating **strict database-enforced multi-tenant data isolation** for B2B marketing analytics. Built with **React 18**, **Vite**, **Tailwind CSS**, and **Supabase (PostgreSQL + RLS)**.

---

## 🏛 Architecture & Security Design

The core requirement of this platform is that **Company A must never see Company B's data under any circumstance**.

Rather than relying on client-side filtering or untrusted query parameters (which can be bypassed by anyone opening browser DevTools), isolation is enforced directly inside the PostgreSQL kernel using **Row-Level Security (RLS)**:

```
[ Client Request ] 
       │ 
       ▼
supabase.from('campaign_data').select('*')   <-- Unfiltered in JavaScript
       │
       ▼
[ PostgreSQL RLS Engine ]
       │
       ├─ Reads JWT auth.uid() from the request header
       ├─ Queries public.profiles for caller's company_name
       └─ Evaluates USING (company_name = caller_company)
       │
       ▼
[ Returned Result ]
Only the authenticated tenant's 5 rows are ever serialized or sent across the wire!
```

---

## 🗄 Database Schema & RLS Policies

All database migration and seed scripts are located in the [`supabase/`](./supabase/) folder.

### 1. `public.profiles`
Links Supabase authenticated user UUIDs to their enterprise company name.

```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  company_name text not null,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can only read their own profile row
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
);
```

### 2. `public.campaign_data`
Stores marketing metrics across all companies in a unified table.

```sql
create table public.campaign_data (
  id bigint generated always as identity primary key,
  company_name text not null,
  channel text not null,
  leads integer not null default 0,
  created_at timestamptz default now()
);

alter table public.campaign_data enable row level security;

-- A logged-in user can ONLY view rows where company_name matches their profile
create policy "Users can only view their own company campaign data"
on public.campaign_data
for select
to authenticated
using (
  company_name = (
    select p.company_name
    from public.profiles p
    where p.id = (select auth.uid())
  )
);
```

---

## 🚀 Quick Start (Run Locally)

### 1. Clone & Install Dependencies
```bash
cd insigra-reports-portal
npm install
```
*(On Windows, you can also simply double-click `start-app.bat`)*

### 2. Configure Supabase Environment
Copy `.env.example` to `.env` and provide your Supabase Project URL and Anon Public Key:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations
1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Create the two test users in **Authentication > Users**:
   - `alpha@test.com` (Password: `Password123!`, Auto Confirm: Checked)
   - `beta@test.com` (Password: `Password123!`, Auto Confirm: Checked)
4. Paste and run [`supabase/seed_users.sql`](./supabase/seed_users.sql) to link them to their respective companies.

### 4. Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 🔑 Test Logins

| Tenant | Email | Password | Assigned Rows |
| :--- | :--- | :--- | :--- |
| **Alpha Ltd** | `alpha@test.com` | `Password123!` | 5 rows (Google Ads, Meta, LinkedIn, YouTube, Email) |
| **Beta Ltd** | `beta@test.com` | `Password123!` | 5 rows (Google Ads, Meta, LinkedIn, TikTok, Organic) |

*Tip: The login screen contains 1-click test credential chips for fast switching and grading.*

---

## 🌐 Deploying Live to Vercel (Free & Instant)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete multi-tenant marketing portal with Supabase RLS"
   git branch -M main
   git remote add origin https://github.com/<your-username>/insigra-reports-portal.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"** > Import your GitHub repo.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `(Your Supabase URL)`
   - `VITE_SUPABASE_ANON_KEY`: `(Your Supabase Anon Key)`
4. Click **Deploy**. Your live submission URL will be ready in under 60 seconds!

---

## 💡 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js (`react-chartjs-2`)
- **Backend & Database**: Supabase, PostgreSQL 15, Row-Level Security (RLS), Supabase Auth
- **Design Principles**: Zero client-side tenant trust, defense-in-depth, responsive UI
