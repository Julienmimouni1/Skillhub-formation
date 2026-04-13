# Project Overview: Skillhub-Formation

## Executive Summary

Skillhub-Formation is a comprehensive **Training Management System (TMS)** designed to manage the entire lifecycle of professional training within an organization. It handles training requests, budget management, regulatory compliance (French market focus), and career development plans.

The project is structured as a **modern web application** with a clear separation of concerns between a React-based frontend and a Node.js/Express backend.

## Technology Stack Summary

| Component | Technology | Key Libraries |
|-----------|------------|---------------|
| **Frontend** | React 18 (Vite) | Tailwind CSS, Lucide React, Recharts, React Router 6 |
| **Backend** | Node.js / Express | Prisma ORM, JWT, Multer, PDF/CSV parsers |
| **Database** | SQLite (Dev) | Prisma Schema (Ready for PostgreSQL/MySQL) |
| **Documentation** | Markdown | Skillshub-KB (Functional Specs), Auto-generated Docs |

## Repository Structure

The project follows a **Multi-part** repository structure:

```
Skillhub-Formation/
├── client/          # Frontend Application (React)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application views
│   │   ├── layouts/     # Page layouts
│   │   └── context/     # Global state (Auth, etc.)
│   └── package.json
├── server/          # Backend API (Express)
│   ├── src/
│   │   ├── routes/      # API Endpoints
│   │   ├── controllers/ # Request logic
│   │   └── models/      # (Legacy/Utils)
│   ├── prisma/
│   │   └── schema.prisma # Database Source of Truth
│   └── package.json
└── Skillshub-KB/    # Knowledge Base & Functional Specs
```

## Key Features (Detected)

- **Training Request Management**: Workflow for employees and managers.
- **Budget Control**: Tracking allocated vs engaged budgets per department.
- **Regulatory Compliance**: Tracking of legal obligations (Gender Parity, Interviews).
- **Catalog Management**: Training courses and providers.
- **Reporting**: Dashboards and data visualization.

## Documentation Navigation

- **[Backend Architecture](./architecture-server.md)**: Database schema, API endpoints, and server logic.
- **[Frontend Architecture](./architecture-client.md)**: UI components, routing, and state management.
- **[Knowledge Base](../Skillshub-KB/00_README.AGENT.md)**: Original functional specifications and user stories.
