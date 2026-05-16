# QuickCafe — Prompt Claude Code (Projet existant à adapter)

## CONTEXTE DU PROJET EXISTANT

Tu travailles sur un projet existant qui contient déjà :

**Backend (Node.js/Express) :**
- Authentification complète : inscription, connexion, vérification email, reset password
- JWT stockés en cookies httpOnly
- Base de données : MongoDB + Mongoose (à MIGRER vers MySQL + Sequelize)
- APIs utilisateurs et tests (à REMPLACER par les APIs QuickCafe)

**Frontend (React + Vite + Tailwind CSS) :**
- Pages : Login, Register, Forgot/Reset Password, Email Verification
- Dashboard utilisateur + Dashboard admin (à ADAPTER pour cashier/admin QuickCafe)

---

## MISSION

Transformer ce projet en **QuickCafe** : plateforme SaaS de commande par QR Code pour cafés et restaurants.

### Règle principale du flow client :
> **Le client NE fait PAS de login.** Il scanne le QR Code → le menu s'ouvre → il commande. Aucune authentification côté client. Seuls les employés (admin, cashier, waiter) se connectent.

---

## ÉTAPE 1 — MIGRATION BASE DE DONNÉES : MongoDB → MySQL + Sequelize

### 1.1 — Installation
```bash
cd backend
npm uninstall mongoose
npm install sequelize mysql2
```

### 1.2 — Configuration Sequelize
Créer `/backend/src/config/database.js` :
```js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

export default sequelize;
```

### 1.3 — Modèles Sequelize à créer dans `/backend/src/models/`

**User.js** — Garder la logique existante, adapter pour Sequelize :
```
id (UUID, PK)
name (STRING)
email (STRING, unique)
password (STRING, bcrypt)
role (ENUM: 'admin', 'cashier', 'waiter')
isVerified (BOOLEAN, default false)
verificationToken (STRING, nullable)
resetPasswordToken (STRING, nullable)
resetPasswordExpires (DATE, nullable)
```

**Table.js** :
```
id (UUID, PK)
tableNumber (INTEGER, unique)
qrCode (STRING) — format: "table_[tableNumber]_[timestamp]"
isActive (BOOLEAN, default true)
```

**Category.js** :
```
id (UUID, PK)
name (STRING)
displayOrder (INTEGER, default 0)
```

**Product.js** :
```
id (UUID, PK)
name (STRING)
description (TEXT)
price (DECIMAL 10,2)
image (STRING, URL)
available (BOOLEAN, default true)
categoryId (FK → Category)
```

**Order.js** :
```
id (UUID, PK)
tableId (FK → Table)
status (ENUM: 'pending','preparing','ready','delivered','cancelled', default 'pending')
total (DECIMAL 10,2)
customerNote (TEXT, nullable)
createdAt (DATE)
```

**OrderItem.js** :
```
id (UUID, PK)
orderId (FK → Order)
productId (FK → Product)
quantity (INTEGER)
unitPrice (DECIMAL 10,2)
```

### 1.4 — Associations dans `/backend/src/models/index.js` :
```js
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Table.hasMany(Order, { foreignKey: 'tableId' });
Order.belongsTo(Table, { foreignKey: 'tableId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });
```

### 1.5 — Seed data dans `/backend/src/db/seed.js` :

**Users (3) :**
- admin@quickcafe.com / Admin123! / role: admin / isVerified: true
- cashier@quickcafe.com / Cash123! / role: cashier / isVerified: true
- waiter@quickcafe.com / Wait123! / role: waiter / isVerified: true

**Tables (8) :** tableNumber 1 à 8, qrCode auto-généré

**Categories (4) :** Coffee, Drinks, Desserts, Snacks

**Products (16) — exemples réalistes :**
- Espresso (Coffee) — 1.80€
- Cappuccino (Coffee) — 2.50€
- Latte (Coffee) — 2.80€
- Americano (Coffee) — 2.20€
- Orange Juice (Drinks) — 3.00€
- Mint Lemonade (Drinks) — 3.50€
- Sparkling Water (Drinks) — 1.50€
- Iced Tea (Drinks) — 2.80€
- Chocolate Fondant (Desserts) — 4.50€
- Cheesecake (Desserts) — 4.00€
- Tiramisu (Desserts) — 4.20€
- Crème Brûlée (Desserts) — 3.80€
- Club Sandwich (Snacks) — 5.50€
- Caesar Salad (Snacks) — 5.00€
- Croissant (Snacks) — 2.00€
- Granola Bowl (Snacks) — 4.50€

