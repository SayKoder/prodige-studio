# Prodige Studio - Portfolio Photographe

Portfolio cinématographique avec back-office d'administration.
Déployé sur DigitalOcean via Docker + Traefik + Let's Encrypt.

## Stack technique

| Couche         | Tech                        |
|----------------|-----------------------------|
| Frontend/API   | Next.js 15 (App Router, ISR)|
| ORM            | Prisma + PostgreSQL 16      |
| Auth           | NextAuth.js v5 (credentials)|
| Storage        | Fichiers locaux `/uploads/` |
| Reverse proxy  | Traefik v3 + SSL automatique|
| CI/CD          | GitHub Actions → SSH deploy |
| Hébergement    | DigitalOcean Droplet        |

---

## Développement local

### 1. Prérequis
- Node.js 20+
- Docker Desktop

### 2. Installation
```bash
git clone https://github.com/SayKoder/prodige-studio.git
cd prodige-studio
npm install
cp .env.local.example .env.local
# → Remplir .env.local (voir le fichier)
```

### 3. Démarrer PostgreSQL local
```bash
docker compose -f docker-compose.dev.yml up -d postgres
```

### 4. Migrations & seed
```bash
npx prisma migrate dev --name init
npm run db:seed
# → Affiche email + mot de passe admin par défaut
```

### 5. Lancer Next.js
```bash
npm run dev
```

**URLs locales :**
- Portfolio : http://localhost:3000
- Admin     : http://localhost:3000/studio-access

---

## Déploiement production (VPS)

### Première installation du VPS
```bash
# Sur votre machine locale — copier le script sur le serveur
scp scripts/setup-vps.sh root@<IP_VPS>:/root/
ssh root@<IP_VPS> "bash /root/setup-vps.sh"
```
Suivre les instructions affichées par le script (clé SSH, .env, etc.)

### Déploiements suivants
Push sur `main` → GitHub Actions déploie automatiquement.

### Variables GitHub Actions à configurer
Dans **Settings → Secrets and variables → Actions** :

| Secret        | Valeur                              |
|---------------|-------------------------------------|
| `VPS_HOST`    | IP publique de votre Droplet        |
| `VPS_USER`    | `deploy`                            |
| `VPS_SSH_KEY` | Clé privée SSH (générée par setup)  |

---

## Variables d'environnement production (`.env` sur le VPS)

```env
DATABASE_URL="postgresql://prodige:MOTDEPASSE@postgres:5432/prodige"
POSTGRES_DB=prodige
POSTGRES_USER=prodige
POSTGRES_PASSWORD=MOTDEPASSE_FORT

NEXTAUTH_SECRET="SECRET_ALEATOIRE_32_CHARS"
NEXTAUTH_URL="https://prodige-studio.me"

ADMIN_EMAIL="votre@email.com"
ADMIN_PASSWORD="MotDePasseTresSecurisé!"
```

Générer `NEXTAUTH_SECRET` : `openssl rand -base64 32`

---

## Compte admin par défaut (seed)

| Champ     | Valeur                  |
|-----------|-------------------------|
| Email     | `admin@prodige-studio.me` |
| Password  | `Prodige@Studio24!`     |

**Changer ce mot de passe dès le premier login !**
Pour le modifier : mettre à jour `ADMIN_PASSWORD` dans `.env` et relancer `npm run db:seed`.

---

## Architecture des fichiers

```
prodige-studio/
├── .github/workflows/deploy.yml   ← CI/CD automatique
├── scripts/
│   ├── setup-vps.sh               ← Installation initiale VPS
│   └── entrypoint.sh              ← Migrations au démarrage Docker
├── prisma/
│   ├── schema.prisma              ← Modèles DB
│   └── seed.ts                   ← Données initiales
├── src/
│   ├── lib/
│   │   ├── db.ts                 ← Prisma (requêtes)
│   │   ├── auth.ts               ← NextAuth v5
│   │   └── storage.ts            ← Upload fs local
│   ├── app/
│   │   ├── page.tsx              ← Portfolio public
│   │   ├── studio-access/        ← Login + Dashboard admin
│   │   └── api/                  ← Routes API protégées
│   └── components/public/        ← Composants portfolio
├── Dockerfile                     ← Multi-stage build
├── docker-compose.yml             ← Production
└── docker-compose.dev.yml         ← Développement
```

## Migration future

Si vous migrez vers un autre hébergeur, seuls ces 3 fichiers changent :
- `src/lib/db.ts` → changer le client Prisma
- `src/lib/storage.ts` → pointer vers S3/Cloudinary
- `src/lib/auth.ts` → adapter le provider NextAuth
