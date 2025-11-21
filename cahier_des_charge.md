Contexte Fonctionnel

But principal : Permettre la planification dynamique du placement des agents sur 4 pôles (Secure Academy, Mutuelle, Stafy, Timeone) sur la semaine (lundi à vendredi) en fonction de leur disponibilité, selon des données CSV évolutives.

Utilisateurs : Managers et responsables de planning.

Structure des données

Colonnes du CSV :

NOM

LUNDI

MARDI

MERCREDI

JEUDI

VENDREDI

Types de disponibilité possible :

DISPONIBLE

PAS DISPONIBLE

DISPONIBLE A PARTIR DE [heure]

PAS DISPONIBLE DE [heure]-[heure]

DISPONIBLE PARFOIS APRES MIDI

DISPONIBLE MATIN

DISPONIBLE APRES MIDI

Fonctionnalités à développer

Importation du CSV :

Téléchargement facile d’un fichier CSV de disponibilités

Ajout dynamique de nouveaux agents et modification des plages horaires

Algorithme de placement :

Proposer une répartition automatique des agents sur les pôles selon disponibilité quotidienne et contraintes horaires

Prise en compte des fenêtres horaires pour chaque type de disponibilité (matin, après-midi, dispo partielle, indispo partielle)

Rotation des agents entre les pôles pour favoriser l’équité et éviter la redondance (logique de rotation intelligente)

Interface visuelle animée :

Affichage d’un calendrier interactif (vue semaine, par pôle)

Animation des déplacements/rotations des agents sur l’emploi du temps

Visualisation du remplissage des pôles avec effet d’animation au glisser-déposer ou auto-placement

Gestion en temps réel :

Mise à jour en direct en cas de modification du CSV ou ajout/suppression d’un agent

Notifications animées pour alerter en cas de manque d’agents ou de conflit de disponibilité

Historique et simulation :

Simulation de planning sur plusieurs semaines

Historique des placements pour analyse et optimisation future

Accessibilité et ergonomie :

Interface responsive adaptée à desktop et mobile

Visualisation claire des différentes disponibilités (avec couleurs et icônes animés : disponible, partiel, indisponible)

Exigences techniques pour Windsurf (Prompt)

Utiliser React.js pour l’UI interactive et animée

Utiliser Canvas ou SVG pour les animations de placement

Backend léger pour gestion du CSV et logique métier : Node.js ou cloud functions

Possibilité d’intégrer le module dans une stack SaaS existante

Prise en compte des mises à jour auto des disponibilités et de l’ajout d’utilisateurs

Scénarios d’usage

Je télécharge le CSV → les agents apparaissent avec leur disponibilité → je lance l’algorithme, les pôles se remplissent, les agents s’animent sur la grille planning → je modifie une dispo, le planning se réactualise avec animation.

Livrables attendus

Fichier prompt Windsurf (description technique pour génération du projet)

Documentation rapide pour l’admin et les utilisateurs

Demo visuelle (ou GIF/vidéo) de l’animation de placement

Note pour l’intégration

Adapter les libellés horaires à HH:MM (ex : DISPONIBLE A PARTIR DE 11H30)

Rendre possible l’ajout de nouveaux agents depuis l’interface

Prévoir compatibilité évolutive du format CSV