**Orders (10) :** répartis sur différentes tables et statuts (pending, preparing, ready, delivered)

Ajouter script dans `package.json` : `"seed": "node src/db/seed.js"`

---

## ÉTAPE 2 — ADAPTATION AUTH BACKEND

### Garder (adapter seulement) :
- `POST /api/auth/login` — retourner JWT en cookie httpOnly ✓
- `GET /api/auth/me` — retourner user authentifié ✓
- `POST /api/auth/logout` ✓
- Middleware `authMiddleware.js` — vérifier JWT depuis cookie ✓
- Middleware `roleMiddleware.js` — vérifier role (admin/cashier/waiter) ✓

### Supprimer (pas besoin pour QuickCafe) :
- `POST /api/auth/register` — les employés sont créés par l'admin uniquement
- Routes de vérification email publique (garder la logique mais sans route publique)
- Routes reset password (garder pour l'admin uniquement)

### Adapter `.env` :
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=quickcafe
DB_USER=root
DB_PASS=secret
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
COOKIE_SECURE=false
```

---

## ÉTAPE 3 — NOUVELLES ROUTES BACKEND

Structure : `/backend/src/routes/` + `/backend/src/controllers/`

### Tables — `/api/tables`
```
GET    /              → liste toutes les tables [auth: cashier+]
POST   /              → créer table, auto-générer qrCode [auth: admin]
PUT    /:id           → modifier table [auth: admin]
DELETE /:id           → supprimer table [auth: admin]
GET    /public/:tableNumber → données publiques de la table (PAS d'auth) — utilisé par le client
```

### Categories — `/api/categories`
```
GET    /              → liste (PUBLIC, pas d'auth)
POST   /              → créer [auth: admin]
PUT    /:id           → modifier [auth: admin]
DELETE /:id           → supprimer [auth: admin]
```

### Products — `/api/products`
```
GET    /              → liste avec filtre ?categoryId= (PUBLIC)
POST   /              → créer [auth: admin]
PUT    /:id           → modifier [auth: admin]
DELETE /:id           → supprimer [auth: admin]
PATCH  /:id/availability → toggle available [auth: admin/cashier]
```

### Orders — `/api/orders`
```
POST   /              → créer commande + items (PUBLIC — client sans auth)
                        Body: { tableId, items: [{productId, quantity}], customerNote? }
                        Calcule total automatiquement depuis les prix en DB
                        Émet socket event "new_order" après création
GET    /              → liste toutes commandes [auth: cashier+]
GET    /:id           → détail commande avec items [auth: cashier+]
PATCH  /:id/status    → changer statut [auth: cashier+]
                        Émet socket event "order_updated" avec { orderId, status, tableId }
GET    /public/:orderId → statut commande (PUBLIC — pour le tracking client)
GET    /table/:tableId  → commandes d'une table [auth: cashier+]
```

### Analytics — `/api/analytics`
```
GET    /summary       → [auth: admin/cashier]
  Retourner:
  - ordersToday: count des orders créés aujourd'hui
  - revenueToday: sum des totals des orders delivered aujourd'hui
  - activeTables: count tables avec orders pending/preparing/ready
  - topProducts: top 5 products par quantité commandée (jointure OrderItems + Products)
  - ordersByStatus: count groupé par status
```

### Socket.IO — `/backend/src/socket/index.js`
```js
// Events émis par le serveur :
"new_order"      → { order, table, items } — broadcast à tous les clients dashboard
"order_updated"  → { orderId, status, tableNumber } — broadcast à tous

// Events reçus du client :
"join_table"     → client rejoint room "table_[tableId]" pour recevoir updates de sa commande
"join_dashboard" → cashier/admin rejoint room "dashboard"
```

---

## ÉTAPE 4 — FRONTEND : SUPPRIMER ET REMPLACER

### Supprimer ces pages (ne plus les utiliser) :
- Register.jsx — les employés sont créés via l'admin panel
- EmailVerification.jsx — flow non nécessaire pour le client QR
- Conserver : Login.jsx, ForgotPassword.jsx, ResetPassword.jsx (pour les employés)

### Nouvelle structure `/frontend/src/` :

```
api/
  axios.js          — instance axios avec baseURL + withCredentials: true
  auth.js           — login(), logout(), getMe()
  products.js       — getProducts(categoryId?), createProduct(), etc.
  categories.js     — getCategories(), etc.
  orders.js         — createOrder(), getOrders(), updateStatus(), getOrderStatus()
  tables.js         — getTables(), createTable(), etc.
  analytics.js      — getSummary()

contexts/
  AuthContext.jsx   — user, login(), logout(), isAuthenticated, role
  CartContext.jsx   — items, addItem(), removeItem(), updateQty(), total, clear()
  SocketContext.jsx — socket instance, connectSocket(), disconnectSocket()

hooks/
  useAuth.js
  useCart.js
  useSocket.js
  useOrders.js      — pour le dashboard temps réel

components/
  ui/
    StatusBadge.jsx   — badge coloré par statut commande
    ProductCard.jsx   — carte produit avec bouton ajouter
    OrderCard.jsx     — carte commande pour dashboard
    Skeleton.jsx      — loading placeholder
    Modal.jsx         — modal réutilisable
    Toast.jsx         — notifications (utiliser react-hot-toast)
  layout/
    CustomerLayout.jsx  — layout simple sans nav pour le client
    AdminLayout.jsx     — layout avec sidebar pour admin/cashier

pages/
  Landing.jsx           — page d'accueil marketing du SaaS
  auth/
    Login.jsx           — ADAPTER l'existant (garder le style)
    ForgotPassword.jsx  — garder l'existant
    ResetPassword.jsx   — garder l'existant
  customer/
    Menu.jsx            — menu public, accessible via /table/:tableNumber
    OrderStatus.jsx     — tracking commande via /table/:tableNumber/status/:orderId
  admin/
    Dashboard.jsx       — flux commandes temps réel
    Orders.jsx          — liste et gestion commandes
    Products.jsx        — CRUD produits
    Tables.jsx          — gestion tables + QR codes
    Analytics.jsx       — métriques et graphiques
    Users.jsx           — gestion employés (admin seulement)

layouts/
  CustomerLayout.jsx
  AdminLayout.jsx

i18n/
  en.json
  fr.json
  ar.json
  useTranslation.js

utils/
  formatPrice.js      — ex: formatPrice(2.5) → "2,50 €"
  formatDate.js
  statusConfig.js     — { pending: { label, color, icon }, ... }
```

### Routes React Router (`App.jsx`) :

```jsx
// Routes PUBLIC (client sans auth)
/                           → Landing
/table/:tableNumber         → Menu (scan QR → menu s'ouvre directement)
/table/:tableNumber/status/:orderId → OrderStatus (tracking)

// Routes AUTH employés
/admin/login                → Login
/admin/forgot-password      → ForgotPassword
/admin/reset-password/:token → ResetPassword

// Routes PROTÉGÉES (JWT requis)
/admin                      → redirect → /admin/dashboard
/admin/dashboard            → Dashboard [cashier, admin, waiter]
/admin/orders               → Orders [cashier, admin]
/admin/products             → Products [admin]
/admin/tables               → Tables [admin]
/admin/analytics            → Analytics [admin, cashier]
/admin/users                → Users [admin seulement]
```

Créer `ProtectedRoute.jsx` : vérifie isAuthenticated + role autorisé, sinon redirect `/admin/login`.

---

## ÉTAPE 5 — PAGES CUSTOMER (FLOW SANS LOGIN)

### `Menu.jsx` — Route : `/table/:tableNumber`

**Comportement :**
1. Au chargement : appeler `GET /api/tables/public/:tableNumber` pour récupérer tableId
2. Si table n'existe pas → afficher erreur "Table introuvable"
3. Appeler `GET /api/categories` + `GET /api/products`
4. Afficher :
   - Header : logo QuickCafe + "Table N°X"
   - Onglets catégories (Coffee / Drinks / Desserts / Snacks)
   - Grille de ProductCard (image, nom, description, prix, bouton "+")
   - Bouton flottant panier en bas : "🛒 Mon panier (N articles) — X,XX €"
5. Drawer panier (slide depuis le bas) :
   - Liste items avec qty (+/-) et bouton supprimer
   - Champ optionnel "Note pour la cuisine"
   - Bouton "Commander" → POST `/api/orders` avec { tableId, items, customerNote }
   - Après succès → redirect `/table/:tableNumber/status/:orderId`

**Design :**
- Fond crème `#FDFBF7`, cartes blanches avec ombre légère
- Bouton "+" en `#6B4F2A` (espresso brown)
- Bouton panier flottant en `#D4A853` (caramel)
- Animations : fade-in des cartes, slide-up du drawer
- Loading skeleton pendant le fetch
- Pas de login, pas de header de navigation

### `OrderStatus.jsx` — Route : `/table/:tableNumber/status/:orderId`

**Comportement :**
1. Fetch `GET /api/orders/public/:orderId` pour statut initial
2. Rejoindre room Socket.IO `table_[tableId]` via `join_table`
3. Écouter event `order_updated` → mettre à jour statut en temps réel
4. Afficher stepper animé :
   ```
   ✓ Commande reçue → ⏳ En préparation → ✓ Prête → 🚀 Livrée
   ```
5. Afficher résumé commande (items, total)
6. Bouton "Nouvelle commande" → retour `/table/:tableNumber`

---

## ÉTAPE 6 — PAGES ADMIN/CASHIER

### `Dashboard.jsx`

- Au chargement : fetch toutes commandes avec status pending/preparing/ready
- Rejoindre room Socket.IO `dashboard` via `join_dashboard`
- Écouter `new_order` :
  - **Jouer un son** : générer un beep via Web Audio API (pas de fichier externe) :
    ```js
    const playBeep = () => {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.start();
      setTimeout(() => osc.stop(), 200);
    };
    ```
  - Ajouter la commande en tête de liste avec animation pulse (ring jaune)
- Écouter `order_updated` → mettre à jour statut de la commande dans la liste

**Layout du dashboard :**
- Colonnes Kanban OU liste filtrée par statut (au choix, préférer liste filtrée)
- Chaque OrderCard affiche : N° table, heure, items, total, boutons changer statut
- Filtre rapide par statut en haut
- Compteur de commandes en attente dans le titre

### `Orders.jsx`

- Tableau complet de toutes les commandes
- Colonnes : ID, Table, Heure, Items, Total, Statut, Actions
- Filtre par statut (dropdown)
- Filtre par date
- Dropdown inline pour changer le statut
- Pagination (20 par page)

### `Products.jsx`

- Grille de cartes produits
- Bouton "Ajouter produit" → ouvre Modal avec formulaire :
  - Nom, Description, Prix, URL image, Catégorie (select), Disponible (toggle)
- Bouton edit sur chaque carte → même Modal en mode édition
- Bouton toggle disponibilité directement sur la carte
- Bouton supprimer avec confirmation

### `Tables.jsx`

- Liste des tables avec leur numéro et statut (libre/occupée)
- Bouton "Ajouter table" → créer avec tableNumber auto-incrémenté
- Pour chaque table : afficher QR code (utiliser `qrcode.react`)
  - Le QR code encode l'URL : `${VITE_APP_URL}/table/${tableNumber}`
  - Bouton "Télécharger QR" → canvas.toDataURL() → lien download PNG
- Bouton supprimer table

### `Analytics.jsx`

- 4 metric cards en haut :
  - Commandes aujourd'hui
  - Revenu aujourd'hui (€)
  - Tables actives
  - Produit le plus commandé
- Graphique barres (recharts) : top 5 produits par volume
- Graphique camembert (recharts) : répartition des commandes par statut

### `Users.jsx` (admin seulement)

- Liste des employés (name, email, role, isVerified)
- Bouton "Ajouter employé" → formulaire : name, email, password, role
- Bouton désactiver/activer compte
- Bouton supprimer

---

## ÉTAPE 7 — DESIGN SYSTEM

### Palette couleurs (adapter TailwindCSS config) :

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      espresso: '#6B4F2A',
      caramel: '#D4A853',
      cream: '#FDFBF7',
      surface: '#F5EFE6',
      darkbrown: '#1C1009',
    }
  }
}
```

### Composant `StatusBadge.jsx` :
```
pending    → bg jaune pâle, texte jaune foncé, "En attente"
preparing  → bg bleu pâle, texte bleu, "En préparation"
ready      → bg vert pâle, texte vert, "Prête ✓"
delivered  → bg gris pâle, texte gris, "Livrée"
cancelled  → bg rouge pâle, texte rouge, "Annulée"
```

### Règles globales :
- Mobile-first : menu client optimisé pour téléphone (min 375px)
- Dashboard optimisé pour tablette paysage (768px+)
- Sidebar admin : fixe sur desktop, drawer sur mobile
- Toutes les actions asynchrones : bouton disabled + spinner pendant le chargement
- Tous les fetches : skeleton loading pendant le chargement
- Toutes les listes vides : message friendly + icône
- Toutes les erreurs API : toast rouge via react-hot-toast
- Toutes les succès : toast vert
- Transitions de page : fade-in 200ms

---

## ÉTAPE 8 — INTERNATIONALISATION

Créer `useTranslation.js` :
```js
// Lit la langue depuis localStorage ('lang' key)
// Retourne fonction t(key) qui cherche dans le json correspondant
// Fallback sur 'en' si clé manquante
```

Ajouter dans le header admin : sélecteur EN / FR / AR
Quand AR sélectionné : ajouter `dir="rtl"` sur `<html>`

Clés à traduire dans `en.json`, `fr.json`, `ar.json` :
- Navigation links
- Statuts commandes
- Labels formulaires
- Boutons (Commander, Ajouter, Modifier, Supprimer, Confirmer)
- Messages d'erreur courants
- Titres de pages

---

## ÉTAPE 9 — SÉCURITÉ ET QUALITÉ

### Backend :
- Toutes les routes admin vérifiées par `authMiddleware` + `roleMiddleware`
- Routes publiques (`/api/tables/public/:n`, `GET /api/products`, `GET /api/categories`, `POST /api/orders`, `GET /api/orders/public/:id`) : PAS de middleware auth
- Rate limiting : 100 req/15min global, 10 req/15min sur `POST /api/orders` (anti-spam commandes)
- Validation entrées sur `POST /api/orders` : vérifier que tableId existe, que chaque productId existe et est available, que quantity > 0
- Helmet activé
- CORS : origin depuis `CLIENT_ORIGIN` env var

### Frontend :
- Aucun token JWT côté client (cookies httpOnly, axios withCredentials: true)
- `ProtectedRoute` vérifie via `GET /api/auth/me` au chargement
- Variables d'environnement : `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_APP_URL`
- Pas de `console.log` en production

---

## ÉTAPE 10 — FICHIERS DE CONFIGURATION

### `/backend/.env.example` :
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=quickcafe
DB_USER=root
DB_PASS=secret
JWT_SECRET=changeme_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

### `/frontend/.env.example` :
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173
```

### `docker-compose.yml` :
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: quickcafe
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mysql
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### `README.md` — Générer avec :
- Description du projet
- Flow client : "Scanner QR → Menu → Commander → Suivre sa commande (aucun login)"
- Flow employé : "Login → Dashboard → Gérer commandes"
- Prérequis : Node 18+, MySQL 8+, Docker (optionnel)
- Installation pas à pas
- Identifiants par défaut : admin@quickcafe.com / Admin123!
- Arborescence complète du projet
- Tableau des routes API

---

## ORDRE D'EXÉCUTION

Travaille dans cet ordre exact, confirme chaque étape avant de passer à la suivante :

1. Migration MongoDB → MySQL : installer dépendances, créer config Sequelize, créer tous les modèles
2. Seed database : créer seed.js, tester avec `npm run seed`
3. Adapter auth backend : garder JWT cookies, supprimer register public, adapter les controllers pour Sequelize
4. Créer routes backend : tables, categories, products, orders, analytics
5. Configurer Socket.IO : events new_order, order_updated, join_table, join_dashboard
6. Adapter frontend : supprimer pages inutiles, créer structure de dossiers
7. Créer pages customer : Menu.jsx + OrderStatus.jsx (flow sans login)
8. Adapter/créer pages admin : Dashboard, Orders, Products, Tables, Analytics, Users
9. Intégrer Socket.IO côté client : SocketContext, useSocket
10. Finaliser : i18n, design system, tests manuels, README

**IMPORTANT** : Ne jamais demander de login au client. Le QR code suffit. Seuls les employés ont un login.
