# EarnFlow — Your Gateway to Online Rewards

**EarnFlow** is a production-quality, responsive task-rewards platform inspired by modern Nigerian fintech interfaces. It features an original visual identity, minimalist clean aesthetics, a green-based palette (`#16A34A`), and a complete full-stack architecture.

---

## 🌟 Key Features

1. **Original Brand Identity & Aesthetics**:
   - Modern green-accented palette: Primary `#16A34A`, Dark `#111827`, Light `#F8FAFC`, Borders `#E2E8F0`.
   - Header (~72px high) with original geometric reward-flow icon, sticky backdrop blur, desktop navigation, and mobile hamburger drawer.
   - Split hero section with original upward rewards growth vector graphic.
   - Distinctive demonstration statistics cards (10K+ Active Users, ₦5M+ Processed, 50+ Tasks, 24/7 Support) labeled clearly with `DEMO` indicators.
   - "Why Choose EarnFlow?" (4 cards with subtle hover elevation).
   - "How It Works" (3-step horizontal process with numbered circular indicators).

2. **Task Marketplace (`/tasks` & `/tasks/:id`)**:
   - Filter by categories: `Surveys`, `Apps`, `Social`, `Other`.
   - Live search bar and reward indicators.
   - Task details page with instructions, eligibility criteria, and "Start Task" workflow.
   - Proof submission (notes, confirmation codes, screenshot links).
   - Workflow statuses: `Pending Review`, `Approved`, `Rejected`, `Completed`.

3. **Wallet, Earnings & Withdrawals (`/earnings` & `/withdraw`)**:
   - Live database-backed metrics: Available Balance, Total Earned, Pending Rewards, Total Withdrawn.
   - Filterable transaction ledger by type (`task_reward`, `referral_reward`, `withdrawal`, `activation_fee`) and status.
   - Nigerian bank payout system supporting all 27+ licensed commercial & microfinance banks.
   - NUBAN 10-digit validation and minimum withdrawal enforcement (₦1,000).

4. **Account Activation Gate (`₦1,000 Fee`)**:
   - To prevent fraudulent bots, users must pay a one-time lifetime activation fee of **₦1,000** before initiating withdrawals.
   - Directs to a simulated payment gateway modal supporting **Bank Transfer**, **Debit Card**, and **USSD**.
   - If withdrawal is attempted before administrator confirmation, the system returns:  
     `"account not activated"` (HTTP 403).
   - Administrators can review and toggle activation status directly in the Admin Console.

5. **Referral Network (`/referrals`)**:
   - Unique referral code and 1-click copyable referral link.
   - Real-time referral statistics and invited users history.
   - Instant WhatsApp sharing shortcut.

