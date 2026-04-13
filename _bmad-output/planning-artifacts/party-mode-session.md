---
stepsCompleted: [2]
workflowType: 'party-mode'
user_name: 'Julien'
date: 'mardi 20 janvier 2026'
agents_loaded: true
party_active: true
exit_triggers: ['*exit', 'goodbye', 'end party', 'quit']
---

**Barry (Quick Flow)** 🚀 :
"Ah, si vous ne voyez pas la colonne Kubernetes, c'est parce qu'elle n'est pas affichée par défaut.
Le système affiche par défaut les compétences que l'équipe possède *déjà*.
Si David a Kubernetes, elle *devrait* s'afficher.
**Hypothèse :** David n'a peut-être pas Kubernetes assigné en base, ou alors il est assigné mais à 0.
Ou alors, mon script de seed a eu un hoquet.
**Action corrective :** Utilisez le bouton **'Ajouter Colonne'** -> Sélectionnez **'Kubernetes'**.
Si David a bien une donnée (même ancienne), elle apparaîtra rouillée.
Si elle est vide (tirets), c'est que la donnée n'est pas là."

**John (PM)** 📋 :
"Julien a raison sur la règle métier : 'Manager voit UNIQUEMENT ses collaborateurs'.
C'est déjà filtré côté backend (`where: { manager_id: userId }`).
Si David n'apparaît pas du tout dans la liste des collaborateurs à gauche, c'est un problème de rattachement.
Mais si David est là et que sa colonne manque, c'est juste de l'affichage."

**Sally (UX)** 🎨 :
"Pour éviter cette confusion à l'avenir, on pourrait ajouter un indicateur : 'X compétences masquées' si certaines ne sont pas affichées par défaut pour ne pas polluer la vue."

**Julien, testez d'ajouter la colonne 'Kubernetes' manuellement. Est-ce que la donnée de David apparaît alors ?**
