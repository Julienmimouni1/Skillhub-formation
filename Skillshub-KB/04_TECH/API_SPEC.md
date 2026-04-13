# Spécification API REST - SkillHub Formation V1.0

**URL de base (Base URL) :** `/api/v1`
**Format des données :** JSON (sauf pour l'upload de fichiers)
**Authentification :** JWT stocké dans un cookie `httpOnly` nommé `access_token`. Chaque requête (sauf `/auth/login`) doit inclure ce cookie.

---

## 1. Format des Erreurs

Toutes les réponses d'erreur (4xx, 5xx) suivront ce format :

```json
{
  "error": {
    "status": 403,
    "message": "Accès refusé. Droits insuffisants."
  }
}
Codes de statut courants :

200 OK : Succès de la requête (GET, PUT).

201 Created : Ressource créée avec succès (POST).

204 No Content : Succès sans contenu à retourner (DELETE).

400 Bad Request : La requête est mal formée (ex: champ manquant).

401 Unauthorized : Non authentifié (cookie JWT manquant ou invalide).

403 Forbidden : Authentifié, mais pas les droits suffisants (ex: un Collaborateur tente d'accéder à une route Admin).

404 Not Found : La ressource (ex: /api/requests/999) n'existe pas.

500 Internal Server Error : Erreur côté serveur (bug dans le code backend).

2. Module: Authentification (/api/v1/auth)
POST /auth/login
Description : Connecte un utilisateur et retourne un cookie JWT.

Accès : Public.

Body (JSON) :

JSON

{
  "email": "dev.junior@skillhub.com",
  "password": "mysecretpassword"
}
Réponse (200 OK) :

Cookie : Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict

Body (JSON) : (Retourne les infos de l'utilisateur pour le state management)

JSON

{
  "user": {
    "id": 12,
    "email": "dev.junior@skillhub.com",
    "first_name": "Pierre",
    "last_name": "Durand",
    "role": "collaborateur",
    "department_id": 1
  }
}
Erreur (401 Unauthorized) : Email ou mot de passe incorrect.

POST /auth/logout
Description : Déconnecte l'utilisateur en supprimant le cookie.

Accès : Tout utilisateur authentifié.

Body : Vide.

Réponse (204 No Content) :

Cookie : Set-Cookie: access_token=; HttpOnly; Max-Age=0

GET /auth/me
Description : Retourne l'utilisateur actuellement authentifié (très utile au chargement de l'app React).

Accès : Tout utilisateur authentifié.

Body : Vide.

Réponse (200 OK) : (Identique à la réponse /login)

Erreur (401 Unauthorized) : Si le cookie est absent ou invalide.

3. Module: Demandes de Formation (/api/v1/requests)
POST /requests
Description : Crée une nouvelle demande de formation (US-208).

Accès : collaborateur, manager, rh, admin.

Body (JSON) :

JSON

{
  "title": "Formation React Avancé",
  "description": "Pour le projet X...",
  "provider_id": 5, // ou "new_provider_name": "Nouvel Organisme"
  "cost": 1500.00,
  "type": "PLAN_DEV", // (PLAN_DEV, CPF, OBLIGATOIRE...)
  "start_date": "2026-03-10",
  "end_date": "2026-03-24",
  "duration_days": 2.5,
  "status": "DRAFT" // ou "PENDING_MANAGER" si on soumet direct
}
Réponse (201 Created) : (Retourne l'objet complet créé)

JSON

{
  "request": {
    "id": 101,
    "title": "Formation React Avancé",
    "status": "DRAFT",
    "user_id": 12,
    // ... autres champs
  }
}
Erreur (400 Bad Request) : Si title ou cost est manquant.

GET /requests
Description : Liste les demandes de formation en fonction du rôle.

Accès : Tout utilisateur authentifié.

Query Params (optionnel) : ?status=PENDING_RH, ?user_id=12, ?department_id=1

Logique Backend :

Si rôle = collaborateur : retourne seulement les demandes où user_id = current_user.id (US-213).

Si rôle = manager : retourne les demandes de son équipe (où manager_id = current_user.id) (US-301).

Si rôle = rh ou admin : retourne toutes les demandes (sauf DRAFT des autres) (US-401).

Réponse (200 OK) :

JSON

{
  "requests": [
    { "id": 101, "title": "Formation React", "status": "APPROVED", "cost": 1500.00, "user_id": 12, "first_name": "Pierre", "last_name": "Durand" },
    { "id": 98, "title": "Prise de parole", "status": "REJECTED", "cost": 800.00, "user_id": 15, "first_name": "Alice", "last_name": "Martin" }
  ]
}
GET /requests/:id
Description : Récupère les détails d'UNE demande de formation.

Accès :

collaborateur : (Si c'est sa propre demande).

manager : (Si c'est la demande d'un N-1).

rh, admin : (Toutes).

Réponse (200 OK) :

JSON

{
  "request": {
    "id": 101,
    "title": "Formation React Avancé",
    // ... tous les champs de la BDD
    "user": { "first_name": "Pierre", "last_name": "Durand" },
    "department": { "name": "Tech" },
    "documents": [
      { "id": 1, "file_name": "devis.pdf", "document_type": "DEVIS" }
    ],
    "history": [
      { "action": "SUBMITTED", "actor_name": "Pierre Durand", "created_at": "..." },
      { "action": "APPROVED", "actor_name": "Marie Dupont (Manager)", "created_at": "..." }
    ]
  }
}
Erreur (403 Forbidden) : Si un collaborateur essaie de voir la demande d'un autre.

Erreur (404 Not Found) : Si la demande id n'existe pas.

PUT /requests/:id
Description : Met à jour une demande (seulement si status = DRAFT) (US-214).

Accès : collaborateur (seulement si user_id = current_user.id et status = DRAFT).

Body (JSON) : (Champs à mettre à jour)

JSON

{
  "cost": 1600.00,
  "description": "Mise à jour du coût.",
  "duration_days": 2.5
}
Réponse (200 OK) : (Retourne l'objet mis à jour).

POST /requests/:id/validate
Description : Endpoint CRUCIAL pour le workflow. Gère les actions de validation (US-305, 306, 307, 404, 405).

Accès :

manager (si status = PENDING_MANAGER et request.manager_id = current_user.id).

rh, admin (si status = PENDING_RH).

Body (JSON) :

JSON

{
  "action": "APPROVED", // ou "REJECTED", "COMMENTED" (pour retour DRAFT)
  "comment": "Budget validé. OK pour moi." // Obligatoire si "REJECTED" ou "COMMENTED"
}
Logique Backend : C'est le cœur de votre moteur de workflow.

Vérifier les droits (ex: un manager ne peut pas valider une demande PENDING_RH).

Mettre à jour le status de la training_request (ex: PENDING_MANAGER -> PENDING_RH).

Si action = APPROVED et rôle = rh : Mettre à jour departments.budget_engaged (US-404).

Créer une ligne dans validation_history (US-305).

Déclencher un webhook vers Make.com (ex: "Demande Approuvée").

Réponse (200 OK) : (Retourne l'objet mis à jour).

Erreur (400 Bad Request) : Si action = REJECTED et comment est manquant.

POST /requests/:id/status
Description : Permet au RH de changer manuellement le statut (ex: APPROVED -> PLANNED) (US-406, 408).

Accès : rh, admin.

Body (JSON) :

JSON

{
  "status": "PLANNED" // ou "COMPLETED", "ARCHIVED"
}
Logique Backend :

Si passage PLANNED -> COMPLETED :

Vérifier que l'attestation est uploadée (peut être une règle métier).

Mettre à jour les budgets (budget_engaged -> budget_consumed) (US-410).

Réponse (200 OK) : (Retourne l'objet mis à jour).

4. Module: Documents (/api/v1/documents)
POST /requests/:id/documents
Description : Uploade un ou plusieurs fichiers pour une demande (US-206, 407, 409).

Accès : collaborateur (sa demande), rh, admin.

Type de requête : multipart/form-data (pas JSON !).

Champs (form-data) :

file: Le fichier binaire.

document_type: "DEVIS" (ou "CONVENTION", "ATTESTATION"...)

Logique Backend :

Stocker le fichier (localement ou sur un cloud S3/GCS).

Enregistrer l'entrée dans la table documents avec le request_id.

Réponse (201 Created) : (Retourne les métadonnées du fichier créé).

JSON

{
  "document": {
    "id": 2,
    "file_name": "devis_react.pdf",
    "document_type": "DEVIS",
    "file_path": "/uploads/..."
  }
}
DELETE /documents/:doc_id
Description : Supprime un document (ex: erreur d'upload).

Accès : collaborateur (si status = DRAFT), rh, admin.

Réponse (204 No Content) :

5. Module: Administration (/api/v1/admin)
Note : Toutes ces routes doivent être protégées et accessibles uniquement par le rôle admin (et rh pour certaines).

GET /admin/users
Description : Liste tous les utilisateurs (US-502).

Accès : admin.

Réponse (200 OK) :

JSON

{
  "users": [
    { "id": 12, "email": "dev.junior@skillhub.com", "role": "collaborateur" }
  ]
}
POST /admin/users
Description : Crée un nouvel utilisateur (US-502, US-503).

Accès : admin.

Body (JSON) :

JSON

{
  "email": "nouvel.employe@skillhub.com",
  "password": "TemporaryPassword123!",
  "first_name": "Nouveau",
  "last_name": "Employé",
  "role": "collaborateur",
  "department_id": 2,
  "manager_id": 1 // ID de l'admin
}
Réponse (201 Created) :

PUT /admin/users/:id
Description : Met à jour un utilisateur (rôle, département...) (US-503).

Accès : admin.

Réponse (200 OK) :

GET /admin/departments
Description : Liste tous les départements et leur état budgétaire (US-505).

Accès : admin, rh.

Réponse (200 OK) :

JSON

{
  "departments": [
    { "id": 1, "name": "Tech", "budget_allocated": 50000, "budget_engaged": 1500 }
  ]
}
PUT /admin/departments/:id
Description : Met à jour un département (ex: allocation budgétaire) (US-506).

Accès : admin.

Body (JSON) :

JSON

{
  "budget_allocated": 60000.00,
  "year": 2026
}
Réponse (200 OK) :

6. Module: Dashboard (/api/v1/dashboard)
GET /dashboard/kpis
Description : Fournit les données agrégées pour le dashboard RH (US-402).

Accès : rh, admin.

Réponse (200 OK) :

JSON

{
  "kpis": {
    "requests_by_status": [
      { "status": "PENDING_MANAGER", "count": 5 },
      { "status": "PENDING_RH", "count": 2 }
    ],
    "budgets_by_department": [
      { "name": "Tech", "allocated": 50000, "engaged": 1500, "consumed": 12000 },
      { "name": "Sales", "allocated": 30000, "engaged": 8000, "consumed": 4500 }
    ],
    "pending_sla_breach": 1 // Demandes en attente > 5 jours
  }
}

PUT /requests/:id/dates
Description : Met à jour les dates (planifiées ou réelles) d'une demande. Réservé aux RH/Admin.
Accès : rh, admin.

Body (JSON) :
{
  "start_date": "2026-04-15",        // Optionnel : Mettre à jour la date planifiée si elle change
  "end_date": "2026-04-17",          // Optionnel : Mettre à jour la date planifiée
  "actual_start_date": "2026-04-15", // Optionnel : Définir la date de début réelle
  "actual_end_date": "2026-04-16"  // Optionnel : Définir la date de fin réelle (ex: terminée plus tôt)
}

Logique Backend :
- Vérifie que le statut de la demande est 'APPROVED', 'PLANNED' ou 'COMPLETED'.
- Met à jour les champs correspondants dans la table 'training_requests'.
- Crée une entrée dans 'validation_history' (ex: action='COMMENTED', comment='Dates réelles mises à jour par RH').

Réponse (200 OK) : (Retourne l'objet mis à jour).

{
  "request": {
    "id": 101,
    "title": "Formation React Avancé",
    "status": "COMPLETED",
    "start_date": "2026-03-10", // Date planifiée
    "end_date": "2026-03-12",   // Date planifiée
    "actual_start_date": "2026-03-10", // Date réelle
    "actual_end_date": "2026-03-11",   // Date réelle (terminée plus tôt !)
    "user": { ... },
    "department": { ... },
    "documents": [ ... ],
    "history": [ ... ]
  }
}
