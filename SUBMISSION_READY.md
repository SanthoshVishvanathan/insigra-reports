# INSIGRA REPORTS — SUBMISSION PACKAGE & INTERVIEW DEFENSE GUIDE

---

## ⚡ IMMEDIATE ACTION REQUIRED
Before doing anything else, **reply to their email right now with**:
> *"Accepted. Thank you for the opportunity; I am starting the practical task now and will submit before the deadline."*
*(The instructions state: "Please reply 'Accepted' within 24 hours to confirm you are taking the task. Late or unconfirmed submissions will not be reviewed.")*

---

## 📋 FINAL EMAIL SUBMISSION TEMPLATE
When submitting, copy and adapt the email text below:

```text
Subject: Junior Developer Internship Submission - [Your Full Name]

Hi Insigra Reports Team,

Thank you for the opportunity to work on this practical task. I have completed the multi-tenant marketing report prototype strictly enforcing database-level tenant isolation using PostgreSQL Row-Level Security (RLS) and Supabase.

Here are my submission deliverables:

1. LIVE APPLICATION & TEST CREDENTIALS
• Live App URL: [PASTE YOUR VERCEL LINK HERE, e.g., https://insigra-reports-portal.vercel.app]
• Tenant Alpha Ltd:
  - Email: alpha@test.com
  - Password: Password123!
• Tenant Beta Ltd:
  - Email: beta@test.com
  - Password: Password123!

2. GITHUB REPOSITORY
• Repository URL: [PASTE YOUR GITHUB REPO LINK HERE, e.g., https://github.com/your-username/insigra-reports-portal]

3. 3-MINUTE SCREEN RECORDING & WALKTHROUGH
• Video Link: [PASTE LOOM / GOOGLE DRIVE / YOUTUBE UNLISTED LINK HERE]
(In the recording, I demonstrate logging in as Alpha Ltd, switching to Beta Ltd, inspecting the live network requests to show zero frontend filtering, and explaining the PostgreSQL RLS policy.)

4. THREE LINES: WHAT WAS HARD, AND WHAT I'D IMPROVE
• What was hard:
  Ensuring the RLS policy cleanly resolved the user's tenant affiliation through the `profiles` table using `auth.uid()` without triggering recursive policy evaluations or risking accidental table leaks.
• What I'd improve (1):
  Replace string-based `company_name` with a normalized `tenant_id` UUID foreign key and add a composite B-tree index on `(tenant_id, created_at)` to support high-throughput multi-tenant querying.
• What I'd improve (2):
  Embed the `tenant_id` directly into the Supabase custom JWT claims via an auth hook, allowing RLS to evaluate `auth.jwt() ->> 'tenant_id'` in memory without running a subquery against `profiles` on every read.

5. BONUS: AUTOMATIC CUSTOMER ACCESS AFTER SHOPIFY PAYMENT (5 LINES)
1. Configure a Shopify Webhook for the `orders/paid` event pointing to a secure Supabase Edge Function endpoint.
2. Verify the incoming request's authenticity by hashing the request body with HMAC-SHA256 and comparing it to the `X-Shopify-Hmac-Sha256` header.
3. Parse the verified order payload to extract the customer's email, name, and purchased subscription tier/company.
4. Call `supabase.auth.admin.createUser` via the Service Role key to provision the user and insert their organization record into `public.profiles`.
5. Trigger an onboarding email containing a cryptographic magic link (`supabase.auth.admin.generateLink`) so the customer gains immediate, friction-free access.

I look forward to discussing the architecture and walking through the system in the 15-minute follow-up technical call.

Best regards,
[Your Name]
[Your Phone Number]
[Your LinkedIn Profile]
```

---

## 🎙 3-MINUTE SCREEN RECORDING SCRIPT (WORD-FOR-WORD)
Use **Loom** (free at loom.com), **OBS**, or any screen recorder. Share your full browser window with your webcam/audio active.

### [0:00 - 0:35] Introduction & Architectural Overview
> *"Hello everyone! My name is [Your Name], and this is my submission for the Junior Developer internship at Insigra Reports.
> 
> The core problem we are solving is multi-tenant confidentiality: ensuring that Company A can never view Company B's marketing data. 
> 
> The most critical engineering decision here is that security is **not** handled by client-side filtering or frontend URL parameters. Instead, it is enforced at the database kernel level using PostgreSQL Row-Level Security on Supabase. Let's see it in action."*

