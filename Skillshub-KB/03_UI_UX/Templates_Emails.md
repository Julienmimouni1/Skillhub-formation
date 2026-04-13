# Templates Emails - SkillHub V1.0

**Objectif :** Standardiser toutes les communications sortantes de l'application.
**Outil d'envoi :** Make.com (via un module Email ou via l'API d'un service transactionnel comme SendGrid/Postmark).
**Variables :** Les variables sont notées `{{variable}}`. Elles correspondent aux données reçues dans le payload du webhook.

---

### Template 1 : Nouvelle demande pour le Manager (US-302)

**Sujet :** SkillHub : Demande de formation de {{data.actors.collaborator.name}} en attente de votre validation

**Corps (HTML) :**

Bonjour {{data.actors.manager.name}},

<p>Une nouvelle demande de formation a été soumise par {{data.actors.collaborator.name}} et nécessite votre approbation.</p>

<p><strong>Détails de la demande :</strong></p>
<ul>
  <li><strong>Collaborateur :</strong> {{data.actors.collaborator.name}}</li>
  <li><strong>Formation :</strong> {{data.request.title}}</li>
  <li><strong>Coût estimé :</strong> {{data.request.cost}} €</li>
  <li><strong>Date de soumission :</strong> {{data.timestamp | format_date('dd/MM/yyyy')}}</li>
</ul>

<p>Pour examiner la demande en détail (programme, devis) et la valider, veuillez cliquer sur le lien ci-dessous :</p>

<p style="text-align: center; margin: 25px 0;">
  <a href="{{data.request.app_url}}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
    Voir et valider la demande
  </a>
</p>

<p>Merci pour votre action rapide.</p>
<p>L'équipe SkillHub Formation</p>

---

### Template 2 : Notification d'Approbation Finale (US-210)

**Sujet :** SkillHub : Bonne nouvelle ! Votre demande "{{data.request.title}}" est approuvée.

**Corps (HTML) :**

Bonjour {{data.actors.collaborator.name}},

<p>Excellente nouvelle : votre demande de formation a été examinée et <strong>approuvée</strong> par le service RH.</p>

<p><strong>Rappel de la demande :</strong></p>
<ul>
  <li><strong>Formation :</strong> {{data.request.title}}</li>
  <li><strong>Coût approuvé :</strong> {{data.request.cost}} €</li>
  <li><strong>Approuvée par :</strong> {{data.actors.rh_actor.name}}</li>
</ul>

<p><strong>Prochaines étapes :</strong></p>
<p>Le service RH (ou votre manager) va maintenant procéder à l'inscription administrative et reviendra vers vous pour confirmer les dates et la logistique.</p>

<p>Vous pouvez suivre le statut de votre demande (passée à "Approuvée") directement dans votre dashboard SkillHub.</p>

<p>L'équipe SkillHub Formation</p>

---

### Template 3 : Notification de Refus (US-211)

**Sujet :** SkillHub : Information concernant votre demande "{{data.request.title}}"

**Corps (HTML) :**

Bonjour {{data.actors.collaborator.name}},

<p>Votre demande de formation "{{data.request.title}}" a été examinée et n'a malheureusement pas pu être approuvée pour le moment.</p>

<p><strong>Statut :</strong> Refusée</p>
<p><strong>Décision prise par :</strong> {{data.actors.manager.name | ou: data.actors.rh_actor.name}}</p>

<p><strong>Motif obligatoire :</strong></p>
<blockquote style="border-left: 4px solid #ccc; padding-left: 15px; margin-left: 5px; font-style: italic;">
  "{{data.context.comment}}"
</blockquote>

<p>Nous vous invitons à discuter de ce refus avec votre manager pour envisager d'autres options ou pour représenter votre demande ultérieurement.</p>

<p>L'équipe SkillHub Formation</p>

---

### Template 4 : Rappel de Validation Manager (US-310)

**Sujet :** [RAPPEL] SkillHub : Une demande de {{data.actors.collaborator.name}} attend votre validation

**Corps (HTML) :**

Bonjour {{data.actors.manager.name}},

<p>Ceci est un rappel automatique concernant une demande de formation soumise par {{data.actors.collaborator.name}} qui est en attente de votre validation <strong>depuis plus de 3 jours</strong>.</p>

<p><strong>Formation :</strong> {{data.request.title}}</p>

<p>Pour rappel, une validation rapide est essentielle pour ne pas bloquer le processus d'inscription et de planification budgétaire.</p>

<p style="text-align: center; margin: 25px 0;">
  <a href="{{data.request.app_url}}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
    Accéder à la demande
  </a>
</p>

<p>Merci pour votre collaboration.</p>
<p>L'équipe SkillHub Formation</p>

---

### Template 5 : Retour en "Brouillon" (Demande de complément) (US-307)

**Sujet :** SkillHub : Complément d'information requis pour votre demande "{{data.request.title}}"

**Corps (HTML) :**

Bonjour {{data.actors.collaborator.name}},

<p>Votre manager, {{data.actors.manager.name}}, a examiné votre demande de formation "{{data.request.title}}" et a besoin de compléments d'information avant de pouvoir la valider.</p>

<p>Votre demande a été repassée au statut <strong>"Brouillon"</strong>.</p>

<p><strong>Commentaire du manager :</strong></p>
<blockquote style="border-left: 4px solid #ccc; padding-left: 15px; margin-left: 5px; font-style: italic;">
  "{{data.context.comment}}"
</blockquote>

<p>Veuillez vous connecter à SkillHub, mettre à jour votre demande en fonction de ce commentaire (ex: uploader un nouveau devis, préciser les objectifs), puis la <strong>resoumettre</strong> à la validation.</p>

<p>L'équipe SkillHub Formation</p>