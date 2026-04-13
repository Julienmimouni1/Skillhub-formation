# Product Backlog - SkillHub Formation (V1.5 & V2)

Ce document recense les fonctionnalités à haute valeur ajoutée ("Strategic Differentiators") pour les versions futures de SkillHub.
Il est structuré par acteur pour répondre aux points de friction spécifiques.

## 1 Pour le collaborateur 

### F-102 : Le "Nudge" de complétion (Gamification Soft)
* **Intention :** Une barre de progression sur le Dashboard : "Vous avez utilisé 0% de votre droit à la formation cette année". Lutte contre l'auto-censure.
* **Ingénierie :** Incitation douce à la montée en compétences.
* **Faisabilité Tech :** 🟢 Faible. Calcul Front (React) basé sur requêtes `COMPLETED`.

### F-103 : Feedback "À Chaud" Pré-rempli (Qualité)
* **Intention :** J+1 après la formation, envoi d'un lien unique vers un formulaire pré-rempli. Maximise le taux de retour.
* **Ingénierie :** Essentiel pour la certification Qualiopi (mesure de satisfaction).
* **Faisabilité Tech :** 🟡 Moyenne. Trigger Make sur date de fin -> Email avec token.


### F-105 : "Career Pathfinder" (Projection Carrière)
* **Intention :** "Je veux devenir Senior Dev". L'outil montre le chemin : "Il te manque 2 formations et 1 certification".
* **Ingénierie :** Fidélisation des talents (Retention).
* **Faisabilité Tech :** 🔴 Élevée. Nécessite référentiel métiers + GPEC.

### F-106 : "Peer-to-Peer Learning" (Partage de Savoir)
* **Intention :** Un expert interne propose une session "Brown Bag Lunch". Les autres s'inscrivent. Gestion simplifiée.
* **Ingénierie :** Organisation apprenante (Learning Organization).
* **Faisabilité Tech :** 🟢 Faible. CRUD Session + Inscriptions.

🎙️ "Audio-Learning Generator" (Style NotebookLM)
Concept : Convertir n'importe quel PDF de formation (ou doc technique) en un podcast audio (dialogue entre 2 IA) pour l'écouter en voiture ou dans les transports.
Pourquoi ? Rend la formation "consommable" partout, sans écran.

🔥 "Skill Tinder / Mentor Match"
Concept : Une interface type "Swipe" pour trouver un mentor interne ou un "buddy" d'apprentissage. "Je t'apprends Excel, tu m'apprends la négo".
Pourquoi ? Brise les silos et favorise le Peer-to-Peer Learning de manière ludique.

👾 "Learning Tamagotchi"
Concept : Un compagnon virtuel (avatar 3D) qui grandit et évolue uniquement si tu te formes régulièrement. Si tu arrêtes, il dépérit ou s'endort.
Pourquoi ? Gamification émotionnelle forte pour la rétention.

👓 "AR Skill Finder" (Réalité Augmentée)
Concept : Je pointe mon téléphone dans l'open space et je vois des "badges de compétences" flotter au-dessus des collègues (ex: "Expert Python", "Ceinture Noire Lean").
Pourquoi ? Valorisant pour l'expert et ultra-pratique pour trouver de l'aide rapidement.

🧠 "Anti-Procrastination Focus Mode"
Concept : Un mode "Deep Work" intégré qui, lorsqu'il est activé pour une formation, bloque les notifications, lance une playlist "Lo-Fi Focus" et chronomètre le temps d'apprentissage effectif (Pomodoro).
Pourquoi ? Aide le collaborateur à se créer une bulle de concentration.

🆘 Bouton "J'ai besoin d'aide" (Support)
Concept : Un bouton sur chaque formation qui notifie le manager ou un mentor : "Julie bloque sur le module 3".
Valeur : Débloque l'apprenant instantanément.
Difficulté : 🟢 Faible (Simple notification email/Slack).

