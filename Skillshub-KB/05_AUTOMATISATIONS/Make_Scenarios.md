# Spécification des Scénarios d'Automatisation - Make.com V1.0

**Objectif :** Gérer les notifications et les workflows externes de SkillHub Formation.
**Outil :** Make.com (anciennement Integromat).
**Méthode de communication :** Le Backend (Node.js) envoie des Webhooks (POST) à Make.com lors d'événements spécifiques. Make.com exécute ensuite un scénario.

---

## 1. Structure du Webhook (Payload envoyé par le Backend)

Pour standardiser, *tous* les webhooks envoyés par notre API Node.js vers Make.com devront avoir cette structure JSON :

```json
{
  "event_type": "request.pending_manager", // Le type d'événement (ex: "request.approved", "reminder.manager")
  "timestamp": "2025-11-15T09:30:00Z",
  "data": {
    "request": {
      "id": 101,
      "title": "Formation React Avancé",
      "cost": 1500,
      "status": "PENDING_MANAGER",
      "app_url": "[https://skillhub.app/requests/101](https://skillhub.app/requests/101)" // Lien direct vers la demande
    },
    "actors": {
      "collaborator": { // Celui qui a soumis
        "name": "Pierre Durand",
        "email": "pierre.durand@entreprise.com"
      },
      "manager": { // Le destinataire (si applicable)
        "name": "Marie Dupont",
        "email": "marie.dupont@entreprise.com",
        "slack_id": "U0...123" // (Optionnel, pour intégration Slack)
      },
      "rh_actor": { // Le RH qui a validé (si applicable)
        "name": "Claire RH",
        "email": "claire.rh@entreprise.com"
      }
    },
    "context": { // Infos supplémentaires (si applicable)
      "comment": "Ceci est un motif de refus."
    }
  }
}
2. Scénarios Make.com (V1)
Scénario A : Nouvelle demande pour le Manager (US-302)
Objectif : Notifier un manager qu'une nouvelle demande de son équipe attend sa validation.

Trigger (Déclencheur) : Un nouveau Webhook Make est reçu.

Filtre Make : event_type == request.pending_manager.

Logique Backend : Le backend envoie ce webhook lors de la POST /api/v1/requests/:id/validate (action SUBMITTED par le collaborateur) ou POST /api/v1/requests (si soumis directement).

Actions Make :

(Module Email) : Envoyer un email.

À : data.actors.manager.email

Sujet : SkillHub : Nouvelle demande de formation de {{data.actors.collaborator.name}}

Corps :

HTML

Bonjour {{data.actors.manager.name}},
<br><br>
Une nouvelle demande de formation a été soumise par {{data.actors.collaborator.name}} et attend votre validation :
<br><br>
<strong>Formation :</strong> {{data.request.title}}
<strong>Coût :</strong> {{data.request.cost}} €
<br><br>
<a href="{{data.request.app_url}}">Cliquez ici pour voir et valider la demande</a>
(Module Slack - Optionnel) : Envoyer un message Slack.

Canal : Message direct à data.actors.manager.slack_id (si fourni).

Message : "Bonjour. Nouvelle demande de {{data.actors.collaborator.name}} ({{data.request.title}}) en attente de votre validation. <{{data.request.app_url}}|Voir la demande>."

Scénario B : Notification de Décision (Approbation / Refus) (US-210, US-211)
Objectif : Informer le collaborateur que sa demande a été traitée (approuvée ou refusée).

Trigger (Déclencheur) : Webhook (le même que le Scénario A, il écoute tout).

Filtre Make : event_type == request.approved OU event_type == request.rejected.

Logique Backend : Le backend envoie ce webhook lors de la POST /api/v1/requests/:id/validate (action APPROVED ou REJECTED par le RH ou Manager).

Actions Make :

(Module Routeur) : Diviser le flux en 2 branches :

Branche 1 (Filtre) : event_type == request.approved

Branche 2 (Filtre) : event_type == request.rejected

(Branche 1 - Email d'Approbation) :

À : data.actors.collaborator.email

Sujet : SkillHub : Bonne nouvelle ! Votre demande "{{data.request.title}}" a été approuvée.

Corps : "Bonjour {{data.actors.collaborator.name}}, votre demande de formation a été approuvée par les RH. Vous serez contacté(e) prochainement pour l'organisation."

(Branche 2 - Email de Refus) :

À : data.actors.collaborator.email

Sujet : SkillHub : Information sur votre demande "{{data.request.title}}"

Corps :

HTML

Bonjour {{data.actors.collaborator.name}},
<br><br>
Votre demande de formation "{{data.request.title}}" n'a malheureusement pas pu être approuvée.
<br><br>
<strong>Motif du refus :</strong>
<p><em>"{{data.context.comment}}"</em></p>
<br>
Veuillez contacter votre manager ou les RH pour plus de détails.
Scénario C : Rappel Manager Inactif (US-310)
Objectif : Relancer les managers qui n'ont pas validé une demande depuis plus de 3 jours ouvrés.

Trigger (Déclencheur) : Scheduler (Planificateur).

Configuration : Tous les jours (Lundi au Vendredi) à 10h00.

Actions Make :

(Module HTTP) : Appeler l'API de SkillHub.

Action : GET /api/v1/requests?status=PENDING_MANAGER

(Note : Cet endpoint doit être sécurisé, par ex. avec une clé API que seul Make connaît, ou Make doit s'authentifier).

(Module "Itérateur") : Boucler sur chaque demande reçue de l'API.

(Module "Filtre") : Ne continuer que si la demande date de plus de 3 jours.

(Utiliser le module "Date" de Make pour comparer created_at avec now).

(Module HTTP - "Aggregator") : Regrouper les demandes par manager (pour envoyer 1 email de rappel, pas 5).

(Ceci est une optimisation. V1 simple : envoyer un email par demande en retard).

(Module Email - V1 simple) : Envoyer un email de rappel.

(Nécessite de récupérer les infos du manager via l'API /api/admin/users/{{manager_id}} ou que l'endpoint /requests retourne ces infos).

Sujet : SkillHub [RAPPEL] : Une demande de formation attend votre validation

Corps : "Bonjour {{manager.name}}, la demande '{{request.title}}' soumise par {{collaborator.name}} est en attente de votre validation depuis plus de 3 jours. <{{request.app_url}}|Voir la demande>."

(Hors V1 - Pour plus tard) Scénario D : Génération Convention PDF (US-407)
Objectif : Pré-remplir la convention de formation lorsque le RH approuve la demande.

Trigger (Déclencheur) : Webhook, Filtre : event_type == request.approved.

Actions Make :

(Module Google Docs) : "Créer un document depuis un template".

Prérequis : Avoir un Template Google Doc (ex: "MODELE_CONVENTION") avec des variables (ex: {{NOM_COLLABORATEUR}}, {{TITRE_FORMATION}}).

Mapping : Mapper les variables du webhook (data.request.title, data.actors.collaborator.name...) avec les variables du template.

(Module Google Drive) : "Télécharger le document" (en PDF).

(Module HTTP) : "Uploader le document" (en POST multipart/form-data) vers notre API :

POST /api/v1/requests/{{data.request.id}}/documents

Payload : file (le PDF) et document_type ("CONVENTION").