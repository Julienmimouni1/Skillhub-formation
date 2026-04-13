# Gestion des Campagnes vs Demandes Hors Campagne

Ce document clarifie la distinction fonctionnelle et technique entre les demandes de formation effectuées dans le cadre d'une campagne (Plan de Formation) et les demandes ponctuelles (Au fil de l'eau).

## 1. Concepts Clés

### Campagne de Recueil (Plan de Formation)
- **Objectif** : Collecter les besoins prévisionnels pour l'année à venir ou une période donnée.
- **Période** : Limitée dans le temps (Dates de début et fin définies par les RH).
- **Processus** :
    1. Les RH ouvrent une campagne (Statut `OPEN`).
    2. Les Managers et Collaborateurs sont notifiés via une bannière sur leur tableau de bord.
    3. Ils soumettent leurs besoins via le bouton dédié "Soumettre un besoin".
    4. Ces demandes sont **automatiquement rattachées** à la campagne.
- **Arbitrage** : Les RH arbitrent ces demandes en masse à la fin de la campagne pour construire le Plan de Formation.

### Demande Hors Campagne (Au fil de l'eau)
- **Objectif** : Répondre à un besoin immédiat ou imprévu (ex: nouvelle technologie, obligation légale urgente).
- **Période** : Toute l'année.
- **Processus** :
    1. Le collaborateur clique sur "Nouvelle demande" depuis son tableau de bord.
    2. Il remplit le formulaire standard.
    3. La demande n'est **pas** rattachée à une campagne (`campaign_id` est vide).
- **Arbitrage** : Traitement au cas par cas par le Manager puis les RH.

## 2. Distinction Technique

La distinction se fait uniquement via le champ `campaign_id` dans la table `TrainingRequest`.

| Type de Demande | Champ `campaign_id` | Origine dans l'interface |
| :--- | :--- | :--- |
| **Campagne** | `ID de la campagne` (ex: 12) | Bouton "Soumettre un besoin" sur la bannière de campagne. |
| **Hors Campagne** | `NULL` | Bouton "Nouvelle demande" standard. |

## 3. Unification du Formulaire

Pour simplifier l'expérience utilisateur, **un seul et unique formulaire** est utilisé pour les deux cas (`CreateRequest.jsx`).

- **Si Campagne** : L'URL contient `?campaign_id=123`. Le formulaire affiche un bandeau contextuel "Campagne Active" avec les instructions spécifiques. La demande créée porte l'ID de la campagne.
- **Si Hors Campagne** : L'URL est standard (`/new-request`). Aucun bandeau n'est affiché. La demande est créée sans lien avec une campagne.

## 4. Workflow Utilisateur

1. **Tableau de Bord** :
   - Si une campagne est active, une bannière colorée apparaît en haut.
   - Le bouton "Soumettre un besoin" dans la bannière redirige vers le formulaire **avec le contexte de la campagne**.
   - Le bouton "Nouvelle demande" habituel reste disponible pour les demandes hors campagne.

2. **Formulaire de Création** :
   - Le formulaire détecte automatiquement s'il est ouvert dans le cadre d'une campagne.
   - Si oui, il affiche le titre de la campagne et les instructions RH en tête de page.
   - L'utilisateur remplit les mêmes champs (Titre, Coût, Dates, etc.).

3. **Suivi** :
   - Les demandes de campagne apparaissent dans le tableau de bord comme les autres.
   - Les RH peuvent filtrer les demandes par campagne dans leur vue de gestion.
