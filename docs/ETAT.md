# ETAT.md — Avancement du projet KBSAUTO

But de ce fichier : garder une trace claire de ce qui est décidé/fait, pour
reprendre le travail sans repartir de zéro (même dans une nouvelle session).
Les entrées les plus récentes sont en haut.

---

## 2026-10-13 (suite 3) — Inscription avec Google / lien Gmail

- Écran de connexion : onglets **Connexion** (code, inchangé) et **Inscription**.
- Inscription : bouton **Continuer avec Google** (Supabase OAuth) ou saisie de
  l'adresse Gmail → **lien envoyé par e-mail** (Supabase magic link) à cliquer.
- Au retour, l'adresse est rattachée à un membre (Administration → Équipe →
  modifier → « Adresse Gmail ») ou à l'agence (= CEO). Sinon : « Compte créé »
  en attente d'association par le CEO (aucun accès automatique).
- **À faire dans Supabase** (Authentication) : activer le provider **Google**
  (Client ID/Secret Google Cloud), mettre l'URL du site dans *Site URL* et
  *Redirect URLs*, vérifier l'envoi des e-mails (SMTP).
- **Où on en est (fin de soirée 13/10)** : Google Cloud, projet `kbs-gestion`
  (écran de consentement déjà configuré), client OAuth « KBS Gestion Web. »
  créé le 13/10 (origine `https://app.kbsdigitalagency.com`, redirection
  `https://vspepqwipgjkmnemwlfa.supabase.co/auth/v1/callback`). Un ancien
  client « Kbs Gestion web » (20/09) existe aussi : ne pas l'utiliser.
  **Reste à faire** : publier l'app (page Audience) ; Supabase → Google
  (Client ID + secret du nouveau client) ; URL Configuration (Site URL +
  `https://app.kbsdigitalagency.com/**`) ; renseigner les Gmail des membres
  dans Administration → Équipe ; fusionner la branche sur `main` ; tester.
- Limite connue : les données restent dans `kbs_storage` avec la clé publique ;
  le contrôle d'accès est côté application seulement (RLS à faire avec les vraies tables).

---

## 2026-10-13 (suite 2) — KBSAUTO devient « KBS Gestion » (maquette validée)

Maquette validée par Kader : https://claude.ai/artifact/Dggsvv9GEx9kuLGZqHnCWt
(16 écrans : connexion, accueil, menu, vendre, encaisser, reçu, stock, nouveau
produit, mouvement, clients, fiche client, documents, finances, équipe,
réglages, version ordinateur).

### Fait (étape 1 : design + navigation + produits/stock/caisse)
1. **Nom** : KBS Gestion (titre, PWA, écrans).
2. **Thème** : sombre bleu marine + orange du logo, polices Archivo (titres)
   et Figtree (texte), cartes arrondies, boutons orange à texte marine.
3. **Navigation** : barre du bas sur téléphone (Accueil, Clients, bouton
   Vendre au centre, Stock, Menu) ; menu latéral sur ordinateur (≥ 900 px) ;
   écran **Menu** avec tous les modules par famille ; sous-navigation en
   pastilles entre les écrans d'une même famille.
4. **Connexion** : choix du membre + code (code perso, code général ou code
   maître). Le membre connecté devient le vendeur par défaut.
5. **Accueil** : CA du mois (encaissé / reste dehors), objectif, bénéfice net,
   raccourcis, « À traiter » (stock bas, clients qui doivent, factures en
   retard, tâches).