🔥 "Learning Streak" (Habitude)
Concept : Compteur "Vous vous êtes formé 3 semaines d'affilée !".
Valeur : Crée une habitude d'apprentissage (Hook Model).
Difficulté : 🟢 Faible (Requête SQL simple sur l'historique).

🎲 "Surprise Me" (Curiosité)
Concept : Un bouton "J'ai 15 min" qui lance une micro-formation ou un article au hasard dans le catalogue.
Valeur : Favorise la découverte et remplit les temps morts.
Difficulté : 🟢 Faible (Redirection aléatoire).



🏆 "Badge de Certification" (Reconnaissance)
Concept : Un petit badge (icône) apparaît à côté du nom de l'utilisateur sur le dashboard quand il a fini un parcours (ex: "Expert Excel").
Valeur : Gratification sociale immédiate.
Difficulté : 🟢 Faible (Champ booléen sur User + Icône conditionnelle).

---



## 2. Pour le Manager (Le Pilotage Opérationnel)


### F-202 : Délégation Temporaire ("Out of Office")
* **Intention :** "Je pars en vacances, je délègue mes validations à M. Dupont." Évite les blocages de workflow.
* **Ingénierie :** Continuité de service.
* **Faisabilité Tech :** 🔴 Élevée. Gestion des permissions et sécurité.

### F-203 : L'Alerte "Iniquité d'équipe" (Social)
* **Intention :** Notification : *"Attention, Pierre a 3 formations, Marie 0."* Aide au maintien de l'équité sociale.
* **Ingénierie :** Prévention des risques psychosociaux (RPS) et sentiment d'injustice.
* **Faisabilité Tech :** 🟡 Moyenne. Agrégation SQL `COUNT(requests) GROUP BY user_id`.

### F-204 : La "Skill Matrix" Dynamique
* **Intention :** Visualiser les compétences de l'équipe sous forme de matrice (Qui sait faire quoi ?). Mise à jour auto après formation.
* **Ingénierie :** GPEC (Gestion Prévisionnelle des Emplois et Compétences).
* **Faisabilité Tech :** 🔴 Élevée. Modèle de données Compétences + Lien Formations.

### F-205 : Le "Shadowing" Tracker (Apprentissage Informel)
* **Intention :** Formaliser et suivre l'apprentissage sur le terrain (ex: "J'ai observé Pierre sur le closing client"). Transforme l'informel en donnée valorisable.
* **Ingénierie :** 70-20-10 Model (70% de l'apprentissage se fait par l'expérience).
* **Faisabilité Tech :** 🟢 Faible. Simple formulaire de déclaration + Validation pair.

### F-206 : Calculateur de ROI "Business Impact"
* **Intention :** 3 mois après la formation, question au manager : *"Est-ce que Pierre est plus rapide/meilleur sur [Tâche] ?"*. Calcule un score d'efficacité réel.
* **Ingénierie :** Kirkpatrick Niveau 4 (Résultats). Sortir de la logique de "dépense" pour aller vers l'"investissement".
* **Faisabilité Tech :** 🟡 Moyenne. Workflow d'email différé + Dashboard analytique.

### F-207 : "Mobility Matcher" (Carrière Internationale)
* **Intention :** Suggérer des formations basées sur les souhaits de mobilité (ex: "Pierre veut aller à Londres => Suggérer 'Business English' + 'Cross-cultural management'").
* **Ingénierie :** Alignement des aspirations individuelles et besoins business.
* **Faisabilité Tech :** 🔴 Élevée. Nécessite recueil des souhaits + Moteur de recommandation.

### F-208 : Le "Budget Pooling" (Solidarité Inter-services)
* **Intention :** Permettre à un manager de transférer une partie de son budget non utilisé à un autre manager (avec validation N+2). Optimise la consommation globale.
* **Ingénierie :** Flexibilité budgétaire agile.
* **Faisabilité Tech :** 🟡 Moyenne. Transactionnel complexe (Débit/Crédit entre départements).

### F-209 : "Team Pulse" (Météo des Compétences)
* **Intention :** Sondage trimestriel ultra-court à l'équipe : *"Sur quelle compétence vous sentez-vous fragile ?"*. Génère un nuage de mots pour le manager.
* **Ingénierie :** Détection proactive des besoins (Bottom-up).
* **Faisabilité Tech :** 🟢 Faible. Formulaire simple + Viz Nuage de mots.

### F-210 : "Project-Based Learning" (Just-in-Time)
* **Intention :** Lier des besoins de formation à des projets futurs. "Lancement projet SAP en Septembre -> Planifier formations en Juin".
* **Ingénierie :** Alignement stratégique.
* **Faisabilité Tech :** 🟡 Moyenne. Champ "Projet" + Date de besoin.

### F-211 : "No-Show" Predictor (IA Prédictive)
* **Intention :** Identifier les collaborateurs qui annulent souvent à la dernière minute. Suggérer des sessions à distance ou du e-learning pour eux.
* **Ingénierie :** Optimisation du taux de remplissage.
* **Faisabilité Tech :** 🔴 Élevée. Analyse historique comportementale.

---

## 3. Pour le RH (Le Stratège & Gardien du Temple)

### F-301 : Calculateur d'Éligibilité OPCO (Smart Tagging)
* **Intention :** Si "Obligatoire" + "Coût < X" => Tag "Potentiellement Finançable". Optimisation des fonds.
* **Ingénierie :** Optimisation du budget formation (Financement externe).
* **Faisabilité Tech :** 🟡 Moyenne. Moteur de règles (Rule Engine).

### F-302 : Générateur de "Kits de Départ" (Onboarding)
* **Intention :** Création auto de 3 demandes (Sécurité, RGPD, Métier) pour tout nouveau collaborateur.
* **Ingénierie :** Assurance du parcours d'intégration obligatoire.
* **Faisabilité Tech :** 🟡 Moyenne. Trigger à la création de user.

### F-303 : L'Archivage Légal "Zéro Papier" (Coffre-fort)
* **Intention :** Vérifie la présence de tous les docs (Convention, Émargement, Facture) avant d'autoriser l'archivage.
* **Ingénierie :** Sécurité juridique en cas de contrôle (BPF).
* **Faisabilité Tech :** 🔴 Élevée. Gestion documentaire stricte.

### F-304 : Scoring Qualité Organisme (TripAdvisor RH)
* **Intention :** Noter les organismes basé sur les retours collaborateurs (F-103). "Cet organisme a une note de 4.8/5".
* **Ingénierie :** Pilotage de la qualité des prestataires (Qualiopi).
* **Faisabilité Tech :**  Moyenne. Agrégation des notes d'évaluation.



### F-307 : Radar des Compétences (Gap Analysis)
* **Intention :** Visualisation graphique (Spider Chart) : Compétences requises par le poste vs Compétences actuelles du collaborateur. Suggestion auto de formations pour combler les écarts.
* **Ingénierie :** GPEC et adéquation poste/ressource.
* **Faisabilité Tech :** 🔴 Élevée. Nécessite un référentiel de compétences structuré et mappé.

### F-308 : Calculateur de "Coût Complet" (Full Cost)
* **Intention :** Affichage du coût réel de la formation : Coût pédagogique + Frais annexes + Coût salarial chargé (manque à gagner).
* **Ingénierie :** Arbitrage financier précis et calcul de ROI.
* **Faisabilité Tech :** 🟢 Faible. Formule mathématique simple (Taux horaire moyen x Durée).


### F-310 : "Vendor Portal" (Extranet Organisme)
* **Intention :** Portail sécurisé pour que les organismes uploadent eux-mêmes : Programme, Convention, Émargement, Facture.
* **Ingénierie :** Gain de temps administratif massif (Délégation de saisie).
* **Faisabilité Tech :** 🔴 Élevée. Nouvelle interface + Gestion droits externes.

### F-311 : "Resource Planner" (Logistique Salles/Formateurs)
* **Intention :** Vue Calendrier des salles et formateurs internes. Détection automatique des conflits.
* **Ingénierie :** Gestion des ressources matérielles.
* **Faisabilité Tech :** 🟡 Moyenne. Vue Calendrier complexe (Drag & Drop).

### F-312 : "Smart Subvention" (Optimisation Financement)
* **Intention :** Suggérer automatiquement le meilleur dispositif de financement (FNE, OPCO, CPF co-construit) selon le profil et la formation.
* **Ingénierie :** Ingénierie financière.
* **Faisabilité Tech :** 🔴 Élevée. Veille légale intégrée + Moteur de règles complexe.



---

## 4. Pour l'Admin / Finance (Le Contrôleur)

### F-401 : Prévisionnel de Trésorerie (Cash-out)
* **Intention :** Vue calendrier des sorties d'argent (basée sur dates de formation).
* **Ingénierie :** Gestion de trésorerie (Finance).
* **Faisabilité Tech :** 🟢 Faible. Vue SQL agrégée.

### F-402 : Audit Log "Black Box"
* **Intention :** Journal inaltérable de QUI a modifié un budget ou un statut.
* **Ingénierie :** Traçabilité et sécurité.
* **Faisabilité Tech :** 🟡 Moyenne. Table `audit_logs` + Triggers.

### F-403 : Anonymisation RGPD Automatique
* **Intention :** Script automatique pour anonymiser les données des collaborateurs partis depuis > 3 ans.
* **Ingénierie :** Conformité RGPD (Droit à l'oubli).
* **Faisabilité Tech :** 🟡 Moyenne. Cron Job + Script SQL.

### F-404 : "Chargeback Automator" (Refacturation Interne)
* **Intention :** Calculer automatiquement les montants à refacturer aux Business Units (BU) consommatrices en fin de trimestre.
* **Ingénierie :** Comptabilité analytique.
* **Faisabilité Tech :** 🟢 Faible. Rapport SQL avec ventilation par Code Analytique.

---

## 5. Fonctionnalités "Wow Effect" (IA & Automation)

### F-501 : Parsing de Devis PDF (OCR Light)
* **Intention :** Upload de devis => Remplissage auto du formulaire (Prix, Dates, Organisme).
* **Ingénierie :** Gain de temps et réduction erreurs.
* **Faisabilité Tech :** 🔴 Élevée. API OpenAI Vision ou DocumentAI.

### F-502 : Smart Calendar (Sync)
* **Intention :** Envoi auto d'invitation .ics quand statut = PLANNED.
* **Ingénierie :** Réduction du taux d'absentéisme.
* **Faisabilité Tech :** 🟡 Moyenne. Génération .ics + Email.

### F-503 : "SkillHub AI Coach" (Assistant Personnel)
* **Intention :** Chatbot conversationnel : "Je veux m'améliorer en négo". L'IA répond : "Voici 3 formations + 1 mentor interne (Sophie) + 1 article".
* **Ingénierie :** Support 24/7 et personnalisation extrême.
* **Faisabilité Tech :** 🔴 Élevée. RAG (Retrieval Augmented Generation) sur le catalogue + Profils.

### F-504 : "Mood Detector" (Analyse de Sentiments)
* **Intention :** Analyser sémantiquement les feedbacks libres. Si "Ennuyeux", "Inutile" détectés souvent => Alerte Qualité.
* **Ingénierie :** Pilotage qualitatif à grande échelle.
* **Faisabilité Tech :** 🟡 Moyenne. API NLP (Natural Language Processing).

### F-505 : "Video Pitch Trainer" (Soft Skills)
* **Intention :** Le collaborateur s'enregistre (ex: Pitch commercial). L'IA analyse : Débit de parole, tics de langage, contact visuel.
* **Ingénierie :** Formation comportementale asynchrone.
* **Faisabilité Tech :** 🔴 Élevée. Analyse Audio/Vidéo (Azure Video Indexer ou équivalent).

### F-506 : "Dynamic Certificate" (Blockchain Style)
* **Intention :** Certificats infalsifiables et partageables en un clic sur LinkedIn avec prévisualisation riche (OpenGraph).
* **Ingénierie :** Marque employeur et valorisation collaborateur.
* **Faisabilité Tech :** 🟡 Moyenne. Génération d'images dynamiques + Lien unique.
### F-507 : 'Audio-Learning Generator' (Podcast Style)
* **Intention :** Convertir n'importe quel PDF de formation en un podcast audio (dialogue IA) pour l'�couter en mobilit�.
* **Ing�nierie :** Accessibilit� et apprentissage nomade.
* **Faisabilit� Tech :**  �lev�e. API Text-to-Speech avanc�e (ElevenLabs/OpenAI).

### F-508 : 'Skill Tinder' (Mentor Match)
* **Intention :** Interface de 'Swipe' pour trouver un mentor interne. 'Je t'apprends Excel, tu m'apprends la n�go'.
* **Ing�nierie :** Peer-to-Peer Learning ludique.
* **Faisabilit� Tech :**  Moyenne. Algorithme de matching simple.

### F-509 : 'Learning Tamagotchi'
* **Intention :** Un compagnon virtuel qui �volue si l'utilisateur se forme r�guli�rement. Gamification �motionnelle.
* **Ing�nierie :** R�tention et engagement.
* **Faisabilit� Tech :**  Moyenne. Logique de jeu simple + Assets graphiques.

### F-510 : 'AR Skill Finder' (R�alit� Augment�e)
* **Intention :** Voir des 'badges de comp�tences' flotter au-dessus des coll�gues via la cam�ra du t�l�phone.
* **Ing�nierie :** Valorisation sociale et aide imm�diate.
* **Faisabilit� Tech :**  �lev�e. Framework AR mobile.

### F-511 : 'Focus Mode' (Anti-Procrastination)
* **Intention :** Mode 'Deep Work' : Bloque les notifications, playlist Lo-Fi, chronom�tre Pomodoro.
* **Ing�nierie :** Productivit� et concentration.
* **Faisabilit� Tech :**  Faible. Timer Front-end + Int�gration Spotify/SoundCloud.
