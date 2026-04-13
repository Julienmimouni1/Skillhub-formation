# Skillhub-Formation Documentation Index

## Project Overview

- **Type:** Multi-part Web Application (TMS - Training Management System)
- **Primary Languages:** JavaScript (React/Node.js)
- **Architecture:** Client-Server REST API

## Quick Reference

- **Frontend:** React + Vite + Tailwind (`client/`)
- **Backend:** Node.js + Express + Prisma + SQLite (`server/`)
- **Knowledge Base:** Functional Specs (`Skillshub-KB/`)

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Backend Architecture (Server)](./architecture-server.md)
- [Frontend Architecture (Client)](./architecture-client.md)

## Existing Documentation (Skillshub-KB)

### Functional
- [Cahier des Charges](../Skillshub-KB/01_RH_Reglementation/Cahier_des_charges_Skillhub.md)
- [User Stories](../Skillshub-KB/02_FONCTIONNEL/Userstories.csv)
- [Wireframes List](../Skillshub-KB/03_UI_UX/Wireframes_List.md)

### Technical
- [Database Schema (SQL)](../Skillshub-KB/04_TECH/Schema_BDD.sql)
- [ER Diagram](../Skillshub-KB/04_TECH/ERD.txt)
- [Project Doc](../Skillshub-KB/07_DOCS_PROJET/Doc_projet.md)

## Getting Started

1. **Backend**:
   ```bash
   cd server
   npm install
   npx prisma migrate dev
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Access**:
   - App: `http://localhost:5173`
   - API: `http://localhost:3000` (default Express port)