### [0:35 - 1:15] Demo: Alpha Ltd Login & Isolation Verification
*(Action: On the login page, click the 'Alpha Ltd' demo chip or type `alpha@test.com` and `Password123!`. Click Sign In.)*
> *"First, I'm logging in as `alpha@test.com`, representing Alpha Ltd.
> 
> As you can see, our dashboard immediately loads only Alpha Ltd's 5 campaigns: Google Ads, Meta, LinkedIn, YouTube, and Email Marketing, with a total of 459 leads.
> 
> If we open Chrome Developer Tools and inspect the Network request, our React frontend is issuing a generic `supabase.from('campaign_data').select('*')`. Notice there is **no** `WHERE company_name = 'Alpha Ltd'` query parameter in JavaScript. The database engine itself evaluated our identity and stripped away any unowned rows."*

### [1:15 - 1:50] Demo: Beta Ltd Switching & Zero Cross-Contamination
*(Action: Click 'Sign Out'. Click the 'Beta Ltd' demo chip or type `beta@test.com` and `Password123!`. Click Sign In.)*
> *"Now let's sign out and authenticate as `beta@test.com` for Beta Ltd.
> 
> Instantly, the portal updates. We now see Beta Ltd's 5 distinct campaigns: Google Ads, Meta, LinkedIn, TikTok Ads, and Organic Search, totaling 505 leads. 
> 
> Not a single row from Alpha Ltd is visible or present in the browser memory. Cross-contamination is mathematically impossible because the Postgres query planner rejected those rows before serializing the response."*

### [1:50 - 2:40] Deep-Dive: How Row-Level Security (RLS) Works
*(Action: Expand the 'Technical Security Inspector' accordion on screen, or show `schema.sql` in VS Code / Supabase SQL Editor.)*
> *"Let me explain the security policy that makes this happen.
> 
> In Supabase, we created two tables: `profiles` and `campaign_data`. Both have Row Level Security enabled.
> 
> When an authenticated user makes a request, Supabase validates their JWT and exposes their unique user ID via `auth.uid()`.
> 
> Our RLS policy on `campaign_data` checks:
> `USING (company_name = (SELECT company_name FROM public.profiles WHERE id = (SELECT auth.uid())))`
> 
> When Beta Ltd queries the table, Postgres executes that subquery, discovers the caller belongs to 'Beta Ltd', and restricts the `SELECT` filter to only matching rows. Even if an attacker intercepted our frontend bundle and tried to query all rows, PostgreSQL denies access at the database level."*

### [2:40 - 3:00] Conclusion & Bonus Insight
> *"The frontend is built using React, Vite, Tailwind CSS, and Chart.js for real-time visualization, with clean component separation.
> 
> In a production setup, I would optimize this further by embedding the `tenant_id` into custom JWT claims to eliminate the subquery lookup, and automate customer onboarding via Shopify HMAC-verified webhooks.
> 
> Thank you for reviewing my submission, and I look forward to walking through the code in our live call!"*

---

## 🧠 15-MINUTE LIVE TECHNICAL INTERVIEW PREPARATION
Reviewers will test whether you truly understand every line of code or if you copied it blindly. Here are the exact questions they will ask and how to answer like a top engineer:

### Q1: "Why did you use `(SELECT auth.uid())` instead of just `auth.uid()` in your RLS policy?"
**Your Answer:**
> *"In PostgreSQL, wrapping `auth.uid()` in a scalar subquery `(SELECT auth.uid())` allows the query optimizer to treat it as an init-plan constant rather than re-evaluating the function per row. For large tables, this prevents significant CPU overhead and speeds up index scans."*

### Q2: "What happens if someone opens the browser console and runs `supabase.from('campaign_data').select('*')` directly?"
**Your Answer:**
> *"They will still only get their own company's rows. Because RLS is applied at the database level on the PostgreSQL engine, the Supabase PostgREST API automatically applies the RLS policy to every incoming query using the JWT bearer token. The client cannot override or bypass it."*

### Q3: "Why did you enable RLS on `profiles` as well?"
**Your Answer:**
> *"If `profiles` did not have RLS, any logged-in user could run `supabase.from('profiles').select('*')` and scrape the entire list of user IDs and company affiliations across all clients, creating a critical data leak."*

### Q4: "How does this design scale to 10,000 companies and millions of rows?"
**Your Answer:**
> *"For high scale, I would make two changes: First, use a UUID `tenant_id` foreign key rather than text `company_name`, indexed with a B-tree. Second, use Supabase custom access tokens (auth hooks) to store `tenant_id` directly in the user's JWT claim, so RLS evaluates `auth.jwt() ->> 'tenant_id'` directly in memory without having to query `profiles` on each read."*
