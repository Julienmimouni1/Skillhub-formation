# Frontend Architecture (Client)

t
## Overview

The client is a Single Page Application (SPA) built with **React 18** and **Vite**. It provides a modern, responsive user interface for all user roles (Employees, Managers, HR).

## Tech Stack

- **Build Tool**: Vite (Fast HMR and bundling)
- **Styling**: Tailwind CSS (Utility-first CSS) + `clsx` / `tailwind-merge`
- **Routing**: React Router DOM v6+
- **Icons**: Lucide React
- **Charts**: Recharts (for dashboards)
- **HTTP Client**: Axios

## Project Structure (`src/`)

### `components/`
Reusable UI bricks. Likely follows a hierarchy:
- **UI Elements**: Buttons, Inputs, Cards (atomic).
- **Business Components**: `TrainingCard`, `BudgetChart`, `UserList`.

### `pages/`
Top-level views mapped to routes. Expected structure:
- `Dashboard`: User/Manager/HR specific homepages.
- `MyRequests`: List of user's training requests.
- `Catalog`: Course search interface.
- `Team`: Manager's view of their team.
- `Admin`: HR configuration panels.

### `context/`
React Context for global state management.
- **AuthContext**: Likely manages User Session, JWT storage, and Role checking.

### `layouts/`
- **MainLayout**: Sidebar navigation, Header, Content Area.
- **AuthLayout**: Login/Register page wrapper.

## Key Features & UI Patterns

- **Responsive Design**: Tailwind's mobile-first approach.
- **Role-Based Access**: UI likely adapts based on user role (e.g., "Approve" buttons only for Managers).
- **Data Visualization**: Recharts used for Budget consumption graphs and HR KPIs.

## Development Commands

```bash
# Install Dependencies
npm install

# Start Dev Server (Vite)
npm run dev
# > Local: http://localhost:5173/

# Build for Production
npm run build
```
