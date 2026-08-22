<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=4F46E5&center=true&vCenter=true&width=600&lines=Dayflow+%E2%80%94+HR+Management+System;Attendance+%C2%B7+Leave+%C2%B7+Payroll;Built+for+the+Odoo+Hackathon" alt="Dayflow typing banner" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-4F46E5?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase" />
  <img src="https://img.shields.io/badge/Built%20with-Bolt-000000?style=for-the-badge" alt="bolt" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=for-the-badge" alt="license" />
</p>

<p align="center">
  <b>A production-quality HRMS prototype</b> for Employee & Admin/HR workflows — authentication,
  attendance, leave management, and payroll, built end-to-end on Supabase.
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-database-schema">Database</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-team">Team</a>
</p>

---

## 🔗 Live Demo

<p align="center">
  <a href="https://human-resource-manag-s0rp.bolt.host">
    <img src="https://img.shields.io/badge/▶ Launch Live App-4F46E5?style=for-the-badge" alt="live demo" />
  </a>
  <a href="https://github.com/Mohithofficiall-commits/odoo-nmit-hackathon-2026/tree/main">
    <img src="https://img.shields.io/badge/View Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="repo" />
  </a>
</p>

**Demo credentials**

| Role | Email | Password |
|---|---|---|
| Employee | `employee@dayflow.demo` | `Demo@1234` |
| Admin/HR | `admin@dayflow.demo` | `Demo@1234` |

---

## ✨ Features

<details>
<summary><b>👤 Employee</b></summary>

- Dashboard — today's attendance status, check-in/check-out, working hours, leave balance, recent requests
- Profile — personal, job, and salary info; edit phone, address, and picture only
- Attendance — check-in/check-out that persists to the database; daily & weekly view
- Leave — apply (Paid/Sick/Unpaid), track status in real time
- Payroll — read-only view of salary structure

</details>

<details>
<summary><b>🛠️ Admin / HR</b></summary>

- Dashboard — headcount, present/absent today, on leave, pending requests
- Employees — search, filter, view, and edit employee records
- Attendance management — view all records with daily/weekly filters
- Leave approval — approve/reject with comments, reflects instantly for the employee
- Payroll — view and update salary structures across all employees

</details>

---

## 🏗️ Architecture

```mermaid
flowchart TD
    A[Employee / Admin Login] --> B{Role Check}
    B -->|Employee| C[Employee Dashboard]
    B -->|Admin/HR| D[Admin Dashboard]

    C --> C1[Check-in / Check-out]
    C --> C2[Apply Leave]
    C --> C3[View Attendance]
    C --> C4[View Payroll]

    D --> D1[View Employees]
    D --> D2[Attendance Management]
    D --> D3[Leave Approval]
    D --> D4[Update Payroll]

    C1 --> E[(Supabase DB)]
    C2 --> E
    D3 --> E
    D4 --> E
    E --> C3
    E --> C4
```

---

## 🔄 Demo Flow

```mermaid
sequenceDiagram
    participant Emp as Employee
    participant App as Dayflow App
    participant DB as Supabase
    participant Adm as Admin/HR

    Emp->>App: Login
    Emp->>App: Check-in
    App->>DB: Save attendance record
    Emp->>App: Apply for leave
    App->>DB: Save leave request (Pending)

    Adm->>App: Login
    Adm->>App: View pending leave requests
    Adm->>App: Approve leave
    App->>DB: Update leave status
    Adm->>App: Update payroll
    App->>DB: Save payroll changes

    Emp->>App: Refresh
    App->>DB: Fetch latest status
    DB-->>Emp: Approved leave + updated payroll
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    PROFILES ||--o{ EMPLOYEES : has
    EMPLOYEES ||--o{ ATTENDANCE : logs
    EMPLOYEES ||--o{ LEAVE_REQUESTS : submits
    EMPLOYEES ||--o{ PAYROLL : receives

    PROFILES {
        uuid id PK
        string email
        string role
        timestamp created_at
    }
    EMPLOYEES {
        uuid id PK
        uuid profile_id FK
        string employee_id
        string name
        string department
        string designation
        string phone
        string address
    }
    ATTENDANCE {
        uuid id PK
        uuid employee_id FK
        date date
        timestamp check_in
        timestamp check_out
        string status
    }
    LEAVE_REQUESTS {
        uuid id PK
        uuid employee_id FK
        string leave_type
        date start_date
        date end_date
        string status
        string remarks
        string admin_comment
    }
    PAYROLL {
        uuid id PK
        uuid employee_id FK
        numeric base_salary
        numeric allowances
        numeric deductions
        date effective_date
    }
```

> Row Level Security is enforced so employees can only read/write their own records, while Admin/HR roles have elevated access for management operations.

---

## 🚀 Getting Started

<details>
<summary>Click to expand setup instructions</summary>

```bash
# 1. Clone the repo
git clone https://github.com/Mohithofficiall-commits/odoo-nmit-hackathon-2026.git
cd odoo-nmit-hackathon-2026

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key to .env

# 4. Run the app
npm run dev
```

</details>

---

## 🧰 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
</p>

---

## 👥 Team

<details>
<summary>Click to expand contributors</summary>

| Name | Role | GitHub |
|---|---|---|
| MOHITH L| Frontend | [@REPLACE_HANDLE_1](https://github.com/Mohithofficiall-commits) |
| KAVIN R| Backend | [@REPLACE_HANDLE_2](https://github.com/Kavin-124) |
| MOULITHARAN IR| Database | [@REPLACE_HANDLE_3](https://github.com/Moulitharan0107) |
| NAGARAJ V | UI/UX | [@REPLACE_HANDLE_4](https://github.com/nagarajvenkatachalam1-ctrl) |

</details>

---

<p align="center">
  <sub>Built with ❤️ for the Odoo Hackathon · <a href="LICENSE">MIT License</a></sub>
</p>
