# StockFlow

Application de gestion de stock fullstack — développée avec Next.js, TypeScript et PostgreSQL.

🔗 **Démo live** : [stock-flow-rho-smoky.vercel.app](https://stock-flow-rho-smoky.vercel.app)

```
Email        : demo@stockflow.com
Mot de passe : Demo1234!
```

---

## Aperçu

StockFlow est une application web de gestion d'inventaire complète permettant de gérer des produits, fournisseurs, mouvements de stock et utilisateurs avec un système de rôles et permissions.

---

## Fonctionnalités

- **Authentification** — JWT avec access token (15 min) + refresh token (30 jours), rotation automatique
- **Dashboard** — Vue d'ensemble avec statistiques temps réel, graphiques flux 7 jours, répartition par catégorie
- **Produits** — CRUD complet avec SKU, prix, seuil d'alerte, catégorie, fournisseur
- **Catégories** — Gestion avec couleurs et icônes personnalisées
- **Fournisseurs** — Annuaire complet avec contacts et localisation
- **Mouvements de stock** — Entrées/sorties avec workflow de validation (PENDING → VALIDATED/REJECTED)
- **Utilisateurs** — Gestion des comptes avec rôles ADMIN / MANAGER / EMPLOYEE
- **Paramètres** — Modification du profil et mot de passe en temps réel
- **Logs d'activité** — Traçabilité complète de toutes les actions

---

## Stack technique

| Couche           | Technologie             |
| ---------------- | ----------------------- |
| Framework        | Next.js 16 (App Router) |
| Langage          | TypeScript              |
| Base de données  | PostgreSQL (Neon)       |
| Authentification | JWT + bcryptjs          |
| Validation       | Zod                     |
| Style            | Tailwind CSS            |
| Graphiques       | Recharts                |
| Icônes           | Lucide React            |
| Tests            | Vitest                  |

---

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Pages publiques (login)
│   ├── (dashboard)/     # Pages protégées (dashboard, products, users...)
│   └── api/             # Routes API REST
├── lib/
│   ├── auth/            # JWT, password, require-auth
│   ├── users/           # Repository + Service + Types
│   ├── products/        # Repository + Service + Types
│   ├── categories/      # Repository + Service + Types
│   ├── suppliers/       # Repository + Service + Types
│   ├── stock_movements/ # Repository + Service + Types
│   └── activity_logs/   # Logs d'activité
├── services/            # Clients HTTP côté front
├── components/          # Composants UI réutilisables
├── providers/           # Context Auth
└── hooks/               # useAuth
```

**Pattern utilisé** : chaque entité suit la même séparation `types → repository (SQL) → service (validation/logique) → API route → service front (HTTP)`

---

## Rôles et permissions

| Action                     | EMPLOYEE | MANAGER | ADMIN |
| -------------------------- | -------- | ------- | ----- |
| Voir produits/fournisseurs | ✅       | ✅      | ✅    |
| Créer/modifier produits    | ❌       | ✅      | ✅    |
| Créer mouvements de stock  | ❌       | ✅      | ✅    |
| Valider/rejeter mouvements | ❌       | ✅      | ✅    |
| Gérer les utilisateurs     | ❌       | ❌      | ✅    |
| Accéder aux paramètres     | ✅       | ✅      | ✅    |

---

## Installation locale

### Prérequis

- Node.js 18+
- Une base de données PostgreSQL (ex : [Neon](https://neon.tech))

### 1. Cloner le repo

```bash
git clone https://github.com/kmb0000/StockFlow.git
cd StockFlow
npm install
```

### 2. Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=votre_secret_jwt_32_caracteres_minimum
```

### 3. Base de données

Exécuter les migrations dans l'ordre dans votre client PostgreSQL :

```
sql/migrations/001_create_users.sql
sql/migrations/002_create_categories.sql
sql/migrations/003_create_suppliers.sql
sql/migrations/004_create_products.sql
sql/migrations/005_create_stock_movements.sql
sql/migrations/006_create_triggers.sql
sql/migrations/007_seed_data.sql
sql/migrations/008_create_activity_logs.sql
sql/migrations/009_create_refresh_tokens.sql
```

### 4. Lancer l'application

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

---

## Tests

```bash
npm run test
```

---

## Déploiement

L'application est déployée sur **Vercel** avec la base de données **Neon**.

Variables d'environnement à configurer sur Vercel :

- `DATABASE_URL`
- `JWT_SECRET`

---

## Auteur

Développé par [kmb0000](https://github.com/kmb0000)
