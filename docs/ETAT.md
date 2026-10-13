# ETAT.md — Avancement du projet KBSAUTO

But de ce fichier : garder une trace claire de ce qui est décidé/fait, pour
reprendre le travail sans repartir de zéro (même dans une nouvelle session).
Les entrées les plus récentes sont en haut.

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
