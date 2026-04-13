# Cahier des Charges Fonctionnel
# SkillHub Formation V1.0

**Projet :** SkillHub Formation
**Version :** 1.0
**Date :** 15 Novembre 2025
**Auteurs :** [Ton Nom] (Concepteur-Développeur), SkillHub Mentor (Architecte / Expert RH)

---

## 1. Introduction & Contexte

### 1.1. Problématique Actuelle
[cite_start]La gestion des demandes de formation dans les PME et ETI françaises est un processus manuel, fragmenté et chronophage[cite: 132]. [cite_start]Les demandes transitent par emails, fichiers Excel ou discussions informelles [cite: 133][cite_start], entraînant une perte d'information, des délais de validation excessifs [cite: 134] [cite_start]et une incapacité à piloter stratégiquement le budget formation[cite: 135, 140]. [cite_start]La traçabilité légale (archivage, preuves de réalisation) est souvent défaillante, exposant l'entreprise à des risques de non-conformité [cite: 79, 341-342].

### 1.2. Solution Proposée : SkillHub Formation
[cite_start]SkillHub Formation est une application web centralisée (un "cockpit RH") [cite: 13, 144] [cite_start]conçue pour rationaliser et automatiser l'intégralité du workflow de demande de formation, de la soumission par le collaborateur à l'archivage comptable et légal [cite: 14-18].

[cite_start]L'application hybride (Code + No-Code) [cite: 21-23] [cite_start]connecte les collaborateurs, les managers et les RH sur une interface unique, tout en s'intégrant aux outils existants (Email, Slack, Calendriers) via Make.com [cite: 43-45, 49].

### 1.3. Objectifs Métier (KPIs)
* **Réduire de 70%** le temps de traitement administratif d'une demande de formation.
* [cite_start]**Assurer 100%** de traçabilité et de conformité légale (archivage des documents obligatoires [cite: 342]).
* [cite_start]**Fournir une vision temps réel** du budget formation (engagé vs. réalisé)[cite: 17, 149].
* [cite_start]**Améliorer de 50%** les délais de validation manager [cite: 65-66].

---

## 2. Acteurs & Rôles (Permissions)

[cite_start]L'application gérera 4 rôles distincts [cite: 207, 583-587] :

| Rôle | Description | Permissions Clés (V1) |
| :--- | :--- | :--- |
| **Collaborateur** | Tout salarié. | - [cite_start]Soumettre une demande pour soi-même[cite: 146].<br>- Voir l'historique de *ses* demandes et leur statut.<br>- Uploader des documents (devis, programme).<br>- Recevoir des notifications sur *ses* demandes. |
| **Manager** | Salarié ayant une équipe. | - [cite_start]**(Hérite de Collaborateur)**<br>- Voir les demandes de *son équipe*.<br>- Valider / Refuser / Demander un complément (Étape 1)[cite: 147].<br>- Recevoir des notifications pour *son équipe*. |
| **RH (Gestionnaire)** | Membre du service RH/Formation. | - [cite_start]**(Hérite de Collaborateur)**<br>- Voir *toutes* les demandes de l'entreprise.<br>- Valider / Refuser (Étape 2 : validation budgétaire et conformité) [cite: 147][cite_start].<br>- Gérer les budgets par département/entité.<br>- Accéder au dashboard global [cite: 333][cite_start].<br>- Marquer une formation comme "Réalisée".<br>- Archiver les documents (conventions, attestations)[cite: 331]. |
| **Admin** | Super-utilisateur (souvent RH ou Tech). | - **(Hérite de RH)**<br>- Gérer la structure de l'entreprise (utilisateurs, managers, départements).<br>- Paramétrer le moteur de règles (types de formation, seuils de validation).<br>- Gérer les budgets annuels alloués. |

---

## 3. Périmètre Fonctionnel (Features V1)

### 3.1. Module Utilisateurs & Authentification
* **Auth :** Connexion/Déconnexion via email/mot de passe.
* [cite_start]**JWT :** Utilisation de JSON Web Tokens (JWT) pour la sécurisation des routes API[cite: 206, 228].
* **Profil :** Chaque utilisateur peut voir son profil (Nom, Email, Rôle, Manager N+1, Département).

### 3.2. Workflow de Demande de Formation (Le Cœur)
[cite_start]C'est le processus de validation en cascade[cite: 147, 597].

