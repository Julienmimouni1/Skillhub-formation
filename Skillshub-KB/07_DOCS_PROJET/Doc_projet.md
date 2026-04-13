# Documentation Projet - SkillHub Formation

> **Statut :** V1 (Lancement)
> **Dernière M.A.J :** Décembre 2025
> **Cible :** Direction, Investisseurs, Équipe Technique, Partenaires

---

## I. Synthèse Exécutive (Le Pitch)

**Le Problème :**
La gestion de la formation dans les PME/ETI françaises (250-2000 employés) est un point de friction critique. Toujours gérée manuellement via Excel et emails, elle expose l'entreprise à deux risques majeurs :
1.  **Risque Légal :** Non-conformité aux obligations de traçabilité (Entretiens pro, BPF, Archivage).
2.  **Perte Financière :** Pilotage budgétaire "à l'aveugle", incapacité à optimiser les fonds (OPCO/FNE), dépassements non maîtrisés.

**La Solution : SkillHub Formation.**
Un "Cockpit RH" centralisé qui digitalise l'intégralité du workflow, sécurise la conformité légale et offre un pilotage financier en temps réel.

**Impact Marché :**
SkillHub transforme une obligation administrative ("dépense contrainte") en un levier de performance ("investissement piloté"). Notre approche "Compliance-First" nous positionne comme le partenaire de confiance des DRH exigeants.

---

## II. Conformité RH France et Processus

SkillHub est conçu nativement pour répondre aux exigences du Code du Travail français et de la certification Qualiopi.

### 1. Garantie de Traçabilité (Audit Trail)
*   **Workflow Séquentiel :** Chaque étape (Demande > Validation Manager > Validation RH > Commande) est horodatée.
*   **Preuve d'Imputabilité :** Signature électronique et logs inaltérables pour prouver qui a validé quoi et quand (Preuve en cas de litige prud'homal).
*   **Historique Salarié :** Vision consolidée de toutes les formations suivies pour alimenter l'entretien professionnel (Obligation légale tous les 2 ans).

### 2. Gestion des Obligations & Dispositifs
*   **Convention & Émargement :** Collecte et stockage centralisé des preuves de réalisation (Requis pour le BPF).
*   **Dispositifs de Financement :** Identification "Tagging" des demandes éligibles (Plan de Développement des Compétences, CPF co-construit, POE, FNE).
*   **Alertes Réglementaires :** Notifications automatiques pour les recyclages obligatoires (Santé, Sécurité, Habilitations).

---

## III. Spécifications Fonctionnelles V1

La version V1 se concentre sur le "Core Loop" : De la demande à la facturation.

### 👤 Collaborateur
*   **Catalogue de Formation :** Recherche filtrée par thématique avec "Détails Programme".
*   **Demande Simplifiée :** Formulaire de demande (avec motivation) pré-rempli.
*   **Dashboard Personnel :** Suivi statut des demandes (En attente, Validé, Refusé) & Accès aux convocations.
*   **Historique :** Accès à son passeport formation (Formations réalisées).

### 👔 Manager
*   **Validation des Demandes :** Interface "One-Click Validation/Refus" avec motif.
*   **Vue d'Équipe :** Calendrier des absences formation de l'équipe.
*   **Pré-Arbitrage Budgétaire :** Vision de l'impact budgétaire d'une validation ("Si je valide, il reste X€").

### 💼 Responsable RH (Admin)
*   **Pilotage Budgétaire (Le "Cockpit") :**
    *   Gestion des Budgets par Département/Entité.
    *   Jauges Temps Réel : Alloué / Engagé / Réalisé / Reste à faire.
*   **Workflow Master :** Super-validation finale et arbitrage des priorités.
*   **Gestion Documentaire :** Upload/Download des Devis, Conventions, Factures.
*   **Gestion des Organismes :** Base de données fournisseurs et contacts.

### 🤖 Automatisation (Le Moteur Invisible)
*   **Notifications Email (Make.com) :**
    *   *Manager :* "Nouvelle demande à valider de [Nom]."
    *   *Rh :* "Demande validée par Manager, en attente de validation finale."
    *   *Collab :* "Votre formation est validée / refusée."
*   **Génération Documents :** Création PDF automatique de l'Ordre de Mission (si applicable).

---

## IV. Architecture Technique

Une Stack moderne, robuste et scalable, privilégiant la stabilité et la rapidité de déploiement.

### 1. La Stack
*   **Frontend :** React.js (SPA). Expérience utilisateur fluide et réactive.
    *   *Style :* TailwindCSS (Design System cohérent, Responsive).
*   **Backend :** Node.js / Express.
    *   *API REST :* Architecture claire et documentée.
*   **Base de Données :** PostgreSQL.
    *   *Pourquoi ?* Robustesse relationnelle, intégrité des données (essentiel pour la compta/RH), conformité ACID.
*   **Automatisation :** Make.com / Webhooks.
    *   *Pourquoi ?* Déporte la complexité des notifications et des intégrations tierces hors du code core. Agilité de modification des workflows.

### 2. Choix Structurants
*   **Authentification :** JWT (Intercepteurs Axios pour gestion sécurisée des sessions).
*   **Sécurité :** Hachage Mots de passe (Bcrypt), Validation des entrées (Joi/Zod) pour éviter injections SQL/XSS.
*   **Hébergement (Cible) :** Conteneurisation Docker, Déploiement Cloud (AWS/Azure/Vercel) pour la haute disponibilité.

---

## V. Vision et Scalabilité SaaS

SkillHub a vocation à devenir l'OS (Operating System) de la formation en France.

### Phase 2 : L'Engagement (V1.5)
*   **Skill Wallet :** Passeport de compétences portable pour le collaborateur.
*   **Gamification :** Nudges et barres de progression pour inciter à la formation.
*   **Feedback Qualiopi :** Récolte automatique des avis à chaud (J+1).

### Phase 3 : L'Intelligence (V2)
*   **Moteur de Recommandation IA :** "D'après votre poste, vous devriez faire cette formation."
*   **Optimisation Fiscale Auto :** Algorithme détectant les subventions oubliées.
*   **Intégrations SIRH :** Connecteurs natifs (Lucca, Payfit, Workday) pour synchronisation des employés.

---
*Document confidentiel - Propriété de SkillHub Formation*