6. **Produits & stock** (nouveau, `kbs:products`, `kbs:stockMoves`) : fiche
   produit (photo, catégorie, code-barres, unité, prix d'achat/vente, marge,
   stock, seuil d'alerte, fournisseur, produit ou service sans stock),
   valeur du stock, alertes, entrées / sorties avec motif, inventaire,
   historique des mouvements (modifier/supprimer avec correction du stock).
7. **Vendre** (nouveau) : catalogue (recherche, scan code-barres caméra ou
   lecteur, catégories), article libre, panier, encaisser (client comptoir /
   existant / nouveau, vendeur, Orange Money / Wave / espèces / Moov…,
   montant reçu, monnaie à rendre, avance → reste en crédit client, remise
   validée par le code CEO), reçu à l'écran + PDF + WhatsApp + impression
   ticket 80 mm. Chaque vente est enregistrée dans le CRM (achats + versements)
   donc comptée dans le CA, les commissions, les archives et les relances.
8. **Clients** : recherche + filtres (Tous, Doivent, Prospects, Payés, Ventes caisse).

### Reste à faire (prochaines étapes)
- Backend : passer du stockage clé/valeur `kbs_storage` à de vraies tables
  Supabase (produits, ventes, clients, paiements…) avec RLS — à faire avec
  accès au projet Supabase de KBSAUTO (`vspepqwipgjkmnemwlfa`).
- Refonte visuelle fine des anciens écrans (CRM en liste compacte + fiche
  client plein écran, Finances avec graphique 6 mois, Équipe).
- Fournisseurs & bons de commande ; rapport WhatsApp des finances.

---

## 2026-10-13 (suite) — Logo officiel, factures, documents pro, tout modifiable

1. **Logo officiel KBS Digital Agency** (bleu marine `#011B45` + orange `#F39200`)
   intégré : en-tête, écran de connexion, icônes de l'app (PWA), documents PDF.
   Couleurs de toute l'application alignées sur le logo. Logo et couleurs
   modifiables dans Administration → Agence (+ aperçu des 3 documents).
2. **Nouveau moteur de documents** (`src/documents.js`) — reçu, devis, facture
   au même gabarit professionnel : numérotation séquentielle (DEV-/FAC-/REC-
   AAAA-0001), bloc client, tableau N°/Désignation/Qté/PU/Montant, remise,
   total, déjà réglé / reste à payer, **montant en lettres** (« Arrêtée la
   présente facture à la somme de… »), modalités de paiement, signatures,
   tampon PAYÉ/ACOMPTE, mentions légales (RCCM, NIF) et pagination.
3. **Onglet Factures** (Ventes & Finance) : création, modification,
   suppression, duplication, règlements partiels avec reçu par règlement,
   envoi WhatsApp. « Convertir en facture » depuis un devis, « Créer la
   facture » depuis la fiche d'un client du CRM.
4. **Reçus** : un reçu par versement (avec mode de paiement : Orange Money,
   Wave, espèces…) + reçu récapitulatif.
5. **Modifier / Supprimer partout** : en plus de la liste précédente — Boîte
   à outils IA, Plan 30 jours, Cible, Copywriting (hooks & scripts), Scripts
   DM, Prospection terrain (+ PDF du guide), Académie, Tarifs, versements,
   notes d'historique, checklists Kanban, diagnostics IA, et **contenu des
   archives** (ventes/dépenses/dettes d'un mois archivé, création d'un mois
   pour ressaisir septembre). Textes modifiés stockés dans `kbs:content`.

---

## 2026-10-13 — Ventes de septembre disparues, avances, codes, modifier/supprimer

Branche `ccr-5b04f8c0-vt8y8v` (pas encore fusionnée dans `main`).

1. **Cause probable de la perte de septembre (corrigée)** : au démarrage, si une
   lecture Supabase échouait (réseau faible), l'app prenait une liste vide par
   défaut… puis la **réécrivait aussitôt dans la base**, ce qui effaçait les
   vraies données (clients ET archives). Désormais :
   - si une seule lecture échoue → écran « Réessayer », **aucune écriture** ;
   - chaque archive est aussi stockée dans sa propre ligne `archive:<id>`
     (refusionnée au chargement, ne peut plus être écrasée) ;
   - **sauvegarde automatique quotidienne** `backup:AAAA-MM-JJ` + copie
     `backup:avant-bascule:…` juste avant chaque changement de mois ;
   - une appli restée ouverte pendant le changement de mois se recharge
     (évite qu'une copie périmée écrase les données des autres appareils).
2. **Outil de récupération** (Administration → Récupération) : fouille toute la
   base (listes, archives, sauvegardes, diagnostics IA) pour retrouver les
   clients d'un mois et recréer son archive.
3. **Paiement en plusieurs fois** (CRM) : « Prix total » + « Payé maintenant /
   avance », puis bouton « Ajouter un paiement » dans la fiche. Statut Avance /
   Soldé, reste à payer, total « Reste à encaisser ». Reçus WhatsApp et PDF
   affichent les versements et le reste. Au changement de mois, un client avec
   un solde dû est reporté (avec seulement le reste), ainsi que les prospects
   non payés et les dettes non payées.
4. **Code maître unique `KBSAUTO2026`** : ouvre désormais **toutes** les
   sections (y compris checklists, Formation, Réinitialisation). Bouton
   « Réinitialiser tous les codes » (Administration → Codes d'accès).
5. **Modifier / Supprimer** (avec confirmation) : CRM, Devis, Kanban, Dépenses,
   Dettes, Prospection réseaux, Liens partagés, Liens de formation, Tarifs,
   Archives (code Administration exigé), Équipe, Caisse perso.

---

## 2026-09-22 — Session commissions, archives, notifications, logo, ébauche SaaS

### ✅ Déployé en production (`app.kbsdigitalagency.com`, branche `main`)
1. **Commissions individuelles uniquement** — pas de "commission d'équipe" :
   chaque membre a son propre pourcentage (10 % par défaut) sur ses propres
   ventes du mois. Taux officiel réglable par le CEO dans
   Administration → Équipe, + pourcentage personnalisable par membre.
2. **Archives mensuelles** (onglet Archives, Ventes & Finance) :
   - Archivage **automatique** au changement de mois (clients & CA,
     trésorerie & dépenses, dettes, objectif atteint), puis remise à zéro.
   - Bouton **« Clôturer un mois »** (Administration → Réinitialisation)
     pour archiver manuellement un mois choisi.
   - La réinitialisation totale archive désormais avant d'effacer.
3. **Police** : Baloo 2 (titres/chiffres) + Nunito (texte), style arrondi.
4. **Navigation** : sous-onglets en pastilles, tous visibles (plus de
   défilement horizontal).
5. **Logo** : nouveau monogramme « K » (dégradé terracotta), régénéré pour
   toutes les icônes (192/512/maskable/apple-touch/favicon) + en-tête + PDF.
6. **Notifications** :
   - Push à l'équipe pour : nouveau client, nouvelle dépense, nouvelle dette,
     nouveau devis.
   - Vibration + `renotify` sur le service worker.
   - Carillon sonore interne (WebAudio, 2 notes) quand l'app est ouverte.
   - Pastilles rouges de non-lus par onglet/catégorie (localStorage) +
     badge système sur l'icône de l'app installée (`navigator.setAppBadge`).
7. **Hébergement** : migration Netlify → Cloudflare Pages
   (`public/_redirects`, `.nvmrc` Node 20, `netlify.toml` supprimé).

### 🟡 Décidé, mais PAS déployé (en pause — priorité repassée sur KBS Gestion)
8. **Vendre KBSAUTO en SaaS** (abonnements 1 mois / 6 mois / 1 an, paiement
   Wave + Orange Money + carte, essai gratuit 7 jours).
   - Une **ébauche Phase 1** (comptes entreprises par email/mot de passe +
     isolation des données par préfixe `org:<uid>:` + écran d'essai/abonnement)
     existe sur la **PR #7** (branche `claude/kbsauto-update-reorganize-qp7iki`),
     **jamais fusionnée, jamais déployée**.
   - ⚠️ **Ne pas fusionner PR #7 en l'état** : l'isolation des données est
     **côté application uniquement** — aucune règle RLS en base ne l'empêche
     techniquement. C'est le point bloquant avant toute vente réelle.
   - Reste à faire avant de vendre pour de vrai : RLS liée à `auth.uid()` sur
     `kbs_storage` ; adapter les fonctions Edge (`generate-client-diagnostic`,
     `send-notification`) au multi-compte ; paiement en ligne (Phase 3, via
     PayDunya ou CinetPay — compte marchand à ouvrir par Kader).
9. **Prix des 3 formules d'abonnement** : encore **provisoires** dans le code
   (`DEFAULT_ABONNEMENTS` : 35 000 / 180 000 / 300 000 FCFA) — jamais
   confirmés par Kader. À corriger avant toute utilisation réelle.
10. **Assistant IA conversationnel** (bulle flottante, accessible partout) —
    pas commencé. Faisable : l'app utilise déjà l'API Anthropic (Claude
    Sonnet) via une fonction Edge Supabase (`generate-client-diagnostic`),
    réutilisable pour un nouvel assistant.
11. **Vente de produits** (catalogue/boutique) — mis en attente à la demande
    de Kader, rien de fait.

### Repères techniques
- Production : branche `main`, dépôt `niangkader62-hue/kbsauto-io`.
- PR de test (ne pas fusionner) : #7 — ébauche SaaS Phase 1.
- Base de données partagée : Supabase (`kbs_storage`, clé/valeur), même
  projet pour la prod et le test SaaS (isolation actuelle = uniquement les
  clés préfixées `org:*`, pas de RLS).

## 2026-10-13 — Icône de l'application (monogramme KG)

- Choix du gérant : proposition C, monogramme « KG » (K blanc, G orange, flèche de croissance) sur carré bleu nuit.
- `AppIcon` et `AppWordmark` dans `src/App.jsx` : écran de chargement, connexion, menu latéral et en-tête mobile.
- Icônes PNG régénérées dans `public/` (icon-192, icon-512, maskable, apple-touch-icon, favicon-32).
- Le logo complet KBS Digital Agency (`BRAND_LOGO`) reste sur les reçus, devis, factures et le ticket de caisse.
- Pour voir la nouvelle icône sur un téléphone : supprimer le raccourci et réinstaller l'app depuis le navigateur.

## 2026-10-13 — Sauvegardes, historique, clôture et mise à jour

- **Sauvegardes & historique** (Administration) : la liste de toutes les sauvegardes `backup:*` (automatique du jour, manuelle, avant clôture, avant changement de mois, avant restauration). Chaque ligne a deux boutons, Télécharger (fichier JSON) et Restaurer. Avant chaque restauration, les données actuelles sont sauvegardées. Le mois en cours (`kbs:period`) n'est jamais restauré.
- **Sauvegarde quotidienne** : faite à la première ouverture du jour, puis vérifiée toutes les 15 min et au retour sur l'app, pour couvrir une app restée ouverte d'un jour à l'autre.
- **Clôture** : l'écran s'appelle maintenant « Clôture & remise à zéro ». Une sauvegarde `backup:avant-cloture:…` est faite avant chaque clôture manuelle.
- **Mise à jour** : `useAppUpdate` relit `index.html` sans cache et compare le fichier `/assets/index-*.js` annoncé avec celui chargé. La vérification se fait au chargement, toutes les 5 min et au retour sur l'app. S'il y a une nouvelle version, un bandeau orange « Mettre à jour maintenant » apparaît, même sur l'écran de connexion. Il y a aussi une carte « Mise à jour de l'application » dans le Menu et un bouton dans le menu latéral. `__BUILD_TIME__` (vite.config.js) affiche la date de la version.

## 2026-10-13 — Calendrier

- **Calendrier** (Ventes & finances, menu latéral, bouton de l'accueil) :
  - on choisit une date (sélecteur ou grille du mois) ;
  - pour ce jour, l'écran montre les encaissements, les ventes en caisse, les nouveaux clients, les factures et les dépenses, avec le total encaissé, les dépenses et le solde du jour ;
  - la grille montre le montant encaissé de chaque jour et des points (vente / dépense) ;
  - les données viennent du mois en cours et de toutes les archives (`buildDayEvents`, avec dédoublonnage).
- **Suppression d'une archive** : une sauvegarde complète `backup:avant-suppression:…` est faite d'abord. Si elle échoue, la suppression est annulée.

## 2026-10-13 — Packs dans la vente, liens produits, icônes

- **Catalogue de vente** (`saleCatalog`) : produits du stock + packs, formations (variantes en ligne / présentiel) et prestations de « Tarifs » (`tarifProducts`, sans stock).
  - Un produit du stock qui porte le même nom qu'une offre de Tarifs la remplace : c'est la façon de lui ajouter une photo et une description.
- **Liens à partager** : Stock → onglet « Liens ».
  - Un lien `/boutique` pour tout le catalogue, et un lien `/p/<id>` par produit, service ou pack.
  - Trois boutons sur chaque lien : Copier, WhatsApp, Ouvrir.
  - Les produits ont un nouveau champ « Description », affiché sur leur page.
- **Pages publiques** (`PublicShop`, choisi par `Root` selon l'adresse) :
  - consultation sans code, en lecture seule ;
  - bouton « Commander sur WhatsApp » vers le numéro de l'agence.
  - Limite : l'aperçu WhatsApp du lien montre le titre général de l'app, pas la photo du produit, car il n'y a pas de rendu côté serveur.
- **Icônes** : copiées sous de nouveaux noms dans `public/icons/kg-*.png` (manifest, index.html, sw.js). Ainsi les téléphones ne gardent plus l'ancienne icône en cache.

## 2026-10-13 — Annuler / modifier une vente

- **Vendre → « Ventes faites »** (aussi accessible depuis l'écran du reçu) : la liste des ventes du mois. Chaque vente a trois boutons : Reçu, Modifier, Annuler la vente. Le code du CEO est demandé pour modifier ou annuler.
- `changeSale` garde tout synchronisé :
  - le total du client (`prixTotal`) ;
  - le paiement de la vente (`salePayment` : id + 1 ou même n° de reçu) ;
  - le statut du client ;
  - le stock, avec un mouvement « correction » ou « annulation » ;
  - l'historique du client.
- Un client créé par la seule vente annulée (comptoir ou nouveau, `source: "vente"`) est retiré.
- Si le client a payé plus que le nouveau total, un message rappelle de le rembourser.
- Les ventes des mois archivés ne sont pas modifiables ici (les archives se corrigent dans Archives).

## 2026-10-13 — Ordinateur, tablette, iPhone ; écran Récupération

- **Ordinateur** :
  - suppression de l'ancien `index.css`, qui forçait une largeur maximale de 880 px et le fond gris #141316 ;
  - contenu jusqu'à 1240 px de large ;
  - connexion en deux colonnes (présentation + carte de connexion) ;
  - accueil en deux colonnes, avec « Derniers encaissements » ;
  - calendrier en deux colonnes (grille + détail du jour).
- **Tablette (700 px et plus)** : plus de marges, barre du bas conservée sous 900 px.
- **iPhone** :
  - `viewport-fit=cover` et balises Apple (application plein écran, barre d'état) ;
  - marges de sécurité (`env(safe-area-inset-*)`) pour l'en-tête, le menu latéral, la barre du bas et le bandeau de mise à jour ;
  - champs en 16 px sur iOS, pour éviter le zoom automatique.
- **Récupération** :
  - quand rien n'est trouvé, l'écran explique clairement ce que cela veut dire et quoi faire ;
  - la liste brute des lignes de la base est repliée dans « Détails techniques ».
