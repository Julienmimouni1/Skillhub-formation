# Liste des Écrans (Wireframes) V1 - SkillHub

**Objectif :** Définir tous les écrans (vues) nécessaires pour que l'application soit fonctionnelle et couvre toutes les User Stories.

## 1. Vues Publiques (Non authentifié)
- **W-101 : Page de Connexion** (US-101)
  - Champs : Email, Mot de passe
  - Bouton : "Se connecter"

## 2. Vues Communes (Layout global)
- **W-201 : Navigation Principale (Layout)**
  - (Après connexion)
  - Barre latérale avec liens : "Mon Dashboard", "Mon Équipe" (si Manager), "Validation RH" (si RH), "Admin" (si Admin)
  - En-tête avec : Nom de l'utilisateur, Bouton "Mon Profil", Bouton "Se déconnecter" (US-103)

- **W-202 : Page "Mon Profil"** (US-104)
  - Affiche les infos (lecture seule) : Nom, Email, Rôle, Département, Manager N+1.

## 3. Parcours Collaborateur
- **W-301 : Dashboard Collaborateur** (US-201)
  - Bouton "Nouvelle Demande" (US-202)
  - Tableau de bord simple : "Mes demandes"
  - Colonnes : Titre, Statut (avec pastille de couleur), Coût, Date soumission.
  - *Comportement :* Cliquer sur une ligne mène à W-303.

- **W-302 : Formulaire de Demande (Création / Édition)** (US-203 à US-208)
  - Écran en plusieurs étapes (ou un seul long formulaire) :
  - Champs : Titre, Description, Organisme, Coût, Type, Dates.
  - Module d'upload de fichiers (glisser-déposer) (US-206).
  - Boutons : "Enregistrer en Brouillon" (US-207), "Soumettre" (US-208).

- **W-303 : Vue Détail d'une Demande (Lecture Seule)** (US-212)
  - Affiche tous les détails de la demande.
  - Section "Documents joints" (téléchargeables).
  - Section "Historique de validation" (timeline simple) (US-212).
  - *Note :* C'est la vue "résumé" de la demande.

## 4. Parcours Manager
- **W-401 : Dashboard Manager ("Mon Équipe")** (US-301)
  - Concerne *uniquement* les demandes `PENDING_MANAGER` de ses N-1.
  - Tableau : Nom du collaborateur, Titre demande, Coût, Date soumission.
  - *Comportement :* Cliquer sur une ligne mène à W-402.

- **W-402 : Vue de Validation (Manager)** (US-303 à US-307)
  - Affiche la vue W-303 (Détail de la demande).
  - **Zone d'action (Manager) :**
    - Rappel du budget dispo (US-304).
    - Champ "Commentaire".
    - Bouton "Demander un complément" (US-307) -> (Commentaire obligatoire).
    - Bouton "Refuser" (US-306) -> (Commentaire obligatoire).
    - Bouton "Approuver" (US-305).

## 5. Parcours RH
- **W-501 : Dashboard RH (Global)** (US-401)
  - Concerne *uniquement* les demandes `PENDING_RH`.
  - Tableau : Nom collaborateur, Titre demande, Coût, Département, Date.
  - *Comportement :* Cliquer sur une ligne mène à W-502.

- **W-502 : Vue de Validation (RH)** (US-403 à US-405)
  - Affiche la vue W-303 (Détail de la demande).
  - **Zone d'action (RH) :**
    - Rappel budget département (US-402).
    - Bouton "Refuser" (US-405) -> (Motif obligatoire).
    - Bouton "Approuver" (US-404).

- **W-503 : Vue de Gestion (RH)** (US-406 à US-410)
  - S'applique aux demandes `APPROVED`, `PLANNED`, `COMPLETED`.
  - Boutons pour changer le statut : "Marquer comme Planifiée", "Marquer comme Réalisée".
  - Module d'upload (pour Convention, Attestation) (US-407, 409).

- **W-504 : Dashboard KPIs (RH/Admin)** (US-402)
  - Affiche les graphiques (Camembert, Barres) définis dans l'API Spec (`/api/v1/dashboard/kpis`).

## 6. Parcours Admin
- **W-601 : Panneau Admin - Gestion Utilisateurs** (US-502, 503)
  - Tableau des utilisateurs.
  - Bouton "Créer utilisateur".
  - Formulaire de création/édition (Email, Nom, Rôle, Département, Manager).

- **W-602 : Panneau Admin - Gestion Départements** (US-505, 506)
  - Tableau des départements.
  - Formulaire d'édition (Nom, Budget alloué, Année).