---
title: Skillhub-Formation Product Requirements Document
status: Draft
version: 1.0
authors:
  - Julien (Product Visionary)
  - John (Product Manager Agent)
created: 2026-01-18
last_updated: 2026-01-18
inputDocuments:
  - docs/index.md
  - docs/project-overview.md
  - Skillshub-KB/01_RH_Reglementation/Cahier_des_charges_Skillhub.md
  - Skillshub-KB/02_FONCTIONNEL/newFeatures.md
  - Skillshub-KB/07_DOCS_PROJET/Doc_projet.md
stepsCompleted:
  - step-01-init
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 5
---

# 1. Introduction & Context

## 1.1 Executive Summary

Skillhub-Formation is a **Training Management System (TMS)** designed to streamline the professional training lifecycle within organizations.

**Current State (Brownfield):**
A foundational web application exists with:
- **Frontend:** React 18 (Vite, Tailwind).
- **Backend:** Node.js (Express, Prisma, SQLite).
- **Core Features:** Basic training request workflow, simple role management.

**Vision (V2 - "The Transformation"):**
The goal is to evolve this MVP into a **"Consumer-Grade" Corporate Platform** that drives engagement through gamification, robustifies compliance, and empowers managers with real operational tools. We aim to move from "Administrative Tool" to "Employee Growth Engine".

## 1.2 Problem Statement

Traditional TMS solutions are:
1.  **Administrative & Dull:** Focusing on compliance rather than user engagement.
2.  **Disconnected:** Managers lack visibility on team skills and budget impact.
3.  **Passive:** Employees wait for training rather than actively seeking growth.
4.  **Opaque:** HR struggles with "Zero Paper" compliance and accurate budget tracking.

## 1.3 Strategic Goals

| Goal | Success Metric (KPI) |
| :--- | :--- |
| **Maximize Engagement** | Monthly Active Users (MAU) > 80% (driven by Gamification/Nudges). |
| **Operational Efficiency** | Reduce Manager validation time by 50% (via "Out of Office", delegation). |
| **Zero-Risk Compliance** | 100% of "Completed" trainings have compliant archive (Convention, Attendance). |
| **Strategic Alignment** | 100% visibility on Team Skills vs Needs (Skill Matrix). |

---

# 2. User Personas

| Persona | Role | Core Need | "Aha!" Moment |
| :--- | :--- | :--- | :--- |
| **Sophie (The Retailer)** | Collaborator | Wants to grow without friction. Needs help navigating the catalog. | Seeing her "Learning Streak" increase and getting a "Badge" for her Excel skills. |
| **Marc (The E-tailer)** | Manager | Wants to develop his team without administrative burden. Needs budget visibility. | Being alerted of "Team Inequity" and delegating approval while on vacation. |
| **Claire (The Guardian)** | HR Admin | Wants watertight compliance and budget control. | Seeing the "Archive Ready" green checkmark only when all docs are present. |

---