[cite_start]**Statuts possibles de la demande [cite: 59-64] :**
`DRAFT` -> `PENDING_MANAGER` -> `PENDING_RH` -> `APPROVED` / `REJECTED` -> `PLANNED` -> `COMPLETED` -> `ARCHIVED`

1.  [cite_start]**Soumission (Collaborateur)[cite: 327]:**
    * Formulaire de demande incluant :
        * Titre de la formation.
        * [cite_start]Organisme (lien vers `Providers` [cite: 217]).
        * Description / Objectifs.
        * Type de formation (Moteur de règles) :
            * [cite_start]Obligatoire (légal, sécurité)[cite: 337].
            * [cite_start]Plan de développement des compétences[cite: 339].
            * [cite_start]CPF (co-investissement possible)[cite: 339].
            * Autre.
        * Dates souhaitées.
        * [cite_start]Coût estimé HT/TTC[cite: 602].
        * [cite_start]Pièces jointes (Devis, Programme)[cite: 331, 602].
    * À la soumission, la demande passe à `PENDING_MANAGER`.

2.  [cite_start]**Validation Manager (Manager)[cite: 328]:**
    * [cite_start]Le Manager reçoit une notification (Email/Slack via Make [cite: 676-678]).
    * Il peut :
        * **Approuver :** La demande passe à `PENDING_RH`.
        * [cite_start]**Refuser :** Motif obligatoire[cite: 605]. La demande passe à `REJECTED`.
        * **Demander un complément :** La demande repasse à `DRAFT` (avec commentaire).

3.  [cite_start]**Validation RH (RH)[cite: 329]:**
    * Le RH reçoit la demande approuvée par le manager.
    * Le RH vérifie :
        * [cite_start]La conformité légale/OPCO[cite: 338].
        * [cite_start]Le budget restant pour le département[cite: 330].
    * Le RH peut :
        * **Approuver :** Le budget est "engagé". La demande passe à `APPROVED`.
        * **Refuser :** Motif obligatoire. La demande passe à `REJECTED`.

4.  **Planification & Réalisation (RH / Collaborateur) :**
    * `APPROVED` : Le RH et le collaborateur finalisent l'inscription.
    * [cite_start]Le RH uploade la **convention de formation**[cite: 75, 331].
    * Le RH change le statut à `PLANNED`.
    * [cite_start]Après la formation, le RH uploade **l'attestation de présence** et la facture[cite: 76].
    * Le RH change le statut à `COMPLETED`. Le budget est "réalisé".

### 3.3. Module Budget
* [cite_start]**Allocation :** L'Admin/RH définit un budget annuel alloué par département [cite: 649-655].
* **Suivi :** Le système calcule automatiquement 3 métriques par département :
    * **Alloué :** Budget total.
    * **Engagé :** Somme des coûts des demandes `APPROVED` et `PLANNED`.
    * **Réalisé :** Somme des coûts des demandes `COMPLETED`.
    * **Disponible :** Alloué - (Engagé + Réalisé).
* **Alertes :** (V1 simple) Indicateur visuel si une demande dépasse le budget disponible.

### 3.4. [cite_start]Module Dashboard (RH / Admin) [cite: 333]
* [cite_start]Dashboard V1 simple (pas de filtres complexes) [cite: 101-102] :
    * KPI 1 : Nombre de demandes par statut (Graphique Camembert).
    * KPI 2 : Budget (Alloué / Engagé / Réalisé) par département (Graphique Barres).
    * KPI 3 : Top 5 des formations les plus demandées.
    * Liste des demandes en attente de validation (RH et Manager) depuis > 5 jours.

### 3.5. [cite_start]Module d'Automatisation (Make.com) [cite: 335]
[cite_start]Le Backend (Node.js) enverra des **webhooks** à Make.com lors de changements de statut critiques[cite: 529]. Make gérera les communications externes :

* [cite_start]**Scénario 1 : Nouvelle demande Manager [cite: 676-678]**
    * *Trigger :* Statut passe à `PENDING_MANAGER`.
    * [cite_start]*Action :* Envoi email + Slack au N+1 concerné[cite: 682].
* [cite_start]**Scénario 2 : Rappel Manager [cite: 683]**
    * *Trigger :* Tâche planifiée (tous les jours).
    * *Action :* Cherche demandes `PENDING_MANAGER` > 3 jours. Envoi d'un rappel.
