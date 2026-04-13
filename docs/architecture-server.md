# Backend Architecture (Server)

## Overview

The server is a RESTful API built with **Node.js** and **Express**. It serves as the central hub for data management, business logic, and authentication. It uses **Prisma ORM** to interact with the database.

## Database Schema (Prisma)

The database is modeled in `prisma/schema.prisma`. Here are the core domains:

### 1. Organization & Users
- **User**: Employees with roles (collaborateur, manager, rh, admin). Extended HR fields (contract, job category).
- **Department**: Organizational units with budget tracking.

### 2. Training Core
- **TrainingRequest**: Central entity. Links User, Course, Provider, and Budget. Status workflow (DRAFT -> APPROVED).
- **TrainingCourse**: Catalog items linked to Providers.
- **Provider**: External training organizations.

### 3. Financials
- **BudgetLine**: Allocated funds per department/year.
- **Campaign**: Budgeting periods/campaigns.

### 4. Evaluation & Impact
- **ApplicationPlan**: "Bilan à chaud/froid". ROI tracking.
- **ManagerEvaluation**: Manager's assessment of training impact.
- **AnnualReview**: Yearly performance reviews.

### 5. Skills & Certifications
- **Skill** / **UserSkill**: Competency mapping.
- **UserCertification**: Tracking of obtained certs and expiration.

## API Structure

Routes are defined in `src/routes/` and generally map to domain entities:

| Domain | Route File | Key Responsibilities |
|--------|------------|----------------------|
| **Auth** | `authRoutes.js` | Login, Register, Token Management |
| **Requests** | `requestRoutes.js` | CRUD Training Requests, Workflow Actions |
| **Users** | `adminRoutes.js` | User management, Role assignment |
| **Catalog** | `catalogRoutes.js` | Courses search and management |
| **Budget** | `budgetRoutes.js` | Financial tracking and dashboards |
| **Reviews** | `annualReviewRoutes.js` | Performance review cycle |

## Key Libraries & Patterns

- **Prisma**: Used for all DB operations. Ensures type safety (if TS used) and schema consistency.
- **Multer**: Handles file uploads (PDFs, proofs of attendance) stored in `uploads/`.
- **JWT**: Stateless authentication using Bearer tokens.
- **Parsers**: `csv-parser` for bulk imports, `pdf-parse` for document analysis.

## Development Commands

```bash
# Start Development Server (with nodemon)
npm run dev

# Database Management
npx prisma studio  # GUI to view data
npx prisma migrate dev # Apply schema changes
```