6. **Admin Backoffice (`/admin/*`)**:
   - **Dashboard**: High-level system metrics (Users, Available Tasks, Pending Submissions, Pending Withdrawals, Total Rewards).
   - **User Management (`/admin/users`)**: Search, activate/suspend accounts, confirm ₦1,000 activation fee payments.
   - **Task Management (`/admin/tasks`)**: Create, edit, delete, and toggle task availability.
   - **Submission Management (`/admin/submissions`)**: Review user evidence; approving a task automatically credits the configured reward to the user's available balance and logs a transaction.
   - **Withdrawal Settlements (`/admin/withdrawals`)**: Approve, mark processing, complete payout, or reject with a reason (which refunds the user's available balance).
   - **Audit Trail (`/admin/audit-logs`)**: Immutable logging of all administrative actions, IP addresses, and financial modifications.

---

## 📁 Project Architecture

```
earnflow/
├── client/                     # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, StatCard, Badge, EmptyState, Modal...)
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── pages/              # Public & User pages (Home, Register, Login, Dashboard, Tasks...)
│   │   ├── pages/admin/        # Backoffice pages (AdminDashboard, AdminUsers, AdminTasks...)
│   │   ├── services/           # API fetch wrapper
│   │   ├── App.jsx             # Route definitions & guards (ProtectedRoute, AdminRoute)
│   │   ├── index.css           # Custom Tailwind tokens & scrollbars
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend API
│   ├── controllers/            # auth, task, wallet, activation, referral, profile, admin
│   ├── database/
│   │   ├── schema.sql          # PostgreSQL relational schema
│   │   ├── seeds.sql           # Initial database seeds
│   │   └── db.js               # Resilient PostgreSQL pool with zero-config local fallback
│   ├── middleware/             # auth.js (JWT validation, requireAdmin)
│   ├── routes/                 # Express route definitions
│   ├── package.json
│   ├── server.js               # Server entry point with security & rate limiting
│   └── .env.example
│
├── test_suite.js               # Automated 14-point E2E verification test suite
└── README.md
```

---

## Development Demo Accounts

These seeded accounts and the file-backed database are for local development only. Do not use them in production. Admin sign-in is at `/admin-portal`; the admin console is at `/admin`.

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@earnflow.ng` | `Uchman1472#` | Full access to `/admin` backoffice |
| **Active User** | `chidi@example.com` | `UserPass123!` | Account activated, wallet balance ₦2,450 |
| **Unactivated User** | `amina@example.com` | `UserPass123!` | Unactivated account, demonstrates ₦1,000 gate |

---

## 🚀 Installation & Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher (`node -v`)
- **npm**: v9 or higher (`npm -v`)
- **PostgreSQL**: Optional for local development; required in production. The file-backed store is development-only.

### Step 1: Install Dependencies

1. **Install Server Dependencies**:
   ```bash
   cd earnflow/server
   npm install
   ```

2. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

---

### Step 2: Environment Configuration

In `earnflow/server`:
```bash
cp .env.example .env
```

For local development, set `NODE_ENV=development` and use a unique `JWT_SECRET`. For production, configure every required variable in `.env.example` through your hosting provider's secret manager; never commit `.env` files.

---

### Step 3: Database Setup (PostgreSQL)

If using a live PostgreSQL database (local, Supabase, Neon, or Railway):

1. Create database:
   ```sql
   CREATE DATABASE earnflow;
   ```

2. Run schema migrations:
   ```bash
   psql -U postgres -d earnflow -f earnflow/database/schema.sql
   ```

3. Set `DATABASE_URL` in `earnflow/server/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/earnflow
   ```

*Note: Without PostgreSQL, local development uses `server/database/earnflow_store.json`. Production startup rejects this fallback and requires the schema to be applied.*

---

### Step 4: Development Commands

1. **Start Backend Server** (runs on `http://localhost:5000`):
   ```bash
   cd earnflow/server
   npm run dev
   ```

2. **Start Frontend Dev Server** (runs on `http://localhost:3000`):
   ```bash
   cd earnflow/client
   npm run dev
   ```

Open your browser at `http://localhost:3000/`.

---

### Step 5: Run Automated Verification Suite

To verify all 14 functional requirements (registration, referral attribution, task evidence submission, ₦1,000 withdrawal gate enforcement, admin task approvals, and wallet balance crediting):

```bash
cd earnflow
node test_suite.js
```

---

### Step 6: Production Build Instructions

1. **Build Client Bundle**:
   ```bash
   cd earnflow/client
   npm run build
   ```
   *Outputs optimized static assets to `earnflow/client/dist/`.*

2. **Prepare Production Configuration**:
   - Provision PostgreSQL and apply `earnflow/database/schema.sql`.
   - Set `NODE_ENV=production`, `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and live `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY`. For a separately hosted frontend, build with `VITE_API_BASE_URL` set to the API URL and set `CORS_ORIGINS` to the frontend origin.
   - Register the first administrator, then promote that account in PostgreSQL with `UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';`.
   - Configure HTTPS at your hosting provider or reverse proxy. Never use the development demo accounts or test Paystack keys in production.

3. **Run Production Server** (serves the built client and API on the same origin):
   ```bash
   cd earnflow/server
   npm start
   ```

The app will be available at your production hostname. Admin login and console paths are `/admin-portal` and `/admin` respectively. A public URL is available after you choose and configure a hosting provider and domain.

---

## 🔒 Security Practices Implemented

- **Password Hashing**: Industry standard bcrypt (10 rounds).
- **Authentication**: Stateless JSON Web Tokens (JWT) with 7-day expiration and signature verification.
- **Authorization**: Role-based access control (`requireAdmin` middleware) preventing unauthorized access to administrative financial routes.
- **Input Sanitization**: Server-side parameter validation for emails, passwords, and 10-digit NUBAN account numbers.
- **Rate Limiting**: `express-rate-limit` protecting `/api/auth/*` from brute-force attempts.
- **Security Headers**: `helmet` securing HTTP response headers and preventing clickjacking and MIME-type sniffing.
- **Audit Logging**: Comprehensive recording of all financial actions, status toggles, reviewer approvals, and administrator IP addresses.