* **Scénario 3 : Notification de Statut (Collaborateur)**
    * *Trigger :* Statut passe à `APPROVED` ou `REJECTED`.
    * *Action :* Envoi email au collaborateur avec le statut et le motif (si refus).
* [cite_start]**(V1.5 - Si le temps) Génération de documents [cite: 680-681]**
    * *Trigger :* Statut passe à `APPROVED`.
    * [cite_start]*Action :* Pré-remplir un template Google Doc (Convention) avec les infos de la demande[cite: 684].

---

## [cite_start]4. Architecture Technique (V1) [cite: 197-231]

| Composant | Technologie | Justification |
| :--- | :--- | :--- |
| **Frontend** | [cite_start]React.js [cite: 199] | Composants modulaires, écosystème robuste. Parfait pour un dashboard. |
| **State Mgt** | Zustand | [cite_start]Plus simple et léger que Redux pour ce périmètre[cite: 202]. |
| **UI** | Mantine ou Chakra UI | Bibliothèques de composants UI pour accélérer le dev. |
| **Backend** | [cite_start]Node.js + Express [cite: 204] | [cite_start]Efficace pour une API REST, écosystème (NPM), JS partout[cite: 205]. |
| **Base de Données** | [cite_start]PostgreSQL [cite: 209] | [cite_start]Robuste, gestion des relations complexes, intégrité des données[cite: 210]. |
| **Authentification** | [cite_start]JWT (stocké en cookie httpOnly) [cite: 206, 228] | Standard de l'industrie pour les API REST. |
| **Automatisation** | [cite_start]Make.com [cite: 221] | [cite_start]Flexibilité pour les workflows externes (mails, Slack, GDocs) [cite: 222-226]. |
| **DevOps** | Git (Github), Docker (local) | [cite_start]Bonnes pratiques, reproductibilité[cite: 276]. |

---

## 5. Contraintes & Risques

### 5.1. [cite_start]Contraintes RH & Légales (France) [cite: 309, 336]
* [cite_start]**Traçabilité :** L'application DOIT archiver les documents probants (conventions, attestations)[cite: 342]. Le simple "clic" ne suffit pas légalement.
* **Budget :** Le système doit différencier "coût engagé" et "coût réalisé" pour la comptabilité.
* **OPCO :** La V1 ne gère pas les dossiers de remboursement OPCO, mais doit stocker les documents nécessaires à leur constitution.
* **RGPD :** Les données de formation sont personnelles. L'accès doit être strictement cloisonné par rôle.

### 5.2. Risques Techniques
* **Gestion des Rôles :** Le risque principal. [cite_start]Un collaborateur ne doit JAMAIS voir les demandes d'un autre ou le budget global[cite: 229]. Les tests devront être intensifs sur ce point.
* **Cohérence des Données :** Le calcul du budget doit être transactionnel pour éviter les erreurs (ex: deux RH valident en même temps).
* **Dépendance Make :** Si Make.com tombe, les notifications sont perdues. Le statut dans l'app doit rester la "source de vérité".

### 5.3. Risques Projet (Périmètre)
* [cite_start]**Le "Moteur de règles"[cite: 82]:** Risque de "feature creep". [cite_start]La V1 se limitera à un simple champ "type"[cite: 628]. [cite_start]L'arbitrage automatique (Score d'éligibilité [cite: 88-94]) est **HORS PÉRIMÈTRE V1**.
* [cite_start]**L'IA[cite: 95]:** L'assistant IA pour résumer les formations est **HORS PÉRIMÈTRE V1**.
* [cite_start]**Intégrations SIRH[cite: 50, 190]:** La synchronisation des utilisateurs avec des SIRH (Lucca, Payfit) est **HORS PÉRIMÈTRE V1**. La gestion des utilisateurs sera manuelle par l'Admin.

---

## 6. Hors Périmètre (V1)

Pour être clair, les éléments suivants ne seront **pas** développés dans la V1 :
* Gestion avancée du CPF (connexion API MonCompteFormation).
* Génération et soumission automatique des dossiers OPCO.
* [cite_start]Moteur de règles avancé ou score d'éligibilité [cite: 88-94].
* [cite_start]Intégration directe des calendriers (Outlook, Google Cal)[cite: 49].
* Application mobile native.
* [cite_start]Assistant IA[cite: 95].